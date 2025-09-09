import { describe, test, expect } from 'vitest';
import markdownToHtml from '../src/index';

describe('XSS脆弱性のテスト', () => {
  test('<script />はエスケープする', () => {
    const html = markdownToHtml('<script>alert("XSS!")</script>');
    expect(html).toMatch('&lt;script&gt;alert("XSS!")&lt;/script&gt;');
  });

  test('"javascript:"構文をリンクにせずにそのままにする', () => {
    const html = markdownToHtml('javascript:alert(1)');
    expect(html).toMatch('javascript:alert(1)');
  });

  test('katex内の<img />をエスケープする', () => {
    const html = markdownToHtml(`
      $$"<img/src=./ onerror=alert(location)>
      any
      $$`);
    expect(html).toContain('$$"&lt;img/src=./ onerror=alert(location)&gt;');
  });

  test('katex内に仕込まれた<img />をエスケープする', () => {
    const html = markdownToHtml(`$$
      e^{i\theta"<img/src=./ onerror=alert(location)>} = \\cos\theta + i\\sin\thetae^{i\theta} 
    $$`);
    expect(html).toContain('"&lt;img/src=./ onerror=alert(location)&gt;');
  });
  test('コードブロック内の<img />のXSSをエスケープする', () => {
    const html = markdownToHtml(
      `\`\`\`"><img/onerror="alert(location)"src=.>\nany\n\`\`\``
    );
    expect(html).toBe(
      '<div class="code-block-container"><pre><code class="code-line" data-line="0">any\n</code></pre></div>'
    );
  });
  test('コードブロックのファイル名に仕込まれた<script />をエスケープする', () => {
    const html = markdownToHtml(
      `\`\`\`js:<script>alert("XSS")</script>\nany\n\`\`\``
    );
    expect(html).toContain(
      '<span class="code-block-filename">&lt;script&gt;alert("XSS")&lt;/script&gt;</span>'
    );
  });
  test('コードブロック内の<script />をエスケープする', () => {
    const html = markdownToHtml(
      `\`\`\`\n<script>alert("XSS")</script>\n\`\`\``
    );
    expect(html).toContain('&lt;script&gt;alert("XSS")&lt;/script&gt;');
  });
  test('シンタックスハイライトしている<script />をエスケープする', () => {
    const html = markdownToHtml(
      `\`\`\`js\n<script>alert("XSS")</script>\n\`\`\``
    );
    expect(html).toContain(`<span class="token operator">&lt;</span>script`);
  });
  test('mermaid内の<img />をエスケープする', () => {
    const content = `graph TD\nA["<img src="invalid" onerror=alert('XSS')/>"] --> B`;
    const html = markdownToHtml(`\`\`\`mermaid\n${content}\`\`\``, {
      embedOrigin: 'https://embed-server.example.com',
    });
    expect(html).toContain(encodeURIComponent(content));
  });
  test('figmaのURL内の<img />をエスケープする', () => {
    const content = `@[figma](https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File"></iframe><img src onerror=alert("XSS") />)`;
    const html = markdownToHtml(content);
    expect(html).toContain(
      'ファイルまたはプロトタイプのFigma URLを指定してください'
    );
  });
});
