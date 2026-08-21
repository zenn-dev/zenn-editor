import arg from 'arg';
import { CliExecFn } from '../types';
import * as Log from '../lib/log';
import {
  generateSlug,
  getWorkingPath,
  generateFileIfNotExist,
} from '../lib/helper';
import { validateSlug, getSlugErrorMessage } from '../../common/helper';

import { invalidOptionText, newArticleHelpText } from '../lib/messages';

const pickRandomEmoji = () => {
  // prettier-ignore
  const emojiList =["😺","📘","📚","📑","😊","😎","👻","🤖","😸","😽","💨","💬","💭","👋", "👌","👏","🙌","🙆","🐕","🐈","🦁","🐷","🦔","🐥","🐡","🐙","🍣","🕌","🌟","🔥","🌊","🎃","✨","🎉","⛳","🔖","📝","🗂","📌"];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
};

function parseArgs(argv?: string[]) {
  try {
    return arg(
      {
        // Types
        '--slug': String,
        '--title': String,
        '--type': String,
        '--emoji': String,
        '--published': String,
        '--publication-name': String,
        '--machine-readable': Boolean,
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
    console.log(newArticleHelpText);
    return null;
  }
}

export const exec: CliExecFn = (argv) => {
  const args = parseArgs(argv);
  if (args === null) return;

  if (args['--help']) {
    console.log(newArticleHelpText);
    return;
  }

  const slug = args['--slug'] || generateSlug();
  const title = args['--title'] || '';
  const emoji = args['--emoji'] || pickRandomEmoji();
  const type = args['--type'] === 'idea' ? 'idea' : 'tech';
  const published = args['--published'] === 'true' ? 'true' : 'false'; // デフォルトはfalse
  const publicationName = args['--publication-name'] || '';
  const machineReadable = args['--machine-readable'] === true;

  if (!validateSlug(slug)) {
    Log.error(getSlugErrorMessage(slug));
    return;
  }

  const fileName = `${slug}.md`;
  const relativeFilePath = `articles/${fileName}`;
  const fullFilepath = getWorkingPath(relativeFilePath);

  const fileBody =
    [
      '---',
      `title: "${title.replace(/"/g, '\\"')}"`,
      `emoji: "${emoji}"`,
      `type: "${type}" # tech: 技術記事 / idea: アイデア`,
      'topics: []',
      `published: ${published}`,
      publicationName !== ''
        ? `publication_name: ${publicationName.replace(/"/g, '\\"')}`
        : null,
      '---',
    ]
      .filter((v) => v)
      .join('\n') + '\n';

  try {
    generateFileIfNotExist(fullFilepath, fileBody);
    if (machineReadable) {
      console.log(relativeFilePath);
    } else {
      Log.created(relativeFilePath);
    }
  } catch (err) {
    Log.error('記事のファイル作成時にエラーが発生しました');
    console.error(err);
    return;
  }
};
