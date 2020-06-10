# Zenn Markdown Html
Convert markdown text to html.

## how to use

```js
import markdownToHtml from "zenn-markdown-html";
const html = markdownToHtml(markdown);
```

## init embed
Load embed scripts(Twitter, mathjax...) on client.

```js
import { initEmbed } from "zenn-markdown-html/lib/embed";

useEffect(()=>{
  initEmbed()
},[])
```

