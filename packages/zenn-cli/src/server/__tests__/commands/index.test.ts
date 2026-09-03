import {
  vi,
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  SpyInstance,
} from 'vitest';
import { exec } from '../../commands/index';
import * as Log from '../../lib/log';
import { commandListText } from '../../lib/messages';
import * as notify from '../../lib/notify-update';

describe('CLIのデフォルトの挙動のテスト', () => {
  let notifyNeedUpdateCLIMock: SpyInstance<any[], Promise<void>>;

  beforeEach(() => {
    process.exitCode = undefined;
    delete process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API;
    // mock
    console.log = vi.fn();
    console.error = vi.fn();
    vi.spyOn(Log, 'error');
    notifyNeedUpdateCLIMock = vi
      .spyOn(notify, 'notifyNeedUpdateCLI')
      .mockResolvedValue();
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  test('存在しないコマンドが指定された場合はエラーメッセージを表示する', () => {
    exec('not-exist-args', []);
    expect(process.exitCode).toBe(1);
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

  test('実験的機能が無効ならscrapコマンドを登録しない', async () => {
    await exec('scrap', []);

    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining('該当するCLIコマンドが存在しません')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.not.stringContaining('zenn scrap')
    );
  });

  test('実験的機能が有効ならscrapコマンドを登録する', async () => {
    process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API = 'true';

    await exec('scrap', ['--help']);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('zenn scrap')
    );
  });
});
