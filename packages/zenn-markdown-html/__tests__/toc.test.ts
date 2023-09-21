import { describe, test, expect } from 'vitest';
import { parseToc } from '../src/utils/toc';

describe('generateToc', () => {
  describe('生成対象がないとき', () => {
    const html = '<p>ポエム</p>';
    const toc = parseToc(html);

    test('空配列が返ること', () => {
      expect(toc).toEqual([]);
    });
  });

  describe('実践的なHTMLでTOCが生成できること', () => {
    const html =
      '<p>Zenn が Apple Pay と Google Pay での決済に対応しました。スマートフォンで本を買いたいときや、バッジを贈りたいときにクレジットカードを登録しなくても決済できるようになりましたね。この記事ではMacBook ProでApple PayとGoogle Payを設定して支払う流れをメモします。</p>\n<h1 id="apple-pay%E3%80%81google-pay%E3%81%A8%E3%81%AF"><a class="header-anchor-link" href="#apple-pay%E3%80%81google-pay%E3%81%A8%E3%81%AF" aria-hidden="true"></a> Apple Pay、Google Payとは</h1>\n<p>詳しい説明は別サイト様におまかせしますが、専用のアプリでクレジットカードなどの支払い方法を登録することで、デバイス・アカウントを通した支払いが可能になる仕組みです。</p>\n<p><div class="zenn-embedded zenn-embedded-link-card"><iframe id="zenn-embedded__e8c4d115b9366" src="https://embed-itg.zenn.studio/link-card#zenn-embedded__e8c4d115b9366" data-content="https%3A%2F%2Fwww.apple.com%2Fjp%2Fapple-pay%2F" frameborder="0" scrolling="no" loading="lazy"></iframe></div><a href="https://www.apple.com/jp/apple-pay/" style="display: none" target="_blank" rel="nofollow noopener noreferrer">https://www.apple.com/jp/apple-pay/</a><br style="display: none">\n<div class="zenn-embedded zenn-embedded-link-card"><iframe id="zenn-embedded__8a68f35dff0a4" src="https://embed-itg.zenn.studio/link-card#zenn-embedded__8a68f35dff0a4" data-content="https%3A%2F%2Fpay.google.com%2Fintl%2Fja_jp%2Fabout%2F" frameborder="0" scrolling="no" loading="lazy"></iframe></div><a href="https://pay.google.com/intl/ja_jp/about/" style="display: none" target="_blank" rel="nofollow noopener noreferrer">https://pay.google.com/intl/ja_jp/about/</a></p>\n<p>オンライン決済においては、Apple Pay や Google Pay へ支払い方法を登録しておけば、以後クレジットカード番号を入力せずとも決済できるようになります（ショッピングサイトが対応していれば）。</p>\n<h1 id="mac-%E3%81%A7-apple-pay-%E3%81%AE%E3%82%AB%E3%83%BC%E3%83%89%E3%82%92%E8%BF%BD%E5%8A%A0%E3%81%99%E3%82%8B"><a class="header-anchor-link" href="#mac-%E3%81%A7-apple-pay-%E3%81%AE%E3%82%AB%E3%83%BC%E3%83%89%E3%82%92%E8%BF%BD%E5%8A%A0%E3%81%99%E3%82%8B" aria-hidden="true"></a> Mac で Apple Pay のカードを追加する</h1>\n<p>こちらのページに沿って説明します。</p>\n<p><div class="zenn-embedded zenn-embedded-link-card"><iframe id="zenn-embedded__58aa5c740c9e9" src="https://embed-itg.zenn.studio/link-card#zenn-embedded__58aa5c740c9e9" data-content="https%3A%2F%2Fsupport.apple.com%2Fja-jp%2FHT204506" frameborder="0" scrolling="no" loading="lazy"></iframe></div><a href="https://support.apple.com/ja-jp/HT204506" style="display: none" target="_blank" rel="nofollow noopener noreferrer">https://support.apple.com/ja-jp/HT204506</a></p>\n<p>Macの設定から、ウォレット＆Apple Pay を開きます。画面の案内に沿ってカードを追加します。</p>\n<p><img src="/images/hello-apple-google-pay-zenn/2022-06-16-12-01-00.png" alt=""></p>\n<p>この状態になればOKです。</p>\n<h2 id="safari-%E3%81%A7%E6%94%AF%E6%89%95%E3%81%86"><a class="header-anchor-link" href="#safari-%E3%81%A7%E6%94%AF%E6%89%95%E3%81%86" aria-hidden="true"></a> Safari で支払う</h2>\n<p>Apple Pay が利用できるブラウザはSafariです。SafariでZennを開き、気になった記事や応援したい本にバッジを送ってみましょう。</p>\n<p><img src="/images/hello-apple-google-pay-zenn/2022-06-16-12-08-14.png" alt=""></p>\n<p>すでにクレジットカードを登録している場合は、「別の支払い方法を選ぶ」を押します。</p>\n<p><img src="/images/hello-apple-google-pay-zenn/2022-06-16-12-09-22.png" alt=""></p>\n<p>支払い方法の入力画面で、Apple Pay の選択肢が出現するはずなので、そちらをクリックしてください。その後、確認画面へ進みます。</p>\n<p><img src="/images/hello-apple-google-pay-zenn/2022-06-16-12-10-07.png" alt=""></p>\n<p>内容に問題がなければ「バッジ購入を確定する」としてください。このとき、Touch ID などが求められるかもしれません。認証に成功したら、バッジ購入が完了します。</p>\n<h1 id="google-pay-%E3%81%AE%E3%82%AB%E3%83%BC%E3%83%89%E3%82%92%E8%BF%BD%E5%8A%A0%E3%81%99%E3%82%8B"><a class="header-anchor-link" href="#google-pay-%E3%81%AE%E3%82%AB%E3%83%BC%E3%83%89%E3%82%92%E8%BF%BD%E5%8A%A0%E3%81%99%E3%82%8B" aria-hidden="true"></a> Google Pay のカードを追加する</h1>\n<p>参考：<br style="display: none">\n<div class="zenn-embedded zenn-embedded-link-card"><iframe id="zenn-embedded__dad3901022ac9" src="https://embed-itg.zenn.studio/link-card#zenn-embedded__dad3901022ac9" data-content="https%3A%2F%2Fsupport.google.com%2Fpay%2Fanswer%2F7625055%3Fhl%3Dja%26co%3DGENIE.Platform%253DDesktop" frameborder="0" scrolling="no" loading="lazy"></iframe></div><a href="https://support.google.com/pay/answer/7625055?hl=ja&amp;co=GENIE.Platform%3DDesktop" style="display: none" target="_blank" rel="nofollow noopener noreferrer">https://support.google.com/pay/answer/7625055?hl=ja&amp;co=GENIE.Platform%3DDesktop</a></p>\n<p>PCから設定する場合は、こちらのサイトへ行きます（要ログイン）。</p>\n<p><a href="https://pay.google.com/" target="_blank" rel="nofollow noopener noreferrer">https://pay.google.com/</a></p>\n<p>お支払い方法タブ＞お支払い方法を追加 として、クレジットカードなどを登録してください。</p>\n<p><img src="/images/hello-apple-google-pay-zenn/2022-06-16-12-14-50.png" alt=""></p>\n<p>この状態になればOKです。</p>\n<h2 id="chrome-%E3%81%A7%E6%94%AF%E6%89%95%E3%81%86"><a class="header-anchor-link" href="#chrome-%E3%81%A7%E6%94%AF%E6%89%95%E3%81%86" aria-hidden="true"></a> Chrome で支払う</h2>\n<p><strong>あらかじめ Google Pay を登録したアカウントと、Chrome のプロファイルを一致させる必要があります。</strong> この状態でZennを開き、読みたい本を買ってみましょう。</p>\n<p><img src="/images/hello-apple-google-pay-zenn/2022-06-16-12-22-34.png" alt=""></p>\n<p>すでにクレジットカードを登録している場合は、別の支払方法を選びます。</p>\n<p><img src="/images/hello-apple-google-pay-zenn/2022-06-16-12-23-41.png" alt=""></p>\n<p>Google Pay が選べるはずなので、選択して確認画面へ進みます。</p>\n<p><img src="/images/hello-apple-google-pay-zenn/2022-06-16-12-24-39.png" alt=""></p>\n<p>内容に問題がなければ「本の購入を確定する」としてください。このとき、さらにポップアップが出て確認を求められるかもしれません。確定したら、本の購入が完了します。</p>\n<h3 id="%E3%82%AF%E3%83%AC%E3%82%AB"><a class="header-anchor-link" href="#%E3%82%AF%E3%83%AC%E3%82%AB" aria-hidden="true"></a> クレカ</h3>\n<p>クレカも使えます</p>\n<details><summary>この中は目次ではない</summary><div class="details-content"><h1 id="details-h1"><a class="header-anchor-link" href="#details-h1" aria-hidden="true"></a> Details h1</h1>\n<p>はい</p>\n<h2 id="details-h2"><a class="header-anchor-link" href="#details-h2" aria-hidden="true"></a> Details h2</h2>\n<p>へい</p>\n<h2 id="details-h3"><a class="header-anchor-link" href="#details-h3" aria-hidden="true"></a> Details h3</h2>\n<p>ほい</p>\n</div></details>\n<h1 id="%E3%81%8A%E3%82%8F%E3%82%8A%E3%81%AB"><a class="header-anchor-link" href="#%E3%81%8A%E3%82%8F%E3%82%8A%E3%81%AB" aria-hidden="true"></a> おわりに</h1>\n<p>Apple PayやGoogle Payを設定しておけば、Zennクレジットカードを登録することなく登録することなくバッジや本が購入できます。応援する気持ちをバッジとして贈っていきましょう！Google Pay や Apple Pay の設定は完全に私個人の環境で行っていますので、もしうまくいかない点、間違っている点があったら教えて下さい。</p>';
    const toc = parseToc(html);

    test('HTMLからTOCが意図した数だけ出力される', () => {
      expect(toc).toHaveLength(4);
    });
    test('ネスト構造が一致する', () => {
      expect(toc[1].children).toEqual(
        expect.arrayContaining([
          {
            children: [],
            id: 'safari-%E3%81%A7%E6%94%AF%E6%89%95%E3%81%86',
            level: 2,
            text: 'Safari で支払う',
          },
        ])
      );
    });
  });

  describe('textの前後の空白や改行', () => {
    const html = `
    <h1 id="a">
    <a class="header-anchor-link" href="#a" aria-hidden="true" rel="nofollow"></a> a </h1>
  `;

    test('取り除かれること', () => {
      const toc = parseToc(html);
      expect(toc[0]).toEqual({
        text: 'a',
        id: 'a',
        level: 1,
        children: [],
      });
    });
  });

  describe('標準的な構成の場合', () => {
    const html = `
    <h1 id="1a">1a</h1>
    <h2 id="1a-2a">1a-2a</h2>
    <h3 id="1a-2a-3a">1a-2a-3a</h3>
    <h3 id="1a-2a-3b">1a-2a-3b</h3>
    <h2 id="1a-2b">1a-2b</h2>
    <h3 id="1a-2b-3a">1a-2b-3a</h3>
    <h3 id="1a-2b-3b">1a-2b-3b</h3>
    <h1 id="1b">1b</h1>
    <h2 id="1b-2a">1b-2a</h2>
    <h3 id="1b-2a-3a">1b-2a-3a</h3>
    <h3 id="1b-2a-3b">1b-2a-3b</h3>
    <h2 id="1b-2b">1b-2b</h2>
    <h3 id="1b-2b-3a">1b-2b-3a</h3>
    <h3 id="1b-2b-3b">1b-2b-3b</h3>
  `;
    const toc = parseToc(html);

    test('tocの階層構造が正しく生成されること1', () => {
      expect(toc[0]).toEqual({
        text: '1a',
        id: '1a',
        level: 1,
        children: [
          {
            text: '1a-2a',
            id: '1a-2a',
            level: 2,
            children: [
              { text: '1a-2a-3a', id: '1a-2a-3a', level: 3, children: [] },
              { text: '1a-2a-3b', id: '1a-2a-3b', level: 3, children: [] },
            ],
          },
          {
            text: '1a-2b',
            id: '1a-2b',
            level: 2,
            children: [
              { text: '1a-2b-3a', id: '1a-2b-3a', level: 3, children: [] },
              { text: '1a-2b-3b', id: '1a-2b-3b', level: 3, children: [] },
            ],
          },
        ],
      });
    });

    test('tocの階層構造が正しく生成されること2', () => {
      expect(toc[1]).toEqual({
        text: '1b',
        id: '1b',
        level: 1,
        children: [
          {
            text: '1b-2a',
            id: '1b-2a',
            level: 2,
            children: [
              { text: '1b-2a-3a', id: '1b-2a-3a', level: 3, children: [] },
              { text: '1b-2a-3b', id: '1b-2a-3b', level: 3, children: [] },
            ],
          },
          {
            text: '1b-2b',
            id: '1b-2b',
            level: 2,
            children: [
              { text: '1b-2b-3a', id: '1b-2b-3a', level: 3, children: [] },
              { text: '1b-2b-3b', id: '1b-2b-3b', level: 3, children: [] },
            ],
          },
        ],
      });
    });
  });

  describe('h3->h2->1hの順に検出した場合', () => {
    const html = `
    <h3 id="3a">3a</h3>
    <h2 id="2a">2a</h2>
    <h1 id="1a">1a</h1>
    <h1 id="1b">1b</h1>
    <h2 id="1b-2a">1b-2a</h2>
    <h3 id="1b-2a-3a">1b-2a-3a</h3>`;

    const toc = parseToc(html);

    test('ネストされずすべてトップレベルにならぶこと', () => {
      expect(toc[0]).toEqual({ text: '3a', id: '3a', level: 3, children: [] });
      expect(toc[1]).toEqual({ text: '2a', id: '2a', level: 2, children: [] });
      expect(toc[2]).toEqual({ text: '1a', id: '1a', level: 1, children: [] });
      expect(toc[3]).toEqual({
        text: '1b',
        id: '1b',
        level: 1,
        children: [
          {
            text: '1b-2a',
            id: '1b-2a',
            level: 2,
            children: [
              { text: '1b-2a-3a', id: '1b-2a-3a', level: 3, children: [] },
            ],
          },
        ],
      });
    });
  });

  describe('1h->h3->h2->h3の順に出現した場合', () => {
    const html = `
    <h1 id="1a">1a</h1>
    <h3 id="1a-3a">1a-3a</h3>
    <h2 id="1a-2a">1a-2a</h2>
    <h3 id="1a-2a-3a">1a-2a-3a</h3>`;

    const toc = parseToc(html);

    test('h3->h2は同じレベルに並び、h2->h3は階層化されること', () => {
      expect(toc[0]).toEqual({
        text: '1a',
        id: '1a',
        level: 1,
        children: [
          { text: '1a-3a', id: '1a-3a', level: 3, children: [] },
          {
            text: '1a-2a',
            id: '1a-2a',
            level: 2,
            children: [
              { text: '1a-2a-3a', id: '1a-2a-3a', level: 3, children: [] },
            ],
          },
        ],
      });
    });
  });

  describe('details/summary内の見出し', () => {
    const html = `
    <h1 id="1a">1a</h1>
    <h2 id="1a-2a">1a-2a</h2>
    <h3 id="1a-2a-3a">1a-2a-3a</h3>
    <details>
      <summary>Hello</summary>
      <h1 id="1a-2b">1a-2b</h2>
      <h2 id="1a-2b-3a">1a-2b-3a</h3>
      <h3 id="1a-2b-3b">1a-2b-3b</h3>
    </details>
    <h1 id="1b">1b</h1>
    <h2 id="1b-2a">1b-2a</h2>
    <h3 id="1b-2a-3a">1b-2a-3a</h3>
    `;
    const toc = parseToc(html);

    test('目次に含まれないこと', () => {
      expect(toc[0]).toEqual({
        text: '1a',
        id: '1a',
        level: 1,
        children: [
          {
            text: '1a-2a',
            id: '1a-2a',
            level: 2,
            children: [
              { text: '1a-2a-3a', id: '1a-2a-3a', level: 3, children: [] },
            ],
          },
        ],
      });
      expect(toc[1]).toEqual({
        text: '1b',
        id: '1b',
        level: 1,
        children: [
          {
            text: '1b-2a',
            id: '1b-2a',
            level: 2,
            children: [
              { text: '1b-2a-3a', id: '1b-2a-3a', level: 3, children: [] },
            ],
          },
        ],
      });
    });
  });

  describe('制御文字入りのヘッダ', () => {
    const html = `
    <h1 id="1a">1a\b\n\b</h1>
    `;
    const toc = parseToc(html);

    test('text()の制御文字が消え去ること', () => {
      expect(toc[0]).toEqual({
        text: '1a',
        id: '1a',
        level: 1,
        children: [],
      });
    });
  });
});
