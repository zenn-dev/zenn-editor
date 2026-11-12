import { describe, test, expect } from 'vitest';
import markdownToHtml from '../src/index';

describe('$ マークのテスト', () => {
  test('リンクと同じ行にある $ は katex に変換される', async () => {
    const html = await markdownToHtml('$a,b,c$foo[foo](https://foo.bar)bar');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar'
    );
  });

  test('リンクの後に無効な $ が続く場合はそのままにする', async () => {
    const html = await markdownToHtml('$a,b,c$foo[foo](http://foo.bar)$bar');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="http://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>$bar'
    );
  });

  test('リンク名に $ が含まれる場合はそのままにする', async () => {
    const html = await markdownToHtml('$a,b,c$foo[$bar](http://foo.bar)bar');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="http://foo.bar" target="_blank" rel="nofollow noopener noreferrer">$bar</a>bar'
    );
  });
  test('リンクのhrefに $ が含まれる場合はそのままにする', async () => {
    const html = await markdownToHtml(
      '[this $ should be escaped](https://docs.angularjs.org/api/ng/service/$http)'
    );
    expect(html).toContain(
      '<a href="https://docs.angularjs.org/api/ng/service/$http" target="_blank" rel="nofollow noopener noreferrer">this $ should be escaped</a>'
    );
  });
});

describe('数式内のエスケープされた $ のテスト', () => {
  test('インラインの数式内の \\$ で数式を閉じない', async () => {
    const html = await markdownToHtml('$x+y=\\$z$');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">x+y=\\$z</eq></embed-katex>'
    );
  });

  test('\\$ だけのインラインの数式を katex に変換する', async () => {
    const html = await markdownToHtml('$\\$$');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">\\$</eq></embed-katex>'
    );
  });

  test('\\\\ で終わるインラインの数式は \\\\ の後の $ で閉じる', async () => {
    const html = await markdownToHtml('$a\\\\$');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a\\\\</eq></embed-katex>'
    );
  });

  test('数式の外の \\$ は $ のままにする', async () => {
    const html = await markdownToHtml('価格は \\$5 と \\$10');
    expect(html).toContain('価格は $5 と $10');
    expect(html).not.toContain('embed-katex');
  });

  test('ブロックの数式内の \\$ で数式を閉じない', async () => {
    const html = await markdownToHtml('$$\nx+y=\\$z\n$$');
    expect(html).toContain(
      '<section class="zenn-katex code-line" data-line="0"><eqn><embed-katex display-mode="1">\nx+y=\\$z\n</embed-katex></eqn></section>'
    );
  });

  test('式番号付きのブロックの数式内の \\$ で数式を閉じない', async () => {
    const html = await markdownToHtml('$$\nx+y=\\$z\n$$ (1)');
    expect(html).toContain(
      '<section class="zenn-katex eqno code-line" data-line="0"><eqn><embed-katex display-mode="1">\nx+y=\\$z\n</embed-katex></eqn><span>(1)</span></section>'
    );
  });

  test('数式の外の \\$ を挟んで後ろの数式までを1つの数式にしない', async () => {
    const html = await markdownToHtml('約 $3 から \\$5 へ。式は $y$ です');
    expect(html).toContain(
      '約 $3 から $5 へ。式は <embed-katex><eq class="zenn-katex">y</eq></embed-katex> です'
    );
  });

  test('エスケープしていない $ を数式の中身に含めない', async () => {
    const html = await markdownToHtml('cost $5 and $x$');
    expect(html).toContain(
      'cost $5 and <embed-katex><eq class="zenn-katex">x</eq></embed-katex>'
    );
  });

  test('\\ の後の $ しかない場合は数式にしない', async () => {
    const html = await markdownToHtml('$a\\$');
    expect(html).not.toContain('embed-katex');
  });

  test('リンク名の中の \\$ を数式にしない', async () => {
    const html = await markdownToHtml('[$a\\$b](http://foo.bar)');
    expect(html).toContain(
      '<a href="http://foo.bar" target="_blank" rel="nofollow noopener noreferrer">$a$b</a>'
    );
  });

  test('文中の $$ で囲んだ数式内の \\$ で数式を閉じない', async () => {
    const html = await markdownToHtml('a $$x\\$y$$ b');
    expect(html).toContain(
      '<section class="zenn-katex"><embed-katex display-mode="1"><eqn>x\\$y</eqn></embed-katex></section>'
    );
  });

  test('1行の $$ で囲んだ \\$ を含む数式をブロックの数式にする', async () => {
    const html = await markdownToHtml('$$a\\$b$$');
    expect(html).toContain(
      '<section class="zenn-katex code-line" data-line="0"><eqn><embed-katex display-mode="1">a\\$b</embed-katex></eqn></section>'
    );
  });

  test('引用の中のブロックの数式内の \\$ で数式を閉じない', async () => {
    const html = await markdownToHtml('> $$\n> a \\$ b\n> $$');
    expect(html).toContain(
      '<embed-katex display-mode="1"> a \\$ b </embed-katex>'
    );
  });

  test("インラインの数式内の \\$& や \\$' をそのまま出力する", async () => {
    const html = await markdownToHtml("$a\\$&b$ と $c\\$'d$");
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a\\$&amp;b</eq></embed-katex> と <embed-katex><eq class="zenn-katex">c\\$\'d</eq></embed-katex>'
    );
  });

  test("ブロックの数式内の \\$& や \\$' をそのまま出力する", async () => {
    const html = await markdownToHtml("$$\na\\$&b\\$'c\n$$ (1)");
    expect(html).toContain(
      '<embed-katex display-mode="1">\na\\$&amp;b\\$\'c\n</embed-katex></eqn><span>(1)</span></section>'
    );
  });

  test('ブロックの数式内の \\\\ はそのままにする', async () => {
    const html = await markdownToHtml('$$\na \\\\\nb\n$$');
    expect(html).toContain(
      '<embed-katex display-mode="1">\na \\\\\nb\n</embed-katex>'
    );
  });
});

