import arg from 'arg';
import { cliCommand } from '.';
import colors from 'colors/safe';
import { getAllArticles } from '../utils/api/articles';
import { invalidOption, listArticleHelpText } from './constants';

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
    console.log(listArticleHelpText);
    return null;
  }
}

export const exec: cliCommand = (argv) => {
  const args = parseArgs(argv);
  if (!args) return;

  if (args['--help']) {
    console.log(listArticleHelpText);
    return;
  }

  const format = args['--format'] || 'simple';

  // if (!validateSlug(slug)) {
  //   const errorMessage = getSlugErrorMessage(slug);
  //   console.error(colors.red(`エラー：${errorMessage}`));
  //   process.exit(1);
  // }

  // const dir = path.join(process.cwd(), 'articles');
  // fs.readdirSync(dir, {
  //   encoding: "utf-8",
  //   withFileTypes: true,
  // })
  //   .filter(dirent => dirent.isFile() && /\.md$/.test(dirent.name))
  //   .map(({ name }) => {
  //     const slug = name.replace(/\.md$/, '');
  //     let entry = {
  //       slug,
  //       name,
  //       title: '',
  //     };
  //     try {
  //       const fileRaw = fs.readFileSync(path.join(dir, name), 'utf8');
  //       const { data } = matter(fileRaw);
  //       entry['title'] = data['title'] || '';
  //     } catch { }
  //     return entry;
  //   })
  //   .forEach((entry) => {
  //     console.log(entry.slug + '\t' + entry.title);
  //   });
  //
  getAllArticles(['slug', 'title']).forEach((entry) => {
    console.log(entry.slug + '\t' + entry.title);
  });
};
