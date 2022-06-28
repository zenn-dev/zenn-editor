# Zenn CLI

ローカルで Zenn の投稿コンテンツを管理/プレビューするための CLI

# ユーザー向けドキュメント

- [CLI のインストール](https://zenn.dev/zenn/articles/install-zenn-cli)
- [CLI の使い方](https://zenn.dev/zenn/articles/zenn-cli-guide)

# Develop CLI

## プレビュー（`zenn preview`）

```bash
$ yarn dev
# => http://localhost:3333
```

※ `yarn dev`で立ち上げた場合には、コンテンツ（`.md`ファイル）の変更に伴うホットリロードは有効になりません

## その他のコマンドを開発環境で動かす

`yarn build`でビルドしたうえで`yarn zenn **`コマンドを実行します。

```bash
$ yarn build
$ yarn zenn # = npx zenn
$ yarn zenn preview # = npx zenn preview (.mdの変更に伴うホットリロードも有効になります)
$ yarn zenn new:article --slug foo-bar-baz-qux # = npx zenn new:article --slug foo-bar-baz-qux
$ yarn zenn new:book --slug foo-bar-baz-qux # = npx zenn new:book --slug foo-bar-baz-qux
$ yarn zenn --help # = npx zenn --help
```

# Build

```bash
$ yarn build
# => ./distに生成されたファイルをnpmのリリース時に含めるようにします（package.jsonの`files`に指定）
```

# 開発者向けドキュメント

## Webpack の使用について

`zenn-cli` では、依存関係( package.json の `dependencies` )を無くすため webpack でバンドルしたファイルをリリースしています。

依存関係を無くす理由は以下の通りです。

- `zenn-cli` を使用しているリポジトリで、対応する必要のない security alert が通知されてしまうのを防ぐため
- 依存関係のアップデートにより、誤作動を起こしてしまうのを防ぐため
- `node_modules` の重力を減らし、ブラックホールになってしまうのを防ぐため
