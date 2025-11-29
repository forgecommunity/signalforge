# 🔧 Troubleshooting Guide

## Error: "Element type is invalid"

If you see this error:
```
Element type is invalid: expected a string (for built-in components) 
or a class/function (for composite components) but got: object.
```

### Solution Steps:

1. **Rebuild the SignalForge library** (from repo root):
   ```bash
   cd ../..  # Go to repo root
   npm run build
   ```

2. **Clear Metro cache**:
   ```bash
   cd examples/sfReactNative
   npm start -- --reset-cache
   ```

3. **In a separate terminal, rebuild the app**:
   ```bash
   # Android
   npm run android
   
   # iOS (macOS only)
   cd ios && pod install && cd ..
   npm run ios
   ```

## Common Issues

### Issue: `createPersistentSignal` not working
**Solution**: The library has been updated to use `persist()` instead for better React Native compatibility:

```typescript
// OLD (may have issues)
const signal = createPersistentSignal('key', defaultValue);

// NEW (recommended)
const signal = createSignal(defaultValue);
persist(signal, { key: 'key' });
```

### Issue: Module not found errors
**Solution**: Make sure SignalForge is built:
```bash
cd ../..
npm install
npm run build
cd examples/sfReactNative
npm install
```

### Issue: TypeScript errors
**Solution**: The errors should resolve once Metro compiles the files. If not:
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Rebuild library
cd ../..
npm run build
cd examples/sfReactNative
```

### Issue: AsyncStorage errors
**Solution**: Make sure `@react-native-async-storage/async-storage` is installed:
```bash
npm install @react-native-async-storage/async-storage
cd ios && pod install && cd ..  # iOS only
```

## Still Having Issues?

1. Check that you're in the correct directory
2. Verify Node.js version (18+ required)
3. Make sure React Native environment is set up correctly
4. Try cleaning and rebuilding:
   ```bash
   # Android
   cd android
   ./gradlew clean
   cd ..
   
   # iOS
   cd ios
   rm -rf build
   pod install
   cd ..
   ```

5. Restart Metro with clean cache:
   ```bash
   npm start -- --reset-cache
   ```
