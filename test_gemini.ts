import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.0-flash',
      contents: 'Hello',
    });
    console.log('Success:', response.text);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
