import { exec } from '../../commands/index';
import * as Log from '../../lib/log';
import { commandListText } from '../../lib/messages';
import * as notify from '../../lib/notify-update';

describe('Testing the default behavior of the CLI', () => {
  let notifyNeedUpdateCLIMock: jest.SpyInstance<Promise<void>>;

  beforeEach(() => {
    // mock
    console.log = jest.fn();
    jest.spyOn(Log, 'error').mockImplementation();
    notifyNeedUpdateCLIMock = jest
      .spyOn(notify, 'notifyNeedUpdateCLI')
      .mockResolvedValue();
  });

  test('should display an error message, if an invalid command be specified', () => {
    exec('not-exist-args', []);
    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining('該当するCLIコマンドが存在しません')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(commandListText)
    );
  });

  test('should be executed notifyNeedUpdateCLI(), if canNotifyUpdate option is enabled', () => {
    exec('not-exist-args', [], { canNotifyUpdate: true });
    expect(notifyNeedUpdateCLIMock).toBeCalled();
  });
});
