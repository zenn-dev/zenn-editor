import { markdownToHtml } from 'zenn-markdown-html';
import { EMBED_ORIGIN } from './constants';

export function convertMarkdownToEditable(text: string) {
  const html = markdownToHtml(text, {
    embedOrigin: EMBED_ORIGIN,
  });

  return convertHTMLtoEditable(html);
}

// 装飾付きの記事HTMLを編集可能コンテンツに変換
export function convertHTMLtoEditable(html: string) {
  const dom = document.createElement('div');
  dom.innerHTML = html;

  removeMessageSymbol(dom);
  addCodeBlockFileName(dom);
  removeEmbedDeco(dom);
  removeCodeBlockEndNewLine(dom);
  adjustDiffCodeBlock(dom);
  adjustFootnotes(dom);
  addHeadingRandomId(dom);

  return dom.innerHTML;
}

function adjustDiffCodeBlock(dom: HTMLElement) {
  const diffCodes = dom.querySelectorAll('code.diff-highlight');

  diffCodes.forEach((code) => {
    // NodeListを配列に変換してから処理
    const children = Array.from(code.childNodes);

    children.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        // トップレベルのテキストノードは行なのでspanで囲む
        const span = document.createElement('span');
        span.appendChild(child.cloneNode());

        child.parentElement?.replaceChild(span, child);
      } else if (child instanceof HTMLElement) {
        // spanの装飾はDecorationでするため削除。削除しないとパースでエラーになる
        // 繋がった挿入・削除ブロックは改行コードを含むので分割する
        if (child.textContent?.includes('\n')) {
          const lines = child.textContent.split('\n');
          const fragment = document.createDocumentFragment();
          lines.forEach((line) => {
            const lineSpan = document.createElement('span');
            lineSpan.textContent = line;
            fragment.appendChild(lineSpan);
          });
          child.parentElement?.replaceChild(fragment, child);
        } else {
          child.textContent = child.textContent || '';
        }
      }
    });
  });
}

function removeMessageSymbol(dom: HTMLElement) {
  const messageSymbols = dom.querySelectorAll('.msg-symbol');
  messageSymbols.forEach((el) => {
    el.remove();
  });
}

function addCodeBlockFileName(dom: HTMLElement) {
  const codeBlockContainers = dom.querySelectorAll('.code-block-container');
  codeBlockContainers.forEach((codeBlockContainer) => {
    if (codeBlockContainer.children.length === 1) {
      // ファイル名がないので追加する
      const fileNameDom = document.createElement('div');
      fileNameDom.className = 'code-block-filename-container';
      codeBlockContainer.insertBefore(
        fileNameDom,
        codeBlockContainer.firstChild
      );
    }
  });
}

function removeCodeBlockEndNewLine(dom: HTMLElement) {
  // 原因は不明だが、マークダウンペーストだと通常なら文末、差分なら行末に余分な改行が1つ増える
  const codeBlocks = dom.querySelectorAll('pre code:not(.diff-highlight)');
  codeBlocks.forEach((codeBlock) => {
    const code = codeBlock.textContent || '';
    if (code.endsWith('\n')) {
      codeBlock.textContent = code.slice(0, -1);
    }
  });

  const diffCodeBlocks = dom.querySelectorAll('pre code.diff-highlight');
  diffCodeBlocks.forEach((codeBlock) => {
    codeBlock.childNodes.forEach((child) => {
      const code = child.textContent || '';
      if (code.endsWith('\n')) {
        child.textContent = code.slice(0, -1);
      }
    });
  });
}

// 埋め込みの構造
// 1. md-linkifyに対応している（URLで埋め込み）のは、pの子要素になる
// 2. それ以外はトップレベルに配置

// URL単体の埋め込み要素は、不要なリンクとパラグラフを持つので削除する
function removeEmbedDeco(dom: HTMLElement) {
  const embeds = dom.querySelectorAll(
    '.zenn-embedded-github, .zenn-embedded-tweet, .zenn-embedded-card, .embed-youtube'
  );
  embeds.forEach((embed) => {
    const p = embed.parentElement;
    if (p?.tagName !== 'P') {
      // .zenn-embedded-tweet は @[tweet](url) の構文もあり、linkifyではない
      return;
    }

    // 不要な<a />を削除
    embed.nextSibling?.remove();

    // 子要素の<br />を全て削除
    p.childNodes.forEach((child) => {
      if (child instanceof HTMLElement && child.tagName === 'BR') {
        child.remove();
      }
    });

    // 埋め込み要素を親要素の前に移動
    p.parentElement?.insertBefore(embed.cloneNode(true), p);
    embed.remove();

    // もし中身が空なら削除（テキストノードが存在する可能性がある）
    if (p.childElementCount === 0) {
      p.remove();
      return;
    }
  });
}

function adjustFootnotes(dom: HTMLElement) {
  const footnotes = dom.querySelector('section.footnotes');
  footnotes?.firstChild?.remove(); // titleを削除

  const items = footnotes?.querySelectorAll('li');
  items?.forEach((item) => {
    const backRefAnchor = item.querySelector('a.footnote-backref');
    const id = backRefAnchor?.getAttribute('href')?.replace('#', '');
    if (!id) throw new Error('footnote back reference id not found');

    item.setAttribute('data-footnote-reference-id', id);
    backRefAnchor?.remove();
  });
}

/*
 * markdownToHtmlでToC用のスラッグがテキストから生成されるが、
 * 編集で変わるため contenteditable では IME と相性が悪い。
 * そこで編集中はランダムIDを振るようにする。
 */
function addHeadingRandomId(dom: HTMLElement) {
  const headings = dom.querySelectorAll('h1, h2, h3');
  headings.forEach((heading) => {
    heading.id = crypto.randomUUID();
  });
}
