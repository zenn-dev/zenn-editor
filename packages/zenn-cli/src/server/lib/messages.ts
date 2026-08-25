export const commandListText = `
Command:
  zenn init           コンテンツ管理用のディレクトリを作成. 初回のみ実行
  zenn preview        コンテンツをブラウザでプレビュー
  zenn new:article    新しい記事を追加
  zenn new:book       新しい本を追加
  zenn list:articles  記事の一覧を表示
  zenn list:books     本の一覧を表示
  zenn --version, -v  zenn-cliのバージョンを表示
  zenn --help, -h     ヘルプ

  👇  詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

export function getCommandListText() {
  return process.env.ZENN_CLI_EXPERIMENTAL_SCRAP_API === 'true'
    ? commandListText.replace(
        '  zenn list:books     本の一覧を表示',
        '  zenn list:books     本の一覧を表示\n  zenn scrap          Public API経由でScrapを投稿（実験的機能）'
      )
    : commandListText;
}

export const initHelpText = `
Command:
  zenn init           コンテンツ管理用のディレクトリを作成. 初回のみ実行

Usage:
  npx zenn init [options]

Options:
  --help, -h            このヘルプを表示

Example:
  npx zenn init

  👇  詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

export const previewHelpText = `
Command:
  zenn preview          コンテンツをブラウザでプレビュー

Usage:
  npx zenn preview [options]

Options:
  --port PORT, -p PORT  起動するサーバーに指定したいポート. デフォルトは8000
  --no-watch            ホットリロードを無効化
  --open                プレビュー立ち上げ時にブラウザを開く
  --host                設定したいホスト名

  --help, -h            このヘルプを表示

Example:
  npx zenn preview --port 3000

  👇  詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

export const newArticleHelpText = `
Command:
  zenn new:article  新しい記事を追加

Usage:
  npx zenn new:article [options]

Options:
  --slug      SLUG     記事のスラッグ. \`a-z0-9\`とハイフン(\`-\`)とアンダースコア(\`_\`)の12〜50字の組み合わせ
  --title     TITLE    記事のタイトル
  --type      TYPE     記事のタイプ. tech (技術記事) / idea (アイデア記事) のどちらかから選択
  --emoji     EMOJI    アイキャッチとして使われる絵文字（1文字だけ）
  --published          公開設定. true か false を指定する. デフォルトで"false"
  --publication-name   Publication名. Zenn Publication に紐付ける場合のみ指定
  --machine-readable   作成成功時にファイル名のみを出力する

  --help, -h       このヘルプを表示

Example:
  npx zenn new:article --slug enjoy-zenn-with-client --title タイトル --type idea --emoji ✨

  👇  詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

export const newBookHelpText = `
Command:
  zenn new:book     新しい本を追加

Usage:
  npx zenn new:book [options]

Options:
  --slug SLUG        本のスラッグ. \`a-z0-9\`とハイフン(\`-\`)とアンダースコア(\`_\`)の12〜50字の組み合わせ
  --title TITLE      本のタイトル
  --published BOOL   本の公開設定. true か false を指定する. デフォルトで"false"
  --summary SUMMARY  本の紹介文. 有料の本であっても公開される
  --price PRICE      本の価格.有料の場合200〜5000. デフォルトは0

  --help, -h        このヘルプを表示

Example:
  npx zenn new:book --slug enjoy-zenn-with-client

  👇  詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

export const listArticlesHelpText = `
Command:
  zenn list:articles  記事の一覧を表示

Usage:
  npx zenn list:articles [options]

Options:
  --format    FORMAT   表示方法. "tsv" または "json" をサポート.

  --help, -h       このヘルプを表示

Example:
  npx zenn list:articles --format tsv

  👇  詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

export const listBooksHelpText = `
Command:
  zenn list:books  本の一覧を表示

Usage:
  npx zenn list:books [options]

Options:
  --format    FORMAT   表示方法. "tsv" または "json" をサポート.

  --help, -h       このヘルプを表示

Example:
  npx zenn list:books --format tsv

  👇  詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

export const invalidOptionText = `⚠️ 不正なオプションが含まれています`;

export const scrapHelpText = `
Command:
  zenn scrap          Public API経由でScrapを作成・追記・返信

Usage:
  npx zenn scrap create --title TITLE --file PATH [options]
  npx zenn scrap post SCRAP_SLUG_OR_URL --file PATH [options]

Options:
  --title TITLE          Scrapのタイトル（createで必須）
  --file PATH            本文ファイルのパス。標準入力は - を指定
  --unlisted             限定公開のScrapとして作成（createのみ）
  --reply-to COMMENT_SLUG ルートコメントへの返信（postのみ）
  --machine-readable     成功時にURLだけを標準出力へ表示
  --help, -h             このヘルプを表示

Environment:
  ZENN_API_KEY                 scrap:write スコープを持つAPIキー
  ZENN_CLI_EXPERIMENTAL_SCRAP_API=true  実験的なScrap投稿機能を有効化
  ZENN_PUBLIC_API_BASE_URL     integration用のPublic APIベースURL（任意）

Example:
  npx zenn scrap create --title "作業メモ" --file ./scrap.md
  npx zenn scrap post abcdef12345678 --file ./update.md
  printf '追記' | npx zenn scrap post abcdef12345678 --file -
`;
