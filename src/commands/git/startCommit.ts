import chalk from 'chalk';
import { getProvider, log } from '../../utils/helper';
import { getFilesChanged, getStagedDiff, gitCommit, unstageFiles } from '../../utils/git';
import { expandDirectories } from '../../utils/files';
import { filterNoiseFiles } from '../../utils/parser';
import { analyzeDiff } from '../../analyzers/analyzer';
import { generateAIResponse, getCommitPrompt } from '../../utils/ai';
import { interactiveRefinePrompt } from '../../utils/inquirer';
import { buildIntent } from '../../analyzers/buildIntent';
import { ui } from '../../utils/ui';

let provider = getProvider();

export default async (flags: any = {}) => {
  try {
    if (!provider) {
      throw new Error('No provider set');
    }

    const runProvider = flags.model ? flags.model : provider;

    // 1️⃣ Get staged files
    const scanSpinner = ui.spinner('Scanning staged files...');
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

    ui.dim('Files changed:');
    filesChanged.forEach((f) => ui.success(`+ ${f.file}`));
    ui.newline();

    // 5️⃣ Analyze diff
    const analyzeSpinner = ui.spinner('Analyzing file changes changes');

    const diffs = await getStagedDiff(filenames);
    const diffSummary = analyzeDiff(diffs);
    const intent = buildIntent(diffSummary);
    analyzeSpinner.succeed('Analysis complete.\n');

    // 6️⃣ Commit message generation
    let commitMessage = '';
    let commitAccepted = false;

    while (!commitAccepted) {
      const commitSpinner = ui.spinner('Generating commit message...');

      const prompt = getCommitPrompt(runProvider, diffSummary, intent);
      commitMessage = await generateAIResponse(runProvider, prompt, intent);

      commitSpinner.succeed('Commit message generated:\\n');

      ui.log(chalk.cyan(commitMessage));
      ui.newline();

      // dry-run → exit early
      if (flags['dry-run']) {
        ui.warn('Dry run enabled. Commit not executed.\\n');
        const unstageSpinner = ui.spinner('Unstaging files...');
        await unstageFiles();
        unstageSpinner.succeed('Files unstaged.');
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
    const commitSpinner = ui.spinner('Committing changes...');
    await gitCommit(commitMessage);
    commitSpinner.succeed('Changes successfully committed!\n');
    return { commitMessage, diffSummary, runProvider };
  } catch (err) {
    if ((err as Error).name === 'ExitPromptError') {
      ui.warn('\nProcess aborted using user prompt.\n');
      return;
    }

    ui.error(`We ran into an error: ${err}`);
  }
};
