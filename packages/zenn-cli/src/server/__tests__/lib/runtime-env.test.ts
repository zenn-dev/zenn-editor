import { afterEach, describe, expect, test } from 'vitest';
import { runtimeEnv } from '../../lib/runtime-env';

describe('runtimeEnv', () => {
  afterEach(() => {
    delete process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API;
  });

  test('モジュール読込後に設定された環境変数を返す', () => {
    process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API = 'true';

    expect(runtimeEnv('ZENN_CLI_EXPERIMENTAL_SCRAP_API')).toBe('true');
  });
});
