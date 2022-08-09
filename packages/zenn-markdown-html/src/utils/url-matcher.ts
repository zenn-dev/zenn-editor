// Thanks: https://github.com/forem/forem/blob/d2d9984f28b1d0662f2a858b325a0e6b7a27a24c/app/liquid_tags/gist_tag.rb

export function isGistUrl(url: string): boolean {
  return /^https:\/\/gist\.github\.com\/([a-zA-Z0-9](-?[a-zA-Z0-9]){0,38})\/([a-zA-Z0-9]){1,32}(\/[a-zA-Z0-9]+)?(\?file=.+)?$/.test(
    url
  );
}

export function isTweetUrl(url: string): boolean {
  return /^https:\/\/twitter\.com\/[a-zA-Z0-9_-]+\/status\/[a-zA-Z0-9?=&\-_]+$/.test(
    url
  );
}

export function isStackblitzUrl(url: string): boolean {
  return /^https:\/\/stackblitz\.com\/[a-zA-Z0-9\-_/.@?&=%]+$/.test(url);
}

export function isCodesandboxUrl(url: string): boolean {
  return /^https:\/\/codesandbox\.io\/embed\/[a-zA-Z0-9\-_/.@?&=%,]+$/.test(
    url
  );
}

export function isCodepenUrl(url: string): boolean {
  return /^https:\/\/codepen\.io\/[a-zA-Z0-9]/.test(url);
}

export function isJsfiddleUrl(url: string): boolean {
  return /^(http|https):\/\/jsfiddle\.net\/[a-zA-Z0-9_,/-]+$/.test(url);
}

const youtubeRegexp =
  /^(http(s?):\/\/)?(www\.)?youtu(be)?\.([a-z])+\/(watch(.*?)([?&])v=)?(.*?)(&(.)*)?$/;

export function extractYoutubeVideoParameters(
  youtubeUrl: string
): { videoId: string; start?: string } | undefined {
  const match = youtubeUrl.match(youtubeRegexp);
  if (match && match[9].length == 11) {
    const urlParams = new URLSearchParams(youtubeUrl);
    const start = urlParams.get('t');
    return {
      videoId: match[9],
      start: start?.replace('s', ''), // https://www.youtube.com/watch?v=ABCSDGG&t=19101s => 19101
    };
  } else {
    return undefined;
  }
}

export function isYoutubeUrl(url: string): boolean {
  return youtubeRegexp.test(url);
}
