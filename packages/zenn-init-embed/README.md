# Zenn Init Embed
Load embed scripts on client.

TODO: zenn-embed-elements（別パッケージ）の導入に伴い廃止する
ただし、DB上の既存のHTMLを置換してから廃止すること

```js
import initEmbed from "zenn-init-embed";

useEffect(()=>{
  initEmbed()
},[])
```