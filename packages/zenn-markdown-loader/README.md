## Library

- frontmatter => attributesとbodyを取得
bodyを以下のプラグインでHTMLに変換
- markdown-it
- markdown-it-prism
- markdown-it-highlight-lines
- markdown-it-container
- markdown-it-footnote
- markdown-it-image-lazy-loading

<!-- - remark html
- remark math（数式）
- remark frontmatter
- remark toc
- remark github
- remark footnotes -->

## System
### 1-1. マークダウンを変換するモジュール
以下のような引数を渡すと…
```js
{ body_markdown: "ここにマークダウン" }
```
以下のようにして返す
```js
{ 
  body_html: "<p>ここにマークダウン</p>",
  scripts: [
    {
      src: "//speakerdeck.com/assets/embed.js",
      async: true,
      "data-id": "id"
    },
    {
      src: "https://platform.twitter.com/widgets.js"
    }
  ] 
}
```
↑ scripts内の値をもとにscriptを生成し、embedする

### 1-2. 受け取った情報からscriptタグを生成するメソッド
- loadScriptsメソッドで1-1で受け取った情報からscriptタグを読み込む



## scripts
from project root
```
$ yarn workspace zenn-markdown-loader run build
```