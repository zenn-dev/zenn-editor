import arg from 'arg';
import { CliExecFn } from '../types';
import {
  generateSlug,
  getWorkingPath,
  generateFileIfNotExist,
} from '../lib/helper';
import { invalidOptionText, newBookHelpText } from '../lib/messages';
import { validateSlug, getSlugErrorMessage } from '../../common/helper';
import * as Log from '../lib/log';

function parseArgs(argv: string[] | undefined) {
  try {
    return arg(
      {
        // Types
        '--slug': String,
        '--title': String,
        '--published': String,
        '--summary': String,
        '--price': Number,
        '--help': Boolean,
        // Alias
        '-h': '--help',
      },
      { argv }
    );
  } catch (err: any) {
    if (err.code === 'ARG_UNKNOWN_OPTION') {
      Log.error(invalidOptionText);
    } else {
      Log.error('引数のパース時にエラーが発生しました');
      console.log(err);
    }
    console.log(newBookHelpText);
    return null;
  }
}

export const exec: CliExecFn = (argv) => {
  const args = parseArgs(argv);
  if (args === null) return;

  if (args['--help']) {
    console.log(newBookHelpText);
    return;
  }

  const slug = args['--slug'] || generateSlug();
  const title = args['--title'] || '';
  const summary = args['--summary'] || '';
  const published = args['--published'] === 'true' ? 'true' : 'false'; // デフォルトはfalse
  const price = args['--price'] || 0; // デフォルトは¥0

  if (!validateSlug(slug)) {
    Log.error(getSlugErrorMessage(slug));
    return;
  }

  const configYamlBody =
    [
      `title: "${title.replace(/"/g, '\\"')}"`,
      `summary: "${summary.replace(/"/g, '\\"')}"`,
      'topics: []',
      `published: ${published}`,
      `price: ${price} # 有料の場合200〜5000`,
      `# 本に含めるチャプターを順番に並べましょう`,
      `chapters:`,
      `  - example1`,
      `  - example2`,
    ].join('\n') + '\n';

  const relativeConfigYamlPath = `books/${slug}/config.yaml`;
  const configYamlPath = getWorkingPath(relativeConfigYamlPath);

  try {
    generateFileIfNotExist(configYamlPath, configYamlBody);
    Log.created(relativeConfigYamlPath);
  } catch (err) {
    Log.error('config.yamlの作成時にエラーが発生しました');
    console.error(err);
    return;
  }

  const initialChapterBody = ['---', 'title: ""', '---'].join('\n') + '\n';
  ['example1.md', 'example2.md'].forEach((chapterFileName) => {
    try {
      const relativeChapterFilePath = `books/${slug}/${chapterFileName}`;
      generateFileIfNotExist(
        getWorkingPath(relativeChapterFilePath),
        initialChapterBody
      );
      Log.created(relativeChapterFilePath);
    } catch (err) {
      Log.error(`チャプターのファイル作成時にエラーが発生しました`);
      console.error(err);
      return;
    }
  });
};
