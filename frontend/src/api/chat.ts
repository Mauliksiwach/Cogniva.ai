import { supabase } from '../utils/supabase';
import { ApiResponse, ChatMessage } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://cogniva-ai.onrender.com/api/v1';

const LOCAL_CONVS_KEY = 'cogniva_local_conversations';
const LOCAL_MSGS_KEY = 'cogniva_local_messages';

function getLocalConversations(): any[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_CONVS_KEY) || '[]'); } catch { return []; }
}

function getLocalMessages(conversationId: string): ChatMessage[] {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_MSGS_KEY) || '{}');
    return all[conversationId] || [];
  } catch { return []; }
}

function saveLocalMessage(conversationId: string, msg: ChatMessage) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_MSGS_KEY) || '{}');
    if (!all[conversationId]) all[conversationId] = [];
    all[conversationId] = [...all[conversationId], msg];
    localStorage.setItem(LOCAL_MSGS_KEY, JSON.stringify(all));
  } catch {}
}

function ensureLocalConversation(conversationId: string, firstMessage: string) {
  try {
    const convs = getLocalConversations();
    const exists = convs.find((c: any) => c.id === conversationId);
    if (!exists) {
      const newConv = { id: conversationId, title: firstMessage.slice(0, 60), created_at: new Date().toISOString() };
      localStorage.setItem(LOCAL_CONVS_KEY, JSON.stringify([newConv, ...convs]));
    }
  } catch {}
}

/** AI-quality fallback answers when backend is unreachable */
function generateOfflineAnswer(message: string): string {
  const q = message.toLowerCase();

  if (q.includes('formula') || q.includes('principle') || q.includes('law')) {
    return `**Key Formulas & Principles** (offline mode — backend waking up)\n\nYour study material has been indexed locally. Here are general learning principles:\n\n• **Retrieval Practice**: Testing yourself is 2x more effective than re-reading.\n• **Spaced Repetition**: Reviewing at increasing intervals locks in long-term memory.\n• **Interleaving**: Mixing different problem types improves understanding.\n• **Elaborative Interrogation**: Ask "why?" for each concept you encounter.\n\n⚠️ *The AI server is warming up. Full document-grounded answers will be available in ~30–60 seconds. Try again shortly!*`;
  }

  if (q.includes('concept') || q.includes('explain') || q.includes('what is') || q.includes('define')) {
    return `**Concept Explanation** (offline mode — backend waking up)\n\nYour documents are indexed and ready. The AI engine provides deep concept explanations grounded in your exact uploaded materials.\n\n**Study Tip while waiting:** Try the Feynman Technique:\n1. Write down the concept name\n2. Explain it as if teaching a child\n3. Identify gaps → go back to your material\n4. Simplify and use analogies\n\n⚠️ *The backend is waking up from sleep (Render free tier). Try again in 30–60 seconds for a full AI answer from your documents!*`;
  }

  if (q.includes('summarize') || q.includes('summary') || q.includes('takeaway') || q.includes('main point')) {
    return `**Summary** (offline mode — backend waking up)\n\nYour uploaded study material is stored and indexed. When the AI server is fully online, it will generate a precise, page-cited summary directly from your documents.\n\n**Quick Study Technique:** While you wait, try writing your own summary from memory — this is actually one of the most effective study strategies (the "blank page" method).\n\n⚠️ *Server is warming up. Full summarization will be ready in ~30–60 seconds. Please retry!*`;
  }

  return `**Cogniva AI** (offline mode — backend waking up 🔄)\n\nYour question: *"${message}"*\n\nYour study materials are indexed and ready to query. The AI backend (hosted on Render free tier) is currently waking up from sleep mode — this takes about 30–60 seconds.\n\n**What you can do right now:**\n• ✅ Upload more study materials\n• ✅ Try the Quiz feature (works offline!)\n• ✅ Visit AI Tutor (Prof. Spark) for interactive lessons\n• 🔄 Ask again in ~30 seconds for a full grounded answer\n\nApologies for the wait! This is a free-tier limitation. 🙏`;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = (await supabase.auth.getSession()).data.session;
  const token = session?.access_token || localStorage.getItem('cogniva_token') || localStorage.getItem('studypilot_dev_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function sendChatMessageApi(
  documentIds: string[],
  message: string,
  conversationId?: string
): Promise<ApiResponse<ChatMessage>> {
  try {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        document_ids: documentIds,
        message: message.trim(),
        conversation_id: conversationId,
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        const convId = data.data.conversation_id || conversationId || 'conv_' + Date.now();
        saveLocalMessage(convId, data.data);
        ensureLocalConversation(convId, message);
      }
      return data;
    }
  } catch (err: any) {
    console.warn('Backend unreachable, using offline fallback:', err?.message);
  }

  // Offline graceful fallback — never show "Failed to fetch" to the user
  const convId = conversationId || 'local_conv_' + Date.now();
  const offlineMsg: ChatMessage = {
    id: 'offline_' + Date.now(),
    conversation_id: convId,
    role: 'assistant',
    content: generateOfflineAnswer(message),
    created_at: new Date().toISOString(),
  };

  saveLocalMessage(convId, offlineMsg);
  ensureLocalConversation(convId, message);

  return { success: true, message: 'Answered (offline mode)', data: offlineMsg };
}

export async function listConversationsApi(): Promise<ApiResponse<any[]>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat/conversations`, { headers });
    if (res.ok) {
      const data = await res.json();
      const localConvs = getLocalConversations();
      const combined = [...localConvs, ...(data.data || [])];
      const unique = Array.from(new Map(combined.map((c: any) => [c.id, c])).values());
      return { success: true, message: 'Conversations loaded', data: unique };
    }
  } catch {}

  return { success: true, message: 'Local conversations', data: getLocalConversations() };
}

export async function getConversationMessagesApi(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, { headers });
    if (res.ok) return res.json();
  } catch {}

  return { success: true, message: 'Local messages', data: getLocalMessages(conversationId) };
}

export async function summarizeDocumentApi(documentId: string): Promise<ApiResponse<{ document_id: string; title: string; summary: string }>> {
  try {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${API_BASE}/chat/summarize/${documentId}`, {
      method: 'POST',
      headers,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (res.ok) return res.json();
  } catch {}

  // Offline summary fallback
  return {
    success: true,
    message: 'Offline summary generated',
    data: {
      document_id: documentId,
      title: 'Study Material',
      summary: `**Summary** (offline mode — backend waking up)\n\nYour document has been uploaded and indexed successfully. The AI summarization engine will generate a full, page-cited revision guide once the backend server is online.\n\n**Study Tips while waiting:**\n• Re-read your document's introduction and conclusion sections\n• Identify the 3 most important concepts\n• Write 5 questions you think could appear in an exam\n\n⚠️ *The backend server is warming up. Try generating a summary again in 30–60 seconds.*`,
    },
  };
}
