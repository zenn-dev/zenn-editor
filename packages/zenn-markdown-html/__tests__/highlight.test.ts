import loadLanguages from 'prismjs/components/index';

import { describe, test, expect } from 'vitest';
import markdownToHtml from '../src/index';
import parse from 'node-html-parser';

// markdownToHtml で diff を使っているので、あらかじめ読み込んでおく
loadLanguages('diff');

describe('コードハイライトのテスト', () => {
  test('コードブロックを正しい<code />に変換する', () => {
    const html = markdownToHtml(
      `\`\`\`js:foo.js\nconsole.log("hello")\n\`\`\``
    );
    // <code />が取得できないので<pre />で取得する
    const pre: any = parse(html).querySelector('pre');
    const code = parse(pre?.innerHTML).querySelector('code.language-js');
    expect(code).toBeTruthy();
    expect(html).toContain('<span class="code-block-filename">foo.js</span>');
  });

  test('js のコードブロックをハイライトする', () => {
    const jsString = ['```js', "console.log('foo')", '```'].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('language-js');
  });

  test('スペースで区切られた追加の言語は無視する', () => {
    const jsString = ['```js some-info', "console.log('foo')", '```'].join(
      '\n'
    );
    const html = markdownToHtml(jsString);
    expect(html).toContain('language-js');
  });

  test('htmlのコードブロックをハイライトできる', () => {
    const jsString = ['```html', '<html></html>', '```'].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('language-html');
  });
  test('js のコードブロックをハイライトしてファイル名を表示する', () => {
    const jsString = ['```js:index.js', "console.log('foo')", '```'].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
    expect(html).toContain('language-js');
  });
  test('html のコードブロックをハイライトしてファイル名を表示する', () => {
    const jsString = ['```html:index.html', '<html></html>', '```'].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
    expect(html).toContain('language-html');
  });
  test('js diff のコードブロックをハイライトする', () => {
    const jsString = [
      '```js diff',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
  });
  test('html diff のコードブロックをハイライトする', () => {
    const jsString = [
      '```html diff',
      '-     <html class="foo">',
      '+     <html class="bar">',
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-html');
  });
  test('diff js の順番でハイライトする', () => {
    const jsString = [
      '```diff js',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
  });
  test('diff html の順番でハイライトする', () => {
    const jsString = [
      '```diff html',
      '-     <html class="foo">',
      '+     <html class="bar">',
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-html');
  });
  test('js diff のコードブロックをハイライトしてファイル名を表示する', () => {
    const jsString = [
      '```js diff:index.js',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
  });
  test('html diff のコードブロックをハイライトしてファイル名を表示する', () => {
    const jsString = [
      '```html diff:index.html',
      '-     <html class="foo">',
      '+     <html class="bar">',
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-html');
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
  });
  test('":" の前にスペースが存在しても js をハイライトしてファイル名を表示する', () => {
    const jsString = [
      '```js diff :index.js',
      "-     console.log('foo')",
      "+     console.log('bar')",
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
  });
  test('":" の前にスペースが存在しても html をハイライトしてファイル名を表示する', () => {
    const jsString = [
      '```html diff :index.html',
      '-     <html class="foo">',
      '+     <html class="bar">',
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-html');
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
  });
});
