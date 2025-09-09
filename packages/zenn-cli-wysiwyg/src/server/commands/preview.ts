import arg from 'arg';
import { createApp } from '../app';
import { startServer, startLocalChangesWatcher } from '../lib/server';
import * as Log from '../lib/log';
import { getWorkingPath } from '../lib/helper';
import { invalidOptionText, previewHelpText } from '../lib/messages';
import { CliExecFn } from '../types';

function parseArgs(argv?: string[]) {
  try {
    return arg(
      {
        // Types
        '--port': Number,
        '--no-watch': Boolean,
        '--open': Boolean,
        '--help': Boolean,
        '--host': String,

        // Alias
        '-p': '--port',
        '-h': '--help',
      },
      { argv }
    );
  } catch (e: any) {
    if (e.code === 'ARG_UNKNOWN_OPTION') {
      Log.error(invalidOptionText);
    } else {
      Log.error(e);
    }
    console.log(previewHelpText);
    return null;
  }
}

export const exec: CliExecFn = async (argv) => {
  const args = parseArgs(argv);
  if (args === null) return;

  if (args['--help']) {
    console.log(previewHelpText);
    return;
  }

  const shouldWatch = args['--no-watch'] !== true;
  const options = {
    app: createApp(),
    port: args['--port'] || 8000,
    shouldOpen: args['--open'] === true,
    hostname: args['--host'],
  };

  const server = await startServer(options);

  if (shouldWatch) {
    await startLocalChangesWatcher(
      server,
      `${getWorkingPath('')}/{articles,books}/**/*`
    );
  }
};
