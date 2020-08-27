# Zenn Editor
Manage Zenn content locally.


## Stack
- **zenn-cli**: Preview local markdown contents.
- **zenn-content-css**: Zenn flavored markdown styles.
- **zenn-init-embed**: Enable embedded contents (e.g. YouTube, CodePen...)
- **zenn-markdown-html**: Convert markdown text to html.

## Dev
- Monorepo development using lerna.


### add new package to zenn-packages
```sh
$ npx lerna create zenn-package-name
```

### add external packge to specific zenn-package
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
The command below enables B to rosolve A
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
$ yarn workspaces run build
```

### publish on npm
```sh
$ npm run publish:all
```

## ToDo
- [ ] Hot reload markdown content (can be done using api)
- [ ] Write test

### Licence
MIT

