import { vi, describe, test, expect, beforeEach, SpyInstance } from 'vitest';
import * as Log from '../../lib/log';
import colors from 'colors/safe';

describe('Log のテスト', () => {
  beforeEach(() => {
    // mock
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  test('エラーメッセージを表示する', () => {
    Log.error('message');
    expect(console.error).toHaveBeenCalledWith(colors.red('error:'), 'message');
  });

  test('警告メッセージを表示する', () => {
    Log.warn('message');
    expect(console.warn).toHaveBeenCalledWith(
      colors.yellow('warn:'),
      'message'
    );
  });

  test('成功メッセージを表示する', () => {
    Log.success('message');
    expect(console.log).toHaveBeenCalledWith(
      colors.green('success:'),
      'message'
    );
  });

  test('作成成功メッセージを表示する', () => {
    Log.created('filename');
    expect(console.log).toHaveBeenCalledWith(
      'created:',
      colors.green('filename')
    );
  });
});
