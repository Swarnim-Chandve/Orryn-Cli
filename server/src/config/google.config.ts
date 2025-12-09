import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root directory
dotenv.config({
  path: path.resolve(__dirname, '..', '..', '.env'),
});

export const config = {
    googleApiKey : process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    model : process.env.ORRYN_MODEL || 'gemini-2.5-flash',
}