import markdownToHtml from '../src/index';

describe('Handle $ mark properly', () => {
  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[foo](https://foo.bar)bar');
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar</p>\n'
    );
  });

  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[foo](http://foo.bar)$bar');
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="http://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>$bar</p>\n'
    );
  });

  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[$bar](http://foo.bar)bar');
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="http://foo.bar" target="_blank" rel="nofollow noopener noreferrer">$bar</a>bar</p>\n'
    );
  });
  test('should keep $ around link href', () => {
    const html = markdownToHtml(
      '[this $ should be escaped](https://docs.angularjs.org/api/ng/service/$http)'
    );
    expect(html).toContain(
      '<a href="https://docs.angularjs.org/api/ng/service/$http" target="_blank" rel="nofollow noopener noreferrer">this $ should be escaped</a>'
    );
  });
});

describe('should escape html tag', () => {
  test('should escape script tag', () => {
    const html = markdownToHtml('$a,<script>alert("XSS")</script>,c$');
    expect(html).toEqual(
      `<p><embed-katex><eq class="zenn-katex">a,&lt;script&gt;alert("XSS")&lt;/script&gt;,c</eq></embed-katex></p>\n`
    );
  });
});

describe('Handle twice $ pairs properly', () => {
  test('should keep $ single character expression around link href', () => {
    const html = markdownToHtml('$a$foo[foo](https://foo.bar)bar,refs:$(2)$');
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex></p>\n'
    );
  });
  test('should keep $ around link href', () => {
    const html = markdownToHtml(
      '$a,b,c$foo[foo](https://foo.bar)bar,refs:$(2)$'
    );
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex></p>\n'
    );
  });
  test('should keep $ around link href three times', () => {
    const html = markdownToHtml(
      '$a,b,c$foo[foo](https://foo.bar)bar,refs:$(2)$,and:$(3)$'
    );
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex>,and:<embed-katex><eq class="zenn-katex">(3)</eq></embed-katex></p>\n'
    );
  });
  test('should keep $ around link href without parentheses', () => {
    const html = markdownToHtml('$a,b,c$foo[foo](https://foo.bar)bar,refs:$2$');
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">2</eq></embed-katex></p>\n'
    );
  });
  test('should keep $ pairs two times', () => {
    const html = markdownToHtml('$a,b,c$foobar,refs:$(2)$');
    expect(html).toEqual(
      '<p><embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foobar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex></p>\n'
    );
  });
});
