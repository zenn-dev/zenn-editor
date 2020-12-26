import { loadScript } from '../utils/load-script';

export class EmbedTweet extends HTMLElement {
  targetClass = 'embed-tweet';

  constructor() {
    super();
    // TODO できそうならshadow DOMにする
    // this.attachShadow({ mode: 'open' });
  }

  renderError() {
    this.innerHTML = `<div style="text-align: center; margin: 1.5rem 0; color: gray; font-size: 0.9rem;">
    Tweetの読み込みに失敗しました<br>  
    ${this.getAttribute('src')}
    </div>`;
  }

  render() {
    const url = this.getAttribute('src');
    if (!url) {
      this.renderError();
      return;
    }

    this.innerHTML = `<div class="${this.targetClass} tweet-container">
      <a href="${url}"></a>
  </div>`;
  }

  async connectedCallback() {
    const url = this.getAttribute('src') ?? '';
    this.render();
    try {
      await loadScript({
        src: 'https://platform.twitter.com/widgets.js',
        id: 'embed-tweet',
      });
      const match = url?.match(
        /https?:\/\/twitter.com\/(.*?)\/status\/(.*?)\/?$/
      );
      if (match && match[2]) {
        (window as any).twttr?.widgets?.createTweet(
          match[2],
          this.querySelector(`.${this.targetClass}`)
        );
      }
    } catch {
      this.renderError();
    }
  }
}
