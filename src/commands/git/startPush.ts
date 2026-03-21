import { push } from '../../utils/git';
import { interactivePushPrompt } from '../../utils/inquirer';

export const gitInteractivePush = async () => {
  interactivePushPrompt();
  await push();
};

export const gitDirectPush = async () => {
  await push();
};
