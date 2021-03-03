# zenn-embed-elements

Using web components to achieve embedding inside user generated markdown contents.

TODO: useEffect と twitter用のscriptをまとめて1つのReactコンポーネントとしてnpm配布する

```tsx
import initTwitterScriptInner from 'zenn-embed-elements/lib/init-twitter-script-inner';

// define web components in root of the app. (e.g. _app.tsx)
export default function App(...) {
    // init custom elements
    useEffect(()=> import("zenn-embed-elements"),[])

    // need to load twitter widgets.js to use window.twttr.createTweet
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: initTwitterScriptInner
            }}
            />)
}
```

Then, use these elements are wherever you want.
```html
<embed-tweet src="https://tweeturl..." />
<embed-gist page-url="https://gistsurl..." file="test.ext"/>
```
