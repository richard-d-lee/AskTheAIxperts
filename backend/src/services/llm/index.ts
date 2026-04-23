import { queryAnthropic } from './anthropic.js';
import { queryOpenAI } from './openai.js';
import { queryGemini } from './gemini.js';
import { queryPerplexity } from './perplexity.js';
import { queryGroq } from './groq.js';
import type { ExpertResponse } from '../../types/index.js';

export async function queryAllLLMs(
  systemPrompt: string,
  userMessage: string
): Promise<ExpertResponse[]> {
  const queries = [
    queryAnthropic(systemPrompt, userMessage),
    queryOpenAI(systemPrompt, userMessage),
    queryGemini(systemPrompt, userMessage),
    queryPerplexity(systemPrompt, userMessage),
    queryGroq(systemPrompt, userMessage),
  ];

  const results = await Promise.allSettled(queries);

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    const providers = ['anthropic', 'openai', 'gemini', 'perplexity', 'groq'] as const;
    return {
      provider: providers[index],
      model: 'unknown',
      response: '',
      responseTime: 0,
      error: result.reason?.message || 'Query failed',
    };
  });
}

export { queryAnthropic } from './anthropic.js';
export { validateQuestion, consolidateResponses } from './anthropic.js';
export { queryOpenAI } from './openai.js';
export { queryGemini } from './gemini.js';
export { queryPerplexity } from './perplexity.js';
export { queryGroq } from './groq.js';
