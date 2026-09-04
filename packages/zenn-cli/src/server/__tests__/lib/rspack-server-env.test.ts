import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

const configPath = require.resolve('../../../../rspack.server.js');

type DefinePluginForTest = {
  constructor: { name: string };
  _args: [Record<string, unknown>];
};

type ExternalCallback = (error?: Error | null, result?: string) => void;

type ExternalResolver = (
  context: { request: string },
  callback: ExternalCallback
) => void;

type RspackConfigForTest = {
  externals: ExternalResolver[];
  plugins: DefinePluginForTest[];
};

function resolveExternal(
  resolver: ExternalResolver,
  request: string
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    resolver({ request }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

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
        'ZENN_CLI_EXPERIMENTAL_SCRAP_API=true',
        'ZENN_CLI_FORCE_SAFE=true',
        'ZENN_CLI_FORCE_UNLISTED=true',
        'ZENN_CLI_AI_SCAN=true',
        'ZENN_CLI_AI_PROVIDER=openai',
        'ZENN_CLI_AI_MODEL=gpt-5-mini',
        'ZENN_CLI_AI_EFFORT=medium',
        'ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD=high',
        'ZENN_CLI_AI_SCAN_PROMPT=DO_NOT_PUBLISH_PROMPT',
        'OPENAI_API_KEY=DO_NOT_PUBLISH_OPENAI',
        'FIREWORKS_API_KEY=DO_NOT_PUBLISH_FIREWORKS',
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

describe('Rspackのサーバー依存設定', () => {
  test('dependenciesとそのサブパスをbundle対象から除外する', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const config = require(configPath) as RspackConfigForTest;
    const resolver = config.externals[0];

    await expect(resolveExternal(resolver, 'colors/safe')).resolves.toBe(
      'commonjs colors/safe'
    );
    await expect(
      resolveExternal(resolver, 'package-manager-detector/detect')
    ).resolves.toBe('import package-manager-detector/detect');
    await expect(
      resolveExternal(resolver, 'zenn-markdown-html/utils')
    ).resolves.toBe('import zenn-markdown-html/utils');
    await expect(
      resolveExternal(resolver, 'zenn-content-css')
    ).resolves.toBeUndefined();
  });
});
