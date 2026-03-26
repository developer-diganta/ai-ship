import { GoogleGenAI } from '@google/genai';
import { getCurrentConfig, saveValueToConfig } from '../utils/helper';
import { askApiKey } from '../utils/inputs';
import chalk from 'chalk';
import { ui } from '../utils/ui';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let apiKey = getCurrentConfig('geminiApiKey') || GEMINI_API_KEY;

let ai = new GoogleGenAI({ apiKey });
export const generateWithGemini = async (prompt: string) => {
  try {
    if (!apiKey) {
      ui.warn('Gemini API key not found.');
      apiKey = await askApiKey();
      saveValueToConfig('geminiApiKey', apiKey);
      ai = new GoogleGenAI({ apiKey });
      ui.success('API key saved!');
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || '';
  } catch (err) {
    ui.error(`We ran into an error: ${err}`);
    return '';
  }
};
