import { getByJsonp } from '../utils/jsonp';

type GistApiResponse = {
  stylesheet: string;
  div: string;
};

// ホットリロード等、再レンダリング時のちらつきを防ぐためにhtmlの値をキャッシュする（リロードで消える）
const resultHtmlStore: {
  [cacheKey: string]: string;
} = {};

export class EmbedGist extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const cachedHtml = resultHtmlStore[this.getCacheKey()];
    if (cachedHtml) {
      shadowRoot.innerHTML = cachedHtml;
    }
  }

  render(data: GistApiResponse) {
    if (!(this.shadowRoot && data.stylesheet && data.div)) {
      this.renderError();
      return;
    }
    const resultHtml = `<link rel="stylesheet" href="${data.stylesheet}"><div>${data.div}</div>`;
    // gistのhtmlをキャッシュする
    resultHtmlStore[this.getCacheKey()] = resultHtml;
    this.shadowRoot.innerHTML = resultHtml;
  }

  renderError() {
    this.innerHTML = `<div style="text-align: center; margin: 1.5rem 0; color: gray; font-size: 0.9rem;">
    Gistの読み込みに失敗しました<br>  
    ${this.getAttribute('page-url')}
    </div>`;
  }

  getCacheKey() {
    return encodeURIComponent(
      `${this.getAttribute('page-url')}-${this.getAttribute(
        'encoded-filename'
      )}`
    );
  }

  async connectedCallback() {
    // キャッシュがある場合は再リクエストしない
    if (resultHtmlStore[this.getCacheKey()]) return;

    const pageUrl = this.getAttribute('page-url');
    const encodedFileName = this.getAttribute('encoded-filename');
    if (!pageUrl) return;

    const requestURL =
      pageUrlToRequestUrl(pageUrl) +
      (encodedFileName?.length ? `?file=${encodedFileName}` : '');

    try {
      const data = await getByJsonp<GistApiResponse>(requestURL);
      this.render(data);
    } catch (e) {
      console.log(e);
      this.renderError();
    }
  }
}

function pageUrlToRequestUrl(url: string) {
  if (url.endsWith('.json')) return url;
  if (url.endsWith('.js')) return url.replace('.js', '.json');
  return `${url}.json`;
}
