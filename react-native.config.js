module.exports = {
  dependencies: {
    signalforge: {
      platforms: {
        ios: {
          codegenConfig: {
            name: 'NativeSignalForge',
            jsSrcsDir: 'src/native',
          },
        },
      },
    },
  },
};
