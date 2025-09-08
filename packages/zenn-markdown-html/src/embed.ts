import type { MarkdownOptions } from './types';

import { escapeHtml } from 'markdown-it/lib/common/utils.js';
import {
  sanitizeEmbedToken,
  generateEmbedServerIframe,
} from './utils/embed-helper';
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
  isValidHttpUrl,
  isDocswellUrl,
  extractYoutubeVideoParameters,
  extractDocswellEmbedUrl,
} from './utils/url-matcher';

/* 埋め込み要素の種別 */
export type EmbedType =
  | 'youtube'
  | 'slideshare'
  | 'speakerdeck'
  | 'jsfiddle'
  | 'docswell'
  | 'codepen'
  | 'codesandbox'
  | 'stackblitz'
  | 'tweet'
  | 'blueprintue'
  | 'figma'
  | 'card'
  | 'gist'
  | 'github'
  | 'mermaid';

/** embedサーバーで表示する埋め込み要素の種別 */
export type EmbedServerType = Extract<
  EmbedType,
  'tweet' | 'card' | 'mermaid' | 'github' | 'gist'
>;

/** 埋め込み要素のHTMLを生成する関数 */
export type EmbedGenerator = (str: string, options?: MarkdownOptions) => string;
export type EmbedGeneratorList = Record<EmbedType, EmbedGenerator>;

