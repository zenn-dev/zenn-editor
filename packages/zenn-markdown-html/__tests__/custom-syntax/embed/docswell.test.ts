import { describe, test, expect } from 'vitest';
import markdownToHtml from '../../../src/index';

describe('Docswell', () => {
  test('should generate docswell html', () => {
    const html = markdownToHtml(
      '@[docswell](https://www.docswell.com/slide/LK7J5V/embed)'
    );
    expect(html).toContain(
      '<span class="embed-block embed-docswell"><iframe src="https://www.docswell.com/slide/LK7J5V/embed" allowfullscreen="true" width="620" style="border:1px solid #ccc;display:block;margin:0px auto;padding:0px;aspect-ratio:620/349"></iframe></span>'
    );
  });

  test('should not generate docswell html with invalid url', () => {
    const html = markdownToHtml(
      '@[docswell](https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell)'
    );
    expect(html).toContain('Docswellのembed用のURLを指定してください');
  });
});
