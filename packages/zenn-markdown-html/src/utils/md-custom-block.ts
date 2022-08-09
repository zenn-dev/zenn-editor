import MarkdownIt from 'markdown-it';
import { escapeHtml } from 'markdown-it/lib/common/utils';
import {
  isValidHttpUrl,
  generateYoutubeHtmlFromVideoId,
  generateEmbedIframe,
} from './helper';
import {
  isGistUrl,
  isTweetUrl,
  isStackblitzUrl,
  isCodesandboxUrl,
  isCodepenUrl,
  isJsfiddleUrl,
} from './url-matcher';

// e.g. @[youtube](youtube-video-id)

const blockOptions = {
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
    return `<div class="embed-jsfiddle"><iframe src="${url}" scrolling="no" frameborder="no" loading="lazy"></iframe></div>`;
  },
  codepen(str: string) {
    if (!isCodepenUrl(str)) {
      return 'CodePenのURLが不正です';
    }
    const url = new URL(str.replace('/pen/', '/embed/'));
    url.searchParams.set('embed-version', '2');
    return `<div class="embed-codepen"><iframe src="${url}" scrolling="no" frameborder="no" loading="lazy"></iframe></div>`;
  },
  codesandbox(str: string) {
    if (!isCodesandboxUrl(str)) {
      return '「https://codesandbox.io/embed/」から始まる正しいURLを入力してください';
    }
    return `<div class="embed-codesandbox"><iframe src="${str}" style="width:100%;height:500px;border:none;overflow:hidden;" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" loading="lazy" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe></div>`;
  },
  stackblitz(str: string) {
    if (!isStackblitzUrl(str)) {
      return 'StackBlitzのembed用のURLを指定してください';
    }
    return `<div class="embed-stackblitz"><iframe src="${str}" scrolling="no" frameborder="no" loading="lazy"></iframe></div>`;
  },
  tweet(str: string) {
    if (!isTweetUrl(str)) return 'ツイートページのURLを指定してください';
    return generateEmbedIframe('tweet', str);
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
};

// Forked from: https://github.com/posva/markdown-it-custom-block

export function mdCustomBlock(md: MarkdownIt) {
  md.renderer.rules.custom = function tokenizeBlock(tokens, idx) {
    // eslint-disable-next-line
    const { tag, arg }: any = tokens[idx].info;
    if (!tag || !arg) return '';
    try {
      // eslint-disable-next-line
      return (blockOptions as any)[tag](arg) + '\n';
    } catch (e) {
      return '';
    }
  };

  md.block.ruler.before(
    'fence',
    'custom',
    function customEmbed(state, startLine, endLine, silent) {
      const startPos = state.bMarks[startLine] + state.tShift[startLine];
      const maxPos = state.eMarks[startLine];
      const block = state.src.slice(startPos, maxPos);
      const pointer = { line: startLine, pos: startPos };

      // Note: skip prev line break check
      // if (startLine !== 0) {
      //   let prevLineStartPos =
      //     state.bMarks[startLine - 1] + state.tShift[startLine - 1];
      //   let prevLineMaxPos = state.eMarks[startLine - 1];
      //   if (prevLineMaxPos > prevLineStartPos) return false;
      // }

      // Check if it's @[tag](arg)
      if (
        state.src.charCodeAt(pointer.pos) !== 0x40 /* @ */ ||
        state.src.charCodeAt(pointer.pos + 1) !== 0x5b /* [ */
      ) {
        return false;
      }

      const embedRE = /@\[([\w-]+)\]\((.+)\)/im;
      const match = embedRE.exec(block);

      if (!match || match.length < 3) {
        return false;
      }

      const [all, tag, arg] = match;

      pointer.pos += all.length;

      // Note: skip nextline break check
      // if (endLine !== pointer.line + 1) {
      //   let nextLineStartPos =
      //     state.bMarks[pointer.line + 1] + state.tShift[pointer.line + 1];
      //   let nextLineMaxPos = state.eMarks[pointer.line + 1];
      //   if (nextLineMaxPos > nextLineStartPos) return false;
      // }

      if (pointer.line >= endLine) return false;

      if (!silent) {
        const token = state.push('custom', 'div', 0);
        token.markup = state.src.slice(startPos, pointer.pos);
        // eslint-disable-next-line
        token.info = { arg, tag } as any;
        token.block = true;
        token.map = [startLine, pointer.line + 1];
        state.line = pointer.line + 1;
      }

      return true;
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
  );
}
