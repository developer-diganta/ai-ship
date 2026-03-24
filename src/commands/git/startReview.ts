import chalk from 'chalk';
import { log } from 'node:console';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import open from 'open';

import { commitHistoryAgainstBranch, diffAgainstBranch, gitFetch } from '../../utils/git';

import { generateAIResponse, generateReviewResponse } from '../../utils/ai'; // 👈 your existing
import { getProvider } from '../../utils/helper';

// ================= TYPES =================
type FilePatch = {
  file: string;
  patches: string[];
};

type ReviewItem = {
  file: string;
  severity: 'critical' | 'warning' | 'suggestion';
  message: string;
};

// ================= PROCESS DIFF =================
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

export const processDiff = (rawDiff: string): FilePatch[] => {
  const files = rawDiff.split('diff --git').filter(Boolean);
  const results: FilePatch[] = [];

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

      if (addedLines.length < 3) continue;

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

// ================= PROMPT =================
const buildPrompt = (files: FilePatch[], commits: string[]) => `
You are a senior engineer reviewing code.

Focus ONLY on bugs, edge cases, bad practices.

Be concise.

Commits:
${commits.join('\n')}

${files
  .map(
    (f) => `
File: ${f.file}
${f.patches.join('\n')}
`,
  )
  .join('\n')}

Output:

REVIEW:
[file: <filename>]
- [severity: critical|warning] issue

OPTIONAL IMPROVEMENTS:
[file: <filename>]
- suggestion
`;

// ================= PARSER =================
const parseReview = (text: string): ReviewItem[] => {
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

// ================= HTML =================
const generateHTML = (items: ReviewItem[]) => {
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

// ================= START =================
export const startReview = async (flags: any = {}) => {
  try {
    const base = flags._?.[0];
    if (!base) {
      log(chalk.yellow('Please provide base branch'));
      return;
    }

    const spinner = ora('Preparing review...').start();

    await gitFetch();

    const rawDiff = await diffAgainstBranch(base);
    if (!rawDiff.trim()) {
      spinner.stop();
      log(chalk.yellow('No changes to review'));
      return;
    }

    const rawCommits = await commitHistoryAgainstBranch(base);
    const commits = rawCommits.trim().split('\n').filter(Boolean);

    const processed = processDiff(rawDiff);

    const runProvider = await getProvider();
    let allResults: ReviewItem[] = [];

    for (const batch of [processed.slice(0, 2), processed.slice(2, 5)]) {
      if (!batch.length) continue;

      const prompt = buildPrompt(batch, commits);

      const response = await generateReviewResponse(runProvider, prompt);

      const parsed = parseReview(response);
      allResults.push(...parsed);
    }

    spinner.succeed('Review generated');

    // 🔥 HTML
    const html = generateHTML(allResults);
    const filePath = path.join(process.cwd(), 'ai-ship-review.html');

    fs.writeFileSync(filePath, html);

    log(chalk.green('\n📄 Opening review in browser...\n'));

    await open(filePath);
  } catch (err: any) {
    console.log(err);
    log(chalk.red(`Review failed: ${err?.message || err}`));
  }
};
