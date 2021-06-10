import { escapeHtml } from 'markdown-it/lib/common/utils';
import { extractYoutubeVideoParameters } from './url-matcher';
import Token from 'markdown-it/lib/token';

export function generateTweetHtml(url: string) {
  return `<div class="embed-tweet"><embed-tweet src="${url}"></embed-tweet></div>`;
}

export function generateCardHtml(url: string) {
  return `<div class="embed-zenn-link"><iframe src="https://card.zenn.dev/?url=${encodeURIComponent(
    url
  )}" frameborder="0" scrolling="no" loading="lazy"></iframe></div>`;
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
    return generateCardHtml(url);
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

export function extractFenceInfo(
  tokens: Token[],
  idx: number
): { langName: string; fileName: string | null; content: string } {
  // e.g. info = "js:fooBar.js"
  const langInfo = tokens[idx].info.split(/:/);
  // e.g. diff js => diff-js, js diff => js-diff js => js
  const langName = langInfo?.length
    ? langInfo[0]
        .split(' ')
        .filter((lang) => !!lang)
        .join('-')
    : '';
  const fileName = langName.length && langInfo[1] ? langInfo[1] : null; // e.g "fooBar.js"

  const content = tokens[idx].content?.trim() || '';

  return {
    langName,
    fileName,
    content,
  };
}
