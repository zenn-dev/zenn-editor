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

function findLinkOpenTokenIndex(tokens: Token[] | null) {
  if (!tokens) {
    return -1;
  }
  return tokens.findIndex((token) => token.type === 'link_open');
}

function convertLinkToCard(
  tokens: Token[],
  idx: number,
  TokenConstructor: StateCore['Token']
) {
  const token = tokens[idx];
  const prevToken = tokens[idx - 2];
  const parentToken = tokens[idx - 1];
  const isPrevNoElement = !prevToken;
  const isPrevPr = prevToken?.type === 'paragraph_close';
  const { children } = token;
  if (!children) {
    return;
  }
  const linkIndex = findLinkOpenTokenIndex(children);
  if (linkIndex === -1) {
    return;
  }
  const [linkOpenToken] = children.slice(linkIndex, linkIndex + 1);
  const href = linkOpenToken.attrs?.find((attr) => attr[0] === 'href');
  const prevChildToken = children[linkIndex - 1];
  const nextChildToken = children[linkIndex + 3];
  const isPrevBr = prevChildToken?.type === 'softbreak';
  const isNextBr = nextChildToken?.type === 'softbreak';
  const isPrevEmpty = isPrevNoElement || isPrevBr || isPrevPr;
  if (!href) {
    return;
  }
  const [, url] = href;
  if (!isPrevEmpty || parentToken?.type !== 'paragraph_open') {
    return;
  }

  // 直前がbrでないinlineの場合は無視する
  if (!isPrevBr && children.length !== 3) {
    return;
  }

  // 前後のbrタグはスペースを広げすぎてしまうため非表示に
  if (isNextBr) {
    // next brタグを削除
    nextChildToken.attrJoin('style', 'display: none');
  }
  if (isPrevBr) {
    // prev brタグを削除
    prevChildToken.attrJoin('style', 'display: none');
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

export function mdLinkifyClass(md: MarkdownIt) {
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