describe('引用の中のブロックの数式のテスト', () => {
  test('各行の先頭の > を取り除く', async () => {
    const html = await markdownToHtml('> $$\n> a\n> b\n> $$');
    expect(html).toContain(
      '<section class="zenn-katex code-line" data-line="0"><eqn><embed-katex display-mode="1"> a b </embed-katex></eqn></section>'
    );
  });

  test('> だけの行も取り除く', async () => {
    const html = await markdownToHtml('> $$\n> a\n>\n> b\n> $$');
    expect(html).toContain('<embed-katex display-mode="1"> a b </embed-katex>');
  });

  test('> の後の2つ目以降の空白は残す', async () => {
    const html = await markdownToHtml('> $$\n>  a\n> $$');
    expect(html).toContain('<embed-katex display-mode="1">  a </embed-katex>');
  });

  test('二重の引用では各行の先頭の > > を取り除く', async () => {
    const html = await markdownToHtml('> > $$\n> > a\n> > $$');
    expect(html).toContain('<embed-katex display-mode="1"> a </embed-katex>');
  });

  test('式番号付きのブロックの数式でも各行の先頭の > を取り除く', async () => {
    const html = await markdownToHtml('> $$\n> a\n> $$ (1)');
    expect(html).toContain(
      '<embed-katex display-mode="1"> a </embed-katex></eqn><span>(1)</span>'
    );
  });

  test('空行が多く続いても短い時間で変換できる', async () => {
    // 先頭の > を取り除く処理が、空行の数の3乗に比例して遅くならないことを確認する
    const input = '> $$\n' + '\n'.repeat(3000) + '$$';
    const start = performance.now();
    await markdownToHtml(input);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});

describe('HTMLタグにエスケープするテスト', () => {
  test('katex内の<sscript />をエスケープする', async () => {
    const html = await markdownToHtml('$a,<script>alert("XSS")</script>,c$');
    expect(html).toContain(
      `<embed-katex><eq class="zenn-katex">a,&lt;script&gt;alert("XSS")&lt;/script&gt;,c</eq></embed-katex>`
    );
  });
});

describe('$ のペアのテスト', () => {
  test('リンクの前後にある一文字だけを含む$のペアをkatexに変換する', async () => {
    const html = await markdownToHtml(
      '$a$foo[foo](https://foo.bar)bar,refs:$(2)$'
    );
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex>'
    );
  });
  test('リンク前後にある$のペアをkatexに変換する', async () => {
    const html = await markdownToHtml(
      '$a,b,c$foo[foo](https://foo.bar)bar,refs:$(2)$'
    );
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex>'
    );
  });
  test('リンク前後にある三つの$のペアをkatexに変換する', async () => {
    const html = await markdownToHtml(
      '$a,b,c$foo[foo](https://foo.bar)bar,refs:$(2)$,and:$(3)$'
    );
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex>,and:<embed-katex><eq class="zenn-katex">(3)</eq></embed-katex>'
    );
  });
  test('リンク周りにある$のペアをkatexに変換する', async () => {
    const html = await markdownToHtml(
      '$a,b,c$foo[foo](https://foo.bar)bar,refs:$2$'
    );
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foo<a href="https://foo.bar" target="_blank" rel="nofollow noopener noreferrer">foo</a>bar,refs:<embed-katex><eq class="zenn-katex">2</eq></embed-katex>'
    );
  });
  test('二つの$のペアをkatexに変換する', async () => {
    const html = await markdownToHtml('$a,b,c$foobar,refs:$(2)$');
    expect(html).toContain(
      '<embed-katex><eq class="zenn-katex">a,b,c</eq></embed-katex>foobar,refs:<embed-katex><eq class="zenn-katex">(2)</eq></embed-katex>'
    );
  });
});
