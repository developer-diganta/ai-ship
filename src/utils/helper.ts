import os from 'os';
import path from 'path';
import fs from 'fs';

export const log = (data: any) => console.log(data);

// config dir for storing api key
export const CONFIG_DIR = path.join(os.homedir(), '.auto-commiter');
// config file for storing api key
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
export const saveApiKey = (key: string) => {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR);
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ geminiApiKey: key }, null, 2));
};

export const deleteApiKey = (): boolean => {
  if (!fs.existsSync(CONFIG_FILE)) {
    return false;
  }

  fs.unlinkSync(CONFIG_FILE);
  if (fs.readdirSync(CONFIG_DIR).length === 0) {
    fs.rmdirSync(CONFIG_DIR);
  }
  return true;
};

export const loadApiKey = () => {
  if (!fs.existsSync(CONFIG_FILE)) return null;

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  return config.geminiApiKey;
};
