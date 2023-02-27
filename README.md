![Zenn Editor](https://user-images.githubusercontent.com/34590683/91540859-60e06780-e956-11ea-9762-0acac2b7c4c5.png)

このリポジトリは、主に Zenn の Markdown に関するパッケージをまとめて管理しています。
これらのパッケージを利用することで、[Zenn CLI](https://zenn.dev/zenn/articles/install-zenn-cli) や Zenn の [VSCode 拡張](https://marketplace.visualstudio.com/items?itemName=zenn.zenn-preview) のような周辺システムを作ることができます。

## パッケージ一覧

| パッケージ名        | 説明                                                           |
| ------------------- | -------------------------------------------------------------- |
| zenn-cli            | ローカルの記事・本を表示するための CLI                         |
| zenn-content-css    | Markdown のプレビュー時のスタイル                              |
| zenn-embed-elements | ブラウザ上で動作してほしい埋め込み要素( Web Components で実装) |
| zenn-markdown-html  | Markdown を HTML に変換する                                    |
| zenn-model          | 記事や本のデータを扱う                                         |

## Zenn と同じ Markdown スタイルを使用する

Zenn と同じ Markdown を使用するには複数のパッケージを組み合わせる必要があります。

### 1. `zenn-markdown-html` により Markdown を HTML に変換する

```tsx
import markdownHtml from 'zenn-markdown-html';
```

以下のように Markdown を HTML に変換します。この処理は、Node.js でのみ実行できます。ブラウザで実行するとエラーになることにご注意ください。

```ts
const html = markdownHtml(markdown);
```

取得した HTML を埋め込み親要素のクラス名には`znc`という文字列を指定する必要があります。これは後述の CSS を適用するために必要です。

```tsx
// Reactの場合
<div
  // "znc"というクラス名を指定する
  className="znc"
  // htmlを渡す
  dangerouslySetInnerHTML={{
    __html: html,
  }}
/>
```

### 2. CSS を読み込む

```ts
import 'zenn-content-css';
```

### 3. 埋め込みコンテンツを有効にするため script を読み込む

以下のスクリプトを読み込むことで、Tweet や Mermaid などの埋め込み記法が使用できるようになります。

```html
<script src="https://embed.zenn.studio/js/listen-embed-event.js"></script>
```

このスクリプトは`<head>`タグ内で読み込みます。また、defer 属性や async 属性を指定すると SPA 等でのページ遷移時に正しく埋め込みが行われない可能性があることにご注意ください。

### 4. （KaTeX 記法を使う場合のみ）`zenn-embed-elements`を読み込む

`zenn-embed-elements`は SSR に対応していないため、クライアント側で読み込む必要があります。

```ts
// React で使う場合の例
import 'zenn-content-css';

export default function App(props) {
  useEffect(() => {
    import('zenn-embed-elements');
  }, []);

  return (
    <div
      className="znc"
      dangerouslySetInnerHTML={{
        __html: props.html, // markdownから変換されたHTMLを渡す
      }}
    />
  );
}
```

## 開発者向けドキュメント

https://zenn-dev.github.io/zenn-docs-for-developers/

## Licence

[MIT](LICENSE)
