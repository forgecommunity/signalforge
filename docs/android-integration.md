# React Native Android Integration Example
# 
# This file shows how SignalForge would be integrated into a React Native
# Android project. This is typically generated automatically by React Native's
# autolinking, but is shown here for reference.

## File: android/build.gradle (Project-level)

```gradle
buildscript {
    ext {
        buildToolsVersion = "33.0.0"
        minSdkVersion = 21
        compileSdkVersion = 33
        targetSdkVersion = 33
        ndkVersion = "25.1.8937393"
        
        // Enable new architecture
        newArchEnabled = true
    }
    
    repositories {
        google()
        mavenCentral()
    }
    
    dependencies {
        classpath("com.android.tools.build:gradle:7.4.2")
        classpath("com.facebook.react:react-native-gradle-plugin")
    }
}

allprojects {
    repositories {
        maven { url "$rootDir/../node_modules/react-native/android" }
        google()
        mavenCentral()
    }
}
```

## File: android/app/build.gradle (App-level)

```gradle
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"

android {
    namespace "com.yourapp"
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    ndkVersion rootProject.ext.ndkVersion
    
    defaultConfig {
        applicationId "com.yourapp"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        
        // Enable new architecture
        buildConfigField("boolean", "IS_NEW_ARCHITECTURE_ENABLED", 
            rootProject.ext.newArchEnabled.toString())
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    
    // Configure CMake for native code
    externalNativeBuild {
        cmake {
            path "../../node_modules/signalforge/CMakeLists.txt"
            version "3.22.1"
        }
    }
    
    // Specify ABIs to build for
    defaultConfig {
        ndk {
            abiFilters "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }
}

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    
    // React Native
    implementation "com.facebook.react:react-android"
    implementation "com.facebook.react:hermes-android"
    
    // SignalForge will be auto-linked by React Native
}
```

## File: android/gradle.properties

```properties
# Enable new architecture for Fabric + TurboModules
newArchEnabled=true

# Use Hermes JavaScript engine (recommended)
hermesEnabled=true

# Gradle settings
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.configureondemand=true

# Android settings
android.useAndroidX=true
android.enableJetifier=true

# Disable unnecessary features for faster builds
android.enableR8=true
android.enableD8.desugaring=true
```

## File: android/settings.gradle

```gradle
rootProject.name = 'YourApp'

// Include React Native
apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle")
applyNativeModulesSettingsGradle(settings)

include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')

// SignalForge will be auto-included by React Native's autolinking
```

## CMake Configuration for SignalForge

When building, Gradle will invoke CMake with the following configuration:

```cmake
# Passed by Gradle:
# -DANDROID_ABI=arm64-v8a
# -DANDROID_PLATFORM=android-21
# -DCMAKE_TOOLCHAIN_FILE=${ANDROID_NDK}/build/cmake/android.toolchain.cmake
# -DCMAKE_BUILD_TYPE=Release

# SignalForge's CMakeLists.txt will:
# 1. Find JSI headers from React Native
# 2. Compile jsiStore.cpp with C++17
# 3. Link against log library
# 4. Generate libsignalforge-native.so for each ABI
```

## Loading the Native Module

The module is loaded automatically by React Native when the app starts:

```java
// In MainApplication.java
package com.yourapp;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

public class MainApplication extends Application implements ReactApplication {
    
    private final ReactNativeHost mReactNativeHost = new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            List<ReactPackage> packages = new PackageList(this).getPackages();
            // SignalForge is auto-linked
            return packages;
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        
        // SoLoader will load libsignalforge-native.so
        SoLoader.init(this, false);
        
        // JSI bindings are installed when the JS bundle loads
    }
}
```

## File: android/app/src/main/jni/Android.mk (Alternative to CMake)

If you prefer Android.mk instead of CMake:

```makefile
LOCAL_PATH := $(call my-dir)

# SignalForge Native Module
include $(CLEAR_VARS)

LOCAL_MODULE := signalforge-native

LOCAL_SRC_FILES := \
    $(LOCAL_PATH)/../../../../../src/native/jsiStore.cpp

LOCAL_C_INCLUDES := \
    $(LOCAL_PATH)/../../../../../src/native \
    $(LOCAL_PATH)/../../../../../node_modules/react-native/ReactCommon/jsi

LOCAL_CPPFLAGS := -std=c++17 -fexceptions -frtti -O3
LOCAL_LDLIBS := -llog

include $(BUILD_SHARED_LIBRARY)
```

## Troubleshooting

### Build Fails with "jsi/jsi.h not found"

Make sure React Native is installed:
```bash
npm install react-native
```

### App Crashes on Startup

Check logcat for errors:
```bash
adb logcat | grep SignalForge
```

Common issues:
- NDK version mismatch (use NDK 25+)
- Missing C++17 support (update NDK)
- ABI mismatch (check device architecture)

### Native Functions Not Available

Verify the module loaded:
```typescript
console.log('Native available:', typeof global.__signalForgeCreateSignal);
```

If it prints 'undefined', check:
1. Module is listed in `native_modules.gradle`
2. CMake built successfully (check build logs)
3. .so file exists in APK (unzip and check lib/[abi]/)

## Performance Tips

1. **Use Release Builds**: Debug builds are much slower
   ```bash
   cd android && ./gradlew assembleRelease
   ```

2. **Enable Hermes**: Better JSI performance
   ```properties
   hermesEnabled=true
   ```

3. **Optimize ABIs**: Only build for target devices
   ```gradle
   ndk {
       abiFilters "arm64-v8a"  // Modern Android devices
   }
   ```

4. **Use Proguard**: Smaller APK, faster startup
   ```gradle
   minifyEnabled true
   ```
