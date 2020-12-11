import { loadScript } from './utils/load-external-source';

export default async function () {
  initTweet();
}

declare let twttr: any;

async function initTweet() {
  // load script only when .twitter-tweet exist
  if (!document.querySelector('.twitter-tweet')) return;

  await loadScript({
    src: 'https://platform.twitter.com/widgets.js',
    id: 'embed-tweet',
    funcToRefresh: () => {
      twttr?.widgets?.load(); // render again if alread script loaded
    },
  });
}
