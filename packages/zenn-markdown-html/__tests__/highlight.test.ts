import { describe, test, expect } from 'vitest';
import markdownToHtml from '../src/index';
import parse from 'node-html-parser';

describe('コードハイライトのテスト', () => {
  test('コードブロックを正しい<code />に変換する', async () => {
    const html = await markdownToHtml(
      `\`\`\`js:foo.js\nconsole.log("hello")\n\`\`\``
    );
    // <code />が取得できないので<pre />で取得する
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pre: any = parse(html).querySelector('pre');
    const code = parse(pre?.innerHTML).querySelector('code.language-js');
    expect(code).toBeTruthy();
    expect(html).toContain('<span class="code-block-filename">foo.js</span>');
  });

  test('js のコードブロックをハイライトする', async () => {
    const jsString = ['```js', "console.log('foo')", '```'].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('language-js');
  });

  test('スペースで区切られた追加の言語は無視する', async () => {
    const jsString = ['```js some-info', "console.log('foo')", '```'].join(
      '\n'
    );
    const html = await markdownToHtml(jsString);
    expect(html).toContain('language-js');
  });

  test('htmlのコードブロックをハイライトできる', async () => {
    const jsString = ['```html', '<html></html>', '```'].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('language-html');
  });
  test('js のコードブロックをハイライトしてファイル名を表示する', async () => {
    const jsString = ['```js:index.js', "console.log('foo')", '```'].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
    expect(html).toContain('language-js');
  });
  test('html のコードブロックをハイライトしてファイル名を表示する', async () => {
    const jsString = ['```html:index.html', '<html></html>', '```'].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
    expect(html).toContain('language-html');
  });
  test('js diff のコードブロックをハイライトする', async () => {
    const jsString = [
      '```js diff',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
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
    expect(html).toContain('diff-highlight language-diff-html');
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
    expect(html).toContain('diff-highlight language-diff-js');
  });
  test('diff html の順番でハイライトする', async () => {
    const jsString = [
      '```diff html',
      '-     <html class="foo">',
      '+     <html class="bar">',
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-html');
  });
  test('js diff のコードブロックをハイライトしてファイル名を表示する', async () => {
    const jsString = [
      '```js diff:index.js',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = await markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
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
    expect(html).toContain('diff-highlight language-diff-html');
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
    expect(html).toContain('diff-highlight language-diff-js');
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
    expect(html).toContain('diff-highlight language-diff-html');
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
    expect(html).toContain('language-js');
  });
});
