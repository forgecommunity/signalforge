#import <React/RCTBridge+Private.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTCxxBridge.h>
#import <React/RCTLog.h>
#import <jsi/jsi.h>

#import "jsiStore.h"

using namespace facebook;

@interface SignalForge : NSObject <RCTBridgeModule>
@end

@implementation SignalForge

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(install)
{
  RCTBridge *bridge = [RCTBridge currentBridge];
  if (![bridge isKindOfClass:[RCTCxxBridge class]]) {
    RCTLogWarn(@"[SignalForge] JSI installation skipped: bridge is not RCTCxxBridge");
    return @NO;
  }

  RCTCxxBridge *cxxBridge = (RCTCxxBridge *)bridge;
  if (!cxxBridge.runtime) {
    RCTLogWarn(@"[SignalForge] JSI installation skipped: runtime not yet available");
    return @NO;
  }

  try {
    auto runtime = (jsi::Runtime *)cxxBridge.runtime;
    signalforge::installJSIBindings(*runtime);
    return @YES;
  } catch (const std::exception &e) {
    RCTLogError(@"[SignalForge] Failed to install JSI bindings: %s", e.what());
  } catch (...) {
    RCTLogError(@"[SignalForge] Failed to install JSI bindings: unknown error");
  }

  return @NO;
}

@end
