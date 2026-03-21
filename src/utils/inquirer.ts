import inquirer from 'inquirer';
// @ts-ignore
import { Input } from 'enquirer';
import chalk from 'chalk';

export type AIGenerationResult = {
  accepted: boolean;
  value: string;
  cancel: boolean;
};

export const interactiveRefinePrompt = async (
  itemType: string,
  initialValue: string,
): Promise<AIGenerationResult> => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `What would you like to do with this ${itemType}?`,
      choices: ['Continue', 'Edit', 'Retry', 'Cancel'],
    },
  ]);

  if (action === 'Continue') {
    return { accepted: true, value: initialValue, cancel: false };
  }

  if (action === 'Edit') {
    const promptInput = new Input({
      message: `Edit your ${itemType}:`,
      initial: initialValue,
    });
    const editedValue = (await promptInput.run()) as string;
    return { accepted: true, value: editedValue, cancel: false };
  }

  if (action === 'Retry') {
    console.log(chalk.yellow(`Retrying ${itemType}...\\n`));
    return { accepted: false, value: initialValue, cancel: false };
  }

  // Cancel
  console.log(
    chalk.yellow(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} cancelled.\\n`),
  );
  return { accepted: false, value: initialValue, cancel: true };
};

export const interactivePushPrompt = async (
  itemType: string,
  initialValue: string,
): Promise<AIGenerationResult> => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `What would you like to do with this ${itemType}?`,
      choices: ['Push', 'Cancel'],
    },
  ]);

  if (action === 'Continue') {
    return { accepted: true, value: initialValue, cancel: false };
  }

  // Cancel
  console.log(
    chalk.yellow(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} cancelled.\\n`),
  );
  return { accepted: false, value: initialValue, cancel: true };
};
