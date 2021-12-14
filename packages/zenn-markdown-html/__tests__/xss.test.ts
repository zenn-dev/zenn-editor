import markdownToHtml from '../src/index';

describe('No XSS Vulnerability', () => {
  test('should excape script tag', () => {
    const html = markdownToHtml('<script>alert("XSS!")</script>');
    expect(html).toMatch(
      '<p>&lt;script&gt;alert(&quot;XSS!&quot;)&lt;/script&gt;</p>'
    );
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
    expect(html).toContain(
      '$$&quot;&lt;img/src=./ onerror=alert(location)&gt;'
    );
  });

  test('should escape img tag around tex syntax', () => {
    const html = markdownToHtml(`$$
      e^{i\theta"<img/src=./ onerror=alert(location)>} = \\cos\theta + i\\sin\thetae^{i\theta} 
    $$`);
    expect(html).toContain('&quot;&lt;img/src=./ onerror=alert(location)&gt;');
  });
  test('should escape img tag around code fence', () => {
    // make console.warn silent
    const consoleSpy = jest.spyOn(console, 'warn');
    consoleSpy.mockImplementation((x) => x);

    const html = markdownToHtml(
      `\`\`\`"><img/onerror="alert(location)"src=.>\nany\n\`\`\``
    );
    expect(consoleSpy).toHaveBeenCalled();
    expect(html).toContain(
      '<div class="code-block-container"><pre class=""><code class="">any\n</code></pre></div>'
    );
  });
  test('should escape script tag around code fence', () => {
    const html = markdownToHtml(
      `\`\`\`js:<script>alert("XSS")</script>\nany\n\`\`\``
    );
    expect(html).toContain(
      '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename">&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</span></div><pre class="language-js"><code class="language-js">any\n</code></pre></div>'
    );
  });
  test('should escape img tag around mermaid syntax', () => {
    const html = markdownToHtml(
      `\`\`\`mermaid\ngraph TD\nA["<img src="invalid" onerror=alert('XSS')/>"] --> B\`\`\``
    );
    expect(html).toContain(
      '<div class="embed-mermaid"><embed-mermaid><pre class="zenn-mermaid">graph TD\nA[&quot;&lt;img src=&quot;invalid&quot; onerror=alert(\'XSS\')/&gt;&quot;] --&gt; B```</pre></embed-mermaid></div>'
    );
  });
});
