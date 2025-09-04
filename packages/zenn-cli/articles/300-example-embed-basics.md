---
title: 埋め込みのテスト（基本）
type: tech
topics:
  - embed
  - test
emoji: 🐲
published: true
---
## Link Card

### Default

https://zenn.dev

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

https://zenn.dev/catnose99/articles/zenn-dev-stack

https://zenn.dev/topics

https://zenn404

### GitHub Repository

https://github.com/zenn-dev/zenn-editor

### GitHub Repository 以外のページ

https://github.com/zenn-dev/zenn-editor/issues

### 折りたたみ

::::details 1
:::details 2
👇 convert

https://example1.com
:::

- https://example1.com
::::

### リンクのみ

👇 not converted to links

[anchor text](https://zenn.dev/topics)

text https://zenn.dev text

- 👇 not converted to links

- https://stackoverflow.com

:::message
not converted to links

https://stackoverflowf/co
:::

::::details 1
:::details 2
👇 convert

https://example1.com
:::

👇 not convert

- https://example1.com
::::

## 👇html tag cannot be embedded.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ToLJE4YEQRI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allow="fullscreen"></iframe>
