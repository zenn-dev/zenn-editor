import { escapeHtml } from "./md-base";
// ref: https://github.com/posva/markdown-it-custom-block
// e.g.
// @[youtube](youtube-video-id)

export const optionCustomBlock = {
  youtube(videoId: string) {
    if (!videoId?.match(/^[a-zA-Z0-9_-]+$/)) {
      return "YouTubeのvideoIDが不正です";
    }
    return `<div class="embed-youtube"><iframe src="https://www.youtube.com/embed/${escapeHtml(
      videoId
    )}" allowfullscreen loading="lazy"></iframe></div>`;
  },
  slideshare(key: string) {
    if (!key?.match(/^[a-zA-Z0-9_-]+$/)) {
      return "Slide Shareのkeyが不正です";
    }
    return `<div class="embed-slideshare"><iframe src="https://www.slideshare.net/slideshow/embed_code/key/${escapeHtml(
      key
    )}" scrolling="no" allowfullscreen loading="lazy"></iframe></div>`;
  },
  speakerdeck(key: string) {
    if (!key?.match(/^[a-zA-Z0-9_-]+$/)) {
      return "Speaker Deckのkeyが不正です";
    }
    return `<div class="embed-speakerdeck"><iframe src="https://speakerdeck.com/player/${escapeHtml(
      key
    )}" scrolling="no" allowfullscreen allow="encrypted-media" loading="lazy"></iframe></div>`;
  },
  jsfiddle(str: string) {
    if (!str?.match(/^(http|https):\/\/jsfiddle\.net\/[a-zA-Z0-9_,\/\-]+$/)) {
      return "jsfiddleのURLが不正です";
    }
    // URLを~/embedded/とする
    // ※ すでにembeddedもしくはembedが含まれるURLが入力されている場合は、そのままURLを使用する。
    let url = str;
    if (!url.includes("embed")) {
      url = url.endsWith("/") ? `${url}embedded/` : `${url}/embedded/`;
    }
    return `<div class="embed-jsfiddle"><iframe src="${url}" scrolling="no" frameborder="no" allowfullscreen allowtransparency="true" loading="lazy"></iframe></div>`;
  },
  codepen(str: string) {
    if (!str?.match(/^https:\/\/codepen\.io\/[a-zA-Z0-9]/)) {
      return "CodePenのURLが不正です";
    }
    const url = new URL(str.replace("/pen/", "/embed/"));
    url.searchParams.set("embed-version", "2");
    return `<div class="embed-codepen"><iframe src="${url}" scrolling="no" scrolling="no" frameborder="no" allowtransparency="true" loading="lazy"></iframe></div>`;
  },
  // クライアントでhttps://platform.twitter.com/widgets.jsを読み込む必要あり
  tweet(str: string) {
    if (!str?.match(/^https:\/\/twitter.com\/[a-zA-Z0-9\_\-\/]+$/)) {
      return "ツイートページのURLを指定してください";
    }
    return `<div class="embed-tweet tweet-container"><blockquote class="twitter-tweet"><a href="${str}"></a></blockquote></div>`;
  },
};
