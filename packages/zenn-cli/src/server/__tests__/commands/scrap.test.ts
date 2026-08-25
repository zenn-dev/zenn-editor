import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { exec } from '../../commands/scrap';

describe('scrapコマンド', () => {
  let directory: string;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'zenn-scrap-test-'));
    process.env.ZENN_API_KEY = 'test-api-key';
    process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API = 'true';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    delete process.env.ZENN_API_KEY;
    delete process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    await rm(directory, { recursive: true, force: true });
  });

  async function bodyFile(body: string) {
    const file = path.join(directory, 'body.md');
    await writeFile(file, body);
    return file;
  }

  test('createはSecretlint後に単一のAPIリクエストを送信する', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          scrap: { slug: 'abcdef123456', path: '/me/scraps/abcdef123456' },
        }),
        { status: 201 }
      )
    );
    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile('通常の本文'),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      title: 'タイトル',
      body_markdown: '通常の本文',
      unlisted: false,
    });
  });

  test('postは返信先を送信し、machine-readableではURLだけを出力する', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ comment: { path: '/link/comments/comment123456' } }),
        {
          status: 201,
        }
      )
    );
    await exec([
      'post',
      'abcdef123456',
      '--file',
      await bodyFile('通常の本文'),
      '--reply-to',
      'comment123456',
      '--machine-readable',
    ]);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      body_markdown: '通常の本文',
      parent_comment_slug: 'comment123456',
    });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      'https://zenn.dev/link/comments/comment123456'
    );
  });

  test('空本文・不正な投稿先・キー未設定ではAPIを呼ばない', async () => {
    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile('   '),
    ]);
    await exec([
      'post',
      'https://example.com/me/scraps/abcdef123456',
      '--file',
      await bodyFile('本文'),
    ]);
    delete process.env.ZENN_API_KEY;
    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile('本文'),
    ]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('Secretlint検出時は本文・検出値を出力せずAPIを呼ばない', async () => {
    const secret = `ghp_${'abcdefghijklmnopqrstuvwxyz1234567890'}`;
    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile(secret),
    ]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('本文にシークレットの可能性')
    );
    expect(JSON.stringify((console.error as any).mock.calls)).not.toContain(
      secret
    );
  });

  test('実験的機能が無効ならSecretlintもAPI通信も実行しない', async () => {
    delete process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API;

    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile('通常の本文'),
    ]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('実験的機能')
    );
  });
});
