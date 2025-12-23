import { CliExecFn } from '../types';
import * as Log from '../lib/log';
import {
  resolveExecuteCommand,
  getWorkingPath,
  generateFileIfNotExist,
} from '../lib/helper';
import { initHelpText, invalidOptionText } from '../lib/messages';
import arg from 'arg';

function parseArgs(argv?: string[]) {
  try {
    return arg(
      {
        // Types
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
    console.log(initHelpText);
    return null;
  }
}

export const exec: CliExecFn = async (argv) => {
  const args = parseArgs(argv);
  if (args === null) return;

  if (args['--help']) {
    console.log(initHelpText);
    return;
  }

  const mkDirNames = ['articles', 'books'];

  // generate directories
  mkDirNames.forEach((dirName) => {
    const createFilePath = getWorkingPath(`${dirName}/.keep`);
    try {
      generateFileIfNotExist(createFilePath, '');
    } catch (_e) {
      console.log(`Generating ${dirName} skipped.`);
    }
  });

  // generate .gitignore
  try {
    generateFileIfNotExist(
      getWorkingPath('.gitignore'),
      ['node_modules', '.DS_Store'].join('\n')
    );
  } catch (_e) {
    console.log(`Generating .gitignore skipped.`);
  }

  // generate README.md
  try {
    generateFileIfNotExist(
      getWorkingPath('README.md'),
      [
        '# Zenn CLI\n',
        '* [📘 How to use](https://zenn.dev/zenn/articles/zenn-cli-guide)',
      ].join('\n')
    );
  } catch (_e) {
    console.log(`Generating README.md skipped.`);
  }

  const newArticleCmd = await resolveExecuteCommand(['zenn', 'new:article']);
  const newBookCmd = await resolveExecuteCommand(['zenn', 'new:book']);
  const previewCmd = await resolveExecuteCommand(['zenn', 'preview']);

  console.log(`
  🎉  Done!
  早速コンテンツを作成しましょう

  👇  新しい記事を作成する
  $ ${newArticleCmd}

  👇  新しい本を作成する
  $ ${newBookCmd}

  👇  投稿をプレビューする
  $ ${previewCmd}
  `);
};
