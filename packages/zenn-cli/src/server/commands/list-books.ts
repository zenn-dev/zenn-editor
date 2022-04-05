import arg from 'arg';
import { CliExecFn } from '../types';
import { BookMeta } from '../../common/types';
import colors from 'colors/safe';
import { invalidOptionText, listBooksHelpText } from '../lib/messages';

import { getLocalBookMetaList } from '../lib/books';
import * as Log from '../lib/log';

function parseArgs(argv: string[] | undefined) {
  try {
    return arg(
      {
        // Types
        '--format': String,
        '--help': Boolean,
        // Alias
        '-h': '--help',
      },
      { argv }
    );
  } catch (e: any) {
    if (e.code === 'ARG_UNKNOWN_OPTION') {
      console.log(colors.red(invalidOptionText));
    } else {
      console.log(colors.red('エラーが発生しました'));
    }
    console.log(listBooksHelpText);
    return null;
  }
}

const bookFormatters: { [key: string]: (bookMeta: BookMeta) => string } = {
  tsv: (bookMeta: BookMeta) =>
    bookMeta.slug + (bookMeta.title ? '\t' + bookMeta.title : ''),
  json: (bookMeta: BookMeta) => JSON.stringify(bookMeta),
};

export const exec: CliExecFn = (argv) => {
  const args = parseArgs(argv);
  if (!args) return;

  if (args['--help']) {
    console.log(listBooksHelpText);
    return;
  }

  const format = args['--format'] || 'tsv';
  if (!(format in bookFormatters)) {
    Log.error(
      `formatの値（${format}）が不正です。"tsv" または "json" を指定してください`
    );
    return;
  }
  const formatter = bookFormatters[format];

  const bookMetaList = getLocalBookMetaList();
  const output = bookMetaList?.length
    ? bookMetaList.map((book) => formatter(book)).join('\n')
    : 'No books yet';

  console.log(output);
};
