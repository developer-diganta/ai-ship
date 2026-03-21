import chalk from 'chalk';
import { getCurrentConfig } from '../utils/helper';

export const generateWithGemma = async (prompt: string) => {
  try {
    const endpoint = getCurrentConfig('localEndpoint') || 'http://127.0.0.1:11434';
    const model = getCurrentConfig('model') || 'gemma:2b';

    const res = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt,
        stream: false,
        options: {
          temperature: 0.1,
        },
      }),
    });

    const data = await res.json();
    return data.response.trim();
  } catch (e) {
    console.error(chalk.red(`Failed to connect to local model: ${e}`));
    return '';
  }
};
