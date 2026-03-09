import fs from 'fs';
import path from 'path';

type FileChange = {
  status: string;
  file: string;
};

export const expandDirectories = (files: FileChange[]): FileChange[] => {
  const expanded: FileChange[] = [];

  files.forEach(({ status, file }) => {
    if (fs.existsSync(file) && fs.lstatSync(file).isDirectory()) {
      const subFiles = fs.readdirSync(file);

      subFiles.forEach((subFile) => {
        const fullPath = path.join(file, subFile);

        expanded.push({
          status,
          file: fullPath,
        });
      });
    } else {
      expanded.push({ status, file });
    }
  });

  return expanded;
};

export const getFileCategory = (file: string) => {
  const ext = file.split('.').pop()?.toLowerCase();

  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'cs'].includes(ext || ''))
    return 'code';

  if (['html', 'css', 'scss', 'less'].includes(ext || '')) return 'markup';

  if (['json', 'yaml', 'yml', 'toml'].includes(ext || '') || file === 'Dockerfile') return 'config';

  return 'other';
};
