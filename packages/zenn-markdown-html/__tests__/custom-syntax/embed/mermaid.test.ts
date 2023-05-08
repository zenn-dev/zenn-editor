import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing Mermaid Embedded Elements', () => {
  const validSrc = `
    graph TD;
      A-->B;
      A-->C;
      B-->D;
      C-->D;
  `.trim();
  const invalidSrc = `invalid src text`;

  describe('Default behavior', () => {
    describe('For valid codes', () => {
      test('should display input values as code blocks as they are', () => {
        const html = markdownToHtml(`\`\`\`mermaid\n${validSrc}\n\`\`\``);
        // <code />が取得できないので<pre />で取得する
        const preElement = parse(html).querySelector(
          'div.code-block-container pre'
        );

        expect(preElement?.innerHTML).toEqual(
          `<code>${validSrc.replace(/>/g, '&gt;')}</code>`
        );
      });
    });

    describe('For invalid codes', () => {
      test('should display input values as code blocks as they are', () => {
        const html = markdownToHtml(`\`\`\`mermaid\n${invalidSrc}\n\`\`\``);
        // <code />が取得できないので<pre />で取得する
        const codeElement = parse(html).querySelector(
          'div.code-block-container pre'
        );

        expect(codeElement?.innerHTML).toEqual(`<code>${invalidSrc}</code>`);
      });
    });
  });

  describe('If you have set up an embedOrigin', () => {
    test('shoud be displayed <iframe /> with the passed embeddedOrigin as `src`', () => {
      const embedOrigin = 'https://embed.example.com';
      const html = markdownToHtml(`\`\`\`mermaid\n${validSrc}\n\`\`\``, {
        embedOrigin,
      });
      const iframe = parse(html).querySelector('span.zenn-embedded iframe');

      expect(iframe?.attributes).toEqual(
        expect.objectContaining({
          src: expect.stringMatching(`${embedOrigin}/mermaid#`),
          'data-content': encodeURIComponent(validSrc),
        })
      );
    });
  });

  describe('If customEmbed.mermaid() is set', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`\`\`\`mermaid\n${validSrc}\n\`\`\``, {
        customEmbed: { mermaid: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
