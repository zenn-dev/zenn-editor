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

## 開発者向けドキュメント

https://zenn-dev.github.io/zenn-docs-for-developers/guides/zenn-editor/zenn-content-css
