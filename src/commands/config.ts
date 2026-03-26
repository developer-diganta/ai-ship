import { ui } from '../utils/ui';
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
      ui.info('Usage: ai-ship config set <key> <value>');
      return;
    }

    saveValueToConfig(key, value);
    return;
  }

  if (subCommand === 'get') {
    const key = args._[1];

    if (!key) {
      ui.warn('Usage: ai-ship config get <key>');
      return;
    }

    const configValue = getCurrentConfig(key);

    if (configValue === undefined || configValue === null || configValue === '') {
      ui.error(`Config "${key}" not found.`);
      return;
    }

    ui.success(`${key}: ${JSON.stringify(configValue, null, 2)}`);
    return;
  }
  if (args['add-key']) {
    const apiKey = await askApiKey();
    saveValueToConfig('geminiApiKey', apiKey);
    ui.success('API key saved!');
  } else if (args['delete-key']) {
    if (deleteConfigKey('geminiApiKey')) {
      ui.success('API Key Deleted');
    } else {
      ui.error('API Key Could Not Be Deleted. API KEY NOT FOUND!');
    }
  } else {
    ui.warn('Unrecognized config option. Here are the extracted args for your logic:');
    ui.log(JSON.stringify(args, null, 2));
  }
};
