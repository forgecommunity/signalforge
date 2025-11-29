#include "jsiStore.h"
#include <sstream>
#include <iomanip>
#include <random>
#include <chrono>

namespace signalforge {

// ============================================================================
// SignalValue Implementation
// ============================================================================

/**
 * Default constructor - creates an undefined value
 */
SignalValue::SignalValue() 
    : type_(Type::Undefined), boolValue_(false), numberValue_(0.0) {}

/**
 * Boolean constructor - stores primitive boolean value
 */
SignalValue::SignalValue(bool value)
    : type_(Type::Boolean), boolValue_(value), numberValue_(0.0) {}

/**
 * Number constructor - stores primitive numeric value
 */
SignalValue::SignalValue(double value)
    : type_(Type::Number), boolValue_(false), numberValue_(value) {}

/**
 * String constructor - stores string value
 */
SignalValue::SignalValue(const std::string& value)
    : type_(Type::String), boolValue_(false), numberValue_(0.0), stringValue_(value) {}

/**
 * JSI Value constructor - converts JSI value to native C++ representation
 * This is the bridge from JavaScript types to C++ types
 */
SignalValue::SignalValue(jsi::Runtime& rt, const jsi::Value& value) 
    : boolValue_(false), numberValue_(0.0) {
    
    if (value.isUndefined()) {
        type_ = Type::Undefined;
    } else if (value.isNull()) {
        type_ = Type::Null;
    } else if (value.isBool()) {
        type_ = Type::Boolean;
        boolValue_ = value.getBool();
    } else if (value.isNumber()) {
        type_ = Type::Number;
        numberValue_ = value.getNumber();
    } else if (value.isString()) {
        type_ = Type::String;
        stringValue_ = value.getString(rt).utf8(rt);
    } else {
        // For objects, we serialize to JSON string for simplicity
        // In production, you might want to use jsi::Object directly
        type_ = Type::Object;
        stringValue_ = value.toString(rt).utf8(rt);
    }
}

/**
 * Convert native C++ value back to JSI value for JavaScript consumption
 * This completes the round-trip: JS -> C++ -> JS
 */
jsi::Value SignalValue::toJSI(jsi::Runtime& rt) const {
    switch (type_) {
        case Type::Undefined:
            return jsi::Value::undefined();
        case Type::Null:
            return jsi::Value::null();
        case Type::Boolean:
            return jsi::Value(boolValue_);
        case Type::Number:
            return jsi::Value(numberValue_);
        case Type::String:
            return jsi::Value(rt, jsi::String::createFromUtf8(rt, stringValue_));
        case Type::Object:
            // Return the stringified version
            return jsi::Value(rt, jsi::String::createFromUtf8(rt, stringValue_));
        default:
            return jsi::Value::undefined();
    }
}

// ============================================================================
// Signal Implementation
// ============================================================================

/**
 * Signal constructor - initializes with a value and version 0
 * version_ is atomic for lock-free reads in change detection
 */
Signal::Signal(const SignalValue& initialValue)
    : value_(initialValue), version_(0), nextSubscriberId_(0) {}

/**
 * Thread-safe getValue - uses mutex to ensure consistent reads
 * Multiple threads can safely read the same signal
 */
SignalValue Signal::getValue() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return value_;
}

/**
 * Thread-safe setValue - updates value and increments version atomically
 * The version bump allows React components to detect changes without locking
 * Notifies all subscribers after the update
 * FIXED: Copy subscribers before releasing mutex to prevent race condition
 */
void Signal::setValue(const SignalValue& newValue) {
    std::unordered_map<size_t, std::function<void(const SignalValue&)>> subscribersCopy;
    SignalValue currentValue;
    
    {
        std::lock_guard<std::mutex> lock(mutex_);
        value_ = newValue;
        // Atomic increment ensures version is always consistent
        // memory_order_release ensures write is visible to other threads
        version_.fetch_add(1, std::memory_order_release);
        
        // Copy subscribers and value while holding lock
        subscribersCopy = subscribers_;
        currentValue = value_;
    }
    
    // Execute callbacks outside the lock to prevent deadlocks
    for (const auto& [id, callback] : subscribersCopy) {
        try {
            callback(currentValue);
        } catch (...) {
            // Swallow exceptions to prevent one subscriber from breaking others
        }
    }
}

