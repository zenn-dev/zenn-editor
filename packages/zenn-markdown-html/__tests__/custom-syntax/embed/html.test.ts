import { describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';
import { HTML_EMBED_MAX_BYTES } from '../../../src/utils/html-embed';

const embedOrigin = 'https://embed.example.com';

/** iframe の data-content から、埋め込みサーバーに渡す HTML を取り出す */
const getEmbeddedContent = (html: string) => {
  const iframe = parse(html).querySelector('span.zenn-embedded-html iframe');
  const content = iframe?.getAttribute('data-content');
  return content === undefined ? undefined : decodeURIComponent(content);
};

describe('HTML埋め込み要素のテスト', () => {
  const src = `<div class="box">図</div>\n<style>.box > p { padding: 16px; }</style>`;
  const markdown = `\`\`\`html-embed\n${src}\n\`\`\``;
  const htmlCodeBlock = `\`\`\`html\n${src}\n\`\`\``;

  describe('htmlEmbed オプションが無効な場合(デフォルト)', () => {
    test('HTML としてハイライトしたコードブロックを出力する', async () => {
      const html = await markdownToHtml(markdown, { embedOrigin });

      expect(html).toBe(await markdownToHtml(htmlCodeBlock, { embedOrigin }));
    });
  });

  describe('htmlEmbed オプションが有効な場合', () => {
    test('埋め込みサーバーの /html を指し、sandbox を付けた iframe を出力する', async () => {
      const html = await markdownToHtml(markdown, {
        embedOrigin,
        htmlEmbed: true,
      });
      const span = parse(html).querySelector('span.zenn-embedded');
      const iframe = span?.querySelector('iframe');

      expect(span?.classList.contains('zenn-embedded-html')).toBe(true);
      expect(iframe?.attributes).toEqual(
        expect.objectContaining({
          src: expect.stringMatching(
            new RegExp(`^${embedOrigin}/html#zenn-embedded__[0-9a-f]+$`)
          ),
          sandbox: 'allow-scripts',
        })
      );
      expect(getEmbeddedContent(html)).toBe(src);
    });

    test('リストや引用の中でも iframe を出力する', async () => {
      const html = await markdownToHtml(
        `- item\n  \`\`\`html-embed\n  <p>a</p>\n  \`\`\`\n\n> \`\`\`html-embed\n> <p>b</p>\n> \`\`\``,
        { embedOrigin, htmlEmbed: true }
      );

      expect(parse(html).querySelector('li iframe')).not.toBeNull();
      expect(parse(html).querySelector('blockquote iframe')).not.toBeNull();
    });

    test('embedOrigin がない場合は、HTML のコードブロックを出力する', async () => {
      const html = await markdownToHtml(markdown, { htmlEmbed: true });

      expect(html).toBe(await markdownToHtml(htmlCodeBlock));
    });

    test('リンク先と <meta>・<base> を除去し、中のテキストや図形は残す', async () => {
      const input = [
        '<a href="https://example.com" title="t">リンク</a>',
        '<A HREF="https://example.com">大文字</A>',
        '<map><area href="https://example.com" alt="area"></map>',
        '<svg><a xlink:href="https://example.com" href="https://example.com"><circle r="5"></circle></a></svg>',
        '<meta http-equiv="refresh" content="0;url=https://example.com">',
        '<base href="https://example.com/">',
      ].join('\n');
      const html = await markdownToHtml(`\`\`\`html-embed\n${input}\n\`\`\``, {
        embedOrigin,
        htmlEmbed: true,
      });
      const content = getEmbeddedContent(html) ?? '';

      expect(content).not.toMatch(/href/i);
      expect(content).not.toMatch(/<meta|<base/i);
      expect(content).toContain('<a title="t">リンク</a>');
      expect(content).toContain('大文字');
      expect(content).toContain('alt="area"');
      expect(content).toContain('<circle r="5">');
    });

    test('サイズの上限を超えた場合は、iframe を出力せずにエラーメッセージを出力する', async () => {
      const make = (bytes: number) =>
        `\`\`\`html-embed\n<p>${'a'.repeat(bytes - 7)}</p>\n\`\`\``;

      const within = await markdownToHtml(make(HTML_EMBED_MAX_BYTES), {
        embedOrigin,
        htmlEmbed: true,
      });
      expect(parse(within).querySelector('iframe')).not.toBeNull();

      const over = await markdownToHtml(make(HTML_EMBED_MAX_BYTES + 1), {
        embedOrigin,
        htmlEmbed: true,
      });
      expect(parse(over).querySelector('iframe')).toBeNull();
      expect(over).toContain('HTMLの埋め込みは50KB以内にする必要があります');
    });

    test('`@[html](...)` は埋め込みとして扱わない', async () => {
      const html = await markdownToHtml('@[html](<p>a</p>)', {
        embedOrigin,
        htmlEmbed: true,
      });

      expect(parse(html).querySelector('iframe')).toBeNull();
      expect(html).not.toContain('<p>a</p>');
    });
  });
});
