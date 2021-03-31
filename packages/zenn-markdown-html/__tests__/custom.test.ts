import markdownToHtml from '../src/index';
import { escapeHtml } from 'markdown-it/lib/common/utils';

describe('Handle custom markdown format properly', () => {
  test('should generate codesandbox html', () => {
    const html = markdownToHtml(
      '@[codesandbox](https://codesandbox.io/embed/guess-movie-erpn1?fontsize=14&hidenavigation=1&theme=dark)'
    );
    expect(html).toContain(
      '<div class="embed-codesandbox"><iframe src="https://codesandbox.io/embed/guess-movie-erpn1?fontsize=14&hidenavigation=1&theme=dark" style="width:100%;height:500px;border:none;overflow:hidden;" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" loading="lazy" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe></div>'
    );
  });
  test('should not generate codesandbox html with invalid url', () => {
    const html = markdownToHtml(
      '@[codesandbox](https://codesandbox.io/embed/guess-movie-er")'
    );
    expect(html).toContain(
      '「https://codesandbox.io/embed/」から始まる正しいURLを入力してください'
    );
  });
  test('should convert a gist-link with gist-element', () => {
    const html = markdownToHtml(
      `@[gist](https://gist.github.com/gdb/b6365e79be6052e7531e7ba6ea8caf23)`
    );
    expect(html).toEqual(
      '<div class="embed-gist"><embed-gist page-url="https://gist.github.com/gdb/b6365e79be6052e7531e7ba6ea8caf23" encoded-filename="" /></div>\n'
    );
  });
  test('should convert a gist-link with gist-element with file', () => {
    const html = markdownToHtml(
      `@[gist](https://gist.github.com/foo/bar?file=test.json)`
    );
    expect(html).toEqual(
      '<div class="embed-gist"><embed-gist page-url="https://gist.github.com/foo/bar" encoded-filename="test.json" /></div>\n'
    );
  });
  test('should convert a gist-link with gist-element with encoded file', () => {
    const html = markdownToHtml(
      `@[gist](https://gist.github.com/foo/bar?file=あ漢字$)`
    );
    expect(html).toEqual(
      '<div class="embed-gist"><embed-gist page-url="https://gist.github.com/foo/bar" encoded-filename="%E3%81%82%E6%BC%A2%E5%AD%97%24" /></div>\n'
    );
  });

  test('should generate card html', () => {
    const html = markdownToHtml(`@[card](https://example.com/__test__)`);
    expect(html).toEqual(
      `<div class="embed-zenn-link"><iframe src="https://card.zenn.dev/?url=https%3A%2F%2Fexample.com%2F__test__" frameborder="0" scrolling="no" loading="lazy"></iframe></div>\n`
    );
  });

  test('should generate valid message box html', () => {
    const html = markdownToHtml(':::message alert\nhello\n:::');
    expect(html).toContain('<div class="msg alert"><p>hello</p>\n</div>');
  });

  test('should generate youtube html', () => {
    const html = markdownToHtml('@[youtube](AXaoi6dz59A)');
    expect(html.trim()).toStrictEqual(
      `<div class="embed-youtube"><iframe src="https://www.youtube.com/embed/AXaoi6dz59A?loop=1&playlist=AXaoi6dz59A" allowfullscreen loading="lazy"></iframe></div>`.trim()
    );
  });

  test.each`
    url                                                                                                  | videoId
    ${'http://www.youtube.com/watch?v=lK-zaWCp-co&feature=g-all-u&context=G27a8a4aFAAAAAAAAAAA'}         | ${'lK-zaWCp-co'}
    ${'http://youtu.be/AXaoi6dz59A'}                                                                     | ${'AXaoi6dz59A'}
    ${'https://youtube.com/watch?gl=NL&hl=nl&feature=g-vrec&context=G2584313RVAAAAAAAABA&v=35LqQPKylEA'} | ${'35LqQPKylEA'}
  `('$url should generate youtube html', ({ url, videoId }) => {
    const html = markdownToHtml(url);
    const escapeUrl = escapeHtml(url);
    expect(html.trim()).toStrictEqual(
      `<p><div class="embed-youtube"><iframe src="https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}" allowfullscreen loading="lazy"></iframe></div><a href="${escapeUrl}" style="display: none" rel="nofollow">${escapeUrl}</a></p>`.trim()
    );
  });

  /**
   * YouTube のIDは抽出できる対象だが、その前に AutoLink 対象ではないために変換処理が走らない
   */
  test.each`
    url                                                                                          | videoId
    ${'youtube.com/watch?gl=NL&hl=nl&feature=g-vrec&context=G2584313RVAAAAAAAABA&v=35LqQPKylEA'} | ${'35LqQPKylEA'}
  `('$url should not generate youtube html', ({ url, videoId }) => {
    const html = markdownToHtml(url);
    const escapeUrl = escapeHtml(url);
    expect(html.trim()).toStrictEqual(`<p>${escapeUrl}</p>`.trim());
  });
});