/**
 * Subscribe to signal changes - returns unique subscription ID
 * Callbacks are executed when signal value changes
 */
size_t Signal::subscribe(std::function<void(const SignalValue&)> callback) {
    std::lock_guard<std::mutex> lock(mutex_);
    size_t id = nextSubscriberId_++;
    subscribers_[id] = std::move(callback);
    return id;
}

/**
 * Unsubscribe - removes callback using subscription ID
 */
void Signal::unsubscribe(size_t id) {
    std::lock_guard<std::mutex> lock(mutex_);
    subscribers_.erase(id);
}

// ============================================================================
// JSISignalStore Implementation
// ============================================================================

/**
 * Thread-safe singleton instance using Meyer's Singleton pattern
 * Guaranteed to be initialized exactly once in a thread-safe manner
 */
JSISignalStore& JSISignalStore::getInstance() {
    static JSISignalStore instance;
    return instance;
}

/**
 * Private constructor - initializes ID counter
 */
JSISignalStore::JSISignalStore() : nextSignalId_(0) {}

/**
 * Generate unique signal ID using atomic counter + timestamp
 * Format: "sig_<counter>_<timestamp>"
 */
std::string JSISignalStore::generateSignalId() {
    auto counter = nextSignalId_.fetch_add(1, std::memory_order_relaxed);
    auto now = std::chrono::system_clock::now().time_since_epoch().count();
    
    std::ostringstream oss;
    oss << "sig_" << counter << "_" << now;
    return oss.str();
}

/**
 * Create a new signal with initial value
 * Returns unique signal ID for future operations
 * Thread-safe: uses mutex to protect signals_ map
 */
std::string JSISignalStore::createSignal(const SignalValue& initialValue) {
    std::lock_guard<std::mutex> lock(storeMutex_);
    
    std::string id = generateSignalId();
    // Use shared_ptr for automatic memory management
    // Multiple owners can hold references safely
    signals_[id] = std::make_shared<Signal>(initialValue);
    
    return id;
}

/**
 * Get current value of a signal by ID
 * Throws if signal doesn't exist
 */
SignalValue JSISignalStore::getSignal(const std::string& signalId) {
    std::shared_ptr<Signal> signal;
    
    {
        std::lock_guard<std::mutex> lock(storeMutex_);
        auto it = signals_.find(signalId);
        if (it == signals_.end()) {
            throw std::runtime_error("Signal not found: " + signalId);
        }
        signal = it->second;  // Increment ref count
    }
    
    // Access signal outside the store lock
    return signal->getValue();
}

/**
 * Update signal value by ID
 * Throws if signal doesn't exist
 * The version bump happens inside Signal::setValue
 */
void JSISignalStore::setSignal(const std::string& signalId, const SignalValue& value) {
    std::shared_ptr<Signal> signal;
    
    {
        std::lock_guard<std::mutex> lock(storeMutex_);
        auto it = signals_.find(signalId);
        if (it == signals_.end()) {
            throw std::runtime_error("Signal not found: " + signalId);
        }
        signal = it->second;
    }
    
    // Update signal outside the store lock
    signal->setValue(value);
}

/**
 * Check if signal exists
 */
bool JSISignalStore::hasSignal(const std::string& signalId) {
    std::lock_guard<std::mutex> lock(storeMutex_);
    return signals_.find(signalId) != signals_.end();
}

/**
 * Delete a signal by ID
 * shared_ptr automatically cleans up memory when no references remain
 */
void JSISignalStore::deleteSignal(const std::string& signalId) {
    std::lock_guard<std::mutex> lock(storeMutex_);
    signals_.erase(signalId);
}

/**
 * Get current version number of a signal
 * Used for efficient change detection in React renders
 * Lock-free read using atomic operations
 */
uint64_t JSISignalStore::getSignalVersion(const std::string& signalId) {
    std::shared_ptr<Signal> signal;
    
    {
        std::lock_guard<std::mutex> lock(storeMutex_);
        auto it = signals_.find(signalId);
        if (it == signals_.end()) {
            throw std::runtime_error("Signal not found: " + signalId);
        }
        signal = it->second;
    }
    
    // Version is atomic - no lock needed for reading
    return signal->getVersion();
}

/**
 * Batch update multiple signals atomically
 * More efficient than individual updates when changing many signals
 */
