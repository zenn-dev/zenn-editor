import * as cheerio from 'cheerio';
import { generateEmbedServerIframe } from './embed-helper';

/** ```html-embed のコードブロック1つあたりの最大サイズ(UTF-8 のバイト数) */
export const HTML_EMBED_MAX_BYTES = 50 * 1024;

/**
 * 要素ごと除去する要素
 * - `meta`(`http-equiv="refresh"` による遷移)と `base`
 * - 別の文書や外部リソースを読み込む要素
 * - 解析のされ方が、文脈やスクリプトの有効・無効で変わる要素
 */
const REMOVED_TAGS = [
  'meta',
  'base',
  'link',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'portal',
  'template',
  'noscript',
  'noembed',
  'noframes',
  'xmp',
  'plaintext',
  'mglyph',
  'malignmark',
];

const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';

/** 除去を繰り返す上限の回数 */
const MAX_STRIP_ITERATIONS = 5;

/**
 * ユーザーが書いた HTML から、リンク先と `<meta>`・`<base>` などを除去する
 * iframe 側でも除去し、外部への通信は iframe 側の CSP で止める前提で、変換時にも多層防御として除去しておく
 *
 * ブラウザと同じ木で判定するため、HTML の仕様に沿って解析する parse5(cheerio の既定のパーサー)を使う
 * Node.js とブラウザの両方で動くよう、DOMParser は使わない
 *
 * 解析した木を文字列に戻すと、ブラウザが解析し直したときに別の木になる場合がある
 * そのため出力が変わらなくなるまで繰り返し、上限の回数で収まらない場合は null を返す
 */
export function stripHtmlEmbedContent(
  html: string,
  maxIterations = MAX_STRIP_ITERATIONS
): string | null {
  let current = html;
  for (let i = 0; i < maxIterations; i++) {
    const next = stripOnce(current);
    if (next === current) return next;
    current = next;
  }
  return null;
}

function stripOnce(html: string): string {
  const $ = cheerio.load(html);

  // `<style>` や SVG など描画に必要な要素は残す
  // JS は iframe 側の CSP で止めるため、ここでは除去しない
  $(REMOVED_TAGS.join(',')).remove();

  // 中のテキストや図形は残し、リンク先・送信先の属性だけを除去する
  // (parse5 は SVG の `xlink:href` も名前空間付きの `href` として扱うため、`href` の除去で両方が消える)
  $('a, area').removeAttr('href');
  $('form').removeAttr('action');
  $('[formaction]').removeAttr('formaction');
  $('[href]')
    .filter((_, el) => 'namespace' in el && el.namespace === MATHML_NAMESPACE)
    .removeAttr('href');

  // `<head>` に移された `<style>` などを含め、本文に入れる HTML として出力する
  return ($('head').html() ?? '') + ($('body').html() ?? '');
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
