#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <unordered_map>
#include <atomic>
#include <mutex>
#include <string>
#include <functional>

using namespace facebook;

namespace signalforge {

/**
 * SignalValue - Type-safe wrapper for signal values
 * Supports primitive types and can be extended for complex objects
 */
class SignalValue {
public:
    enum class Type {
        Undefined,
        Null,
        Boolean,
        Number,
        String,
        Object
    };

    SignalValue();
    explicit SignalValue(bool value);
    explicit SignalValue(double value);
    explicit SignalValue(const std::string& value);
    explicit SignalValue(jsi::Runtime& rt, const jsi::Value& value);

    Type getType() const { return type_; }
    bool asBoolean() const { return boolValue_; }
    double asNumber() const { return numberValue_; }
    const std::string& asString() const { return stringValue_; }
    
    jsi::Value toJSI(jsi::Runtime& rt) const;

private:
    Type type_;
    bool boolValue_;
    double numberValue_;
    std::string stringValue_;
};

/**
 * Signal - Core signal container with atomic version tracking
 * Uses shared_ptr for automatic memory management
 * Version counter enables efficient change detection
 */
class Signal {
public:
    explicit Signal(const SignalValue& initialValue);
    
    SignalValue getValue() const;
    void setValue(const SignalValue& newValue);
    uint64_t getVersion() const { return version_.load(std::memory_order_acquire); }
    
    // Subscribe a callback that fires when signal changes
    size_t subscribe(std::function<void(const SignalValue&)> callback);
    void unsubscribe(size_t id);

private:
    mutable std::mutex mutex_;  // Protects value_ during read/write
    SignalValue value_;
    std::atomic<uint64_t> version_;  // Thread-safe change tracking
    
    std::unordered_map<size_t, std::function<void(const SignalValue&)>> subscribers_;
    size_t nextSubscriberId_;
    
    void notifySubscribers();
};

/**
 * JSISignalStore - Main store managing all signals
 * Thread-safe singleton with JSI function bindings
 * Provides direct C++ memory access for React Native
 */
class JSISignalStore {
public:
    static JSISignalStore& getInstance();
    
    // Delete copy/move constructors for singleton
    JSISignalStore(const JSISignalStore&) = delete;
    JSISignalStore& operator=(const JSISignalStore&) = delete;
    
    // Core signal operations exposed to JSI
    std::string createSignal(const SignalValue& initialValue);
    SignalValue getSignal(const std::string& signalId);
    void setSignal(const std::string& signalId, const SignalValue& value);
    bool hasSignal(const std::string& signalId);
    void deleteSignal(const std::string& signalId);
    uint64_t getSignalVersion(const std::string& signalId);
    
    // Batch operations for performance
    void batchUpdate(const std::vector<std::pair<std::string, SignalValue>>& updates);
    
    // Memory management
    size_t getSignalCount() const;
    void clear();

private:
    JSISignalStore();
    ~JSISignalStore() = default;
    
    mutable std::mutex storeMutex_;  // Protects signals_ map
    std::unordered_map<std::string, std::shared_ptr<Signal>> signals_;
    std::atomic<uint64_t> nextSignalId_;
    
    std::string generateSignalId();
};

/**
 * Install JSI bindings into the React Native runtime
 * Exposes native functions to JavaScript:
 * - global.__signalForgeCreateSignal
 * - global.__signalForgeGetSignal
 * - global.__signalForgeSetSignal
 * - global.__signalForgeHasSignal
 * - global.__signalForgeDeleteSignal
 * - global.__signalForgeGetVersion
 * - global.__signalForgeBatchUpdate
 */
void installJSIBindings(jsi::Runtime& runtime);

} // namespace signalforge
