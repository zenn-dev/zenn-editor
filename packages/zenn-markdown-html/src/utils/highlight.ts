/**
 * Shiki によるシンタックスハイライト処理
 *
 * このモジュールは Phase 2（applyHighlighting）から呼び出され、
 * 個々のコードブロックをハイライトする役割を持つ。
 *
 * ## 特徴
 *
 * - シングルトン: ハイライターインスタンスは1つだけ作成され再利用される
 * - 遅延ロード: 言語定義は初回使用時にのみロードされる
 * - diff サポート: ベース言語のハイライト + diff 背景色の両方を適用
 * - transformers: Shiki の transformers API で AST レベルの変換を実行
 *
 * ## 関連ファイル
 *
 * - `md-renderer-fence.ts`: Phase 1（収集）と Phase 3（置換）
 * - `index.ts`: 全体の統合
 */

import {
  createHighlighter,
  Highlighter,
  bundledLanguages,
  BundledLanguage,
  ShikiTransformer,
} from 'shiki';

/**
 * Shiki ハイライターのシングルトンインスタンス
 * getHighlighter() で初期化され、以降は再利用される
 */
let highlighterInstance: Highlighter | null = null;

const SHIKI_THEME = 'github-dark';

/**
 * Shiki ハイライターを初期化する
 * 最初は最低限のセットで初期化し、必要に応じて言語をロードする
 */
export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  // 最初は空の言語セットで初期化（高速）
  highlighterInstance = await createHighlighter({
    themes: [SHIKI_THEME],
    langs: [],
  });

  return highlighterInstance;
}

/**
 * 言語がサポートされているかチェックし、必要に応じてロードする
 */
async function ensureLanguageLoaded(
  highlighter: Highlighter,
  langName: string
): Promise<boolean> {
  // 既にロード済みかチェック
  const loadedLangs = highlighter.getLoadedLanguages();
  if (loadedLangs.includes(langName)) {
    return true;
  }

  // bundledLanguages に含まれているかチェック
  if (langName in bundledLanguages) {
    await highlighter.loadLanguage(langName as BundledLanguage);
    return true;
  }

  return false;
}

/**
 * ハイライトオプション
 */
export interface HighlightOptions {
  /** diff モードかどうか */
  hasDiff: boolean;
  /** 追加するクラス名 */
  className: string;
  /** Markdown ソースの行番号（ソースマップ用） */
  line?: number;
}

/**
 * diff プレフィックスの定義
 * Prism.js の diff-highlight プラグインと互換性を持たせる
 */
const DIFF_PREFIXES = {
  // 削除行
  '-': 'remove', // deleted-sign
  '<': 'remove', // deleted-arrow
  // 挿入行
  '+': 'add', // inserted-sign
  '>': 'add', // inserted-arrow
} as const;

/** コンテキスト行（変更なし）のプレフィックス */
const DIFF_CONTEXT_PREFIX = ' ';

/**
 * diff 行スタイルを適用する transformer を作成
 * 行頭のプレフィックス (+, -, <, >, スペース) を検出して処理
 * - +, -, <, >: 挿入/削除のクラスを追加し、プレフィックスをラップ
 * - スペース: プレフィックスのみラップ（コンテキスト行）
 */
function createDiffTransformer(): ShikiTransformer {
  return {
    line(node, lineNumber) {
      // ソースコードの該当行を取得
      const lines = this.source.split('\n');
      const lineText = lines[lineNumber - 1] ?? '';
      const firstChar = lineText.charAt(0);

      if (firstChar in DIFF_PREFIXES) {
        // 追加/削除行
        this.addClassToHast(node, 'diff');
        this.addClassToHast(
          node,
          DIFF_PREFIXES[firstChar as keyof typeof DIFF_PREFIXES]
        );
        wrapDiffPrefix(node, firstChar);
      } else if (firstChar === DIFF_CONTEXT_PREFIX) {
        // コンテキスト行（先頭スペース）
        wrapDiffPrefix(node, firstChar);
      }
    },
  };
}

