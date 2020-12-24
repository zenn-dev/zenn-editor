import markdownToHtml from './index';

describe('Convert markdown to html', () => {
  test('should convert markdown to html properly', () => {
    const html = markdownToHtml('Hello\n## hey\n\n- first\n- second\n');
    expect(html).toContain(`<p>Hello</p>`);
    expect(html).toContain(`<h2 id="hey">hey</h2>`);
    expect(html).toContain(`<ul>\n<li>first</li>\n<li>second</li>\n</ul>\n`);
  });

  test('should generate tweet html', () => {
    const html = markdownToHtml('@[tweet](https://twitter.com/jack/status/20)');
    expect(html).toContain(
      '<div class="embed-tweet tweet-container"><blockquote class="twitter-tweet"><a href="https://twitter.com/jack/status/20"></a></blockquote></div>'
    );
  });

  test('should generate valid message box html', () => {
    const html = markdownToHtml(':::message alert\nhello\n:::');
    expect(html).toContain('<div class="msg alert"><p>hello</p>\n</div>');
  });

  test('should generate valid code format html', () => {
    const html = markdownToHtml(
      `\`\`\`js:foo.js\nconsole.log("hello")\n\`\`\``
    );
    expect(html).toContain('<code class="language-js">');
    expect(html).toContain('<span class="code-block-filename">foo.js</span>');
  });

  test('should allow inline comment', () => {
    const html = markdownToHtml(`<!-- hey -->`);
    expect(html).not.toContain('hey');
  });
});

describe('Linkify', () => {
  test('should likify url with className "linkified"', () => {
    const html = markdownToHtml('URL is https://zenn.dev/example');
    expect(html).toContain(
      'URL is <a href="https://zenn.dev/example" class="linkified">https://zenn.dev/example</a>'
    );
  });

  test('should likify url with nofollow if host is not zenn.dev', () => {
    const html = markdownToHtml('URL is https://example.com');
    expect(html).toContain(
      'URL is <a href="https://example.com" class="linkified" rel="nofollow">https://example.com</a>'
    );
  });

  test('should convert links to card if prev elem is br', () => {
    const html = markdownToHtml('foo\nhttps://example.com');
    expect(html).toEqual(
      `<p>foo\n<div class="embed-zenn-link"><iframe src="https://asia-northeast1-zenn-dev-production.cloudfunctions.net/iframeLinkCard?url=https%3A%2F%2Fexample.com" frameborder="0" scrolling="no" loading="lazy"></iframe></div></p>\n`
    );
  });

  test('should convert links to card if first element in p', () => {
    const html = markdownToHtml('foo\n\nhttps://example.com');
    expect(html).toEqual(
      `<p>foo</p>\n<p><div class="embed-zenn-link"><iframe src="https://asia-northeast1-zenn-dev-production.cloudfunctions.net/iframeLinkCard?url=https%3A%2F%2Fexample.com" frameborder="0" scrolling="no" loading="lazy"></iframe></div></p>\n`
    );
  });

  test('should not convert links to card if text exists before url', () => {
    const html = markdownToHtml('foo https://example.com');
    expect(html).toEqual(
      '<p>foo <a href="https://example.com" class="linkified" rel="nofollow">https://example.com</a></p>\n'
    );
  });

  test('should not convert intetional links to card', () => {
    const html = markdownToHtml('[https://example.com](https://example.com)');
    expect(html).toEqual(
      '<p><a href="https://example.com" rel="nofollow">https://example.com</a></p>\n'
    );
  });

  test('should not convert links inside list', () => {
    const html = markdownToHtml('- https://example.com\n- second');
    expect(html).toEqual(
      '<ul>\n<li><a href="https://example.com" class="linkified" rel="nofollow">https://example.com</a></li>\n<li>second</li>\n</ul>\n'
    );
  });

  test('should not convert links inside block', () => {
    const html = markdownToHtml(':::message alert\nhttps://example.com\n:::');
    expect(html).toEqual(
      '<div class="msg alert"><p><a href="https://example.com" class="linkified" rel="nofollow">https://example.com</a></p>\n</div>\n'
    );
  });

  test('should not convert links inside list', () => {
    const html = markdownToHtml('- https://example.com\n- second');
    expect(html).toEqual(
      '<ul>\n<li><a href="https://example.com" class="linkified" rel="nofollow">https://example.com</a></li>\n<li>second</li>\n</ul>\n'
    );
  });

  test('should not convert links if text follows', () => {
    const html = markdownToHtml('https://example.com foo');
    expect(html).toEqual(
      '<p><a href="https://example.com" class="linkified" rel="nofollow">https://example.com</a> foo</p>\n'
    );
  });

  test('should not convert a link with any text in same paragraph', () => {
    const html = markdownToHtml(
      `a: https://example.com\nb: https://example.com`
    );
    expect(html).toEqual(
      '<p>a: <a href="https://example.com" class="linkified" rel="nofollow">https://example.com</a><br>\nb: <a href="https://example.com" class="linkified" rel="nofollow">https://example.com</a></p>\n'
    );
  });
});

