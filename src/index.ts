#!/usr/bin/env node
import 'dotenv/config';
import runConfig from './utils/runConfig';
import startCommit from './commands/commit/startCommit';
import runCommit from './utils/runCommit';

const startCommandExecution = async () => {
  const args = process.argv.slice(2);

  const command = args[0];
  console.log({ command });

  switch (command) {
    case 'commit':
      await runCommit(args.slice(1));
      break;

    case 'config':
      await runConfig(args.slice(1)[0]);
      break;

    default:
      await startCommit();
  }
};

startCommandExecution();
