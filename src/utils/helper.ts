import os from 'os';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fetchGitRemoteOriginURL } from './git';
type AIShipConfig = {
  provider: 'local' | 'cloud';
  model: string;
  localEndpoint?: string;
  geminiApiKey?: string;
  'gitlab.baseUrl'?: string;
  'gitlab.token'?: string;
};

const ALLOWED_KEYS = [
  'provider',
  'model',
  'localEndpoint',
  'geminiApiKey',
  'gitlab.baseUrl',
  'gitlab.token',
];

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

  const gitlabBaseUrl = config['gitlab.baseUrl'];
  const gitlabToken = config['gitlab.token'];
  const maskedGitlabToken = gitlabToken
    ? gitlabToken.slice(0, 4) + '...' + gitlabToken.slice(-4)
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

  console.log(chalk.yellow('GitLab Settings'));
  console.log('  Base URL:', gitlabBaseUrl || 'not configured');
  console.log('  Token:', maskedGitlabToken);
};

export const jsonConfig = (config: any) => {
  const gitlabToken = config['gitlab.token'];
  const safeConfig = {
    provider: config.provider || null,
    model: config.model || null,
    localEndpoint: config.localEndpoint || null,
    geminiApiKey: config.geminiApiKey
      ? config.geminiApiKey.slice(0, 4) + '...' + config.geminiApiKey.slice(-4)
      : null,
    'gitlab.baseUrl': config['gitlab.baseUrl'] || null,
    'gitlab.token': gitlabToken ? gitlabToken.slice(0, 4) + '...' + gitlabToken.slice(-4) : null,
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

    case 'gitlab.baseUrl':
      try {
        new URL(value);
      } catch {
        throw new Error('gitlab.baseUrl must be a valid URL');
      }
      break;

    case 'gitlab.token':
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('gitlab.token must be a valid string');
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

export const getGitLabToken = () => {
  return getCurrentConfig('gitlab.token');
};

export const detectRemoteHost = async () => {
  const { stdout } = await fetchGitRemoteOriginURL();
  if (stdout.includes('github')) return 'github';
  if (stdout.includes('gitlab')) return 'gitlab';
  return 'unknown';
};

export const extractProjectPath = (remoteUrl: string): string | null => {
  try {
    const url = remoteUrl.trim();

    // SSH format
    if (url.startsWith('git@')) {
      const match = url.match(/:(.*)\.git$/);
      return match ? match[1] : null;
    }

    // HTTPS format
    if (url.startsWith('http')) {
      const match = url.match(/https?:\/\/[^/]+\/(.*)\.git$/);
      return match ? match[1] : null;
    }

    return null;
  } catch {
    return null;
  }
};

export const extractBaseUrl = (remoteUrl: string): string | null => {
  try {
    const url = remoteUrl.trim();

    // SSH: git@gitlab.com:group/repo.git
    if (url.startsWith('git@')) {
      const match = url.match(/@(.*?):/);
      return match ? `https://${match[1]}` : null;
    }

    // HTTPS: https://gitlab.com/group/repo.git
    if (url.startsWith('http')) {
      const match = url.match(/(https?:\/\/[^/]+)/);
      return match ? match[1] : null;
    }

    return null;
  } catch {
    return null;
  }
};
