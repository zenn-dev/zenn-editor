# Zenn Content CSS
Style for post content.

## Getting Started
1. Some Css loader might be needed if you use this with Webpack.
```js
import 'zenn-content-css';
```

2. Add post content wrapper class `znc`
```html
<div class="znc">
  <!-- html parsed from markdown comes here. -->
</div>
```

Note that the styles are not applied to elements outside wrapper class `znc`.

## ToDo
- [ ] Add autoprefixer if needed.

