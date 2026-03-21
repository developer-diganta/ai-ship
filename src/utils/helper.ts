import os from 'os';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
type AIShipConfig = {
  provider: 'local' | 'cloud';
  model: string;
  localEndpoint?: string;
  geminiApiKey?: string;
};

const ALLOWED_KEYS = ['provider', 'model', 'localEndpoint', 'geminiApiKey'];

export const log = (data: any) => console.log(data);

// config dir for storing api key
export const CONFIG_DIR = path.join(os.homedir(), '.ai-ship');
// config file for storing api key
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
export const deleteConfigKey = (key: string): boolean => {
  if (!fs.existsSync(CONFIG_FILE)) return false;
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const config = raw ? JSON.parse(raw) : {};
    if (config[key]) {
      delete config[key];
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const getCurrentConfig = (key: string = 'all') => {
  if (!fs.existsSync(CONFIG_FILE)) return null;

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

  if (key === 'all') return config;

  return config[key];
};
export const verboseConfig = (config: any) => {
  const { provider, model, localEndpoint, geminiApiKey } = config;

  const maskedKey = geminiApiKey
    ? geminiApiKey.slice(0, 4) + '...' + geminiApiKey.slice(-4)
    : 'not configured';

  console.log(chalk.bold('\nAI-Ship Configuration\n'));

  console.log(chalk.yellow('Provider'));
  console.log('  Current:', provider || 'not set');
  console.log('  Description: Determines where AI runs (local via Ollama or cloud API)\n');

  console.log(chalk.yellow('Model'));
  console.log('  Current:', model || 'not set');
  console.log('  Description: AI model used for commit and branch generation\n');

  console.log(chalk.yellow('Local Model Settings'));
  console.log('  Endpoint:', localEndpoint || 'not configured');
  console.log('  Description: URL of the local model server (e.g. http://127.0.0.1:11434)\n');

  console.log(chalk.yellow('Cloud Model Settings'));
  console.log('  Gemini API Key:', maskedKey);
  console.log('  Description: API key used when provider is set to cloud\n');
};

export const jsonConfig = (config: any) => {
  const safeConfig = {
    provider: config.provider || null,
    model: config.model || null,
    localEndpoint: config.localEndpoint || null,
    geminiApiKey: config.geminiApiKey
      ? config.geminiApiKey.slice(0, 4) + '...' + config.geminiApiKey.slice(-4)
      : null,
  };

  console.log(JSON.stringify(safeConfig, null, 2));
};

const validateValue = (key: string, value: string) => {
  switch (key) {
    case 'provider':
      if (!['local', 'cloud'].includes(value)) {
        throw new Error("provider must be 'local' or 'cloud'");
      }
      break;

    case 'model':
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('model must be a non-empty string');
      }
      break;

    case 'localEndpoint':
      try {
        new URL(value);
      } catch {
        throw new Error('localEndpoint must be a valid URL');
      }
      break;

    case 'geminiApiKey':
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('geminiApiKey must be a valid string');
      }
      break;
  }
};

export const saveValueToConfig = (key: string, value: string) => {
  try {
    if (!ALLOWED_KEYS.includes(key as any)) {
      throw new Error(`Invalid config key: ${key}. Allowed keys: ${ALLOWED_KEYS.join(', ')}`);
    }

    validateValue(key, value);

    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    let config: Record<string, any> = {};

    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      config = raw ? JSON.parse(raw) : {};
    }

    config[key] = value;

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');

    console.log(chalk.green(`✔ Config updated: ${chalk.bold.green(key)}`));
  } catch (err: any) {
    console.error(chalk.red(`❌ Failed to save config: ${chalk.bold.red(err.message)}`));
  }
};

export const getProvider = () => {
  return getCurrentConfig('provider');
};
