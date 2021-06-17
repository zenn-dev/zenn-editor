import { exec } from '../../commands/index';
import * as Log from '../../lib/log';
import { commandListText } from '../../lib/messages';

describe('cli exec index', () => {
  beforeEach(() => {
    // mock
    console.log = jest.fn();
    jest.spyOn(process, 'exit').mockImplementation();
    jest.spyOn(Log, 'error').mockImplementation();
  });

  test('should exit with error message when the command not found', () => {
    exec('not-exist-args', []);
    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining('該当するCLIコマンドが存在しません')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(commandListText)
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
