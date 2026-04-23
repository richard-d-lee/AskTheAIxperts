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

function extractJSON(text: string): string {
  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // Try to find JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return text;
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
Analyze the responses and provide a JSON object with these fields:
- summary: A clear, readable paragraph summarizing the key information (not JSON, just plain text)
- agreements: Array of points where the AIs agree
- disagreements: Array of points where the AIs disagree
- consensusScore: Number from 0-100 indicating agreement level
- recommendation: A clear, actionable recommendation paragraph

IMPORTANT: Return ONLY valid JSON, no markdown code blocks, no extra text. Example:
{"summary": "The experts agree that...", "agreements": ["Point 1", "Point 2"], "disagreements": ["Point 1"], "consensusScore": 85, "recommendation": "Based on the consensus..."}`;

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
    const jsonText = extractJSON(text);
    const parsed = JSON.parse(jsonText);

    // Ensure all required fields exist with proper types
    return {
      summary: String(parsed.summary || ''),
      agreements: Array.isArray(parsed.agreements) ? parsed.agreements : [],
      disagreements: Array.isArray(parsed.disagreements) ? parsed.disagreements : [],
      consensusScore: typeof parsed.consensusScore === 'number' ? parsed.consensusScore : 0,
      recommendation: String(parsed.recommendation || ''),
    };
  } catch {
    // If parsing fails, try to create a reasonable response from the text
    return {
      summary: text.substring(0, 500),
      agreements: [],
      disagreements: [],
      consensusScore: 0,
      recommendation: 'Unable to parse consolidated response. Please try again.',
    };
  }
}
