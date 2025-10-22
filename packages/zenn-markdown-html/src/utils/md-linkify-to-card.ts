import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token.mjs';
import { MarkdownOptions } from '../types';
import { generateLinkifyEmbedHTML } from './embed-helper';

function convertAutolinkToEmbed(
  inlineChildTokens: Token[],
  options: MarkdownOptions
): Token[] {
  const newTokens: Token[] = [];

  inlineChildTokens.forEach((token, i) => {
    // 埋め込み対象となるlink_open かつ linkify以外はそのまま出力結果に含める
    if (!(token.type === 'link_open' && token.markup === 'linkify')) {
      newTokens.push(token); // 変換は行わずに出力結果に含める
      return;
    }

    const linkOpenToken = token;

    // tokenがlinkifyの場合は必要に応じて、カードを生成
    const url = linkOpenToken.attrGet('href');
    if (!url) {
      newTokens.push(token); // 変換は行わずに出力結果に含める
      return;
    }

    const isStartOfLine = i === 0;
    const isEndOfLine = i + 2 === inlineChildTokens.length - 1; // i + 2 = link_closeのこと => link_closeが最後のtokenか

    const prevToken = isStartOfLine ? null : inlineChildTokens[i - 1]; // e.g. [✋, link_open, text, link_close]
    const nextToken = isEndOfLine ? null : inlineChildTokens[i + 3]; // e.g. [text, link_open, text, link_close, ✋]

    const isPrevBr = prevToken?.tag === 'br';
    const isNextBr = nextToken?.tag === 'br';

    // 以下の2つをどちらも満たした場合にリンク化
    // 1. パラグラフ先頭 もしくは リンクの前が br
    // 2. パラグラフの末尾 もしくは リンクの後が br

    const shouldConvertToCard =
      (isStartOfLine || isPrevBr) && (isEndOfLine || isNextBr);

    if (!shouldConvertToCard) {
      newTokens.push(token); // 変換は行わずに出力結果に含める
      return;
    }

    // 埋め込み用のHTMLを生成
    const embedToken = new Token('html_inline', '', 0);

    // 埋め込み要素のHTML生成
    embedToken.content = generateLinkifyEmbedHTML(url, options);

    // a要素自体はカードにより不要になるため非表示に
    linkOpenToken.attrJoin('style', 'display: none');

    // カードとリンクのトークンを出力結果のtokenに追加
    newTokens.push(embedToken, linkOpenToken);

    // 前後のbrタグはスペースを広げすぎてしまうため非表示にしておく
    if (nextToken && isNextBr) {
      nextToken.type = 'html_inline';
      nextToken.content = '<br style="display: none">\n';
    }
    if (prevToken && isPrevBr) {
      prevToken.type = 'html_inline';
      prevToken.content = '<br style="display: none">\n';
    }
  });
  return newTokens;
}

export function mdLinkifyToCard(md: MarkdownIt, options?: MarkdownOptions) {
  md.core.ruler.after('replacements', 'link-to-card', function ({ tokens }) {
    // 埋め込みを許可するネストレベル
    let allowLevel = 0;

    // 本文内のすべてのtokenをチェック
    tokens.forEach((token, i) => {
      if (token.type === 'container_details_open') {
        allowLevel++;
        return;
      }
      if (token.type === 'container_details_close' && allowLevel > 0) {
        allowLevel--;
        return;
      }

      // autolinkはinline内のchildrenにのみ存在
      if (token.type !== 'inline') return;

      // childrenが存在しない場合は変換しない
      const children = token.children;
      if (!children) return;

      // childrenにautolinkが存在する場合のみ変換
      const hasAnyAutolink = children?.some(
        (child) => child.markup === 'linkify'
      );
      if (!hasAnyAutolink) return;

      // 親がコンテンツ直下のp要素の場合のみ変換
      const parentToken = tokens[i - 1];
      const isParentRootParagraph =
        parentToken &&
        parentToken.type === 'paragraph_open' &&
        parentToken.level === allowLevel;
      if (!isParentRootParagraph) return;

      token.children = convertAutolinkToEmbed(children, options || {});
    });

    return true;
  });
}
