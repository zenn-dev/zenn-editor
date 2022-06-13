import * as Log from '../lib/log';
import { commandListText } from '../lib/messages';
import { notifyNeedUpdateCLI } from '../lib/helper';
import { CliExecFn } from '../types';

type Commands = { [command: string]: CliExecFn };

export async function exec(execCommandName: string, execCommandArgs: string[]) {
  const commands: Commands = {
    preview: async () => {
      const { exec } = await import('./preview');
      await exec();
    },
    init: async () => (await import('./init')).exec(),
    'new:article': async () => (await import('./new-article')).exec(),
    'new:articles': async () => (await import('./new-article')).exec(),
    'new:book': async () => (await import('./new-book')).exec(),
    'new:books': async () => (await import('./new-book')).exec(),
    'list:articles': async () => (await import('./list-articles')).exec(),
    'list:books': async () => (await import('./list-books')).exec(),
    '--help': async () => (await import('./help')).exec(),
    '-h': async () => (await import('./help')).exec(),
    '--version': async () => (await import('./version')).exec(),
    '-v': async () => (await import('./version')).exec(),
  };

  // zenn-cli のアップデートが必要な場合はCLI上に通知メッセージを表示する
  await notifyNeedUpdateCLI().catch(console.error);

  if (!commands[execCommandName]) {
    Log.error('該当するCLIコマンドが存在しません');
    console.log(commandListText);
    return;
  }

  commands[execCommandName](execCommandArgs);
}
