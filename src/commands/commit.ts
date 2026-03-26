import { ui } from '../utils/ui';
import startWorkflow from './git/startWorkflow';
import { stageAll, stageFiles, getFilesChanged, unstageFiles } from '../utils/git';

export default async (payload: string[] = [], flags: any = {}) => {
  if (payload.length > 0) {
    const stageSpinner = ui.spinner('Staging specified files...');
    await unstageFiles();
    await stageFiles(payload);
    stageSpinner.succeed(`Staged ${payload.length} specified file(s).`);
  } else {
    const currentlyStaged = await getFilesChanged();
    if (currentlyStaged.length === 0) {
      const stageSpinner = ui.spinner('Staging all changes...');
      await stageAll();
      stageSpinner.succeed('Staged all changes.');
    } else {
      ui.info(`Using ${currentlyStaged.length} already staged file(s).`);
    }
  }

  await startWorkflow(flags);
};
