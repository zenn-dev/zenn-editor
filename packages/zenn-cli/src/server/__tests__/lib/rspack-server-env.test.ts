import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

const configPath = require.resolve('../../../../rspack.server.js');

type DefinePluginForTest = {
  constructor: { name: string };
  _args: [Record<string, unknown>];
};

type RspackConfigForTest = { plugins: DefinePluginForTest[] };

describe('Rspackの環境変数設定', () => {
  afterEach(() => {
    delete process.env.ZENN_CLI_DOTENV_PATH;
    delete require.cache[configPath];
  });

  test('Scrap APIの実行時環境変数をビルド時注入から除外する', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'zenn-rspack-test-'));
    const envPath = path.join(directory, '.env');
    await writeFile(
      envPath,
      [
        'ZENN_API_KEY=DO_NOT_PUBLISH',
        'ZENN_API_BASE_URL=https://public-api.example.com',
        'OTHER_BUILD_TIME_VALUE=safe-to-inline',
      ].join('\n')
    );
    process.env.ZENN_CLI_DOTENV_PATH = envPath;
    delete require.cache[configPath];

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const config = require(configPath) as RspackConfigForTest;
    const definePlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'DefinePlugin'
    );

    expect(definePlugin?._args[0]).toEqual({
      'process.env.WS_NO_BUFFER_UTIL': JSON.stringify('1'),
      'process.env.WS_NO_UTF_8_VALIDATE': JSON.stringify('1'),
      'process.env.OTHER_BUILD_TIME_VALUE': JSON.stringify('safe-to-inline'),
    });

    await rm(directory, { recursive: true, force: true });
  });
});
