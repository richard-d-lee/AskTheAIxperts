# AskTheAIxperts

A multi-LLM expert chatbot that queries multiple AI models for advice on Healthcare, Legal, Travel, Insurance, and Financial topics.

## Features

- **5 Expert Modules**: Healthcare, Legal, Travel, Insurance, Financial
- **Multi-LLM Responses**: Queries 5 AI models simultaneously (Claude, GPT-4, Gemini, Perplexity, Llama)
- **3-Layer Architecture**:
  - Layer 1: Question validation (ensures questions are appropriate for the module)
  - Layer 2: Parallel queries to all LLMs
  - Layer 3: Response consolidation with consensus analysis
- **User Accounts**: Save and revisit conversation history
- **Consensus Metrics**: See where AI experts agree and disagree

## Tech Stack

- **Backend**: Node.js, TypeScript, Express, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **LLM Providers**: Anthropic, OpenAI, Google Gemini, Perplexity, Groq

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys for all LLM providers

### Setup

1. Clone the repository

2. Set up the backend:
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys and database URL
npm install
npx prisma db push
npm run dev
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Open http://localhost:5173

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/asktheaixperts
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
PERPLEXITY_API_KEY=pplx-...
GROQ_API_KEY=gsk_...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Deployment (Render)

1. Push to GitHub
2. Create a new Blueprint on Render
3. Connect your repository
4. Render will auto-detect `render.yaml` and create:
   - Backend web service
   - Frontend static site
   - PostgreSQL database
5. Add your LLM API keys in Render's environment variables

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Chat
- `POST /api/chat/:module` - Send question to a module

### History
- `GET /api/history` - List conversations
- `GET /api/history/:id` - Get conversation
- `DELETE /api/history/:id` - Delete conversation

## License

MIT
