import { supabase } from '../utils/supabase';
import { ApiResponse, Document } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function uploadDocumentApi(
  file: File,
  title?: string
): Promise<ApiResponse<Document>> {
  try {
    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token || localStorage.getItem('studypilot_dev_token');

    const formData = new FormData();
    formData.append('file', file);
    if (title && title.trim()) {
      formData.append('title', title.trim());
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data?.error?.message || response.statusText || 'Upload failed',
        error: data?.error,
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error during upload',
    };
  }
}

export async function listDocumentsApi(): Promise<ApiResponse<Document[]>> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token || localStorage.getItem('studypilot_dev_token');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/documents`, { headers });
  return res.json();
}

export async function getDocumentApi(id: string): Promise<ApiResponse<Document>> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token || localStorage.getItem('studypilot_dev_token');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/documents/${id}`, { headers });
  return res.json();
}

export async function getDocumentPagesApi(id: string): Promise<ApiResponse<any[]>> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token || localStorage.getItem('studypilot_dev_token');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/documents/${id}/pages`, { headers });
  return res.json();
}

export async function deleteDocumentApi(id: string): Promise<ApiResponse<{ id: string; deleted: boolean }>> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token || localStorage.getItem('studypilot_dev_token');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
    headers,
  });
  return res.json();
}
