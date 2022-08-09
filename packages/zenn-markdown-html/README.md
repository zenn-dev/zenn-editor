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

### Babel の使用について

`zenn-markdown-html` では、PrismJS の言語プラグインを予め全て読み込むために `babel-plugin-prismjs` を使用しているため、ソースコードのビルドには `babel` を使用し、型ファイル(\*.d.ts)のビルドには `tsc` を使用してビルドしています。

### 埋め込み対応ガイドライン

Markdownにカスタムブロックを追加し、外部ページの埋め込みを追加することができます。（例: `@[youtube](youtube-video-id)`）新しい埋め込みを追加する場合は、以下のガイドラインに従ってください。

- iframeで埋め込みができること。ただし、外部から提供されているscriptを使ってiframeを生成するのはセキュリティ上の理由からNGです。
- 埋め込みの対象となるサービスが広く普及しており、継続的に安定して運営されることが見込まれること。

### Link Cardの埋め込みについて

本文中にURLがある場合、それをLink Cardとして埋め込みで表示します。なお、一部のメジャーなサービス（Twitter、Youtube、など）は、Link Cardではなくサービスに対応する埋め込みに変換しています。この変換に対応するサービスの基準は、現在対応しているサービスと同等のものとします。
