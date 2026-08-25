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
import {
  formatAiScanFinding,
  scanScrapContentWithAi,
  ScrapAiScanError,
} from '../lib/scrap-ai-scan';
import {
  getScrapAiConfiguration,
  getScrapScanSettings,
  isScrapForceUnlistedEnabled,
  ScrapScanConfigurationError,
  ScrapScanSettings,
} from '../lib/scrap-scan-settings';

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
    error instanceof ScrapAiScanError ||
    error instanceof ScrapScanConfigurationError ||
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

async function runSafetyGates(
  content: { title?: string; body: string },
  settings: ScrapScanSettings,
  notes: string | undefined
) {
  const aiConfig = settings.aiScanEnabled
    ? getScrapAiConfiguration()
    : undefined;
  if (settings.secretScanEnabled) {
    await scanScrapContentForSecrets({
      ...content,
      notes,
      aiPrompt: aiConfig?.customPrompt,
    });
  } else {
    Log.warn(
      'DANGER: Secret scanをスキップします。未検査の内容がAIやPublic APIへ送信される可能性があります'
    );
  }

  if (!settings.aiScanEnabled || !aiConfig) {
    Log.warn(
      settings.aiScanSkipped
        ? 'DANGER: AI scanをスキップします。タイトル・本文をAIプロバイダーへ送信しません'
        : 'AI scanは無効です。タイトル・本文をAIプロバイダーへ送信しません'
    );
    return;
  }

  const sentItems = [
    ...(content.title ? ['タイトル'] : []),
    '本文',
    ...(notes ? ['notes-to-ai'] : []),
    ...(aiConfig.customPrompt ? ['AI scan prompt'] : []),
  ];
  Log.warn(
    `AI scanを実行します。${sentItems.join('、')}を${aiConfig.provider}（model=${JSON.stringify(aiConfig.model)}, effort=${aiConfig.effort}）へ送信します。データ取扱いは利用者の責任で確認してください`
  );
  const findings = await scanScrapContentWithAi(content, aiConfig, notes);
  findings.forEach((finding) => {
    Log.warn(`AI scan warning: ${formatAiScanFinding(finding)}`);
  });
}

async function create(argv: string[]) {
  const args = parseArgs(argv, {
    '--title': String,
    '--file': String,
    '--unlisted': Boolean,
    '--dangerously-skip-secret-scan': Boolean,
    '--dangerously-skip-ai-scan': Boolean,
    '--notes-to-ai': String,
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
    const notes = args['--notes-to-ai'] as string | undefined;
    const scanSettings = getScrapScanSettings({
      dangerouslySkipSecretScan: Boolean(
        args['--dangerously-skip-secret-scan']
      ),
      dangerouslySkipAiScan: Boolean(args['--dangerously-skip-ai-scan']),
    });
    const forceUnlisted = isScrapForceUnlistedEnabled();
    if (!scanSettings.aiScanEnabled && notes !== undefined) {
      throw new ScrapScanConfigurationError(
        '--notes-to-ai はAI scanをスキップする場合には指定できません'
      );
    }
    ensurePublicApiCredentials();
    publicApiBaseUrl();
    const body = await readScrapBody(args['--file']);
    await runSafetyGates({ title, body }, scanSettings, notes);
    const result = await createScrap({
      title,
      bodyMarkdown: body,
      unlisted: Boolean(args['--unlisted']) || forceUnlisted,
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
    '--dangerously-skip-secret-scan': Boolean,
    '--dangerously-skip-ai-scan': Boolean,
    '--notes-to-ai': String,
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
    const notes = args['--notes-to-ai'] as string | undefined;
    const scanSettings = getScrapScanSettings({
      dangerouslySkipSecretScan: Boolean(
        args['--dangerously-skip-secret-scan']
      ),
      dangerouslySkipAiScan: Boolean(args['--dangerously-skip-ai-scan']),
    });
    if (!scanSettings.aiScanEnabled && notes !== undefined) {
      throw new ScrapScanConfigurationError(
        '--notes-to-ai はAI scanをスキップする場合には指定できません'
      );
    }
    ensurePublicApiCredentials();
    const scrapSlug = parseScrapSlugOrUrl(args._[0], publicApiBaseUrl().origin);
    const parentCommentSlug = args['--reply-to']
      ? parseCommentSlug(args['--reply-to'])
      : undefined;
    const body = await readScrapBody(args['--file']);
    await runSafetyGates({ body }, scanSettings, notes);
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
