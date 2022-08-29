import markdownToHtml from '../src/index';

describe('Convert markdown to html properly', () => {
  test('should convert markdown to html properly', () => {
    const html = markdownToHtml('Hello\n## hey\n\n- first\n- second\n');
    expect(html).toContain(`<p>Hello</p>`);
    expect(html).toContain(
      `<h2 id="hey"><a class="header-anchor-link" href="#hey" aria-hidden="true"></a> hey</h2>`
    );
    expect(html).toContain(`<ul>\n<li>first</li>\n<li>second</li>\n</ul>\n`);
  });

  test('should allow inline comment', () => {
    const html = markdownToHtml(`<!-- hey -->`);
    expect(html).not.toContain('hey');
  });

  test('should append docId to footnote', () => {
    const html = markdownToHtml(`Hello[^1]World!\n\n[^1]: hey`);
    // expect(html).toContain('<a href="#fn-27-1" id="fnref-27-1">[1]</a>');
    expect(html).toEqual(
      expect.stringMatching(
        /<a href="#fn-[0-9a-f]{4}-1" id="fnref-[0-9a-f]{4}-1">\[1\]<\/a>/
      )
    );
  });
});
