const LOCK_FILES = [
  '*.lock',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'Pipfile.lock',
  'poetry.lock',
  'Cargo.lock',
  'composer.lock',
  'Gemfile.lock',
  'go.sum',
];

const BUILD_DIRS = [
  'dist/**',
  'build/**',
  'out/**',
  'target/**',
  'bin/**',
  'obj/**',
  '.next/**',
  '.nuxt/**',
];

const CACHE_DIRS = [
  '.cache/**',
  '.pytest_cache/**',
  '.mypy_cache/**',
  '.gradle/**',
  '.idea/**',
  '.vscode/**',
];

const DEP_DIRS = ['node_modules/**', 'vendor/**', '.venv/**', 'venv/**'];

const TEMP_FILES = ['*.log', '*.tmp', '*.temp', '*.swp'];

const GENERATED_FILES = ['*.map', '*.class', '*.o', '*.pyc', '*.dll', '*.exe'];

export const NOISE_PATTERNS = [
  ...LOCK_FILES,
  ...BUILD_DIRS,
  ...CACHE_DIRS,
  ...DEP_DIRS,
  ...TEMP_FILES,
  ...GENERATED_FILES,
];

import { minimatch } from 'minimatch';

export const isNoiseFile = (file: string) => {
  return NOISE_PATTERNS.some((pattern) => minimatch(file, pattern));
};

export const filterNoiseFiles = (files: string[]) => {
  const meaningful = files.filter((f) => !isNoiseFile(f));
  return meaningful.length ? meaningful : files;
};