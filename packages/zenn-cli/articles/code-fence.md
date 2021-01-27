---
title: "Code Fence"
type: "tech" # or "idea"
topics: 
  - React
  - Rust
emoji: 👩‍💻
published: false
---


```vue:index.vue
<template>
  <div class="todo">
    <h1>TODO APP</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Todo',
});
</script>
```

```Dockerfile:Dockerfile
FROM ubuntu
ENV name value # comment
ENV name=value
CMD ["echo", "$name"]
```

```bash:foo.fish
bind -M $mode \cq foo
```

```diff
@@ -4,6 +4,5 @@
-    let foo = bar.baz([1, 2, 3]);
-    foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
     console.log(`foo: ${foo}`);
```

```diff
@@ -4,6 +4,5 @@
-    let foo = bar.baz([1, 2, 3]);
-    foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
     console.log(`foo: ${foo}`);
```

```js diff:aaa
@@ -4,6 +4,5 @@
-    let foo = bar.baz([1, 2, 3]);
-    foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
     console.log(`foo: ${foo}`);
```

```js diff:aaa
@@ -4,6 +4,5 @@
let foo = bar.baz([1, 2, 3]);
foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
console.log(`foo: ${foo}`);
```
