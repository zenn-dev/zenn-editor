import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Mermaid埋め込み要素のテスト', () => {
  const validSrc = `
    graph TD;
      A-->B;
      A-->C;
      B-->D;
      C-->D;
  `.trim();
  const invalidSrc = `invalid src text`;

  describe('デフォルトの挙動', () => {
    describe('有効なコードの場合', () => {
      test('入力値をコードブロックとしてそのまま表示する', () => {
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

    describe('無効なコードの場合', () => {
      test('入力値をコードブロックとしてそのまま表示する', () => {
        const html = markdownToHtml(`\`\`\`mermaid\n${invalidSrc}\n\`\`\``);
        // <code />が取得できないので<pre />で取得する
        const codeElement = parse(html).querySelector(
          'div.code-block-container pre'
        );

        expect(codeElement?.innerHTML).toEqual(`<code>${invalidSrc}</code>`);
      });
    });
  });

  describe('embedOriginを設定している場合', () => {
    test('渡したembedOriginを`src`として<iframe />を表示する', () => {
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

  describe('customEmbed.mermaid()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`\`\`\`mermaid\n${validSrc}\n\`\`\``, {
        customEmbed: { mermaid: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
