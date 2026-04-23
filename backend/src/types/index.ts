export type ModuleType = 'healthcare' | 'legal' | 'travel' | 'insurance' | 'financial';

export type LLMProvider = 'anthropic' | 'openai' | 'gemini' | 'perplexity' | 'groq';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface ExpertResponse {
  provider: LLMProvider;
  model: string;
  response: string;
  responseTime: number;
  error?: string;
}

export interface ConsolidationResult {
  summary: string;
  agreements: string[];
  disagreements: string[];
  consensusScore: number;
  recommendation: string;
}

export interface ChatResponse {
  validation: ValidationResult;
  expertResponses: ExpertResponse[];
  consolidation: ConsolidationResult | null;
  conversationId: string;
}

export interface ModuleConfig {
  name: string;
  description: string;
  validationPrompt: string;
  systemPrompt: string;
  exampleValidQuestions: string[];
  exampleInvalidQuestions: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
