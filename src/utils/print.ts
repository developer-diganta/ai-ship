import chalk from 'chalk';
import { log } from './helper';

export const printFileList = (filesList: { status: string; file: string }[]) => {
  filesList.forEach(({ status, file }) => {
    if (status === '??' || status === 'A') {
      log(chalk.green(file));
    } else if (status === 'M') {
      log(chalk.yellow(file));
    } else if (status === 'D') {
      log(chalk.red(file));
    } else {
      log(file);
    }
  });
};
