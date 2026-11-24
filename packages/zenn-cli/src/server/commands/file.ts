import arg from 'arg';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import {
  AUDIO_CONVERSION_HINT,
  AudioInputError,
  prepareAudioForUpload,
} from '../lib/audio-convert';
import { CliExecFn } from '../types';
import {
  fileHelpText,
  imageHelpText,
  invalidOptionText,
} from '../lib/messages';
import * as Log from '../lib/log';
import {
  formatAiScanFinding,
  assertAudioScanSupported,
  scanAudioWithAi,
  scanImageWithAi,
  ScrapAiScanError,
} from '../lib/scrap-ai-scan';
import {
  getImageScanSettings,
  getScrapAiConfiguration,
  isDecisionAiProvider,
  ScrapScanConfigurationError,
} from '../lib/scrap-scan-settings';
import {
  deleteFile,
  deleteImage,
  ensurePublicApiCredentials,
  listMyFiles,
  listMyImages,
  PublicApiClientError,
  PublicFileType,
  uploadFile,
  uploadImage,
} from '../lib/zenn-public-api-client';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
// 変換前の音声として読み込む上限。30秒のWAVは数MBだが、長い録音の先頭だけを使う場合を考慮する
const MAX_AUDIO_SOURCE_BYTES = 100 * 1024 * 1024;

// `zenn file` は /files を、互換用の `zenn image` は従来の /images を呼ぶ。
// `zenn image` の引数・出力・終了コードは変えない
type Variant = 'file' | 'image';

type UploadTarget = { bytes: Buffer; contentType: string; filename: string };

class FileInputError extends Error {}

const typeLabels: Record<PublicFileType, string> = {
  image: '画像',
  audio: '音声',
};

function fail(message: string) {
  process.exitCode = 1;
  Log.error(message);
}

function helpTextOf(variant: Variant) {
  return variant === 'image' ? imageHelpText : fileHelpText;
}

// `zenn image` は種類が画像に固定のため、従来どおり `--type` を不正なオプションとして扱う
function rejectTypeOption(variant: Variant, value: string | undefined) {
  if (variant === 'image' && value !== undefined) throw new Error();
}

function resolveType(
  variant: Variant,
  value: string | undefined
): PublicFileType | undefined {
  if (variant === 'image') return 'image';
  if (value === 'image' || value === 'audio') return value;
  fail('--type に image または audio を指定してください');
  return undefined;
}

function imageContentType(bytes: Uint8Array) {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return 'image/jpeg';
  if (
    bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value
    )
  )
    return 'image/png';
  const header = Buffer.from(bytes.subarray(0, 12)).toString('ascii');
  if (header.startsWith('GIF87a') || header.startsWith('GIF89a'))
    return 'image/gif';
  if (header.startsWith('RIFF') && header.slice(8, 12) === 'WEBP')
    return 'image/webp';
  throw new FileInputError('JPEG、PNG、GIF、WebP形式の画像を指定してください');
}

async function readUploadFile(
  type: PublicFileType,
  filePath: string
): Promise<UploadTarget> {
  const label = typeLabels[type];
  const maxBytes = type === 'image' ? MAX_IMAGE_BYTES : MAX_AUDIO_SOURCE_BYTES;
  const unreadable = `${label}ファイルを読み込めませんでした`;
  const tooLarge =
    type === 'image'
      ? '3MB以下の画像を指定してください'
      : '100MB以下の音声を指定してください';

  let fileSize: number;
  try {
    const metadata = await stat(filePath);
    if (!metadata.isFile()) throw new Error();
    fileSize = metadata.size;
  } catch {
    throw new FileInputError(unreadable);
  }
  if (fileSize < 1 || fileSize > maxBytes) throw new FileInputError(tooLarge);
  let bytes: Buffer;
  try {
    bytes = await readFile(filePath);
  } catch {
    throw new FileInputError(unreadable);
  }
  if (!bytes.length || bytes.length > maxBytes) {
    throw new FileInputError(tooLarge);
  }
  const filename = path.basename(filePath);
  if (type === 'image') {
    return { bytes, contentType: imageContentType(bytes), filename };
  }

  const audio = await prepareAudioForUpload(bytes);
  if (audio.converted) {
    Log.warn(
      audio.trimmed
        ? '音声の先頭30秒をAAC（m4a）へ変換しました。30秒を超える部分はアップロードしません'
        : '音声をAAC（m4a）へ変換しました'
    );
  }
  return {
    bytes: Buffer.from(audio.bytes),
    contentType: audio.contentType,
    filename: audio.converted
      ? `${path.basename(filename, path.extname(filename))}.m4a`
      : filename,
  };
}

