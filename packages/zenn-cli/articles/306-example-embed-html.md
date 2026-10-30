---
title: '埋め込みのテスト（HTML）'
type: 'idea' # or "idea"
topics:
  - html
emoji: 👩‍💻
published: true
---

## HTML と CSS

```html-embed
<div class="card">
  <p class="title">HTML の埋め込み</p>
  <p>埋め込みサーバーの iframe の中で表示されます。</p>
</div>
<style>
  .card { padding: 16px; border-radius: 8px; background: #e8f4ff; font-family: sans-serif; }
  .title { font-weight: bold; }
</style>
```

## CSS の `:checked` で開閉する

```html-embed
<input type="checkbox" id="answer-toggle">
<label for="answer-toggle">答えを見る</label>
<p class="answer">答えは 42 です。</p>
<style>
  .answer { display: none; }
  #answer-toggle:checked ~ .answer { display: block; }
</style>
```

## 除去される要素

フォームや文字入力の欄は、変換時に除去されます。

```html-embed
<p>この下の入力欄とボタンは表示されません。</p>
<form><input type="text"><button>送信</button></form>
```
