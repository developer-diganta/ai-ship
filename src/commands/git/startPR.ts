import chalk from 'chalk';
import { ui } from '../../utils/ui';
import { pRPrompt } from '../../utils/prompts';
import { getCurrentBranchName } from '../../utils/git';
import { createPR } from '../github/github';
import { detectRemoteHost, log } from '../../utils/helper';
import { generateAIResponse } from '../../utils/ai';
import { createGitlabMR } from '../gitlab/gitlab';

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
    const spinner = ui.spinner('Generating PR...');

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

    const createSpinner = ui.spinner('Creating PR...');

    const targetBranch = flags['target-branch'] || flags['base'] || 'main';

    let prResult: any = null;
    let prLink = '';
    const remoteHost = await detectRemoteHost();

    if (remoteHost === 'github') {
      prResult = await createPR({
        title,
        body,
        head: branchName,
        base: targetBranch,
      });
      prLink = prResult.stdout?.trim() || '';
      createSpinner.succeed('GitHub PR created successfully!\n');
    } else if (remoteHost === 'gitlab') {
      prResult = await createGitlabMR({
        title,
        description: body,
        sourceBranch: branchName,
        targetBranch,
      });
      prLink = prResult.web_url || '';
      createSpinner.succeed('GitLab MR created successfully!\n');
    } else {
      createSpinner.fail('Remote Host Not Found. PR creation failed.\n');
      return;
    }

    if (prLink) {
      ui.info(`🔗 PR Link: ${prLink}\n`);
    }
  } catch (err) {
    ui.error(`PR generation failed: ${err}`);
  }
};
