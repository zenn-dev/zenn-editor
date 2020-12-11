import arg from 'arg';
import colors from 'colors/safe';
import updateNotifier from 'update-notifier';
import { commandListText } from './constants';

const pkg = require('../../package.json'); // refer package.json from dist/cli/index.js

// Special thanks to vercel/next.js for great examples.
export type cliCommand = (argv?: string[]) => void;

const commands: { [command: string]: () => Promise<cliCommand> } = {
  preview: async () => await import('./preview').then((i) => i.exec),
  help: async () => await import('./help').then((i) => i.exec),
  init: async () => await import('./init').then((i) => i.exec),
  'new:article': async () => await import('./new-article').then((i) => i.exec),
  'new:book': async () => await import('./new-book').then((i) => i.exec),
};

const args = arg(
  {
    '--version': Boolean,

    // alias
    '-v': '--version',
  },
  {
    permissive: true,
  }
);
const command = args._[0] || 'preview';

// notify package update
const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 3,
});
notifier.notify({
  message:
    'CLIに変更があります {currentVersion} → {latestVersion} 💡\n`npm install zenn-cli@latest`で更新してください',
});

if (args['--version']) {
  console.log(`zenn-cli v${pkg.version}`);
  process.exit(0);
}

if (!commands[command]) {
  console.log(colors.red('😿該当するCLIコマンドが存在しません'));
  console.log(commandListText);
  process.exit(1);
}

commands[command]().then((exec) => exec(args._.slice(1)));
