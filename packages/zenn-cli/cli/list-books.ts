import path from 'path';
import fs from 'fs';
//@ts-ignore
import yaml from 'js-yaml';
import arg from 'arg';
import { Book } from '../types';
import { cliCommand } from '.';
import colors from 'colors/safe';
import { invalidOption, listBooksHelpText } from './constants';

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
  tsv: (book: Book) => book.slug + (!!book.title ? '\t' + book.title : ''),
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

  const dir = path.join(process.cwd(), 'books');
  fs.readdirSync(dir, {
    encoding: 'utf-8',
    withFileTypes: true,
  })
    .filter((dirent) => dirent.isDirectory())
    .map(({ name }) => {
      let book: Book = {
        slug: name,
      };
      const fullDirPath = path.join(dir, name)
      let fileRaw: string | undefined;
      try {
        // try to get config.yaml
        fileRaw = fs.readFileSync(`${fullDirPath}/config.yaml`, 'utf8');
      } catch (_) {
        // try to get config.yml
        try {
          fileRaw = fs.readFileSync(`${fullDirPath}/config.yml`, 'utf8');
        } catch (_) {}
      }
      // couldn't get yaml files
      if (!fileRaw) {
        return book;
      }
      try {
        return { ...book, ...yaml.safeLoad(fileRaw) };
      } catch (_) {
        return book;
      }
    })
    .forEach(book => {
      console.log(formatter(book));
    });
};
