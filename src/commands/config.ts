import chalk from 'chalk';
import {
  deleteConfigKey,
  getCurrentConfig,
  jsonConfig,
  log,
  saveValueToConfig,
  verboseConfig,
} from '../utils/helper';
import { askApiKey } from '../utils/inputs';
import type { ParsedArgs } from 'minimist';
type AIShipConfig = Record<string, any>;
export default async (args: ParsedArgs) => {
  // `args` now contains elegantly parsed flags from minimist!
  // Example: `--model --local connection.json` becomes `{ model: true, local: 'connection.json' }`
  // Example: `--user-model local` becomes `{ 'user-model': 'local' }`
  // console.log('args');
  const subCommand = args._[0];
  if (subCommand === 'show') {
    const currenConfigs = getCurrentConfig();
    if (args['verbose']) {
      verboseConfig(currenConfigs);
    } else if (args['json']) {
      jsonConfig(currenConfigs);
    }
    return;
  }

  if (subCommand === 'set') {
    const key = args._[1];
    const value = args._[2];

    if (!key || !value) {
      console.log('Usage: ai-ship config set <key> <value>');
      return;
    }

    saveValueToConfig(key, value);
    return;
  }

  if (subCommand === 'get') {
    const key = args._[1];

    if (!key) {
      console.log(chalk.yellow('Usage: ai-ship config get <key>'));
      return;
    }

    const configValue = getCurrentConfig(key);

    if (configValue === undefined || configValue === null || configValue === '') {
      console.log(chalk.red(`Config "${key}" not found.`));
      return;
    }

    console.log(`${chalk.cyan(key)}: ${chalk.green(JSON.stringify(configValue, null, 2))}`);
    return;
  }
  if (args['add-key']) {
    const apiKey = await askApiKey();
    saveValueToConfig('geminiApiKey', apiKey);
    log('API key saved!');
  } else if (args['delete-key']) {
    if (deleteConfigKey('geminiApiKey')) {
      log(chalk.green('API Key Deleted'));
    } else {
      log(chalk.red('API Key Could Not Be Deleted. API KEY NOT FOUND!'));
    }
  } else {
    log(chalk.yellow('Unrecognized config option. Here are the extracted args for your logic:'));
    console.log(args);
  }
};
