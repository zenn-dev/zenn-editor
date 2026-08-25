import { createReadStream } from 'node:fs';

export const MAX_SCRAP_BODY_BYTES = 1024 * 1024;
const SLUG_PATTERN = /^[a-z0-9_-]{12,50}$/;
const PRODUCTION_ORIGIN = 'https://zenn.dev';

export class ScrapInputError extends Error {}

export function parseCommentSlug(value: string | undefined) {
  if (!value || !SLUG_PATTERN.test(value)) {
    throw new ScrapInputError('返信先コメントのslugが不正です');
  }
  return value;
}

async function readStream(stream: AsyncIterable<Buffer | string>) {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > MAX_SCRAP_BODY_BYTES) {
      throw new ScrapInputError('本文は1MB以下にしてください');
    }
    chunks.push(buffer);
  }

  const body = Buffer.concat(chunks).toString('utf8');
  if (!body.trim()) {
    throw new ScrapInputError('本文を入力してください');
  }
  return body;
}

export async function readScrapBody(filePath: string | undefined) {
  if (!filePath) {
    throw new ScrapInputError('--file を指定してください');
  }

  try {
    return await readStream(
      filePath === '-' ? process.stdin : createReadStream(filePath)
    );
  } catch (error) {
    if (error instanceof ScrapInputError) throw error;
    throw new ScrapInputError('本文ファイルを読み込めませんでした');
  }
}

export function parseScrapSlugOrUrl(value: string, developmentOrigin?: string) {
  if (SLUG_PATTERN.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ScrapInputError('ScrapのslugまたはURLが不正です');
  }

  const allowedOrigins = new Set([PRODUCTION_ORIGIN]);
  if (developmentOrigin) allowedOrigins.add(developmentOrigin);
  const match = url.pathname.match(/^\/[^/]+\/scraps\/([a-z0-9_-]{12,50})$/);

  if (
    (url.protocol !== 'https:' && url.protocol !== 'http:') ||
    !allowedOrigins.has(url.origin) ||
    url.username ||
    url.password ||
    !match
  ) {
    throw new ScrapInputError('ZennのScrap URLまたはslugを指定してください');
  }

  return match[1];
}