/**
 * 行の最初の文字（diff プレフィックス）を別の span 要素にラップする
 * これにより CSS で user-select: none を適用可能になる
 */
function wrapDiffPrefix(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lineNode: any,
  prefix: string
): void {
  const line = lineNode;

  if (!line.children || line.children.length === 0) return;

  const firstChild = line.children[0];

  // 最初の子要素がテキストノードの場合（実際には発生しないはずだが念の為）
  if (firstChild.type === 'text' && firstChild.value.startsWith(prefix)) {
    // プレフィックスを分離
    const prefixSpan = {
      type: 'element',
      tagName: 'span',
      properties: { class: 'diff-prefix' },
      children: [{ type: 'text', value: prefix }],
    };
    firstChild.value = firstChild.value.slice(1);

    // 空になった場合は削除
    if (firstChild.value === '') {
      line.children.shift();
    }

    // プレフィックス span を先頭に挿入
    line.children.unshift(prefixSpan);
    return;
  }

  // 最初の子要素が element（span など）の場合
  if (
    firstChild.type === 'element' &&
    firstChild.children &&
    firstChild.children.length > 0
  ) {
    const innerFirst = firstChild.children[0];
    if (innerFirst.type === 'text' && innerFirst.value.startsWith(prefix)) {
      // プレフィックスを分離
      const prefixSpan = {
        type: 'element',
        tagName: 'span',
        properties: { class: 'diff-prefix' },
        children: [{ type: 'text', value: prefix }],
      };
      innerFirst.value = innerFirst.value.slice(1);

      // 空になった場合は削除
      if (innerFirst.value === '') {
        firstChild.children.shift();
      }

      // プレフィックス span を先頭に挿入
      line.children.unshift(prefixSpan);
    }
  }
}

/**
 * pre/code タグにクラスと属性を追加する transformer を作成
 */
function createClassTransformer(options: {
  className: string;
  line?: number;
}): ShikiTransformer {
  const { className, line } = options;
  return {
    pre(node) {
      if (className) {
        this.addClassToHast(node, className);
      }
    },
    code(node) {
      this.addClassToHast(node, 'code-line');
      if (className) {
        this.addClassToHast(node, className);
      }
      if (line !== undefined) {
        node.properties['data-line'] = line;
      }
    },
  };
}

/**
 * [Phase 2 の実処理] コードをハイライトする
 *
 * applyHighlighting() から各コードブロックに対して呼び出される。
 * 言語が未ロードの場合は自動的にロードする（遅延ロード）。
 * Shiki の transformers API を使用して AST レベルで変換を行う。
 *
 * @param text - ハイライト対象のコード文字列
 * @param langName - 言語名（例: "javascript", "python"）
 * @param options - ハイライトオプション
 * @returns ハイライト済み HTML（常に <pre><code> 構造）
 */
export async function highlight(
  text: string,
  langName: string,
  options: HighlightOptions
): Promise<string> {
  const { hasDiff, className, line } = options;
  const highlighter = await getHighlighter();

  // 言語がサポートされているか確認し、必要に応じてロード
  const isSupported = langName
    ? await ensureLanguageLoaded(highlighter, langName)
    : false;

  // サポートされていない言語は text（プレーンテキスト）として処理
  // ref: https://shiki.style/languages#plain-text
  const lang = isSupported ? langName : 'text';
  if (!isSupported) {
    await ensureLanguageLoaded(highlighter, 'text');
  }

  // transformers を構築
  const transformers: ShikiTransformer[] = [
    createClassTransformer({ className, line }),
  ];
  if (hasDiff) {
    transformers.push(createDiffTransformer());
  }

  return highlighter.codeToHtml(text, {
    lang,
    theme: SHIKI_THEME,
    transformers,
  });
}
