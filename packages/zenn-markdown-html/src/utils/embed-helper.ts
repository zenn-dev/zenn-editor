import { escapeHtml } from 'markdown-it/lib/common/utils';
import {
  isValidHttpUrl,
  generateEmbedIframe,
  generateYoutubeHtmlFromUrl,
  generateYoutubeHtmlFromVideoId,
} from './helper';
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

/* 埋め込み要素の種別 */
export type EmbedType = keyof typeof embedGenerators;

/** 埋め込みURLの最大文字数( LinkCardは除く ) */
const MAX_EMBED_URL_LENGTH = 300;

/** 渡された文字列から埋め込み要素のHTMLを生成する関数をまとめたオブジェクト */
const embedGenerators = {
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
    return `<div class="embed-jsfiddle"><iframe src="${encodeDoubleQuote(
      url
    )}" scrolling="no" frameborder="no" loading="lazy"></iframe></div>`;
  },
  codepen(str: string) {
    if (!isCodepenUrl(str)) {
      return 'CodePenのURLが不正です';
    }
    const url = new URL(str.replace('/pen/', '/embed/'));
    url.searchParams.set('embed-version', '2');
    return `<div class="embed-codepen"><iframe src="${encodeDoubleQuote(
      url.toString()
    )}" scrolling="no" frameborder="no" loading="lazy"></iframe></div>`;
  },
  codesandbox(str: string) {
    if (!isCodesandboxUrl(str)) {
      return '「https://codesandbox.io/embed/」から始まる正しいURLを入力してください';
    }
    return `<div class="embed-codesandbox"><iframe src="${encodeDoubleQuote(
      str
    )}" style="width:100%;height:500px;border:none;overflow:hidden;" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" loading="lazy" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe></div>`;
  },
  stackblitz(str: string) {
    if (!isStackblitzUrl(str)) {
      return 'StackBlitzのembed用のURLを指定してください';
    }
    return `<div class="embed-stackblitz"><iframe src="${encodeDoubleQuote(
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
    return `<div class="embed-blueprintue"><iframe src="${encodeDoubleQuote(
      str
    )}" width="100%" style="aspect-ratio: 16/9" scrolling="no" frameborder="no" loading="lazy" allowfullscreen></iframe></div>`;
  },
  figma(str: string) {
    if (!isFigmaUrl(str))
      return 'ファイルまたはプロトタイプのFigma URLを指定してください';
    return `<div class="embed-figma"><iframe src="https://www.figma.com/embed?embed_host=zenn&url=${encodeDoubleQuote(
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

function encodeDoubleQuote(str: string): string {
  return str.replace(/"/g, '%22');
}

/** `EmbedType`か判定する */
export function isEmbedType(type: unknown): type is EmbedType {
  return typeof type === 'string' && type in embedGenerators;
}

/** 渡された埋め込みURLを検証する */
export const validateEbedUrl = (url: string): boolean => {
  return url.length <= MAX_EMBED_URL_LENGTH;
};

/** 渡された`type`の埋め込み要素のHTML文字列を返す */
export const generateEmbedHTML = (type: EmbedType, url: string): string => {
  if (type !== 'card' && !validateEbedUrl(url)) {
    return `埋め込みURLは${MAX_EMBED_URL_LENGTH}文字以内にする必要があります`;
  }

  return embedGenerators[type](url);
};

/** Linkifyな埋め込み要素のHTML生成する */
export const generateLinkifyEmbedHTML = (url: string): string => {
  let html: string | null = null;

  if (isTweetUrl(url)) html = generateEmbedIframe('tweet', url);
  else if (isYoutubeUrl(url)) html = generateYoutubeHtmlFromUrl(url);
  else if (isGithubUrl(url)) html = generateEmbedIframe('github', url);

  if (!html) return generateEmbedIframe('link-card', url);

  return validateEbedUrl(url)
    ? html
    : `埋め込みURLは${MAX_EMBED_URL_LENGTH}文字以内にする必要があります`;
};
