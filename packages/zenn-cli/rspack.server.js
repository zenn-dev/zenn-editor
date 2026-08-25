const rspack = require('@rspack/core');
const dotenv = require('dotenv');

const RUNTIME_ONLY_ENV_KEYS = new Set(['ZENN_API_KEY', 'ZENN_API_BASE_URL']);
const ENV =
  dotenv.config({ path: process.env.ZENN_CLI_DOTENV_PATH || '.env' }).parsed ||
  {};
const BUILD_TIME_ENV = Object.fromEntries(
  Object.entries(ENV).filter(([key]) => !RUNTIME_ONLY_ENV_KEYS.has(key))
);

/**
 * @type {import('@rspack/core').Configuration}
 */
module.exports = {
  target: 'node',

  mode: 'production',

  entry: './src/server/zenn.ts',

  output: {
    clean: true,
    filename: 'zenn.js',
    path: `${__dirname}/dist/server`,
  },

  externals: [
    ({ request }, callback) => {
      if (/package\.json$/.test(request)) {
        return callback(null, 'commonjs ../../package.json');
      }

      const module = request.match(/^node:(.+)/)?.[1];
      if (module) {
        return callback(null, `commonjs ${module}`);
      }

      if (request === 'open') {
        return callback(null, 'import open');
      }

      callback();
    },
  ],

  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },

  module: {
    rules: [
      // fsevents の `*.node` ファイルに対応するため
      {
        test: /\.node$/,
        type: 'asset/resource',
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                },
                target: 'es2020',
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    // ビルドファイルの先頭に shebang を追加する
    new rspack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    // 出力先のファイルを`zenn.js`のみするための設定
    new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    // 環境変数を埋め込む
    new rspack.DefinePlugin({
      // wsパッケージのオプショナル依存関係（bufferutil, utf-8-validate）を無効化
      // https://github.com/websockets/ws#opt-in-for-performance
      'process.env.WS_NO_BUFFER_UTIL': JSON.stringify('1'),
      'process.env.WS_NO_UTF_8_VALIDATE': JSON.stringify('1'),
      ...Object.entries(BUILD_TIME_ENV).reduce((env, [key, value]) => {
        env[`process.env.${key}`] = JSON.stringify(value);
        return env;
      }, {}),
    }),
  ],

  ignoreWarnings: [
    // Expressのdynamic require警告を抑制
    {
      module: /express/,
      message:
        /Critical dependency: the request of a dependency is an expression/,
    },
  ],
};
