import markdownToHtml from './index';

describe('Convert markdown to html', () => {
  test('should convert ## to h2 with id', () => {
    const html = markdownToHtml('## hey');
    expect(html).toContain('<h2 id="hey">hey</h2>');
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
    const html = markdownToHtml('https://zenn.dev/example');
    expect(html).toContain(
      '<a href="https://zenn.dev/example" class="linkified">https://zenn.dev/example</a>'
    );
  });

  test('should likify url with className "linkified"', () => {
    const html = markdownToHtml('https://zenn.dev/example');
    expect(html).toContain(
      '<a href="https://zenn.dev/example" class="linkified">https://zenn.dev/example</a>'
    );
  });

  test('should likify url with nofollow if host is not zenn.dev', () => {
    const html = markdownToHtml('https://example.com');
    expect(html).toContain(
      '<a href="https://example.com" class="linkified" rel="nofollow">https://example.com</a>'
    );
  });
});

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

  test('should keep img tag around tex syntax', () => {
    const html = markdownToHtml(`
      $$"<img/src=./ onerror=alert(location)>
      any
      $$`);
    expect(html).toContain(
      '$$&quot;&lt;img/src=./ onerror=alert(location)&gt;'
    );
  });

  test('should keep img tag around tex syntax', () => {
    const html = markdownToHtml(`$$
      e^{i\theta"<img/src=./ onerror=alert(location)>} = \\cos\theta + i\\sin\thetae^{i\theta} 
    $$`);
    expect(html).toContain('&quot;&lt;img/src=./ onerror=alert(location)&gt;');
  });
  test('should keep img tag around code fence', () => {
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
    const html = markdownToHtml('$a,b,c$は[hoge](https://hoge.fuga)を参照');
    expect(html).toMatch(/<eq>.*<\/eq>は/);
    expect(html).toContain(
      '<a href="https://hoge.fuga" rel="nofollow">hoge</a>を参照'
    );
  });

  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$は[hoge](http://hoge.fuga)$を参照');
    expect(html).toMatch(/<eq>.*<\/eq>は/);
    expect(html).toContain(
      '<a href="http://hoge.fuga" rel="nofollow">hoge</a>$を参照'
    );
  });
  test('should keep $ around link href', () => {
    const html = markdownToHtml('$a,b,c$は[$hoge](http://hoge.fuga)を参照');
    expect(html).toMatch(/<eq>.*<\/eq>は/);
    expect(html).toContain(
      '<a href="http://hoge.fuga" rel="nofollow">$hoge</a>を参照'
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
