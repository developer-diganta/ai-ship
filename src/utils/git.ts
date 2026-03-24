import path from 'path';
import asyncExecuter from './asyncExecuter';

export const getGitRoot = async () => {
  const { stdout } = await asyncExecuter('git rev-parse --show-toplevel');
  return stdout.trim();
};

export const getFilesChanged = async () => {
  const { stdout: filesChanged } = await asyncExecuter('git diff --cached --name-status');

  if (!filesChanged.trim()) return [];

  const root = await getGitRoot();

  return filesChanged
    .trim()
    .split('\n')
    .map((line) => {
      const parts = line.split('\t');
      const status = parts[0]?.trim();

      let filePath: string | undefined;

      if (status?.startsWith('R')) {
        // Rename → take NEW path
        filePath = parts[2];
      } else {
        filePath = parts[1];
      }

      if (!filePath) {
        throw new Error(`Invalid git diff line: ${line}`);
      }

      return {
        status,
        file: path.resolve(root, filePath.trim().replace(/^[.\\/]+/, '')),
      };
    });
};

export const stageAll = async () => {
  await asyncExecuter('git add -A');
};

export const stageFiles = async (files: string[]) => {
  if (!files || files.length === 0) return;

  const filesString = files.map((f) => `"${f}"`).join(' ');
  await asyncExecuter(`git add ${filesString}`);
};

export const getStagedDiff = async (files: string[]) => {
  const filesString = files.map((f) => `"${f}"`).join(' ');
  const { stdout } = await asyncExecuter(`git diff --cached -- ${filesString}`);
  return stdout;
};

export const gitFetch = async () => {
  return await asyncExecuter('git fetch --all');
};

export const getAllBranches = async () => {
  const { stdout: raw } = await asyncExecuter('git branch -a');

  const branches = raw
    .split('\\n')
    .map((b) => b.replace('*', '').trim())
    .map((b) => b.replace('remotes/origin/', ''))
    .filter(Boolean);

  return [...new Set(branches)];
};

export const getCurrentBranchName = async () => {
  return (await asyncExecuter('git branch --show-current')).stdout.trim();
};

export const gitCommit = async (message: string) => {
  // Use child_process safely by escaping quotes properly, or just use asyncExecuter
  const escapedMessage = message.replace(/(["'$`\\])/g, '\\\\$1');
  await asyncExecuter(`git commit -m "${escapedMessage}"`);
};

export const gitRenameBranch = async (branchName: string) => {
  await asyncExecuter(`git branch -m "${branchName}"`);
};

export const gitCheckoutNewBranch = async (branchName: string) => {
  await asyncExecuter(`git checkout -b ${branchName}`);
};

export const unstageFiles = async () => {
  await asyncExecuter(`git reset`);
};

export const push = async () => {
  try {
    await asyncExecuter(`git push`);
  } catch {
    const { stdout } = await asyncExecuter(`git rev-parse --abbrev-ref HEAD`);

    const branchName = stdout.trim();

    await asyncExecuter(`git push --set-upstream origin ${branchName}`);
  }
};

export const diffAgainstBranch = async (branch: string) => {
  const { stdout } = await asyncExecuter(`git diff ${branch}...HEAD`);
  return stdout;
};

export const commitHistoryAgainstBranch = async (branch: string) => {
  const { stdout } = await asyncExecuter(`git log ${branch}...HEAD --oneline`);
  return stdout;
};

const fetchOrigin = async () => await asyncExecuter('git fetch origin');