// 画像と音声のどちらも、アップロードする内容そのもの（音声は変換後）を検査する
async function runAiScan(
  type: PublicFileType,
  target: UploadTarget,
  dangerouslySkipAiScan: boolean,
  notes: string | undefined
) {
  const label = typeLabels[type];
  const settings = getImageScanSettings({ dangerouslySkipAiScan });
  if (!settings.aiScanEnabled) {
    if (notes !== undefined) {
      throw new ScrapScanConfigurationError(
        '--notes-to-ai はAI scanが無効な場合には指定できません'
      );
    }
    Log.warn(
      settings.aiScanSkipped
        ? `DANGER: AI scanをスキップします。${label}をAIプロバイダーへ送信しません`
        : `AI scanは無効です。${label}をAIプロバイダーへ送信しません`
    );
    return;
  }

  const config = getScrapAiConfiguration();
  const sentItems = [
    label,
    'ファイル名',
    ...(notes ? ['notes-to-ai'] : []),
    ...(config.customPrompt ? ['AI scan prompt'] : []),
  ];
  const modelInfo = isDecisionAiProvider(config.provider)
    ? `model=${JSON.stringify(config.model)}`
    : `model=${JSON.stringify(config.model)}, effort=${config.effort}`;
  // 対応しない設定では送信しないため、送信の案内より先に確認する
  if (type === 'audio') assertAudioScanSupported(config);
  Log.warn(
    `AI scanを実行します。${sentItems.join('、')}を${config.provider}（${modelInfo}）へ送信します。データ取扱いは利用者の責任で確認してください`
  );
  const findings =
    type === 'image'
      ? await scanImageWithAi(target, config, notes)
      : await scanAudioWithAi(target, config, notes);
  findings.forEach((finding) => {
    Log.warn(`AI scan warning: ${formatAiScanFinding(finding)}`);
  });
}

type Operation = 'upload' | 'list' | 'delete';

function apiErrorMessage(
  error: PublicApiClientError,
  variant: Variant,
  type: PublicFileType,
  operation: Operation
) {
  const code = error.code ? ` (${error.code})` : '';
  if (variant === 'image') return `${error.message}${code}`;

  if (error.code === 'audio_upload_unavailable') {
    return `音声アップロードは段階的に提供中のため、このアカウントではまだ利用できません${code}`;
  }
  if (error.kind === 'validation') {
    if (operation !== 'upload') return `リクエスト値を確認してください${code}`;
    const hint = type === 'audio' ? `。${AUDIO_CONVERSION_HINT}` : '';
    return `リクエスト値または${typeLabels[type]}ファイルを確認してください${hint}${code}`;
  }
  if (error.kind === 'conflict' && operation === 'delete') {
    return `本で使用中の${typeLabels[type]}は削除できません${code}`;
  }
  return `${error.message}${code}`;
}

function showError(
  error: unknown,
  variant: Variant,
  type: PublicFileType,
  operation: Operation
) {
  if (error instanceof PublicApiClientError) {
    fail(apiErrorMessage(error, variant, type, operation));
  } else if (
    error instanceof FileInputError ||
    error instanceof AudioInputError ||
    error instanceof ScrapAiScanError ||
    error instanceof ScrapScanConfigurationError
  ) {
    fail(error.message);
  } else {
    fail('原因不明のエラーが発生しました');
  }
}

async function upload(variant: Variant, argv: string[]) {
  const helpText = helpTextOf(variant);
  let args;
  try {
    args = arg(
      {
        '--type': String,
        '--confirm-public': Boolean,
        '--machine-readable': Boolean,
        '--dangerously-skip-ai-scan': Boolean,
        '--notes-to-ai': String,
        '--help': Boolean,
        '-h': '--help',
      },
      { argv }
    );
    rejectTypeOption(variant, args['--type']);
  } catch {
    fail(invalidOptionText);
    console.log(helpText);
    return;
  }
  if (args['--help']) return console.log(helpText);
  const type = resolveType(variant, args['--type']);
  if (!type) return;
  const label = typeLabels[type];
  if (args._.length !== 1) {
    fail(`アップロードする${label}ファイルを1件指定してください`);
    return;
  }
  if (!args['--confirm-public']) {
    fail('公開URLでの配信を確認する場合は --confirm-public を指定してください');
    return;
  }

  try {
    ensurePublicApiCredentials();
    const target = await readUploadFile(type, args._[0]);
    if (type === 'audio') {
      // AIプロバイダーへ送信する旨の案内より先に表示する
      Log.warn(
        '声は話者を識別しうる情報です。自分以外の人の声や、第三者が権利を持つ音源を含まないことを確認してください'
      );
    }
    await runAiScan(
      type,
      target,
      Boolean(args['--dangerously-skip-ai-scan']),
      args['--notes-to-ai']
    );
    Log.warn(
      `${label}は公開URLで配信されます。Markdown本文から参照しなくても自動的には削除されません。機密情報や個人情報を含まないことを確認してください`
    );

    if (variant === 'image') {
      const result = await uploadImage(target);
      if (!args['--machine-readable'])
        Log.success('画像をアップロードしました');
      console.log(result.url);
      return;
    }
    const result = await uploadFile({ ...target, type });
    if (args['--machine-readable']) {
      console.log(JSON.stringify(result));
    } else {
      Log.success(`${label}をアップロードしました`);
      console.log(result.url);
      if (type === 'audio') {
        console.log(
          `記事と本のチャプターの本文には @[audio](${result.url}) と書くと埋め込めます`
        );
      }
    }
  } catch (error) {
    showError(error, variant, type, 'upload');
  }
}

