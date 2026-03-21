import chalk from 'chalk';
import ora from 'ora';
import startCommit from './startCommit';
import startCheckout from './startCheckout';
import { gitDirectPush, gitInteractivePush } from './startPush';
import { log } from '../../utils/helper';
import { getAllBranches, getCurrentBranchName, gitFetch } from '../../utils/git';
import { compressBranchSummary } from '../../analyzers/compressBranchSummary';

export default async (flags: any = {}) => {
  try {
    const commitResult = await startCommit(flags);

    // If startCommit returns void/falsy, it means it was aborted, failed, or was a dry-run
    if (!commitResult) {
      return;
    }

    const { diffSummary, commitMessage, runProvider } = commitResult;

    if (flags['new-branch']) {
      const branchAnalyzeSpinner = ora('Checking branches...').start();
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

    if (flags['push']) {
      await gitDirectPush();
    } else {
      await gitInteractivePush();
    }
  } catch (err) {
    console.log(err);
    log(chalk.red(`Workflow encountered an error: ${err}`));
  }
};
