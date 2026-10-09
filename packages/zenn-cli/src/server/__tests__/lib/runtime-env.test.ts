import { afterEach, describe, expect, test } from 'vitest';
import { runtimeEnv } from '../../lib/runtime-env';

describe('runtimeEnv', () => {
  afterEach(() => {
    delete process.env.ZENN_CLI_RUNTIME_ENV_TEST;
  });

  test('モジュール読込後に設定された環境変数を返す', () => {
    process.env.ZENN_CLI_RUNTIME_ENV_TEST = 'true';

    expect(runtimeEnv('ZENN_CLI_RUNTIME_ENV_TEST')).toBe('true');
  });
});
