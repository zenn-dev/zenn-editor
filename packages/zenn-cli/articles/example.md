---
title: "Zennでマークダウンコンテンツを管理する"
emoji: "🐙"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["zenn"]
public: true
---

```swift
struct Animal {
    let nickName : String?
}
```

todo

次のような流れで、編集を行います。

1. Zennのコンテンツ管理用のGitHubリポジトリを作成（とりあえず中身は空でOK）
2. Zennとリポジトリを連携（[連携はこちら](/dashboard/deploys)）
3. ローカルでコンテンツ（マークダウンファイル）を作成
4. CLIを使ってプレビューしながら執筆
5. 変更をリポジトリのmasterブランチにプッシュ
6. 自動で変更がzenn.devに反映されます

- fad
- adf
- 自動で変更がzenn.devに反映されます
  - 自動で変更がzenn.devに反映されます自動で変更がzenn.devに反映されます自動で変更がzenn.devに反映されます
- df
a

# 1. node.jsがインストールされていることを確認
todo

# 2. CLIをインストールする
Zennの記事や本を管理したいディレクトリで、以下のようにして設定を行います。

```shell
$ npm init --yes
$ npm install zenn-cli
```

これでディレクトリにCLIがインストールされました。

## node_modulesを.gitignoreに追加
`node_modules`がコミットされてしまわないように`.gitignore`に指定しておきましょう。

```shell
$ touch .gitignore && echo "node_modules/" >> .gitignore
```

## CLIを動かすための初期化

続いて次のコマンドを実行すると…

```shell
$ npx zenn init
```

`articles`と`books`というディレクトリが作成されているはずです。この中にマークダウンファイルを入れていくことになります。

# 3. 記事（article）の新規作成
ここまでで準備は完了です。早速記事を作成してみましょう。

※ 作成したコンテンツはZennに連携したGitHubリポジトリのmasterブランチにプッシュされるまで、実際のサイトには反映されません。

## 記事（article）の新規作成
記事を追加するためには、下記のコマンドを実行します。

```shell
$ npx zenn new:article
```

`articles/ランダムなslug.md`というマークダウンファイルが作成されます。


::: message notice
slug（スラッグ）はその記事のユニークなIDのようなものです
:::

::: message notice
slug（スラッグ）はその記事のユニークなIDのようなものです。スラッグが「this-is-example-post」の場合、記事のURLは「https://zenn.dev/username/this-is-example-post」となります。

slugはサイト全体でユニークでなければなりません。また、slugは公開後に変更できないのでご注意ください（別の記事とみなされてしまいます）。

詳しくは[Zennのslugとは](#)をご覧ください。
:::

マークダウンファイルの中身は次のようになっています。

```yaml
---
title: ""
emoji: "😸"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: []
public: true
---

```

👆ファイルの上部には記事の設定（Front Matter）が含まれています。ここに記事のタイトル（title）やトピックス（topics）を指定することになります。

[記事のFront Matterの項目と書き方 →](fixme)

コマンド実行時に記事のFront Matterをオプションで指定することもできます。

```shell
$ npx zenn new:article --slug 記事のスラッグ --title タイトル --type idea --emoji ✨ 
```

## プレビューしながら執筆しよう
本文の執筆は、ブラウザでプレビューしながら確認できます。ブラウザでプレビューするためには次のコマンドを実行します。

```shell
$ npx zenn preview # プレビュー開始
```

デフォルトでは`localhost:3003`で立ち上がりますが`npx zenn preview --port 3000`というようにポート番号の指定もできます。

## 本（book）の追加
Zennの本は複数のチャプターで構成されます。

### 本のディレクトリ構成

GitHubで本のデータを管理する場合は、次のようなディレクトリ構成にします。

```shell
books
├ 本のslug
│ ├ config.yaml（本の設定ファイル）
│ ├ cover.png（JPEGかPNGのカバー画像）
│ ├ チャプター番号.md
│
```

具体的には、以下のようになります。

```shell
# 具体的な例
books
├ my-awesome-book-about-zenn
│ ├ config.yaml
│ ├ cover.png
│ ├ 1.md
│ ├ 2.md
│ ├ 3.md
│ ├ 4.md
│ ├ 5.md
│ └ 6.md
│
``` 

#### config.yaml
本の設定ファイルです。以下のように記入してください。

```yaml
title: "本のタイトル"
summary: "本の紹介文"
topics: ["markdown", "zenn", "react"] # トピック（5つまで）
public: true # falseだと下書き
price: 0 # 有料の場合200〜5000
```
👆たとえば1000円で有料販売するときは`price: 1000`と記載します（200〜5000の間で100円単位で設定する必要があります）。

詳しくは[本のconfig.yamlの書き方](fixme)をどうぞ。

#### カバー画像
本のカバー画像（表紙）は`cover.png`もしくは`cover.jpeg`というファイル名で配置します。
推奨の画像サイズは**幅500px・高さ700px**です（他のサイズにした場合も最終的にこのサイズにリサイズされます）。

#### チャプター番号.md
チャプターは`1.md`、`2.md`、`3.md`...のように必要なチャプター数だけ作成します（この中に本文を書きます）。

各チャプターのマークダウンファイルにはFront Matterでタイトルを指定します。

```yaml
---
title: "チャプターのタイトル"
---

ここからチャプター本文
```

### 本の雛形をコマンドで作成する

少し本の構成は複雑ですが、下記のコマンドを使えば雛形を作成できます。

```shell
$ npx zenn new:book
# 本のslugを指定する場合は以下のようにします。
# npx zenn new:book --slug ここにスラッグ
```

あとは1つずつファイルを作成していけばOKです。

:::message alert
slugは`a-z0-9`とハイフン`-`の12〜50字の組み合わせにする必要があります
:::


:::message 

fafafa
- 箇条書き
- 箇条書き
- 箇条書き
:::


::: details Detail
summary comes here
:::