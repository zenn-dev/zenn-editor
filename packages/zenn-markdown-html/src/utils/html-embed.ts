import * as cheerio from 'cheerio';
import { generateEmbedServerIframe } from './embed-helper';

/** ```html-embed のコードブロック1つあたりの最大サイズ(UTF-8 のバイト数) */
export const HTML_EMBED_MAX_BYTES = 50 * 1024;

/**
 * 要素ごと除去する要素
 * - `meta`(`http-equiv="refresh"` による遷移)と `base`
 * - 別の文書や外部リソースを読み込む要素
 * - 解析のされ方が、文脈やスクリプトの有効・無効で変わる要素
 * - フォームと入力欄(送信は iframe 側の CSP と sandbox で止めるが、偽のログイン画面などで読者に入力させないため)
 *   `input` は別に扱い、文字を入力できない checkbox・radio だけを残す(CSS の `:checked` で作るタブや開閉に使うため)
 *
 * 埋め込みを表示する iframe 側でも同じ要素を除去しているので、変更するときは両側を揃える
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
  'form',
  'button',
  'textarea',
  'select',
  'option',
  'optgroup',
  'datalist',
];

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';

/** 残す `input` の `type`(文字を入力できないもの) */
const KEPT_INPUT_TYPES = ['checkbox', 'radio'];

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
  try {
    let current = html;
    for (let i = 0; i < maxIterations; i++) {
      const next = stripOnce(current);
      if (next === current) return next;
      current = next;
    }
    return null;
  } catch {
    // 入れ子が深すぎる場合などは、文字列に戻す処理がスタックを使い切って例外になる
    return null;
  }
}

function stripOnce(html: string): string {
  // DOCTYPE がないと quirks モードで解析されるため、iframe 側の文書と同じ標準モードで解析する
  const $ = cheerio.load(`<!DOCTYPE html>${html}`);

  // `<style>` や SVG など描画に必要な要素は残す
  // JS は iframe 側の CSP で止めるため、ここでは除去しない
  $(REMOVED_TAGS.join(',')).remove();
  // ブラウザと同じく `type` を ASCII の大文字・小文字だけを区別せずに比べる
  // (`toLowerCase`・`toUpperCase` は ASCII 以外の文字も変換する。前後の空白や未知の値はブラウザでは `text` になる)
  // SVG・MathML の中の `input` は HTML の要素ではないので、checkbox にならない
  $('input')
    .filter(
      (_, el) =>
        !(
          'namespace' in el &&
          el.namespace === HTML_NAMESPACE &&
          KEPT_INPUT_TYPES.includes(
            ($(el).attr('type') ?? '').replace(/[A-Z]/g, (c) => c.toLowerCase())
          )
        )
    )
    .remove();

  // 中のテキストや図形は残し、リンク先や編集を許す属性だけを除去する
  // (parse5 は SVG の `xlink:href` も名前空間付きの `href` として扱うため、`href` の除去で両方が消える)
  $('a, area').removeAttr('href');
  // SVG のアニメーションで、あとから href を付けられないようにする
  $('set, animate')
    .filter((_, el) =>
      /^\s*(xlink:)?href\s*$/i.test($(el).attr('attributeName') ?? '')
    )
    .remove();
  // 入力欄を除去しても、contenteditable を付けた要素には文字を入力できる
  $('[contenteditable]').removeAttr('contenteditable');
  $('[href]')
    .filter((_, el) => 'namespace' in el && el.namespace === MATHML_NAMESPACE)
    .removeAttr('href');

  // `<head>` に移された `<style>` などを含め、本文に入れる HTML として出力する
  // (`<html>`・`<body>` に書いた属性は出力しない)
  return ($('head').html() ?? '') + ($('body').html() ?? '');
}

function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * ```html-embed のコードブロックを、埋め込みサーバーの iframe に変換する
 * `embedOrigin` が URL として不正な場合は null を返す
 */
export function generateHtmlEmbedHTML(
  content: string,
  embedOrigin: string
): string | null {
  const sizeErrorMessage = `HTMLの埋め込みは${HTML_EMBED_MAX_BYTES / 1024}KB以内にする必要があります`;

  // 大きすぎる入力を解析しないよう、除去の前にも確認する
  const source = content.trim();
  if (getByteLength(source) > HTML_EMBED_MAX_BYTES) return sizeErrorMessage;

  const html = stripHtmlEmbedContent(source);
  if (html === null) {
    return 'HTMLの埋め込みに変換できない記述が含まれています';
  }

  // 除去後に閉じタグなどが補われて大きくなる場合があるため、出力も確認する
  if (getByteLength(html) > HTML_EMBED_MAX_BYTES) return sizeErrorMessage;

  return generateEmbedServerIframe('html', html, embedOrigin) || null;
}
