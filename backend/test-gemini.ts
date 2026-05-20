import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './src/config/env';

async function testGemini() {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found');
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.5-flash',
    'gemini-1.5-pro'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in one word');
      console.log(`Success with ${modelName}:`, result.response.text().trim());
      return; // Exit on first success
    } catch (err: any) {
      console.error(`Failed with ${modelName}:`, err.message || err);
    }
  }
}

testGemini();
