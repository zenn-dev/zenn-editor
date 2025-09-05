import type { Mark, Node } from '@tiptap/pm/model';
import { MarkdownSerializer } from 'prosemirror-markdown';
import { getDiffCode } from '../extensions/nodes/code-block-container/utils';
import type { EmbedType } from '../types';
import {
  extractSlideshareEmbedParams,
  extractYoutubeVideoParameters,
} from './url';

// MarkdownSerializerStateの型拡張
declare module 'prosemirror-markdown' {
  interface MarkdownSerializerState {
    inAutolink?: boolean;
    footnoteItem?: number;
    tableRowIsFirst?: boolean;
    closed: Node | null; // 直前に閉じたノード
  }
}

export function renderMarkdown(node: Node) {
  const markdown = markdownSerializer.serialize(node);
  return markdown;
}

const markdownSerializer = new MarkdownSerializer(
  {
    paragraph(state, node) {
      state.renderInline(node);
      state.closeBlock(node);
    },
    heading(state, node) {
      state.write(`${state.repeat('#', node.attrs.level)} `);
      state.renderInline(node, false);
      state.closeBlock(node);
    },
    bulletList(state, node) {
      state.renderList(node, '  ', () => '- ');
    },
    orderedList(state, node) {
      state.renderList(node, '  ', (i) => `${i + 1}. `);
    },
    listItem(state, node) {
      state.renderContent(node);
    },
    text(state, node) {
      state.text(node.text ?? '');
    },
    blockquote(state, node) {
      state.wrapBlock('> ', null, node, () => state.renderContent(node));
    },
    horizontalRule(state, node) {
      state.write(node.attrs.markup || '---');
      state.closeBlock(node);
    },
    message(state, node) {
      const type = node.attrs.type === 'message' ? '' : node.attrs.type;
      const nestDepth = getZennNotationNestDepth(node);

      state.write(
        `${':'.repeat(nestDepth + 2)}message${type ? ` ${type}` : ''}\n`
      );
      state.renderContent(node);

      // HACK: 内部的に使われているclosedをnullにすることで、ブロックの改行をさせない
      state.closed = null;
      state.write('\n');
      state.write(':'.repeat(nestDepth + 2));

      state.closeBlock(node);
    },
    messageContent(state, node) {
      state.renderInline(node);
    },
    hardBreak(state) {
      state.write('\n');
    },
    codeBlockContainer(state, node) {
      if (!node.firstChild || !node.lastChild) {
        throw new Error('Invalid code block container');
      }

      const fileName = node.firstChild.textContent;
      const preContentNode = node.lastChild; // 通常 or 差分ブロック

      const backticks = preContentNode.textContent.match(/`{3,}/gm);
      const fence = backticks ? `${backticks.sort().slice(-1)[0]}\`` : '```';
      const isDiff = preContentNode.attrs.language?.startsWith('diff');
      let language = preContentNode.attrs.language?.replace(/diff-?/, '') || '';
      language = language.replace(/^(plain|plaintext)$/, ''); // plain, plaintextは言語指定なしとみなす

      state.write(
        fence +
          (isDiff ? 'diff ' : '') +
          language +
          (fileName ? `:${fileName}` : '') +
          '\n'
      );
      const text = isDiff
        ? getDiffCode(preContentNode)
        : preContentNode.textContent || '';

      state.text(text, false);
      state.write('\n');
      state.write(fence);
      state.closeBlock(node);
    },
    figure(state, node) {
      const src = node.firstChild?.attrs.src || '';
      const alt = node.firstChild?.attrs.alt || '';
      const width = node.firstChild?.attrs.width;
      const caption = node.lastChild?.textContent || '';
      state.write(`![${alt}](${src}`);
      if (width != null) {
        state.write(` =${width}x`);
      }
      state.write(')');

      if (caption) {
        state.write(`\n*${caption}*`);
      }
      state.closeBlock(node);
    },
    embed(state, node) {
      const type = node.attrs.type as EmbedType;
      let urlBlock = '';
      if (type === 'card' || type === 'tweet' || type === 'github') {
        urlBlock = node.attrs.url;
      } else if (type === 'youtube') {
        // 埋め込みURLから通常の動画URLに変換
        const params = extractYoutubeVideoParameters(node.attrs.url);
        const videoId = params?.videoId;
        if (!videoId) new Error('Invalid YouTube URL');

        urlBlock = `https://www.youtube.com/watch?v=${videoId}`;
      } else if (type === 'figma') {
        const query = new URL(node.attrs.url).searchParams;
        const url = query.get('url');
        if (!url) throw new Error('Invalid Figma URL');

        urlBlock = `@[figma](${url})`;
      } else if (type === 'codepen') {
        const url = node.attrs.url.replace('/embed/', '/pen/');

        urlBlock = `@[codepen](${url})`;
      } else if (type === 'slideshare') {
        const params = extractSlideshareEmbedParams(node.attrs.url);

        urlBlock = `@[slideshare](${params?.embedId})`;
      } else {
        urlBlock = `\`\`\`mermaid\n${node.attrs.url}\n\`\`\``;
      }

      state.write(urlBlock);
      state.closeBlock(node);
    },
    details(state, node) {
      if (!node.firstChild || !node.lastChild) {
        throw new Error('Invalid details');
      }

      const summary = node.firstChild;
      const content = node.lastChild;
      const title = summary.textContent || 'emptyTitle'; // detailsはタイトルが必須
      const nestDepth = getZennNotationNestDepth(node);

      state.write(`${':'.repeat(nestDepth + 2)}details ${title}\n`);
      state.renderContent(content);

      // HACK: 内部的に使われているclosedをnullにすることで、ブロックの改行をさせない
      state.closed = null;
      state.write('\n');
      state.write(':'.repeat(nestDepth + 2));

      state.closeBlock(node);
    },
    detailsContent(state, node) {
      state.renderInline(node);
    },
    speakerDeckEmbed(state, node) {
      const urlBlock = `@[speakerdeck](${node.attrs.embedId}${node.attrs.slideIndex ? `?slide=${node.attrs.slideIndex}` : ''})`;
      state.write(urlBlock);
      state.closeBlock(node);
    },
    footnoteReference(state, node) {
      state.write(`[^${node.attrs.referenceNumber}]`);
    },
    footnotes(state, node) {
      state.write('\n\n');
      state.renderContent(node);
    },
    footnotesList(state, node) {
      state.renderContent(node);
    },
    footnoteItem(state, node) {
      state.footnoteItem = (state.footnoteItem || 0) + 1;
      state.write(`[^${state.footnoteItem}]: `);
      state.renderInline(node);
      state.closeBlock(node);
    },
    table(state, node) {
      state.renderContent(node);
      state.closeBlock(node);
    },
    tableRow(state, node) {
      state.tableRowIsFirst = true;
      state.renderContent(node);
      state.write('\n');

      if (node.firstChild?.type.name === 'tableHeader') {
        // ヘッダー行の下に区切り行を追加
        state.write('| ');
        for (let i = 0; i < node.childCount; i++) {
          state.write('--- | ');
        }
        state.write('\n');
      }
    },
    tableHeader(state, node) {
      if (state.tableRowIsFirst) {
        state.tableRowIsFirst = false;
        state.write('| ');
      }
      state.renderInline(node);
      state.write(' | ');
    },
    tableCell(state, node) {
      if (state.tableRowIsFirst) {
        state.tableRowIsFirst = false;
        state.write('| ');
      }
      state.renderInline(node);
      state.write(' | ');
    },
  },
  {
    link: {
      open(state, mark, parent, index) {
        state.inAutolink = isPlainURL(mark, parent, index);
        if (state.inAutolink) return '';
        return '[';
      },
      close(state, mark) {
        const { inAutolink } = state;
        state.inAutolink = undefined;

        if (inAutolink) return '';

        return (
          '](' +
          mark.attrs.href.replace(/[()"]/g, '\\$&') +
          (mark.attrs.title
            ? ` "${mark.attrs.title.replace(/"/g, '\\"')}"`
            : '') +
          ')'
        );
      },
      mixable: true,
    },
    bold: {
      open: '**',
      close: '**',
      mixable: true,
      expelEnclosingWhitespace: true,
    },
    code: {
      open: '`',
      close: '`',
      escape: false,
    },
    italic: {
      open: '*',
      close: '*',
      mixable: true,
      expelEnclosingWhitespace: true,
    },
    strike: {
      open: '~~',
      close: '~~',
      mixable: true,
      expelEnclosingWhitespace: true,
    },
  }
);

function isPlainURL(link: Mark, parent: Node, index: number) {
  if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) return false;
  const content = parent.child(index);
  if (
    !content.isText ||
    content.text !== link.attrs.href ||
    content.marks[content.marks.length - 1] !== link
  )
    return false;
  return (
    index === parent.childCount - 1 ||
    !link.isInSet(parent.child(index + 1).marks)
  );
}

// 子要素にあるZennの独自拡張のネストの深さを取得する
function getZennNotationNestDepth(node: Node) {
  let depth = 0;

  for (const child of node.children) {
    depth = Math.max(depth, getZennNotationNestDepth(child));
  }

  if (node.type.name === 'details' || node.type.name === 'message') {
    depth++;
  }

  return depth;
}

export { markdownSerializer };
