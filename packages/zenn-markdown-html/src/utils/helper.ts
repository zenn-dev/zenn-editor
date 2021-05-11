import { escapeHtml } from 'markdown-it/lib/common/utils';
import { extractYoutubeVideoParameters } from './url-matcher';

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
