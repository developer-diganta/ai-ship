#!/usr/bin/env node
import 'dotenv/config';
import minimist from 'minimist';
import runConfig from './commands/config';
import runCommit from './commands/commit';
import chalk from 'chalk';
import { startReview } from './commands/git/startReview';
import { detectRemoteHost } from './utils/helper';
import { createGitlabMR } from './commands/gitlab/gitlab';
import { ui } from './utils/ui';
const startCommandExecution = async () => {
  const args = minimist(process.argv.slice(2));

  const command = args._[0];

  const subArgs = {
    ...args,
    _: args._.slice(1),
  };

  ui.header('🚀 AI-SHIP', 'Git Intelligence CLI');

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
      ui.error('Unknown command');
  }

  ui.newline();
};

startCommandExecution();
// (async () => console.log(await createGitlabMR()))();
