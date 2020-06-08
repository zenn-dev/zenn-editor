const path = require("path");

module.exports = {
  webpack(config, { isServer }) {
    // config.resolve.extensions.push(".md");
    // config.module.rules.push({
    //   test: /\.md$/,
    //   use: "zenn-markdown-loader",
    // });
    if (!isServer) {
      config.node = {
        fs: "empty",
      };
    }
    return config;
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};
