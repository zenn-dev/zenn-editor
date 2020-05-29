module.exports = {
  webpack(config, { isServer }) {
    config.resolve.extensions.push(".md");
    config.module.rules.push({
      test: /\.md$/,
      use: "zenn-markdown-loader",
    });
    if (!isServer) {
      config.node = {
        fs: "empty",
      };
    }
    return config;
  },
};
