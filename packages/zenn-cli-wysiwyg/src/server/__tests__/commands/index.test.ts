import { vi, describe, test, expect, beforeEach, SpyInstance } from 'vitest';
import { exec } from '../../commands/index';
import * as Log from '../../lib/log';
import { commandListText } from '../../lib/messages';
import * as notify from '../../lib/notify-update';

describe('CLIのデフォルトの挙動のテスト', () => {
  let notifyNeedUpdateCLIMock: SpyInstance<any[], Promise<void>>;

  beforeEach(() => {
    // mock
    console.log = vi.fn();
    console.error = vi.fn();
    vi.spyOn(Log, 'error');
    notifyNeedUpdateCLIMock = vi
      .spyOn(notify, 'notifyNeedUpdateCLI')
      .mockResolvedValue();
  });

  test('存在しないコマンドが指定された場合はエラーメッセージを表示する', () => {
    exec('not-exist-args', []);
    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining('該当するCLIコマンドが存在しません')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(commandListText)
    );
  });

  test('canNotifyUpdateオプションが有効ならnotifyNeedUpdateCLI()を実行する', () => {
    exec('not-exist-args', [], { canNotifyUpdate: true });
    expect(notifyNeedUpdateCLIMock).toBeCalled();
  });
});
