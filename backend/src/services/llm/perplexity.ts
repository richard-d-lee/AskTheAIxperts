import { config } from '../../config/index.js';
import type { ExpertResponse } from '../../types/index.js';

const MODEL = 'sonar-pro';

export async function queryPerplexity(
  systemPrompt: string,
  userMessage: string
): Promise<ExpertResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.llm.perplexity}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      provider: 'perplexity',
      model: MODEL,
      response: data.choices[0]?.message?.content || '',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      provider: 'perplexity',
      model: MODEL,
      response: '',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
