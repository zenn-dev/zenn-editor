import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
vi.mock('open', () => ({ default: vi.fn() }));
import open from 'open';
import express from 'express';
import { createServer } from 'http';
import type { Server as HttpServer } from 'http';
import type { AddressInfo } from 'net';
import { startServer } from '../../lib/server';
import { DEFAULT_HOSTNAME } from '../../lib/helper';

/** 空いているポート番号を取得する（表示される URL にポート番号を含めて検証するため） */
const getFreePort = () =>
  new Promise<number>((resolve) => {
    const probe = createServer();
    probe.listen(0, DEFAULT_HOSTNAME, () => {
      const { port } = probe.address() as AddressInfo;
      probe.close(() => resolve(port));
    });
  });

describe('startServer() のテスト', () => {
  let server: HttpServer | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('TS_NODE_DEV', '');
    console.log = vi.fn();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
      server = undefined;
    }
  });

  test('hostname を指定しない場合は 127.0.0.1 だけで待ち受ける', async () => {
    server = await startServer({
      app: express(),
      port: 0,
      shouldOpen: false,
    });

    const { address } = server.address() as AddressInfo;
    expect(DEFAULT_HOSTNAME).toBe('127.0.0.1');
    expect(address).toBe(DEFAULT_HOSTNAME);
  });

  test('hostname が空文字の場合も 127.0.0.1 だけで待ち受ける', async () => {
    server = await startServer({
      app: express(),
      port: 0,
      shouldOpen: false,
      hostname: '',
    });

    const { address } = server.address() as AddressInfo;
    expect(address).toBe(DEFAULT_HOSTNAME);
  });

  test('hostname を指定した場合はそのアドレスで待ち受ける', async () => {
    server = await startServer({
      app: express(),
      port: 0,
      shouldOpen: false,
      hostname: '0.0.0.0',
    });

    const { address } = server.address() as AddressInfo;
    expect(address).toBe('0.0.0.0');
  });

  test('hostname を指定しない場合は 127.0.0.1 の URL を表示し、ブラウザで開く', async () => {
    const port = await getFreePort();
    server = await startServer({
      app: express(),
      port,
      shouldOpen: true,
    });

    const url = `http://127.0.0.1:${port}`;
    expect(console.log).toHaveBeenCalledWith(`👀 Preview: ${url}`);
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining('NetWork')
    );
    expect(open).toHaveBeenCalledWith(url);
  });
});
