import { vi, describe, test, expect, beforeEach } from 'vitest';
import { exec } from '../../commands/version';

describe('version コマンドのテスト', () => {
  console.log = vi.fn();
  beforeEach(() => {
    console.log = vi.fn();
  });

  test('バージョン情報をコンソールに出力する', () => {
    exec([]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/^0\.[0-9.]+/)
    );
  });
});
