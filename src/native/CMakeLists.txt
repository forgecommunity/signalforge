# CMakeLists.txt for SignalForge Native JSI Module
# Builds the C++ JSI bindings for React Native (Hermes and JSC compatible)

cmake_minimum_required(VERSION 3.13)
project(signalforge-native)

# Set C++ standard to C++17 (required for shared_ptr, atomic, etc.)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Enable position-independent code for shared libraries
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Optimization flags
if(CMAKE_BUILD_TYPE STREQUAL "Release")
  # Enable aggressive optimizations for release builds
  set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3 -DNDEBUG")
endif()

# ============================================================================
# Find React Native dependencies
# ============================================================================

# React Native's JSI headers location (adjust path based on your project structure)
# These paths are typically set by React Native's build system
set(REACT_NATIVE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../node_modules/react-native")
set(REACT_NATIVE_JSI_DIR "${REACT_NATIVE_DIR}/ReactCommon/jsi")

# Find JSI headers
find_path(JSI_INCLUDE_DIR
  NAMES jsi/jsi.h
  PATHS
    ${REACT_NATIVE_JSI_DIR}
    ${REACT_NATIVE_DIR}/ReactCommon/jsi
    ${REACT_NATIVE_DIR}/ReactCommon
  NO_DEFAULT_PATH
)

if(NOT JSI_INCLUDE_DIR)
  message(FATAL_ERROR "Could not find JSI headers. Make sure React Native is installed in node_modules.")
endif()

message(STATUS "Found JSI headers at: ${JSI_INCLUDE_DIR}")

# ============================================================================
# Source files
# ============================================================================

set(SOURCES
  jsiStore.cpp
)

set(HEADERS
  jsiStore.h
)

# ============================================================================
# Build shared library for JSI module
# ============================================================================

# Create shared library that will be loaded by React Native
add_library(signalforge-native SHARED ${SOURCES} ${HEADERS})

# Include directories
target_include_directories(signalforge-native PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}
  ${JSI_INCLUDE_DIR}
  ${JSI_INCLUDE_DIR}/jsi
)

# Link against pthread for std::mutex and std::atomic support
# Required on Linux/Android
if(UNIX AND NOT APPLE)
  target_link_libraries(signalforge-native PRIVATE pthread)
endif()

# Compiler warnings
target_compile_options(signalforge-native PRIVATE
  -Wall
  -Wextra
  -Wpedantic
  -Wno-unused-parameter
)

# ============================================================================
# Platform-specific configuration
# ============================================================================

# Android-specific settings
if(ANDROID)
  message(STATUS "Building for Android (ABI: ${ANDROID_ABI})")
  
  # Link against Android log library
  find_library(log-lib log)
  target_link_libraries(signalforge-native PRIVATE ${log-lib})
  
  # Android-specific compiler flags
  target_compile_options(signalforge-native PRIVATE
    -fno-omit-frame-pointer
    -ffunction-sections
    -fdata-sections
  )
  
  # Strip symbols in release builds
  if(CMAKE_BUILD_TYPE STREQUAL "Release")
    target_link_options(signalforge-native PRIVATE
      -Wl,--gc-sections
      -Wl,--strip-all
    )
  endif()
endif()

# iOS/macOS-specific settings
if(APPLE)
  message(STATUS "Building for Apple platform")
  
  # Set deployment target
  set_target_properties(signalforge-native PROPERTIES
    XCODE_ATTRIBUTE_IPHONEOS_DEPLOYMENT_TARGET "11.0"
    XCODE_ATTRIBUTE_MACOSX_DEPLOYMENT_TARGET "10.13"
  )
  
  # Link against C++ standard library
  target_link_libraries(signalforge-native PRIVATE "-lc++")
  
  # Framework dependencies
  target_link_libraries(signalforge-native PRIVATE
    "-framework Foundation"
  )
endif()

# ============================================================================
# Installation
# ============================================================================

# Install the built library to the appropriate location
# React Native will load it from here at runtime
install(TARGETS signalforge-native
  LIBRARY DESTINATION lib
  ARCHIVE DESTINATION lib
  RUNTIME DESTINATION bin
)

# Install headers (useful for development/debugging)
install(FILES ${HEADERS}
  DESTINATION include/signalforge
)

# ============================================================================
# Testing (optional)
# ============================================================================

# Enable testing if requested
option(BUILD_TESTS "Build test suite" OFF)

if(BUILD_TESTS)
  enable_testing()
  
  # Add test executable
  add_executable(signalforge-tests
    tests/jsiStore.test.cpp
    ${SOURCES}
  )
  
  target_include_directories(signalforge-tests PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${JSI_INCLUDE_DIR}
    ${JSI_INCLUDE_DIR}/jsi
  )
  
  if(UNIX AND NOT APPLE)
    target_link_libraries(signalforge-tests PRIVATE pthread)
  endif()
  
  add_test(NAME JSIStoreTests COMMAND signalforge-tests)
endif()

# ============================================================================
# Documentation
# ============================================================================

# Configuration summary
message(STATUS "")
message(STATUS "SignalForge Native JSI Module Configuration:")
message(STATUS "  Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  C++ standard: ${CMAKE_CXX_STANDARD}")
message(STATUS "  JSI include dir: ${JSI_INCLUDE_DIR}")
message(STATUS "  Install prefix: ${CMAKE_INSTALL_PREFIX}")
if(ANDROID)
  message(STATUS "  Android ABI: ${ANDROID_ABI}")
endif()
if(APPLE)
  message(STATUS "  Apple platform: iOS/macOS")
endif()
message(STATUS "")

# ============================================================================
# Usage Notes
# ============================================================================

# Build instructions:
#
# Android (from project root):
#   cd android
#   ./gradlew assembleDebug
#   (The gradle build system will invoke CMake automatically)
#
# iOS (from project root):
#   cd ios
#   pod install
#   xcodebuild -workspace SignalForge.xcworkspace -scheme SignalForge build
#   (Xcode will invoke CMake automatically)
#
# Manual build for testing:
#   mkdir build && cd build
#   cmake .. -DCMAKE_BUILD_TYPE=Release
#   cmake --build .
#   cmake --install . --prefix ./install
#
# Cross-compile for Android:
#   mkdir build-android && cd build-android
#   cmake .. \
#     -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK/build/cmake/android.toolchain.cmake \
#     -DANDROID_ABI=arm64-v8a \
#     -DANDROID_PLATFORM=android-21 \
#     -DCMAKE_BUILD_TYPE=Release
#   cmake --build .
