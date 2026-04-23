import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/client';
import type { Conversation, ModuleType } from '../types';

const moduleColors: Record<ModuleType, string> = {
  healthcare: 'bg-red-100 text-red-800',
  legal: 'bg-blue-100 text-blue-800',
  travel: 'bg-green-100 text-green-800',
  insurance: 'bg-yellow-100 text-yellow-800',
  financial: 'bg-purple-100 text-purple-800',
};

export default function History() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      if (res.data?.conversations) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Conversation History</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No conversations yet</p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Start a new conversation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        moduleColors[conversation.module as ModuleType]
                      }`}
                    >
                      {conversation.module}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/chat/${conversation.module}/${conversation.id}`}
                    className="text-gray-900 font-medium hover:text-blue-600 transition"
                  >
                    {conversation.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {conversation._count?.messages || 0} messages
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(conversation.id)}
                  className="text-gray-400 hover:text-red-600 transition p-2"
                  title="Delete conversation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
