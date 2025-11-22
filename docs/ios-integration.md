# React Native iOS Integration Example
# 
# This file shows how SignalForge would be integrated into a React Native
# iOS project using CocoaPods and Xcode.

## File: ios/Podfile

```ruby
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '13.0'

# Enable new architecture
ENV['RCT_NEW_ARCH_ENABLED'] = '1'

target 'YourApp' do
  config = use_native_modules!

  # React Native pods
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,  # Use Hermes for better JSI performance
    :fabric_enabled => ENV['RCT_NEW_ARCH_ENABLED'] == '1',
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # SignalForge will be auto-linked by React Native
  # Native module will be built as part of the project

  post_install do |installer|
    react_native_post_install(installer)
    
    # Ensure C++17 is enabled for all targets
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        config.build_settings['CLANG_CXX_LIBRARY'] = 'libc++'
        
        # Enable bitcode if needed
        config.build_settings['ENABLE_BITCODE'] = 'NO'
        
        # Set minimum deployment target
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
      end
    end
  end
end
```

## File: ios/YourApp.xcodeproj/project.pbxproj Configuration

The Xcode project needs to link the SignalForge native module:

### Add CMake Build Phase

In Xcode:
1. Select your project in the navigator
2. Select your app target
3. Go to "Build Phases"
4. Click "+" and add "New Run Script Phase"
5. Add this script:

```bash
#!/bin/bash
set -e

# Build SignalForge native module with CMake
SIGNALFORGE_DIR="${PODS_ROOT}/../../node_modules/signalforge"
BUILD_DIR="${CONFIGURATION_BUILD_DIR}/SignalForge"

mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"

# Configure CMake for iOS
cmake "${SIGNALFORGE_DIR}" \
  -DCMAKE_BUILD_TYPE=${CONFIGURATION} \
  -DCMAKE_OSX_ARCHITECTURES="${ARCHS}" \
  -DCMAKE_OSX_DEPLOYMENT_TARGET="${IPHONEOS_DEPLOYMENT_TARGET}" \
  -DCMAKE_TOOLCHAIN_FILE="${SIGNALFORGE_DIR}/ios.toolchain.cmake" \
  -DPLATFORM=OS64

# Build the library
cmake --build . --config ${CONFIGURATION}

# Copy built library to app bundle
cp libsignalforge-native.a "${CONFIGURATION_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}/"
```

### Link the Library

In "Build Phases" > "Link Binary With Libraries", add:
- `libsignalforge-native.a`
- `libc++.tbd` (C++ standard library)
- `Foundation.framework`

### Header Search Paths

In "Build Settings" > "Header Search Paths", add:
```
$(SRCROOT)/../node_modules/signalforge/src/native
$(SRCROOT)/../node_modules/react-native/ReactCommon/jsi
```

### Other Linker Flags

In "Build Settings" > "Other Linker Flags", ensure:
```
-lc++
-ObjC
```

## File: ios/YourApp/AppDelegate.mm

```objc++
#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#import <React/RCTJavaScriptExecutor.h>

// Import SignalForge JSI installer
#import "jsiStore.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application 
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self 
                                             launchOptions:launchOptions];
  
  // Install SignalForge JSI bindings
  [self installSignalForgeJSI:bridge];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"YourApp"
                                            initialProperties:nil];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  return YES;
}

- (void)installSignalForgeJSI:(RCTBridge *)bridge
{
  // Get the JSI runtime from the bridge
  RCTCxxBridge *cxxBridge = (RCTCxxBridge *)bridge;
  if (!cxxBridge.runtime) {
    NSLog(@"[SignalForge] JSI runtime not available");
    return;
  }
  
  // Install JSI bindings into the runtime
  facebook::jsi::Runtime *jsiRuntime = (facebook::jsi::Runtime *)cxxBridge.runtime;
  signalforge::installJSIBindings(*jsiRuntime);
  
  NSLog(@"[SignalForge] JSI bindings installed successfully");
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
```

## File: ios/SignalForge-Bridging-Header.h

Create a bridging header to expose C++ to Objective-C:

```objc++
#ifndef SignalForge_Bridging_Header_h
#define SignalForge_Bridging_Header_h

#import <React/RCTBridge.h>
#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>

// Include SignalForge native headers
#import "jsiStore.h"

#endif
```

## Alternative: Using CocoaPods Podspec

Create `signalforge.podspec` in the package root:

```ruby
require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "SignalForge"
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.authors      = package['author']
  s.platform     = :ios, "13.0"
  
  s.source       = { :git => "https://github.com/yourorg/signalforge.git", :tag => "v#{s.version}" }
  s.source_files = "src/native/**/*.{h,cpp,mm}"
  s.public_header_files = "src/native/**/*.h"
  
  # C++ configuration
  s.requires_arc = true
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'CLANG_CXX_LIBRARY' => 'libc++',
    'HEADER_SEARCH_PATHS' => [
      '"$(PODS_ROOT)/Headers/Public/React-Core"',
      '"$(PODS_ROOT)/Headers/Public/React-jsi"',
      '"$(PODS_ROOT)/Headers/Private/React-Core"'
    ].join(' ')
  }
  
  # Dependencies
  s.dependency "React-Core"
  s.dependency "React-jsi"
  s.dependency "React-jsiexecutor"
  
  # Use CMake for building
  s.prepare_command = <<-CMD
    mkdir -p build
    cd build
    cmake .. -DCMAKE_BUILD_TYPE=Release
    cmake --build . --config Release
  CMD
  
  s.preserve_paths = 'CMakeLists.txt', 'src/native/**/*'
  s.vendored_libraries = 'build/libsignalforge-native.a'
end
```

