import { ui } from '../../utils/ui';
import { push } from '../../utils/git';
import { interactivePushPrompt } from '../../utils/inquirer';

export const gitInteractivePush = async (): Promise<boolean> => {
  const result = await interactivePushPrompt();
  if (result.accepted) {
    const pushSpinner = ui.spinner('Pushing changes...');
    await push();
    pushSpinner.succeed('Changes pushed to remote repository.\n');
    return true;
  }
  return false;
};

export const gitDirectPush = async (): Promise<boolean> => {
  const pushSpinner = ui.spinner('Pushing changes...');
  await push();
  pushSpinner.succeed('Changes pushed to remote repository.\n');
  return true;
};
