import arg from 'arg';
import { Book } from '../types';
import { cliCommand } from '.';
import colors from 'colors/safe';
import { invalidOption, listBooksHelpText } from './constants';
import { getAllBooks } from '../utils/api/books';

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
  } catch (e) {
    if (e.code === 'ARG_UNKNOWN_OPTION') {
      console.log(colors.red(invalidOption));
    } else {
      console.log(colors.red('エラーが発生しました'));
    }
    console.log(listBooksHelpText);
    return null;
  }
}

const bookFormatters: { [key: string]: (book: Book) => string } = {
  tsv: (book: Book) => book.slug + (book.title ? '\t' + book.title : ''),
  json: (book: Book) => JSON.stringify(book),
};

export const exec: cliCommand = (argv) => {
  const args = parseArgs(argv);
  if (!args) return;

  if (args['--help']) {
    console.log(listBooksHelpText);
    return;
  }

  const format = args['--format'] || 'tsv';
  if (!(format in bookFormatters)) {
    console.error(
      `エラー：formatの値（${format}）が不正です。"tsv" または "json" を指定してください`
    );
    process.exit(1);
  }
  const formatter = bookFormatters[format];

  const books = getAllBooks(['title']);
  const output = books?.length
    ? books.map((book) => formatter(book)).join('\n')
    : 'No books yet';

  console.log(output);
};
