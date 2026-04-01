module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel", // NativeWind v4 yêu cầu preset này
    ],
    plugins: [
      "react-native-reanimated/plugin", // Luôn để reanimated ở dòng cuối cùng của plugins
    ],
  };
};