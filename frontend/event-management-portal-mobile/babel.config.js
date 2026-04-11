module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./", // Dấu @ trỏ về thư mục gốc
          },
        },
      ],
      "react-native-reanimated/plugin", // Nếu bạn có dùng reanimated
    ],
  };
};
