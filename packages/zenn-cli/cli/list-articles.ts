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

  const articles = getAllArticles(['title']);

  const output = articles?.length
    ? articles.map((article) => formatter(article)).join('\n')
    : 'まだ記事は作成されていません';

  console.log(output);
};
