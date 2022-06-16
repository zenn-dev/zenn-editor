const webpack = require('webpack');

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
    ({ request }, callback) =>
      /package\.json$/.test(request)
        ? callback(null, 'commonjs ../../package.json')
        : callback(),
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
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'esbuild-loader',
            options: { loader: 'tsx', target: 'node16' },
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
  ],
};
