import { runtimeEnv } from './runtime-env';

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
  return runtimeEnv('ZENN_CLI_EXPERIMENTAL_SCRAP_API') === 'true'
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
  zenn scrap          Public API経由でScrapを取得・作成・更新・コメント投稿

Usage:
  npx zenn scrap list [--page PAGE] [--count COUNT] [--machine-readable]
  npx zenn scrap get SCRAP_SLUG_OR_URL [--page PAGE] [--count COUNT] [--machine-readable]
  npx zenn scrap create --title TITLE --file PATH [options]
  npx zenn scrap update SCRAP_SLUG_OR_URL [options]
  npx zenn scrap comments COMMENT_SLUG [COMMENT_SLUG ...] [--machine-readable]
  npx zenn scrap post SCRAP_SLUG_OR_URL --file PATH [options]
  npx zenn scrap update-comment SCRAP_SLUG_OR_URL COMMENT_SLUG --file PATH [options]

Options:
  --title TITLE          Scrapのタイトル（createで必須）
  --file PATH            本文ファイルのパス。標準入力は - を指定
  --closed, --open       Scrapを完了・未完了にする（openはupdateのみ）
  --archived, --unarchived  Scrapをアーカイブ・復元する（unarchivedはupdateのみ）
  --allow-others-post, --disallow-others-post  他者投稿を許可・禁止する（updateでは排他）
  --unlisted, --public   Scrapを限定公開・公開にする（publicはupdateのみ）
  --topics TOPIC,...     topicを設定する。空文字列で全解除（create/updateのみ）
  --reply-to COMMENT_SLUG ルートコメントへの返信（postのみ）
  --dangerously-skip-secret-scan  Secret scanをスキップ
  --dangerously-skip-ai-scan      AI scanをスキップ
  --notes-to-ai NOTES     AI scanへ追加の備考を送信
  --machine-readable     成功時にURLだけを標準出力へ表示
  --help, -h             このヘルプを表示

Environment:
  ZENN_API_KEY                 必要なscrap:readまたはscrap:writeスコープを持つAPIキー
  ZENN_CLI_EXPERIMENTAL_SCRAP_API=true  実験的なScrap投稿機能を有効化
  ZENN_API_BASE_URL            開発・テスト用のPublic APIベースURL（任意）
  ZENN_CLI_FORCE_SAFE          dangerousなscanスキップを禁止する場合はtrue
  ZENN_CLI_FORCE_UNLISTED      Scrap作成を常に限定公開にする場合はtrue
  ZENN_CLI_AI_SCAN             AI scanを有効にする場合はtrue
  ZENN_CLI_AI_PROVIDER         openai または fireworks
  ZENN_CLI_AI_MODEL            AI scanに使用するモデルID（任意）
  ZENN_CLI_AI_EFFORT           none / low / medium / high。デフォルトはmedium
  ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD  拒否するlevel。デフォルトはhigh
  ZENN_CLI_AI_SCAN_PROMPT      AI scanの検知方針（任意）
  OPENAI_API_KEY               OpenAI利用時のAPIキー
  FIREWORKS_API_KEY            Fireworks利用時のAPIキー

Default AI models:
  openai: gpt-5.6-luna
  fireworks: ZENN_CLI_AI_MODEL の指定が必須

AI scan:
  Secret scanはデフォルトで有効です。AI scanはZENN_CLI_AI_SCAN=true を
  指定した場合だけ有効です。scanをスキップするにはdangerouslyオプションが
  必要です。ZENN_CLI_FORCE_SAFE=true の場合はSecret scanとAI scanの両方が
  必須です。AI scanでは、タイトル・本文・notes-to-ai・AI scan promptを
  選択したAIプロバイダーへ送信します。保持、学習利用、リージョン、契約条件は
  利用者の責任で確認してください。notes-to-aiはシェル履歴に残るため、機密情報
  そのものを指定しないでください。限定公開でもURLまたはslugを知る利用者は閲覧
  できるため、URLとslugは秘密情報として扱ってください。

Example:
  npx zenn scrap list --count 20
  npx zenn scrap get abcdef12345678
  npx zenn scrap create --title "作業メモ" --file ./scrap.md
  npx zenn scrap post abcdef12345678 --file ./update.md
  npx zenn scrap update abcdef12345678 --closed --topics typescript,zenn
  npx zenn scrap comments comment123456 comment234567
  npx zenn scrap update-comment abcdef12345678 comment123456 --file ./revised.md
  printf '追記' | npx zenn scrap post abcdef12345678 --file -
`;
