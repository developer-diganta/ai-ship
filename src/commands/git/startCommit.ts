import chalk from 'chalk';
import { getProvider, log } from '../../utils/helper';
import {
  getAllBranches,
  getCurrentBranchName,
  getFilesChanged,
  getStagedDiff,
  gitFetch,
  gitCommit,
  unstageFiles,
} from '../../utils/git';
import { expandDirectories } from '../../utils/files';
import { buildCommitPrompt, buildCommitPromptGemma } from '../../utils/prompts';
import { filterNoiseFiles } from '../../utils/parser';
import { analyzeDiff } from '../../analyzers/analyzer';
import { compressBranchSummary } from '../../analyzers/compressBranchSummary';
import { generateAIResponse, getCommitPrompt, interactiveRefinePrompt } from '../../utils/ai';
import ora from 'ora';
import startCheckout from './startCheckout';

let provider = getProvider();

export default async (flags: any = {}) => {
  try {
    if (!provider) {
      throw new Error('No provider set');
    }

    const runProvider = flags.model ? flags.model : provider;

    console.log('');
    console.log(chalk.bold.bgBlue(' 🚀 AI-SHIP ') + chalk.bold.blue(' Commit Generator '));
    console.log(chalk.dim('==================================='));
    console.log('');

    // 1️⃣ Get staged files
    const scanSpinner = ora('Scanning staged files...').start();
    const filesChanged = await getFilesChanged();

    if (!filesChanged.length) {
      scanSpinner.fail(chalk.yellow('No staged files detected.'));
      return;
    }

    // 2️⃣ Expand directories
    const expandedFiles = expandDirectories(filesChanged);

    // 3️⃣ Extract filenames
    let filenames = expandedFiles.map((f) => f.file);

    // 4️⃣ Filter noise files
    filenames = filterNoiseFiles(filenames);

    scanSpinner.succeed(`Found ${filesChanged.length} staged file(s).`);

    console.log(chalk.dim('Files changed:'));
    filesChanged.forEach((f) => console.log(chalk.green(`  + ${f.file}`)));
    console.log('');

    // 5️⃣ Analyze diff
    const analyzeSpinner = ora('Analyzing file changes changes').start();

    const diffs = await getStagedDiff(filenames);
    const diffSummary = analyzeDiff(diffs);
    console.log({ diffSummary });
    analyzeSpinner.succeed('Analysis complete.\n');

    // 6️⃣ Commit message generation
    let commitMessage = '';
    let commitAccepted = false;

    while (!commitAccepted) {
      const commitSpinner = ora('Generating commit message...').start();

      const prompt = getCommitPrompt(runProvider, diffSummary);
      commitMessage = await generateAIResponse(runProvider, prompt);

      commitSpinner.succeed('Commit message generated:\\n');

      console.log(chalk.cyan(commitMessage));
      console.log('');

      // dry-run → exit early
      if (flags['dry-run']) {
        console.log(chalk.yellow('Dry run enabled. Commit not executed.\\n'));
        await unstageFiles();
        return;
      }

      // skip prompt if --yes
      if (flags['yes']) {
        commitAccepted = true;
        break;
      }

      const result = await interactiveRefinePrompt('commit message', commitMessage);
      if (result.cancel) return;

      commitAccepted = result.accepted;
      commitMessage = result.value;
    }

    // 7️⃣ Commit
    const commitSpinner = ora('Committing changes...').start();
    await gitCommit(commitMessage);
    commitSpinner.succeed('Changes successfully committed!\n');
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
  } catch (err) {
    console.log(err);
    if ((err as Error).name === 'ExitPromptError') {
      console.log(chalk.yellow('\nProcess aborted using user prompt.\n'));
      return;
    }

    log(chalk.red(`We ran into an error: ${err}`));
  }
};
