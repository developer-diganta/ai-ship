export type ReviewItem = {
  file: string;
  severity: 'critical' | 'warning' | 'suggestion';
  message: string;
};

export type SignalType =
  | 'function_added'
  | 'condition_added'
  | 'loop_added'
  | 'api_call'
  | 'db_query'
  | 'error_handling'
  | 'env_usage'
  | 'unknown';

export type Signal = {
  type: SignalType;
  file: string;
  weight: number;
  context: string;
};

/* -------------------- SIGNAL DETECTION -------------------- */

export const detectSignals = (line: string, file: string): Signal[] => {
  const signals: Signal[] = [];
  const l = line.trim().toLowerCase();

  // --- CONDITIONS (multi-language) ---
  if (/\bif\b/.test(l) || /\belse if\b/.test(l)) {
    signals.push({
      type: 'condition_added',
      file,
      weight: 3,
      context: line,
    });
  }

  // --- LOOPS ---
  if (/\bfor\b/.test(l) || /\bwhile\b/.test(l)) {
    signals.push({
      type: 'loop_added',
      file,
      weight: 2,
      context: line,
    });
  }

  // --- FUNCTIONS ---
  if (
    /\bfunction\b/.test(l) ||
    /=>/.test(l) ||
    /\bdef\b/.test(l) ||
    /\bfunc\b/.test(l)
  ) {
    signals.push({
      type: 'function_added',
      file,
      weight: 3,
      context: line,
    });
  }

  // --- API CALLS ---
  if (/\b(fetch|axios)\b/.test(l) || /\bhttp\b.*\(/.test(l)) {
    signals.push({
      type: 'api_call',
      file,
      weight: 3,
      context: line,
    });
  }

  // --- DATABASE ---
  if (/\b(db|query|sql)\b/.test(l)) {
    signals.push({
      type: 'db_query',
      file,
      weight: 4,
      context: line,
    });
  }

  // --- ERROR HANDLING ---
  if (/\btry\b/.test(l) || /\bcatch\b/.test(l) || /\berr\b/.test(l)) {
    signals.push({
      type: 'error_handling',
      file,
      weight: 4,
      context: line,
    });
  }

  // --- ENV ---
  if (/\bprocess\.env\b|\benv\b/.test(l)) {
    signals.push({
      type: 'env_usage',
      file,
      weight: 3,
      context: line,
    });
  }

  return signals;
};

/* -------------------- DIFF PROCESSING -------------------- */

export const processDiff = (
  rawDiff: string
): { file: string; patches: string[]; signals: Signal[] }[] => {
  const files = rawDiff.split('diff --git').filter(Boolean);

  const results: {
    file: string;
    patches: string[];
    signals: Signal[];
  }[] = [];

  for (const fileChunk of files) {
    if (fileChunk.includes('Subproject commit')) continue;

    const lines = fileChunk.split('\n');
    const fileLine = lines.find((l) => l.startsWith('+++ b/'));
    if (!fileLine) continue;

    const fileName = fileLine.replace('+++ b/', '').trim();

    const hunks = fileChunk.split('@@').slice(1);

    const patches: { patch: string; score: number; signals: Signal[] }[] = [];

    for (let i = 0; i < hunks.length; i += 2) {
      const header = hunks[i];
      const body = hunks[i + 1] || '';

      const patch = `@@${header}@@${body}`;

      const addedLines = body
        .split('\n')
        .filter((l) => l.startsWith('+') && !l.startsWith('+++'));

      if (addedLines.length < 1) continue;

      let score = addedLines.length;
      const patchSignals: Signal[] = [];

      for (const line of addedLines) {
        const signals = detectSignals(line, fileName);
        patchSignals.push(...signals);
        score += signals.reduce((acc, s) => acc + s.weight, 0);
      }

      patches.push({ patch, score, signals: patchSignals });
    }

    if (!patches.length) continue;

    const topPatches = patches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const uniqueSignals = Array.from(
      new Map(
        topPatches
          .flatMap((p) => p.signals)
          .map((s) => [s.type + s.context, s])
      ).values()
    );

    results.push({
      file: fileName,
      patches: topPatches.map((p) => p.patch),
      signals: uniqueSignals,
    });
  }

  return results.slice(0, 5);
};

/* -------------------- AI INPUT BUILDER -------------------- */

export const buildAIInput = (
  processed: ReturnType<typeof processDiff>
): string => {
  return processed
    .map((file) => {
      const signalCounts = file.signals.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const signalSummary = Object.entries(signalCounts)
        .map(([type, count]) => `${type}(${count})`)
        .join(', ');

      return `
[file: ${file.file}]

signals: ${signalSummary || 'none'}

patches:
${file.patches.join('\n\n')}
`;
    })
    .join('\n\n');
};

/* -------------------- REVIEW PARSER -------------------- */

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

/* -------------------- HTML GENERATOR -------------------- */

export const generateHTML = (items: ReviewItem[]) => {
  const grouped: Record<string, ReviewItem[]> = {};
  let critical = 0,
    warning = 0,
    suggestion = 0;

  for (const item of items) {
    if (!grouped[item.file]) grouped[item.file] = [];
    grouped[item.file].push(item);

    if (item.severity === 'critical') critical++;
    else if (item.severity === 'warning') warning++;
    else suggestion++;
  }

  return `
<html>
<head>
  <title>AI Review</title>
  <style>
    body {
      font-family: monospace;
      background:#0d1117;
      color:#c9d1d9;
      padding:20px;
    }
    .file {
      margin-bottom:20px;
      border:1px solid #30363d;
      padding:10px;
      border-radius:8px;
    }
    .critical { color:#ff6b6b; }
    .warning { color:#f7b731; }
    .suggestion { color:#2ecc71; }
    .summary {
      margin-bottom:20px;
      font-size:16px;
    }
  </style>
</head>
<body>

<h2>🔍 AI Code Review</h2>

<div class="summary">
🔴 ${critical} Critical &nbsp;
🟡 ${warning} Warnings &nbsp;
🟢 ${suggestion} Suggestions
</div>

${Object.entries(grouped)
  .map(
    ([file, items]) => `
<div class="file">
<h3>${file}</h3>
<ul>
${items
  .map(
    (i) =>
      `<li class="${i.severity}">[${i.severity}] ${i.message}</li>`
  )
  .join('')}
</ul>
</div>
`
  )
  .join('')}

</body>
</html>
`;
};