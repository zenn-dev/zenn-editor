import { loadScript } from '../utils/load-script';
import { loadStylesheet } from '../utils/load-stylesheet';

declare let katex: any;

const containerId = 'katex-container';

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
        // 本来はバージョンを指定した方がいいが、他の処理との兼ね合いでバージョンを固定するのは難しいので指定していません
        src: `https://cdn.jsdelivr.net/npm/katex/dist/katex.min.js`,
        id: 'katex-js',
      });
    }

    // CSSを読み込む（まだ読み込まれていない場合のみ）
    loadStylesheet({
      // 本来はバージョンを指定した方がいいが、他の処理との兼ね合いでバージョンを固定するのは難しいので指定していません
      href: `https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css`,
      id: `katex-css`,
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
