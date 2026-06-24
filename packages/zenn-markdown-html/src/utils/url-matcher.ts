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
  return /^https:\/\/codesandbox\.io\/embed\/[a-zA-Z0-9\-_/.@?&=%,+]+$/.test(
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

// 例: https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell
// 例: https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell#p13
// 例: https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell/13
const docswellNormalUrlRegex =
  /^https:\/\/www\.docswell\.com\/s\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\/\d+)?(#p\d+)?$/;

// 例: https://www.docswell.com/slide/LK7J5V/embed
// 例: https://www.docswell.com/slide/LK7J5V/embed#p12
const docswellEmbedUrlRegex =
  /^https:\/\/www\.docswell\.com\/slide\/[a-zA-Z0-9_-]+\/embed(#p\d+)?$/;

export function isDocswellUrl(url: string): boolean {
  return [docswellNormalUrlRegex, docswellEmbedUrlRegex].some((pattern) =>
    pattern.test(url)
  );
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

export function extractDocswellEmbedUrl(url: string): string | null {
  // Embed用URLの場合、そのまま返す
  if (docswellEmbedUrlRegex.test(url)) {
    return url;
  }
  // Embed用URLでない場合 https://www.docswell.com/s/:username/{slideId}-hello-docswell のslideIdを抽出する
  const urlObj = new URL(url); // URLオブジェクトを作成
  const pathSegments = urlObj.pathname.split('/');
  // pathSegmentsの例: ["", "s", "ku-suke", "LK7J5V-hello-docswell", "10"]
  // slideIdは pathSegments[3] の先頭部分
  const slideIdPart = pathSegments.at(3);
  const slideId = slideIdPart?.split('-').at(0);

  if (!slideId) {
    return null;
  }

  let pageSuffix = '';
  // #pXX 形式のページ番号を優先 (例: #p18)
  if (urlObj.hash && /^#p\d+$/.test(urlObj.hash)) {
    pageSuffix = urlObj.hash;
  } else {
    // /XX 形式のページ番号 (例: /28)
    // 通常URLの形式: /s/{username}/{slideId-slug}/{optional_page_num}
    // ページ番号がある場合、pathSegmentsの長さは5になる (e.g., ["", "s", "username", "slide-slug", "page"])
    if (pathSegments.length === 5) {
      const pageCandidate = pathSegments.at(4);
      if (pageCandidate && /^\d+$/.test(pageCandidate)) {
        pageSuffix = `#p${pageCandidate}`;
      }
    }
  }

  return new URL(
    `/slide/${slideId}/embed${pageSuffix}`, // pageSuffixを結合
    'https://www.docswell.com'
  ).toString();
}

/**
 * 参考: https://blueprintue.com/
 * 生成されるURLをもとに正規表現を定義した
 */

export function isBlueprintUEUrl(url: string): boolean {
  return /^https:\/\/blueprintue\.com\/render\/[-\w]+\/?$/.test(url);
}

/**
 * Figma URL バリデーション
 * Embed Kit 2.0 (embed.figma.com) と v1 (www.figma.com) の両方をサポート
 * 参考: https://developers.figma.com/docs/embeds/embed-kit-2.0/
 */
export function isFigmaUrl(url: string): boolean {
  return /^https:\/\/((www|embed)\.)?figma\.com\/(file|proto|design|board|slides|deck)\/([0-9a-zA-Z]{22,128})(?:\/[\w.?=&%-]+)?(?:\?[\w.?=&%-]+)?$/.test(
    url
  );
}

/**
 * Figma URL を Embed Kit 2.0 形式 (embed.figma.com) に変換する
 * - www.figma.com/file/... → embed.figma.com/design/...
 * - www.figma.com/proto/... → embed.figma.com/proto/...
 * - embed.figma.com/... → そのまま
 */
export function convertToFigmaEmbedUrl(url: string): string | null {
  if (!isFigmaUrl(url)) return null;

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // pathParts: [type, fileKey, ...slugParts]
    const [type, fileKey, ...slugParts] = pathParts;

    if (!type || !fileKey) return null;

    // v1 → v2 変換: file → design
    const embedType = type === 'file' ? 'design' : type;

    // embed.figma.com 形式のURLを構築（slug があれば保持する）
    const embedPath = `/${embedType}/${fileKey}${
      slugParts.length ? `/${slugParts.join('/')}` : ''
    }`;
    const embedUrl = new URL(embedPath, 'https://embed.figma.com');

    // 既存のクエリパラメータをコピー
    urlObj.searchParams.forEach((value, key) => {
      embedUrl.searchParams.set(key, value);
    });

    // 旧パラメータ名 (embed_host) があれば削除し、embed-host=zenn を設定
    embedUrl.searchParams.delete('embed_host');
    embedUrl.searchParams.set('embed-host', 'zenn');

    return embedUrl.toString();
  } catch {
    return null;
  }
}
