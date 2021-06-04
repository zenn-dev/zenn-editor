/**
 * original: https://github.com/gitlabhq/gitlabhq/blob/master/app/assets/javascripts/behaviors/markdown/render_mermaid.js
 */

import { loadScript } from '../utils/load-script';

// レンダリングする図ごとの最大文字数
const MAX_CHAR_LIMIT = 2000;

// https://mermaid-js.github.io/mermaid/#/flowchart?id=chaining-of-links
// 新しい仕様で
// graph LR
//    a --> b & c--> d
// に対応するが、少ない記述でノード接続が爆発する可能性があるため最大数を制限する
const MAX_CHAINING_OF_LINKS_LIMIT = 10;

// Page values
declare let mermaid: any;
const containerId = 'mermaid-container';

async function initMermaid(): Promise<void> {
  if (typeof mermaid === 'undefined') {
    await loadScript({
      src: 'https://cdn.jsdelivr.net/npm/mermaid@8.10/dist/mermaid.min.js',
      id: 'mermaid-js',
    });
    const theme = 'neutral';

    mermaid!.mermaidAPI.initialize({
      startOnLoad: false, // レンダリングはこちらでやるので false
      securityLevel: 'strict', // tags in text are encoded, click functionality is disabled
      theme,
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
    });

    console.log(mermaid!.mermaidAPI.getConfig());
  }
}

type ErrorContainer = {
  yes: boolean;
  message: string;
};

type PotentialRisk = {
  syntaxError: ErrorContainer;
  charLimitOver: ErrorContainer;
  chainingOfLinksOver: ErrorContainer;
};

function getPotentialPerformanceRisk(source: string): PotentialRisk {
  return {
    syntaxError: {
      yes: mermaid!.mermaidAPI
        .parse(source)
        .then((_: any) => false)
        .catch((_: any) => true),
      message: `<li>シンタックスエラーです</li>`,
    },
    charLimitOver: {
      yes: source.length > MAX_CHAR_LIMIT,
      message: `<li>ブロックあたりの文字数上限は${MAX_CHAR_LIMIT}です</li>`,
    },
    chainingOfLinksOver: {
      yes: (source.match(/&/g) || []).length > MAX_CHAINING_OF_LINKS_LIMIT,
      message: `<li>ブロックあたりの&によるチェイン上限は${MAX_CHAINING_OF_LINKS_LIMIT}です</li>`,
    },
  };
}

function fixElementContent(content: string) {
  // Mermaid doesn't like `<br />` tags, so collapse all like tags into `<br>`, which is parsed correctly.
  return content.replace(/<br\s*\/>/g, '<br>');
}

export class EmbedMermaid extends HTMLElement {
  private _container: HTMLDivElement;

  constructor() {
    super();
    this._container = this.childNodes[0] as HTMLDivElement;
  }

  async connectedCallback() {
    this.render();
  }

  async render() {
    await initMermaid();
    const source = fixElementContent(this._container.innerText || '');

    // Mermaid モジュールの読み込みに失敗したり、レンダリング対象のコンテンツが空の場合は何もせずに終了
    if (!source) {
      return;
    }

    // パフォーマンスリスクが検出された場合、注意書きをレンダリングして終了
    const risk = getPotentialPerformanceRisk(source);
    if (
      Object.values(risk)
        .map((r) => r.yes)
        .includes(true)
    ) {
      this.innerHTML = `
       <p>
        <span>mermaidのレンダリングでパフォーマンス上のリスクが検出されました。</span>
        <ul>
        ${risk.charLimitOver.yes ? risk.charLimitOver.message : ''}
        ${risk.chainingOfLinksOver.yes ? risk.chainingOfLinksOver.message : ''}
        </ul>
       </p>
      `;
      return;
    }

    // すべて通過した場合はレンダリングする
    const insert = (svgCode: string, bindFunctions: any) => {
      this.innerHTML = svgCode;
      bindFunctions(this._container);
    };
    mermaid?.mermaidAPI.render(
      `${containerId}-${Date.now().valueOf()}`,
      source,
      insert
    );
  }
}
