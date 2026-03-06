#!/usr/bin/env node
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import chalk from 'chalk';
import asyncExecuter from './utils/asyncExecuter';
import { getFilesChanged } from './git';
import { log } from './utils/helper';
import { printFileList } from './utils/print';
import { expandDirectories } from './utils/files';
import { fileNameBasedCommitPrompt } from './utils/prompts';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const startCommitProcess = async () => {
  try {
    log(chalk.green('Starting commit process!'));
    log(chalk.green('Adding changes!'));
    const filesChanged = await getFilesChanged();
    // printFileList(filesChanged);
    const expandedFiles = expandDirectories(filesChanged);
    console.log(expandedFiles);
    const filenames = expandedFiles.map((f) => f.file);

    const prompt = fileNameBasedCommitPrompt(filenames);
    console.log({ prompt });
    // const response = await ai.models.generateContent({
    //   model: 'gemini-2.5-flash',
    //   contents: prompt,
    // });
    // console.log(response.text);
    // await asyncExecuter(`git add .`);
  } catch (err) {
    log(chalk.red(`We ran into an error: ${err}`));
  }
};

startCommitProcess();
