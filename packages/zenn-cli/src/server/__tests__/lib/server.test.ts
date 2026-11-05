import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import type { Server as HttpServer } from 'http';
import type { AddressInfo } from 'net';
import { DEFAULT_HOSTNAME, startServer } from '../../lib/server';

describe('startServer() のテスト', () => {
  let server: HttpServer | undefined;

  beforeEach(() => {
    console.log = vi.fn();
  });

  afterEach(async () => {
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
});
