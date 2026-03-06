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
