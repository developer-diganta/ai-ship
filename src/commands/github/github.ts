import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

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
    try {
      // 🔥 Create temp file for PR body
      const tempFile = path.join(process.cwd(), '.ai-ship-pr.md');
      fs.writeFileSync(tempFile, body);

      // 🔥 Safe args (NO shell)
      const args = [
        'pr',
        'create',
        '--title',
        title,
        '--body-file',
        tempFile,
        '--base',
        base,
        '--head',
        head,
      ];

      const child = spawn('gh', args); // ✅ no shell

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        // 🧹 cleanup temp file
        try {
          fs.unlinkSync(tempFile);
        } catch {}

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
    } catch (err) {
      reject(err);
    }
  });
};
