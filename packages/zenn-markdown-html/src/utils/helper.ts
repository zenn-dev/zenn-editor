import { escapeHtml } from 'markdown-it/lib/common/utils';

export function generateTweetHtml(url: string) {
  return `<div class="embed-tweet"><embed-tweet src="${url}"></embed-tweet></div>`;
}

export function generateCardHtml(url: string) {
  return `<div class="embed-zenn-link"><iframe src="https://asia-northeast1-zenn-dev-production.cloudfunctions.net/iframeLinkCard?url=${encodeURIComponent(
    url
  )}" frameborder="0" scrolling="no" loading="lazy"></iframe></div>`;
}

export function generateYoutubeHtml(videoId: string) {
  const escapedVideoId = escapeHtml(videoId);
  return `<div class="embed-youtube"><iframe src="https://www.youtube.com/embed/${escapedVideoId}?loop=1&playlist=${escapedVideoId}" allowfullscreen loading="lazy"></iframe></div>`;
}

export function isValidHttpUrl(str: string) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
