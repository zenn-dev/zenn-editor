import arg from 'arg';
import { CliExecFn } from '../types';
import { invalidOptionText, scrapHelpText } from '../lib/messages';
import * as Log from '../lib/log';
import { isExperimentalScrapApiEnabled } from '../lib/experimental-features';
import {
  parseCommentSlug,
  parseScrapSlugOrUrl,
  readScrapBody,
  ScrapInputError,
} from '../lib/scrap-input';
import {
  createScrap,
  ensurePublicApiCredentials,
  postScrapComment,
  PublicApiClientError,
  publicApiBaseUrl,
} from '../lib/zenn-public-api-client';
import {
  scanScrapContentForSecrets,
  ScrapSecretDetectedError,
} from '../lib/scrap-secret-scan';

function parseArgs(argv: string[], spec: arg.Spec) {
  try {
    return arg(spec, { argv });
  } catch (error: any) {
    Log.error(
      error.code === 'ARG_UNKNOWN_OPTION' ? invalidOptionText : '引数が不正です'
    );
    console.log(scrapHelpText);
    return null;
  }
}

function printSuccess(message: string, url: string, machineReadable: boolean) {
  if (machineReadable) {
    console.log(url);
    return;
  }
  Log.success(message);
  console.log(url);
}

function showError(error: unknown) {
  if (
    error instanceof ScrapInputError ||
    error instanceof ScrapSecretDetectedError ||
    error instanceof PublicApiClientError
  ) {
    const code =
      error instanceof PublicApiClientError && error.code
        ? ` (${error.code})`
        : '';
    Log.error(`${error.message}${code}`);
    return;
  }
  Log.error('原因不明のエラーが発生しました');
}

async function create(argv: string[]) {
  const args = parseArgs(argv, {
    '--title': String,
    '--file': String,
    '--unlisted': Boolean,
    '--machine-readable': Boolean,
    '--help': Boolean,
    '-h': '--help',
  });
  if (!args) return;
  if (args['--help']) return console.log(scrapHelpText);
  const title = args['--title'] as string | undefined;
  if (args._.length || !title?.trim()) {
    Log.error('--title を指定してください');
    return;
  }

  try {
    ensurePublicApiCredentials();
    publicApiBaseUrl();
    const body = await readScrapBody(args['--file']);
    await scanScrapContentForSecrets({ title, body });
    const result = await createScrap({
      title,
      bodyMarkdown: body,
      unlisted: Boolean(args['--unlisted']),
    });
    printSuccess(
      'Scrapを作成しました',
      result.url,
      Boolean(args['--machine-readable'])
    );
  } catch (error) {
    showError(error);
  }
}

async function post(argv: string[]) {
  const args = parseArgs(argv, {
    '--file': String,
    '--reply-to': String,
    '--machine-readable': Boolean,
    '--help': Boolean,
    '-h': '--help',
  });
  if (!args) return;
  if (args['--help']) return console.log(scrapHelpText);
  if (args._.length !== 1) {
    Log.error('投稿先のScrap slugまたはURLを指定してください');
    return;
  }

  try {
    ensurePublicApiCredentials();
    const scrapSlug = parseScrapSlugOrUrl(args._[0], publicApiBaseUrl().origin);
    const parentCommentSlug = args['--reply-to']
      ? parseCommentSlug(args['--reply-to'])
      : undefined;
    const body = await readScrapBody(args['--file']);
    await scanScrapContentForSecrets({ body });
    const result = await postScrapComment({
      scrapSlug,
      bodyMarkdown: body,
      parentCommentSlug,
    });
    printSuccess(
      'Scrapへ投稿しました',
      result.url,
      Boolean(args['--machine-readable'])
    );
  } catch (error) {
    showError(error);
  }
}

export const exec: CliExecFn = async (argv = []) => {
  if (!isExperimentalScrapApiEnabled()) {
    Log.error(
      'Scrap投稿は実験的機能です。ZENN_CLI_EXPERIMENTAL_SCRAP_API=true を設定してください'
    );
    return;
  }

  const [subcommand, ...subcommandArgs] = argv;
  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(scrapHelpText);
    return;
  }
  if (subcommand === 'create') return create(subcommandArgs);
  if (subcommand === 'post') return post(subcommandArgs);

  Log.error('Scrapのサブコマンドが不正です');
  console.log(scrapHelpText);
};
