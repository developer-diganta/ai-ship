import readline from 'readline';

export const askApiKey = (): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter your Gemini API key: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};
