import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  PERPLEXITY_API_KEY: z.string(),
  GROQ_API_KEY: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  database: {
    url: parsed.data.DATABASE_URL,
  },
  llm: {
    anthropic: parsed.data.ANTHROPIC_API_KEY,
    openai: parsed.data.OPENAI_API_KEY,
    gemini: parsed.data.GEMINI_API_KEY,
    perplexity: parsed.data.PERPLEXITY_API_KEY,
    groq: parsed.data.GROQ_API_KEY,
  },
  jwt: {
    secret: parsed.data.JWT_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
  },
  server: {
    port: parseInt(parsed.data.PORT, 10),
    nodeEnv: parsed.data.NODE_ENV,
    frontendUrl: parsed.data.FRONTEND_URL,
  },
};
