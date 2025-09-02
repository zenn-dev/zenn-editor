import markdownToHtml from 'zenn-markdown-html';
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
          child.innerHTML = child.textContent || '';
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

// URL単体の埋め込み要素は、不要なリンクとパラグラフを持つので削除する
function removeEmbedDeco(dom: HTMLElement) {
  const embeds = dom.querySelectorAll(
    '.zenn-embedded-github, .zenn-embedded-tweet, .zenn-embedded-card, .embed-youtube'
  );
  embeds.forEach((embed) => {
    // 不要なリンクを削除
    embed.nextSibling?.remove();

    // 不要な親のpタグを削除し、埋め込み要素を親要素の位置に置換
    const notUsedP = embed.parentElement;
    if (notUsedP?.tagName !== 'P') {
      console.error(embed);
      throw new Error('should be embed with only url');
    }

    notUsedP.parentElement?.replaceChild(embed, notUsedP);
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