/** 埋め込み要素のHTMLを生成する関数をまとめたオブジェクト */
export const embedGenerators: Readonly<EmbedGeneratorList> = {
  youtube(str) {
    const params = extractYoutubeVideoParameters(str) || { videoId: str };

    if (!params.videoId.match(/^[a-zA-Z0-9_-]+$/)) {
      return 'YouTubeのvideoIDが不正です';
    }

    const escapedVideoId = escapeHtml(params.videoId);
    const time = Math.min(Number(params.start || 0), 48 * 60 * 60); // 48時間以内
    const startQuery = time ? `?start=${time}` : '';

    return `<span class="embed-block embed-youtube"><iframe src="https://www.youtube-nocookie.com/embed/${escapedVideoId}${startQuery}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></span>`;
  },
  slideshare(key) {
    if (!key?.match(/^[a-zA-Z0-9_-]+$/)) {
      return 'Slide Shareのkeyが不正です';
    }
    return `<span class="embed-block embed-slideshare"><iframe src="https://www.slideshare.net/slideshow/embed_code/key/${escapeHtml(
      key
    )}" scrolling="no" allowfullscreen loading="lazy"></iframe></span>`;
  },
  speakerdeck(str) {
    if (!str?.match(/^[a-zA-Z0-9_-]+(?:\?slide=\d+)?$/)) {
      return 'Speaker Deckのkeyが不正です';
    }

    const [key, slideParamStr] = str.split('?');
    const slideQuery = slideParamStr ? `?${slideParamStr}` : '';

    return `<span class="embed-block embed-speakerdeck"><iframe src="https://speakerdeck.com/player/${escapeHtml(
      key
    )}${escapeHtml(slideQuery)}" scrolling="no" allowfullscreen allow="encrypted-media" loading="lazy"></iframe></span>`;
  },
  docswell(str) {
    const errorMessage = 'DocswellのスライドURLが不正です';
    if (!isDocswellUrl(str)) {
      return errorMessage;
    }
    const slideUrl = extractDocswellEmbedUrl(str);
    if (!slideUrl) {
      return errorMessage;
    }
    return `<span class="embed-block embed-docswell"><iframe src="${slideUrl}" allowfullscreen="true" class="docswell-iframe" width="100%" style="border: 1px solid #ccc; display: block; margin: 0px auto; padding: 0px; aspect-ratio: 16/9"></iframe></span>`;
  },
  jsfiddle(str) {
    if (!isJsfiddleUrl(str)) {
      return 'jsfiddleのURLが不正です';
    }
    // URLを~/embedded/とする
    // ※ すでにembeddedもしくはembedが含まれるURLが入力されている場合は、そのままURLを使用する。
    let url = str;
    if (!url.includes('embed')) {
      url = url.endsWith('/') ? `${url}embedded/` : `${url}/embedded/`;
    }
    return `<span class="embed-block embed-jsfiddle"><iframe src="${sanitizeEmbedToken(
      url
    )}" scrolling="no" frameborder="no" loading="lazy"></iframe></span>`;
  },
  codepen(str) {
    if (!isCodepenUrl(str)) {
      return 'CodePenのURLが不正です';
    }
    const url = new URL(str.replace('/pen/', '/embed/'));
    url.searchParams.set('embed-version', '2');
    return `<span class="embed-block embed-codepen"><iframe src="${sanitizeEmbedToken(
      url.toString()
    )}" scrolling="no" frameborder="no" loading="lazy"></iframe></span>`;
  },
  codesandbox(str) {
    if (!isCodesandboxUrl(str)) {
      return '「https://codesandbox.io/embed/」から始まる正しいURLを入力してください';
    }
    return `<span class="embed-block embed-codesandbox"><iframe src="${sanitizeEmbedToken(
      str
    )}" style="width:100%;height:500px;border:none;overflow:hidden;" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" loading="lazy" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe></span>`;
  },
  stackblitz(str) {
    if (!isStackblitzUrl(str)) {
      return 'StackBlitzのembed用のURLを指定してください';
    }
    return `<span class="embed-block embed-stackblitz"><iframe src="${sanitizeEmbedToken(
      str
    )}" scrolling="no" frameborder="no" loading="lazy"></iframe></span>`;
  },
  blueprintue(str) {
    if (!isBlueprintUEUrl(str))
      return '「https://blueprintue.com/render/」から始まる正しいURLを指定してください';
    return `<span class="embed-block embed-blueprintue"><iframe src="${sanitizeEmbedToken(
      str
    )}" width="100%" style="aspect-ratio: 16/9" scrolling="no" frameborder="no" loading="lazy" allowfullscreen></iframe></span>`;
  },
  figma(str: string) {
    if (!isFigmaUrl(str))
      return 'ファイルまたはプロトタイプのFigma URLを指定してください';
    return `<span class="embed-block embed-figma"><iframe src="https://www.figma.com/embed?embed_host=zenn&url=${sanitizeEmbedToken(
      str
    )}" width="100%" style="aspect-ratio: 16/9" scrolling="no" frameborder="no" loading="lazy" allowfullscreen></iframe></span>`;
  },

  // 以下は埋め込みサーバーが絡む要素。
  // embedOrigin が指定されていれば埋め込みサーバーを iframe で表示、
  // なければデフォルトの挙動(リンクの表示など)を行います。

  card(str, options) {
    if (!isValidHttpUrl(str)) return 'URLが不正です';
    if (options?.embedOrigin)
      return generateEmbedServerIframe('card', str, options.embedOrigin);

    return `<a href="${str}" rel="noreferrer noopener nofollow" target="_blank">${str}</a>`;
  },
  tweet(str, options) {
    if (!isTweetUrl(str)) return 'ツイートページのURLを指定してください';
    if (options?.embedOrigin)
      return generateEmbedServerIframe('tweet', str, options.embedOrigin);

    return `<a href="${str}" rel="noreferrer noopener nofollow" target="_blank">${str}</a>`;
  },
  gist(str, options) {
    /**
     * gistのURL は
     * - https://gist.github.com/foo/bar.json
     * - https://gist.github.com/foo/bar.json?file=example.js
     * のような形式
     */
    if (!isGistUrl(str)) return 'GitHub GistのページURLを指定してください';
    if (options?.embedOrigin)
      return generateEmbedServerIframe('gist', str, options.embedOrigin);

    return `<a href="${str}" rel="noreferrer noopener nofollow" target="_blank">${str}</a>`;
  },
  github(str, options) {
    if (!isGithubUrl(str))
      return 'GitHub のファイルURLまたはパーマリンクを指定してください';
    if (options?.embedOrigin)
      return generateEmbedServerIframe('github', str, options.embedOrigin);

    return `<a href="${str}" rel="noreferrer noopener nofollow" target="_blank">${str}</a>`;
  },
  mermaid(str, options) {
    if (options?.embedOrigin)
      return generateEmbedServerIframe('mermaid', str, options.embedOrigin);

    // エスケープ処理しておく
    const src = str.replace(/>/g, '&gt;');

    // ブラウザじゃないと mermaid はレンダリングできないので、Node.jsで描画するときはコードブロックのまま出力する
    return `<div class="code-block-container"><pre><code>${src}</code></pre></div>`;
  },
} as const;

/** 埋め込み要素の種別配列 */
export const embedKeys = Object.keys(embedGenerators) as EmbedType[];
