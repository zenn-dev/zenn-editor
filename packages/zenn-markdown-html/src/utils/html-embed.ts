import sanitizeHtml from 'sanitize-html';
import { generateEmbedServerIframe } from './embed-helper';

/** ```html-embed のコードブロック1つあたりの最大サイズ(UTF-8 のバイト数) */
export const HTML_EMBED_MAX_BYTES = 50 * 1024;

/** リンク先を除去する要素 */
const LINK_TAGS = new Set(['a', 'area']);
/** リンク先を指定する属性 */
const LINK_ATTRIBUTES = new Set(['href', 'xlink:href']);
/** 要素ごと除去する要素 */
const REMOVED_TAGS = new Set(['meta', 'base']);

/**
 * ユーザーが書いた HTML から、リンク先と `<meta>`・`<base>` を除去する
 * iframe 側でも同じものを除去するが、多層防御として変換時にも除去しておく
 * Node.js とブラウザの両方で動くよう、DOMParser ではなく sanitize-html を使う
 * (sanitize-html のパーサーはタグ名と属性名を小文字にするため、大文字で書かれても除去できる)
 */
export function stripHtmlEmbedContent(html: string): string {
  return sanitizeHtml(html, {
    // `<style>` や SVG など描画に必要な要素は残す
    // JS は iframe 側の CSP で止めるため、ここでは除去しない
    allowedTags: false,
    allowedAttributes: false,
    allowVulnerableTags: true,
    exclusiveFilter: (frame) => REMOVED_TAGS.has(frame.tag),
    transformTags: {
      '*': (tagName, attribs) => {
        if (!LINK_TAGS.has(tagName)) return { tagName, attribs };

        // 中のテキストや図形は残し、リンク先の属性だけを除去する
        const filtered = Object.fromEntries(
          Object.entries(attribs).filter(([name]) => !LINK_ATTRIBUTES.has(name))
        );
        return { tagName, attribs: filtered };
      },
    },
  });
}

/** ```html-embed のコードブロックを、埋め込みサーバーの iframe に変換する */
export function generateHtmlEmbedHTML(
  content: string,
  embedOrigin: string
): string {
  const html = stripHtmlEmbedContent(content.trim());

  if (new TextEncoder().encode(html).length > HTML_EMBED_MAX_BYTES) {
    return `HTMLの埋め込みは${HTML_EMBED_MAX_BYTES / 1024}KB以内にする必要があります`;
  }

  return generateEmbedServerIframe('html', html, embedOrigin);
}
