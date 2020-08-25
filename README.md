# Zenn Editor
Manage Zenn content locally.

## Dev
- Mono repo by lerna.

### packages

#### add new package to zenn-packages
```sh
$ npx lerna create zenn-package-name
```

#### add external packge to specific zenn-package
**Recommended for this project**
```sh
$ yarn workspace workspace-name add package-name
# e.g. yarn workspace zenn-markdown-loader add --dev markdown-it
```

#### add external package for all zenn-packages
```sh
$ yarn add -W --dev package-name
```

#### add zenn-package-a to zenn-package-b
The command below enables B to rosolve A
```sh
$ npx lerna add A --scope B --dev
# e.g. lerna add zenn-package-a --scope zenn-package-b --dev 
```

#### Refresh package dependencies
```sh
$ lerna bootstrap --scope zenn-cli
```

## npm release

### build
```
$ yarn workspace zenn-cli run build
```

### publish on npm
```sh
$ npm run publish:all
```

## ToDo
- [ ] Write test

### Licence
MIT

