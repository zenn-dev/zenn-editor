import cheerio from 'cheerio';

export function twitterEmbed(html: string) {
  if (!html || html.length < 5) return html;

  const $ = cheerio.load(html);

  $('body .twitter-embed').each(function (this: cheerio.Element) {
    // 直前にテキストが存在する場合は変換しない
    const href = $(this).attr('href');
    $(this).replaceWith(`<twitter-embed href="${href}"></div>`);
  });
  // cheerioで自動でhtmlとbodyが付与されてしまうため、除く
  // ref: https://github.com/cheeriojs/cheerio/issues/1031
  // workaround: https://zenn.dev/catnose99/articles/76d77ac4a352d3
  return $(`body`).html() || '';
}
