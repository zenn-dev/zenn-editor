import { loadScript } from "./load-script";

export const initTweet = async () => {
  loadScript({
    src: "https://platform.twitter.com/widgets.js",
    skipIfExist: false,
  });
};

export const initMathjax = async () => {
  const hasLoaded = !!(<any>window).MathJax; // すでにスクリプトが読み込み済みか
  if (hasLoaded) {
    // 読み込み済みの場合は再描画して終了
    return (<any>window).MathJax.typeset();
  }
  // 初回のみオプションを指定
  (<any>window).MathJax = {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
    },
  };
  loadScript({
    src: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js",
    id: "mathjax",
    skipIfExist: true,
  });
};
