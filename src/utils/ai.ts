import { generateWithGemma } from '../ai/ollama';
import { generateWithGemini } from '../ai/gemini';
import {
  buildBranchPrompt,
  buildBranchPromptGemma,
  buildCommitPrompt,
  buildCommitPromptGemma,
} from './prompts';

export const generateAIResponse = async (provider: string, prompt: string) => {
  return provider === 'local' ? await generateWithGemma(prompt) : await generateWithGemini(prompt);
};

export const getCommitPrompt = (provider: string, diffSummary: any[]) => {
  return provider === 'local'
    ? buildCommitPromptGemma(diffSummary)
    : buildCommitPrompt(diffSummary);
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
