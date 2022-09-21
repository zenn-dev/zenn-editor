---
title: 'example empty'
type: 'idea' # or "idea"
topics:
  - React
  - Rust
emoji: 👩‍💻
published: false
---

$a,<script>alert("XSS")</script>,c$

<br></br>

| a | b |
| --- | --- |
| foo<br>bar | c |

<!-- http://www.youtube.com/watch?v=lK-zaWCp-co&feature=g-all-u&context=G27a8a4aFAAAAAAAAAAA -->



@[youtube](lK-zaWCp-co)

脚注のテスト^[1]


```css
.details-content {
  padding: 0.5em 0.9em;
  border: solid 1px rgba(92, 147, 187, 0.2);
  border-radius: 0 0 5px 5px;

  & > * {
    margin: 0.5em 0;
  }
}
```

:::details Youtubeはこちら
http://www.youtube.com/watch?v=lK-zaWCp-co&feature=g-all-u&context=G27a8a4aFAAAAAAAAAAA
:::


$$
"<img/src=./ onerror=alert(location)>
e^{i\theta} = i\sin\thetae^{i\theta}
$$

$$
e^{i\theta"<img/src=./ onerror=alert(location)>} = \cos\theta + i\sin\thetae^{i\theta}
$$


.
[normal link](javascript)
.

<p><a href="javascript">normal link</a></p>
.

Should not allow some protocols in links and images
.
[xss link](<javascript:alert(1)>)

[xss link](<JAVASCRIPT:alert(1)>)

[xss link](<vbscript:alert(1)>)

[xss link](<VBSCRIPT:alert(1)>)

[xss link](file:///123)
.



<p>[xss link](javascript:alert(1))</p>
<p>[xss link](JAVASCRIPT:alert(1))</p>
<p>[xss link](vbscript:alert(1))</p>
<p>[xss link](VBSCRIPT:alert(1))</p>
<p>[xss link](file:///123)</p>
.

.
[xss link](<"><script>alert("xss")</script>>)

[xss link](<Javascript:alert(1)>)

[xss link](<Javascript:alert(1)>)

[xss link](<Javascript:alert(1)>)
.


<p><a href="%22%3E%3Cscript%3Ealert(%22xss%22)%3C/script%3E">xss link</a></p>
<p>[xss link](Javascript:alert(1))</p>
<p><a href="&amp;#74;avascript:alert(1)">xss link</a></p>
<p><a href="&amp;#74;avascript:alert(1)">xss link</a></p>
.


.
[xss link](<javascript:alert(1)>)
.

<p>[xss link](&lt;javascript:alert(1)&gt;)</p>
.

.
[xss link](<javascript:alert(1)>)
.

<p>[xss link](javascript:alert(1))</p>
.

Should not allow data-uri except some whitelisted mimes
.
![]()
![](data:image/gif;)