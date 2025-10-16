const webpack = require('webpack');
const dotenv = require('dotenv');

const ENV = dotenv.config().parsed || {};

/**
 * @type {import('webpack').Configuration}
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

    // ws パッケージの optional peer dependencies を外部化
    'bufferutil',
    'utf-8-validate',
  ],

  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },

  module: {
    rules: [
      // fsevents の `*.node` ファイルに対応するため
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'ts',

              // >=14.0.0の動作を保証するため、
              // "node14" ではなく "node14.0.0" を指定する
              target: 'node14.0.0',
            },
          },
        ],
      },
    ],
  },

  plugins: [
    // ビルドファイルの先頭に shebang を追加する
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    // 出力先のファイルを`zenn.js`のみするための設定
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    // 環境変数を埋め込む
    new webpack.DefinePlugin(
      Object.entries(ENV).reduce((env, [key, value]) => {
        env[`process.env.${key}`] = JSON.stringify(value);
        return env;
      }, {})
    ),
  ],

  ignoreWarnings: [
    // express のビューエンジンの動的 require による警告を無視
    {
      module: /node_modules\/express\/lib\/view\.js/,
      message: /Critical dependency: the request of a dependency is an expression/,
    },
  ],
};
