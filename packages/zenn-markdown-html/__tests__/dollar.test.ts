import { describe, test, expect } from 'vitest';
import markdownToHtml from '../src/index';

describe('$ マークのテスト', () => {
  test('リンクと同じ行にある $ は katex に変換される', () => {
    const html = markdownToHtml('$a,b,c$foo[foo](https://foo.bar)bar');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar'
    );
  });

  test('リンクの後に無効な $ が続く場合はそのままにする', () => {
    const html = markdownToHtml('$a,b,c$foo[foo](http://foo.bar)$bar');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="http://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>$bar'
    );
  });

  test('リンク名に $ が含まれる場合はそのままにする', () => {
    const html = markdownToHtml('$a,b,c$foo[$bar](http://foo.bar)bar');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="http://foo.bar" target="_blank" rel="nofollow noopener noreferrer">$bar</a>bar'
    );
  });
  test('リンクのhrefに $ が含まれる場合はそのままにする', () => {
    const html = markdownToHtml(
      '[this $ should be escaped](https://docs.angularjs.org/api/ng/service/$http)'
    );
    expect(html).toContain(
      '<a href="https://docs.angularjs.org/api/ng/service/$http" target="_blank" rel="nofollow noopener noreferrer">this $ should be escaped</a>'
    );
  });
});

describe('HTMLタグにエスケープするテスト', () => {
  test('katex内の<sscript />をエスケープする', () => {
    const html = markdownToHtml('$a,<script>alert("XSS")</script>,c$');
    expect(html).toContain(
      `<embed-katex><eq class="zenn-katex">a,&lt;script&gt;alert("XSS")&lt;/script&gt;,c</eq></embed-katex>`
    );
  });
});

describe('$ のペアのテスト', () => {
  test('リンクの前後にある一文字だけを含む$のペアをkatexに変換する', () => {
    const html = markdownToHtml('$a$foo[foo](https://foo.bar)bar,refs:$(2)$');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex>'
    );
  });
  test('リンク前後にある$のペアをkatexに変換する', () => {
    const html = markdownToHtml(
      '$a,b,c$foo[foo](https://foo.bar)bar,refs:$(2)$'
    );
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex>'
    );
  });
  test('リンク前後にある三つの$のペアをkatexに変換する', () => {
    const html = markdownToHtml(
      '$a,b,c$foo[foo](https://foo.bar)bar,refs:$(2)$,and:$(3)$'
    );
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex>,and:<embed-katex><eq class="zenn-katex">(3)</eq></embed-katex>'
    );
  });
  test('リンク周りにある$のペアをkatexに変換する', () => {
    const html = markdownToHtml('$a,b,c$foo[foo](https://foo.bar)bar,refs:$2$');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">2</eq></embed-katex>'
    );
  });
  test('二つの$のペアをkatexに変換する', () => {
    const html = markdownToHtml('$a,b,c$foobar,refs:$(2)$');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foobar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex>'
    );
  });
});
