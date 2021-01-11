import MarkdownIt from 'markdown-it';
import { isTweetUrl } from './url-matcher';
import { generateTweetHtml } from './helper';
import Token from 'markdown-it/lib/token';
import StateCore from 'markdown-it/lib/rules_core/state_core';

function generateCardHtml(url: string) {
  return `<div class="embed-zenn-link"><iframe src="https://asia-northeast1-zenn-dev-production.cloudfunctions.net/iframeLinkCard?url=${encodeURIComponent(
    url
  )}" frameborder="0" scrolling="no" loading="lazy"></iframe></div>`;
}

function findLinkOpenTokenIndexes(tokens: Token[] | null) {
  if (!tokens) {
    return [];
  }
  const indexes: number[] = [];
  tokens.forEach((token, index) => {
    if (token.type === 'link_open') {
      indexes.push(index);
    }
  });
  return indexes;
}

function hasBlankBeforeAndAfterToken(
  prevBr: boolean,
  afterBr: boolean,
  linkIndex: number,
  tokenLength: number
) {
  const startOfLine = linkIndex === 0;
  const endOfLine = linkIndex + 2 === tokenLength - 1;
  console.log(prevBr, afterBr, startOfLine, endOfLine);
  if (tokenLength === 3) {
    return true;
  }
  if (prevBr && afterBr) {
    return true;
  }
  if (startOfLine && afterBr) {
    return true;
  }
  if (prevBr && endOfLine) {
    return true;
  }
  return false;
}

function convertLinkToCard(
  tokens: Token[],
  idx: number,
  TokenConstructor: StateCore['Token']
) {
  const token = tokens[idx];
  const parentToken = tokens[idx - 1];
  const { children } = token;
  if (!children) {
    return;
  }
  if (parentToken?.type !== 'paragraph_open' || parentToken?.level !== 0) {
    return;
  }
  let linkIndexes = findLinkOpenTokenIndexes(children);
  if (linkIndexes.length == 0) {
    return;
  }
  for (let i = 0; i < linkIndexes.length; i++) {
    // spliceにより順番が変わるのでlinkIndexesを再び取得
    linkIndexes = findLinkOpenTokenIndexes(children);
    const linkIndex = linkIndexes[i];
    const linkOpenToken = children[linkIndex];
    const href = linkOpenToken.attrs?.find((attr) => attr[0] === 'href');
    const prevChildToken = children[linkIndex - 1];
    const nextChildToken = children[linkIndex + 3];
    const isPrevBr =
      prevChildToken?.type === 'softbreak' ||
      prevChildToken?.content === '<br style="display: none">\n';
    const isNextBr =
      nextChildToken?.type === 'softbreak' ||
      nextChildToken?.content === '<br style="display: none">\n';
    if (!href) {
      continue;
    }
    const [, url] = href;
    if (linkOpenToken.markup !== 'linkify') {
      continue;
    }
    // 直前直後に空白がない場合はreturn
    if (
      !hasBlankBeforeAndAfterToken(
        isPrevBr,
        isNextBr,
        linkIndex,
        children.length
      )
    ) {
      continue;
    }
    // 前後のbrタグはスペースを広げすぎてしまうため非表示に
    if (isNextBr) {
      // next brタグを非表示
      nextChildToken.type = 'html_inline';
      nextChildToken.content = '<br style="display: none">\n';
    }
    if (isPrevBr) {
      // prev brタグを非表示
      prevChildToken.type = 'html_inline';
      prevChildToken.content = '<br style="display: none">\n';
    }

    const newToken = new TokenConstructor('html_inline', '', 0);
    newToken.type = 'html_inline';
    if (isTweetUrl(url)) {
      newToken.content = generateTweetHtml(url);
    } else {
      newToken.content = generateCardHtml(url);
    }
    children.splice(linkIndex, 3, newToken);
  }
}

export function mdLinkifyToCard(md: MarkdownIt) {
  md.core.ruler.after('replacements', 'link-card', function (state) {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'inline') {
        const children = token?.children;
        if (children?.some((child) => child.type === 'link_open')) {
          convertLinkToCard(tokens, i, state.Token);
        }
      }
    }
    return true;
  });
  // default renederer
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
  // 自動リンクにクラスを付与
  md.renderer.rules.link_open = function (...args) {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const isLinkified = token.markup === 'linkify';
    if (isLinkified) {
      token.attrJoin('class', 'linkified');
    }
    return defaultRender(...args);
  };
}
