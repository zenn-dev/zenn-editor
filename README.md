# Zenn Editor

## ToDO
- [ ] frontmatterの表示
- [ ] エラー表示
- [ ] exampleリポジトリの作成
- [ ] CLIの作成
- [ ] 画像ULの仕組み
- [ ] API
- [ ] 目次が動くか確認（h1,h2,h3まで）

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

## npm
### release

## run scripts from project root

### add package
```
$ yarn workspace zenn-markdown-preview add package-name --dev
```

### build
```
$ yarn workspace zenn-markdown-preview run build
```