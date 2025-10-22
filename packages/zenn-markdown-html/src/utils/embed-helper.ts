import { MarkdownOptions } from '../types';
import { embedKeys, EmbedServerType, EmbedType } from '../embed';
import { isTweetUrl, isGithubUrl, isYoutubeUrl } from './url-matcher';

/** 渡された文字列をサニタイズする */
export function sanitizeEmbedToken(str: string): string {
  return str.replace(/"/g, '%22');
}

/** `EmbedType`か判定する */
export function isEmbedType(type: unknown): type is EmbedType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return embedKeys.includes(type as any);
}

/** 渡された埋め込みURLまたはTokenを検証する */
export const validateEmbedToken = (
  str: string,
  type?: EmbedType
): { isValid: boolean; message: string } => {
  /** 検証から除外する埋め込みの種別 */
  const ignoredEmbedType: EmbedType[] = ['card', 'github'];
  /** 埋め込みURLまたはTokenの最大文字数( excludeEmbedTypeは除く ) */
  const MAX_EMBED_TOKEN_LENGTH = 300;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (ignoredEmbedType.includes(type as any)) {
    return { isValid: true, message: '' };
  }

  if (str.length > MAX_EMBED_TOKEN_LENGTH) {
    return {
      isValid: false,
      message: `埋め込みURLは${MAX_EMBED_TOKEN_LENGTH}文字以内にする必要があります`,
    };
  }

  return { isValid: true, message: '' };
};

/** Embedサーバーを使った埋め込み要素の文字列を生成する */
export function generateEmbedServerIframe(
  type: EmbedServerType,
  src: string,
  embedOrigin: string
): string {
  const origin = (() => {
    try {
      return new URL(embedOrigin).origin;
    } catch {
      return void 0;
    }
  })();

  // 埋め込みサーバーの origin が設定されてなければ空文字列を返す
  if (!origin) {
    console.warn('The embedOrigin option not set');
    return '';
  }

  // ユーザーからの入力値が引数として渡されたときのために念のためencodeする
  const encodedType = encodeURIComponent(type);
  const encodedSrc = encodeURIComponent(src);
  const id = `zenn-embedded__${Math.random().toString(16).slice(2)}`;
  const iframeSrc = `${origin}/${encodedType}#${id}`;

  return `<span class="embed-block zenn-embedded zenn-embedded-${encodedType}"><iframe id="${id}" src="${iframeSrc}" data-content="${encodedSrc}" frameborder="0" scrolling="no" loading="lazy"></iframe></span>`;
}

/** 渡された`type`の埋め込み要素のHTML文字列を返す */
export const generateEmbedHTML = (
  type: EmbedType,
  str: string,
  options?: MarkdownOptions
): string => {
  const { isValid, message } = validateEmbedToken(str, type);
  const generator = options?.customEmbed?.[type];

  return isValid ? generator?.(str, options) || str : message;
};

/** Linkifyな埋め込み要素のHTML生成する */
export const generateLinkifyEmbedHTML = (
  url: string,
  options?: MarkdownOptions
): string => {
  const { isValid, message: msg } = validateEmbedToken(url);
  const generators = options?.customEmbed;

  if (!generators) return url;

  if (isTweetUrl(url))
    return isValid ? generators.tweet?.(url, options) || url : msg;

  if (isYoutubeUrl(url))
    return isValid ? generators.youtube?.(url, options) || url : msg;

  // GitHub は URL が長くなりやすいためバリデーション(`validateEmbedToken`)から外す
  if (isGithubUrl(url)) return generators.github?.(url, options) || url;

  return generators.card?.(url, options) || url;
};
