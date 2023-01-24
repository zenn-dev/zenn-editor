import markdownToHtml from '../src/index';
import { MarkdownOptions } from '../src/types';

const options: MarkdownOptions = {
  embedOrigin: 'https://embed-sever.example.com',
};

const iframPattern =
  /<span class="embed-block zenn-embedded[-\w\s]*">(.+)<\/span>/;

const generateIframeHTML = (content: string) => {
  return markdownToHtml(content, options).match(iframPattern)?.[1];
};

describe('Detect mermaid property', () => {
  test('should wrap in zenn-embedded', () => {
    const content = `graph TD\nA --> B`;
    const html = markdownToHtml(`\`\`\`mermaid\n${content}\n\`\`\``, options);
    expect(html).toMatch(iframPattern);
  });

  test('should have `embedOrigin` in iframe src attribute', () => {
    const html = generateIframeHTML(`\`\`\`mermaid\n\n\`\`\``);
    const pattern = new RegExp(`src="${options.embedOrigin}/mermaid#.+"`);
    expect(html).toMatch(pattern);
  });

  test('should generate TD valid code format html', () => {
    const content = `graph TD\nA --> B`;
    const html = generateIframeHTML(`\`\`\`mermaid\n${content}\n\`\`\``);
    expect(html).toMatch(
      new RegExp(`data-content="${encodeURIComponent(content)}"`)
    );
  });
  test('should ignore :filename', () => {
    const content = 'graph TD\nA --> B';
    const html = generateIframeHTML(
      `\`\`\`mermaid:filename\n${content}\n\`\`\``
    );
    expect(html).toMatch(
      new RegExp(`data-content="${encodeURIComponent(content)}"`)
    );
  });
  test('should keep directive', () => {
    const content = "%%{init: { 'theme': 'forest' } }%%\ngraph TD\nA --> B";
    const html = generateIframeHTML(`\`\`\`mermaid\n${content}\n\`\`\``);
    expect(html).toMatch(
      new RegExp(`data-content="${encodeURIComponent(content)}"`)
    );
  });
  test('should escape html tag', () => {
    const content = `graph TD\nA --> B\n<br><script>alert("XSS")</script>`;
    const html = generateIframeHTML(`\`\`\`mermaid\n${content}\n\`\`\``);
    const dataContent = html?.match(/data-content="(.+)"/)?.[1];

    expect(dataContent).toContain(encodeURIComponent(content));
  });
});
