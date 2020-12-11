---
title: "example full"
type: "idea" # or "idea"
topics: 
  - React
  - Rust
emoji: 👩‍💻
published: false
---


先日、こんな記事を見かけました。

**[テックブログは続かない - note.com](https://note.com/makaibito/n/n2d9e84a959c0)**

採用目的でテックブログを始めたものの、時間の経過とともに古い記事ばかりになる or すでに退職している社員の記事ばかりになる…というのはよく見かける光景です。

目の前のタスクが積み上がっている状況で、業務時間内にブログを書く時間を取るのはなかなか難しいと思います。

そうは言っても業務時間外に無償で会社のブログに書くのもなかなか気乗りしません。「数年以内に転職するかもしれない」という気持ちがあればなおさらです。記事が転職しても自分のものとして残るのであれば、書くモチベーションは上がるのかもしれません。

---

その後、こんなツイートを見かけました。


企業のテックブログと言えば「会社がひとつブログを作って、みんなでそこに投稿する」という形が当たり前になっていますが、たしかに**個々人の投稿を集約する場所**を用意するだけでも良いのかもしれません。

もう少し調べてみると[HERP社のテックブログ](https://tech-hub.herp.co.jp/)はまさにそのような形になっています。メンバーは個人ブログなど自分の好きな場所に記事を投稿し、会社のテックブログはその記事へのリンクを集約して表示するハブの役割をすると。とても良いですね。


# チームメンバーのテックブログをRSSで集約するサイトを作った
RSSを辿って社内メンバーの個人ブログを集約するというのは、技術的にそこまで難しくありません。最近Zennの開発ばかりやっているので、息抜きがてらスターター的なものを作ってみました。

![](https://storage.googleapis.com/zenn-user-upload/em417t9y70zleo9003crmu3rkqyn)
*デモサイトはこんな感じ*

**[デモサイト →](https://team-blog-hub.vercel.app/)**
**[GitHubリポジトリ →](https://github.com/catnose99/team-blog-hub)**


デモサイトを見ていただければ分かると思いますが、個々人が投稿した記事へのリンクを集めた入り口のような場所になっています。

各メンバーは、Zenn、Qiita、Medium、note、はてなブログなど、自分の好きな場所に、自分の記事として投稿できます。RSSを取得できさえすれば、どこに投稿してもOKというわけです。


# 技術的な構成
サイトの構築にはNext.js（TypeScript）を使いました。以下のような流れで静的なサイトがビルドされるようになっています。

1. 各メンバーのRSSのURLから投稿データのフェッチする
2. 1をまとめて投稿データ一覧のjsonファイルを作成する
3. Next.jsで静的サイトとしてビルドする


## メンバーのRSSの登録

[ソースコード](https://github.com/catnose99/team-blog-hub)を見ていただくと早いと思いますが、`members.ts`というファイルの中で各メンバーのプロフィールとRSSのURL一覧を登録する形になっています。

```json
[{
  name: "メンバーの名前",
  role: "役職名",
  sources: [
    "https://zenn.dev/catnose99/feed",
    "https://medium.com/feed/@catnose99",
  ]
}]
```

👆`sources`の部分にRSSのURLを指定します。複数のURLを指定することもできます。

### 正規表現で一部の記事を除外できるように

一部の記事は会社のテックブログから除きたい（or含めたい）こともあると思うので、下記のように正規表現を指定することでフィルターをかけられるようにしました。

```json
[{
  ...
  sources: [
    "https://zenn.dev/catnose99/feed",
    "https://medium.com/feed/@catnose99",
  ],
  includeUrlRegex: "含めたい記事のURLにマッチする正規表現",
  excludeUrlRegex: "除きたい記事のURLにマッチする正規表現"
}]
```

`yarn build:posts`が実行されたときに、指定内容をもとにRSSから投稿のメタデータ一覧をフェッチして`posts.json`という記事の情報をまとめたファイルが生成されます。RSSのパースは[rss-parser](https://www.npmjs.com/package/rss-parser)というパッケージを使うと簡単です。



## Next.jsで静的サイトをビルドする

Next.jsを使えば、静的なサイトも簡単に作れます。今回は上述の通り`posts.json`という投稿データ一覧がディレクトリ内に存在するため、ここから必要なデータを`import`して表示するだけです。

Next.jsでアプリを作るときに頻繁に使いがちな`getInitialProps`や`getStaticProps`などもほとんど必要ありません。

## デプロイ
デモサイトは[Vercel](https://vercel.com)にデプロイしました。`npm run build`（`yarn build`）さえホスティング前に実行できれば、デプロイ先はどこでもOKです。

チームで運営する場合には、CI/CD環境を整えると管理しやすそうです。新しく社員が入ってきたときに「個人ブログのRSSのURLを追加してプルリク投げておいて」とお願いできるとお互い楽ですね。

そういう意味でリポジトリとの連携がしやすいVercelや[Netlify](https://www.netlify.com/)などがおすすめです。

## 定期的に自動ビルドする
実際の運用では、投稿一覧を更新するために、定期的に（1日に1回など）自動でビルドを行う必要があります。

- Vercelの場合、GitHub Actionsの「cron」を使えば、定期的な自動デプロイを楽に設定できます。詳しくは[GitHubのDiscussion](https://github.com/vercel/next.js/discussions/12486)が参考になると思います。

- Netlifyの場合は[Auto trigger deploys on Netlify](https://flaviocopes.com/netlify-auto-deploy/)のような方法で自動デプロイできます。


# ライセンス
今回作ったものはオープンソースです。Forkしてご自由にお使いください。

チームでなくとも個人で使っていただくのも良いかもしれません。たとえば、noteとMediumとZennに投稿している方は、同じ仕組みを使って一箇所に投稿一覧をまとめることができます。

※ 真っ先に変えたいのは配色だと思います。使用する色の数を抑えつつ、カラーコードはCSS変数で管理しているため、比較的変更しやすいと思います。

[github.com/catnose99/team-blog-hub →](https://github.com/catnose99/team-blog-hub)

