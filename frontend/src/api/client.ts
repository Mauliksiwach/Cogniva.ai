import { supabase } from '../utils/supabase';
import { ApiResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token || localStorage.getItem('cogniva_token') || localStorage.getItem('studypilot_dev_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.error?.message || response.statusText || 'API request failed',
        error: data?.error || {
          code: 'HTTP_' + response.status,
          message: data?.detail || 'Request failed',
        },
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network connection failed',
      error: {
        code: 'NETWORK_ERROR',
        message: err?.message || 'Failed to reach Cogniva AI server',
      },
    };
  }
}

export const api = {
  checkHealth: () => apiRequest('/health'),
  getMe: () => apiRequest('/auth/me'),
  getDocuments: () => apiRequest('/documents'),
  getQuizzes: () => apiRequest('/quizzes'),
  getProgress: () => apiRequest('/progress'),
};
