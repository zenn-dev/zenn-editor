const rspack = require('@rspack/core');
const dotenv = require('dotenv');

const ENV = dotenv.config().parsed || {};

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
    // package.json はビルドファイルには含めず外部ファイルとして読み込む
    // パスはビルド後のファイル構造を考慮する
    ({ request }, callback) => {
      if (/package\.json$/.test(request)) {
        callback(null, 'commonjs ../../package.json');
      } else {
        callback();
      }
    },

    // require("node:<package>") に対応していない node バージョンのために、
    // require("<package>") に変換する
    ({ request }, callback) => {
      const module = request.match(/^node:(.+)/)?.[1];

      if (module) {
        callback(null, `commonjs ${module}`);
      } else {
        callback();
      }
    },

    // open パッケージは外部依存として扱う（クロスプラットフォーム対応のため）
    // https://github.com/sindresorhus/open/releases/tag/v9.0.0 より pure ESM パッケージになった
    // requireは使えないためESM importとして扱う
    ({ request }, callback) => {
      if (request === 'open') {
        callback(null, 'import open');
      } else {
        callback();
      }
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
      ...Object.entries(ENV).reduce((env, [key, value]) => {
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
