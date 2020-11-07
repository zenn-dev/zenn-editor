import { loadScript, loadStylesheet } from "./utils/load-external-source";

export default async function () {
  initTweet();
  initKatex();
}

declare var twttr: any;

async function initTweet() {
  // load script only when .twitter-tweet exist
  if (!document.querySelector(".twitter-tweet")) return;

  await loadScript({
    src: "https://platform.twitter.com/widgets.js",
    id: "embed-tweet",
    funcToRefresh: () => {
      twttr?.widgets?.load() // render again if alread script loaded
    }
  });
}

async function initKatex() {
  if (!document.querySelector(".katex")) return;
  loadStylesheet({
    id: "katex-css",
    href: "https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css",
  });
}
