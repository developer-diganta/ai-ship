import { detectSignals } from './detectSignals';
import analyzeMarkup from './markupAnalyzer';
import analyzeConfig from './configAnalyzer';

type DiffSummary = {
  file: string;
  additions: number;
  deletions: number;
  signals: string[];
  snippet: string[];
};

const CODE_EXT = [
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.java',
  '.go',
  '.rs',
  '.cpp',
  '.c',
  '.h',
  '.hpp',
  '.cs',
  '.php',
  '.rb',
];

const MARKUP_EXT = ['.html', '.css', '.scss', '.less'];

const CONFIG_EXT = ['.json', '.yaml', '.yml', '.toml'];

const getFileType = (file: string) => {
  const lower = file.toLowerCase();

  if (CODE_EXT.some((ext) => lower.endsWith(ext))) return 'code';

  if (MARKUP_EXT.some((ext) => lower.endsWith(ext))) return 'markup';

  if (
    CONFIG_EXT.some((ext) => lower.endsWith(ext)) ||
    lower === 'dockerfile' ||
    lower.includes('package.json')
  )
    return 'config';

  return 'other';
};

export const analyzeDiff = (diff: string): DiffSummary[] => {
  const files = diff.split('diff --git').filter(Boolean);

  const summaries: DiffSummary[] = [];

  for (const chunk of files) {
    const lines = chunk.split('\n');

    const fileMatch = lines[0]?.match(/a\/(.+?) b\/(.+)/);
    const file = fileMatch?.[2] || 'unknown';

    const fileType = getFileType(file);

    if (fileType === 'markup') {
      summaries.push(analyzeMarkup(file, lines));
      continue;
    }

    if (fileType === 'config') {
      summaries.push(analyzeConfig(file, lines));
      continue;
    }

    // default = code analyzer
    let additions = 0;
    let deletions = 0;

    const snippet: string[] = [];
    const signals: string[] = [];

    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        additions++;

        const code = line.slice(1).trim();

        if (snippet.length < 20) snippet.push(`+ ${code}`);

        detectSignals(code, signals);
      }

      if (line.startsWith('-') && !line.startsWith('---')) {
        deletions++;

        const code = line.slice(1).trim();

        if (snippet.length < 20) snippet.push(`- ${code}`);
      }
    }

    summaries.push({
      file,
      additions,
      deletions,
      signals: [...new Set(signals)],
      snippet,
    });
  }

  return summaries;
};
