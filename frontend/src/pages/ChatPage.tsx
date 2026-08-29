import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  FileText,
  BookOpen,
  Check,
  Copy,
  Info,
  Layers,
  ChevronDown,
  Plus,
  MessageSquare,
  UploadCloud,
  FileCheck,
  Compass,
  ArrowRight,
  ExternalLink,
  BookMarked
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { listDocumentsApi } from '../api/documents';
import {
  sendChatMessageApi,
  listConversationsApi,
  getConversationMessagesApi,
  summarizeDocumentApi
} from '../api/chat';
import { Document, ChatMessage, CitationSource } from '../types';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Conversations
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  // Citation Detail Modal
  const [activeCitation, setActiveCitation] = useState<CitationSource | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load documents on mount
  useEffect(() => {
    const initData = async () => {
      setLoadingDocs(true);
      const docsRes = await listDocumentsApi();
      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data);
        // Default: select first document or all
        if (docsRes.data.length > 0) {
          setSelectedDocIds([docsRes.data[0].id]);
        }
      }

      const convRes = await listConversationsApi();
      if (convRes.success && convRes.data) {
        setConversations(convRes.data);
      }
      setLoadingDocs(false);
    };

    initData();
  }, []);

  const handleSelectConversation = async (convId: string) => {
    setCurrentConversationId(convId);
    const res = await getConversationMessagesApi(convId);
    if (res.success && res.data) {
      setMessages(res.data);
    }
  };

  const handleStartNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleToggleDocSelection = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId)
        ? prev.length > 1
          ? prev.filter((id) => id !== docId)
          : prev
        : [...prev, docId]
    );
  };

  const handleSendMessage = async (customText?: string) => {
    const query = customText || inputMessage;
    if (!query.trim()) return;
    if (selectedDocIds.length === 0) {
      showToast('warning', 'Select Material', 'Please select at least one document to ask questions about.');
      return;
    }

    const tempUserMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: currentConversationId || 'temp',
      role: 'user',
      content: query.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage('');
    setSending(true);

    const res = await sendChatMessageApi(
      selectedDocIds,
      query,
      currentConversationId || undefined
    );

    setSending(false);

    if (res.success && res.data) {
      const assistantMsg = res.data;
      if (!currentConversationId) {
        setCurrentConversationId(assistantMsg.conversation_id);
      }
      setMessages((prev) => [...prev, assistantMsg]);
      // Refresh conversations list
      listConversationsApi().then((r) => r.data && setConversations(r.data));
    } else {
      showToast('error', 'Query Failed', res.message || 'Failed to get answer.');
    }
  };

  const handleSummarizeDoc = async () => {
    if (selectedDocIds.length === 0) return;
    const docId = selectedDocIds[0];
    const doc = documents.find((d) => d.id === docId);

    setSummarizing(true);
    showToast('info', 'Generating Summary', `Synthesizing revision guide for ${doc?.title || 'material'}...`);

    const res = await summarizeDocumentApi(docId);
    setSummarizing(false);

    if (res.success && res.data) {
      const summaryMsg: ChatMessage = {
        id: 'sum-' + Date.now(),
        conversation_id: currentConversationId || 'temp',
        role: 'assistant',
        content: res.data.summary,
        sources: [
          {
            document_id: docId,
            document_title: doc?.title || 'Material',
            page_number: 1,
            snippet: 'Complete document summary synthesized across all extracted pages.',
          },
        ],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, summaryMsg]);
      showToast('success', 'Summary Ready', 'Structured revision notes generated.');
    } else {
      showToast('error', 'Summarization Failed', res.message || 'Could not summarize.');
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('info', 'Copied to clipboard', 'Response text copied.');
  };

  const starterPrompts = [
    'What are the core concepts and key terms?',
    'Summarize the main takeaways in bullet points',
    'Explain the most important formulas or principles',
    'Give a real-world example of the concepts discussed',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -my-4 animate-in fade-in duration-300">
      {/* Top Header & Multi-Document Selector */}
      <div className="bg-slate-900/80 border-b border-slate-800 p-4 rounded-t-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Ask Cogniva AI
              <Badge variant="brand" size="sm">RAG Engine</Badge>
            </h1>
            <p className="text-xs text-slate-400">
              Answers strictly cite pages & paragraphs from your uploaded materials.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {documents.length > 0 && selectedDocIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummarizeDoc}
              loading={summarizing}
              icon={<BookMarked className="w-3.5 h-3.5 text-brand-400" />}
            >
              Generate Summary
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStartNewChat}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* Target Document Selector Strip */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0 flex items-center gap-1">
          <Layers className="w-3 h-3 text-brand-400" /> Active Materials:
        </span>
        {loadingDocs ? (
          <Skeleton className="h-6 w-48 rounded-full" />
        ) : documents.length === 0 ? (
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>No documents uploaded.</span>
            <Link to="/documents" className="text-brand-400 hover:underline font-medium">
              Upload PDF
            </Link>
          </div>
        ) : (
          documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id);
            return (
              <button
                key={doc.id}
                onClick={() => handleToggleDocSelection(doc.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all shrink-0 font-medium ${
                  isSelected
                    ? 'bg-brand-600/20 border-brand-500/40 text-brand-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span className="max-w-[140px] truncate">{doc.title}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 ml-0.5" />}
              </button>
            );
          })
        )}
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 bg-slate-950/40 overflow-y-auto p-4 sm:p-6 space-y-6">
        {documents.length === 0 && !loadingDocs ? (
          <Card className="p-12 text-center max-w-lg mx-auto mt-12 border-dashed">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4 text-brand-400">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Upload Materials to Start Chatting</h3>
            <p className="text-slate-400 text-sm mb-6">
              Cogniva AI needs your study materials or notes to retrieve and cite accurate answers.
            </p>
            <Link to="/documents">
              <Button icon={<Plus className="w-4 h-4" />}>
                Upload Study Material
              </Button>
            </Link>
          </Card>
        ) : messages.length === 0 ? (
          /* Empty Chat Welcome Screen */
          <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600/20 to-indigo-500/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400 shadow-xl shadow-brand-500/10">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Ask anything about your study material
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Every response is mathematically retrieved and verified against your documents.
              </p>
            </div>

            {/* Quick Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 hover:bg-slate-900 transition-all text-xs text-slate-300 hover:text-white flex items-center justify-between gap-2 group"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-brand-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed shadow-lg ${
                        isUser
                          ? 'bg-brand-600 text-white rounded-tr-none'
                          : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                      {/* Source Citations for Assistant */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-brand-400" />
                            Grounded Sources ({msg.sources.length}):
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((source, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => setActiveCitation(source)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-brand-500/30 hover:border-brand-400 text-brand-300 text-xs font-mono transition-colors shadow-sm"
                              >
                                <FileText className="w-3 h-3 text-brand-400" />
                                <span>{source.document_title}</span>
                                <span className="px-1.5 py-0.2 bg-brand-500/20 rounded text-[10px] text-brand-200">
                                  p. {source.page_number}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions (Timestamp & Copy) */}
                    <div className="flex items-center gap-2 mt-1.5 px-1 text-[11px] text-slate-500">
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!isUser && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => handleCopyText(msg.id, msg.content)}
                            className="hover:text-slate-300 transition-colors flex items-center gap-1"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              );
            })}

            {sending && (
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Retrieving and grounding answer against your study materials...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 rounded-b-2xl backdrop-blur-md shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-4xl mx-auto flex items-center gap-3"
        >
          <input
            type="text"
            placeholder={
              selectedDocIds.length > 0
                ? "Ask a question about your selected study material..."
                : "Select a document above to ask questions..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={sending || documents.length === 0}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />

          <Button
            type="submit"
            disabled={!inputMessage.trim() || sending || documents.length === 0}
            loading={sending}
            icon={<Send className="w-4 h-4" />}
            className="px-5 py-3 rounded-xl"
          >
            Ask
          </Button>
        </form>
      </div>

      {/* Citation Source Inspector Modal */}
      <Modal
        isOpen={!!activeCitation}
        onClose={() => setActiveCitation(null)}
        title="Grounded Citation Source"
        maxWidth="lg"
      >
        {activeCitation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400">
              <span className="font-semibold text-white">{activeCitation.document_title}</span>
              <Badge variant="brand" size="sm">Page {activeCitation.page_number}</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Extracted Document Excerpt:
              </label>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {activeCitation.snippet}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-brand-400" />
                Deterministic page provenance verified
              </span>
              <Button size="sm" onClick={() => setActiveCitation(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
