/**
 * コードブロックのレンダリングとシンタックスハイライト
 *
 * ## 非同期処理アーキテクチャの概要
 *
 * Shiki（シンタックスハイライター）は非同期APIを持つが、
 * markdown-it のレンダラーは同期的に文字列を返す必要がある。
 * この制約を解決するため、プレースホルダー方式を採用している。
 *
 * ### 処理フロー（3フェーズ）
 *
 * ```
 * [Phase 1: 収集] markdown-it レンダリング（同期）
 *     ↓
 *     コードブロックを検出するたびに:
 *     1. コードブロック情報を配列に保存
 *     2. プレースホルダー（HTMLコメント）を返す
 *     ↓
 *     出力: プレースホルダー付きHTML + コードブロック情報配列
 *
 * [Phase 2: ハイライト] Shiki によるハイライト（非同期・並列）
 *     ↓
 *     Promise.all で全コードブロックを並列処理
 *     ↓
 *     出力: ハイライト済みHTML配列
 *
 * [Phase 3: 置換] プレースホルダーを置換（同期）
 *     ↓
 *     プレースホルダーをハイライト済みHTMLに置換
 *     ↓
 *     出力: 最終HTML
 * ```
 *
 * ### この方式のメリット
 *
 * 1. 同期/非同期の不一致を解決: markdown-it の同期的なプラグインシステムを維持
 * 2. 並列処理: 複数のコードブロックを Promise.all で同時にハイライト
 * 3. 遅延ロード: Shiki の言語定義を必要に応じてロード（メモリ効率）
 *
 * ### 関連ファイル
 *
 * - `index.ts`: markdownToHtml() - 3フェーズを統合
 * - `highlight.ts`: highlight() - Shiki によるハイライト処理
 * - `md-renderer-fence.ts`: このファイル - Phase 1 と 3 を担当
 */

import MarkdownIt from 'markdown-it';
import { md } from './markdown-it';
import { MarkdownOptions } from '../types';
import { highlight } from './highlight';

/**
 * コードブロック情報を保存するインターフェース
 * Phase 1 で収集し、Phase 2 でハイライト処理に使用
 */
export interface CodeBlockInfo {
  content: string;
  langName: string;
  hasDiff: boolean;
  fileName?: string;
  line?: number;
  placeholder: string;
}

// プレースホルダーのプレフィックス
const PLACEHOLDER_PREFIX = '<!--SHIKI_CODE_BLOCK_';
const PLACEHOLDER_SUFFIX = '-->';

/**
 * ランダムな8文字の文字列を生成する
 */
function generateRandomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * プレースホルダーを生成する
 * ユーザーが本文中に同じ文字列を書いても衝突しないようランダムIDを使用
 */
function createPlaceholder(): string {
  return `${PLACEHOLDER_PREFIX}${generateRandomId()}${PLACEHOLDER_SUFFIX}`;
}

/**
 * コードブロックの HTML を生成する
 * Shiki の出力（<pre><code>...</code></pre>）を外側のコンテナでラップする
 * 注: <pre> や <code> へのクラス・属性追加は highlight() の transformers で行う
 */
function wrapHighlightedCode({
  highlightedHtml,
  fileName,
}: {
  highlightedHtml: string;
  fileName?: string;
}): string {
  // ファイル名コンテナを追加
  const fileNameHtml = fileName
    ? `<div class="code-block-filename-container"><span class="code-block-filename">${md.utils.escapeHtml(
        fileName
      )}</span></div>`
    : '';

  return `<div class="code-block-container">${fileNameHtml}${highlightedHtml}</div>`;
}

/**
 * エラー時のフォールバック HTML を生成
 * Shiki でのハイライトに失敗した場合に使用
 */
function getPlainHtml({
  content,
  fileName,
  line,
}: {
  content: string;
  fileName?: string;
  line?: number;
}): string {
  const escapedContent = md.utils.escapeHtml(content);
  const lineAttr = line !== undefined ? ` data-line="${line}"` : '';

  const preHtml = `<pre><code class="code-line"${lineAttr}>${escapedContent}</code></pre>`;

  return wrapHighlightedCode({ highlightedHtml: preHtml, fileName });
}

function getClassName({
  langName = '',
  hasDiff,
}: {
  hasDiff: boolean;
  langName?: string;
}): string {
  const isSafe = /^[\w-]{0,30}$/.test(langName);
  if (!isSafe) return '';

  if (hasDiff) {
    return `diff-highlight ${langName.length ? `language-diff-${langName}` : ''}`;
  }
  return langName ? `language-${langName}` : '';
}

// Shiki がネイティブサポートしていない言語のフォールバック
const fallbackLanguages: {
  [key: string]: string;
} = {
  react: 'jsx',
  cwl: 'yaml',
};

