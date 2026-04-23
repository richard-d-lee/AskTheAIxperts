import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/index.js';
import type { ExpertResponse } from '../../types/index.js';

const client = new Anthropic({
  apiKey: config.llm.anthropic,
});

const MODEL = 'claude-sonnet-4-20250514';

export async function queryAnthropic(
  systemPrompt: string,
  userMessage: string
): Promise<ExpertResponse> {
  const startTime = Date.now();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    const responseText = textContent ? textContent.text : '';

    return {
      provider: 'anthropic',
      model: MODEL,
      response: responseText,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      provider: 'anthropic',
      model: MODEL,
      response: '',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function validateQuestion(
  validationPrompt: string,
  question: string
): Promise<{ valid: boolean; reason?: string }> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: validationPrompt,
    messages: [{ role: 'user', content: question }],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  const text = textContent ? textContent.text : '';

  try {
    const parsed = JSON.parse(text);
    return {
      valid: parsed.valid === true,
      reason: parsed.reason,
    };
  } catch {
    const isValid = text.toLowerCase().includes('"valid": true') ||
                    text.toLowerCase().includes('"valid":true');
    return {
      valid: isValid,
      reason: isValid ? undefined : text,
    };
  }
}

export async function consolidateResponses(
  question: string,
  responses: ExpertResponse[]
): Promise<{
  summary: string;
  agreements: string[];
  disagreements: string[];
  consensusScore: number;
  recommendation: string;
}> {
  const systemPrompt = `You are an expert analyst tasked with consolidating responses from multiple AI assistants.
Analyze the responses and provide:
1. A summary of the key information
2. Points where the AIs agree
3. Points where the AIs disagree
4. A consensus score (0-100) indicating how much the AIs agree
5. A final recommendation based on the consensus

Respond in JSON format:
{
  "summary": "Brief summary of the combined advice",
  "agreements": ["Point 1", "Point 2"],
  "disagreements": ["Point 1", "Point 2"],
  "consensusScore": 85,
  "recommendation": "Final recommendation"
}`;

  const responsesText = responses
    .filter((r) => !r.error && r.response)
    .map((r) => `**${r.provider.toUpperCase()} (${r.model}):**\n${r.response}`)
    .join('\n\n---\n\n');

  const userMessage = `Question: ${question}\n\nResponses from AI experts:\n\n${responsesText}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  const text = textContent ? textContent.text : '';

  try {
    return JSON.parse(text);
  } catch {
    return {
      summary: text,
      agreements: [],
      disagreements: [],
      consensusScore: 0,
      recommendation: 'Unable to parse consolidated response',
    };
  }
}
