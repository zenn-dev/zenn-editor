import { escapeHtml } from 'markdown-it/lib/common/utils';
import { extractYoutubeVideoParameters } from './url-matcher';

export function isGithubUrl(url: string): boolean {
  return /^https:\/\/github\.com\/([a-zA-Z0-9](-?[a-zA-Z0-9]){0,38})\/([a-zA-Z0-9](-?[a-zA-Z0-9._]){0,99})\/blob\/[^~\s:?[*^/\\]{2,}\/[\w!\-_~.*%()'"/]+(?:#L\d+(?:-L\d+)?)?$/.test(
    url
  );
}

function generateYoutubeHtml(videoId: string, start?: string) {
  const escapedVideoId = escapeHtml(videoId);

  // 48時間以内
  const time = Math.min(Number(start || 0), 48 * 60 * 60);
  const startQuery = time ? `&start=${time}` : '';
  return `<div class="embed-youtube"><iframe src="https://www.youtube.com/embed/${escapedVideoId}?loop=1&playlist=${escapedVideoId}${startQuery}" allowfullscreen loading="lazy"></iframe></div>`;
}

export function generateYoutubeHtmlFromUrl(url: string) {
  const params = extractYoutubeVideoParameters(url);
  if (!params) {
    return generateEmbedIframe('link-card', url);
  } else {
    return generateYoutubeHtml(params.videoId, params.start);
  }
}

export function generateYoutubeHtmlFromVideoId(videoId: string) {
  return generateYoutubeHtml(videoId);
}

export function isValidHttpUrl(str: string) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

type ZennEmbedTypes = 'tweet' | 'link-card' | 'mermaid' | 'github' | 'gist';

export function generateEmbedIframe(type: ZennEmbedTypes, src: string): string {
  // ユーザーからの入力値が引数として渡されたときのために念のためencodeする
  const encodedType = encodeURIComponent(type);
  const encodedSrc = encodeURIComponent(src);
  const id = `zenn-embedded__${Math.random().toString(16).slice(2)}`;
  const iframeSrc = `https://embed.zenn.studio/${encodedType}#${id}`;

  return `<div class="zenn-embedded zenn-embedded-${encodedType}"><iframe id="${id}" src="${iframeSrc}" data-content="${encodedSrc}" frameborder="0" scrolling="no" loading="lazy"></iframe></div>`;
}
