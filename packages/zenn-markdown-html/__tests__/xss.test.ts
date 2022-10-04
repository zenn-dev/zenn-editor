import markdownToHtml from '../src/index';

describe('No XSS Vulnerability', () => {
  test('should excape script tag', () => {
    const html = markdownToHtml('<script>alert("XSS!")</script>');
    expect(html).toMatch('<p>&lt;script&gt;alert("XSS!")&lt;/script&gt;</p>');
  });

  test('should keep javascript: syntax without linkified', () => {
    const html = markdownToHtml('javascript:alert(1)');
    expect(html).toMatch('<p>javascript:alert(1)</p>');
  });

  test('should escape img tag around tex syntax', () => {
    const html = markdownToHtml(`
      $$"<img/src=./ onerror=alert(location)>
      any
      $$`);
    expect(html).toContain('$$"&lt;img/src=./ onerror=alert(location)&gt;');
  });

  test('should escape img tag around tex syntax', () => {
    const html = markdownToHtml(`$$
      e^{i\theta"<img/src=./ onerror=alert(location)>} = \\cos\theta + i\\sin\thetae^{i\theta} 
    $$`);
    expect(html).toContain('"&lt;img/src=./ onerror=alert(location)&gt;');
  });
  test('should escape img tag around code fence', () => {
    const html = markdownToHtml(
      `\`\`\`"><img/onerror="alert(location)"src=.>\nany\n\`\`\``
    );
    expect(html).toContain(
      '<div class="code-block-container"><pre><code>any\n</code></pre></div>'
    );
  });
  test('should escape script tag around code fence', () => {
    const html = markdownToHtml(
      `\`\`\`js:<script>alert("XSS")</script>\nany\n\`\`\``
    );
    expect(html).toContain(
      '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename">&lt;script&gt;alert("XSS")&lt;/script&gt;</span></div><pre class="language-js"><code class="language-js">any\n</code></pre></div>'
    );
  });
  test('should escape script tag in code body', () => {
    const html = markdownToHtml(
      `\`\`\`\n<script>alert("XSS")</script>\n\`\`\``
    );
    expect(html).toContain('&lt;script&gt;alert("XSS")&lt;/script&gt;');
  });
  test('should escape script tag in code highlighted body', () => {
    const html = markdownToHtml(
      `\`\`\`js\n<script>alert("XSS")</script>\n\`\`\``
    );
    expect(html).toContain(`<span class="token operator">&lt;</span>script`);
  });
  test('should escape img tag around mermaid syntax', () => {
    const content = `graph TD\nA["<img src="invalid" onerror=alert('XSS')/>"] --> B`;
    const html = markdownToHtml(`\`\`\`mermaid\n${content}\`\`\``);
    expect(html).toContain(encodeURIComponent(content));
  });
  test('should escape img tag around figma syntax', () => {
    const content = `@[figma](https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File"></iframe><img src onerror=alert("XSS") />)`;
    const html = markdownToHtml(content);
    expect(html).toContain(
      'ファイルまたはプロトタイプのFigma URLを指定してください'
    );
  });
});
