import type {
  ApiResponse,
  User,
  ChatResponse,
  Conversation,
  ModuleType,
  UsageStats,
} from '../types';

const API_BASE = import.meta.env.PROD ? '' : '';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth
export async function register(email: string, password: string) {
  return request<ApiResponse<{ user: User; token: string }>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  return request<ApiResponse<{ user: User; token: string }>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return request<ApiResponse<{ user: User }>>('/api/auth/me');
}

// Chat
export async function sendMessage(
  module: ModuleType,
  question: string,
  conversationId?: string
) {
  return request<ApiResponse<ChatResponse> & { usage?: UsageStats }>(`/api/chat/${module}`, {
    method: 'POST',
    body: JSON.stringify({ question, conversationId }),
  });
}

export async function getUsageStats() {
  return request<ApiResponse<UsageStats>>('/api/chat/usage');
}

// History
export async function getConversations() {
  return request<ApiResponse<{ conversations: Conversation[] }>>('/api/history');
}

export async function getConversation(id: string) {
  return request<ApiResponse<{ conversation: Conversation }>>(`/api/history/${id}`);
}

export async function deleteConversation(id: string) {
  return request<ApiResponse<void>>(`/api/history/${id}`, {
    method: 'DELETE',
  });
}
