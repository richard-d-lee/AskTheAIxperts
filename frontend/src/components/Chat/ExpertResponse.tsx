import ReactMarkdown from 'react-markdown';
import type { ExpertResponse as ExpertResponseType, LLMProvider } from '../../types';

interface Props {
  response: ExpertResponseType;
}

const providerInfo: Record<LLMProvider, { name: string; color: string }> = {
  anthropic: { name: 'Claude (Anthropic)', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  openai: { name: 'GPT-4 (OpenAI)', color: 'bg-green-100 text-green-800 border-green-200' },
  gemini: { name: 'Gemini (Google)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  perplexity: { name: 'Sonar (Perplexity)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  groq: { name: 'Llama (Groq)', color: 'bg-pink-100 text-pink-800 border-pink-200' },
};

export default function ExpertResponse({ response }: Props) {
  const info = providerInfo[response.provider];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${info.color}`}>
          {info.name}
        </span>
        <span className="text-xs text-gray-500">
          {response.responseTime}ms
        </span>
      </div>

      <div className="p-4">
        {response.error ? (
          <div className="text-red-600 text-sm">
            Error: {response.error}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{response.response}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
