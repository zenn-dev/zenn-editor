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

export interface EmbedMermaid {
  /** mermaidの記述 */
  content?: string;

  /** mermaidのConfig。Config型がexportされておらず利用できないので仕方なくany。 */
  config?: any;
}

export const Mermaid = ({ content, config }: EmbedMermaid) => {
  mermaid.mermaidAPI.initialize({ ...DEFAULT_CONFIG, ...config });
  useEffect(() => {
    mermaid.contentLoaded();
  }, [config]);

  if (!content) return <></>;

  // 文法エラーやパフォーマンスリスクが検出された場合、注意書きをレンダリングして終了
  const risk = getPotentialPerformanceRisk(content);

  // if (
  //   Object.values(risk)
  //     .map((r) => r.hasError)
  //     .includes(true)
  // ) {
  //   return (
  //     <div
  //       css={css`
  //         color: red;
  //       `}
  //     >
  //       mermaidをレンダリングできません
  //     </div>
  //   );
  // }

  return <div className="mermaid">{content}</div>;
};

type ErrorContainer = {
  hasError: boolean;
  message: string;
};

type PotentialRisk = {
  syntaxError: ErrorContainer;
  charLimitOver: ErrorContainer;
  chainingOfLinksOver: ErrorContainer;
};

function getPotentialPerformanceRisk(source: string): PotentialRisk {
  const isPretty = (() => {
    try {
      // eslint-disable-next-line
      mermaid!.mermaidAPI.parse(source);
      return true;
    } catch (e) {
      console.log(
        'mermaid.js のレンダリングでシンタックスエラーが発生しました',
        e
      );
      return false;
    }
  })();
  return {
    syntaxError: {
      hasError: !isPretty,
      message: `<li>シンタックスエラーです</li>`,
    },
    charLimitOver: {
      hasError: source.length > MAX_CHAR_LIMIT,
      message: `<li>ブロックあたりの文字数上限は${MAX_CHAR_LIMIT}です</li>`,
    },
    chainingOfLinksOver: {
      hasError: (source.match(/&/g) || []).length > MAX_CHAINING_OF_LINKS_LIMIT,
      message: `<li>ブロックあたりの<code>&</code>によるチェイン上限は${MAX_CHAINING_OF_LINKS_LIMIT}です</li>`,
    },
  };
}
