import { loadScript, loadStylesheet } from "./utils/load-external-source";

export const initEmbed = () => {
  initTweet();
  initKatex();
};

async function initTweet() {
  if (!document.querySelector(".twitter-tweet")) return;
  loadScript({
    src: "https://platform.twitter.com/widgets.js",
    id: "embed-tweet",
    refreshIfExist: true,
  });
}

async function initKatex() {
  if (!document.querySelector(".katex")) return;
  loadStylesheet({
    id: "katex-css",
    href: "https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css",
  });
}
