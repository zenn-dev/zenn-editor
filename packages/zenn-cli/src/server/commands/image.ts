import arg from 'arg';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { CliExecFn } from '../types';
import { imageHelpText, invalidOptionText } from '../lib/messages';
import * as Log from '../lib/log';
import { isExperimentalImageApiEnabled } from '../lib/experimental-features';
import {
  ensurePublicApiCredentials,
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
  let bytes: Buffer;
  try {
    bytes = await readFile(filePath);
  } catch {
    throw new ImageInputError('画像ファイルを読み込めませんでした');
  }
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
    throw new ImageInputError('3MiB以下の画像を指定してください');
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
      '画像は公開URLで配信され、公開APIでは削除できません。機密情報や個人情報を含まないことを確認してください'
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

export const exec: CliExecFn = async (argv = []) => {
  if (!isExperimentalImageApiEnabled()) {
    fail(
      '画像アップロードは実験的機能です。ZENN_CLI_EXPERIMENTAL_IMAGE_API=true を設定してください'
    );
    return;
  }
  const [subcommand, ...subcommandArgs] = argv;
  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(imageHelpText);
    return;
  }
  if (subcommand === 'upload') return upload(subcommandArgs);
  fail('imageのサブコマンドが不正です');
  console.log(imageHelpText);
};
