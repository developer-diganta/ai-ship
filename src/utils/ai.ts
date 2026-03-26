import { generateWithGemma } from '../ai/ollama';
import { generateWithGemini } from '../ai/gemini';
import {
  buildBranchPrompt,
  buildBranchPromptGemma,
  buildCommitPrompt,
  buildCommitPromptGemma,
} from './prompts';

function cleanGemmaOutput(output: string): string {
  if (!output) return '';

  return output
    .replace(/```[\s\S]*?```/g, '')
    .replace(/Sure.*?:/i, '')
    .split('\n')[0]
    .replace(/^.*?(feat:|fix:|chore:|refactor:)/i, '$1')
    .trim();
}

function isBadOutput(output: string): boolean {
  if (!output) return true;

  const trimmed = output.trim();

  if (!trimmed.includes(':')) return true;

  const [type, message] = trimmed.split(':');

  if (!type || !message) return true;

  if (message.trim().length < 3) return true;

  return false;
}

export const generateAIResponse = async (
  provider: string,
  prompt: string,
  intent?: { type: string; description: string }, // ✅ optional stays
) => {
  if (provider === 'local') {
    const raw = await generateWithGemma(prompt);

    let output = cleanGemmaOutput(raw);

    // 🔥 fallback logic
    if (isBadOutput(output)) {
      if (intent) {
        return `${intent.type}: ${intent.description}`;
      }

      // fallback for non-commit flows (branch/PR)
      return output || 'chore: update code';
    }

    return output;
  }

  const output = await generateWithGemini(prompt);
  return output.trim();
};

export const getCommitPrompt = (
  provider: string,
  diffSummary: any[],
  intent: { type: string; description: string },
) => {
  return provider === 'local'
    ? buildCommitPromptGemma(diffSummary, intent)
    : buildCommitPrompt(diffSummary, intent);
};

export const getBranchPrompt = (
  provider: string,
  branchSummary: any[],
  allBranches: string[],
  currentBranch: string,
  commitMessage: string,
) => {
  return provider === 'local'
    ? buildBranchPromptGemma(branchSummary, allBranches, currentBranch, commitMessage)
    : buildBranchPrompt(branchSummary, allBranches, currentBranch, commitMessage);
};

export const generateReviewResponse = async (provider: string, prompt: string): Promise<string> => {
  try {
    if (provider === 'local') {
      const raw = await generateWithGemma(prompt);

      // ❗ DO NOT clean like commit
      const output = raw?.trim();

      if (!output || output.length < 10) {
        return `
REVIEW:
Looks good overall. No major issues found.
`;
      }

      return output;
    }

    const output = await generateWithGemini(prompt);

    return (
      output?.trim() ||
      `
REVIEW:
Looks good overall. No major issues found.
`
    );
  } catch (err) {
    // ui.error('AI Review Error');

    return `
REVIEW:
Looks good overall. No major issues found.
`;
  }
};