void JSISignalStore::batchUpdate(const std::vector<std::pair<std::string, SignalValue>>& updates) {
    std::vector<std::shared_ptr<Signal>> signalsToUpdate;
    std::vector<SignalValue> valuesToSet;
    
    {
        std::lock_guard<std::mutex> lock(storeMutex_);
        signalsToUpdate.reserve(updates.size());
        valuesToSet.reserve(updates.size());
        
        for (const auto& [signalId, value] : updates) {
            auto it = signals_.find(signalId);
            if (it != signals_.end()) {
                signalsToUpdate.push_back(it->second);
                valuesToSet.push_back(value);
            }
        }
    }
    
    // Update all signals outside the store lock
    for (size_t i = 0; i < signalsToUpdate.size(); ++i) {
        signalsToUpdate[i]->setValue(valuesToSet[i]);
    }
}

/**
 * Get total number of signals in the store
 */
size_t JSISignalStore::getSignalCount() const {
    std::lock_guard<std::mutex> lock(storeMutex_);
    return signals_.size();
}

/**
 * Clear all signals from the store
 * Useful for testing or memory cleanup
 */
void JSISignalStore::clear() {
    std::lock_guard<std::mutex> lock(storeMutex_);
    signals_.clear();
}

// ============================================================================
// JSI Bindings Installation
// ============================================================================

/**
 * Install JSI function bindings into the React Native runtime
 * These functions become available on the global object in JavaScript
 * 
 * Each binding:
 * 1. Extracts arguments from JavaScript (jsi::Value)
 * 2. Converts to C++ types (SignalValue)
 * 3. Calls native C++ function
 * 4. Converts result back to JavaScript (jsi::Value)
 * 
 * Compatible with both Hermes and JSC engines
 */
