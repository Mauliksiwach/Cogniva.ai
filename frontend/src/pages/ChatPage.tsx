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
  Plus,
  UploadCloud,
  ArrowRight,
  BookMarked,
  Globe
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
import { FormattedText } from '../components/common/FormattedText';

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

  const handleStartNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleToggleDocSelection = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectGeneralMode = () => {
    setSelectedDocIds([]);
  };

  const handleSendMessage = async (customText?: string) => {
    const query = customText || inputMessage;
    if (!query.trim() || sending) return;

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
      listConversationsApi().then((r) => r.data && setConversations(r.data)).catch(() => {});
    } else {
      showToast('error', 'Query Failed', res.message || 'Could not process your question. Please try again.');
    }
  };

  const handleSummarizeDoc = async () => {
    if (selectedDocIds.length === 0) return;
    const docId = selectedDocIds[0];
    const doc = documents.find((d) => d.id === docId);

    setSummarizing(true);
    showToast('info', 'Synthesizing Summary', `Distilling core concepts from ${doc?.title || 'material'}...`);

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
    'How do I start a business step-by-step?',
    'What are the core concepts and key terms?',
    'How to prepare for technical job interviews?',
    'Explain the most important formulas or principles',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] -my-3 animate-fade-in-up">
      {/* Top Header & Context Controls */}
      <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-t-3xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Ask Cogniva AI
              </h1>
              <Badge variant={selectedDocIds.length > 0 ? "brand" : "info"} size="xs" dot>
                {selectedDocIds.length > 0 ? "Grounded RAG" : "Open Intelligence"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedDocIds.length > 0
                ? "Grounded on your uploaded readings with citations, plus broad AI intelligence for general topics."
                : "Ask anything freely: business, career, code, sciences, or study strategies."}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {documents.length > 0 && selectedDocIds.length > 0 && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleSummarizeDoc}
              loading={summarizing}
              icon={<BookMarked className="w-3.5 h-3.5 text-brand-400" />}
            >
              Generate Summary
            </Button>
          )}
          <Button
            variant="secondary"
            size="xs"
            onClick={handleStartNewChat}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* Target Document Selector Strip */}
      <div className="bg-slate-950/80 border-x border-b border-slate-800/70 px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0 flex items-center gap-1.5 font-mono">
          <Layers className="w-3 h-3 text-brand-400" /> Mode:
        </span>

        {/* General AI Mode Pill */}
        <button
          onClick={handleSelectGeneralMode}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-all shrink-0 font-medium ${
            selectedDocIds.length === 0
              ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 shadow-glow-amber'
              : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>Open AI Mode</span>
          {selectedDocIds.length === 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5 animate-pulse" />}
        </button>

        {loadingDocs ? (
          <Skeleton className="h-6 w-44 rounded-full" />
        ) : (
          documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id);
            return (
              <button
                key={doc.id}
                onClick={() => handleToggleDocSelection(doc.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-all shrink-0 font-medium ${
                  isSelected
                    ? 'bg-brand-500/15 border-brand-500/40 text-brand-300 shadow-glow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span className="max-w-[130px] truncate">{doc.title}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 ml-0.5 animate-pulse" />}
              </button>
            );
          })
        )}

        {documents.length === 0 && !loadingDocs && (
          <Link to="/documents" className="text-[11px] text-brand-400 hover:text-brand-300 ml-2 font-medium shrink-0">
            + Upload Material for Citations
          </Link>
        )}
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 bg-slate-950/50 border-x border-slate-800/60 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty Chat Welcome Screen */
          <div className="max-w-2xl mx-auto py-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600/20 to-indigo-500/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400 shadow-glow-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Ask Cogniva AI Anything
              </h3>
              <p className="text-slate-400 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
                {selectedDocIds.length > 0
                  ? "Answers ground directly in your selected course materials with citations, or use general intelligence for open queries."
                  : "Ask any academic, career, business, or coding question. Cogniva AI is ready to help."}
              </p>
            </div>

            {/* Quick Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-brand-500/40 hover:bg-slate-900/90 transition-all text-xs text-slate-300 hover:text-white flex items-center justify-between gap-2.5 group"
                >
                  <span className="leading-relaxed">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-4xl mx-auto space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-brand-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-card ${
                        isUser
                          ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900/90 border border-slate-800/80 text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <FormattedText content={msg.content} />

                      {/* Source Citations for Assistant */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                            <Layers className="w-3 h-3 text-brand-400" />
                            Grounded Citations ({msg.sources.length}):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((source, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => setActiveCitation(source)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-brand-500/25 hover:border-brand-400/50 text-brand-300 text-xs font-mono transition-colors shadow-sm"
                              >
                                <FileText className="w-3 h-3 text-brand-400" />
                                <span className="max-w-[120px] truncate">{source.document_title}</span>
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
                    <div className="flex items-center gap-2 mt-1.5 px-1 text-[10px] text-slate-500">
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
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs shrink-0">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              );
            })}

            {sending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-brand-sm">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Cogniva AI is thinking and formulating response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-x border-b border-slate-800/80 rounded-b-3xl backdrop-blur-xl shrink-0 shadow-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2.5"
        >
          <input
            type="text"
            placeholder={
              selectedDocIds.length > 0
                ? "Ask anything about your study material, or any general question (e.g. 'How to start a business')..."
                : "Ask Cogniva AI anything (general knowledge, coding, career, business, concepts)..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={sending}
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all shadow-inner"
          />

          <Button
            type="submit"
            disabled={!inputMessage.trim() || sending}
            loading={sending}
            icon={<Send className="w-3.5 h-3.5" />}
            size="sm"
            className="rounded-2xl px-5"
          >
            Ask
          </Button>
        </form>
      </div>

      {/* Citation Source Modal */}
      <Modal
        isOpen={!!activeCitation}
        onClose={() => setActiveCitation(null)}
        title="Grounded Citation Source"
        maxWidth="lg"
      >
        {activeCitation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400 font-mono">
              <span className="font-semibold text-white">{activeCitation.document_title}</span>
              <Badge variant="brand" size="xs">Page {activeCitation.page_number}</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Document Excerpt:
              </label>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {activeCitation.snippet}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <Info className="w-3.5 h-3.5 text-brand-400" />
                Verified source provenance
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
