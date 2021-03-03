// Twitterを初期化するためには widgets.js を読み込む必要があるが、
// 公式ドキュメントに記載されている下記のscriptをあらかじめheadなどで読み込んでおけば、
// それ以降ではscriptを改めて読み込まずに window.twtter.createTweet メソッドが使用可能
// ref: https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/set-up-twitter-for-websites

const initTwitterScriptInner = `window.twttr=(function(f,b,g){var e,c=f.getElementsByTagName(b)[0],a=window.twttr||{};if(f.getElementById(g)){return a}e=f.createElement(b);e.id=g;e.src="https://platform.twitter.com/widgets.js";c.parentNode.insertBefore(e,c);a._e=[];a.ready=function(d){a._e.push(d)};return a}(document,"script","twitter-wjs"));`;

export default initTwitterScriptInner;
