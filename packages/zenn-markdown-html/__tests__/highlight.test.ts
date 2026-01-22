import { describe, test, expect } from 'vitest';
import markdownToHtml from '../src/index';

describe('コードハイライトのテスト', () => {
  test('コードブロックを正しい<code />に変換する', async () => {
    const html = await markdownToHtml(
      `\`\`\`js:foo.js\nconsole.log("hello")\n\`\`\``
    );
    expect(html).toContain('class="shiki');
    expect(html).toContain('<span class="code-block-filename">foo.js</span>');
  });

  test('js のコードブロックをハイライトする', async () => {
    const jsString = ['```js', "console.log('foo')", '```'].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('class="shiki');
  });

  test('スペースで区切られた追加の言語は無視する', async () => {
    const jsString = ['```js some-info', "console.log('foo')", '```'].join(
      '\n'
    );
    const html = await markdownToHtml(jsString);
    expect(html).toContain('class="shiki');
  });

  test('htmlのコードブロックをハイライトできる', async () => {
    const jsString = ['```html', '<html></html>', '```'].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('class="shiki');
  });
  test('js のコードブロックをハイライトしてファイル名を表示する', async () => {
    const jsString = ['```js:index.js', "console.log('foo')", '```'].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('class="shiki');
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
  });
  test('html のコードブロックをハイライトしてファイル名を表示する', async () => {
    const jsString = ['```html:index.html', '<html></html>', '```'].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('class="shiki');
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
  });
  test('js diff のコードブロックをハイライトする', async () => {
    const jsString = [
      '```js diff',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('class="line diff remove"');
    expect(html).toContain('class="line diff add"');
    expect(html).toContain('<span class="diff-prefix">-</span>');
    expect(html).toContain('<span class="diff-prefix">+</span>');
  });
  test('html diff のコードブロックをハイライトする', async () => {
    const jsString = [
      '```html diff',
      '-     <html class="foo">',
      '+     <html class="bar">',
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('class="line diff remove"');
    expect(html).toContain('class="line diff add"');
  });
  test('diff のコンテキスト行（先頭スペース）も diff-prefix でラップする', async () => {
    const diffString = [
      '```diff',
      ' context line',
      '-removed',
      '+added',
      '```',
    ].join('\n');
    const html = await markdownToHtml(diffString);
    expect(html).toContain('<span class="diff-prefix"> </span>');
    expect(html).toContain('<span class="diff-prefix">-</span>');
    expect(html).toContain('<span class="diff-prefix">+</span>');
  });
  test('diff の矢印プレフィックス（<, >）をサポートする', async () => {
    const diffString = [
      '```diff',
      '< removed line',
      '> added line',
      '```',
    ].join('\n');
    const html = await markdownToHtml(diffString);
    expect(html).toContain('class="line diff remove"');
    expect(html).toContain('class="line diff add"');
    // < と > は HTML エスケープされる
    expect(html).toContain('<span class="diff-prefix">&lt;</span>');
    expect(html).toContain('<span class="diff-prefix">&gt;</span>');
  });
  test('diff js の順番でハイライトする', async () => {
    const jsString = [
      '```diff js',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('class="line diff');
  });
  test('diff html の順番でハイライトする', async () => {
    const jsString = [
      '```diff html',
      '-     <html class="foo">',
      '+     <html class="bar">',
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('class="line diff');
  });
  test('js diff のコードブロックをハイライトしてファイル名を表示する', async () => {
    const jsString = [
      '```js diff:index.js',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
  });
  test('html diff のコードブロックをハイライトしてファイル名を表示する', async () => {
    const jsString = [
      '```html diff:index.html',
      '-     <html class="foo">',
      '+     <html class="bar">',
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
  });
  test('":" の前にスペースが存在しても js をハイライトしてファイル名を表示する', async () => {
    const jsString = [
      '```js diff :index.js',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
  });
  test('":" の前にスペースが存在しても html をハイライトしてファイル名を表示する', async () => {
    const jsString = [
      '```html diff :index.html',
      '-     <html class="foo">',
      '+     <html class="bar">',
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
  });
  test('":" が含まれるファイル名が表示される', async () => {
    const jsString = [
      '```js:index:withcolons.js',
      "console.log('foo')",
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain(
      '<span class="code-block-filename">index:withcolons.js</span>'
    );
  });
});

describe('コードブロック内の特殊文字のテスト', () => {
  test("$' を含むコードが正しく変換される", async () => {
    // $' は String.replace() の特殊パターン（マッチ位置より後ろの文字列）
    const markdown = [
      '```text',
      "#set($body = $input.path('$'))",
      '```',
      '',
      '次の段落',
    ].join('\n');
    const html = await markdownToHtml(markdown);
    // $' が展開されず、コードブロック内に収まっていること
    expect(html).toContain("$input.path('$')");
    // 次の段落がコードブロック外にあること
    expect(html).toContain('<p data-line="4"');
    expect(html).toContain('次の段落');
    // HTML が異常に大きくならないこと
    expect(html.length).toBeLessThan(5000);
  });

  test('$` を含むコードが正しく変換される', async () => {
    // $` は String.replace() の特殊パターン（マッチ位置より前の文字列）
    const markdown = ['```js', 'const str = `$`', '```', '', '次の段落'].join(
      '\n'
    );
    const html = await markdownToHtml(markdown);
    expect(html).toContain('次の段落');
    expect(html.length).toBeLessThan(5000);
  });

  test('$& を含むコードが正しく変換される', async () => {
    // $& は String.replace() の特殊パターン（マッチした文字列全体）
    const markdown = ['```text', 'echo $&', '```', '', '次の段落'].join('\n');
    const html = await markdownToHtml(markdown);
    expect(html).toContain('次の段落');
    expect(html.length).toBeLessThan(5000);
  });

  test('$$ を含むコードが正しく変換される', async () => {
    // $$ は String.replace() で $ にエスケープされる
    const markdown = ['```bash', 'echo $$', '```', '', '次の段落'].join('\n');
    const html = await markdownToHtml(markdown);
    expect(html).toContain('$$');
    expect(html).toContain('次の段落');
    expect(html.length).toBeLessThan(5000);
  });

  test('複数の特殊パターンを含むコードが正しく変換される', async () => {
    const markdown = [
      '```text',
      "#set($body = $input.path('$'))",
      '```',
      '',
      '```js',
      "const x = `${'test'}`;",
      '```',
      '',
      '最後の段落',
    ].join('\n');
    const html = await markdownToHtml(markdown);
    expect(html).toContain('最後の段落');
    // 各コードブロックが独立していること
    expect(html.match(/<pre/g)?.length).toBe(2);
    expect(html.length).toBeLessThan(10000);
  });
});
