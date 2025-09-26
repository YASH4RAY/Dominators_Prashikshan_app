module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript', // 👈 handles Expo’s .ts files
      '@babel/preset-flow',       // 👈 handles Flow syntax if present
    ],
    plugins: [
      'react-native-reanimated/plugin', // 👈 must be last
    ],
  };
};
