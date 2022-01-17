import { loadScript } from '../utils/load-script';
import { loadStylesheet } from '../utils/load-stylesheet';

declare let katex: any;

const katexVersion = '0.13.13';
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
        src: `https://cdn.jsdelivr.net/npm/katex@${katexVersion}/dist/katex.min.js`,
        id: 'katex-js',
      });
    }

    // CSSを読み込む（まだ読み込まれていない場合のみ）
    loadStylesheet({
      href: `https://cdn.jsdelivr.net/npm/katex@${katexVersion}/dist/katex.min.css`,
      id: `katex-css`,
    });

    const displayMode = !!this.getAttribute('display-mode');

    // detailsタグの中ではinnerTextがnullになることがあるため
    const content = this.textContent || this.innerText;
    katex?.render(content, this._container, {
      macros: { '\\RR': '\\mathbb{R}' },
      throwOnError: false,
      displayMode,
    });
    this.innerHTML = this._container.innerHTML;
  }
}
