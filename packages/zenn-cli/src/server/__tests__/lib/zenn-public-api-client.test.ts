import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  createScrap,
  getScrap,
  getScrapComments,
  listMyScraps,
  postScrapComment,
  PublicApiClientError,
  updateScrap,
  updateScrapComment,
} from '../../lib/zenn-public-api-client';

describe('Zenn Public API client', () => {
  afterEach(() => {
    delete process.env.ZENN_API_KEY;
    delete process.env.ZENN_API_BASE_URL;
    vi.unstubAllGlobals();
  });

  test('作成を本文を含む一度のPOSTで送信する', async () => {
    process.env.ZENN_API_KEY = 'test-api-key';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          scrap: { slug: 'abcdef123456', path: '/me/scraps/abcdef123456' },
        }),
        { status: 201 }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createScrap({ title: 'タイトル', bodyMarkdown: '本文', unlisted: false })
    ).resolves.toEqual({ url: 'https://zenn.dev/me/scraps/abcdef123456' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe('https://zenn.dev/api/public-api/v1/scraps');
    expect(options).toMatchObject({ method: 'POST', redirect: 'error' });
    expect(JSON.parse(options.body)).toEqual({
      title: 'タイトル',
      body_markdown: '本文',
      unlisted: false,
    });
    expect(options.headers.Authorization).toMatch(/^Bearer /);
  });

  test('返信をparent_comment_slug付きで送信する', async () => {
    process.env.ZENN_API_KEY = 'test-api-key';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ comment: { path: '/link/comments/comment123456' } }),
        {
          status: 201,
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    await postScrapComment({
      scrapSlug: 'abcdef123456',
      bodyMarkdown: '返信',
      parentCommentSlug: 'comment123456',
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe(
      'https://zenn.dev/api/public-api/v1/scraps/abcdef123456/comments'
    );
    expect(JSON.parse(options.body)).toEqual({
      body_markdown: '返信',
      parent_comment_slug: 'comment123456',
    });
  });

  test('取得・更新用の各endpointをOpenAPIどおりに呼び出す', async () => {
    process.env.ZENN_API_KEY = 'test-api-key';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ scraps: [], next_page: null }), {
          status: 200,
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ scrap: {}, comments: [], next_page: null }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ scrap: {} }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ comments: [], not_found_slugs: ['comment234567'] }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ comment: {} }), { status: 200 })
      );
    vi.stubGlobal('fetch', fetchMock);

    await listMyScraps(2, 10);
    await getScrap('abcdef123456', 3, 20);
    await updateScrap('abcdef123456', {
      title: '更新後のタイトル',
      canOthersPost: false,
      topicNames: [],
    });
    await getScrapComments(['comment123456', 'comment234567']);
    await updateScrapComment({
      scrapSlug: 'abcdef123456',
      commentSlug: 'comment123456',
      bodyMarkdown: '更新後の本文',
    });

    expect(
      fetchMock.mock.calls.map(([url, options]) => [
        url.toString(),
        options.method,
        options.body ? JSON.parse(options.body) : undefined,
      ])
    ).toEqual([
      [
        'https://zenn.dev/api/public-api/v1/scraps?page=2&count=10',
        'GET',
        undefined,
      ],
      [
        'https://zenn.dev/api/public-api/v1/scraps/abcdef123456?page=3&count=20',
        'GET',
        undefined,
      ],
      [
        'https://zenn.dev/api/public-api/v1/scraps/abcdef123456',
        'PATCH',
        {
          title: '更新後のタイトル',
          can_others_post: false,
          topic_names: [],
        },
      ],
      [
        'https://zenn.dev/api/public-api/v1/comments?slugs%5B%5D=comment123456&slugs%5B%5D=comment234567',
        'GET',
        undefined,
      ],
      [
        'https://zenn.dev/api/public-api/v1/scraps/abcdef123456/comments/comment123456',
        'PATCH',
        { body_markdown: '更新後の本文' },
      ],
    ]);
  });

  test.each([
    'http://example.com',
    'https://zenn.dev/public-api',
    'https://user@example.com',
  ])('不正な開発用ベースURLをAPI通信前に拒否する: %s', async (baseUrl) => {
    process.env.ZENN_API_KEY = 'test-api-key';
    process.env.ZENN_API_BASE_URL = baseUrl;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createScrap({ title: 'タイトル', bodyMarkdown: '本文', unlisted: false })
    ).rejects.toMatchObject<Partial<PublicApiClientError>>({
      kind: 'configuration',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('明示したlocalhostのHTTPベースURLだけを許可する', async () => {
    process.env.ZENN_API_KEY = 'test-api-key';
    process.env.ZENN_API_BASE_URL = 'http://localhost:3000';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          scrap: { slug: 'abcdef123456', path: '/me/scraps/abcdef123456' },
        }),
        { status: 201 }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    await createScrap({
      title: 'タイトル',
      bodyMarkdown: '本文',
      unlisted: false,
    });

    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      'http://localhost:3000/public-api/v1/scraps'
    );
  });

  test.each([
    [401, 'invalid_token', 'authentication'],
    [403, 'insufficient_scope', 'authorization'],
    [404, 'not_found', 'not-found'],
    [422, 'validation_error', 'validation'],
    [429, 'rate_limit_exceeded', 'rate-limit'],
    [500, 'internal_error', 'unknown-result'],
  ] as const)('%iを安全なエラーへ変換する', async (status, code, kind) => {
    process.env.ZENN_API_KEY = 'test-api-key';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code, message: 'server detail' } }),
          {
            status,
          }
        )
      )
    );

    await expect(
      createScrap({ title: 'タイトル', bodyMarkdown: '本文', unlisted: false })
    ).rejects.toMatchObject<Partial<PublicApiClientError>>({ kind, code });
  });

  test.each(['タイムアウト', 'リダイレクト拒否'])(
    '%sでは再送しない',
    async () => {
      process.env.ZENN_API_KEY = 'test-api-key';
      const fetchMock = vi
        .fn()
        .mockRejectedValue(new TypeError('fetch failed'));
      vi.stubGlobal('fetch', fetchMock);

      await expect(
        createScrap({
          title: 'タイトル',
          bodyMarkdown: '本文',
          unlisted: false,
        })
      ).rejects.toMatchObject<Partial<PublicApiClientError>>({
        kind: 'unknown-result',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }
  );

  test('取得の通信失敗は再実行可能なnetworkエラーへ変換する', async () => {
    process.env.ZENN_API_KEY = 'test-api-key';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('failed')));

    await expect(listMyScraps()).rejects.toMatchObject<
      Partial<PublicApiClientError>
    >({ kind: 'network' });
  });

  test('成功応答に必須pathがない場合は互換性エラーにする', async () => {
    process.env.ZENN_API_KEY = 'test-api-key';
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ comment: {} }), { status: 201 })
        )
    );

    await expect(
      postScrapComment({ scrapSlug: 'abcdef123456', bodyMarkdown: '本文' })
    ).rejects.toMatchObject<Partial<PublicApiClientError>>({
      kind: 'compatibility',
    });
  });
});