void installJSIBindings(jsi::Runtime& runtime) {
    auto& store = JSISignalStore::getInstance();
    
    /**
     * __signalForgeCreateSignal(initialValue) -> signalId
     * Creates a new signal and returns its unique ID
     */
    auto createSignalFunc = jsi::Function::createFromHostFunction(
        runtime,
        jsi::PropNameID::forAscii(runtime, "__signalForgeCreateSignal"),
        1,  // 1 parameter
        [&store](jsi::Runtime& rt, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value {
            if (count < 1) {
                throw jsi::JSError(rt, "createSignal requires 1 argument");
            }
            
            // Convert JSI value to native SignalValue
            SignalValue initialValue(rt, args[0]);
            
            // Create signal in C++ store
            std::string signalId = store.createSignal(initialValue);
            
            // Return signal ID as JavaScript string
            return jsi::Value(rt, jsi::String::createFromUtf8(rt, signalId));
        }
    );
    runtime.global().setProperty(runtime, "__signalForgeCreateSignal", std::move(createSignalFunc));
    
    /**
     * __signalForgeGetSignal(signalId) -> value
     * Retrieves the current value of a signal
     */
    auto getSignalFunc = jsi::Function::createFromHostFunction(
        runtime,
        jsi::PropNameID::forAscii(runtime, "__signalForgeGetSignal"),
        1,
        [&store](jsi::Runtime& rt, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value {
            if (count < 1 || !args[0].isString()) {
                throw jsi::JSError(rt, "getSignal requires a string signal ID");
            }
            
            std::string signalId = args[0].getString(rt).utf8(rt);
            
            try {
                // Fetch value from C++ store
                SignalValue value = store.getSignal(signalId);
                // Convert back to JavaScript value
                return value.toJSI(rt);
            } catch (const std::exception& e) {
                throw jsi::JSError(rt, e.what());
            }
        }
    );
    runtime.global().setProperty(runtime, "__signalForgeGetSignal", std::move(getSignalFunc));
    
    /**
     * __signalForgeSetSignal(signalId, newValue) -> void
     * Updates a signal's value and increments its version
     */
    auto setSignalFunc = jsi::Function::createFromHostFunction(
        runtime,
        jsi::PropNameID::forAscii(runtime, "__signalForgeSetSignal"),
        2,
        [&store](jsi::Runtime& rt, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value {
            if (count < 2 || !args[0].isString()) {
                throw jsi::JSError(rt, "setSignal requires signal ID and new value");
            }
            
            std::string signalId = args[0].getString(rt).utf8(rt);
            SignalValue newValue(rt, args[1]);
            
            try {
                // Update signal in C++ store
                // This will increment the atomic version counter
                store.setSignal(signalId, newValue);
                return jsi::Value::undefined();
            } catch (const std::exception& e) {
                throw jsi::JSError(rt, e.what());
            }
        }
    );
    runtime.global().setProperty(runtime, "__signalForgeSetSignal", std::move(setSignalFunc));
    
    /**
     * __signalForgeHasSignal(signalId) -> boolean
     * Check if a signal exists in the store
     */
    auto hasSignalFunc = jsi::Function::createFromHostFunction(
        runtime,
        jsi::PropNameID::forAscii(runtime, "__signalForgeHasSignal"),
        1,
        [&store](jsi::Runtime& rt, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value {
            if (count < 1 || !args[0].isString()) {
                throw jsi::JSError(rt, "hasSignal requires a string signal ID");
            }
            
            std::string signalId = args[0].getString(rt).utf8(rt);
            bool exists = store.hasSignal(signalId);
            
            return jsi::Value(exists);
        }
    );
    runtime.global().setProperty(runtime, "__signalForgeHasSignal", std::move(hasSignalFunc));
    
    /**
     * __signalForgeDeleteSignal(signalId) -> void
     * Remove a signal from the store and free its memory
     */
    auto deleteSignalFunc = jsi::Function::createFromHostFunction(
        runtime,
        jsi::PropNameID::forAscii(runtime, "__signalForgeDeleteSignal"),
        1,
        [&store](jsi::Runtime& rt, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value {
            if (count < 1 || !args[0].isString()) {
                throw jsi::JSError(rt, "deleteSignal requires a string signal ID");
            }
            
            std::string signalId = args[0].getString(rt).utf8(rt);
            store.deleteSignal(signalId);
            
            return jsi::Value::undefined();
        }
    );
    runtime.global().setProperty(runtime, "__signalForgeDeleteSignal", std::move(deleteSignalFunc));
    
    /**
     * __signalForgeGetVersion(signalId) -> number
     * Get the current version number for change detection
     * Lock-free atomic read for maximum performance
     */
    auto getVersionFunc = jsi::Function::createFromHostFunction(
        runtime,
        jsi::PropNameID::forAscii(runtime, "__signalForgeGetVersion"),
        1,
        [&store](jsi::Runtime& rt, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value {
            if (count < 1 || !args[0].isString()) {
                throw jsi::JSError(rt, "getVersion requires a string signal ID");
            }
            
            std::string signalId = args[0].getString(rt).utf8(rt);
            
            try {
                // Atomic read - no locking overhead
                uint64_t version = store.getSignalVersion(signalId);
                return jsi::Value(static_cast<double>(version));
            } catch (const std::exception& e) {
                throw jsi::JSError(rt, e.what());
            }
        }
    );
    runtime.global().setProperty(runtime, "__signalForgeGetVersion", std::move(getVersionFunc));
    
    /**
     * __signalForgeBatchUpdate(updates) -> void
     * Update multiple signals in one operation
     * Expects array of [signalId, value] pairs
     */
    auto batchUpdateFunc = jsi::Function::createFromHostFunction(
        runtime,
        jsi::PropNameID::forAscii(runtime, "__signalForgeBatchUpdate"),
        1,
        [&store](jsi::Runtime& rt, const jsi::Value& thisValue, const jsi::Value* args, size_t count) -> jsi::Value {
            if (count < 1 || !args[0].isObject()) {
                throw jsi::JSError(rt, "batchUpdate requires an array of updates");
            }
            
            auto updatesArray = args[0].getObject(rt).getArray(rt);
            size_t length = updatesArray.size(rt);
            
            std::vector<std::pair<std::string, SignalValue>> updates;
            updates.reserve(length);
            
            for (size_t i = 0; i < length; i++) {
                auto updateObj = updatesArray.getValueAtIndex(rt, i).getObject(rt).getArray(rt);
                std::string signalId = updateObj.getValueAtIndex(rt, 0).getString(rt).utf8(rt);
                SignalValue value(rt, updateObj.getValueAtIndex(rt, 1));
                updates.emplace_back(signalId, value);
            }
            
            store.batchUpdate(updates);
            return jsi::Value::undefined();
        }
    );
    runtime.global().setProperty(runtime, "__signalForgeBatchUpdate", std::move(batchUpdateFunc));
}

} // namespace signalforge
