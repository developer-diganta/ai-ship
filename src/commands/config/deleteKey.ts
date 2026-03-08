import chalk from 'chalk';
import { deleteApiKey, log } from '../../utils/helper';

export default () => {
  if (deleteApiKey()) {
    log(chalk.green('API Key Deleted'));
  } else {
    log(chalk.red('API Key Could Not Be Deleted. API KEY NOT FOUND!'));
  }
};
