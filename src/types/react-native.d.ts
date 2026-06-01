declare module 'react-native' {
  export interface TurboModule {}

  export const TurboModuleRegistry: {
    get<T extends TurboModule = TurboModule>(name: string): T | null;
    getEnforcing<T extends TurboModule = TurboModule>(name: string): T;
  };

  export const NativeModules: Record<string, any>;
  export const AsyncStorage: any;
}
