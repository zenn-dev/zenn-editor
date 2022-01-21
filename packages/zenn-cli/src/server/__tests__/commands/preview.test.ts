import { exec } from '../../commands/preview';
import { previewHelpText } from '../../lib/messages';
import * as server from '../../lib/server';

describe('cli exec preview', () => {
  beforeEach(() => {
    console.log = jest.fn();
    jest.spyOn(server, 'startServer').mockImplementation();
    jest.spyOn(server, 'startLocalChangesWatcher').mockImplementation();
  });

  test('should log help message with --help args', async () => {
    await exec(['--help']);
    expect(console.log).toHaveBeenCalledWith(previewHelpText);
  });

  test('should listen with port 8000', async () => {
    await exec([]);
    expect(server.startServer).toHaveBeenCalledWith({
      port: 8000,
      app: expect.anything(),
      shouldOpen: expect.anything(),
    });
  });

  test('should listen with spcified port', async () => {
    await exec(['--port', '8001']);
    expect(server.startServer).toHaveBeenCalledWith({
      port: 8001,
      app: expect.anything(),
      shouldOpen: expect.anything(),
    });
  });

  test('should not open browser by default', async () => {
    await exec([]);
    expect(server.startServer).toHaveBeenCalledWith({
      port: expect.anything(),
      app: expect.anything(),
      shouldOpen: false,
    });
  });

  test('should open browser if specified', async () => {
    await exec(['--open']);
    expect(server.startServer).toHaveBeenCalledWith({
      port: expect.anything(),
      app: expect.anything(),
      shouldOpen: true,
    });
  });

  test('should call startLocalChangesWatcher by default', async () => {
    await exec([]);
    expect(server.startLocalChangesWatcher).toHaveBeenCalledWith(
      undefined,
      `${process.cwd()}/{articles,books}/**/*`
    );
  });

  test('should not call startLocalChangesWatcher if --no-watch specified', async () => {
    await exec(['--no-watch']);
    expect(server.startLocalChangesWatcher).toHaveBeenCalledTimes(0);
  });
});
