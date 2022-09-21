import { escapeHtml } from 'markdown-it/lib/common/utils';
import {
  isGistUrl,
  isTweetUrl,
  isGithubUrl,
  isStackblitzUrl,
  isCodesandboxUrl,
  isCodepenUrl,
  isJsfiddleUrl,
  isBlueprintUEUrl,
  isFigmaUrl,
  isYoutubeUrl,
} from './url-matcher';
import { extractYoutubeVideoParameters } from './url-matcher';

/* 埋め込み要素の種別 */
export type EmbedType =
  | 'youtube'
  | 'slideshare'
  | 'speakerdeck'
  | 'jsfiddle'
  | 'codepen'
  | 'codesandbox'
  | 'stackblitz'
  | 'tweet'
  | 'blueprintue'
  | 'figma'
  | 'card'
  | 'gist'
  | 'github';

/** embedサーバーで表示する埋め込み要素の種別 */
export type ZennEmbedTypes =
  | 'tweet'
  | 'link-card'
  | 'mermaid'
  | 'github'
  | 'gist';

/** 渡された文字列をサニタイズする */
function sanitaizeEmbedToken(str: string): string {
  return str.replace(/"/g, '%22');
}

/** URL文字列か判定する */
function isValidHttpUrl(str: string) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/** `videoId`から Youtube の埋め込み要素の文字列を生成する */
function generateYoutubeHtmlFromVideoId(videoId: string, start?: string) {
  const escapedVideoId = escapeHtml(videoId);
  const time = Math.min(Number(start || 0), 48 * 60 * 60); // 48時間以内
  const startQuery = time ? `&start=${time}` : '';
  return `<div class="embed-youtube"><iframe src="https://www.youtube.com/embed/${escapedVideoId}?loop=1&playlist=${escapedVideoId}${startQuery}" allowfullscreen loading="lazy"></iframe></div>`;
}

/** Youtube の埋め込み要素の文字列を生成する */
function generateYoutubeHtmlFromUrl(url: string) {
  const params = extractYoutubeVideoParameters(url);
  if (!params) {
    return generateEmbedIframe('link-card', url);
  } else {
    return generateYoutubeHtmlFromVideoId(params.videoId, params.start);
  }
}

/** Embedサーバーを使った埋め込み要素の文字列を生成する */
export function generateEmbedIframe(type: ZennEmbedTypes, src: string): string {
  // ユーザーからの入力値が引数として渡されたときのために念のためencodeする
  const encodedType = encodeURIComponent(type);
  const encodedSrc = encodeURIComponent(src);
  const id = `zenn-embedded__${Math.random().toString(16).slice(2)}`;
  const iframeSrc = `https://embed.zenn.studio/${encodedType}#${id}`;

  return `<div class="zenn-embedded zenn-embedded-${encodedType}"><iframe id="${id}" src="${iframeSrc}" data-content="${encodedSrc}" frameborder="0" scrolling="no" loading="lazy"></iframe></div>`;
}

/** 渡された文字列から埋め込み要素のHTMLを生成する関数をまとめたオブジェクト */
const embedGenerators: { [key in EmbedType]: (key: string) => string } = {
  youtube(videoId: string) {
    if (!videoId?.match(/^[a-zA-Z0-9_-]+$/)) {
      return 'YouTubeのvideoIDが不正です';
    }
    return generateYoutubeHtmlFromVideoId(videoId);
  },
  slideshare(key: string) {
    if (!key?.match(/^[a-zA-Z0-9_-]+$/)) {
      return 'Slide Shareのkeyが不正です';
    }
    return `<div class="embed-slideshare"><iframe src="https://www.slideshare.net/slideshow/embed_code/key/${escapeHtml(
      key
    )}" scrolling="no" allowfullscreen loading="lazy"></iframe></div>`;
  },
  speakerdeck(key: string) {
    if (!key?.match(/^[a-zA-Z0-9_-]+$/)) {
      return 'Speaker Deckのkeyが不正です';
    }
    return `<div class="embed-speakerdeck"><iframe src="https://speakerdeck.com/player/${escapeHtml(
      key
    )}" scrolling="no" allowfullscreen allow="encrypted-media" loading="lazy"></iframe></div>`;
  },
  jsfiddle(str: string) {
    if (!isJsfiddleUrl(str)) {
      return 'jsfiddleのURLが不正です';
    }
    // URLを~/embedded/とする
    // ※ すでにembeddedもしくはembedが含まれるURLが入力されている場合は、そのままURLを使用する。
    let url = str;
    if (!url.includes('embed')) {
      url = url.endsWith('/') ? `${url}embedded/` : `${url}/embedded/`;
    }
    return `<div class="embed-jsfiddle"><iframe src="${sanitaizeEmbedToken(
      url
    )}" scrolling="no" frameborder="no" loading="lazy"></iframe></div>`;
  },
  codepen(str: string) {
    if (!isCodepenUrl(str)) {
      return 'CodePenのURLが不正です';
    }
    const url = new URL(str.replace('/pen/', '/embed/'));
    url.searchParams.set('embed-version', '2');
    return `<div class="embed-codepen"><iframe src="${sanitaizeEmbedToken(
      url.toString()
    )}" scrolling="no" frameborder="no" loading="lazy"></iframe></div>`;
  },
  codesandbox(str: string) {
    if (!isCodesandboxUrl(str)) {
      return '「https://codesandbox.io/embed/」から始まる正しいURLを入力してください';
    }
    return `<div class="embed-codesandbox"><iframe src="${sanitaizeEmbedToken(
      str
    )}" style="width:100%;height:500px;border:none;overflow:hidden;" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" loading="lazy" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe></div>`;
  },
  stackblitz(str: string) {
    if (!isStackblitzUrl(str)) {
      return 'StackBlitzのembed用のURLを指定してください';
    }
    return `<div class="embed-stackblitz"><iframe src="${sanitaizeEmbedToken(
      str
    )}" scrolling="no" frameborder="no" loading="lazy"></iframe></div>`;
  },
  tweet(str: string) {
    if (!isTweetUrl(str)) return 'ツイートページのURLを指定してください';
    return generateEmbedIframe('tweet', str);
  },
  blueprintue(str: string) {
    if (!isBlueprintUEUrl(str))
      return '「https://blueprintue.com/render/」から始まる正しいURLを指定してください';
    return `<div class="embed-blueprintue"><iframe src="${sanitaizeEmbedToken(
      str
    )}" width="100%" style="aspect-ratio: 16/9" scrolling="no" frameborder="no" loading="lazy" allowfullscreen></iframe></div>`;
  },
  figma(str: string) {
    if (!isFigmaUrl(str))
      return 'ファイルまたはプロトタイプのFigma URLを指定してください';
    return `<div class="embed-figma"><iframe src="https://www.figma.com/embed?embed_host=zenn&url=${sanitaizeEmbedToken(
      str
    )}" width="100%" style="aspect-ratio: 16/9" scrolling="no" frameborder="no" loading="lazy" allowfullscreen></iframe></div>`;
  },
  card(str: string) {
    if (!isValidHttpUrl(str)) return 'URLが不正です';
    return generateEmbedIframe('link-card', str);
  },
  gist(str: string) {
    if (!isGistUrl(str)) return 'GitHub GistのページURLを指定してください';
    /**
     * gistのURL は
     * - https://gist.github.com/foo/bar.json
     * - https://gist.github.com/foo/bar.json?file=example.js
     * のような形式
     */
    return generateEmbedIframe('gist', str);
  },
  github(str: string) {
    if (!isGithubUrl(str))
      return 'GitHub のファイルURLまたはパーマリンクを指定してください';

    return generateEmbedIframe('github', str);
  },
};

/** 検証から除外する埋め込みの種別 */
const excludeEmbedType: EmbedType[] = ['card', 'github'];

/** 埋め込みURLまたはTokenの最大文字数( excludeEmbedTypeは除く ) */
const MAX_EMBED_TOKEN_LENGTH = 300;

/** `EmbedType`か判定する */
export function isEmbedType(type: unknown): type is EmbedType {
  return typeof type === 'string' && type in embedGenerators;
}

/** 渡された埋め込みURLまたはTokenを検証する */
export const validateEmbedToken = (str: string): boolean => {
  return str.length <= MAX_EMBED_TOKEN_LENGTH;
};

/** 渡された`type`の埋め込み要素のHTML文字列を返す */
export const generateEmbedHTML = (type: EmbedType, str: string): string => {
  if (!excludeEmbedType.includes(type) && !validateEmbedToken(str)) {
    return `埋め込みURLは${MAX_EMBED_TOKEN_LENGTH}文字以内にする必要があります`;
  }

  return embedGenerators[type](str);
};

/** Linkifyな埋め込み要素のHTML生成する */
export const generateLinkifyEmbedHTML = (url: string): string => {
  let html: string | null = null;

  if (isTweetUrl(url)) html = generateEmbedIframe('tweet', url);
  else if (isYoutubeUrl(url)) html = generateYoutubeHtmlFromUrl(url);

  if (!html && isGithubUrl(url)) return generateEmbedIframe('github', url);
  if (!html) return generateEmbedIframe('link-card', url);

  return validateEmbedToken(url)
    ? html
    : `埋め込みURLは${MAX_EMBED_TOKEN_LENGTH}文字以内にする必要があります`;
};
