import markdownIt from 'markdown-it';
import { sanitize } from './sanitizer';
import { embedGenerators } from './embed';
import { MarkdownOptions } from './types';

// plugins
import markdownItImSize from '@steelydylan/markdown-it-imsize';
import markdownItAnchor from 'markdown-it-anchor';
import { mdBr } from './utils/md-br';
import { mdKatex } from './utils/md-katex';
import { mdCustomBlock } from './utils/md-custom-block';
import { mdLinkAttributes } from './utils/md-link-attributes';
import { mdSourceMap } from './utils/md-source-map';
import { mdLinkifyToCard } from './utils/md-linkify-to-card';
import {
  mdRendererFence,
  applyHighlighting,
  CodeBlockInfo,
} from './utils/md-renderer-fence';
import { mdImage } from './utils/md-image';
import {
  containerDetailsOptions,
  containerMessageOptions,
} from './utils/md-container';
import mdContainer from 'markdown-it-container';
import mdFootnote from 'markdown-it-footnote';
import mdTaskLists from 'markdown-it-task-lists';
import mdInlineComments from 'markdown-it-inline-comments';

/**
 * Markdown を HTML に変換する（非同期）
 *
 * Shiki によるシンタックスハイライトを使用。
 * 詳細なアーキテクチャについては md-renderer-fence.ts のコメントを参照。
 *
 * 処理フロー:
 * 1. [Phase 1] md.render() - Markdown を HTML に変換（コードブロックはプレースホルダーに）
 * 2. [Phase 2 & 3] applyHighlighting() - プレースホルダーをハイライト済み HTML に置換
 * 3. sanitize() - XSS 対策のためサニタイズ
 */
const markdownToHtml = async (
  text: string,
  options?: MarkdownOptions
): Promise<string> => {
  if (!(text && text.length)) return '';

  const markdownOptions: MarkdownOptions = {
    ...options,
    customEmbed: {
      ...embedGenerators,
      ...options?.customEmbed,
    },
  };

  const md = markdownIt({ breaks: true, linkify: true });

  md.linkify.set({ fuzzyLink: false });
  md.linkify.set({ fuzzyEmail: false }); // refs: https://github.com/markdown-it/linkify-it

  // コードブロック情報を保存する配列
  // Phase 1 で mdRendererFence によって追加され、Phase 2 でハイライト処理に使用される
  const codeBlocks: CodeBlockInfo[] = [];

  md.use(mdBr)
    .use(mdKatex)
    .use(mdFootnote)
    .use(mdInlineComments)
    .use(markdownItImSize)
    .use(mdLinkAttributes)
    .use(mdCustomBlock, markdownOptions)
    .use(mdRendererFence, markdownOptions, codeBlocks)
    .use(mdLinkifyToCard, markdownOptions)
    .use(mdTaskLists, { enabled: true })
    .use(mdContainer, 'details', containerDetailsOptions)
    .use(mdContainer, 'message', containerMessageOptions)
    .use(markdownItAnchor, {
      level: [1, 2, 3, 4],
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: 'before',
        class: 'header-anchor-link',
        symbol: '',
      }),
      tabIndex: false,
    })
    .use(mdSourceMap)
    .use(mdImage);

  // custom footnote
  md.renderer.rules.footnote_block_open = () =>
    '<section class="footnotes">\n' +
    '<span class="footnotes-title">脚注</span>\n' +
    '<ol class="footnotes-list">\n';

  // docIdは複数のコメントが1ページに指定されたときに脚注のリンク先が重複しないように指定する
  // 1ページの中で重複しなければ問題ないため、ごく短いランダムな文字列とする
  // - https://github.com/zenn-dev/zenn-community/issues/356
  // - https://github.com/markdown-it/markdown-it-footnote/pull/8
  // Web Crypto API を使用（ブラウザ・Node.js 両対応）
  const randomBytes = new Uint8Array(2);
  globalThis.crypto.getRandomValues(randomBytes);
  const docId = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');

  // ============================================================
  // Phase 1: Markdown → HTML 変換（同期）
  // ============================================================
  // markdown-it がコードブロックを検出すると mdRendererFence が呼ばれ、
  // コードブロック情報が codeBlocks 配列に保存され、
  // HTML にはプレースホルダー（<!--SHIKI_CODE_BLOCK_xxxxxxxx-->）が挿入される
  const rawHtml = md.render(text, { docId });

  // ============================================================
  // Phase 2 & 3: シンタックスハイライト適用（非同期）
  // ============================================================
  // - Phase 2: 全コードブロックを Shiki で並列ハイライト
  // - Phase 3: プレースホルダーをハイライト済み HTML に置換
  const highlightedHtml = await applyHighlighting(rawHtml, codeBlocks);

  // サニタイズして返す（XSS 対策）
  return sanitize(highlightedHtml);
};

export default markdownToHtml;
export { markdownToSimpleHtml } from './markdown-to-simple-html';
