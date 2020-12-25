import { getByJsonp } from '../utils/jsonp';

type GistApiResponse = {
  stylesheet: string;
  div: string;
};

export class EmbedGist extends HTMLElement {
  render(data: GistApiResponse) {
    const shadowRoot = this.attachShadow({ mode: 'closed' });
    shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${data.stylesheet}">
      <div>${data.div}</div>
    `;
  }

  renderError() {
    this.innerHTML = `<div style="text-align: center; margin: 1.5rem 0; color: gray; font-size: 0.9rem;">
    Gistの読み込みに失敗しました<br>  
    ${this.getAttribute('page-url')}
    </div>`;
  }

  async connectedCallback() {
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
