import type { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { Prism } from 'zenn-markdown-html';

const fallbackLanguages: {
  [key: string]: string;
} = {
  vue: 'html',
  react: 'jsx',
  fish: 'shell',
  sh: 'shell',
  cwl: 'yaml',
  tf: 'hcl', // ref: https://github.com/PrismJS/prism/issues/1252
};

export function normalizeLangName(str?: string): string {
  if (!str?.length) return 'plaintext';

  console.log(Prism.languages, str);
  let langName = str.toLocaleLowerCase();
  langName = fallbackLanguages[langName] ?? langName;
  langName = Prism.languages[langName?.replace(/diff-/, '')]
    ? langName
    : 'plaintext';
  return langName;
}

// NOTE: nodesが<span>とtextノードのみであり、ネストなしの必要がある
export function parseNodes(
  nodes: Node[],
  className: string[] = []
): { text: string; classes: string[] }[] {
  return nodes.flatMap((node) => {
    const classes = [...className];

    // エレメントノードの場合、クラス名を取得
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.className) {
        classes.push(...element.className.split(' ').filter(Boolean));
      }
    }

    // 子ノードがある場合は再帰的に処理
    if (node.childNodes && node.childNodes.length > 0) {
      return parseNodes(Array.from(node.childNodes), classes);
    }

    // テキストノードの場合
    if (node.nodeType === Node.TEXT_NODE) {
      return {
        text: node.textContent || '',
        classes,
      };
    }

    return {
      text: node.textContent || '',
      classes,
    };
  });
}

export function getHighlightNodes(html: string) {
  const pre = document.createElement('pre');
  pre.innerHTML = html;
  return Array.from(pre.childNodes);
}

/*
  diff-highlightは出力されるHTMLが構造化の観点で微妙なので、挙動をまとめる

  基本的な挙動は以下のように行単位でブロックのspanが生成される
  <span class="line"><span class="token">1</span></span>
  <span class="line"><span class="token"2</span></span>

  - 差分ではない行はトップレベルのtextNodeとして扱われる
  - 繋がったtextNode, insert, deleteの行は1つのspan・textNodeとして出力される
  - 改行コードが各々のトップレベルノードの末尾に含まれている。繋がったノードは途中に改行コードが含まれる。
    - この末尾の改行コードは基本的に意味ない
    - 次の行が最終行かつ空行の時のみ、意味を持つ（）
    - coordの場合は改行コードが含まれず、次の行にTextNode「\n」が続く
*/
function getDiffHighlightLineNodesByTextNode(
  textNode: Node,
  isCodeEnd: boolean
) {
  const lineNodes: HTMLElement[] = [];
  // テキストノードは行単位に分割する
  const text = textNode.textContent || '';
  const lines = text.split('\n');

  if (text.endsWith('\n') && !isCodeEnd) {
    // 文末の改行以外は不要。NodeViewと位置がズレるため削除
    lines.pop();
  }

  lines.forEach((line) => {
    const span = document.createElement('span');
    span.textContent = line;
    lineNodes.push(span);
  });

  return lineNodes;
}

function getDiffHighlightLineNodesByDiffElement(
  el: HTMLElement,
  isLastChild: boolean
) {
  const lineNodes: HTMLElement[] = [];
  let lineNode = document.createElement('span');

  el.childNodes.forEach((token, j) => {
    const text = token.textContent || '';

    const isCodeEnd = isLastChild && j === el.childNodes.length - 1;

    if (text.endsWith('\n') || isCodeEnd) {
      if (text.endsWith('\n')) {
        token.textContent = text.slice(0, -1);
      }

      lineNode.appendChild(token.cloneNode(true));
      lineNode.classList.add(...el.classList);
      lineNodes.push(lineNode);
      lineNode = document.createElement('span');
    } else {
      lineNode.appendChild(token.cloneNode(true));
    }
  });

  return lineNodes;
}

function getDiffHighlightLineNodesByCoord(coordEl: HTMLElement) {
  const lineNodes: HTMLElement[] = [];

  if (!coordEl.classList.contains('coord')) {
    throw new Error('coord要素ではありません');
  }

  lineNodes.push(coordEl.cloneNode(true) as HTMLElement);
  const nextNode = coordEl.nextSibling;
  if (nextNode) {
    if (nextNode.nodeType !== Node.TEXT_NODE) {
      throw new Error('coordの次のノードがtextNodeではない');
    }

    // coordの次のノードは改行TextNodeなので、先頭の改行を削除
    nextNode.textContent = (nextNode.textContent || '').slice(1);
    if (nextNode.textContent === '') {
      nextNode.remove(); // 改行のみのテキストノードであれば削除
    }
  }

  return lineNodes;
}

/*
  diff-highlightの構造を行単位に変換する
  <span class="line"><span class="token keyword">const</span>;</span>
  <span class="line"><span class="token keyword">const</span>;</span>
*/
export function getDiffHighlightLineNodes(html: string) {
  const pre = document.createElement('pre');
  pre.innerHTML = html;

  // 差分ノードでは、行ブロックなため末尾の不要な行を削除する
  const lineNodes: HTMLElement[] = [];
  pre.childNodes.forEach((topChild, i) => {
    const isCodeEnd = i === pre.childNodes.length - 1;

    if (topChild.nodeType === Node.TEXT_NODE) {
      lineNodes.push(
        ...getDiffHighlightLineNodesByTextNode(topChild, isCodeEnd)
      );
    } else if (
      topChild instanceof HTMLElement &&
      topChild.classList.contains('coord')
    ) {
      lineNodes.push(...getDiffHighlightLineNodesByCoord(topChild));
    } else if (topChild instanceof HTMLElement) {
      lineNodes.push(
        ...getDiffHighlightLineNodesByDiffElement(topChild, isCodeEnd)
      );
    }
  });

  return lineNodes;
}

export function highlightCode(code: string, language: string): string {
  try {
    const isDiff = language.startsWith('diff');
    const targetLanguage = isDiff ? 'diff' : language;

    return Prism.highlight(code, Prism.languages[targetLanguage], language);
  } catch {
    console.warn(
      `Language "${language}" not supported, falling back to plaintext`
    );
    return Prism.highlight(code, Prism.languages.plaintext, 'plaintext');
  }
}

export function getDiffCode(codeNode: ProsemirrorNode): string {
  const lines: string[] = [];

  codeNode.forEach((child) => {
    lines.push(child.textContent || '');
  });

  return lines.join('\n');
}
