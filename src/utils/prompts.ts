export const fileNameBasedCommitPrompt = (filesnames: any[]) => `Generate a git commit message.
Files changed:
${filesnames.map((f) => `- ${f}`).join('\n')}

Rules:
- conventional commit format
- one line only
- under 72 characters
- do not explain
`;
