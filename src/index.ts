#!/usr/bin/env node
import 'dotenv/config';
import minimist from 'minimist';
import runConfig from './commands/config';
import runCommit from './commands/commit';
import chalk from 'chalk';
import { startReview } from './commands/git/startReview';

const startCommandExecution = async () => {
  const args = minimist(process.argv.slice(2));

  const command = args._[0];

  const subArgs = {
    ...args,
    _: args._.slice(1),
  };

  console.log('');
  console.log(chalk.bold.bgBlue(' 🚀 AI-SHIP ') + chalk.bold.blue(' Git Intelligence CLI '));
  console.log(chalk.dim('==================================='));
  console.log('');

  switch (command) {
    case 'commit': {
      const { _, ...flags } = subArgs;
      await runCommit(_, flags);
      break;
    }

    case 'review': {
      await startReview(subArgs); // 👈 here
      break;
    }

    case 'config': {
      await runConfig(subArgs);
      break;
    }

    default:
      console.log(chalk.red('Unknown command'));
  }

  console.log('');
};

startCommandExecution();
