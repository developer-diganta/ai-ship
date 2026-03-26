import chalk from 'chalk';
import ora, { Ora } from 'ora';

export const ui = {
  header: (title: string, subtitle?: string) => {
    console.log('');
    const bgBlueTitle = chalk.bold.bgBlue(` ${title} `);
    const blueSubtitle = subtitle ? chalk.bold.blue(` ${subtitle} `) : '';
    console.log(`${bgBlueTitle}${blueSubtitle}`);
    console.log(chalk.dim('─'.repeat(50)));
    console.log('');
  },

  spinner: (text: string): Ora => {
    return ora({
      text: chalk.blue(text),
      spinner: 'dots',
      color: 'cyan',
    }).start();
  },

  success: (msg: string) => {
    console.log(chalk.green(`✔ ${msg}`));
  },

  error: (msg: string) => {
    console.log(chalk.red(`✖ ${msg}`));
  },

  info: (msg: string) => {
    console.log(chalk.cyan(`ℹ ${msg}`));
  },

  warn: (msg: string) => {
    console.log(chalk.yellow(`⚠ ${msg}`));
  },

  dim: (msg: string) => {
    console.log(chalk.dim(msg));
  },

  log: (msg: string) => {
    console.log(msg);
  },

  box: (content: string) => {
    const lines = content.split('\n');
    lines.forEach((line) => console.log(chalk.cyan('│ ') + line));
  },

  newline: () => console.log(''),
};
