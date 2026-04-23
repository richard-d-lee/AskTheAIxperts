export type ModuleType = 'healthcare' | 'legal' | 'travel' | 'insurance' | 'financial';

export type LLMProvider = 'anthropic' | 'openai' | 'gemini' | 'perplexity' | 'groq';

export interface User {
  id: string;
  email: string;
  createdAt?: string;
}

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

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  expertResponses?: ExpertResponse[];
  consensus?: ConsolidationResult;
  createdAt: string;
}

export interface Conversation {
  id: string;
  module: ModuleType;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  _count?: { messages: number };
}

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: UsageStats;
}