function normalizeLangName(str?: string): string {
  if (!str?.length) return '';
  const langName = str.toLocaleLowerCase();
  return fallbackLanguages[langName] ?? langName;
}

export function parseInfo(str: string): {
  hasDiff: boolean;
  langName: string;
  fileName?: string;
} {
  if (str.trim() === '') {
    return {
      langName: '',
      fileName: undefined,
      hasDiff: false,
    };
  }

  // e.g. foo:filename => ["foo", "filename"]
  // e.g. foo diff:filename => ["foo diff", "filename"]
  // e.g. foo:filename:bar => ["foo", "filename:bar"]
  const separatorIndex = str.indexOf(':');
  const langInfo = separatorIndex > -1 ? str.substring(0, separatorIndex) : str;
  const fileName =
    separatorIndex > -1 ? str.substring(separatorIndex + 1) : undefined;

  const langNames = langInfo.split(' ');
  const hasDiff = langNames.some((name) => name === 'diff');

  const langName: undefined | string = hasDiff
    ? langNames.find((lang) => lang !== 'diff')
    : langNames[0];

  return {
    langName: normalizeLangName(langName),
    fileName,
    hasDiff,
  };
}

/**
 * [Phase 1] markdown-it にコードブロックのレンダラーを登録する
 *
 * markdown-it がコードブロック（```）を検出するたびに呼ばれ、
 * 以下の処理を行う:
 * 1. コードブロックの情報（内容、言語、diff有無など）を codeBlocks 配列に追加
 * 2. プレースホルダー（例: <!--SHIKI_CODE_BLOCK_xxxxxxxx-->）を返す
 *
 * このレンダラーは同期的に動作し、実際のハイライト処理は
 * Phase 2（applyHighlighting）で非同期に行われる。
 *
 * @param md - markdown-it インスタンス
 * @param options - Markdown 変換オプション
 * @param codeBlocks - コードブロック情報を格納する配列（副作用で変更される）
 */
export function mdRendererFence(
  md: MarkdownIt,
  options: MarkdownOptions,
  codeBlocks: CodeBlockInfo[]
) {
  // override fence
  md.renderer.rules.fence = function (...args) {
    const [tokens, idx] = args;
    const { info, content } = tokens[idx];
    const { langName, fileName, hasDiff } = parseInfo(info);

    if (langName === 'mermaid') {
      const generator = options.customEmbed?.mermaid;
      // generator が(上書きされて)定義されてない場合はそのまま出力する
      return generator ? generator(content.trim(), options) : content;
    }

    const fenceStart = tokens[idx].map?.[0];
    const placeholder = createPlaceholder();

    codeBlocks.push({
      content,
      langName,
      hasDiff,
      fileName,
      line: fenceStart,
      placeholder,
    });
    return placeholder;
  };
}

/**
 * [Phase 2 & 3] プレースホルダーをハイライトされたコードに置換する
 *
 * Phase 2: 全コードブロックを Shiki で並列ハイライト
 *   - Promise.all により、複数のコードブロックを同時に処理
 *   - 各コードブロックに対して highlight() を呼び出し
 *   - 言語が未ロードの場合は自動的にロード（遅延ロード）
 *
 * Phase 3: プレースホルダーを置換
 *   - <!--SHIKI_CODE_BLOCK_xxxxxxxx--> を実際のハイライト済み HTML に置換
 *
 * @param html - プレースホルダーを含む HTML 文字列
 * @param codeBlocks - Phase 1 で収集したコードブロック情報の配列
 * @returns ハイライト済みの完全な HTML 文字列
 */
export async function applyHighlighting(
  html: string,
  codeBlocks: CodeBlockInfo[]
): Promise<string> {
  // すべてのコードブロックを並列でハイライト
  const highlightedBlocks = await Promise.all(
    codeBlocks.map(async (block) => {
      const className = getClassName({
        langName: block.langName,
        hasDiff: block.hasDiff,
      });

      try {
        const highlightedHtml = await highlight(block.content, block.langName, {
          hasDiff: block.hasDiff,
          className,
          line: block.line,
        });

        return wrapHighlightedCode({
          highlightedHtml,
          fileName: block.fileName,
        });
      } catch {
        // エラー時はプレーンテキストとして出力
        return getPlainHtml({
          content: block.content,
          fileName: block.fileName,
          line: block.line,
        });
      }
    })
  );

  // プレースホルダーを置換
  let result = html;
  for (let i = 0; i < highlightedBlocks.length; i++) {
    result = result.replace(codeBlocks[i].placeholder, highlightedBlocks[i]);
  }

  return result;
}
