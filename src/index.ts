#!/usr/bin/env node
import 'dotenv/config';
import minimist from 'minimist';
import runConfig from './commands/config';
import runCommit from './commands/commit';
import chalk from 'chalk';

const startCommandExecution = async () => {
  const args = minimist(process.argv.slice(2));

  const command = args._[0];

  const subArgs = {
    ...args,
    _: args._.slice(1),
  };
  console.log('');
  console.log(chalk.bold.bgBlue(' 🚀 AI-SHIP ') + chalk.bold.blue(' Commit Generator '));
  console.log(chalk.dim('==================================='));
  console.log('');

  switch (command) {
    case 'commit':
      const { _, ...flags } = subArgs;
      await runCommit(_, flags);
      break;

    case 'config':
      await runConfig(subArgs);
      break;

    // case 'pr':
    //   await run
    default:
      console.log('Unknown command');
  }
  console.log('');
};

startCommandExecution();
