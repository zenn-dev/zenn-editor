const path = require("path");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "./index.js"),
  output: {
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [path.resolve(__dirname, "../lib/index.js")],
      },
    ],
  },
};
