---
title: 'Embedのテスト'
type: 'tech' # or "idea"
topics: ['12']
emoji: 🐲
published: false
---

## Github Source Code

**行指定なし**

https://github.com/zenn-dev/zenn-editor/blob/0ee17e44bda75ee3993f86de9c319f8279bac98f/lerna.json

**行指定あり**

https://github.com/zenn-dev/zenn-editor/blob/0ee17e44bda75ee3993f86de9c319f8279bac98f/lerna.json#L5-L7

**開始行の指定だけあり**

https://github.com/zenn-dev/zenn-editor/blob/0ee17e44bda75ee3993f86de9c319f8279bac98f/lerna.json#L5

**ブランチ名で指定( 基本は hash 文字列を想定 )**

https://github.com/zenn-dev/zenn-editor/blob/canary/lerna.json

**行数が多いファイル**

https://github.com/zenn-dev/zenn-editor/blob/canary/packages/zenn-markdown-html/src/prism-plugins/prism-diff-highlight.ts

**無効なリンク**

https://github.com/zenn-dev/zenn-editor/blob/無効なブランチ名/packages/zenn-markdown-html/src/prism-plugins/prism-diff-highlight.ts

## Gists

https://gist.github.com/hofmannsven/9164408
https://gist.github.com/lmars/8be1952a8d03f8a31b17

@[gist](https://gist.github.com/mattpodwysocki/218388)

### specific file

https://gist.github.com/hofmannsven/9164408?file=my.cnf

@[codesandbox](https://codesandbox.io/embed/guess-movie-erpn1?fontsize=14&hidenavigation=1&theme=dark)
@[stackblitz](https://stackblitz.com/edit/angular-examples)
@[youtube](ApXoWvfEYVU)
@[slideshare](EP6Yf9I2idPXCb)
@[speakerdeck](f8653c8c6ffc4f54bb4683daa8c1a284)
@[jsfiddle](https://jsfiddle.net/9wkngdue/embedded)
@[codepen](https://codepen.io/noeldelgado/pen/BaogqYy?default-tab=result)
@[tweet](https://twitter.com/jack/status/20)
@[tweet](https://twitter.com/steelydylan/status/1253567029010825216)

👇must raise error
@[codesandbox](https://codesandbox.io/embed/a"a)
@[stackblitz](https://stackblitz.com/edit/embed?embed=a"a)
@[codesandbox](http://codesandbox.io/embed/guess-movie-erpn1?fontsize=14&hidenavigation=1&theme=dark)
@[stackblitz](http://stackblitz.com/edit/embed?embed=1&file=app/app.component.ts)

👇html tag cannot be embedded.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ToLJE4YEQRI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
