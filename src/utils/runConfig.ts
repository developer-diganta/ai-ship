import chalk from 'chalk';
import { deleteApiKey, log, saveApiKey } from './helper';
import { askApiKey } from './inputs';

export default async (action: string) => {
  switch (action) {
    case '--add-key':
      const apiKey = await askApiKey();
      saveApiKey(apiKey);
      log('API key saved!');
      break;
    case '--delete-key':
      if (deleteApiKey()) {
        log(chalk.green('API Key Deleted'));
      } else {
        log(chalk.red('API Key Could Not Be Deleted. API KEY NOT FOUND!'));
      }
      break;
  }
};
