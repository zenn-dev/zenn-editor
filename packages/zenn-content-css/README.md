# zenn-content-css

zenn-markdown-html で markdown から変換された HTML に適用するためのCSSです。

## 使い方

Webpackと併用する場合は、CSSローダーが必要になる場合があります。

```js
import 'zenn-content-css';
```

スタイルを適用したい要素に `class=znc` を指定します。

```html
<div class="znc">
  <!-- html parsed from markdown comes here. -->
</div>
```

zncの外側の要素にはスタイルが適用されないことに注意してください。

## シンタックスハイライトについて

コードブロックのシンタックスハイライトは **Shiki** を使用しています。

- `_shiki.scss`: Shiki 用スタイル（現行）
- `_prism.scss`: Prism.js 用スタイル（非推奨・後方互換性のため残存）

`_prism.scss` は、Prism.js で既に変換された既存記事のために残しています。すぐに削除する予定はありませんが、将来的に削除される可能性があります。

## 開発者向けドキュメント

https://zenn-dev.github.io/zenn-docs-for-developers/guides/zenn-editor/zenn-content-css
