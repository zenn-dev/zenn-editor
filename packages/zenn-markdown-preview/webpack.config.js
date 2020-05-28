const path = require("path");

module.exports = {
  mode: "development",

  entry: path.resolve(__dirname, "./src/index.ts"),
  output: {
    filename: "./dist/bundle.js",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".js", ".ts", ".md", ".json"],
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.md$/,
        use: "zenn-markdown-loader",
      },
    ],
  },
};
