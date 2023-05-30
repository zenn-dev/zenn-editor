import { exec } from '../../commands/index';
import * as Log from '../../lib/log';
import { commandListText } from '../../lib/messages';
import * as notify from '../../lib/notify-update';

describe('CLIのデフォルトの挙動のテスト', () => {
  let notifyNeedUpdateCLIMock: jest.SpyInstance<Promise<void>>;

  beforeEach(() => {
    // mock
    console.log = jest.fn();
    jest.spyOn(Log, 'error').mockImplementation();
    notifyNeedUpdateCLIMock = jest
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
