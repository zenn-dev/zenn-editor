const path = require("path");

module.exports = {
  webpack(config, { isServer }) {
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
