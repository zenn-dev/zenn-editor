---
title: "example"
type: "idea" # or "idea"
topics: 
  - React
  - Rust
emoji: 👩‍💻
published: false
---
```mermaid
graph LR
A:::someclass  B
classDef someclass fill:#f96;

```
```mermaid
graph LR
id1[(Database)]:::someclass-->B
classDef someclass fill:#f96;

```


```mermaid
%%{init: { 'theme': 'forest' } }%%
graph LR;
    A-->B & C-->D & E-->F & Z-->X;
    F-->G
    G-->H
    H-->I
    I-->J
    J-->K
    K-->L
    L-->M
    M-->N
    N-->O
    O-->P
```

```mermaid
%%{init: { 'theme': 'forest' } }%%
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```


```bash
console.log({
  a: "a",
  b: "b",
  c: {
    d: "d"
  }
})
```


aafaffff


``` js:fooBar.js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
// 👇can scroll horizontally
console.log(aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa);
```

```js diff :fooBar.js
@@ -4,6 +4,5 @@
-    let foo = bar.baz([1, 2, 3]);
-    foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
     console.log(`foo: ${foo}`);
```

``` js:example
var foo = function (bar) {
  return bar++;
};
```

``` html:<should escape>
var foo = function (bar) {
  return bar++;
};
```

```Dockerfile
FROM ubuntu
ENV name value # comment
ENV name=value
CMD ["echo", "$name"]
```

```html
<div>a</div>
```


::: message
here be dragons
:::


::: message alert
here be dragons
:::


↓ escaped


```"><img/onerror="alert(location)"src=.>
aaa
```



[this $ should be escaped](https://docs.angularjs.org/api/ng/service/$http#json-vulnerability-protection)
[this $$ should be escaped](https://docs.angularjs.org/api/ng/service/$$http#json-vulnerability-protection)

[test on markdown-it-textmath](https://goessner.github.io/markdown-it-texmath/index.html)

$a$	

$a\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0\ne0$

$\varphi$

$1+1=2$	

$1+1<3$	

$a \backslash$	

You get 3$ if you solve $1+2$	

If you solve $1+2$ you get $3	

$\frac{1}{2}$	

$\begin{pmatrix}x\\y\end{pmatrix}$	

${\tilde\bold e}_\alpha$	

$a^{b}$	

$a^*b$ with $a^*$	

$\sum_{i=1}^n$	
fafa

a
