import * as Log from '../lib/log';
import { commandListText } from '../lib/messages';
import { notifyNeedUpdateCLI } from '../lib/notify-update';
import { CliExecFn } from '../types';
import * as preview from './preview';
import * as init from './init';
import * as newArticle from './new-article';
import * as newBook from './new-book';
import * as listArticles from './list-articles';
import * as listBooks from './list-books';
import * as help from './help';
import * as version from './version';

type Commands = { [command: string]: CliExecFn };
type ExecOptions = { canNotifyUpdate: boolean };

export async function exec(
  execCommandName: string,
  execCommandArgs: string[],
  options: ExecOptions = { canNotifyUpdate: false }
) {
  const commands: Commands = {
    preview: async () => preview.exec(),
    init: async () => init.exec(),
    'new:article': async () => newArticle.exec(),
    'new:articles': async () => newArticle.exec(),
    'new:book': async () => newBook.exec(),
    'new:books': async () => newBook.exec(),
    'list:articles': async () => listArticles.exec(),
    'list:books': async () => listBooks.exec(),
    '--help': async () => help.exec(),
    '-h': async () => help.exec(),
    '--version': async () => version.exec(),
    '-v': async () => version.exec(),
  };

  if (options.canNotifyUpdate) {
    // zenn-cli のアップデートが必要な場合はCLI上に通知メッセージを表示する
    await notifyNeedUpdateCLI().catch(() => void 0);
  }

  if (!commands[execCommandName]) {
    Log.error('該当するCLIコマンドが存在しません');
    console.log(commandListText);
    return;
  }

  commands[execCommandName](execCommandArgs);
}
