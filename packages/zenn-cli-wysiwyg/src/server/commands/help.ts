import { CliExecFn } from '../types';
import { commandListText } from '../lib/messages';

export const exec: CliExecFn = () => {
  console.log(commandListText);
};
