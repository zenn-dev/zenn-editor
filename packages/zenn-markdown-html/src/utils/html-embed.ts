import sanitizeHtml from 'sanitize-html';
import { generateEmbedServerIframe } from './embed-helper';

/** ```html-embed のコードブロック1つあたりの最大サイズ(UTF-8 のバイト数) */
export const HTML_EMBED_MAX_BYTES = 50 * 1024;

/**
 * 要素ごと除去する要素
 * - `meta`(`http-equiv="refresh"` による遷移)と `base`
 * - 別の文書や外部リソースを読み込む要素
 * - 中身の解析が sanitize-html のパーサーとブラウザで食い違い、除去を迂回できる要素
 */
const REMOVED_TAGS = new Set([
  'meta',
  'base',
  'link',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'portal',
  'noscript',
  'noembed',
  'noframes',
  'xmp',
  'plaintext',
  'mglyph',
  'malignmark',
]);

/** 要素ごとに除去する属性(リンク先・送信先) */
const REMOVED_ATTRIBUTES = new Map([
  ['a', new Set(['href', 'xlink:href'])],
  ['area', new Set(['href', 'xlink:href'])],
  ['form', new Set(['action'])],
]);
/** すべての要素から除去する属性 */
const REMOVED_GLOBAL_ATTRIBUTES = new Set(['formaction']);
/** `href` でリンクになりうる MathML の要素 */
const MATHML_TAGS = new Set([
  'math',
  'maction',
  'annotation',
  'annotation-xml',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mprescripts',
  'mroot',
  'mrow',
  'ms',
  'mspace',
  'msqrt',
  'mstyle',
  'msub',
  'msubsup',
  'msup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'none',
  'semantics',
]);
const MATHML_REMOVED_ATTRIBUTES = new Set(['href']);
/** 除去を繰り返す上限の回数 */
const MAX_STRIP_ITERATIONS = 5;

/**
 * ユーザーが書いた HTML から、リンク先と `<meta>`・`<base>` などを除去する
 * iframe 側でも除去し、外部への通信は iframe 側の CSP で止める前提で、変換時にも多層防御として除去しておく
 * Node.js とブラウザの両方で動くよう、DOMParser ではなく sanitize-html を使う
 * (sanitize-html のパーサーはタグ名と属性名を小文字にするため、大文字で書かれても除去できる)
 *
 * SVG・MathML の中の `<style>`・`<script>` では、パーサーが展開した `&lt;` などを
 * sanitize-html がエスケープせずに出力するため、1回の除去では除去したはずのタグが現れることがある
 * そのため出力が変わらなくなるまで繰り返し、上限の回数で収まらない場合は null を返す
 */
export function stripHtmlEmbedContent(html: string): string | null {
  let current = html;
  for (let i = 0; i < MAX_STRIP_ITERATIONS; i++) {
    const next = stripOnce(current);
    if (next === current) return next;
    current = next;
  }
  return null;
}

function stripOnce(html: string): string {
  return sanitizeHtml(html, {
    // `<style>` や SVG など描画に必要な要素は残す
    // JS は iframe 側の CSP で止めるため、ここでは除去しない
    allowedTags: false,
    allowedAttributes: false,
    allowVulnerableTags: true,
    // 画像などに使われるスキームは残す(`data:` の画像などを使えるかは iframe 側の CSP で決める)
    allowedSchemes: ['http', 'https', 'data', 'blob'],
    exclusiveFilter: (frame) => REMOVED_TAGS.has(frame.tag),
    transformTags: {
      '*': (tagName, attribs) => {
        // 中のテキストや図形は残し、属性だけを除去する
        const removed = MATHML_TAGS.has(tagName)
          ? MATHML_REMOVED_ATTRIBUTES
          : REMOVED_ATTRIBUTES.get(tagName);
        const filtered = Object.fromEntries(
          Object.entries(attribs).filter(
            ([name]) =>
              !REMOVED_GLOBAL_ATTRIBUTES.has(name) && !removed?.has(name)
          )
        );
        return { tagName, attribs: filtered };
      },
    },
  });
}

/**
 * ```html-embed のコードブロックを、埋め込みサーバーの iframe に変換する
 * `embedOrigin` が URL として不正な場合は null を返す
 */
export function generateHtmlEmbedHTML(
  content: string,
  embedOrigin: string
): string | null {
  const html = stripHtmlEmbedContent(content.trim());

  if (html === null) {
    return 'HTMLの埋め込みに変換できない記述が含まれています';
  }

  if (new TextEncoder().encode(html).length > HTML_EMBED_MAX_BYTES) {
    return `HTMLの埋め込みは${HTML_EMBED_MAX_BYTES / 1024}KB以内にする必要があります`;
  }

  return generateEmbedServerIframe('html', html, embedOrigin) || null;
}
