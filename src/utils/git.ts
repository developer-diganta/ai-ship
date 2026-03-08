import asyncExecuter from './asyncExecuter';
export const getFilesChanged = async () => {
  const { stdout } = await asyncExecuter('git diff --cached --name-status');

  if (!stdout.trim()) return [];

  return stdout
    .trim()
    .split('\n')
    .map((line) => {
      const [status, file] = line.split('\t');

      return {
        status: status.trim(),
        file: file.trim().replace(/^[.\\/]+/, ''),
      };
    });
};
export const stageAll = async () => {
  await asyncExecuter('git add .');
};

export const stageFiles = async (files: string[]) => {
  if (!files || files.length === 0) return;

  const filesString = files.map((f) => `"${f}"`).join(' ');
  console.log({ filesString });
  await asyncExecuter(`git add ${filesString}`);
};
