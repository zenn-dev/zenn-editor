---
title: '埋め込みのテスト（KaTeX）'
type: 'tech' # or "idea"
topics:
  - Math
emoji: 👩‍💻
published: true
---

## [test on markdown-it-textmath](https://goessner.github.io/markdown-it-texmath/index.html)

`$a$`

$a$

`$\varphi$`

$\varphi$

`$1+1=2$`

$1+1=2$

`$1+1<3$`

$1+1<3$

`$a \backslash$`

$a \backslash$

`You get 3$ if you solve $1+2$`

You get 3$ if you solve $1+2$

`If you solve $1+2$ you get $3`

If you solve $1+2$ you get $3

`$\frac{1}{2}$`

$\frac{1}{2}$

`$\begin{pmatrix}x\\y\end{pmatrix}$`

$\begin{pmatrix}x\\y\end{pmatrix}$

`${\tilde\bold e}_\alpha$`

${\tilde\bold e}_\alpha$

`$a^{b}$`

$a^{b}$

`$a^*b$ with $a^*$`

$a^*b$ with $a^*$

`$$e_\alpha$$`

$$e_\alpha$$

`$$1+1=2$$`

$$1+1=2$$

```
${e}_x$

$$e_\alpha$$
```

${e}_x$

$$e_\alpha$$

`$$c{\bold e}_x = a{\bold e}_\alpha - b\tilde{\bold e}_\alpha$$`

$$c{\bold e}_x = a{\bold e}_\alpha - b\tilde{\bold e}_\alpha$$

```
a$1+1=2$
$1+1=2$b
c$x$d
```

a$1+1=2$
$1+1=2$b
c$x$d

`$x$ $`

$x$ $

`$x$ $y$`

$x$ $y$

`so-what is $x$`

so-what is $x$

```
$$
1+1=2
$$
```

$$
1+1=2
$$

```
$$\begin{matrix}
 f & = & 2 + x + 3 \\
 & = & 5 + x 
\end{matrix}$$
```

$$\begin{matrix}
 f & = & 2 + x + 3 \\
 & = & 5 + x 
\end{matrix}$$

```
$$\begin{pmatrix}x_2 \\ y_2 \end{pmatrix} = 
\begin{pmatrix} A & B \\ C & D \end{pmatrix}\cdot
\begin{pmatrix} x_1 \\ y_1 \end{pmatrix}$$
```

$$\begin{pmatrix}x_2 \\ y_2 \end{pmatrix} = 
\begin{pmatrix} A & B \\ C & D \end{pmatrix}\cdot
\begin{pmatrix} x_1 \\ y_1 \end{pmatrix}$$

`$$f(x) = x^2 - 1$$ (1)`

$$f(x) = x^2 - 1$$ (1)

`code`$a-b$

```
code
```
$$a+b$$

```
code
```
$$a+b$$(1)

```
1. $1+2$
2. $2+3$
    1. $3+4$
```

1. $1+2$
2. $2+3$
    1. $3+4$

`$\sum_{i=1}^n$`

$\sum_{i=1}^n$

`$$\sum_{i=1}^n$$`

$$\sum_{i=1}^n$$

`$$\sum_{i=1}^n$$ (2)`

$$\sum_{i=1}^n$$ (2)

```
$${\bold e}(\varphi) = \begin{pmatrix}
\cos\varphi\\\sin\varphi
\end{pmatrix}$$ (3)
```

$${\bold e}(\varphi) = \begin{pmatrix}
\cos\varphi\\\sin\varphi
\end{pmatrix}$$ (3)

```
> see $a = b + c$ 
> $c^2=a^2+b^2$ (2) 
> $c^2=a^2+b^2$ 
```

> see $a = b + c$ 
> $c^2=a^2+b^2$ (2) 
> $c^2=a^2+b^2$ 

```
> formula
>
> $$ a+b=c$$ (2)
>
> in blockquote. 
```

> formula
>
> $$ a+b=c$$ (2)
>
> in blockquote. 

```
\$1+1=2$
$1+1=2\$
```

\$1+1=2$
$1+1=2\$

```
some text
 $\$a+b=c$$
```

some text
 $\$a+b=c$$

```
$ $
$ x$
$x $
```

$ $
$ x$
$x $

```
$1+1=
2$
```

$1+1=
2$

## リンク

リンク文字は数式にならない

[text$text](https://...$text)

## スクロール

横幅が大きい数式はスクロールバーが表示される

$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa$

$$
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
$$

## 折りたたみ

:::details 詳細
$a\ne0$
:::


## XSS

$<script>alert("a")</script>1+1=2$
