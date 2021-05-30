import markdownToHtml from '../src/index';

describe('Detect mermaid propley', () => {
  test('should generate TD valid code format html', () => {
    const html = markdownToHtml(`\`\`\`mermaid\ngraph TD\nA --> B\n\`\`\``);
    expect(html).toContain(
      '<embed-mermaid><div class="mermaid">graph TD\nA --> B</div></embed-mermaid>'
    );
  });
});
