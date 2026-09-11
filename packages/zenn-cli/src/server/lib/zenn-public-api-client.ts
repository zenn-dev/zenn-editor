import { runtimeEnv } from './runtime-env';

const DEFAULT_BASE_URL = 'https://zenn.dev';
const REQUEST_TIMEOUT_MS = 15_000;

type ErrorPayload = { error?: { code?: unknown } };
type ScrapResponse = { scrap?: { slug?: unknown; path?: unknown } };
type CommentResponse = { comment?: { path?: unknown } };
type ImageResponse = { image_url?: unknown };
type ObjectResponse = Record<string, unknown>;

export type CreateScrapInput = {
  title: string;
  bodyMarkdown: string;
  closed?: boolean;
  archived?: boolean;
  canOthersPost?: boolean;
  unlisted?: boolean;
  topicNames?: string[];
};

export type UpdateScrapInput = Partial<Omit<CreateScrapInput, 'bodyMarkdown'>>;

export type CreateScrapCommentInput = {
  scrapSlug: string;
  bodyMarkdown: string;
  parentCommentSlug?: string;
};

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
      return '必要なscrap:read、scrap:write、image:writeスコープ、または対象リソースの操作条件を確認してください';
    case 'not-found':
      return 'この環境またはアカウントではPublic APIを利用できないか、対象Scrapを利用できません';
    case 'validation':
      return 'リクエスト値または画像ファイルを確認してください';
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
  if (status === 400) return 'validation' as const;
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

async function request<T extends ObjectResponse | undefined>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  resourcePath: string,
  options: {
    body?: object | FormData;
    expectedStatus: number;
    resultUnknownOnFailure: boolean;
    expectsJson?: boolean;
  }
) {
  const url = publicApiUrl(resourcePath);
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      ...(options.body
        ? {
            body:
              options.body instanceof FormData
                ? options.body
                : JSON.stringify(options.body),
          }
        : {}),
    });
  } catch {
    throw new PublicApiClientError(
      options.resultUnknownOnFailure ? 'unknown-result' : 'network'
    );
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
  if (response.status !== options.expectedStatus) {
    throw new PublicApiClientError('compatibility');
  }
  if (options.expectsJson === false) return undefined as T;
  if (!isObject(json)) throw new PublicApiClientError('compatibility');
  return json as T;
}

async function get<T extends ObjectResponse>(resourcePath: string) {
  return request<T>('GET', resourcePath, {
    expectedStatus: 200,
    resultUnknownOnFailure: false,
  });
}

async function post<T extends ObjectResponse>(
  resourcePath: string,
  body: object
) {
  return request<T>('POST', resourcePath, {
    body,
    expectedStatus: 201,
    resultUnknownOnFailure: true,
  });
}

async function patch<T extends ObjectResponse>(
  resourcePath: string,
  body: object
) {
  return request<T>('PATCH', resourcePath, {
    body,
    expectedStatus: 200,
    resultUnknownOnFailure: true,
  });
}

async function remove(resourcePath: string) {
  await request<undefined>('DELETE', resourcePath, {
    expectedStatus: 204,
    resultUnknownOnFailure: true,
    expectsJson: false,
  });
}

async function postForm<T extends ObjectResponse>(
  resourcePath: string,
  body: FormData
) {
  return request<T>('POST', resourcePath, {
    body,
    expectedStatus: 201,
    resultUnknownOnFailure: true,
  });
}

