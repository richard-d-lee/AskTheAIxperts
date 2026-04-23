import OpenAI from 'openai';
import { config } from '../../config/index.js';
import type { ExpertResponse } from '../../types/index.js';

const client = new OpenAI({
  apiKey: config.llm.openai,
});

const MODEL = 'gpt-4o';

export async function queryOpenAI(
  systemPrompt: string,
  userMessage: string
): Promise<ExpertResponse> {
  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    return {
      provider: 'openai',
      model: MODEL,
      response: response.choices[0]?.message?.content || '',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      provider: 'openai',
      model: MODEL,
      response: '',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
