import { CliExecFn } from '../types';
import { getCommandListText } from '../lib/messages';

export const exec: CliExecFn = () => {
  console.log(getCommandListText());
};
