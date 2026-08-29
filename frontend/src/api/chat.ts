import { supabase } from '../utils/supabase';
import { ApiResponse, ChatMessage } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function sendChatMessageApi(
  documentIds: string[],
  message: string,
  conversationId?: string
): Promise<ApiResponse<ChatMessage>> {
  try {
    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token || localStorage.getItem('cogniva_token') || localStorage.getItem('studypilot_dev_token');

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        document_ids: documentIds,
        message: message.trim(),
        conversation_id: conversationId,
      }),
    });

    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error while contacting Cogniva AI',
    };
  }
}

export async function listConversationsApi(): Promise<ApiResponse<any[]>> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token || localStorage.getItem('cogniva_token') || localStorage.getItem('studypilot_dev_token');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/chat/conversations`, { headers });
  return await res.json();
}

export async function getConversationMessagesApi(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token || localStorage.getItem('cogniva_token') || localStorage.getItem('studypilot_dev_token');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, { headers });
  return await res.json();
}

export async function summarizeDocumentApi(documentId: string): Promise<ApiResponse<{ document_id: string; title: string; summary: string }>> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token || localStorage.getItem('cogniva_token') || localStorage.getItem('studypilot_dev_token');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/chat/summarize/${documentId}`, {
    method: 'POST',
    headers,
  });
  return await res.json();
}
