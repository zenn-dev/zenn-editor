import { loadScript } from '../utils/load-script';

declare let mermaid: any;
const containerId = 'mermaid-container';

export class EmbedMermaid extends HTMLElement {
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
    if (typeof mermaid === 'undefined') {
      await loadScript({
        src: 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js',
        id: 'mermaid-js',
      });
    }

    mermaid?.initialize({
      startOnLoad: true,
    });
    mermaid?.render('id1', this.innerText || '', undefined, this._container);
    this.innerHTML = this._container.innerHTML;
  }
}
