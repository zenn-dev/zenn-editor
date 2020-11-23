export const commandListText = `
Command:
  zenn init         コンテンツ管理用のディレクトリを作成。初回のみ実行
  zenn preview      コンテンツをブラウザでプレビュー
  zenn new:article  新しい記事を追加
  zenn new:book     新しい本を追加
  zenn -v           zenn-cliのバージョンを表示
  zenn help         ヘルプ

  👇詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

// exclude help about below options.
// --no-watch              サーバーが `articles` 及び `books` の変更を監視しなくなる.
export const previewHelpText = `
Command:
  zenn preview      コンテンツをブラウザでプレビュー

Usage:
  npx zenn preview [options]

Options:
  --port PORT, -p PORT    起動するサーバーに指定したいポート。デフォルトは8000
  
  --help, -h              このヘルプを表示

Example:
  npx zenn preview --port 3000

  👇詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

// exclude help about below options.
// --published BOOL 記事の公開設定. true か false を指定する. デフォルトで"false".
export const newArticleHelpText = `
Command:
  zenn new:article  新しい記事を追加

Usage:
  npx zenn new:article [options]

Options:
  --slug  SLUG       記事のスラッグ。\`a-z0-9\`とハイフン(\`-\`)の12〜50字の組み合わせにする必要がある
  --title TITLE      記事のタイトル
  --type  TYPE       記事のタイプ。tech (技術記事) / idea (アイデア記事) のどちらかから選択
  --emoji EMOJI      アイキャッチとして使われる絵文字（1文字だけ）
  --machine-readable 他のスクリプトなどで処理に適した形で出力する
   
  --help, -h       このヘルプを表示

Example:
  npx zenn new:article --slug enjoy-zenn-with-client --title タイトル --type idea --emoji ✨ 

  👇詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

// --title TITLE    記事のタイトル
// --published BOOL 記事の公開設定. true か false を指定する. デフォルトで"false".
// --summary SUMMARY 本の紹介文. 有料の本であっても公開される.
// --price PRICE    本の価格. 有料の場合200〜5000. デフォルトは0.
export const newBookHelpText = `
Command:
  zenn new:book     新しい本を追加

Usage:
  npx zenn new:book [options]

Options:
  --slug SLUG    記事のスラッグ。\`a-z0-9\`とハイフン(\`-\`)の12〜50字の組み合わせにする必要がある
   
  --help, -h     このヘルプを表示

Example:
  npx zenn new:book --slug enjoy-zenn-with-client

  👇詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

export const invalidOption = `😿 不正なオプションが含まれています`;
