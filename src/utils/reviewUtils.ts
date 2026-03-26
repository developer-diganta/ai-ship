export type ReviewItem = {
  file: string;
  severity: 'critical' | 'warning' | 'suggestion';
  message: string;
};

const KEYWORDS = [
  'if',
  'else',
  'switch',
  'case',
  'for',
  'while',
  'do',
  'try',
  'catch',
  'finally',
  'return',
  'throw',
  'async',
  'await',
  'error',
  'err',
  'null',
  'undefined',
  'function',
  '=>',
  'def ',
  'class ',
  'func ',
  'fetch',
  'axios',
  'http',
  'db',
  'query',
  'sql',
  'env',
  'process',
  'docker',
  'container',
];

export const processDiff = (rawDiff: string): { file: string; patches: string[] }[] => {
  const files = rawDiff.split('diff --git').filter(Boolean);
  const results: { file: string; patches: string[] }[] = [];

  for (const fileChunk of files) {
    const lines = fileChunk.split('\n');
    const fileLine = lines.find((l) => l.startsWith('+++ b/'));
    if (!fileLine) continue;

    const fileName = fileLine.replace('+++ b/', '').trim();

    const hunks = fileChunk.split('@@').slice(1);
    const patches: { patch: string; score: number }[] = [];

    for (let i = 0; i < hunks.length; i += 2) {
      const header = hunks[i];
      const body = hunks[i + 1] || '';

      const patch = `@@${header}@@${body}`;
      const addedLines = body.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));

      if (addedLines.length < 1) continue;
      let score = addedLines.length;

      for (const line of addedLines) {
        if (KEYWORDS.some((k) => line.toLowerCase().includes(k))) {
          score += 2;
        }
      }

      patches.push({ patch, score });
    }

    if (!patches.length) continue;

    results.push({
      file: fileName,
      patches: patches
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((p) => p.patch),
    });
  }

  return results.slice(0, 5);
};

export const parseReview = (text: string): ReviewItem[] => {
  const lines = text.split('\n');

  const results: ReviewItem[] = [];
  let currentFile = '';

  for (const line of lines) {
    const fileMatch = line.match(/\[file:\s*(.*?)\]/i);
    if (fileMatch) {
      currentFile = fileMatch[1];
      continue;
    }

    const itemMatch = line.match(/-\s*\[severity:\s*(.*?)\]\s*(.*)/i);
    if (itemMatch && currentFile) {
      results.push({
        file: currentFile,
        severity: itemMatch[1] as any,
        message: itemMatch[2],
      });
    }
  }

  return results;
};

export const generateHTML = (items: ReviewItem[]) => {
  const grouped: Record<string, ReviewItem[]> = {};

  for (const item of items) {
    if (!grouped[item.file]) grouped[item.file] = [];
    grouped[item.file].push(item);
  }

  return `
<html>
<head>
  <title>AI Review</title>
  <style>
    body { font-family: monospace; background:#0d1117; color:#c9d1d9; padding:20px;}
    .file { margin-bottom:20px;}
    .critical { color:#ff6b6b; }
    .warning { color:#f7b731; }
    .suggestion { color:#2ecc71; }
  </style>
</head>
<body>
<h2>🔍 AI Code Review</h2>

${Object.entries(grouped)
  .map(
    ([file, items]) => `
<div class="file">
<h3>${file}</h3>
<ul>
${items.map((i) => `<li class="${i.severity}">[${i.severity}] ${i.message}</li>`).join('')}
</ul>
</div>
`,
  )
  .join('')}

</body>
</html>
`;
};
