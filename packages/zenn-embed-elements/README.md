# zenn-embed-elements

以下の記法を利用するためにこのモジュールの読み込みが必要になります。

- KaTeX

※ v0.1.106 以降のバージョンでは zenn-embed-elements での以下の機能の提供は終了されています。
- ~~ツイートの埋め込み~~
- ~~Gistの埋め込み~~
- ~~Mermaidの埋め込み~~

最新のパッケージでこれらの埋め込みを行う方法についてはzenn-editorの[README](https://github.com/zenn-dev/zenn-editor#readme)をご確認ください。


Reactの場合、以下のような形でモジュールを読み込みます。

```tsx
export default function App(...) {
  useEffect(()=> {
    import("zenn-embed-elements")
  },[])
}
```
