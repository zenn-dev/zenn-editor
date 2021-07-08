#!/usr/bin/env node

// This file is called from npm bin script. Refer package.json

import arg from 'arg';
import { exec } from './commands';

const args = arg(
  {},
  {
    permissive: true,
  }
);
const execCommandName = args._[0] || 'preview';
const execCommandArgs = args._.slice(1);

// call command
exec(execCommandName, execCommandArgs);
