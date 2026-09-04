const rspack = require('@rspack/core');
const dotenv = require('dotenv');
const { dependencies } = require('./package.json');

const RUNTIME_ONLY_ENV_KEYS = new Set([
  'ZENN_API_KEY',
  'ZENN_API_BASE_URL',
  'ZENN_CLI_EXPERIMENTAL_SCRAP_API',
  'ZENN_CLI_AI_SCAN',
  'ZENN_CLI_FORCE_SAFE',
  'ZENN_CLI_FORCE_UNLISTED',
  'ZENN_CLI_AI_PROVIDER',
  'ZENN_CLI_AI_MODEL',
  'ZENN_CLI_AI_EFFORT',
  'ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD',
  'ZENN_CLI_AI_SCAN_PROMPT',
  'OPENAI_API_KEY',
  'FIREWORKS_API_KEY',
]);
const SERVER_EXTERNALS = new Set(Object.keys(dependencies));
const ESM_EXTERNALS = new Set([
  '@ai-sdk/fireworks',
  '@ai-sdk/openai',
  '@secretlint/node',
  '@secretlint/secretlint-rule-preset-recommend',
  'ai',
  'boxen',
  'chokidar',
  'configstore',
  'node-fetch',
  'open',
  'package-manager-detector',
  'zenn-markdown-html',
]);

const getPackageName = (request) => {
  const segments = request.split('/');
  return request.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];
};

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
      // package.json はビルドファイルには含めず外部ファイルとして読み込む
      // パスはビルド後のファイル構造を考慮する
      if (/package\.json$/.test(request)) {
        return callback(null, 'commonjs ../../package.json');
      }

      // require("node:<package>") に対応していない node バージョンのために、
      // require("<package>") に変換する
      const module = request.match(/^node:(.+)/)?.[1];
      if (module) {
        return callback(null, `commonjs ${module}`);
      }

      // 公開パッケージのdependenciesはbundleせず、利用者側で更新可能にする
      const packageName = getPackageName(request);
      if (SERVER_EXTERNALS.has(packageName)) {
        const externalType = ESM_EXTERNALS.has(packageName)
          ? 'import'
          : 'commonjs';
        return callback(null, `${externalType} ${request}`);
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
