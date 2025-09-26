module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],  // this is enough
    plugins: ['react-native-reanimated/plugin'],
  };
};