function isObject(value: unknown): value is ObjectResponse {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredArray(response: ObjectResponse, name: string) {
  if (!Array.isArray(response[name])) {
    throw new PublicApiClientError('compatibility');
  }
}

function requiredObject(response: ObjectResponse, name: string) {
  if (!isObject(response[name])) {
    throw new PublicApiClientError('compatibility');
  }
}

function requiredNextPage(response: ObjectResponse) {
  const value = response.next_page;
  if (
    value !== null &&
    (typeof value !== 'number' || !Number.isInteger(value))
  ) {
    throw new PublicApiClientError('compatibility');
  }
}

function paginationQuery(page?: number, count?: number) {
  const query = new URLSearchParams();
  if (page !== undefined) query.set('page', String(page));
  if (count !== undefined) query.set('count', String(count));
  const value = query.toString();
  return value ? `?${value}` : '';
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

function requiredImageUrl(value: unknown) {
  if (typeof value !== 'string') {
    throw new PublicApiClientError('compatibility');
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new PublicApiClientError('compatibility');
  }
  const isLocalHttp = url.protocol === 'http:' && url.hostname === 'localhost';
  if (
    (url.protocol !== 'https:' && !isLocalHttp) ||
    url.username ||
    url.password
  ) {
    throw new PublicApiClientError('compatibility');
  }
  return url.toString();
}

export async function createScrap(input: CreateScrapInput) {
  const body = {
    title: input.title,
    body_markdown: input.bodyMarkdown,
    ...(input.closed === undefined ? {} : { closed: input.closed }),
    ...(input.archived === undefined ? {} : { archived: input.archived }),
    ...(input.canOthersPost === undefined
      ? {}
      : { can_others_post: input.canOthersPost }),
    ...(input.unlisted === undefined ? {} : { unlisted: input.unlisted }),
    ...(input.topicNames === undefined
      ? {}
      : { topic_names: input.topicNames }),
  };
  const json = (await post('/scraps', body)) as ScrapResponse;
  if (typeof json.scrap?.slug !== 'string') {
    throw new PublicApiClientError('compatibility');
  }
  return { url: requiredPath(json.scrap.path) };
}

export async function postScrapComment(input: CreateScrapCommentInput) {
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

export async function listMyScraps(page?: number, count?: number) {
  const json = await get<ObjectResponse>(
    `/scraps${paginationQuery(page, count)}`
  );
  requiredArray(json, 'scraps');
  requiredNextPage(json);
  return json;
}

export async function getScrap(
  scrapSlug: string,
  page?: number,
  count?: number
) {
  const json = await get<ObjectResponse>(
    `/scraps/${encodeURIComponent(scrapSlug)}${paginationQuery(page, count)}`
  );
  requiredObject(json, 'scrap');
  requiredArray(json, 'comments');
  requiredNextPage(json);
  return json;
}

export async function updateScrap(scrapSlug: string, input: UpdateScrapInput) {
  const body = {
    ...(input.title === undefined ? {} : { title: input.title }),
    ...(input.closed === undefined ? {} : { closed: input.closed }),
    ...(input.archived === undefined ? {} : { archived: input.archived }),
    ...(input.canOthersPost === undefined
      ? {}
      : { can_others_post: input.canOthersPost }),
    ...(input.unlisted === undefined ? {} : { unlisted: input.unlisted }),
    ...(input.topicNames === undefined
      ? {}
      : { topic_names: input.topicNames }),
  };
  if (!Object.keys(body).length) {
    throw new PublicApiClientError(
      'configuration',
      undefined,
      '更新する項目を指定してください'
    );
  }
  const json = await patch<ObjectResponse>(
    `/scraps/${encodeURIComponent(scrapSlug)}`,
    body
  );
  requiredObject(json, 'scrap');
  return json;
}

export async function getScrapComments(slugs: string[]) {
  if (
    slugs.length < 1 ||
    slugs.length > 100 ||
    slugs.some((slug) => !slug.trim())
  ) {
    throw new PublicApiClientError(
      'configuration',
      undefined,
      'コメントslugを1件以上100件以下指定してください'
    );
  }
  const query = new URLSearchParams();
  slugs.forEach((slug) => query.append('slugs[]', slug));
  const json = await get<ObjectResponse>(`/comments?${query.toString()}`);
  requiredArray(json, 'comments');
  requiredArray(json, 'not_found_slugs');
  return json;
}

export async function updateScrapComment(input: {
  scrapSlug: string;
  commentSlug: string;
  bodyMarkdown: string;
}) {
  const json = await patch<ObjectResponse>(
    `/scraps/${encodeURIComponent(input.scrapSlug)}/comments/${encodeURIComponent(input.commentSlug)}`,
    { body_markdown: input.bodyMarkdown }
  );
  requiredObject(json, 'comment');
  return json;
}

export async function deleteScrap(scrapSlug: string) {
  await remove(`/scraps/${encodeURIComponent(scrapSlug)}`);
}

export async function deleteScrapComment(input: {
  scrapSlug: string;
  commentSlug: string;
}) {
  await remove(
    `/scraps/${encodeURIComponent(input.scrapSlug)}/comments/${encodeURIComponent(input.commentSlug)}`
  );
}

export async function uploadImage(input: {
  bytes: Uint8Array;
  filename: string;
  contentType: string;
}) {
  const form = new FormData();
  const bytes = new Uint8Array(input.bytes.byteLength);
  bytes.set(input.bytes);
  form.append(
    'file',
    new Blob([bytes.buffer], { type: input.contentType }),
    input.filename
  );
  const json = (await postForm('/images', form)) as ImageResponse;
  return { url: requiredImageUrl(json.image_url) };
}
