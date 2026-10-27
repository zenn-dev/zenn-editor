import { describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import * as cheerio from 'cheerio';
import markdownToHtml from '../../../src/index';
import {
  HTML_EMBED_MAX_BYTES,
  stripHtmlEmbedContent,
} from '../../../src/utils/html-embed';

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

/**
 * 埋め込みサーバーに渡す HTML をブラウザと同じ規則(parse5)で解析し直し、
 * 残ってはいけない要素や属性を返す
 */
const findForbidden = (content: string | undefined) => {
  const $ = cheerio.load(content ?? '');
  const elements = $(
    'meta, base, link, iframe, object, embed, noscript, mglyph, template'
  ).toArray();
  const attributes = $(
    'a[href], area[href], form[action], [formaction]'
  ).toArray();
  const mathml = $('[href]')
    .toArray()
    .filter(
      (el) =>
        'namespace' in el &&
        el.namespace === 'http://www.w3.org/1998/Math/MathML'
    );
  return [...elements, ...attributes, ...mathml].map((el) => el.name);
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

      expect(findForbidden(content)).toEqual([]);
      expect(content).toContain('<a title="t">リンク</a>');
      expect(content).toContain('大文字');
      expect(content).toContain('alt="area"');
      expect(content).toContain('<circle r="5">');
    });

    test('先頭に書いた <style> も残す', async () => {
      // 解析すると <head> に移る要素も、本文に入れる HTML として出力する
      const content = await embedContent(
        '<style>.a { color: red; }</style><p class="a">x</p>'
      );

      expect(content).toBe(
        '<style>.a { color: red; }</style><p class="a">x</p>'
      );
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

      expect(findForbidden(content)).toEqual([]);
      expect(content).not.toContain('example.com');
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

      expect(findForbidden(content)).toEqual([]);
    });

    test('SVG・MathML の <style>・<script> に文字参照で隠したタグも除去する', async () => {
      const content = await embedContent(
        [
          '<svg><style>&lt;meta http-equiv="refresh" content="0"&gt;&lt;a href="https://example.com"&gt;x&lt;/a&gt;</style></svg>',
          '<svg><style><![CDATA[<a href="https://example.com">x</a>]]></style></svg>',
          '<svg><script>&lt;meta http-equiv="refresh" content="0"&gt;</script></svg>',
          '<math><style>&lt;iframe src="https://example.com"&gt;&lt;/iframe&gt;</style></math>',
        ].join('\n')
      );

      expect(findForbidden(content)).toEqual([]);
    });

    test('ブラウザで HTML の要素として解析される SVG・MathML の <style> の中身も除去する', async () => {
      // SVG・MathML の中で HTML を書ける要素かどうかは、要素の名前空間や属性で決まる
      const content = await embedContent(
        [
          '<math><annotation-xml><style><meta http-equiv="refresh" content="0"><a href="https://example.com">x</a></style></annotation-xml></math>',
          '<svg><mi><style><meta http-equiv="refresh" content="0"></style></mi></svg>',
          '<math><title><style><meta http-equiv="refresh" content="0"></style></title></math>',
        ].join('\n')
      );

      expect(findForbidden(content)).toEqual([]);
    });

    test('SVG の <style> の文字参照は展開しない', async () => {
      const content = await embedContent(
        '<svg><style>.a::after { content: "&amp;lt;"; }</style></svg>'
      );

      expect(
        cheerio
          .load(content ?? '')('style')
          .text()
      ).toBe('.a::after { content: "&lt;"; }');
    });

    test('SVG のアニメーションで href を付ける要素を除去する', async () => {
      const content = await embedContent(
        [
          '<svg><a><set attributeName="href" to="https://example.com"/><text>x</text></a></svg>',
          '<svg><a><animate attributeName="xlink:href" values="https://example.com"/><text>y</text></a></svg>',
          '<svg><rect><animate attributeName="width" values="1;2"/></rect></svg>',
        ].join('\n')
      );
      const $ = cheerio.load(content ?? '');

      expect($('set').length).toBe(0);
      expect(
        $('animate')
          .toArray()
          .map((el) => $(el).attr('attributeName'))
      ).toEqual(['width']);
      expect($('text').text()).toBe('xy');
    });

    test('入れ子が深すぎる場合も例外にせず、iframe を出力しない', async () => {
      // 例外になるかは実行環境のスタックの大きさで変わるため、出力するメッセージは確かめない
      const html = await markdownToHtml(
        `\`\`\`html-embed\n${'<div>'.repeat(8000)}\n\`\`\``,
        { embedOrigin, htmlEmbed: true }
      );

      expect(parse(html).querySelector('iframe')).toBeNull();
    });

    test('標準モードで解析する', async () => {
      // quirks モードでは <p> が <table> の前で閉じられない
      expect(await embedContent('<p><table><tr><td>x</td></tr></table>')).toBe(
        '<p></p><table><tbody><tr><td>x</td></tr></tbody></table>'
      );
    });

    test('上限の回数までに出力が定まらない場合は null を返す', () => {
      // 1回目で <meta> を除去して出力が変わるため、1回では定まらない
      expect(stripHtmlEmbedContent('<meta charset="utf-8"><p>a</p>', 1)).toBe(
        null
      );
      expect(stripHtmlEmbedContent('<meta charset="utf-8"><p>a</p>')).toBe(
        '<p>a</p>'
      );
    });

    test('MathML の href を除去する', async () => {
      expect(
        await embedContent(
          '<math href="https://example.com"><mi href="https://example.com">x</mi></math>'
        )
      ).toBe('<math><mi>x</mi></math>');
    });

    test('SVG の <style> の中身は変えずに残す', async () => {
      const css = '.c { fill: red; } .a > .b { stroke: blue; }';
      const content = await embedContent(
        `<svg viewBox="0 0 10 10"><style>${css}</style><circle class="c" r="5"/></svg>`
      );
      const $ = cheerio.load(content ?? '');

      expect($('svg style').text()).toBe(css);
      expect($('svg').attr('viewBox')).toBe('0 0 10 10');
      expect($('svg circle').attr('class')).toBe('c');
    });

    test('data: の画像や SVG の image は残す', async () => {
      const input =
        '<img src="data:image/png;base64,AA" srcset="data:image/png;base64,AA 2x">\n<svg><image href="data:image/png;base64,AA"></image></svg>';

      expect(await embedContent(input)).toBe(input);
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

      // 除去で小さくなる入力でも、除去する前の大きさで判定する
      const beforeStrip = await markdownToHtml(
        `\`\`\`html-embed\n<meta>${'a'.repeat(HTML_EMBED_MAX_BYTES)}\n\`\`\``,
        { embedOrigin, htmlEmbed: true }
      );
      expect(parse(beforeStrip).querySelector('iframe')).toBeNull();

      // 除去で大きくなる入力は、除去した後の大きさでも判定する(SVG の <style> の > は &gt; で出力される)
      const afterStrip = await markdownToHtml(
        `\`\`\`html-embed\n<svg><style>${'>'.repeat(HTML_EMBED_MAX_BYTES / 2)}</style></svg>\n\`\`\``,
        { embedOrigin, htmlEmbed: true }
      );
      expect(parse(afterStrip).querySelector('iframe')).toBeNull();

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
