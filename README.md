![Zenn Editor](https://user-images.githubusercontent.com/34590683/91540859-60e06780-e956-11ea-9762-0acac2b7c4c5.png)

## CLI Documentation

- [Connect GitHub repository to Zenn](https://zenn.dev/zenn/articles/connect-to-github)
- [Install Zenn CLI](https://zenn.dev/zenn/articles/install-zenn-cli)
- [Zenn CLI Guide](https://zenn.dev/zenn/articles/zenn-cli-guide)

## Use on your website

1. Convert markdown to html with `zenn-markdown-html`.

```ts
import markdownHtml from 'zenn-markdown-html';

const html = markdownHtml(markdown);
```

2. Import styles for content.

```ts
import 'zenn-content-css';
```

3. Enable web-components for embedding.

Some embedded contents such as Tweet, Gist are made with Web Components. To enable these contents embedded, import `zenn-embed-elements` on client.

```ts
// with React
useEffect(() => {
  import('zenn-embed-elements');
});
```

Note that `zenn-embed-elements` is not working with SSR.

## Contributors

- CatNose ([@catnose99](https://twitter.com/catnose99))
- Hori Godai ([@steelydylan](https://github.com/steelydylan))
- noriaki watanabe ([@nnabeyang](https://github.com/nnabeyang))
- ooooooo_q ([@ooooooo-q](https://github.com/ooooooo-q))
- RyotaK ([@Ry0taK](https://github.com/Ry0taK))
- j5c8k6m8 ([@j5c8k6m8](https://github.com/j5c8k6m8))
- kkiyama117 ([@kkiyama117](https://github.com/kkiyama117))
- kazuhe ([@kazuhe](https://github.com/kazuhe))
- Yusuke Wada ([@cm-wada-yusuke](https://github.com/cm-wada-yusuke))

## Licence

MIT
