import { CliExecFn } from '../types';
import { getCurrentCliVersion } from '../lib/helper';
import * as Log from '../lib/log';

export const exec: CliExecFn = () => {
  const version = getCurrentCliVersion();
  if (!version) {
    Log.error('zenn-cliのバージョンを取得できませんでした');
    return;
  }
  console.log(version);
};
