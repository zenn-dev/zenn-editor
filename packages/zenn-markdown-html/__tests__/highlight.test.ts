import markdownToHtml from '../src/index';

describe('Code highlight propley', () => {
  test('should generate valid code format html', () => {
    const html = markdownToHtml(
      `\`\`\`js:foo.js\nconsole.log("hello")\n\`\`\``
    );
    expect(html).toContain('<code class="language-js">');
    expect(html).toContain('<span class="code-block-filename">foo.js</span>');
  });

  test('should highlight js syntax', () => {
    const jsString = ['```js', "console.log('hoge')", '```'].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('language-js');
  });
  test('should highlight html syntax', () => {
    const jsString = ['```html', '<html></html>', '```'].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('language-html');
  });
  test('should highlight js syntax and show filename', () => {
    const jsString = ['```js:index.js', "console.log('hoge')", '```'].join(
      '\n'
    );
    const html = markdownToHtml(jsString);
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
    expect(html).toContain('language-js');
  });
  test('should highlight html syntax and show filename', () => {
    const jsString = ['```html:index.html', '<html></html>', '```'].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
    expect(html).toContain('language-html');
  });
  test('should highlight js syntax', () => {
    const jsString = [
      '```js diff',
      "-     console.log('hoge')",
      "+     console.log('fuga')",
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
  });
  test('should highlight html syntax', () => {
    const jsString = [
      '```html diff',
      '-     <html class="hoge">',
      '+     <html class="fuga">',
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-html');
  });
  test('should highlight js syntax with diff js order', () => {
    const jsString = [
      '```diff js',
      "-     console.log('hoge')",
      "+     console.log('fuga')",
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
  });
  test('should highlight html syntax with diff html order', () => {
    const jsString = [
      '```diff html',
      '-     <html class="hoge">',
      '+     <html class="fuga">',
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-html');
  });
  test('should highlight js syntax and show filename', () => {
    const jsString = [
      '```js diff:index.js',
      "-     console.log('hoge')",
      "+     console.log('fuga')",
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
  });
  test('should highlight html syntax and show filename', () => {
    const jsString = [
      '```html diff:index.html',
      '-     <html class="hoge">',
      '+     <html class="fuga">',
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-html');
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
  });
  test('should highlight js syntax and show filename even if space exists before :', () => {
    const jsString = [
      '```js diff :index.js',
      "-     console.log('hoge')",
      "+     console.log('fuga')",
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-js');
    expect(html).toContain('<span class="code-block-filename">index.js</span>');
  });
  test('should highlight html syntax and show filename even if space exists before :', () => {
    const jsString = [
      '```html diff :index.html',
      '-     <html class="hoge">',
      '+     <html class="fuga">',
      '```',
    ].join('\n');
    const html = markdownToHtml(jsString);
    expect(html).toContain('diff-highlight language-diff-html');
    expect(html).toContain(
      '<span class="code-block-filename">index.html</span>'
    );
  });
});
