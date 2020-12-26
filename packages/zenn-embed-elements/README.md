# zenn-embed-elements

Using web components to achieve embedding inside user generated markdown contents.

```js
// define web components in root of the app. (e.g. _app.tsx)
useEffect(()=> import("zenn-embed-elements"),[])
```

Then, use these elements are wherever you want.
```html
<embed-tweet src="https://tweeturl..." />
<embed-gist page-url="https://gistsurl..." file="test.ext"/>
```
