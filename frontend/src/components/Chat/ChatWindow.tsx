import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../../api/client';
import ExpertResponse from './ExpertResponse';
import ConsolidatedView from './ConsolidatedView';
import UsageDisplay from '../UsageDisplay';
import type { ModuleType, Message, ExpertResponse as ExpertResponseType, ConsolidationResult, UsageStats } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  expertResponses?: ExpertResponseType[];
  consolidation?: ConsolidationResult | null;
  validationError?: string;
}

const moduleNames: Record<ModuleType, string> = {
  healthcare: 'Healthcare',
  legal: 'Legal',
  travel: 'Travel',
  insurance: 'Insurance',
  financial: 'Financial',
};

export default function ChatWindow() {
  const { module, conversationId: initialConversationId } = useParams<{
    module: ModuleType;
    conversationId?: string;
  }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsageStats();
    if (initialConversationId) {
      loadConversation(initialConversationId);
    }
  }, [initialConversationId]);

  const loadUsageStats = async () => {
    try {
      const res = await api.getUsageStats();
      if (res.data) {
        setUsage(res.data);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await api.getConversation(id);
      if (res.data?.conversation.messages) {
        const loadedMessages: ChatMessage[] = res.data.conversation.messages.map(
          (m: Message) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            expertResponses: m.expertResponses,
            consolidation: m.consensus,
          })
        );
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !module) return;

    // Check if user has queries remaining
    if (usage && usage.remaining <= 0) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: 'Daily limit reached',
        validationError: `You've used all ${usage.limit} queries for today. Please try again tomorrow.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendMessage(module, userMessage.content, conversationId);

      if (!res.data) {
        throw new Error('No response data');
      }

      // Update usage stats from response
      if (res.usage) {
        setUsage(res.usage);
      }

      const { validation, expertResponses, consolidation, conversationId: newConvId } =
        res.data;

      if (!conversationId) {
        setConversationId(newConvId);
      }

      if (!validation.valid) {
        const errorMessage: ChatMessage = {
          id: Date.now().toString() + '-error',
          role: 'assistant',
          content: `I can't answer this question in the ${moduleNames[module]} module.`,
          validationError: validation.reason,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString() + '-response',
          role: 'assistant',
          content: consolidation?.summary || 'No response available',
          expertResponses,
          consolidation,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: 'An error occurred while processing your request.',
        validationError:
          error instanceof Error ? error.message : 'Unknown error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (messageId: string) => {
    setExpandedResponses((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  if (!module) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {moduleNames[module]} Advisor
            </h2>
            <p className="text-sm text-gray-500">
              Ask your questions and get insights from multiple AI experts
            </p>
          </div>
          <UsageDisplay usage={usage} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg">Start a conversation</p>
            <p className="text-sm mt-2">
              Ask any {moduleNames[module].toLowerCase()}-related question
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3'
                  : 'w-full'
              }`}
            >
              {message.role === 'user' ? (
                <p>{message.content}</p>
              ) : (
                <div className="space-y-4">
                  {message.validationError ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="font-medium text-amber-800">{message.content}</p>
                      <p className="text-sm text-amber-600 mt-2">
                        {message.validationError}
                      </p>
                    </div>
                  ) : (
                    <>
                      {message.consolidation && (
                        <ConsolidatedView consolidation={message.consolidation} />
                      )}

                      {message.expertResponses && message.expertResponses.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleExpanded(message.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                          >
                            {expandedResponses.has(message.id) ? (
                              <>
                                <span className="mr-1">▼</span> Hide individual responses
                              </>
                            ) : (
                              <>
                                <span className="mr-1">▶</span> Show {message.expertResponses.length} individual AI responses
                              </>
                            )}
                          </button>

                          {expandedResponses.has(message.id) && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              {message.expertResponses.map((response, index) => (
                                <ExpertResponse key={index} response={response} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl p-4 flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500">Consulting AI experts...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a ${moduleNames[module].toLowerCase()} question...`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading || (usage !== null && usage.remaining <= 0)}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || (usage !== null && usage.remaining <= 0)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
        {usage && usage.remaining <= 0 && (
          <p className="text-center text-red-600 text-sm mt-2">
            Daily limit reached. Please try again tomorrow.
          </p>
        )}
      </div>
    </div>
  );
}
