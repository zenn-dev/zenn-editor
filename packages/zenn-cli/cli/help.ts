import { cliCommand } from '.';
import { commandListText } from './constants';

export const exec: cliCommand = () => {
  console.log(commandListText);
  process.exit(0);
};
