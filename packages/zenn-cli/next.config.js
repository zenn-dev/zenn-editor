const path = require('path');

module.exports = {
  future: {
    webpack5: true,
  },
  // resolve error "Module not found: Can't resolve 'fs'"
  resolve: {
    fallback: {
      fs: false,
    },
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};
