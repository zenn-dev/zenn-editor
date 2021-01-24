import markdownToHtml from '../src/index';

describe('convert $ mark properly', () => {
  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[hoge](https://hoge.fuga)bar');
    expect(html).toMatch(/<eq class="zenn-katex">.*<\/eq>foo/);
    expect(html).toContain(
      '<a href="https://hoge.fuga" rel="nofollow">hoge</a>bar'
    );
  });

  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[hoge](http://hoge.fuga)$bar');
    expect(html).toMatch(/<eq class="zenn-katex">.*<\/eq>foo/);
    expect(html).toContain(
      '<a href="http://hoge.fuga" rel="nofollow">hoge</a>$bar'
    );
  });
  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[$hoge](http://hoge.fuga)bar');
    expect(html).toMatch(/<eq class="zenn-katex">.*<\/eq>foo/);
    expect(html).toContain(
      '<a href="http://hoge.fuga" rel="nofollow">$hoge</a>bar'
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

describe('should include katex stylesheet link', () => {
  test('should include katex stylesheet when markdown includes katex syntax', () => {
    const html = markdownToHtml('$a,b,c$');
    expect(html).toContain(
      `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"/>`
    );
  });
});
