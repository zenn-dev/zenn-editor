import markdownToHtml from '../src/index';
import { escapeHtml } from 'markdown-it/lib/common/utils';

const embeddedPattern =
  /<span class="embed-block zenn-embedded[-\w\s]*">(.+)<\/span>/;

/** 埋め込み要素の <iframe /> 文字列を返す */
const getIframeHtml = (markdown: string): string | null => {
  return markdownToHtml(markdown).match(embeddedPattern)?.[1] || null;
};

describe('Handle custom markdown format properly', () => {
  describe('When embed URLs longer than 300 characters', () => {
    describe('When restricted types', () => {
      test('generate error message', () => {
        const dummy = Array(350).fill('a').join('');

        [
          // linkify
          `https://twitter.com/zenn_dev/status/${dummy}`,
          `http://youtu.be/${dummy}`,

          // custom
          `@[youtube](${dummy})`,
          `@[slideshare](${dummy})`,
          `@[speakerdeck](${dummy})`,
          `@[jsfiddle](${dummy})`,
          `@[codepen](${dummy})`,
          `@[codesandbox](${dummy})`,
          `@[stackblitz](${dummy})`,
          `@[tweet](${dummy})`,
          `@[blueprintue](${dummy})`,
          `@[figma](${dummy})`,
          `@[gist](${dummy})`,
        ].forEach((text) => {
          const html = markdownToHtml(text);
          expect(html).toContain(
            '埋め込みURLは300文字以内にする必要があります'
          );
        });
      });
    });

    describe('When types excluded from restrictions', () => {
      test('should generate a embed html', () => {
        const dummy = Array(350).fill('a').join('');

        [
          // linkify
          `https://zenn.dev/${dummy}`,
          `https://github.com/zenn-dev/zenn-editor/blob/canary/${dummy}`,

          // custom
          `@[card](http://youtu.be/${dummy})`,
          `@[github](https://github.com/zenn-dev/zenn-editor/blob/canary/${dummy})`,
        ].forEach((text) => {
          const html = markdownToHtml(text);
          expect(html).not.toContain(
            '埋め込みURLは300文字以内にする必要があります'
          );
        });
      });
    });
  });

  describe('CodeSandBox', () => {
    test('should generate codesandbox html', () => {
      const html = markdownToHtml(
        '@[codesandbox](https://codesandbox.io/embed/guess-movie-erpn1?fontsize=14&hidenavigation=1&theme=dark)'
      );
      expect(html).toContain(
        '<span class="embed-block embed-codesandbox"><iframe src="https://codesandbox.io/embed/guess-movie-erpn1?fontsize=14&amp;hidenavigation=1&amp;theme=dark" style="width:100%;height:500px;border:none;overflow:hidden" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" loading="lazy" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe></span>'
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
  });

  describe('Gist', () => {
    test('should convert a gist-link to embedded iframe', () => {
      // prettier-ignore
      const url = 'https://gist.github.com/gdb/b6365e79be6052e7531e7ba6ea8caf23';
      const html = getIframeHtml(`@[gist](${url})`);
      expect(html).not.toBe(null);
    });

    test('should convert a gist-link to embedded iframe with an encoded url string', () => {
      const url = 'https://gist.github.com/foo/bar?file=あ漢字$';
      const html = markdownToHtml(`@[gist](${url})`);
      expect(html).toContain(encodeURIComponent(url));
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
  });

  describe('LinkCard', () => {
    test('should generate embedded iframe', () => {
      const url = 'https://example.com/__test__';
      const html = getIframeHtml(`@[card](${url})`);
      expect(html).not.toBe(null);
      expect(html).toContain(encodeURIComponent(url));
    });
  });

  describe('MessageBox', () => {
    test('should generate valid message box html', () => {
      const html = markdownToHtml(':::message\nhello\n:::');
      expect(html).toContain(
        '<aside class="msg message"><svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 101 101" role="img" aria-label="message" class="msg-icon"><circle cx="51" cy="51" r="50" fill="currentColor"></circle><text x="50%" y="50%" text-anchor="middle" fill="#ffffff" font-size="70" font-weight="bold" dominant-baseline="central">!</text></svg><div class="msg-content"><p>hello</p>\n</div></aside>'
      );
    });

    test('should generate valid alert message box html', () => {
      const validMarkdownPatterns = [
        ':::message alert\nhello\n:::',
        ':::message alert  \nhello\n:::',
        ':::message   alert  \nhello\n:::',
      ];
      validMarkdownPatterns.forEach((markdown) => {
        const html = markdownToHtml(markdown);
        expect(html).toContain(
          '<aside class="msg alert"><svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 101 101" role="img" aria-label="alert" class="msg-icon"><circle cx="51" cy="51" r="50" fill="currentColor"></circle><text x="50%" y="50%" text-anchor="middle" fill="#ffffff" font-size="70" font-weight="bold" dominant-baseline="central">!</text></svg><div class="msg-content"><p>hello</p>\n</div></aside>'
        );
      });
    });

    test('should not generate message box with invalid class', () => {
      const html = markdownToHtml(':::message invalid"\nhello\n:::');
      expect(html).not.toContain('<aside class="msg');
    });
  });

  describe('Youtube', () => {
    test('should generate youtube html', () => {
      const html = markdownToHtml('@[youtube](AXaoi6dz59A)');
      expect(html.trim()).toStrictEqual(
        `<span class="embed-block embed-youtube"><iframe src="https://www.youtube.com/embed/AXaoi6dz59A?loop=1&amp;playlist=AXaoi6dz59A" allowfullscreen loading="lazy"></iframe></span>`.trim()
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
          `<p><span class="embed-block embed-youtube"><iframe src="https://www.youtube.com/embed/${videoId}?loop=1&amp;playlist=${videoId}" allowfullscreen loading="lazy"></iframe></span><a href="${escapeUrl}" style="display:none" target="_blank" rel="nofollow noopener noreferrer">${escapeUrl}</a></p>`.trim()
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
          `<p><span class="embed-block embed-youtube"><iframe src="https://www.youtube.com/embed/${videoId}?loop=1&amp;playlist=${videoId}&amp;start=${start}" allowfullscreen loading="lazy"></iframe></span><a href="${escapeUrl}" style="display:none" target="_blank" rel="nofollow noopener noreferrer">${escapeUrl}</a></p>`.trim()
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

  describe('Figma', () => {
    test('should generate figma html', () => {
      const validUrls = [
        'https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File',
        'https://www.figma.com/proto/LKQ4FJ4bTnCSjedbRpk931/Sample-File',
        'https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File?node-id=0%3A1',
      ];
      validUrls.forEach((url) => {
        const html = markdownToHtml(`@[figma](${url})`);
        expect(html).toContain(
          `<span class="embed-block embed-figma"><iframe src="https://www.figma.com/embed?embed_host=zenn&amp;url=${url}" width="100%" style="aspect-ratio:16/9" scrolling="no" frameborder="no" loading="lazy" allowfullscreen></iframe></span>`
        );
      });
    });

    test('should not generate figma html with invalid url', () => {
      const html = markdownToHtml(
        '@[figma](https://www.figma.com/Sample-File)'
      );
      expect(html).toContain(
        'ファイルまたはプロトタイプのFigma URLを指定してください'
      );
    });
  });

  describe('BlueprintUE', () => {
    test('should generate blueprintue html', () => {
      const validUrls = [
        'https://blueprintue.com/render/aaa/',
        'https://blueprintue.com/render/aaa',
        'https://blueprintue.com/render/a-aa',
        'https://blueprintue.com/render/a_aa',
      ];

      validUrls.forEach((url) => {
        const html = markdownToHtml(`@[blueprintue](${url})`);
        expect(html).toContain(
          `<span class="embed-block embed-blueprintue"><iframe src="${url}" width="100%" style="aspect-ratio:16/9" scrolling="no" frameborder="no" loading="lazy" allowfullscreen></iframe></span>`
        );
      });
    });

    test('should not generate blueprintue html with invalid url', () => {
      const invalidUrls = [
        'https://blueprintue.com/aaaaaaaaaaaaaa',
        'https://blueprintue.com/render/aaaaaaaaaa/hogetest',
      ];

      invalidUrls.forEach((url) => {
        const html = markdownToHtml(`@[blueprintue](${url})`);
        expect(html).toContain(
          '「https://blueprintue.com/render/」から始まる正しいURLを指定してください'
        );
      });
    });
  });
});
