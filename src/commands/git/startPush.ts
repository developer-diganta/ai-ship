import { push } from '../../utils/git';
import { interactivePushPrompt } from '../../utils/inquirer';

export const gitPush = async () => {
  interactivePushPrompt();
  await push();
};
