import { parse } from 'node-html-parser';
import markdownToHtml from '../src/index';

describe('Link syntax', () => {
  test('should convert link syntax properly', () => {
    const html = markdownToHtml('[example](https://example.com)');
    expect(html).toContain(
      '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">example</a>'
    );
  });
  test('should convert link with no attributes if href starts with slash', () => {
    const html = markdownToHtml('[Articles](/articles)');
    expect(html).toContain('<a href="/articles">Articles</a>');
  });
  test('should convert link with no attributes if href starts with #', () => {
    const html = markdownToHtml('[Example](#example)');
    expect(html).toContain('<a href="#example">Example</a>');
  });
});

describe('Linkify properly', () => {
  describe('Raw Link', () => {
    test('should linkify url with nofollow if hostname is not zenn.dev', () => {
      expect(markdownToHtml('URL is https://example.com')).toContain(
        'URL is <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
      expect(markdownToHtml('URL is http://example.com')).toContain(
        'URL is <a href="http://example.com" target="_blank" rel="nofollow noopener noreferrer">http://example.com</a>'
      );
      expect(markdownToHtml('URL is https://zenn.dev.example.com')).toContain(
        'URL is <a href="https://zenn.dev.example.com" target="_blank" rel="nofollow noopener noreferrer">https://zenn.dev.example.com</a>'
      );
    });

    test('should linkify url without rel if hostname is zenn.dev', () => {
      const html = markdownToHtml('URL is https://zenn.dev');
      expect(html).toContain(
        'URL is <a href="https://zenn.dev" target="_blank">https://zenn.dev</a>'
      );
    });

    test('should not convert links to card if text exists before url', () => {
      const html = markdownToHtml('foo https://example.com');
      expect(html).toEqual(
        '<p>foo <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a></p>\n'
      );
    });

    test('should not convert intentional links to card', () => {
      const html = markdownToHtml('[https://example.com](https://example.com)');
      expect(html).toEqual(
        '<p><a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a></p>\n'
      );
    });

    test('should not convert links inside list', () => {
      const html = markdownToHtml('- https://example.com\n- second');
      expect(html).toEqual(
        '<ul>\n<li><a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a></li>\n<li>second</li>\n</ul>\n'
      );
    });

    test('should not convert links inside block', () => {
      const html = markdownToHtml(':::message alert\nhttps://example.com\n:::');
      expect(html).toEqual(
        '<aside class="msg alert"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 101 101" role="img" aria-label="alert" class="msg-icon"><circle cx="51" cy="51" r="50" fill="currentColor"></circle><text x="50%" y="50%" text-anchor="middle" fill="#ffffff" font-size="70" font-weight="bold" dominant-baseline="central">!</text></svg><div class="msg-content"><p><a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a></p>\n</div></aside>\n'
      );
    });

    test('should not convert links inside block with 2 paragraphs', () => {
      const html = markdownToHtml(
        ':::message alert\nhello\n\nhttps://example.com\n:::'
      );
      expect(html).toContain(
        '<aside class="msg alert"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 101 101" role="img" aria-label="alert" class="msg-icon"><circle cx="51" cy="51" r="50" fill="currentColor"></circle><text x="50%" y="50%" text-anchor="middle" fill="#ffffff" font-size="70" font-weight="bold" dominant-baseline="central">!</text></svg><div class="msg-content"><p>hello</p>\n<p><a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a></p>\n</div></aside>'
      );
    });

    test('should not convert links inside list', () => {
      const html = markdownToHtml('- https://example.com\n- second');
      expect(html).toEqual(
        '<ul>\n<li><a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a></li>\n<li>second</li>\n</ul>\n'
      );
    });

    test('should not convert links if text follows', () => {
      const html = markdownToHtml('https://example.com foo');
      expect(html).toEqual(
        '<p><a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a> foo</p>\n'
      );
    });

    test('should not convert a link with any text in same paragraph', () => {
      const html = markdownToHtml(
        `a: https://example.com\nb: https://example.com`
      );
      expect(html).toEqual(
        '<p>a: <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a><br>\nb: <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a></p>\n'
      );
    });

    test('should not convert links even when the links are the start of the line unless the next elements are texts', () => {
      const html = markdownToHtml('\n\nhttps://example.com text');
      expect(html).toEqual(
        '<p><a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a> text</p>\n'
      );
    });

    test('should not convert links even when the links are the end of the line, unless previous elements are texts', () => {
      const html = markdownToHtml('text https://example.com\n\n');
      expect(html).toEqual(
        '<p>text <a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a></p>\n'
      );
    });
  });

  describe('Embedded Iframe', () => {
    describe('LinkCard', () => {
      const validateConvertLinkCardEmbeddedIframe = (
        html: string,
        url: string
      ) => {
        const iframe = parse(html).querySelector('div.zenn-embedded iframe');
        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringMatching(
              /https:\/\/embed.zenn.studio\/link-card#.+/
            ),
            'data-content': encodeURIComponent(url),
          })
        );
      };

      test('should convert links to card if prev elem is br', () => {
        const url = 'https://example.com';
        const html = markdownToHtml(`foo\n${url}`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('should convert links when surrounded by softbreaks', () => {
        const url = 'https://example.com';
        const html = markdownToHtml(`\n\n${url}\n\n`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('should convert links when previous element is a softbreak and the links are end of the paragraph', () => {
        const url = 'https://example.com';
        const html = markdownToHtml(`text\n${url}\n\n`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('should convert links when the links are the start of the line and the next elements are softbreaks', () => {
        const url = 'https://example.com';
        const html = markdownToHtml(`\n\n${url}\ntext`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('should convert links when previous and next elements are softbreaks', () => {
        const url = 'https://example.com';
        const html = markdownToHtml(`text\n${url}\ntext`);
        validateConvertLinkCardEmbeddedIframe(html, url);
      });

      test('should convert links to card if first element in p', () => {
        const url = 'https://example.com';
        const html = markdownToHtml(`foo\n\n${url}`);
        const root = parse(html);
        const elements = root.getElementsByTagName('p');

        expect(elements.length).toBe(2);
        expect(
          elements[0]?.querySelector('div.zenn-embedded iframe')
        ).toBeDefined();
      });

      test('should convert links even when some links exist in the line, unless softbreaks exist before and after the each links', () => {
        const linkCardUrls = ['https://example1.com', 'https://example2.com'];
        const rawLinkUrls = ['https://example3.com', 'https://example4.com'];
        // prettier-ignore
        const html = markdownToHtml(`${linkCardUrls[0]}\n${rawLinkUrls[0]} text\ntext ${rawLinkUrls[1]}\n${linkCardUrls[1]}\ntext`);
        const root = parse(html);
        const iframes = root.querySelectorAll('div.zenn-embedded iframe');
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

      test('should convert links even when some links exist in the line, when each links are separated by linebreaks', () => {
        const linkCardUrls = ['https://example1.com', 'https://example2.com'];
        const html = markdownToHtml(`${linkCardUrls[0]}\n${linkCardUrls[1]}\n`);
        const iframes = parse(html).querySelectorAll(
          'div.zenn-embedded iframe'
        );

        expect(iframes.length).toBe(2);
        expect(
          iframes.map((frame) => frame.attributes['data-content'])
        ).toEqual(linkCardUrls.map((link) => encodeURIComponent(link)));
      });
    });

    describe('Tweet', () => {
      test('should convert a tweet-link to embedded iframe', () => {
        const url = 'https://twitter.com/jack/status/20';
        const html = markdownToHtml(`${url}`);
        const iframe = parse(html).querySelector('div.zenn-embedded iframe');
        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringMatching(/https:\/\/embed.zenn.studio\/tweet#.+/),
            'data-content': encodeURIComponent(url),
          })
        );
      });

      test('should convert a tweet-link with query string to embedded iframe', () => {
        const url = `https://twitter.com/jack/status/20?foo=123456&t=ab-cd_ef`;
        const html = markdownToHtml(url);
        const iframe = parse(html).querySelector('div.zenn-embedded iframe');

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringMatching(/https:\/\/embed.zenn.studio\/tweet#.+/),
            'data-content': encodeURIComponent(url),
          })
        );
      });
    });
  });
});
