![Zenn Editor](https://user-images.githubusercontent.com/34590683/91540859-60e06780-e956-11ea-9762-0acac2b7c4c5.png)

## 利用方法

- [GitHubリポジトリをZennに連携する](https://zenn.dev/zenn/articles/connect-to-github)
- [Zenn CLIをインストールする](https://zenn.dev/zenn/articles/install-zenn-cli)
- [Zenn CLIの使い方](https://zenn.dev/zenn/articles/zenn-cli-guide)
- [ZennのMarkdown記法](https://zenn.dev/zenn/articles/markdown-guide)

## ご自身のWebサイトで使う場合

### 1. `zenn-markdown-html` によりMarkdownをHTMLに変換する


```tsx
import markdownHtml from 'zenn-markdown-html';
```

以下のようにMarkdownをHTMLに変換します。この処理は、Node.jsでのみ実行できます。ブラウザで実行するとエラーになることにご注意ください。


```tsx
const html = markdownHtml(markdown);
```

取得したHTMLを埋め込み親要素のクラス名には`znc`という文字列を指定する必要があります。これは後述のCSSを適用するために必要です。

```tsx
// Reactの場合
<div
  // "znc"というクラス名を指定する
  className="znc"
  // htmlを渡す
  dangerouslySetInnerHTML={{
    __html: html
  }}
/>
```

### 2. CSSを読み込む

```ts
import 'zenn-content-css';
```

### 3. 埋め込みコンテンツを有効にするためscriptを読み込む
以下のスクリプトを読み込むことで、TweetやMermaidなどの埋め込み記法が使用できるようになります。

```html
<script src="https://embed.zenn.studio/js/listen-embed-event.js" ></script>
```
このスクリプトは`<head>`タグ内で読み込みます。また、defer属性やasync属性を指定するとSPA等でのページ遷移時に正しく埋め込みが行われない可能性があることにご注意ください。


### （KaTeX記法を使う場合のみ）`zenn-embed-elements`を読み込む

`zenn-embed-elements`はSSRに対応していないため、クライアント側で読み込む必要があります。

```ts
// React で使う場合の例
import 'zenn-content-css';

export default function App(props) {

  useEffect(()=> {
    import("zenn-embed-elements")
  },[])

  return (
    <div 
      className="znc"
      dangerouslySetInnerHTML={{
        __html: props.html // markdownから変換されたHTMLを渡す
      }}
    />
  )
}
```


## Licence

MIT
