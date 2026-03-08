import startCommit from '../commands/commit/startCommit';
import { stageAll, stageFiles } from './git';

export default async (payload: string[] | undefined) => {
  console.log({ payload });
  if (payload?.length) {
    await stageFiles(payload);
  } else {
    await stageAll();
  }
  await startCommit();
};
