# 🚀 Complete Setup Guide for SignalForge React Native Example

This guide ensures everything works perfectly!

## 📋 Prerequisites

- Node.js 18 or higher
- React Native development environment set up:
  - **iOS**: Xcode (macOS only) + CocoaPods
  - **Android**: Android Studio + JDK

## 🔧 Step-by-Step Installation

### 1. Build SignalForge Library

First, build the main library from the repository root:

```bash
# Navigate to repository root
cd d:\forge\SignalForge

# Install dependencies and build
npm install
npm run build
```

**✅ Expected output**: You should see `dist/` folder created with compiled files.

### 2. Install Example App Dependencies

```bash
# Navigate to example app
cd examples\sfReactNative

# Install all dependencies (including AsyncStorage)
npm install

# Install AsyncStorage if not already added
npm install @react-native-async-storage/async-storage
```

### 3. iOS Setup (macOS only)

```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..
```

### 4. Android Setup (All platforms)

No additional setup needed! Android dependencies are automatically handled.

## ▶️ Running the App

### Option A: Start Metro, then run platform

**Terminal 1** - Start Metro bundler:
```bash
npm start
```

**Terminal 2** - Run your platform:
```bash
# For Android:
npm run android

# For iOS (macOS only):
npm run ios
```

### Option B: Run with clean cache

If you encounter issues:

```bash
# Clean start Metro
npm start -- --reset-cache

# In another terminal:
npm run android  # or npm run ios
```

## 🐛 Troubleshooting

### ❌ Error: "Element type is invalid"

**Cause**: Library not built or Metro cache issue

**Solution**:
```bash
# Rebuild library
cd ..\..
npm run build

# Clear Metro cache
cd examples\sfReactNative
npm start -- --reset-cache
```

### ❌ Error: "AsyncStorage not found"

**Cause**: Missing AsyncStorage dependency

**Solution**:
```bash
# Install AsyncStorage
npm install @react-native-async-storage/async-storage

# iOS only - reinstall pods
cd ios
pod install
cd ..

# Rebuild app
npm run android  # or npm run ios
```

### ❌ Error: "Module not found: signalforge-alpha/utils"

**Cause**: Library not built or Metro not resolving correctly

**Solution**:
```bash
# Rebuild library
cd ..\..
npm run build
cd examples\sfReactNative

# Clear cache and restart
npm start -- --reset-cache
```

### ❌ Error: React hooks unavailable

**Cause**: Duplicate React instance

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Rebuild from fresh
npm start -- --reset-cache
```

### ❌ iOS: "No Podfile found"

**Cause**: Pods not installed

**Solution**:
```bash
cd ios
pod install
cd ..
npm run ios
```

### ❌ Android: Build fails

**Solution**:
```bash
# Clean build
cd android
.\gradlew clean
cd ..

# Rebuild
npm run android
```

## ✅ Verification

Once the app starts successfully, you should see:

1. **Home Screen**: List of 12 interactive demos
2. **No errors**: Metro bundler should show no errors
3. **Interactive**: Tap any demo to see it work

### Test the Key Features:

1. **Basic Signal** - Should increment/decrement without errors
2. **Persistent Signal** - Should show saved values after app restart
3. **React Hooks** - All three hook examples should work
4. **Todo App** - Should add/remove/filter todos

## 📊 Expected File Structure

After setup, you should have:

```
SignalForge/
├── dist/                          ✅ Compiled library
│   ├── index.js
│   ├── entries/
│   │   ├── core.js
│   │   ├── react.js
│   │   └── utils.js
│   └── ...
├── examples/
│   └── sfReactNative/
│       ├── node_modules/
│       │   ├── @react-native-async-storage/  ✅ Required for persistence
│       │   └── signalforge-alpha/            ✅ Linked to parent
│       ├── screens/              ✅ 12 demo screens
│       ├── ios/
│       │   └── Pods/             ✅ iOS only
│       └── android/
```

## 🎯 What Each Demo Shows

1. **Basic Signal** - `.get()`, `.set()` basics
2. **Computed Signal** - Auto-calculated values
3. **Effects** - Side effects on changes
4. **Batch Updates** - Performance optimization
5. **Subscribe** - Event listeners
6. **Untrack** - Dependency control
7. **React Hooks** - All 3 hooks in action
8. **Shopping Cart** - Real-world example
9. **Form Validation** - Real-time validation
10. **Todo App** - Complete CRUD example
11. **Array Signal** - Array helper methods
12. **Persistent Signal** - AsyncStorage integration ⚠️ Requires AsyncStorage!

## 🎉 Success!

If you see the home screen with all 12 demos and can navigate between them, you're all set! 

The app demonstrates every SignalForge feature from the README in an easy-to-understand, interactive format.

## 📚 Next Steps

- Explore each demo screen
- Read the code in `screens/` folder
- Copy patterns to your own app
- Check the main [README.md](../../README.md) for API details

## 💡 Pro Tips

1. **Clear cache often**: When switching branches or rebuilding library
2. **Check Metro terminal**: It shows helpful error messages
3. **Use React DevTools**: Install for better debugging
4. **Read screen code**: Each screen is well-commented

---

**Need more help?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or open an issue on GitHub.
