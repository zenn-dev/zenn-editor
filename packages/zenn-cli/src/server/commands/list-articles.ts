import arg from 'arg';
import { CliExecFn } from '../types';
import { ArticleMeta } from '../../common/types';
import { invalidOptionText, listArticlesHelpText } from '../lib/messages';
import { getLocalArticleMetaList } from '../lib/articles';
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
      Log.error(invalidOptionText);
    } else {
      Log.error('原因不明のエラーが発生しました');
    }
    console.log(listArticlesHelpText);
    return null;
  }
}

const articleFormatters: {
  [key: string]: (articleMeta: ArticleMeta) => string;
} = {
  tsv: (articleMeta: ArticleMeta) =>
    articleMeta.slug + (articleMeta.title ? '\t' + articleMeta.title : ''),
  json: (articleMeta: ArticleMeta) => JSON.stringify(articleMeta),
};

export const exec: CliExecFn = (argv) => {
  const args = parseArgs(argv);
  if (!args) return;

  if (args['--help']) {
    console.log(listArticlesHelpText);
    return;
  }

  const format = args['--format'] || 'tsv';
  if (!(format in articleFormatters)) {
    Log.error(
      `formatの値（${format}）が不正です。"tsv" または "json" を指定してください`
    );
    return;
  }
  const formatter = articleFormatters[format];
  const articleMetaList = getLocalArticleMetaList();

  const output = articleMetaList?.length
    ? articleMetaList.map((article) => formatter(article)).join('\n')
    : 'No articles yet';

  console.log(output);
};
