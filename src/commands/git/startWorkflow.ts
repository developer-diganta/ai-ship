import chalk from 'chalk';
import { ui } from '../../utils/ui';
import startCommit from './startCommit';
import startCheckout from './startCheckout';
import { gitDirectPush, gitInteractivePush } from './startPush';
import { log } from '../../utils/helper';
import { getAllBranches, getCurrentBranchName, gitFetch } from '../../utils/git';
import { compressBranchSummary } from '../../analyzers/compressBranchSummary';
import { startPR } from './startPR';
import { interactivePRPrompt } from '../../utils/inquirer';

export default async (flags: any = {}) => {
  try {
    const commitResult = await startCommit(flags);

    // If startCommit returns void/falsy, it means it was aborted, failed, or was a dry-run
    if (!commitResult) {
      return;
    }

    const { diffSummary, commitMessage, runProvider } = commitResult;

    if (flags['new-branch']) {
      const branchAnalyzeSpinner = ui.spinner('Checking branches...');
      await gitFetch();
      const allBranches = await getAllBranches();
      const currentBranch = await getCurrentBranchName();

      const branchSummary = compressBranchSummary(diffSummary);
      branchAnalyzeSpinner.succeed('Analysis complete.\\n');

      await startCheckout({
        branchSummary,
        allBranches,
        currentBranch,
        commitMessage,
        provider: runProvider,
        flags,
      });
    }

    let pushed = false;
    if (flags['push']) {
      pushed = await gitDirectPush();
    } else {
      pushed = await gitInteractivePush();
    }

    if (!pushed) {
      return;
    }

    if (flags['pr']) {
      await startPR({
        diffSummary,
        commitMessage,
        provider: runProvider,
        flags,
      });
    } else {
      const prPromptResult = await interactivePRPrompt(flags['target-branch'] || 'main');
      if (prPromptResult.accepted) {
        flags['target-branch'] = prPromptResult.base;
        await startPR({
          diffSummary,
          commitMessage,
          provider: runProvider,
          flags,
        });
      }
    }
  } catch (err) {
    ui.error(`Workflow encountered an error: ${err}`);
  }
};
