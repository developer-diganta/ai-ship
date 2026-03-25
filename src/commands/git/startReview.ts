import chalk from 'chalk';
import { log } from 'node:console';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import open from 'open';

import { commitHistoryAgainstBranch, diffAgainstBranch, gitFetch } from '../../utils/git';

import { generateAIResponse, generateReviewResponse } from '../../utils/ai'; // 👈 your existing
import { getProvider } from '../../utils/helper';
import { processDiff, parseReview, generateHTML, ReviewItem } from '../../utils/reviewUtils';
import { buildReviewPrompt } from '../../utils/prompts';

// ================= START =================
export const startReview = async (flags: any = {}) => {
  try {
    const base = flags._?.[0];
    if (!base) {
      log(chalk.yellow('Please provide base branch'));
      return;
    }

    const spinner = ora('Preparing review...').start();

    await gitFetch();

    const rawDiff = await diffAgainstBranch(base);
    if (!rawDiff.trim()) {
      spinner.stop();
      log(chalk.yellow('No changes to review'));
      return;
    }

    const rawCommits = await commitHistoryAgainstBranch(base);
    const commits = rawCommits.trim().split('\n').filter(Boolean);

    const processed = processDiff(rawDiff);
    const runProvider = await getProvider();
    let allResults: ReviewItem[] = [];

    for (const batch of [processed.slice(0, 2), processed.slice(2, 5)]) {
      if (!batch.length) continue;

      const prompt = buildReviewPrompt(batch, commits);

      const response = await generateReviewResponse(runProvider, prompt);

      const parsed = parseReview(response);
      allResults.push(...parsed);
    }

    spinner.succeed('Review generated');

    // 🔥 HTML
    const html = generateHTML(allResults);
    const filePath = path.join(process.cwd(), 'ai-ship-review.html');

    fs.writeFileSync(filePath, html);

    log(chalk.green('\n📄 Opening review in browser...\n'));

    await open(filePath);
  } catch (err: any) {
    console.log(err);
    log(chalk.red(`Review failed: ${err?.message || err}`));
  }
};
