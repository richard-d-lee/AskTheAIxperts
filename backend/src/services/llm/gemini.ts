import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/index.js';
import type { ExpertResponse } from '../../types/index.js';

const genAI = new GoogleGenerativeAI(config.llm.gemini);

const MODEL = 'gemini-1.5-flash-latest';

export async function queryGemini(
  systemPrompt: string,
  userMessage: string
): Promise<ExpertResponse> {
  const startTime = Date.now();

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userMessage);
    const response = result.response;

    return {
      provider: 'gemini',
      model: MODEL,
      response: response.text(),
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      provider: 'gemini',
      model: MODEL,
      response: '',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
