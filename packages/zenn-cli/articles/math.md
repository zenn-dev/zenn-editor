---
title: 'math'
type: 'tech' # or "idea"
topics:
  - Math
emoji: 👩‍💻
published: false
---

&\&&

$a,b,c$は[hoge](https://hoge.fuga)を参照。
$a,b,c$は[hoge](http://hoge.fuga)を参照。
$a,b,c$は[hoge](http://hoge.fuga)$を参照。
$a,b,c$は[$a](http://hoge.fuga)を参照。

[this $ should be escaped](https://docs.angularjs.org/api/ng/service/$http#json-vulnerability-protection)
[this $$ should be escaped](https://docs.angularjs.org/api/ng/service/$$http#json-vulnerability-protection)

[test on markdown-it-textmath](https://goessner.github.io/markdown-it-texmath/index.html)

$a$

$a\ne0$

$\varphi$

// 👇can scroll horizontally

$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa$

$$
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
$$

$<script>alert("a")</script>1+1=2$

$1+1<3$

$a \backslash$

You get 3$ if you solve $1+2$

If you solve $1+2$ you get $3

$\frac{1}{2}$

$\begin{pmatrix}x\\y\end{pmatrix}$

$a^{b}$

$a^*b$ with $a^*$

$\sum_{i=1}^n$

---

↓ はみ出たら横スクロール

$$
e^{i\theta} = \cos\theta + i\sin\theta e^{i\theta} = \cos\theta + i\sin\theta e^{i\theta} = \cos\theta + i\sin\theta
$$

$\sqrt{3x-1}+(1+x)^2$

# Triangle

Let the right triangle hypothenuse be aligned with the coordinate system _x-axis_.
The vector loop closure equation then reads

$$a{\bold e}_\alpha + b\tilde{\bold e}_\alpha + c{\bold e}_x = \bold 0$$

Resolving for the hypothenuse part $c{\bold e}_x$ in the loop closure equation

$$-c{\bold e}_x = a{\bold e}_\alpha + b\tilde{\bold e}_\alpha$$

and squaring

> finally results in the Pythagorean theorem (2)
>
> $$ c^2 = a^2 + b^2 $$ (2)

$a\ne0$

:::details 詳細
$a\ne0$
:::

## リンク文字列中は数式にならないべき

[text$text](https://...$text)

[text$text](https://...$text

$text](https://...$

## ふたつ以上の数式もレンダリングされるべき

あああ$\omega$いいい『[uuu](https://arxiv.org)』えええ$(7)$おおお
あああ$\frac{1}{2}$いいい[uuu](https://arxiv.org)えええ$(7)$おおお
あああ$abc$いいい[uuu](https://arxiv.org)えええ$(7)$おおお
あああ$\alpha$と$\omega$いいい[uuu](https://arxiv.org)えええ$(7)$おおお

あああ$a$いいい[uuu](https://arxiv.org)えええ$(7)$おおお
あああ$\omega$いいいえええ$(7)$おおお
あああ$\omega$いいい[uuu](https://arxiv.org)えええおおお
あああ$\omega$いいい[uuu](https://arxiv.org)えええ$7$おおお
あああ$\omega$いいい[uuu](arxiv.org)えええ$(7)$おおお
あああ$\omega$いいい[uuu](//arxiv.org)えええ$(7)$おおお
あああ$\omega$いいい[uuu](ftp://arxiv.org)えええ$(7)$おおお
あああ$\omega$いいい(https://arxiv.org)えええ$(7)$おおお
あああ$\omega$いいい[uuu](https://arxiv.org)えええ$\exp xyz$おおお

$a=b$という数式はこちらを参照[text$text](https://...$text)$(7)$
