import { runtimeEnv } from './runtime-env';

const DEFAULT_BASE_URL = 'https://zenn.dev';
const REQUEST_TIMEOUT_MS = 15_000;

type ErrorPayload = { error?: { code?: unknown } };
type ScrapResponse = { scrap?: { slug?: unknown; path?: unknown } };
type CommentResponse = { comment?: { path?: unknown } };

export class PublicApiClientError extends Error {
  constructor(
    public readonly kind:
      | 'configuration'
      | 'authentication'
      | 'authorization'
      | 'not-found'
      | 'validation'
      | 'rate-limit'
      | 'unknown-result'
      | 'network'
      | 'compatibility',
    public readonly code?: string,
    message?: string
  ) {
    super(message ?? messageFor(kind));
  }
}

function messageFor(kind: PublicApiClientError['kind']) {
  switch (kind) {
    case 'configuration':
      return 'ZENN_API_KEY を環境変数に設定してください';
    case 'authentication':
      return 'APIキーの発行状態・期限・アカウント状態を確認してください';
    case 'authorization':
      return 'scrap:write スコープ、またはScrap所有者の他者投稿設定を確認してください';
    case 'not-found':
      return 'この環境またはアカウントではPublic APIを利用できないか、対象Scrapを利用できません';
    case 'validation':
      return 'タイトルまたは本文を修正してください';
    case 'rate-limit':
      return 'レート制限に達しました。しばらく待ってから再実行してください';
    case 'compatibility':
      return 'Public APIの応答形式に互換性がありません';
    case 'unknown-result':
      return 'リクエスト結果を確認できませんでした。重複投稿を避けるため自動再試行していません';
    case 'network':
      return '通信に失敗しました。リクエスト結果が不明なため自動再試行していません';
  }
}

function apiKey() {
  const value = runtimeEnv('ZENN_API_KEY')?.trim();
  if (!value) throw new PublicApiClientError('configuration');
  return value;
}

export function ensurePublicApiCredentials() {
  apiKey();
}

export function publicApiBaseUrl() {
  const configured = runtimeEnv('ZENN_API_BASE_URL')?.trim();
  if (!configured) return new URL(DEFAULT_BASE_URL);

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new PublicApiClientError(
      'configuration',
      undefined,
      'ZENN_API_BASE_URL の値が不正です'
    );
  }

  const isLocalHttp = url.protocol === 'http:' && url.hostname === 'localhost';
  if (
    (url.protocol !== 'https:' && !isLocalHttp) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new PublicApiClientError(
      'configuration',
      undefined,
      'ZENN_API_BASE_URL の値が不正です'
    );
  }
  return url;
}

function errorKind(status: number) {
  if (status === 401) return 'authentication' as const;
  if (status === 403) return 'authorization' as const;
  if (status === 404) return 'not-found' as const;
  if (status === 422) return 'validation' as const;
  if (status === 429) return 'rate-limit' as const;
  if (status >= 500) return 'unknown-result' as const;
  return 'network' as const;
}

async function responseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function publicApiUrl(resourcePath: string) {
  const baseUrl = publicApiBaseUrl();
  const prefix =
    baseUrl.hostname === 'localhost' ? '/public-api/v1' : '/api/public-api/v1';
  return new URL(`${prefix}${resourcePath}`, baseUrl);
}

async function post(resourcePath: string, body: object) {
  const url = publicApiUrl(resourcePath);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new PublicApiClientError('unknown-result');
  }

  const json = await responseJson(response);
  if (!response.ok) {
    const rawCode = (json as ErrorPayload | undefined)?.error?.code;
    const code =
      typeof rawCode === 'string' && /^[a-z0-9_]+$/.test(rawCode)
        ? rawCode
        : undefined;
    throw new PublicApiClientError(errorKind(response.status), code);
  }
  if (response.status !== 201) {
    throw new PublicApiClientError('compatibility');
  }
  return json;
}

function requiredPath(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    throw new PublicApiClientError('compatibility');
  }
  const baseUrl = publicApiBaseUrl();
  const url = new URL(value, baseUrl);
  if (url.origin !== baseUrl.origin) {
    throw new PublicApiClientError('compatibility');
  }
  return url.toString();
}

export async function createScrap(input: {
  title: string;
  bodyMarkdown: string;
  unlisted: boolean;
}) {
  const json = (await post('/scraps', {
    title: input.title,
    body_markdown: input.bodyMarkdown,
    unlisted: input.unlisted,
  })) as ScrapResponse;
  if (typeof json.scrap?.slug !== 'string') {
    throw new PublicApiClientError('compatibility');
  }
  return { url: requiredPath(json.scrap.path) };
}

export async function postScrapComment(input: {
  scrapSlug: string;
  bodyMarkdown: string;
  parentCommentSlug?: string;
}) {
  const body: { body_markdown: string; parent_comment_slug?: string } = {
    body_markdown: input.bodyMarkdown,
  };
  if (input.parentCommentSlug)
    body.parent_comment_slug = input.parentCommentSlug;
  const json = (await post(
    `/scraps/${encodeURIComponent(input.scrapSlug)}/comments`,
    body
  )) as CommentResponse;
  return { url: requiredPath(json.comment?.path) };
}
