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

### publish on npm
```sh
$ npm run publish:all
```

TODO: use github actions to publish



### Licence
MIT

## ToDo
- [x] frontmatterの表示
- [x] エラー表示
- [x] embed
- [x] カバー画像を表示（バリデーション）
- [x] exampleリポジトリの作成
- [x] CLIの作成
  - [x] preview以外のコマンドを作成
  - [x] ポート番号の指定ができるように
  - [x] colors.jsでConsoleに色付け
  - [x] エラーメッセージを調整
  - [x] npx zenn initを作成
  - [ ] version (-v)コマンド
- [x] 画像ULの仕組み
- [ ] previewのホーム画面を作成
- [ ] CLIの使い方の解説ページへのリンクを設置（サイドバーの 画像をアップロード の下）
- [ ] API側でREADMEファイルをスルーする
- [ ] API
- [ ] 目次が動くか確認（h1,h2,h3まで）
- [ ] npmパッケージ名を考える
- [ ] テスト書く
