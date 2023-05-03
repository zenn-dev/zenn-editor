import { markdownToSimpleHtml } from '../src/index';

describe('Convert markdown to html properly', () => {
  test('should Newlines be converted to <br>.', () => {
    const html = markdownToSimpleHtml('Hello\nWorld');
    expect(html).toContain(`<p>Hello<br />\nWorld</p>`);
  });

  test('should Paragraphs be separated by consecutive line breaks.', () => {
    const html = markdownToSimpleHtml('Hello\n\nWorld');
    expect(html).toContain(`<p>Hello</p>`);
    expect(html).toContain(`<p>World</p>`);
  });

  describe('linkify', () => {
    test('should Internal URLs be converted to links.', () => {
      const html = markdownToSimpleHtml('https://zenn.dev');
      expect(html).toContain(
        '<a href="https://zenn.dev" target="_blank">https://zenn.dev</a>'
      );
    });

    test('should External URLs be converted to links.', () => {
      const html = markdownToSimpleHtml('https://example.com');
      expect(html).toContain(
        '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>'
      );
    });

    test('should not Ambiguous links be converted to links.', () => {
      const html = markdownToSimpleHtml('example.com');
      expect(html).toContain('<p>example.com</p>');
    });
  });

  describe('link', () => {
    test('should target="_blank" and rel be set for external links', () => {
      const html = markdownToSimpleHtml('[Hello](https://example.com)');
      expect(html).toContain(
        '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">Hello</a>'
      );
    });

    test('should target="_blank" be set for internal links', () => {
      const html = markdownToSimpleHtml('[Zenn](https://zenn.dev)');
      expect(html).toContain(
        '<a href="https://zenn.dev" target="_blank">Zenn</a>'
      );
    });

    test('should not Relative paths be specified anything', () => {
      const html = markdownToSimpleHtml('[Articles](/articles)');
      expect(html).toContain('<a href="/articles">Articles</a>');
    });

    test('should not Anchor be specified anything', () => {
      const html = markdownToSimpleHtml('[Example](#example)');
      expect(html).toContain('<a href="#example">Example</a>');
    });
  });

  test('should list(unordered) to be supported', () => {
    const html = markdownToSimpleHtml('* first\n* second');
    expect(html).toContain(`<ul>\n<li>first</li>\n<li>second</li>\n</ul>\n`);
  });

  test('should list(ordered) to be supported', () => {
    const html = markdownToSimpleHtml('1. first\n2. second');
    expect(html).toContain(`<ol>\n<li>first</li>\n<li>second</li>\n</ol>\n`);
  });

  test('should emphasis to be supported', () => {
    const html = markdownToSimpleHtml('*Hello*_World_**Zenn**');
    expect(html).toContain(`<em>Hello</em>`);
    expect(html).toContain(`<em>World</em>`);
    expect(html).toContain(`<strong>Zenn</strong>`);
  });

  test('should html tags be escaped.', () => {
    const html = markdownToSimpleHtml('<script>alert("hello")</script>');
    expect(html).toContain('&lt;script&gt;alert("hello")&lt;/script&gt;');
  });
});
