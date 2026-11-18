export const commandListText = `
Command:
  zenn init           コンテンツ管理用のディレクトリを作成. 初回のみ実行
  zenn preview        コンテンツをブラウザでプレビュー
  zenn new:article    新しい記事を追加
  zenn new:book       新しい本を追加
  zenn list:articles  記事の一覧を表示
  zenn list:books     本の一覧を表示
  zenn scrap          Public API経由でScrapを操作
  zenn file           Public API経由で画像・音声を管理
  zenn image          （非推奨）zenn file --type image を利用してください
  zenn --version, -v  zenn-cliのバージョンを表示
  zenn --help, -h     ヘルプ

  👇  詳細
  https://zenn.dev/zenn/articles/zenn-cli-guide
`;

export function getCommandListText() {
  return commandListText;
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
  --host HOST           待ち受けるホスト名. デフォルトは 127.0.0.1（このPCからのみアクセス可能）
                        LAN内の他の端末からプレビューする場合は --host 0.0.0.0 を指定

  --help, -h            このヘルプを表示

Example:
  npx zenn preview --port 3000
  npx zenn preview --host 0.0.0.0

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
  zenn scrap          Public API経由でScrapとコメントを操作

Usage:
  npx zenn scrap list [--page PAGE] [--count COUNT] [--machine-readable]
  npx zenn scrap get SCRAP_SLUG_OR_URL [--page PAGE] [--count COUNT] [--machine-readable]
  npx zenn scrap create --title TITLE --file PATH [options]
  npx zenn scrap update SCRAP_SLUG_OR_URL [options]
  npx zenn scrap comments COMMENT_SLUG [COMMENT_SLUG ...] [--machine-readable]
  npx zenn scrap post SCRAP_SLUG_OR_URL --file PATH [options]
  npx zenn scrap update-comment SCRAP_SLUG_OR_URL COMMENT_SLUG --file PATH [options]
  npx zenn scrap delete SCRAP_SLUG_OR_URL --yes [--machine-readable]
  npx zenn scrap delete-comment SCRAP_SLUG_OR_URL COMMENT_SLUG --yes [--machine-readable]

Options:
  --title TITLE          Scrapのタイトル（createで必須）
  --file PATH            本文ファイルのパス。標準入力は - を指定
  --closed, --open       Scrapを完了・未完了にする（openはupdateのみ）
  --archived, --unarchived  Scrapをアーカイブ・復元する（unarchivedはupdateのみ）
  --allow-others-post, --disallow-others-post  他者投稿を許可・禁止する（updateでは排他）
  --unlisted, --public   Scrapを限定公開・公開にする（publicはupdateのみ）
  --topics TOPIC,...     topicを設定する。空文字列で全解除（create/updateのみ）
  --reply-to COMMENT_SLUG ルートコメントへの返信（postのみ）
  --yes                  取り消せない削除操作を確認する（delete/delete-commentで必須）
  --dangerously-skip-secret-scan  Secret scanをスキップ
  --dangerously-skip-ai-scan      AI scanをスキップ
  --notes-to-ai NOTES     AI scanへ追加の備考を送信
  --machine-readable     成功結果を機械可読形式で標準出力へ表示
                         create/postはURL、その他はレスポンスJSONを1行で表示
  --help, -h             このヘルプを表示

Environment:
  ZENN_API_KEY                 必要なscrap:readまたはscrap:writeスコープを持つAPIキー
  ZENN_API_BASE_URL            開発・テスト用のPublic APIベースURL（任意）
  ZENN_CLI_FORCE_SAFE          dangerousなscanスキップを禁止する場合はtrue
  ZENN_CLI_FORCE_UNLISTED      Scrap作成を常に限定公開にする場合はtrue
  ZENN_CLI_AI_SCAN             AI scanを有効にする場合はtrue
  ZENN_CLI_AI_PROVIDER         openai / fireworks / anthropic / openrouter /
                               bedrock / vertex / vertex-anthropic / azure /
                               openai-decisions / jev / clef
  ZENN_CLI_AI_MODEL            AI scanに使用するモデルID（任意）
  ZENN_CLI_AI_EFFORT           none / low / medium / high。デフォルトはmedium。
                               openai-decisions / jev / clef では使用しない
  ZENN_CLI_AI_SCAN_FAILURE_THRESHOLD  拒否するlevel。デフォルトはhigh
  ZENN_CLI_AI_SCAN_PROBABILITY_THRESHOLD  判定モデルで検知とみなす確率。デフォルトは0.5
  ZENN_CLI_AI_SCAN_PROMPT      AI scanの検知方針（任意）
  ZENN_CLI_AI_JEV_IMAGES       Jevで画像をAI scanする場合はtrue（実験的機能）
  OPENAI_API_KEY               openai / openai-decisions 利用時のAPIキー
  FIREWORKS_API_KEY            Fireworks利用時のAPIキー
  ANTHROPIC_API_KEY            Anthropic利用時のAPIキー
  OPENROUTER_API_KEY           OpenRouter利用時のAPIキー（ZDRのエンドポイントのみ使用）
  TYPESAFE_API_KEY             Jev利用時のAPIキー
  CLOUDFLARE_API_TOKEN         Clef利用時のCloudflare APIトークン
  CLOUDFLARE_ACCOUNT_ID        Clef利用時のCloudflareアカウントID
  AWS_REGION                   Bedrock利用時のリージョン
  AWS_BEARER_TOKEN_BEDROCK     BedrockのAPIキー（任意。未設定時はAWSの認証情報チェーン）
  GOOGLE_VERTEX_PROJECT        vertex / vertex-anthropic 利用時のプロジェクトID
  GOOGLE_VERTEX_LOCATION       vertex / vertex-anthropic 利用時のロケーション
                               （認証はApplication Default Credentials）
  AZURE_RESOURCE_NAME          Azure OpenAIのリソース名
  AZURE_BASE_URL               AzureのURL（AZURE_RESOURCE_NAMEの代わりに指定）
  AZURE_API_KEY                AzureのAPIキー（任意。未設定時はMicrosoft Entra ID）

Default AI models:
  openai / openai-decisions: gpt-6-luna
  jev: jev-latest
  clef: clef-flash（clef または clef-flash を指定可能）
  fireworks / anthropic / openrouter / bedrock / vertex / vertex-anthropic / azure:
    ZENN_CLI_AI_MODEL の指定が必須（azureではデプロイ名）

AI scan:
  Secret scanはデフォルトで有効です。AI scanはZENN_CLI_AI_SCAN=true を
  指定した場合だけ有効です。scanをスキップするにはdangerouslyオプションが
  必要です。ZENN_CLI_FORCE_SAFE=true の場合はSecret scanとAI scanの両方が
  必須です。AI scanでは、タイトル・本文・topics・notes-to-ai・AI scan promptを
  選択したAIプロバイダーへ送信します。保持、学習利用、リージョン、契約条件は
  利用者の責任で確認してください。bedrock / azure ではAPIキーを設定しない
  場合、vertex / vertex-anthropic では常に、手元の既定の認証情報（AWS
  プロファイル、Azure CLI、gcloudのADCなど）を自動で使います。意図した
  アカウントか確認してください。Bedrockのクロスリージョン推論、Vertex AIの
  globalロケーション、AzureのGlobal・DataZoneデプロイでは、指定したリージョン
  以外で処理される場合があります。azureで推論モデルではないデプロイを使う
  場合はZENN_CLI_AI_EFFORT=noneを指定してください。notes-to-aiはシェル履歴に残るため、機密情報
  そのものを指定しないでください。限定公開でもURLまたはslugを知る利用者は閲覧
  できるため、URLとslugは秘密情報として扱ってください。

Public API:
  APIの利用にはレート制限があります。listは自分のアーカイブ済みScrapも返します。
  getでは自分のアーカイブ済みScrapに加えて、
  閲覧可能な他ユーザーのScrapと、slugを知っている限定公開Scrapも取得できますが、
  非表示・スパム判定コメントは返しません。
  deleteは自分のアーカイブ済みScrapと配下の全コメントを削除します。
  delete-commentで返信があるコメントを削除すると、返信も削除されます。

Example:
  npx zenn scrap list --count 20
  npx zenn scrap get abcdef12345678
  npx zenn scrap create --title "作業メモ" --file ./scrap.md
  npx zenn scrap post abcdef12345678 --file ./update.md
  npx zenn scrap update abcdef12345678 --closed --topics typescript,zenn
  npx zenn scrap comments comment123456 comment234567
  npx zenn scrap update-comment abcdef12345678 comment123456 --file ./revised.md
  npx zenn scrap delete abcdef12345678 --yes
  npx zenn scrap delete-comment abcdef12345678 comment123456 --yes
  printf '追記' | npx zenn scrap post abcdef12345678 --file -
`;

export const imageHelpText = `
Command:
  zenn image          （非推奨）Public API経由でMarkdown用画像を管理
                      今後のリリースで削除されるため zenn file --type image を利用してください

Usage:
  npx zenn image upload FILE --confirm-public [--machine-readable]
  npx zenn image list [--page NUMBER] [--count NUMBER] [--machine-readable]
  npx zenn image delete IMAGE_ID --yes [--machine-readable]

Options:
  --confirm-public     画像が公開URLで配信され、機密情報・個人情報を含まないことを確認する（必須）
  --page               一覧のページ番号（1以上、既定1）
  --count              一覧の取得件数（1～100、既定50）
  --yes                画像削除を確認する（必須）
  --machine-readable   uploadは画像URL、listとdeleteはJSONを1行で表示
  --dangerously-skip-ai-scan  uploadのAI scanをスキップ
  --notes-to-ai NOTES  uploadのAI scanへ追加の備考を送信
  --help, -h           このヘルプを表示

Environment:
  ZENN_API_KEY                         一覧はimage:read、アップロード・削除はimage:writeスコープを持つAPIキー
  ZENN_API_BASE_URL                    開発・テスト用のPublic APIベースURL（任意）
  ZENN_CLI_AI_SCAN                     uploadでAI scanを有効にする場合はtrue
  ZENN_CLI_FORCE_SAFE                  AI scanのスキップを禁止する場合はtrue
  AI scanのプロバイダー・モデル・APIキーの設定は npx zenn scrap --help を参照してください

AI scan:
  AI scanはZENN_CLI_AI_SCAN=true の場合だけ有効です。AI scanでは画像・ファイル名・
  notes-to-ai・AI scan promptを選択したAIプロバイダーへ送信します。画像を扱えない
  モデルや形式の場合、全フレームを検査できないアニメーション画像の場合は、
  アップロードせずに終了します。Jevでは
  ZENN_CLI_AI_JEV_IMAGES=true とPNG・JPEG（縦横280〜1568px）が、Clefでは
  PNG・JPEG・WebPが必要です。

Notice:
  JPEG、PNG、GIF、WebP形式の3MB以下の画像に対応します。アップロード後は
  公開URLで配信され、URLを知る人が閲覧できます。APIの利用にはレート制限が
  あります。画像は自動的には削除されません。本で使用中の画像は削除できません。
  機密情報や個人情報を含む画像は
  アップロードしないでください。

Example:
  npx zenn image upload ./images/example.png --confirm-public
`;

export const fileHelpText = `
Command:
  zenn file           Public API経由でMarkdown用の画像・音声を管理

Usage:
  npx zenn file upload FILE --type image|audio --confirm-public [--machine-readable]
  npx zenn file list --type image|audio [--page NUMBER] [--count NUMBER] [--machine-readable]
  npx zenn file delete FILE_ID --type image|audio --yes [--machine-readable]

Options:
  --type               ファイルの種類。image または audio（必須。拡張子や中身からは推測しません）
  --confirm-public     ファイルが公開URLで配信され、機密情報・個人情報を含まないことを確認する（必須）
  --page               一覧のページ番号（1以上、既定1）
  --count              一覧の取得件数（1～100、既定50）
  --yes                ファイル削除を確認する（必須）
  --machine-readable   結果をJSON1行で表示
  --dangerously-skip-ai-scan  uploadのAI scanをスキップ
  --notes-to-ai NOTES  uploadのAI scanへ追加の備考を送信
  --help, -h           このヘルプを表示

Environment:
  ZENN_API_KEY                         一覧はfile:read:own、アップロード・削除はfile:write:ownスコープを持つAPIキー
                                       （--type image に限りimage:read:own・image:write:ownでも可）
  ZENN_API_BASE_URL                    開発・テスト用のPublic APIベースURL（任意）
  ZENN_CLI_AI_SCAN                     uploadでAI scanを有効にする場合はtrue
  ZENN_CLI_FORCE_SAFE                  AI scanのスキップを禁止する場合はtrue
  AI scanのプロバイダー・モデル・APIキーの設定は npx zenn scrap --help を参照してください

Output:
  uploadの--machine-readableは id・type・url・size・created_at（音声は duration_ms も）を
  持つJSONを表示します。deleteは {"deleted":true,"type":"audio","id":123} の形式です。
  IDは種類ごとに採番されるため、deleteでも--typeを省略できません。

AI scan:
  AI scanはZENN_CLI_AI_SCAN=true の場合だけ有効です。AI scanでは画像または音声・
  ファイル名・notes-to-ai・AI scan promptを選択したAIプロバイダーへ送信します。
  検査できない場合はアップロードせずに終了します。
  画像: 画像を扱えないモデルや形式の場合、全フレームを検査できないアニメーション
  画像の場合は検査できません。Jevでは ZENN_CLI_AI_JEV_IMAGES=true とPNG・JPEG
  （縦横280〜1568px）が、ClefではPNG・JPEG・WebPが必要です。
  音声: ZENN_CLI_AI_PROVIDER=vertex と音声入力に対応したGeminiモデルが必要です。
  ほかのプロバイダーやモデルでは検査できません。変換後の音声（m4a）を送信します。
  検査するのは話されている内容で、検知漏れがありえます。話者の声そのものや
  音楽などの権利は検査しないため、公開してよい内容かは必ず自分で確認してください。

Audio:
  音声は約30秒以内・640KB以下のm4a（AAC）としてアップロードします。
  - WAVなどの非圧縮PCM（100MB以下）は、先頭30秒をCLIでAAC（128kbps）へ変換して
    送信します。30秒を超える部分はアップロードしません。
  - 条件を満たすm4aは音声を再エンコードせずに送信します。
  - MP3などの圧縮音声や、条件を超えるm4aはCLIで変換できません。先に変換してください。
      ffmpeg -i input.mp3 -t 30 -c:a aac -b:a 128k output.m4a
  タイトルや作成者などのメタデータは取り除いて送信します。動画やカバー画像を含む
  ファイル、音声トラックが複数あるファイルは指定できません。
  自分以外の人の声や、第三者が権利を持つ音源はアップロードしないでください。
  音声アップロードは段階的に提供中のため、利用できないアカウントがあります。
  アップロードした音声は、記事と本のチャプターの本文に @[audio](URL) と書くと
  埋め込めます（Scrapとコメントでは使えません）。

Notice:
  画像はJPEG、PNG、GIF、WebP形式の3MB以下に対応します。
  アップロード後は公開URLで配信され、URLを知る人が閲覧できます。APIの利用には
  レート制限があります。ファイルは自動的には削除されません。本で使用中のファイルは
  削除できません。機密情報や個人情報を含むファイルはアップロードしないでください。

Example:
  npx zenn file upload ./images/example.png --type image --confirm-public
  npx zenn file upload ./audio/example.wav --type audio --confirm-public --machine-readable
  npx zenn file list --type audio --machine-readable
  npx zenn file delete 123 --type audio --yes
`;
