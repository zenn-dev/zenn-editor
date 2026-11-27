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
const html = await markdownToHtml(markdown);
```

サポートする記法については、Zenn の[Markdown 記法一覧](https://zenn.dev/zenn/articles/markdown-guide)を参照してください。

#### 埋め込み要素の挙動をカスタマイズする

`customEmbed` オプションを使うことで埋め込み要素の挙動をカスタマイズできます。
カスタマイズできる埋め込み要素については [Zenn のドキュメント](https://zenn.dev/zenn/articles/markdown-guide#コンテンツの埋め込み)を参照してください。

```js
import markdownToHtml from 'zenn-markdown-html';
const html = await markdownToHtml(markdown, {
  customEmbed: {
    // @[tweet](...)に対応している埋め込み要素をカスタマイズする
    tweet(url) {
      // 注意: サニタイズによって<script src="https://platform.twitter.com/widgets.js" />は埋め込めないので、別の場所で埋め込み必要があります！
      return `
        <blockquote
          class="twitter-tweet"
          data-conversation="${
            url.split(/&|\?/).includes('conversation=none') ? 'none' : ''
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
const html = await markdownToHtml(markdown, {
  embedOrigin: 'https://embed.zenn.studio',
});
```

#### 音声の埋め込みを有効にする

`@[audio](URL)` は、`audioEmbed` を `true` にしたときだけ `<audio>` として出力します。未指定の場合は URL へのリンクになります。
埋め込みを許可する音声の配信元は `audioOrigins` に指定してください。`audioEmbed` を有効にしても、`audioOrigins` を指定しなければ音声は埋め込まれません。
埋め込むのは `<配信元>/audio/<32桁の16進数（小文字）>.m4a` の形の URL だけです。クエリやフラグメントが付いた URL は埋め込みません。

```js
import markdownToHtml from 'zenn-markdown-html';
const html = await markdownToHtml(markdown, {
  audioEmbed: true,
  audioOrigins: ['https://audio.example.com'],
});
```

`audioLocalPaths` を `true` にすると、`@[audio](/files/intro.m4a)` のような `/files/` から始まる相対パスも `<audio>` として出力します（`audioEmbed` が有効な場合のみ）。
出力するのは `.m4a` で終わるパスだけで、`..` やクエリ、フラグメントを含むパスは出力しません。日本語などのファイル名は、そのままでもパーセントエンコードしても書けます。src には、セグメントごとにパーセントエンコードしたパス（ファイル名は NFC に正規化）を出力します。
相対パスの音声は、呼び出し側で配信するか、変換後の HTML の src を実際の URL に差し替えてください。

```js
const html = await markdownToHtml(markdown, {
  audioEmbed: true,
  audioLocalPaths: true,
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
