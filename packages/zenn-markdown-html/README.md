# zenn-markdown-html

zenn-markdown-html は、Zenn 独自の記法を含む markdown を HTML に変換するためのパッケージです。

## 使い方

このパッケージは 2 つのインターフェイスを提供します。

- `markdownToHtml`: Zenn の記事、本、コメントなどで使用する HTML に変換します。
- `markdownToSimpleHtml`: Publication の定型メッセージなど、限られた装飾のみをサポートする HTML に変換します。

### markdownToHtml

Markdown を HTML に変換します。

```js
import markdownToHtml from 'zenn-markdown-html';
const html = markdownToHtml(markdown);
```

サポートする記法については、Zenn の[Markdown 記法一覧](https://zenn.dev/zenn/articles/markdown-guide)を参照してください。

#### 埋め込み要素の挙動をカスタマイズする

`customEmbed` オプションを使うことで埋め込み要素の挙動をカスタマイズできます。
カスタマイズできる埋め込み要素については [Zenn のドキュメント](https://zenn.dev/zenn/articles/markdown-guide#コンテンツの埋め込み)を参照してください。

```js
import markdownToHtml from 'zenn-markdown-html';
const html = markdownToHtml(markdown, {
  customEmbed: {
    // @[tweet](...)に対応している埋め込み要素をカスタマイズする
    tweet(url) {
      // 注意: サニタイズによって<script src="https://platform.twitter.com/widgets.js" />は埋め込めないので、別の場所で埋め込み必要があります！
      return `
        <blockquote
          className="twitter-tweet"
          data-conversation="${
            src.split(/&|\?/).includes('conversation=none') ? 'none' : ''
          }"
        >
          <a href="${url}" rel="nofollow noopener noreferrer" target="_blank">
            ${url}
          </a>
        </blockquote>
      `;
    },
  },
});
```

#### zenn.dev と同じ埋め込み要素を使用する

埋め込み機能を使用する場合は、ホスティングされている埋め込みサーバーの Origin URL を `embedOrigin` を指定してください。
**非商用の場合のみ** Zenn が提供する埋め込みサーバーを指定できます。

```js
import markdownToHtml from 'zenn-markdown-html';
const html = markdownToHtml(markdown, {
  embedOrigin: 'https://embed.zenn.studio',
});
```

### markdownToSimpleHtml

Markdown を HTML に変換します。markdownToHtml と比べてサポートする記法が限られています。

```js
import { markdownToSimpleHtml } from 'zenn-markdown-html';
const html = markdownToSimpleHtml(markdown);
```

サポートする記法

- Markdown 記法（リンク、リスト、太字・斜体）
- パラグラフ内の改行
- URL をリンクに変換

## 開発者向けドキュメント

https://zenn-dev.github.io/zenn-docs-for-developers/guides/zenn-editor/zenn-markdown-html
