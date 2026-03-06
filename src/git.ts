import asyncExecuter from './utils/asyncExecuter';

export const getFilesChanged = async () => {
  const { stdout } = await asyncExecuter('git status --porcelain');
  if (!stdout.trim()) return [];

  return stdout
    .trim()
    .split('\n')
    .map((line) => ({
      status: line.slice(0, 2).trim(),
      file: line.slice(3),
    }))
    .filter(({ file }) => file);
};
