import markdownToHtml from '../src/index';

describe('Handle $ mark properly', () => {
  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[foo](https://foo.bar)bar');
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" rel="nofollow">foo</a>bar</p>\n'
    );
  });

  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[foo](http://foo.bar)$bar');
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="http://foo.bar" rel="nofollow">foo</a>$bar</p>\n'
    );
  });

  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[$bar](http://foo.bar)bar');
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="http://foo.bar" rel="nofollow">$bar</a>bar</p>\n'
    );
  });
  test('should keep $ around link href', () => {
    const html = markdownToHtml(
      '[this $ should be escaped](https://docs.angularjs.org/api/ng/service/$http)'
    );
    expect(html).toContain(
      '<a href="https://docs.angularjs.org/api/ng/service/$http" rel="nofollow">this $ should be escaped</a>'
    );
  });
});

describe('should escape html tag', () => {
  test('should escape script tag', () => {
    const html = markdownToHtml('$a,<script>alert("XSS")</script>,c$');
    expect(html).toEqual(
      `<p><embed-katex><eq class="zenn-katex">a,&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;,c</eq></embed-katex></p>\n`
    );
  });
});
