#!/usr/bin/env node
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import chalk from 'chalk';
import asyncExecuter from './utils/asyncExecuter';
import { getFilesChanged } from './git';
import { deleteApiKey, loadApiKey, log, saveApiKey } from './utils/helper';
import { printFileList } from './utils/print';
import { expandDirectories } from './utils/files';
import { fileNameBasedCommitPrompt } from './utils/prompts';
import { askApiKey } from './utils/inputs';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let apiKey = loadApiKey();

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const startCommandExecution = async () => {
  const args = process.argv.slice(2);

  const flags = args.filter((a) => a.startsWith('--')).map((a) => a.slice(2));
  console.log({ flags });
  if (!flags.length) {
    await startCommitProcess();
    return;
  } else if (flags[0] === 'delete-key') {
    if (deleteApiKey()) {
      console.log(chalk.green('API Key Deleted'));
    } else {
      console.log(chalk.red('API Key Could Not Be Deleted. API KEY NOT FOUND!'));
    }
  }
};

const startCommitProcess = async () => {
  try {
    if (!apiKey) {
      console.log('Gemini API key not found.');
      apiKey = await askApiKey();
      saveApiKey(apiKey);
      console.log('API key saved!');
    }
    log(chalk.green('Starting commit process!'));
    log(chalk.green('Adding changes!'));
    const filesChanged = await getFilesChanged();
    // printFileList(filesChanged);
    const expandedFiles = expandDirectories(filesChanged);
    console.log(expandedFiles);
    const filenames = expandedFiles.map((f) => f.file);

    const prompt = fileNameBasedCommitPrompt(filenames);
    console.log({ prompt });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    console.log(response.text);
    await asyncExecuter(`git add .`);
  } catch (err) {
    log(chalk.red(`We ran into an error: ${err}`));
  }
};

startCommandExecution();
