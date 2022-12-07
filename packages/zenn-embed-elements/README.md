# zenn-embed-elements

zenn-embed-elements は、 markdown のZenn独自の埋め込み要素をHTMLに変換するためのパッケージです。現在はKaTeXによる数式のレンダリングのためにのみ利用しています。

## 使い方

Reactの場合、以下のような形でモジュールを読み込みます。

```tsx
export default function App(...) {
  useEffect(()=> {
    import("zenn-embed-elements")
  },[])
}
```

## 開発者向けドキュメント

https://zenn-dev.github.io/zenn-docs-for-developers/guides/zenn-editor/zenn-embed-elements
