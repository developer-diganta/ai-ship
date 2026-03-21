import { push } from '../../utils/git';

export const gitPush = async () => {
  await push();
};
