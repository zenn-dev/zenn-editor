import markdownToHtml from '../src/index';

describe('Convert markdown to html', () => {
  test('should convert markdown to html properly', () => {
    const html = markdownToHtml('Hello\n## hey\n\n- first\n- second\n');
    expect(html).toContain(`<p>Hello</p>`);
    expect(html).toContain(`<h2 id="hey">hey</h2>`);
    expect(html).toContain(`<ul>\n<li>first</li>\n<li>second</li>\n</ul>\n`);
  });

  test('should generate codesandbox html', () => {
    const html = markdownToHtml(
      '@[codesandbox](https://codesandbox.io/embed/guess-movie-erpn1?fontsize=14&hidenavigation=1&theme=dark)'
    );
    expect(html).toContain(
      '<div class="embed-codesandbox"><iframe src="https://codesandbox.io/embed/guess-movie-erpn1?fontsize=14&hidenavigation=1&theme=dark" style="width:100%;height:500px;border:none;overflow:hidden;" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" loading="lazy" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe></div>'
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
  test('should convert a gist-link with gist-element', () => {
    const html = markdownToHtml(
      `@[gist](https://gist.github.com/gdb/b6365e79be6052e7531e7ba6ea8caf23)`
    );
    expect(html).toEqual(
      '<div class="embed-gist"><embed-gist page-url="https://gist.github.com/gdb/b6365e79be6052e7531e7ba6ea8caf23" encoded-filename="" /></div>\n'
    );
  });
  test('should convert a gist-link with gist-element with file', () => {
    const html = markdownToHtml(
      `@[gist](https://gist.github.com/foo/bar?file=test.json)`
    );
    expect(html).toEqual(
      '<div class="embed-gist"><embed-gist page-url="https://gist.github.com/foo/bar" encoded-filename="test.json" /></div>\n'
    );
  });
  test('should convert a gist-link with gist-element with encoded file', () => {
    const html = markdownToHtml(
      `@[gist](https://gist.github.com/foo/bar?file=あ漢字$)`
    );
    expect(html).toEqual(
      '<div class="embed-gist"><embed-gist page-url="https://gist.github.com/foo/bar" encoded-filename="%E3%81%82%E6%BC%A2%E5%AD%97%24" /></div>\n'
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
