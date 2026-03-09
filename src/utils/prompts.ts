export const fileNameBasedCommitPrompt = (filesnames: any[]) => `Generate a git commit message.
Files changed:
${filesnames.map((f) => `- ${f}`).join('\n')}

Rules:
- conventional commit format
- one line only
- under 72 characters
- do not explain
`;

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
