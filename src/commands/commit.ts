import ora from 'ora';
import startWorkflow from './git/startWorkflow';
import { stageAll, stageFiles } from '../utils/git';

export default async (payload: string[] = [], flags: any = {}) => {
  const stageSpinner = ora('Staging files...').start();
  if (payload.length > 0) {
    await stageFiles(payload);
    stageSpinner.succeed(`Staged ${payload.length} specified file(s).`);
  } else {
    await stageAll();
    stageSpinner.succeed('Staged all changes.');
  }

  console.log('');

  await startWorkflow(flags);
};