## File: ios/YourApp/Info.plist

Ensure your Info.plist has the correct settings:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <!-- ... other keys ... -->
    
    <!-- Enable JSI in React Native -->
    <key>RCTJSIEnabled</key>
    <true/>
</dict>
</plist>
```

## Building the Project

### First Time Setup

```bash
# Install dependencies
npm install

# Install pods
cd ios
pod install
cd ..
```

### Build and Run

```bash
# Using React Native CLI
npx react-native run-ios

# Or using Xcode
cd ios
open YourApp.xcworkspace
# Build and run from Xcode (⌘+R)
```

### Build for Release

```bash
# Create release build
npx react-native run-ios --configuration Release

# Or create archive in Xcode
# Product > Archive
```

## Troubleshooting

### "jsi/jsi.h file not found"

1. Clean build folder:
   ```bash
   cd ios
   xcodebuild clean
   rm -rf build/
   pod deintegrate
   pod install
   ```

2. Check Header Search Paths in Xcode

3. Verify React Native is installed:
   ```bash
   npm ls react-native
   ```

### "Undefined symbols for architecture arm64"

1. Verify C++ standard library is linked:
   - Build Settings > Other Linker Flags > `-lc++`

2. Check architecture settings:
   - Build Settings > Architectures > `arm64`

3. Ensure C++17 is enabled:
   - Build Settings > C++ Language Dialect > `GNU++17`

### Runtime Error: "global is not defined"

This can happen in Hermes. Fix:

```javascript
// In index.js, before importing App
if (typeof global === 'undefined') {
  global = window;
}
```

### JSI Functions Not Available

Check that JSI was installed:

```objc++
// In AppDelegate.mm, add logging
NSLog(@"[SignalForge] Installing JSI...");
signalforge::installJSIBindings(*jsiRuntime);
NSLog(@"[SignalForge] JSI installed successfully");
```

Then check in JS:

```typescript
console.log('JSI available:', typeof global.__signalForgeCreateSignal);
```

## Performance Optimization

### 1. Enable Hermes

In Podfile:
```ruby
:hermes_enabled => true
```

Hermes provides better JSI performance than JSC.

### 2. Enable Release Optimization

In Xcode Build Settings:
- Optimization Level > Fastest, Smallest [-Os]
- Link-Time Optimization > Yes

### 3. Strip Debug Symbols

In Xcode Build Settings (Release):
- Strip Debug Symbols During Copy > Yes
- Strip Linked Product > Yes

### 4. Use Bitcode (if required)

In Xcode Build Settings:
- Enable Bitcode > Yes

Note: Bitcode may increase build time.

## Testing

### Unit Tests (Native)

Create `ios/YourAppTests/SignalForgeTests.mm`:

```objc++
#import <XCTest/XCTest.h>
#import "jsiStore.h"

@interface SignalForgeTests : XCTestCase
@end

@implementation SignalForgeTests

- (void)testSignalCreation {
    // Test native signal creation
    auto& store = signalforge::JSISignalStore::getInstance();
    
    signalforge::SignalValue value(42.0);
    std::string signalId = store.createSignal(value);
    
    XCTAssertFalse(signalId.empty(), @"Signal ID should not be empty");
    XCTAssertTrue(store.hasSignal(signalId), @"Signal should exist");
    
    auto retrievedValue = store.getSignal(signalId);
    XCTAssertEqual(retrievedValue.asNumber(), 42.0, @"Value should match");
}

- (void)testSignalUpdate {
    auto& store = signalforge::JSISignalStore::getInstance();
    
    signalforge::SignalValue initialValue(10.0);
    std::string signalId = store.createSignal(initialValue);
    
    uint64_t version1 = store.getSignalVersion(signalId);
    
    signalforge::SignalValue newValue(20.0);
    store.setSignal(signalId, newValue);
    
    uint64_t version2 = store.getSignalVersion(signalId);
    XCTAssertGreaterThan(version2, version1, @"Version should increment");
}

@end
```

Run tests:
```bash
xcodebuild test \
  -workspace ios/YourApp.xcworkspace \
  -scheme YourApp \
  -destination 'platform=iOS Simulator,name=iPhone 14'
```

## Deployment

### App Store Distribution

1. Archive the app in Xcode
2. Validate the archive
3. Upload to App Store Connect
4. Submit for review

The native module is statically linked, so no additional steps needed.

### Simulator vs Device

Both are supported:
- **Simulator**: x86_64 (Intel Mac) or arm64 (M1/M2 Mac)
- **Device**: arm64 only

CMake will build for the correct architecture automatically.
