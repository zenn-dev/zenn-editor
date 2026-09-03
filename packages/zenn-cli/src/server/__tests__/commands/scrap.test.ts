import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const aiScanMock = vi.hoisted(() => vi.fn());

vi.mock('../../lib/scrap-ai-scan', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../lib/scrap-ai-scan')>();
  return { ...actual, scanScrapContentWithAi: aiScanMock };
});

import { exec } from '../../commands/scrap';
import { ScrapAiDetectedError } from '../../lib/scrap-ai-scan';

const scanEnvironmentNames = [
  'ZENN_CLI_FORCE_SAFE',
  'ZENN_CLI_FORCE_UNLISTED',
  'ZENN_CLI_AI_SCAN',
  'ZENN_CLI_AI_PROVIDER',
  'ZENN_CLI_AI_MODEL',
  'ZENN_CLI_AI_EFFORT',
  'ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD',
  'ZENN_CLI_AI_SCAN_PROMPT',
  'OPENAI_API_KEY',
  'FIREWORKS_API_KEY',
] as const;

describe('scrapコマンド', () => {
  let directory: string;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    process.exitCode = undefined;
    directory = await mkdtemp(path.join(tmpdir(), 'zenn-scrap-test-'));
    process.env.ZENN_API_KEY = 'test-api-key';
    process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API = 'true';
    process.env.ZENN_CLI_AI_SCAN = 'true';
    process.env.ZENN_CLI_AI_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    aiScanMock.mockReset().mockResolvedValue([]);
  });

  afterEach(async () => {
    process.exitCode = undefined;
    delete process.env.ZENN_API_KEY;
    delete process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API;
    scanEnvironmentNames.forEach((name) => delete process.env[name]);
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

  test('updateは変更項目だけをPATCHし、空のtopicsで全解除できる', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ scrap: {} }), { status: 200 })
    );

    await exec([
      'update',
      'abcdef123456',
      '--title',
      '更新後のタイトル',
      '--open',
      '--topics',
      '',
      '--machine-readable',
    ]);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe(
      'https://zenn.dev/api/public-api/v1/scraps/abcdef123456'
    );
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({
      title: '更新後のタイトル',
      closed: false,
      topic_names: [],
    });
    expect(console.log).toHaveBeenLastCalledWith('{"scrap":{}}');
  });

  test('FORCE_UNLISTEDでは--unlistedなしでも限定公開にする', async () => {
    process.env.ZENN_CLI_FORCE_UNLISTED = 'true';
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

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).unlisted).toBe(true);
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

  test('ZENN_API_KEY未設定時はAI scan前に失敗する', async () => {
    delete process.env.ZENN_API_KEY;

    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile('通常の本文'),
    ]);

    expect(aiScanMock).not.toHaveBeenCalled();
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
      expect.stringContaining('シークレットの可能性')
    );
    expect(JSON.stringify((console.error as any).mock.calls)).not.toContain(
      secret
    );
  });

  test('Secretlint検出時はAI scanを実行しない', async () => {
    const secret = `ghp_${'abcdefghijklmnopqrstuvwxyz1234567890'}`;

    await exec([
      'create',
      '--title',
      secret,
      '--file',
      await bodyFile('通常の本文'),
    ]);

    expect(aiScanMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('Secretlint検出時はtopicsをPublic APIやAI scanへ送信しない', async () => {
    const secret = `ghp_${'abcdefghijklmnopqrstuvwxyz1234567890'}`;

    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile('通常の本文'),
      '--topics',
      secret,
    ]);

    expect(aiScanMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.stringify((console.error as any).mock.calls)).not.toContain(
      secret
    );
  });

  test('AI scan実行時はtopicsの外部送信を警告する', async () => {
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
      '--topics',
      'typescript,zenn',
    ]);

    expect(console.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('topics')
    );
    expect(aiScanMock).toHaveBeenCalledWith(
      { title: 'タイトル', body: '通常の本文\ntypescript\nzenn' },
      expect.any(Object),
      undefined
    );
  });

  test('APIエラー時は終了コードを非0にする', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'invalid_token' } }), {
        status: 401,
      })
    );

    await exec(['list', '--machine-readable']);

    expect(process.exitCode).toBe(1);
  });

  test('AI scan検出時はPublic APIを呼ばない', async () => {
    aiScanMock.mockRejectedValue(
      new ScrapAiDetectedError('AIスキャンでhigh以上の検知事項が見つかりました')
    );

    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile('通常の本文'),
    ]);

    expect(aiScanMock).toHaveBeenCalledWith(
      { title: 'タイトル', body: '通常の本文' },
      {
        provider: 'openai',
        model: 'gpt-5.6-luna',
        effort: 'medium',
        failureThreshold: 'high',
      },
      undefined
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('AI scanはopt-inされていなければ実行せず投稿する', async () => {
    delete process.env.ZENN_CLI_AI_SCAN;
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

    expect(aiScanMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('AI scanは無効')
    );
  });

  test('FORCE_SAFEではdangerous skipを入力読込前に拒否する', async () => {
    process.env.ZENN_CLI_FORCE_SAFE = 'true';

    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      path.join(directory, 'missing.md'),
      '--dangerously-skip-ai-scan',
    ]);

    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('スキップできません')
    );
    expect(aiScanMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('FORCE_SAFEではAI scanがopt-inされていなければ入力読込前に拒否する', async () => {
    process.env.ZENN_CLI_FORCE_SAFE = 'true';
    delete process.env.ZENN_CLI_AI_SCAN;

    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      path.join(directory, 'missing.md'),
    ]);

    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('ZENN_CLI_AI_SCAN=true')
    );
    expect(aiScanMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('FORCE_SAFEで両方のscanが成功した場合だけ投稿する', async () => {
    process.env.ZENN_CLI_FORCE_SAFE = 'true';
    process.env.ZENN_CLI_AI_PROVIDER = 'fireworks';
    process.env.ZENN_CLI_AI_MODEL = 'accounts/fireworks/models/kimi-k2p6';
    process.env.ZENN_CLI_AI_EFFORT = 'high';
    process.env.FIREWORKS_API_KEY = 'test-fireworks-key';
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

    expect(aiScanMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('FORCE_SAFEが無効ならdangerous flagで個別にscanをスキップする', async () => {
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
      '--dangerously-skip-secret-scan',
      '--dangerously-skip-ai-scan',
    ]);

    expect(aiScanMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('DANGER')
    );
  });

  test('notesをFORCE_SAFEでもAI scanへ渡せる', async () => {
    process.env.ZENN_CLI_FORCE_SAFE = 'true';
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
      '--notes-to-ai',
      '公開前提のテストです',
    ]);

    expect(aiScanMock).toHaveBeenCalledWith(
      { title: 'タイトル', body: '通常の本文' },
      expect.objectContaining({ failureThreshold: 'high' }),
      '公開前提のテストです'
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('notesのSecretlint検出時はAI scanを実行しない', async () => {
    const secret = `ghp_${'abcdefghijklmnopqrstuvwxyz1234567890'}`;

    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile('通常の本文'),
      '--notes-to-ai',
      secret,
    ]);

    expect(aiScanMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.stringify((console.error as any).mock.calls)).not.toContain(
      secret
    );
  });

  test('custom promptのSecretlint検出時はAI scanを実行しない', async () => {
    const secret = `ghp_${'abcdefghijklmnopqrstuvwxyz1234567890'}`;
    process.env.ZENN_CLI_AI_SCAN_PROMPT = secret;

    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      await bodyFile('通常の本文'),
    ]);

    expect(aiScanMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.stringify((console.error as any).mock.calls)).not.toContain(
      secret
    );
  });

  test('AI scanをスキップする場合はnotesを拒否する', async () => {
    await exec([
      'create',
      '--title',
      'タイトル',
      '--file',
      path.join(directory, 'missing.md'),
      '--dangerously-skip-ai-scan',
      '--notes-to-ai',
      '備考',
    ]);

    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('--notes-to-ai')
    );
    expect(aiScanMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('threshold未満のAI findingは警告して投稿を続行する', async () => {
    aiScanMock.mockResolvedValue([
      {
        finding: '公開情報の確認',
        level: 'medium',
        detail: '公開済みか確認してください',
      },
    ]);
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

    expect(console.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('[medium] 公開情報の確認')
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
