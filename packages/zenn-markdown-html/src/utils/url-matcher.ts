/** URL文字列か判定する */
export function isValidHttpUrl(str: string) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export function isGithubUrl(url: string): boolean {
  return /^https:\/\/github\.com\/([a-zA-Z0-9](-?[a-zA-Z0-9]){0,38})\/([a-zA-Z0-9](-?[a-zA-Z0-9._]){0,99})\/blob\/[^~\s:?[*^/\\]{2,}\/[\w!\-_~.*%()'"/]+(?:#L\d+(?:-L\d+)?)?$/.test(
    url
  );
}

// Thanks: https://github.com/forem/forem/blob/d2d9984f28b1d0662f2a858b325a0e6b7a27a24c/app/liquid_tags/gist_tag.rb
export function isGistUrl(url: string): boolean {
  return /^https:\/\/gist\.github\.com\/([a-zA-Z0-9](-?[a-zA-Z0-9]){0,38})\/([a-zA-Z0-9]){1,32}(\/[a-zA-Z0-9]+)?(\?file=.+)?$/.test(
    url
  );
}

export function isTweetUrl(url: string): boolean {
  return /^https:\/\/(twitter|x)\.com\/[a-zA-Z0-9_-]+\/status\/[a-zA-Z0-9?=&\-_]+$/.test(
    url
  );
}

export function isStackblitzUrl(url: string): boolean {
  return /^https:\/\/stackblitz\.com\/[a-zA-Z0-9\-_/.@?&=%[\]]+$/.test(url);
}

export function isCodesandboxUrl(url: string): boolean {
  return /^https:\/\/codesandbox\.io\/embed\/[a-zA-Z0-9\-_/.@?&=%,]+$/.test(
    url
  );
}

export function isCodepenUrl(url: string): boolean {
  return /^https:\/\/codepen\.io\/[a-zA-Z0-9\-_/@]+\/pen\/[a-zA-Z0-9\-_/.@?&=%,]+$/.test(
    url
  );
}

export function isJsfiddleUrl(url: string): boolean {
  return /^(http|https):\/\/jsfiddle\.net\/[a-zA-Z0-9_,/-]+$/.test(url);
}

export function isYoutubeUrl(url: string): boolean {
  return [
    /^https?:\/\/youtu\.be\/[\w-]+(?:\?[\w=&-]+)?$/,
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?[\w=&-]+$/,
  ].some((pattern) => pattern.test(url));
}

/** YoutubeのVideoIdの文字列の長さ */
const YOUTUBE_VIDEO_ID_LENGTH = 11;

/**
 * youtube の URL から videoId と開始位置の秒数を取得する
 */
export function extractYoutubeVideoParameters(
  youtubeUrl: string
): { videoId: string; start?: string } | undefined {
  if (!isYoutubeUrl(youtubeUrl)) return void 0;

  const url = new URL(youtubeUrl);
  const params = new URLSearchParams(url.search || '');

  // https://youtu.be/Hoge の "HogeHoge" の部分または、
  // https://www.youtube.com/watch?v=Hoge の "Hoge" の部分を値とする
  const videoId = params.get('v') || url.pathname.split('/')[1];

  // https://www.youtube.com/watch?v=Hoge&t=100s の "100" の部分を値とする
  const start = params.get('t')?.replace('s', '');

  if (videoId?.length !== YOUTUBE_VIDEO_ID_LENGTH) return void 0;

  return { videoId, start };
}

/**
 * 参考: https://blueprintue.com/
 * 生成されるURLをもとに正規表現を定義した
 */

export function isBlueprintUEUrl(url: string): boolean {
  return /^https:\/\/blueprintue\.com\/render\/[-\w]+\/?$/.test(url);
}

/**
 * 参考: https://www.figma.com/developers/embed
 */
export function isFigmaUrl(url: string): boolean {
  return /^https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/[\w-?=&%]+)?$/.test(
    url
  );
}
