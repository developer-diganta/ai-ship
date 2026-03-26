import inquirer from 'inquirer';
// @ts-ignore
import { Input } from 'enquirer';
import { ui } from './ui';

export type AIGenerationResult = {
  accepted: boolean;
  value: string;
  cancel: boolean;
};

export type pushPromptResult = {
  accepted: boolean;
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
    ui.warn(`Retrying ${itemType}...\\n`);
    return { accepted: false, value: initialValue, cancel: false };
  }

  // Cancel
  ui.warn(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} cancelled.\\n`);
  return { accepted: false, value: initialValue, cancel: true };
};

export const interactivePushPrompt = async (): Promise<pushPromptResult> => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `Do you want to push your committed changes to the remote repository?`,
      choices: ['Yes', 'No'],
    },
  ]);

  if (action === 'Yes') {
    return { accepted: true, cancel: false };
  }

  ui.warn(`Push cancelled\n`);
  return { accepted: false, cancel: true };
};

export const interactivePRPrompt = async (
  defaultBase: string = 'main',
): Promise<{ accepted: boolean; cancel: boolean; base: string }> => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `Do you want to create a pull request?`,
      choices: ['Yes', 'No'],
    },
  ]);

  if (action === 'Yes') {
    const { base } = await inquirer.prompt([
      {
        type: 'input',
        name: 'base',
        message: `Which branch do you want to target?`,
        default: defaultBase,
      },
    ]);
    return { accepted: true, cancel: false, base };
  }

  ui.warn(`PR creation cancelled\n`);
  return { accepted: false, cancel: true, base: defaultBase };
};
