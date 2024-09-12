import { describe, test, expect } from 'vitest';
import markdownToHtml from '../../../src/index';

describe('Docswell', () => {
  test('should generate docswell html', () => {
    const html = markdownToHtml(
      '@[docswell](https://www.docswell.com/slide/LK7J5V/embed)'
    );
    expect(html).toContain(
      '<script async class="docswell-embed" src="https://www.docswell.com/assets/libs/docswell-embed/docswell-embed.min.js" data-src="https://www.docswell.com/slide/LK7J5V/embed" data-aspect="0.5625"></script><div class="docswell-link"></div>'
    );
  });

  test('should not generate docswell html with invalid url', () => {
    const html = markdownToHtml(
      '@[docswell](https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell)'
    );
    expect(html).toContain('Doscwellのembed用のURLを指定してください');
  });
});
