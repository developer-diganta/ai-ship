import chalk from 'chalk';
import { loadApiKey, log, saveApiKey } from '../../utils/helper';
import { askApiKey } from '../../utils/inputs';
import { getFilesChanged, getStagedDiff, stageAll } from '../../utils/git';
import { expandDirectories } from '../../utils/files';
import { buildCommitPrompt, fileNameBasedCommitPrompt } from '../../utils/prompts';
import { filterNoiseFiles } from '../../utils/parser';
import { GoogleGenAI } from '@google/genai';
import { analyzeDiff } from '../../analyzers/analyzer';
import { diff } from 'node:util';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let apiKey = loadApiKey();
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export default async () => {
  try {
    if (!apiKey) {
      console.log('Gemini API key not found.');
      apiKey = await askApiKey();
      saveApiKey(apiKey);
      console.log('API key saved!');
    }

    log(chalk.green('Starting commit process!'));

    // 1️⃣ Get staged files
    const filesChanged = await getFilesChanged();

    if (!filesChanged.length) {
      log(chalk.yellow('No staged files detected.'));
      return;
    }

    // 2️⃣ Expand directories
    const expandedFiles = expandDirectories(filesChanged);

    // 3️⃣ Extract filenames
    let filenames = expandedFiles.map((f) => f.file);

    // 4️⃣ Filter noise files
    filenames = filterNoiseFiles(filenames);

    console.log({ filenames });
    // 5️⃣ Analyze diff (optional but recommended)
    const diffs = await getStagedDiff(filenames);
    const diffSummary = analyzeDiff(diffs);

    // 6️⃣ Build AI prompt
    const prompt = buildCommitPrompt(diffSummary);
    const prompt1 = fileNameBasedCommitPrompt(filenames);

    console.log({ prompt });
    // const diff = await getStagedDiff(filenames);
    // console.log({ diffSummary });
    // 7️⃣ Call AI
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    console.log(response.text);

    const response2 = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt1,
    });
    console.log(response2.text);
    // 8️⃣ Commit
    // await gitCommit(response.text);
  } catch (err) {
    log(chalk.red(`We ran into an error: ${err}`));
  }
};
