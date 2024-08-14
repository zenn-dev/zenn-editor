import { describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../src/index';
import { MarkdownOptions } from '../src/types';

const options: MarkdownOptions = {
  embedOrigin: 'https://embed-server.example.com',
};

const renderLink = (src: string) => {
  return markdownToHtml(src, options);
};

describe('Linkシンタックスのテスト', () => {
  test('リンクに変換する', () => {
    const html = renderLink('[example](https://example.com)');
    expect(html).toContain(
      '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">example</a>'
    );
  });
  test('hrefが"/"から始まる場合は属性のないリンクに変換する', () => {
    const html = renderLink('[Articles](/articles)');
    expect(html).toContain('<a href="/articles">Articles</a>');
  });
  test('hrefが"#"で始まる場合は属性のないリンクに変換する', () => {
    const html = renderLink('[Example](#example)');
    expect(html).toContain('<a href="#example">Example</a>');
  });
});

describe('Linkifyのテスト', () => {
  describe('直書きのリンクのテスト', () => {
    test('ホスト名が"zenn.dev"じゃない場合はURLを nofollow のリンクに変換する', () => {
      expect(renderLink('URL is https://example.com')).toContain(
        'URL is <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
      expect(renderLink('URL is http://example.com')).toContain(
        'URL is <a href="http://example.com" target="_blank" rel="nofollow noopener noreferrer">http://example.com</a>'
      );
      expect(renderLink('URL is https://zenn.dev.example.com')).toContain(
        'URL is <a href="https://zenn.dev.example.com" target="_blank" rel="nofollow noopener noreferrer">https://zenn.dev.example.com</a>'
      );
    });

    test('ホスト名が"zenn.dev"ならrel無しのリンクに変換する', () => {
      const html = renderLink('URL is https://zenn.dev');
      expect(html).toContain(
        'URL is <a href="https://zenn.dev" target="_blank">https://zenn.dev</a>'
      );
    });

    test('URLの前にテキストが存在する場合はリンクをリンクカードに変換しない', () => {
      const html = renderLink('foo https://example.com');
      expect(html).toContain(
        'foo <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
    });

    test('意図的にリンクしているURLはリンクカードに変換しない', () => {
      const html = renderLink('[https://example.com](https://example.com)');
      expect(html).toContain(
        '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
    });

    test('<details />内のリンクはリンクカードに変換しない', () => {
      const html = renderLink(':::message alert\nhttps://example.com\n:::');
      const iframe = parse(html).querySelector('aside iframe');
      expect(iframe).toBeNull();
      expect(html).toContain(
        '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
    });

    test('<details />内の2段落空いたリンクをリンクカードに変換しない', () => {
      const html = renderLink(
        ':::message alert\nhello\n\nhttps://example.com\n:::'
      );
      const iframes = parse(html).querySelectorAll('aside iframe');
      expect(iframes.length).toBe(0);
      console.log(html);
      expect(html).toContain(
        '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
    });

    test('リスト内のリンクをリンクカードに変換しない', () => {
      const html = renderLink('- https://example.com\n- second');
      const iframe = parse(html).querySelector('aside iframe');
      expect(iframe).toBeNull();
      expect(html).toContain(
        '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
    });

    test('URLにテキストが続く場合はリンクカードに変換しない', () => {
      const html = renderLink('https://example.com foo');
      expect(html).toContain(
        '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a> foo'
      );
    });

    test('同じ段落内のテキストを含むリンクをリンクカードに変換しない', () => {
      const html = renderLink(`a: https://example.com\nb: https://example.com`);
      expect(html).toContain(
        'a: <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a><br />\nb: <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
    });

    test('URLにテキストが続くならリンクが先頭であってもリンクカードに変換しない', () => {
      const html = renderLink('\n\nhttps://example.com text');
      expect(html).toContain(
        '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a> text'
      );
    });

    test('URLの前にテキストがあるならリンクが行末でもリンクカードに変換しない', () => {
      const html = renderLink('text https://example.com\n\n');
      expect(html).toContain(
        'text <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
    });
  });

  describe('埋め込みiframeのテスト', () => {
    describe('LinkCardのテスト', () => {
      const validateConvertLinkCardEmbeddedIframe = (
        html: string,
        url: string
      ) => {
        const iframe = parse(html).querySelector('span.zenn-embedded iframe');
        const pattern = new RegExp(`${options.embedOrigin}/card#.+`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringMatching(pattern),
            'data-content': encodeURIComponent(url),
          })
        );
      };

      test('前の要素が<br />の場合はリンクカードに変換する', () => {
        const url = 'https://example.com';
        const html = renderLink(`foo\n${url}`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('改行で囲まれている場合はリンクカードに変換する', () => {
        const url = 'https://example.com';
        const html = renderLink(`\n\n${url}\n\n`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('前に改行があってリンクが段落の終わりならリンクカードに変換する', () => {
        const url = 'https://example.com';
        const html = renderLink(`text\n${url}\n\n`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('リンクが段落の先頭でその後に開業が続く場合はリンクカードに変換する', () => {
        const url = 'https://example.com';
        const html = renderLink(`\n\n${url}\ntext`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('リンクの前後に改行があるならリンクカードに変換する', () => {
        const url = 'https://example.com';
        const html = renderLink(`text\n${url}\ntext`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('<p />の最初の要素ならリンクカードに変換する', () => {
        const url = 'https://example.com';
        const html = renderLink(`foo\n\n${url}`);
        const root = parse(html);
        const elements = root.getElementsByTagName('p');

        expect(elements.length).toBe(2);
        expect(
          elements[0]?.querySelector('span.zenn-embedded iframe')
        ).toBeDefined();
      });

      test('各リンクの前後に改行があればリンクカードに変換する', () => {
        const linkCardUrls = ['https://example1.com', 'https://example2.com'];
        const rawLinkUrls = ['https://example3.com', 'https://example4.com'];
        // prettier-ignore
        const html = renderLink(`${linkCardUrls[0]}\n${rawLinkUrls[0]} text\ntext ${rawLinkUrls[1]}\n${linkCardUrls[1]}\ntext`);
        const root = parse(html);
        const iframes = root.querySelectorAll('span.zenn-embedded iframe');
        const rawLinks = root.querySelectorAll('a:not([style])');

        expect(iframes.length).toBe(2);
        expect(rawLinks.length).toBe(2);
        expect(
          iframes.map((frame) => frame.attributes['data-content'])
        ).toEqual(linkCardUrls.map((link) => encodeURIComponent(link)));
        expect(rawLinks.map((link) => link.attributes.href)).toEqual(
          rawLinkUrls
        );
      });

      test('行内にリンクが存在する場合でも、各リンクが改行で区切られている場合は、リンクを変換する', () => {
        const linkCardUrls = ['https://example1.com', 'https://example2.com'];
        const html = renderLink(`${linkCardUrls[0]}\n${linkCardUrls[1]}\n`);
        const iframes = parse(html).querySelectorAll(
          'span.zenn-embedded iframe'
        );

        expect(iframes.length).toBe(2);
        expect(
          iframes.map((frame) => frame.attributes['data-content'])
        ).toEqual(linkCardUrls.map((link) => encodeURIComponent(link)));
      });
    });

    describe('Tweet埋め込みのテスト', () => {
      describe('twitter.com', () => {
        test('ツイートリンクを<iframe />に変換する', () => {
          const url = 'https://twitter.com/jack/status/20';
          const html = renderLink(`${url}`);
          const iframe = parse(html).querySelector('span.zenn-embedded iframe');
          const pattern = new RegExp(`${options.embedOrigin}/tweet#.+`);

          expect(iframe?.attributes).toEqual(
            expect.objectContaining({
              src: expect.stringMatching(pattern),
              'data-content': encodeURIComponent(url),
            })
          );
        });

        test('クエリ文字列を含むツイートリンクを埋め込み<iframe />に変換する', () => {
          const url = `https://twitter.com/jack/status/20?foo=123456&t=ab-cd_ef`;
          const html = renderLink(url);
          const iframe = parse(html).querySelector('span.zenn-embedded iframe');
          const pattern = new RegExp(`${options.embedOrigin}/tweet#.+`);

          expect(iframe?.attributes).toEqual(
            expect.objectContaining({
              src: expect.stringMatching(pattern),
              'data-content': encodeURIComponent(url),
            })
          );
        });
      });

      describe('x.com', () => {
        test('ツイートリンクを<iframe />に変換する', () => {
          const url = 'https://x.com/jack/status/20';
          const html = renderLink(`${url}`);
          const iframe = parse(html).querySelector('span.zenn-embedded iframe');
          const pattern = new RegExp(`${options.embedOrigin}/tweet#.+`);

          expect(iframe?.attributes).toEqual(
            expect.objectContaining({
              src: expect.stringMatching(pattern),
              'data-content': encodeURIComponent(url),
            })
          );
        });

        test('クエリ文字列を含むツイートリンクを埋め込み<iframe />に変換する', () => {
          const url = `https://x.com/jack/status/20?foo=123456&t=ab-cd_ef`;
          const html = renderLink(url);
          const iframe = parse(html).querySelector('span.zenn-embedded iframe');
          const pattern = new RegExp(`${options.embedOrigin}/tweet#.+`);

          expect(iframe?.attributes).toEqual(
            expect.objectContaining({
              src: expect.stringMatching(pattern),
              'data-content': encodeURIComponent(url),
            })
          );
        });
      });
    });

    describe('<details /> 内のテスト', () => {
      test('埋め込みiframeに変換できる', () => {
        const html = renderLink(
          [`:::details example`, `https://example1.com`, `:::`].join('\n')
        );

        const iframe = parse(html).querySelector('span.zenn-embedded iframe');

        expect(iframe).not.toBe(null);
      });

      test('<details />がネストされていても埋め込みiframeに変換する', () => {
        const html = renderLink(
          [
            `::::details example`,
            `:::details nest-example`,
            `https://example1.com`,
            `:::`,
            `::::`,
          ].join('\n')
        );

        const iframe = parse(html).querySelector('span.zenn-embedded iframe');

        expect(iframe).not.toBe(null);
      });

      test('<details />以外のネストは埋め込みiframeに変換しない', () => {
        const html = renderLink(
          [`:::details example`, `- https://example1.com`, `:::`].join('\n')
        );

        const iframe = parse(html).querySelector('span.zenn-embedded iframe');

        expect(iframe).toBe(null);
      });
    });
  });
});
