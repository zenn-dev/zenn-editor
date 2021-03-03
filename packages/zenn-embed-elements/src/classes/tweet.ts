/**
 * iframeの高さを取ってキャッシュすることで、ホットリロードでのガタツキを防ぐ
 */
const heightStore: {
  [tweetId: string]: string;
} = {};
const containerClassName = 'embed-tweet-container';
const fallbackLinkClassName = 'embed-tweet-link';

export class EmbedTweet extends HTMLElement {
  url?: string;
  tweetId?: string;

  constructor() {
    super();
    const url = this.getAttribute('src');
    if (!url) return;
    this.url = url;
    const match = url.match(
      /https?:\/\/twitter.com\/(.*?)\/status\/(\d+)[/?]?/
    );
    if (match && match[2]) {
      this.tweetId = match[2];
    }
  }

  async connectedCallback() {
    this.render();
    this.embedTweet();
  }

  render() {
    const attribute =
      this.tweetId && heightStore[this.tweetId]
        ? `style="min-height: ${encodeURIComponent(
            heightStore[this.tweetId]
          )};"`
        : '';
    this.innerHTML = `<div class="${containerClassName}" ${attribute}>
      <a href="${this.url}" class="${fallbackLinkClassName}" rel="nofollow">${this.url}</a>
    </div>`;
  }

  async embedTweet() {
    const tweetId = this.tweetId;
    if (!(this.url && tweetId)) {
      console.log(`Invalid tweet URL:${this.url}`);
      return;
    }

    const container = this.querySelector(`.${containerClassName}`);
    const disableConversation = this.url.includes('?conversation=none');

    (window as any).twttr.widgets
      .createTweet(this.tweetId, container, {
        align: 'center',
        ...(disableConversation ? { conversation: 'none' } : {}),
      })
      .then(() => {
        /**
         * createTweetではJSONPを使っている（？）ためか、catch でエラーハンドリングができない
         * => fallback用のリンクをはじめから表示しておき、埋め込みが成功したら削除する
         */
        this.querySelector(`.${fallbackLinkClassName}`)?.remove();
        const iframe = this.querySelector('iframe');
        if (!iframe) return;
        setTimeout(() => {
          heightStore[tweetId] = iframe.style.height;
        }, 1000); // 正確な高さを取るために少し待つ
      });
  }
}
