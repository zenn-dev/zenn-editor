import arg from 'arg';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { CliExecFn } from '../types';
import { imageHelpText, invalidOptionText } from '../lib/messages';
import * as Log from '../lib/log';
import { isExperimentalImageApiEnabled } from '../lib/experimental-features';
import {
  deleteImage,
  ensurePublicApiCredentials,
  listMyImages,
  PublicApiClientError,
  uploadImage,
} from '../lib/zenn-public-api-client';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

class ImageInputError extends Error {}

function fail(message: string) {
  process.exitCode = 1;
  Log.error(message);
}

function contentType(bytes: Uint8Array) {
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
  throw new ImageInputError('JPEG、PNG、GIF、WebP形式の画像を指定してください');
}

async function readImage(filePath: string) {
  let fileSize: number;
  try {
    const metadata = await stat(filePath);
    if (!metadata.isFile()) throw new Error();
    fileSize = metadata.size;
  } catch {
    throw new ImageInputError('画像ファイルを読み込めませんでした');
  }
  if (fileSize < 1 || fileSize > MAX_IMAGE_BYTES) {
    throw new ImageInputError('3MB以下の画像を指定してください');
  }
  let bytes: Buffer;
  try {
    bytes = await readFile(filePath);
  } catch {
    throw new ImageInputError('画像ファイルを読み込めませんでした');
  }
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
    throw new ImageInputError('3MB以下の画像を指定してください');
  }
  return { bytes, contentType: contentType(bytes) };
}

async function upload(argv: string[]) {
  let args;
  try {
    args = arg(
      {
        '--confirm-public': Boolean,
        '--machine-readable': Boolean,
        '--help': Boolean,
        '-h': '--help',
      },
      { argv }
    );
  } catch {
    fail(invalidOptionText);
    console.log(imageHelpText);
    return;
  }
  if (args['--help']) return console.log(imageHelpText);
  if (args._.length !== 1) {
    fail('アップロードする画像ファイルを1件指定してください');
    return;
  }
  if (!args['--confirm-public']) {
    fail('公開URLでの配信を確認する場合は --confirm-public を指定してください');
    return;
  }

  try {
    ensurePublicApiCredentials();
    const filePath = args._[0];
    const image = await readImage(filePath);
    Log.warn(
      '画像は公開URLで配信されます。Markdown本文から参照しなくても自動的には削除されません。機密情報や個人情報を含まないことを確認してください'
    );
    const result = await uploadImage({
      ...image,
      filename: path.basename(filePath),
    });
    if (args['--machine-readable']) {
      console.log(result.url);
    } else {
      Log.success('画像をアップロードしました');
      console.log(result.url);
    }
  } catch (error) {
    if (
      error instanceof ImageInputError ||
      error instanceof PublicApiClientError
    ) {
      const code =
        error instanceof PublicApiClientError && error.code
          ? ` (${error.code})`
          : '';
      fail(`${error.message}${code}`);
    } else {
      fail('原因不明のエラーが発生しました');
    }
  }
}

async function list(argv: string[]) {
  let args;
  try {
    args = arg(
      {
        '--page': Number,
        '--count': Number,
        '--machine-readable': Boolean,
        '--help': Boolean,
        '-h': '--help',
      },
      { argv }
    );
  } catch {
    fail(invalidOptionText);
    return;
  }
  if (args['--help']) return console.log(imageHelpText);
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
    const result = await listMyImages(page, count);
    console.log(
      JSON.stringify(result, null, args['--machine-readable'] ? undefined : 2)
    );
  } catch (error) {
    showError(error);
  }
}

async function removeImage(argv: string[]) {
  let args;
  try {
    args = arg(
      {
        '--yes': Boolean,
        '--machine-readable': Boolean,
        '--help': Boolean,
        '-h': '--help',
      },
      { argv }
    );
  } catch {
    fail(invalidOptionText);
    return;
  }
  if (args['--help']) return console.log(imageHelpText);
  if (args._.length !== 1) return fail('削除する画像IDを1件指定してください');
  if (!args['--yes'])
    return fail(
      '画像の削除は取り消せません。実行する場合は --yes を指定してください'
    );

  const rawId = args._[0];
  const id = Number(rawId);
  if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id)) {
    return fail('画像IDは1以上の整数を指定してください');
  }

  try {
    ensurePublicApiCredentials();
    Log.warn(
      '画像を削除すると参照しているArticle、Book、Scrapなどで表示できなくなります'
    );
    await deleteImage(id);
    if (args['--machine-readable']) {
      console.log(JSON.stringify({ deleted: true, image_id: id }));
    } else {
      Log.success('画像を削除しました');
    }
  } catch (error) {
    showError(error);
  }
}

function showError(error: unknown) {
  if (error instanceof PublicApiClientError) {
    fail(`${error.message}${error.code ? ` (${error.code})` : ''}`);
    return;
  }
  fail('原因不明のエラーが発生しました');
}

export const exec: CliExecFn = async (argv = []) => {
  if (!isExperimentalImageApiEnabled()) {
    fail(
      '画像操作は実験的機能です。ZENN_CLI_EXPERIMENTAL_IMAGE_API=true を設定してください'
    );
    return;
  }
  const [subcommand, ...subcommandArgs] = argv;
  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(imageHelpText);
    return;
  }
  if (subcommand === 'upload') return upload(subcommandArgs);
  if (subcommand === 'list') return list(subcommandArgs);
  if (subcommand === 'delete') return removeImage(subcommandArgs);
  fail('imageのサブコマンドが不正です');
  console.log(imageHelpText);
};
