import { vi, describe, test, expect, beforeEach } from 'vitest';
import type { Server as HttpServer } from 'http';
import { exec } from '../../commands/preview';
import { previewHelpText } from '../../lib/messages';
import * as server from '../../lib/server';

describe('preview コマンドのテスト', () => {
  let mockReturnServer: HttpServer;

  beforeEach(() => {
    console.log = vi.fn();
    mockReturnServer = {} as HttpServer;
    vi.spyOn(server, 'startServer').mockResolvedValue(mockReturnServer);
    vi.spyOn(server, 'startLocalChangesWatcher').mockReturnValue(undefined);
  });

  test('--help オプションを渡すとヘルプメッセージを表示する', async () => {
    await exec(['--help']);
    expect(console.log).toHaveBeenCalledWith(previewHelpText);
  });

  test('8000 ポートでサーバーを起動する', async () => {
    await exec([]);
    expect(server.startServer).toHaveBeenCalledWith({
      port: 8000,
      app: expect.anything(),
      shouldOpen: expect.anything(),
    });
  });

  test('--port オプションで特定のポートを指定してサーバーを起動できる', async () => {
    await exec(['--port', '8001']);
    expect(server.startServer).toHaveBeenCalledWith({
      port: 8001,
      app: expect.anything(),
      shouldOpen: expect.anything(),
    });
  });

  test('デフォルトではサーバー起動時にブラウザを開かない', async () => {
    await exec([]);
    expect(server.startServer).toHaveBeenCalledWith({
      port: expect.anything(),
      app: expect.anything(),
      shouldOpen: false,
    });
  });

  test('--open オプションを渡すとブラウザを開く', async () => {
    await exec(['--open']);
    expect(server.startServer).toHaveBeenCalledWith({
      port: expect.anything(),
      app: expect.anything(),
      shouldOpen: true,
    });
  });

  test('--host オプションで hostname を指定してサーバーを起動できる', async () => {
    await exec(['--host', '0.0.0.0']);
    expect(server.startServer).toHaveBeenCalledWith({
      hostname: '0.0.0.0',
      app: expect.anything(),
      port: expect.anything(),
      shouldOpen: expect.anything(),
    });
  });

  test('デフォルトでは startLocalChangesWatcher を実行する', async () => {
    await exec([]);
    expect(server.startLocalChangesWatcher).toHaveBeenCalledWith(
      mockReturnServer,
      [
        `${process.cwd()}/articles`,
        `${process.cwd()}/books`,
      ]
    );
  });

  test('--no-watch オプションを渡した場合は startLocalChangesWatcher を実行しない', async () => {
    await exec(['--no-watch']);
    expect(server.startLocalChangesWatcher).toHaveBeenCalledTimes(0);
  });
});
