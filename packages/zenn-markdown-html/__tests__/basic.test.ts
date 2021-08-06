import markdownToHtml from '../src/index';

describe('Convert markdown to html properly', () => {
  test('should convert markdown to html properly', () => {
    const html = markdownToHtml('Hello\n## hey\n\n- first\n- second\n');
    expect(html).toContain(`<p>Hello</p>`);
    expect(html).toContain(
      `<h2 id="hey"><a class="header-anchor-link" href="#hey" aria-hidden="true" rel="nofollow"></a> hey</h2>`
    );
    expect(html).toContain(`<ul>\n<li>first</li>\n<li>second</li>\n</ul>\n`);
  });

  test('should allow inline comment', () => {
    const html = markdownToHtml(`<!-- hey -->`);
    expect(html).not.toContain('hey');
  });
});
