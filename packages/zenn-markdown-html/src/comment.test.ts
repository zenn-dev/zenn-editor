import { markdownToCommentHtml } from './comment';

describe('Convert markdown to html for comment', () => {
  test('should keep ## as plain test', () => {
    const html = markdownToCommentHtml('## test');
    expect(html).toContain('## test');
  });

  test('should convert - to list', () => {
    const html = markdownToCommentHtml('- a\n- b');
    expect(html).toContain('<ul>');
  });

  test('should convert $$ to katex', () => {
    const html = markdownToCommentHtml('$$ c^2 = a^2 + b^2 $$ (2)');
    expect(html).toContain('<eqn>');
  });
});
