import markdownToHtml from '../src/index';

describe('Detect mermaid property', () => {
  test('should generate TD valid code format html', () => {
    const html = markdownToHtml(`\`\`\`mermaid\ngraph TD\nA --> B\n\`\`\``);
    expect(html).toContain(
      '<div class="embed-mermaid"><embed-mermaid><pre class="zenn-mermaid">graph TD\nA --&gt; B</pre></embed-mermaid></div>'
    );
  });
  test('should keep directive', () => {
    const html = markdownToHtml(`\`\`\`mermaid\n%%{init: { 'theme': 'forest' } }%%\ngraph TD\nA --> B\n\`\`\``);
    expect(html).toContain(
      '<div class="embed-mermaid"><embed-mermaid><pre class="zenn-mermaid">%%{init: { \'theme\': \'forest\' } }%%\ngraph TD\nA --&gt; B</pre></embed-mermaid></div>'
    );
  });
  test('should escape html tag', () => {
    const html = markdownToHtml(
      `\`\`\`mermaid\ngraph TD\nA --> B\n<br><script>alert("XSS")</script>\`\`\``
    );
    expect(html).toContain(
      '<div class="embed-mermaid"><embed-mermaid><pre class="zenn-mermaid">graph TD\nA --&gt; B\n&lt;br&gt;&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;```</pre></embed-mermaid></div>'
    );
  });
});