//zenn.dev/okuoku/scraps/b485da18176fdc
//zenn.dev/okuoku/scraps/c236209827218e

describe('No XSS Vulnerability', () => {
  test('should excape script tag', () => {
    const html = markdownToHtml('<script>alert("XSS!")</script>');
    expect(html).toMatch(
      '<p>&lt;script&gt;alert(&quot;XSS!&quot;)&lt;/script&gt;</p>'
    );
  });

  test('should keep javascript: syntax without linkified', () => {
    const html = markdownToHtml('javascript:alert(1)');
    expect(html).toMatch('<p>javascript:alert(1)</p>');
  });

  test('should escape img tag around tex syntax', () => {
    const html = markdownToHtml(`
      $$"<img/src=./ onerror=alert(location)>
      any
      $$`);
    expect(html).toContain(
      '$$&quot;&lt;img/src=./ onerror=alert(location)&gt;'
    );
  });

  test('should escape img tag around tex syntax', () => {
    const html = markdownToHtml(`$$
      e^{i\theta"<img/src=./ onerror=alert(location)>} = \\cos\theta + i\\sin\thetae^{i\theta} 
    $$`);
    expect(html).toContain('&quot;&lt;img/src=./ onerror=alert(location)&gt;');
  });
  test('should escape img tag around code fence', () => {
    // make console.warn silent
    const consoleSpy = jest.spyOn(console, 'warn');
    consoleSpy.mockImplementation((x) => x);

    const html = markdownToHtml(
      `\`\`\`"><img/onerror="alert(location)"src=.>
      any
      \`\`\``
    );
    expect(consoleSpy).toHaveBeenCalled();
    expect(html).toContain(
      '<pre class="language-&quot;&gt;&lt;img/onerror=&quot;alert(location)&quot;src=.&gt;"><code class="language-&quot;&gt;&lt;img/onerror=&quot;alert(location)&quot;src=.&gt;">'
    );
  });
});

describe('convert $ mark properly', () => {
  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[hoge](https://hoge.fuga)bar');
    expect(html).toMatch(/<eq>.*<\/eq>foo/);
    expect(html).toContain(
      '<a href="https://hoge.fuga" rel="nofollow">hoge</a>bar'
    );
  });

  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[hoge](http://hoge.fuga)$bar');
    expect(html).toMatch(/<eq>.*<\/eq>foo/);
    expect(html).toContain(
      '<a href="http://hoge.fuga" rel="nofollow">hoge</a>$bar'
    );
  });
  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$foo[$hoge](http://hoge.fuga)bar');
    expect(html).toMatch(/<eq>.*<\/eq>foo/);
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

describe('should preserve br tag', () => {
  test('should preserve br tag inside paragraph', () => {
    const html = markdownToHtml('foo<br>bar');
    expect(html).toMatch(/<p>foo<br>bar<\/p>/);
  });
  test('should preserve br tag inside table', () => {
    const tableString = [
      `| a | b |`,
      `| --- | --- |`,
      `| foo<br>bar | c |`,
    ].join('\n');
    const html = markdownToHtml(tableString);
    expect(html).toContain('foo<br>bar');
  });
  test('should escape br tag inside inline code', () => {
    const html = markdownToHtml('foo`<br>`bar');
    expect(html).toMatch(/<p>foo<code>&lt;br&gt;<\/code>bar<\/p>/);
  });
  test('should escape br tag inside code block', () => {
    const html = markdownToHtml('```\n<br>\n```');
    expect(html).toContain('&lt;br&gt;');
  });
});
