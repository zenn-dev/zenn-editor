import { describe, test, expect } from 'vitest';
import markdownToHtml from '../src/index';

describe('XSS脆弱性のテスト', () => {
  test('<script />はエスケープする', async () => {
    const html = await markdownToHtml('<script>alert("XSS!")</script>');
    expect(html).toMatch('&lt;script&gt;alert("XSS!")&lt;/script&gt;');
  });

  test('"javascript:"構文をリンクにせずにそのままにする', async () => {
    const html = await markdownToHtml('javascript:alert(1)');
    expect(html).toMatch('javascript:alert(1)');
  });

  test('katex内の<img />をエスケープする', async () => {
    const html = await markdownToHtml(`
      $$"<img/src=./ onerror=alert(location)>
      any
      $$`);
    expect(html).toContain('$$"&lt;img/src=./ onerror=alert(location)&gt;');
  });

  test('katex内に仕込まれた<img />をエスケープする', async () => {
    const html = await markdownToHtml(`$$
      e^{i\theta"<img/src=./ onerror=alert(location)>} = \\cos\theta + i\\sin\thetae^{i\theta}
    $$`);
    expect(html).toContain('"&lt;img/src=./ onerror=alert(location)&gt;');
  });
  test('コードブロック内の<img />のXSSをエスケープする', async () => {
    const html = await markdownToHtml(
      `\`\`\`"><img/onerror="alert(location)"src=.>\nany\n\`\`\``
    );
    // Shiki を使用している場合、<pre> タグには shiki クラスが含まれる
    expect(html).toContain('any');
    expect(html).not.toContain('onerror=');
  });
  test('コードブロックのファイル名に仕込まれた<script />をエスケープする', async () => {
    const html = await markdownToHtml(
      `\`\`\`js:<script>alert("XSS")</script>\nany\n\`\`\``
    );
    expect(html).toContain(
      '<span class="code-block-filename">&lt;script&gt;alert("XSS")&lt;/script&gt;</span>'
    );
  });
  test('コードブロック内の<script />をエスケープする', async () => {
    const html = await markdownToHtml(
      `\`\`\`\n<script>alert("XSS")</script>\n\`\`\``
    );
    expect(html).toContain('&lt;script&gt;');
  });
  test('シンタックスハイライトしている<script />をエスケープする', async () => {
    const html = await markdownToHtml(
      `\`\`\`js\n<script>alert("XSS")</script>\n\`\`\``
    );
    // Shiki はインラインスタイルでハイライトするため、<script> タグがエスケープされていることを確認
    expect(html).toContain('&lt;');
    expect(html).toContain('script');
    expect(html).not.toContain('<script>');
  });
  test('mermaid内の<img />をエスケープする', async () => {
    const content = `graph TD\nA["<img src="invalid" onerror=alert('XSS')/>"] --> B`;
    const html = await markdownToHtml(`\`\`\`mermaid\n${content}\`\`\``, {
      embedOrigin: 'https://embed-server.example.com',
    });
    expect(html).toContain(encodeURIComponent(content));
  });
  test('figmaのURL内の<img />をエスケープする', async () => {
    const content = `@[figma](https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File"></iframe><img src onerror=alert("XSS") />)`;
    const html = await markdownToHtml(content);
    expect(html).toContain(
      'ファイルまたはプロトタイプのFigma URLを指定してください'
    );
  });
});
