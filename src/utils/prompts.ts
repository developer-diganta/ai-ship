export const buildCommitPrompt = (
  summary: any[],
  intent: { type: string; description: string },
) => {
  const formatted = summary
    .map(
      (s) => `
File: ${s.file}
+${s.additions} -${s.deletions}
Signals: ${s.signals.join(', ')}

Snippet:
${s.snippet.join('\n')}
`,
    )
    .join('\n');

  return `
You are a senior software engineer.

Detected intent:
Type: ${intent.type}
Description: ${intent.description}

Generate a conventional commit message.

Rules:
- one line
- under 72 characters
- format: <type>: <message>
- use the detected type unless clearly wrong
- be specific (mention actual feature/file if possible)
- DO NOT hallucinate
- no markdown, no quotes

Changes:
${formatted}
`;
};

type BranchSummary = {
  file: string;
  signals: string[];
};

export const buildBranchPrompt = (
  summary: BranchSummary[],
  existingBranches: string[],
  currentBranch: string,
  commitMessage: string,
) => {
  const changeList = summary
    .map((s, i) => {
      const signals = s.signals.length ? s.signals.join(', ') : 'code change';
      return `${i + 1}. ${s.file} : ${signals}`;
    })
    .join('\n');

  const branchList = existingBranches.slice(0, 30).join('\n'); // limit tokens

  return `
You are a Git expert.

Generate a short git branch name that summarizes the main intent of the change.
Focus on the most important modification.

Rules:
- use kebab-case
- max 40 characters
- prefix with:
  feature/
  fix/
  refactor/
  chore/
  docs/
- avoid existing branch names
- return ONLY the branch name
- no explanation
- no quotes

Current commit message:
${commitMessage}

Current branch:
${currentBranch}

Existing branches:
${branchList}

Changes:
${changeList}

Examples:
feature/add-commit-generator
fix/git-diff-parser
refactor/commit-analysis-pipeline
chore/update-config
docs/update-readme
`;
};

export const buildCommitPromptGemma = (
  summary: any[],
  intent: { type: string; description: string },
) => {
  const files = summary.map((s) => s.file).join(', ');

  const keySignals = summary
    .flatMap((s) => s.signals)
    .slice(0, 5)
    .join(', ');

  return `
Write a git commit message.

Type: ${intent.type}
Description: ${intent.description}

Files: ${files}
Changes: ${keySignals}

Rules:
- one line only
- format: <type>: <message>
- MUST use given type
- mention specific file or function if possible
- do NOT repeat previous answers

Output:
`;
};

export const buildBranchPromptGemma = (
  summary: BranchSummary[],
  existingBranches: string[],
  currentBranch: string,
  commitMessage: string,
) => {
  const changeList = summary
    .map((s, i) => {
      const signals = s.signals.length ? s.signals.join(', ') : 'code change';
      return `${i + 1}. ${s.file}: ${signals}`;
    })
    .join('\n');

  const branchList = existingBranches.slice(0, 30).join('\n');

  return `
  Context ID: ${Date.now()}
You generate git branch names.

Goal:
Create a concise branch name describing the change.

Rules:
- kebab-case
- max 40 characters
- must start with:
  feature/
  fix/
  refactor/
  chore/
  docs/
- do not match existing branches
- no explanation
- no quotes

Commit message:
${commitMessage}

Current branch:
${currentBranch}

Existing branches:
${branchList}

Changed files:
${changeList}

Output format:
feature/branch-name

Examples:
feature/add-commit-generator
fix/git-diff-parser
refactor/commit-analysis-pipeline
chore/update-config
docs/update-readme

Return ONLY the branch name.
`;
};

export const pRPrompt = ({
  commitMessage,
  branchName,
  summary,
}: {
  commitMessage: string;
  branchName: string;
  summary: any;
}) => {
  return `
You are an expert software engineer.

Based on the following code changes, generate a high-quality pull request.

Inputs:
- Commit message: ${commitMessage}
- Branch name: ${branchName}
- File changes:
${JSON.stringify(summary, null, 2)}

Instructions:
- Write a clear and concise PR title
- Write a structured PR description
- Do NOT include unnecessary explanations
- Do NOT repeat the same information
- Keep it professional and minimal
- Keep total description under 120 words

Output format:

TITLE:
<one-line PR title>

DESCRIPTION:
## Summary
<what this PR does>

## Changes
<bullet list of key changes>

## Notes
<optional, only if needed>
`;
};

export type ReviewFilePatch = {
  file: string;
  patches: string[];
};

export const buildReviewPrompt = (files: ReviewFilePatch[], commits: string[]) => `
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
`
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
