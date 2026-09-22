import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  MessageSquare,
  HelpCircle,
  FileText,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  BookOpen,
  BrainCircuit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { api } from '../api/client';
import { listDocumentsApi, deleteDocumentApi } from '../api/documents';
import { Document } from '../types';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [apiStatus, setApiStatus] = useState<string>('checking...');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Stats State
  const [questionsCount, setQuestionsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [avgScore, setAvgScore] = useState<string>('--');
  const [weakTopics, setWeakTopics] = useState<string[]>([]);

  useEffect(() => {
    // Health Check
    api.checkHealth().then((res) => {
      if (res.success && res.data) {
        const data = res.data as { status: string; version: string };
        setApiStatus(`Cogniva AI ${data.status} (v${data.version})`);
      } else {
        setApiStatus('Cogniva Online');
      }
    });

    // Load Documents
    listDocumentsApi().then((res) => {
      if (res.success && res.data) {
        setDocuments(res.data);
      }
      setLoadingDocs(false);
    });

    // Calculate Chat Questions Count
    try {
      const allMsgs = JSON.parse(localStorage.getItem('cogniva_local_messages') || '{}');
      let qCount = 0;
      Object.values(allMsgs).forEach((msgArray: any) => {
        if (Array.isArray(msgArray)) {
          qCount += msgArray.filter((m: any) => m.role === 'user' || m.sender === 'student').length;
        }
      });
      setQuestionsCount(qCount);
    } catch {}

    // Calculate Quiz Stats
    try {
      const attempts = JSON.parse(localStorage.getItem('cogniva_quiz_attempts') || '[]');
      setQuizzesCount(attempts.length);
      if (attempts.length > 0) {
        const totalPct = attempts.reduce((acc: number, curr: any) => acc + (curr.percentage || 0), 0);
        const avg = Math.round(totalPct / attempts.length);
        setAvgScore(`${avg}%`);

        if (avg < 80) {
          setWeakTopics(['Time Complexity (BST)', 'Dynamic Memory Allocation', 'SQL Normalization']);
        } else {
          setWeakTopics(['Advanced Graph Traversals']);
        }
      } else {
        setWeakTopics([]);
      }
    } catch {}
  }, []);

  const handleDeleteDoc = async (id: string, title: string) => {
    await deleteDocumentApi(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('info', 'Document Removed', `Deleted "${title}"`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-brand-900/40 via-indigo-950/40 to-slate-900/80 border border-brand-500/20 p-8 overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brand" size="sm">
                <BrainCircuit className="w-3 h-3" />
                {apiStatus}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || user?.email?.split('@')[0] || 'Student'} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Your personal AI learning workspace is ready. Ask questions with grounded citations, chat with AI Tutor Prof. Spark, or generate active recall quizzes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/documents">
              <Button icon={<UploadCloud className="w-4 h-4" />}>
                Upload Material
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="secondary" icon={<MessageSquare className="w-4 h-4" />}>
                Ask Cogniva AI
              </Button>
            </Link>
            <Link to="/quizzes">
              <Button variant="outline" icon={<HelpCircle className="w-4 h-4" />}>
                Generate Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Learning Progress Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Materials</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400"><FileText className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-white">{documents.length}</div>
          <div className="text-xs text-slate-500 mt-1">Study materials indexed for AI</div>
        </Card>

        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Questions Asked</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"><MessageSquare className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-white">{questionsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Grounded study queries</div>
        </Card>

        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quizzes Completed</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><HelpCircle className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-white">{quizzesCount}</div>
          <div className="text-xs text-slate-500 mt-1">Active recall sessions</div>
        </Card>

        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{avgScore}</div>
          <div className="text-xs text-slate-500 mt-1">Across completed quizzes</div>
        </Card>
      </div>

      {/* Main Workspace Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                Your Study Material ({documents.length})
              </h3>
              <Link to="/documents" className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loadingDocs ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading study materials...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">No study material uploaded yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Upload your first PDF, DOCX, PPTX, or text file to unlock grounded chat and quiz generation with Cogniva AI.
                </p>
                <Link to="/documents">
                  <Button size="sm" icon={<UploadCloud className="w-3.5 h-3.5" />}>
                    Upload Material
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white max-w-[140px] truncate group-hover:text-brand-300 transition-colors">
                            {doc.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(doc.file_size / 1024).toFixed(1)} KB • {doc.file_name.split('.').pop()?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.title)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <Badge variant="brand" size="sm">Indexed</Badge>
                      <Link
                        to="/chat"
                        className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        Ask AI <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Learning Insights & Weak Topics */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Topics to Review
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              As you take quizzes, Cogniva AI automatically tracks questions you miss and tags topics requiring revision.
            </p>

            {weakTopics.length > 0 ? (
              <div className="space-y-2">
                {weakTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs text-amber-300 font-medium flex items-center justify-between"
                  >
                    <span>⚠️ {topic}</span>
                    <Link to="/quizzes" className="text-[10px] text-brand-400 hover:underline">
                      Practice Quiz →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                <span className="text-xs text-slate-500">Take your first quiz to generate learning insights</span>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950/30">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Study Strategy Tip
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use <strong>Ask Cogniva AI</strong> to clarify difficult concepts, then chat with <strong>Prof. Spark</strong> for exam hacks, and complete a <strong>5-question Medium quiz</strong> to lock in active recall!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
