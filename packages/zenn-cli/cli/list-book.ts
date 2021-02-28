import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import arg from 'arg';
import { Book } from '../types';
import { cliCommand } from '.';
import colors from 'colors/safe';
import { invalidOption, listBookHelpText } from './constants';

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
    console.log(listBookHelpText);
    return null;
  }
}

const bookFormatters: { [key: string]: (book: Book) => string } = {
  tsv: (book: Book) => book.slug + (!!book.title ? '\t' + book.title : ''),
  json: (book: Book) => JSON.stringify(book),
};

export const exec: cliCommand = (argv) => {
  const args = parseArgs(argv);
  if (!args) return;

  if (args['--help']) {
    console.log(listBookHelpText);
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

  const dir = path.join(process.cwd(), 'books');
  fs.readdirSync(dir, {
    encoding: 'utf-8',
    withFileTypes: true,
  })
    .filter((dirent) => dirent.isFile() && /\.md$/.test(dirent.name))
    .map(({ name }) => {
      const slug = name.replace(/\.md$/, '');
      let book: Book = {
        slug,
      };
      try {
        const fileRaw = fs.readFileSync(path.join(dir, name), 'utf8');
        const { data } = matter(fileRaw);
        book = { ...book, ...data };
      } catch {}
      return book;
    })
    .forEach(book => {
      console.log(formatter(book));
    });
};
