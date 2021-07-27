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
  test('should not convert to gist-links with invalid links', () => {
    // ref: https://dev.to/antogarand/pwned-together-hacking-devto-hkd
    const invalidUrls = [
      'http://gist.github.com/TestUsername/abcdefghijklmnopqrstuvwxyzabcdef',
      'https://gist.github.com/TestUsername/abcdefghijklmnopqrstuvwxyzabcdef/raw/abcdefghijklmnopqrstuvwxyzabcdefghijkl/xss.js',
      'https://gist.github.com/abcdefghijklmnopqrstuvwxyzabcdefabcdefgh/abcdefghijklmnopqrstuvwxyzabcdef',
    ];
    invalidUrls.forEach((url) => {
      const html = markdownToHtml(`@[gist](${url})`);
      expect(html).toEqual('GitHub GistのページURLを指定してください\n');
    });
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
    const html = markdownToHtml(':::message\nhello\n:::');
    expect(html).toContain('<div class="msg "><p>hello</p>\n</div>');
  });

  test('should generate valid alert message box html', () => {
    const validMarkdownPatterns = [
      ':::message alert\nhello\n:::',
      ':::message alert  \nhello\n:::',
      ':::message   alert  \nhello\n:::',
    ];
    validMarkdownPatterns.forEach((markdown) => {
      const html = markdownToHtml(markdown);
      expect(html).toContain('<div class="msg alert"><p>hello</p>\n</div>');
    });
  });

  test('should not generate message box with invalid class', () => {
    const html = markdownToHtml(':::message invalid"\nhello\n:::');
    expect(html).not.toContain('<div class="msg');
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
    ${'https://www.youtube.com/watch?v=fnr9XWvjJHw'}                                                     | ${'fnr9XWvjJHw'}
    ${'https://www.youtube.com/watch?v=fnr9XWvjJHw&start=19101s'}                                        | ${'fnr9XWvjJHw'}
    ${'https://www.youtube.com/watch?v=fnr9XWvjJHw&t=19101second'}                                       | ${'fnr9XWvjJHw'}
    ${'http://youtu.be/AXaoi6dz59A'}                                                                     | ${'AXaoi6dz59A'}
    ${'http://youtu.be/AXaoi6dz59A&t=abc'}                                                               | ${'AXaoi6dz59A'}
    ${'https://youtube.com/watch?gl=NL&hl=nl&feature=g-vrec&context=G2584313RVAAAAAAAABA&v=35LqQPKylEA'} | ${'35LqQPKylEA'}
  `(
    '$url should generate youtube html without start time',
    ({ url, videoId }) => {
      const html = markdownToHtml(url);
      const escapeUrl = escapeHtml(url);
      expect(html.trim()).toStrictEqual(
        `<p><div class="embed-youtube"><iframe src="https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}" allowfullscreen loading="lazy"></iframe></div><a href="${escapeUrl}" style="display: none" rel="nofollow">${escapeUrl}</a></p>`.trim()
      );
    }
  );

  test.each`
    url                                                                                                           | videoId          | start
    ${'http://www.youtube.com/watch?v=lK-zaWCp-co&feature=g-all-u&context=G27a8a4aFAAAAAAAAAAA&t=120'}            | ${'lK-zaWCp-co'} | ${'120'}
    ${'https://www.youtube.com/watch?v=fnr9XWvjJHw&t=19101s'}                                                     | ${'fnr9XWvjJHw'} | ${'19101'}
    ${'http://youtu.be/AXaoi6dz59A&t=79854'}                                                                      | ${'AXaoi6dz59A'} | ${'79854'}
    ${'http://youtu.be/AXaoi6dz59A&t=172801'}                                                                     | ${'AXaoi6dz59A'} | ${'172800'}
    ${'https://youtube.com/watch?gl=NL&hl=nl&feature=g-vrec&context=G2584313RVAAAAAAAABA&v=35LqQPKylEA&t=79854s'} | ${'35LqQPKylEA'} | ${'79854'}
  `(
    '$url should generate youtube html with start time',
    ({ url, videoId, start }) => {
      const html = markdownToHtml(url);
      const escapeUrl = escapeHtml(url);
      expect(html.trim()).toStrictEqual(
        `<p><div class="embed-youtube"><iframe src="https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}&start=${start}" allowfullscreen loading="lazy"></iframe></div><a href="${escapeUrl}" style="display: none" rel="nofollow">${escapeUrl}</a></p>`.trim()
      );
    }
  );

  /**
   * YouTube のIDは抽出できる対象だが、その前に AutoLink 対象ではないために変換処理が走らない
   */
  test.each`
    url                                                                                          | videoId
    ${'youtube.com/watch?gl=NL&hl=nl&feature=g-vrec&context=G2584313RVAAAAAAAABA&v=35LqQPKylEA'} | ${'35LqQPKylEA'}
  `('$url should not generate youtube html', ({ url }) => {
    const html = markdownToHtml(url);
    const escapeUrl = escapeHtml(url);
    expect(html.trim()).toStrictEqual(`<p>${escapeUrl}</p>`.trim());
  });
});
