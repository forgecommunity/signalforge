# CMakeLists.txt for SignalForge (Root)
# This is the entry point for building the native React Native module

cmake_minimum_required(VERSION 3.13)
project(signalforge)

# Include the actual implementation
add_subdirectory(src/native)
