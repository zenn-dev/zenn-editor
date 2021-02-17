## Dev

- Monorepo development using lerna.

### Getting Started

```bash
$ yarn install
$ yarn build
# develop CLI
$ cd packages/zenn-cli
$ yarn dev
```

## Stack

- **zenn-cli**: Preview local markdown contents.
- **zenn-content-css**: Zenn flavored markdown styles.
- **zenn-embed-elements**: Web components for embedded contents such as Twitter, Gists.
- **zenn-markdown-html**: Convert markdown text to html.

### add new package to zenn-packages

```sh
$ npx lerna create zenn-package-name
```

### add external package to specific zenn-package

**Recommended for this project**

```sh
$ yarn workspace workspace-name add package-name
# e.g. yarn workspace zenn-markdown-loader add --dev markdown-it
```

### add external package for all zenn-packages

```sh
$ yarn add -W --dev package-name
```

### add zenn-package-a to zenn-package-b

The command below enables B to resolve A

```sh
$ npx lerna add A --scope B --dev
# e.g. lerna add zenn-package-a --scope zenn-package-b --dev
```

### Refresh package dependencies

```sh
$ lerna bootstrap --scope zenn-cli
```

## npm publish

### build

```
$ yarn build
```

### publish on npm

```sh
# cannot use yarn here
$ npm run publish:all

# publish as canary version
$ npm run publish:canary
```

### Licence

MIT
