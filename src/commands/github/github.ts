import { spawn } from 'child_process';

export const createPR = async ({
  title,
  body,
  base = 'main',
  head,
}: {
  title: string;
  body: string;
  base?: string;
  head: string;
}): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const args = ['pr', 'create', '--title', title, '--body', body, '--base', base, '--head', head];
    const child = spawn('gh', args, { shell: process.platform === 'win32' });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`Command failed: gh pr create\n${stderr}`);
        (error as any).stdout = stdout;
        (error as any).stderr = stderr;
        reject(error);
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
};
