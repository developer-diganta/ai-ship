import ora from 'ora';
import chalk from 'chalk';
import { pRPrompt } from '../../utils/prompts';
import { getCurrentBranchName } from '../../utils/git';
import { createPR } from '../github/github';
import { log } from '../../utils/helper';
import { generateAIResponse } from '../../utils/ai';

export const startPR = async ({
  diffSummary,
  commitMessage,
  provider,
  flags,
}: {
  diffSummary: any;
  commitMessage: string;
  provider: any;
  flags: any;
}) => {
  try {
    const spinner = ora('Generating PR...').start();

    const branchName = await getCurrentBranchName();

    const prompt = pRPrompt({
      commitMessage,
      branchName,
      summary: diffSummary,
    });

    const response = await generateAIResponse(provider, prompt);

    spinner.succeed('PR content generated.\n');

    // 🔥 Parse response
    const titleMatch = response.match(/TITLE:\s*(.*)/);
    const descriptionMatch = response.match(/DESCRIPTION:\s*([\s\S]*)/);

    if (!titleMatch || !descriptionMatch) {
      throw new Error('Failed to parse PR output');
    }

    const title = titleMatch[1].trim();
    const body = descriptionMatch[1].trim();

    const createSpinner = ora('Creating PR...').start();

    const targetBranch = flags['target-branch'] || flags['base'] || 'main';

    const prResult = await createPR({
      title,
      body,
      head: branchName,
      base: targetBranch,
    });

    createSpinner.succeed(chalk.green('PR created successfully!\n'));

    if (prResult.stdout && prResult.stdout.trim()) {
      console.log(chalk.blue(`🔗 PR Link: ${prResult.stdout.trim()}\n`));
    }
  } catch (err) {
    console.log(err);
    log(chalk.red(`PR generation failed: ${err}`));
  }
};
