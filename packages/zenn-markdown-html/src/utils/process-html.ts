import cheerio from 'cheerio';

type cheerioProcesser = (cheerioRoot: cheerio.Root) => void;

// Thanks: https://github.com/forem/forem/blob/d2d9984f28b1d0662f2a858b325a0e6b7a27a24c/app/liquid_tags/gist_tag.rb
function isGistUrl(url: string): boolean {
  return !!url.match(
    /^https:\/\/gist\.github\.com\/([a-zA-Z0-9](-?[a-zA-Z0-9]){0,38})\/([a-zA-Z0-9]){1,32}(\/[a-zA-Z0-9]+)?(\?file=.+)?$/
  );
}

function generateCardHtml(url: string) {
  return `<div class="embed-zenn-link"><iframe src="https://asia-northeast1-zenn-dev-production.cloudfunctions.net/iframeLinkCard?url=${encodeURIComponent(
    url
  )}" frameborder="0" scrolling="no" loading="lazy"></iframe></div>`;
}

function generateGistHtml(url: string) {
  /**
   * gistのURL は
   * - https://gist.github.com/foo/bar.json
   * - https://gist.github.com/foo/bar.json?file=example.js
   * のような形式
   */
  const [pageUrl, file] = url.split('?file=');

  return `<div class="embed-gist"><embed-gist page-url="${pageUrl}" encoded-filename="${
    file ? encodeURIComponent(file) : ''
  }" /></div>`;
}

const linkToEmbed: cheerioProcesser = function ($) {
  $('body > p > .linkified').each(function (this: cheerio.Element) {
    // 直前にテキストが存在する場合は変換しない
    const isPrevAnyText =
      $(this).get(0)?.previousSibling?.type === 'text' &&
      $(this).get(0).previousSibling.data !== '\n';
    if (isPrevAnyText) return;

    // 直後にテキストが存在する場合は変換しない
    const isNextAnyText = $(this).get(0)?.nextSibling?.type === 'text';
    if (isNextAnyText) return;

    // 前に要素がない
    const isPrevNoElement = !$(this).prev().get(0);

    // 直前にbrタグ
    const isPrevBr = $(this).prev().get(0)?.tagName === 'br';

    const isPrevEmpty = isPrevNoElement || isPrevBr;

    if (!isPrevEmpty) return;

    const url = $(this).attr('href');
    if (!url) return;

    if (isPrevBr) {
      $(this).prev('br')?.remove();
    }

    let replacedHtml = '';
    if (isGistUrl(url)) {
      replacedHtml = generateGistHtml(url);
    } else {
      replacedHtml = generateCardHtml(url);
    }
    return $(this).replaceWith(replacedHtml);
  });
};

export function processHtml(html: string) {
  if (!html || html.length < 5) return html;

  const $ = cheerio.load(html);
  linkToEmbed($);
  // cheerioで自動でhtmlとbodyが付与されてしまうため、除く
  // ref: https://github.com/cheeriojs/cheerio/issues/1031
  // workaround: https://zenn.dev/catnose99/articles/76d77ac4a352d3
  return $(`body`).html() || '';
}
