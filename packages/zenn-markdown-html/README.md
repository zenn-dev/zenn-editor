# Zenn Markdown Html

マークダウンを HTML へ変換するためのライブラリ。

## 使い方

```js
import markdownToHtml from 'zenn-markdown-html';
const html = markdownToHtml(markdown);
```

## 使用できる Markdown の記法について

- [Zenn の Markdown 記法一覧 | Zenn](https://zenn.dev/zenn/articles/markdown-guide)

## 開発者向けのドキュメント

## Babel の使用について

`zenn-markdown-html` では、PrismJS の言語プラグインを予め全て読み込むために `babel-plugin-prismjs` を使用しているため、ソースコードのビルドには `babel` を使用し、型ファイル(\*.d.ts)のビルドには `tsc` を使用してビルドしています。
