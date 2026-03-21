import chalk from 'chalk';
import ora from 'ora';
import { generateAIResponse, getBranchPrompt } from '../../utils/ai';
import { interactiveRefinePrompt } from '../../utils/inquirer';
import { gitCheckoutNewBranch, gitRenameBranch } from '../../utils/git';

type BranchParams = {
  branchSummary: any[];
  allBranches: string[];
  currentBranch: string;
  commitMessage: string;
  provider: string;
  flags?: any;
};

export default async ({
  branchSummary,
  allBranches,
  currentBranch,
  commitMessage,
  provider,
  flags = {},
}: BranchParams) => {
  let branchName = '';
  let branchAccepted = false;

  const sanitizeBranchName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/['"]/g, '')
      .replace(/\\s+/g, '-')
      .replace(/[^a-z0-9\\-\\/]/g, '')
      .replace(/--+/g, '-')
      .trim();
  };

  const branchPrompt = getBranchPrompt(
    provider,
    branchSummary,
    allBranches,
    currentBranch,
    commitMessage,
  );
  const allBranchesSet = new Set(allBranches);

  while (!branchAccepted) {
    const branchSpinner = ora('Generating branch name...').start();

    const rawBranch = await generateAIResponse(provider, branchPrompt);

    branchName = sanitizeBranchName(rawBranch);

    // ensure branch prefix exists
    if (!branchName.includes('/')) {
      branchName = `feature/${branchName}`;
    }

    // avoid branch collision
    let finalBranch = branchName;
    let counter = 1;

    while (allBranchesSet.has(finalBranch)) {
      finalBranch = `${branchName}-${counter++}`;
    }

    branchName = finalBranch;

    branchSpinner.succeed('Branch name generated:\\n');

    console.log(chalk.magenta(branchName));
    console.log('');

    // auto accept if --yes
    if (flags?.yes) {
      branchAccepted = true;
      break;
    }

    const result = await interactiveRefinePrompt('branch name', branchName);
    if (result.cancel) return;

    branchAccepted = result.accepted;
    branchName = sanitizeBranchName(result.value);
  }

  // dry run support
  if (flags?.['dry-run']) {
    console.log(chalk.yellow('Dry run enabled. Branch not created.\n'));
    return;
  }

  const branchProcessSpinner = ora('Applying branch name...').start();

  await gitCheckoutNewBranch(branchName);

  branchProcessSpinner.succeed(`Checked out to ${chalk.bold(branchName)}!`);
};
