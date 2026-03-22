import ora from 'ora';
import { push } from '../../utils/git';
import { interactivePushPrompt } from '../../utils/inquirer';

export const gitInteractivePush = async () => {
  const result = await interactivePushPrompt();
  if (result.accepted) {
    const pushSpinner = ora('Pushing changes...').start();
    await push();
    pushSpinner.succeed('Changes pushed to remote repository.\n');
  }
};

export const gitDirectPush = async () => {
  const pushSpinner = ora('Pushing changes...').start();
  await push();
  pushSpinner.succeed('Changes pushed to remote repository.\n');
};
