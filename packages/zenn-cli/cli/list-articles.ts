import arg from 'arg';
import { Article } from '../types';
import { cliCommand } from '.';
import colors from 'colors/safe';
import { invalidOption, listArticlesHelpText } from './constants';
import { getAllArticles } from '../utils/api/articles';

function parseArgs(argv: string[] | undefined) {
  try {
    return arg(
      {
        // Types
        '--format': String,
        '--fields': [String],
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
    console.log(listArticlesHelpText);
    return null;
  }
}

const articleFormatters: { [key: string]: (article: Article) => string } = {
  tsv: (article: Article) =>
    article.slug + (article.title ? '\t' + article.title : ''),
  json: (article: Article) => JSON.stringify(article),
};

const articleFields: (keyof Article)[] = [
  'slug',
  'content',
  'title',
  'emoji',
  'type',
  'topics',
  'tags',
  'published',
];

export const exec: cliCommand = (argv) => {
  const args = parseArgs(argv);
  if (!args) return;

  if (args['--help']) {
    console.log(listArticlesHelpText);
    return;
  }

  const format = args['--format'] || 'tsv';
  if (!(format in articleFormatters)) {
    console.error(
      `エラー：formatの値（${format}）が不正です。"tsv" または "json" を指定してください`
    );
    process.exit(1);
  }
  const formatter = articleFormatters[format];

  let fields: (keyof Article)[] = ['title'];
  if (args['--fields']) {
    let illegalFields = args['--fields'].filter(f => !articleFields.includes(f as keyof Article));
    if (illegalFields.length > 0) {
      console.error(
        `エラー：fieldの値（${illegalFields.join(',')}）が不正です。 "${articleFields.join('", "')}" のいずれかを指定してください`
      );
      process.exit(1);
    }
    fields = args['--fields'].map(f => f as keyof Article);
  }

  const articles = getAllArticles(fields);

  const output = articles?.length
    ? articles.map((article) => formatter(article)).join('\n')
    : 'No articles yet';

  console.log(output);
};
