# Contribution Guide

## Issues

- zenn.dev に関する問題や改善提案は[zenn-community](https://github.com/zenn-dev/zenn-community/issues)の Issues をご利用ください。
- zenn-cli に関する問題や改善の提案については[zenn-community](https://github.com/zenn-dev/zenn-community/issues) もしくは 本リポジトリの Issues をご利用ください。

## Pull Requests

- レビューに時間がかかる場合やマージを行わずにクローズする場合があります。特に機能追加に関してはあらかじめ Issues で議論させていただければと思います。

### PR 作成時の注意点

- `canary`ブランチに対して作成してください。

## リリースフロー

#### canary バージョン（α 版）のリリース

- canary ブランチに変更をマージすると`canary`バージョンが自動リリースされます
- canary バージョンは`npm install zenn-cli@canary`で試すことができます

#### latest バージョン（正式版）のリリース

- canary ブランチから main ブランチに PR を作成します（release ラベルを付与）
- main ブランチにマージされると`latest`バージョンが自動リリースされます
- ユーザーは `npm install zenn-cli@latest` でインストールできます

## 構成

lerna を使ったモノレポ管理をしています

- **zenn-cli**: ローカルの markdown ファイルを管理/プレビュー
- **zenn-content-css**: コンテンツ本文の CSS（ZennCLI および zenn.dev で使用）
- **zenn-embed-elements**: Twitter や Gists の埋め込みを効率化するための custom elements（ZennCLI および zenn.dev で使用）
- **zenn-markdown-html**: マークダウンから HTML への変換を行う（Zenn CLI および zenn.dev で使用）

### Develop

#### zenn-cli

WIP

- `src/client`: `zenn preview`時のクライアント
  - ビルドされたファイルをpublishするため、依存はdevDependenciesに指定する
- `src/server`: `zenn preview`時のサーバー（クライアントから参照するAPI）


