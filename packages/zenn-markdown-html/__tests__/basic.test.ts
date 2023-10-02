import { describe, test, expect } from 'vitest';
import markdownToHtml from '../src/index';

describe('MarkdownからHTMLへの変換テスト', () => {
  test('markdownからhtmlへ変換する', () => {
    const html = markdownToHtml('Hello\n## hey\n\n- first\n- second\n');
    expect(html).toContain(`<p>Hello</p>`);
    expect(html).toContain(
      `<h2 id="hey"><a class="header-anchor-link" href="#hey" aria-hidden="true"></a> hey</h2>`
    );
    expect(html).toContain(`<ul>\n<li>first</li>\n<li>second</li>\n</ul>\n`);
  });

  test('インラインコメントはhtmlに変換しない', () => {
    const html = markdownToHtml(`<!-- hey -->`);
    expect(html).not.toContain('hey');
  });

  test('脚注に docId を設定する', () => {
    const html = markdownToHtml(`Hello[^1]World!\n\n[^1]: hey`);
    // expect(html).toContain('<a href="#fn-27-1" id="fnref-27-1">[1]</a>');
    expect(html).toEqual(
      expect.stringMatching(
        /<a href="#fn-[0-9a-f]{4}-1" id="fnref-[0-9a-f]{4}-1">\[1\]<\/a>/
      )
    );
  });

  test('dataスキーマの画像は除外する', () => {
    const html = markdownToHtml(`![](data:image/png;base64,xxxx)`);
    expect(html).toContain('<img alt />');
  });
});
