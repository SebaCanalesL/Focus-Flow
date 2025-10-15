import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Only initialize AI if API key is available
const hasApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = genkit({
  plugins: hasApiKey ? [googleAI()] : [],
  model: hasApiKey ? 'googleai/gemini-2.5-flash' : undefined,
});
