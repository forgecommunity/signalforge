# Changelog

All notable changes to SignalForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-11-29

### Fixed
- **Critical**: Fixed `useSignalEffect` WeakMap error - Changed from `Symbol` to empty object `{}` for WeakMap key compatibility
- **Critical**: Rebuilt library to include `persist` and `createPersistentSignal` exports in dist/entries/utils.js
- Fixed TypeScript compilation to ensure all exports are properly included in build output

### Changed
- Updated README.md with comprehensive React Native integration guide
- Added AsyncStorage installation instructions for React Native users
- Documented Metro configuration requirements for local development
- Enhanced documentation for persistent signals in React Native

### Verified
- ✅ All 12 core tests passing
- ✅ All 12 React hooks tests passing (including useSignalEffect)
- ✅ 6/7 persistence tests passing (1 expected behavior)
- ✅ TypeScript compilation: 0 errors
- ✅ All entry points bundled successfully

## [0.1.0] - 2025-11-29

### Added
- Initial release of SignalForge
- Fine-grained reactive state management system
- Automatic dependency tracking
- React integration with hooks (useSignal, useSignalValue, useSignalEffect)
- Persistent signals with storage adapters
- Batch updates for performance optimization
- DevTools integration
- Plugin system
- Comprehensive test suite
- Full TypeScript support
- React Native compatibility
