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
          temperature: 0.7,
          top_p: 0.9,
          repeat_penalty: 1.2,
        },
        stop: ['\n\n', 'Output:', 'Commit:'],
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }

    if (data.response) {
      return data.response.trim();
    }

    throw new Error('Unexpected response format from local model');
  } catch (e) {
    throw new Error(`Failed to connect to local model: ${(e as Error).message}`);
  }
};
