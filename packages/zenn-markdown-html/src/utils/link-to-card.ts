import cheerio from 'cheerio';

export function linkToCard(html: string) {
  if (!html || html.length < 5) return html;

  const $ = cheerio.load(html);

  $('body > p > .linkified').each(function (this: cheerio.Element) {
    // 前に要素がない かつ 直前にテキストが存在しない
    const isPrevEmpty =
      !$(this).prev().get(0) &&
      $(this).get(0)?.previousSibling?.type !== 'text';

    // 直前にbrタグ
    const isPrevBrTag = $(this).prev().get(0)?.tagName === 'br';

    if (!(isPrevEmpty || isPrevBrTag)) return;

    // 直後にテキストが存在する場合は変換しない
    if ($(this).get(0)?.nextSibling?.type === 'text') return;

    const url = $(this).attr('href');
    if (isPrevBrTag) {
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
