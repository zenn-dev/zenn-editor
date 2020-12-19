import cheerio from 'cheerio';

export function linkToCard(html: string) {
  if (!html || html.length < 5) return html;

  const $ = cheerio.load(html);

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
    if (isPrevBr) {
      $(this).prev('br')?.remove();
    }
    if (url) {
      $(this).replaceWith(
        `<div class="embed-zenn-link"><iframe src="https://asia-northeast1-zenn-dev-production.cloudfunctions.net/iframeLinkCard?url=${encodeURIComponent(
          url
        )}" frameborder="0" scrolling="no" loading="lazy"></iframe></div>`
      );
    }
  });
  // cheerioで自動でhtmlとbodyが付与されてしまうため、除く
  // ref: https://github.com/cheeriojs/cheerio/issues/1031
  // workaround: https://zenn.dev/catnose99/articles/76d77ac4a352d3
  return $(`body`).html() || '';
}
