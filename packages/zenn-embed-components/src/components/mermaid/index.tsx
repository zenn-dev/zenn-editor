import { css } from '@emotion/react';
import mermaid from 'mermaid';
import { useEffect } from 'react';

// レンダリングする図ごとの最大文字数
const MAX_CHAR_LIMIT = 2000;

// https://mermaid-js.github.io/mermaid/#/flowchart?id=chaining-of-links
// フローチャートのチェイン数制限
// graph LR
//    a --> b & c--> d
// に対応するが、少ない記述でノード接続が爆発する可能性があるため最大数を制限する
const MAX_CHAINING_OF_LINKS_LIMIT = 10;

// コンポーネント側でもつデフォルトの設定
const DEFAULT_CONFIG = {
  startOnLoad: true, // 読み込み時にレンダリング
  securityLevel: 'strict', // tags in text are encoded, click functionality is disabled
  theme: 'default',
  er: {
    useMaxWidth: true,
  },
  flowchart: {
    useMaxWidth: true, // 表示の都合上見切れるのもスクロールするのも嫌なので最大幅を有効にする
    htmlLabels: false, // セキュリティのため、HTMLラベルは許可しない
  },
  sequence: {
    useMaxWidth: true,
  },
  class: {
    useMaxWidth: true,
  },
  journey: {
    useMaxWidth: true,
  },
};

export interface EmbedMermaidProps {
  /** mermaidの記述 */
  content?: string;

  /** mermaidのConfig。Config型がexportされておらず利用できないので仕方なくany。 */
  config?: any;
}

export const EmbedMermaid = ({ content, config }: EmbedMermaidProps) => {
  mermaid.mermaidAPI.initialize({ ...DEFAULT_CONFIG, ...config });
  useEffect(() => {
    mermaid.contentLoaded();
  }, []);

  if (!content) return <></>;

  // 文法エラーやパフォーマンスリスクが検出された場合、注意書きをレンダリングして終了
  const results = validate(content);
  const errors = Object.values(results).filter((result) => result.hasError);

  if (errors.length > 0) {
    return (
      <div
        css={css`
          font-family: Roboto, Helvetica, Arial, sans-serif;
          font-size: 0.875rem;
          background-color: #ffeff2;
          border: 1px solid pink;
          border-radius: 6px;
          padding: 16px 24px;
          color: #000000a6;
        `}
      >
        <p>mermaidをレンダリングできません。</p>
        <ul>
          {errors.map((e, i) => (
            <li key={i}>{e.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  return <div className="mermaid">{content}</div>;
};

type ErrorContainer = {
  hasError: boolean;
  message: string;
};

type ValidateResult = {
  charLimitOver: ErrorContainer;
  chainingOfLinksOver: ErrorContainer;
};

function validate(source: string): ValidateResult {
  return {
    charLimitOver: {
      hasError: source.length > MAX_CHAR_LIMIT,
      message: `ブロックあたりの文字数上限は${MAX_CHAR_LIMIT}です`,
    },
    chainingOfLinksOver: {
      hasError: (source.match(/&/g) || []).length > MAX_CHAINING_OF_LINKS_LIMIT,
      message: `ブロックあたりの & によるチェイン上限は${MAX_CHAINING_OF_LINKS_LIMIT}です`,
    },
  };
}
