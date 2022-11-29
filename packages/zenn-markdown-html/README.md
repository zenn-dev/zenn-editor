# zenn-markdown-html

zenn-markdown-html は、Zenn独自の記法を含む markdown を HTML に変換するためのパッケージです。

## 使い方

このパッケージは2つのインターフェイスを提供します。

- `markdownToHtml`: Zennの記事、本、コメントなどで使用するHTMLに変換します。
- `markdownToSimpleHtml`: Publicationの定型メッセージなど、限られた装飾のみをサポートするHTMLに変換します。

### markdownToHtml

MarkdownをHTMLに変換します。

```js
import markdownToHtml from 'zenn-markdown-html';
const html = markdownToHtml(markdown);
```

サポートする記法については、Zennの[Markdown記法一覧](https://zenn.dev/zenn/articles/markdown-guide)を参照してください。

### markdownToSimpleHtml

MarkdownをHTMLに変換します。markdownToHtmlと比べてサポートする記法が限られています。

```js
import { markdownToSimpleHtml } from 'zenn-markdown-html';
const html = markdownToSimpleHtml(markdown);
```

サポートする記法

- Markdown記法（リンク、リスト、太字・斜体）
- パラグラフ内の改行
- URLをリンクに変換

## 開発者向けドキュメント

https://zenn-dev.github.io/zenn-docs-for-developers/guides/zenn-editor/zenn-markdown-html
