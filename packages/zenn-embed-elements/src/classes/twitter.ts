import { loadScript } from '../utils/load-script';

export class EmbedTwitter extends HTMLElement {
  targetClass = 'embed-tweet';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  renderError() {
    this.innerHTML = `<div style="text-align: center; margin: 1.5rem 0; color: gray; font-size: 0.9rem;">
    Twitterの読み込みに失敗しました<br>  
    ${this.getAttribute('page-url')}
    </div>`;
  }

  render() {
    const href = this.getAttribute('href');
    if (!this.shadowRoot || !href) {
      this.renderError();
      return;
    }

    this.shadowRoot.innerHTML = `<div class="${this.targetClass} tweet-container">
    <blockquote class="twitter-tweet">
      <a href="${href}"></a>
    </blockquote>
  </div>`;
  }

  async connectedCallback() {
    this.render();
    try {
      await loadScript({
        src: 'https://platform.twitter.com/widgets.js',
        id: 'embed-tweet',
      });
      (window as any).twttr?.widgets?.load(
        this.shadowRoot?.querySelector(`.${this.targetClass}`)
      );
    } catch {
      this.renderError();
    }
  }
}