async function list(variant: Variant, argv: string[]) {
  let args;
  try {
    args = arg(
      {
        '--type': String,
        '--page': Number,
        '--count': Number,
        '--machine-readable': Boolean,
        '--help': Boolean,
        '-h': '--help',
      },
      { argv }
    );
    rejectTypeOption(variant, args['--type']);
  } catch {
    fail(invalidOptionText);
    return;
  }
  if (args['--help']) return console.log(helpTextOf(variant));
  const type = resolveType(variant, args['--type']);
  if (!type) return;
  if (args._.length) return fail('listに位置引数は指定できません');

  const page = args['--page'];
  const count = args['--count'];
  if (page !== undefined && (!Number.isSafeInteger(page) || page < 1)) {
    return fail('--page は1以上の整数を指定してください');
  }
  if (
    count !== undefined &&
    (!Number.isSafeInteger(count) || count < 1 || count > 100)
  ) {
    return fail('--count は1以上100以下の整数を指定してください');
  }

  try {
    ensurePublicApiCredentials();
    const result =
      variant === 'image'
        ? await listMyImages(page, count)
        : await listMyFiles(type, page, count);
    console.log(
      JSON.stringify(result, null, args['--machine-readable'] ? undefined : 2)
    );
  } catch (error) {
    showError(error, variant, type, 'list');
  }
}

async function remove(variant: Variant, argv: string[]) {
  let args;
  try {
    args = arg(
      {
        '--type': String,
        '--yes': Boolean,
        '--machine-readable': Boolean,
        '--help': Boolean,
        '-h': '--help',
      },
      { argv }
    );
    rejectTypeOption(variant, args['--type']);
  } catch {
    fail(invalidOptionText);
    return;
  }
  if (args['--help']) return console.log(helpTextOf(variant));
  const type = resolveType(variant, args['--type']);
  if (!type) return;
  const label = typeLabels[type];
  const idLabel = variant === 'image' ? '画像ID' : 'ファイルID';
  if (args._.length !== 1) {
    return fail(`削除する${idLabel}を1件指定してください`);
  }
  if (!args['--yes'])
    return fail(
      `${label}の削除は取り消せません。実行する場合は --yes を指定してください`
    );

  const rawId = args._[0];
  const id = Number(rawId);
  if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id)) {
    return fail(`${idLabel}は1以上の整数を指定してください`);
  }

  try {
    ensurePublicApiCredentials();
    Log.warn(
      type === 'image'
        ? '画像を削除すると参照しているArticle、Book、Scrapなどで表示できなくなります'
        : '音声を削除すると参照しているArticle、Bookで再生できなくなります'
    );
    if (variant === 'image') {
      await deleteImage(id);
    } else {
      await deleteFile(type, id);
    }
    if (args['--machine-readable']) {
      console.log(
        JSON.stringify(
          variant === 'image'
            ? { deleted: true, image_id: id }
            : { deleted: true, type, id }
        )
      );
    } else {
      Log.success(`${label}を削除しました`);
    }
  } catch (error) {
    showError(error, variant, type, 'delete');
  }
}

export async function execFileCommand(variant: Variant, argv: string[]) {
  const helpText = helpTextOf(variant);
  const [subcommand, ...subcommandArgs] = argv;
  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(helpText);
    return;
  }
  if (subcommand === 'upload') return upload(variant, subcommandArgs);
  if (subcommand === 'list') return list(variant, subcommandArgs);
  if (subcommand === 'delete') return remove(variant, subcommandArgs);
  fail(`${variant}のサブコマンドが不正です`);
  console.log(helpText);
}

export const exec: CliExecFn = async (argv = []) =>
  execFileCommand('file', argv);
