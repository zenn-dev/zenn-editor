import { CliExecFn } from '../types';
import * as Log from '../lib/log';
import { execFileCommand } from './file';

// `zenn file --type image` の互換用エイリアス。
// stdoutを読むスクリプトやAIエージェントを壊さないよう、非推奨の案内はstderrにだけ出す
export const exec: CliExecFn = async (argv = []) => {
  Log.warn(
    'zenn image は非推奨です。今後のリリースで削除されるため、zenn file --type image へ移行してください'
  );
  return execFileCommand('image', argv);
};
