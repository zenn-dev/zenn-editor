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

/** html-embed のコードブロックを変換し、埋め込みサーバーに渡す HTML を返す */
const embedContent = async (input: string) =>
  getEmbeddedContent(
    await markdownToHtml(`\`\`\`html-embed\n${input}\n\`\`\``, {
      embedOrigin,
      htmlEmbed: true,
    })
  );

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
      expect(iframe?.id).toMatch(/^zenn-embedded__[0-9a-f]+$/);
      expect(iframe?.attributes).toEqual(
        expect.objectContaining({
          src: `${embedOrigin}/html#${iframe?.id}`,
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

    test('別の文書を読み込む要素と、フォームの送信先を除去する', async () => {
      const content = await embedContent(
        [
          '<iframe srcdoc="<a href=https://example.com>x</a>"></iframe>',
          '<iframe src="https://example.com"></iframe>',
          '<object data="https://example.com"></object>',
          '<embed src="https://example.com">',
          '<link rel="stylesheet" href="https://example.com/a.css">',
          '<form action="https://example.com"><button formaction="https://example.com">送信</button></form>',
        ].join('\n')
      );

      expect(content).not.toMatch(/<iframe|<object|<embed|<link|example\.com/);
      expect(content).toContain('<form><button>送信</button></form>');
    });

    test('中身の解析がブラウザと食い違う要素は、要素ごと除去する', async () => {
      // ブラウザでは </noscript> や mglyph の扱いが異なり、style の中に隠した <a href> がリンクになる
      const content = await embedContent(
        [
          '<noscript><style></noscript><a href="https://example.com">x</a></style></noscript>',
          '<math><mtext><table><mglyph><style><a href="https://example.com">x</a></style></mglyph></table></mtext></math>',
        ].join('\n')
      );

      expect(content).not.toMatch(/href|<noscript|<mglyph/);
    });

    test('data: の画像や SVG の image は残す', async () => {
      const input =
        '<img src="data:image/png;base64,AA" srcset="data:image/png;base64,AA 2x" />\n<svg><image href="data:image/png;base64,AA"></image></svg>';

      expect(await embedContent(input)).toBe(input);
    });

    test('タグ名が Object のプロパティ名と同じでも変換できる', async () => {
      expect(await embedContent('<constructor title="t">x</constructor>')).toBe(
        '<constructor title="t">x</constructor>'
      );
    });

    test('embedOrigin が URL として不正な場合は、HTML のコードブロックを出力する', async () => {
      const html = await markdownToHtml(markdown, {
        embedOrigin: 'invalid origin',
        htmlEmbed: true,
      });

      expect(html).toBe(await markdownToHtml(htmlCodeBlock));
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

      // 文字数ではなく UTF-8 のバイト数で数える(「あ」は3バイト)
      const multibyte = await markdownToHtml(
        `\`\`\`html-embed\n<p>${'あ'.repeat(HTML_EMBED_MAX_BYTES / 3)}</p>\n\`\`\``,
        { embedOrigin, htmlEmbed: true }
      );
      expect(parse(multibyte).querySelector('iframe')).toBeNull();
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
