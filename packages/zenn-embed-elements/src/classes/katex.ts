import { loadScript } from '../utils/load-script';
import { loadStylesheet } from '../utils/load-stylesheet';

declare let katex: any;

const containerId = 'katex-container';

// CDN 上のファイルが改ざんされた場合に備えて、バージョンを固定したうえで
// Subresource Integrity（SRI）で内容を検証する。
// バージョンを更新する際は、各ファイルのハッシュも次のコマンドで再計算すること。
//   curl -sL <URL> | openssl dgst -sha384 -binary | openssl base64 -A
export const KATEX_VERSION = '0.19.0';
export const KATEX_JS_SRC = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`;
export const KATEX_JS_INTEGRITY =
  'sha384-QFFtAGzvvj+bfgCGxXJlNZZR1nXEZgvG8tDLCCY1F19xl20WlfTYgguB4VcNdxYk';
export const KATEX_CSS_HREF = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`;
export const KATEX_CSS_INTEGRITY =
  'sha384-3rdsX6e5mueWyoweR9NIVmtEsUkokpBT/0ALqKKIBMr9j4qhHkaIkAcGgsE6uVlp';

export class EmbedKatex extends HTMLElement {
  private _container: HTMLDivElement;

  constructor() {
    super();
    const container = document.createElement('div');
    container.setAttribute('id', containerId);
    this._container = container;
  }

  async connectedCallback() {
    this.render();
  }

  async render() {
    if (typeof katex === 'undefined') {
      await loadScript({
        src: KATEX_JS_SRC,
        id: 'katex-js',
        integrity: KATEX_JS_INTEGRITY,
        crossOrigin: 'anonymous',
      });
    }

    // CSSを読み込む（まだ読み込まれていない場合のみ）
    loadStylesheet({
      href: KATEX_CSS_HREF,
      id: `katex-css`,
      integrity: KATEX_CSS_INTEGRITY,
      crossOrigin: 'anonymous',
    });

    const displayMode = !!this.getAttribute('display-mode');

    // レンダリング済みの要素が cloneNode で複製されて再接続されると
    // （脚注ツールチップ等）、textContent はレンダリング結果のテキストに
    // なっているため、初回レンダリング時に元のソースを属性へ保存しておき、
    // 2回目以降はそこから読み出す
    let content = this.getAttribute('data-tex-source');
    if (content === null) {
      // detailsタグの中ではinnerTextがnullになることがあるため
      content = this.textContent || this.innerText;
      this.setAttribute('data-tex-source', content);
    }
    katex?.render(content, this._container, {
      macros: { '\\RR': '\\mathbb{R}' },
      throwOnError: false,
      displayMode,
    });
    this.innerHTML = this._container.innerHTML;
  }
}
