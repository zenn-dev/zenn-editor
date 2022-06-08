---
title: 'Code Fence'
type: 'tech' # or "idea"
topics:
  - React
  - Rust
emoji: 👩‍💻
published: false
---

```"><img/onerror="alert(location)"src=.>
any
```

```tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 1.0.4"
    }
  }
}

variable "aws_region" {}

variable "base_cidr_block" {
  description = "A /16 CIDR range definition, such as 10.1.0.0/16, that the VPC will use"
  default = "10.1.0.0/16"
}

variable "availability_zones" {
  description = "A list of availability zones in which to create subnets"
  type = list(string)
}

provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "main" {
  # Referencing the base_cidr_block variable allows the network address
  # to be changed without modifying the configuration.
  cidr_block = var.base_cidr_block
}

resource "aws_subnet" "az" {
  # Create one subnet for each given availability zone.
  count = length(var.availability_zones)

  # For each subnet, use one of the specified availability zones.
  availability_zone = var.availability_zones[count.index]

  # By referencing the aws_vpc.main object, Terraform knows that the subnet
  # must be created only after the VPC is created.
  vpc_id = aws_vpc.main.id

  # Built-in functions and operators can be used for simple transformations of
  # values, such as computing a subnet address. Here we create a /20 prefix for
  # each subnet, using consecutive addresses for each availability zone,
  # such as 10.1.16.0/20 .
  cidr_block = cidrsubnet(aws_vpc.main.cidr_block, 4, count.index+1)
}
```

ref: https://github.com/zenn-dev/zenn-community/issues/357

<!-- should ignore foo -->

```js foo
const foo = function (bar) {
  return bar++;
};
```

```diff jsx:src/App.js
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
-      👆 should not be empty here
+      <h1>Counter App 🧮</h1>
+      <button>
+        +
+      </button>
+      <h3>{count} times clicked!🖱</h3>
    </div>
  );
}

export default App;
```

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

```js diff:diff with looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong lang
@@ -4,6 +4,5 @@
-    let foo = bar.baz([1, 2, 3]);
-    foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
     console.log(`foo: ${foo}`);
```

```js diff:diff with lang
@@ -4,6 +4,5 @@
-    let foo = bar.baz([1, 2, 3]);
-    foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
     console.log(`foo: ${foo}`);
```

```diff js:diff with lang
@@ -4,6 +4,5 @@
-    let foo = bar.baz([1, 2, 3]);
-    foo = foo + 1;
+    const foo = bar.baz([1, 2, 3]) + 1;
     console.log(`foo: ${foo}`);
```

```js:fooBar.js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
// 👇can scroll horizontally
console.log(aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa);
```

```js:example
var foo = function (bar) {
  return bar++;
};
```

```html:<should escape>
var foo = function (bar) {
  return bar++;
};
```

```html
<div>a</div>
```

```diff html:html差分
     <div>a</div>
-    <div>b</div>
+    <div>c</div>
```

```html diff : html差分
<div>a</div>
-
<div>b</div>
+
<div>c</div>
```

```"><img/onerror="alert(location)"src=.>
"><img/onerror="alert(location)"src=.>
```
