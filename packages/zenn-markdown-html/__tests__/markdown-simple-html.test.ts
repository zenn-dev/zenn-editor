import { markdownToSimpleHtml } from '../src/index';

describe('Convert markdown to html properly', () => {
  test('改行が<br>に変換されること', () => {
    const html = markdownToSimpleHtml('Hello\nWorld');
    expect(html).toContain(`<p>Hello<br>\nWorld</p>`);
  });

  test('連続した改行でパラグラフが分かれること', () => {
    const html = markdownToSimpleHtml('Hello\n\nWorld');
    expect(html).toContain(`<p>Hello</p>`);
    expect(html).toContain(`<p>World</p>`);
  });

  describe('linkify', () => {
    test('内部URLがリンクに変換されること', () => {
      const html = markdownToSimpleHtml('https://zenn.dev');
      expect(html).toContain('<a href="https://zenn.dev" target="_blank">https://zenn.dev</a>');
    })

    test('外部URLがリンクに変換されること', () => {
      const html = markdownToSimpleHtml('https://example.com');
      expect(html).toContain('<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">https://example.com</a>');
    })

    test('曖昧なリンクはリンクに変換されないこと', () => {
      const html = markdownToSimpleHtml('example.com');
      expect(html).toContain('<p>example.com</p>');
    });
  });

  describe('link', () => {
    test('外部リンクにはtarget="_blank"とrelが設定されること', () => {
      const html = markdownToSimpleHtml('[Hello](https://example.com)');
      expect(html).toContain('<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">Hello</a>');
    });

    test('内部リンクにはtarget="_blank"が設定されること', () => {
      const html = markdownToSimpleHtml('[Zenn](https://zenn.dev)');
      expect(html).toContain('<a href="https://zenn.dev" target="_blank">Zenn</a>');
    });

    test('相対パスには何も指定しない', () => {
      const html = markdownToSimpleHtml('[Articles](/articles)');
      expect(html).toContain('<a href="/articles">Articles</a>');
    });

    test('アンカーには何も指定しない', () => {
      const html = markdownToSimpleHtml('[Example](#example)');
      expect(html).toContain('<a href="#example">Example</a>');
    });
  });

  test('list(unordered)がサポートされること', () => {
    const html = markdownToSimpleHtml('* first\n* second');
    expect(html).toContain(`<ul>\n<li>first</li>\n<li>second</li>\n</ul>\n`);
  });

  test('list(ordered)がサポートされること', () => {
    const html = markdownToSimpleHtml('1. first\n2. second');
    expect(html).toContain(`<ol>\n<li>first</li>\n<li>second</li>\n</ol>\n`);
  })

  test('emphasisがサポートされること', () => {
    const html = markdownToSimpleHtml('*Hello*_World_**Zenn**');
    expect(html).toContain(`<em>Hello</em>`);
    expect(html).toContain(`<em>World</em>`);
    expect(html).toContain(`<strong>Zenn</strong>`);
  });

  test('htmlタグがエスケープされること', () => {
    const html = markdownToSimpleHtml('<script>alert("hello")</script>');
    expect(html).toContain('&lt;script&gt;alert(&quot;hello&quot;)&lt;/script&gt;');
  });
});
