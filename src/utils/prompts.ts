export const buildCommitPrompt = (summary: any[]) => {
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
Generate a conventional commit message.

Rules:
- one line
- under 72 characters
- conventional commit format

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

export const buildCommitPromptGemma = (summary: any[]) => {
  const formatted = summary
    .map(
      (s) => `
File: ${s.file}
Additions: ${s.additions}
Deletions: ${s.deletions}
Signals: ${s.signals.join(', ')}
`,
    )
    .join('\n');

  return `
You generate git commit messages.

Task:
Write a Conventional Commit message describing the changes.

Rules:
- one line only
- under 72 characters
- imperative tense
- lowercase commit type
- no explanation
- no additional text

Format:
type: message

Examples:
feat: add commit generation using AI
fix: correct git diff parsing
refactor: simplify diff analyzer logic
chore: update dependencies

Changes:
${formatted}

Output exactly one line like:
feat: add ollama integration
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
