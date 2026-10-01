import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud, MessageSquare, HelpCircle, FileText, TrendingUp,
  ArrowRight, AlertTriangle, Sparkles, BrainCircuit, Trash2,
  Zap, Target, BookOpen, ChevronRight, Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { api } from '../api/client';
import { listDocumentsApi, deleteDocumentApi } from '../api/documents';
import { Document } from '../types';
import { useToast } from '../context/ToastContext';

/* ── Metric Card ─────────────────────────────────────────────── */
const MetricCard = ({
  label, value, sub, icon: Icon, color, bg, delay = ''
}: {
  label: string; value: React.ReactNode; sub: string;
  icon: React.ElementType; color: string; bg: string; delay?: string;
}) => (
  <Card hover className={`p-5 animate-fade-in-up ${delay}`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500" />
    </div>
    <div className="text-2xl font-black text-white tracking-tight animate-count-up">{value}</div>
    <div className="text-xs font-semibold text-slate-400 mt-0.5">{label}</div>
    <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
  </Card>
);

/* ── Quick Action ─────────────────────────────────────────────── */
const QuickAction = ({
  to, icon: Icon, label, desc, color, bg
}: {
  to: string; icon: React.ElementType; label: string; desc: string; color: string; bg: string;
}) => (
  <Link to={to}>
    <div className={`group flex items-center gap-3 p-4 rounded-2xl border border-transparent hover:border-slate-700/60 hover:bg-slate-800/50 transition-all duration-200`}>
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0 group-hover:scale-105 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{label}</div>
        <div className="text-[10px] text-slate-500">{desc}</div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 shrink-0 transition-colors" />
    </div>
  </Link>
);

/* ── Main ─────────────────────────────────────────────────────── */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [apiStatus, setApiStatus] = useState<string>('Online');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [avgScore, setAvgScore] = useState<string>('--');
  const [weakTopics, setWeakTopics] = useState<string[]>([]);

  useEffect(() => {
    api.checkHealth().then((res) => {
      if (res.success && res.data) {
        const d = res.data as { status: string; version: string };
        setApiStatus(`v${d.version} · ${d.status}`);
      }
    });

    listDocumentsApi().then((res) => {
      if (res.success && res.data) setDocuments(res.data);
      setLoadingDocs(false);
    });

    try {
      const allMsgs = JSON.parse(localStorage.getItem('cogniva_local_messages') || '{}');
      let q = 0;
      Object.values(allMsgs).forEach((msgs: any) => {
        if (Array.isArray(msgs)) q += msgs.filter((m: any) => m.role === 'user' || m.sender === 'student').length;
      });
      setQuestionsCount(q);
    } catch {}

    try {
      const attempts = JSON.parse(localStorage.getItem('cogniva_quiz_attempts') || '[]');
      setQuizzesCount(attempts.length);
      if (attempts.length > 0) {
        const avg = Math.round(attempts.reduce((acc: number, c: any) => acc + (c.percentage || 0), 0) / attempts.length);
        setAvgScore(`${avg}%`);
        setWeakTopics(avg < 80
          ? ['Time Complexity & BST', 'Dynamic Memory Allocation', 'SQL Normalization']
          : ['Advanced Graph Traversals']);
      }
    } catch {}
  }, []);

  const handleDeleteDoc = async (id: string, title: string) => {
    await deleteDocumentApi(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('info', 'Removed', `"${title}" deleted from workspace.`);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-7 animate-fade-in-up">

      {/* ── Hero Banner ───────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-brand-500/15 bg-gradient-to-br from-brand-950/60 via-slate-900/80 to-slate-950 p-7 shadow-glow-sm">
        {/* ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-violet-500/8 rounded-full blur-[60px] pointer-events-none" />
        {/* grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="brand" size="sm" dot>
                <Activity className="w-3 h-3" />
                {apiStatus}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {greeting()},{' '}
              <span className="text-gradient">
                {user?.full_name || user?.email?.split('@')[0] || 'Student'}
              </span>{' '}
              👋
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-lg leading-relaxed">
              Your AI learning workspace is ready. Upload material, chat with Cogniva AI,
              ask Prof. Spark, or generate a smart quiz to test your recall.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to="/documents">
              <Button icon={<UploadCloud className="w-3.5 h-3.5" />} size="sm">
                Upload Material
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="secondary" icon={<MessageSquare className="w-3.5 h-3.5" />} size="sm">
                Ask Cogniva AI
              </Button>
            </Link>
            <Link to="/quizzes">
              <Button variant="outline" icon={<HelpCircle className="w-3.5 h-3.5" />} size="sm">
                Generate Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metrics Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Study Materials" value={documents.length}
          sub="Indexed for AI grounding"
          icon={FileText} color="text-brand-400" bg="bg-brand-500/10 border border-brand-500/20"
          delay="delay-50"
        />
        <MetricCard
          label="Questions Asked" value={questionsCount}
          sub="Grounded study queries"
          icon={MessageSquare} color="text-indigo-400" bg="bg-indigo-500/10 border border-indigo-500/20"
          delay="delay-100"
        />
        <MetricCard
          label="Quizzes Completed" value={quizzesCount}
          sub="Active recall sessions"
          icon={Target} color="text-violet-400" bg="bg-violet-500/10 border border-violet-500/20"
          delay="delay-150"
        />
        <MetricCard
          label="Average Score"
          value={<span className={avgScore === '--' ? 'text-slate-500' : 'text-emerald-400'}>{avgScore}</span>}
          sub="Across all quiz attempts"
          icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-500/10 border border-emerald-500/20"
          delay="delay-200"
        />
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Study Material feed */}
        <div className="lg:col-span-2">
          <Card className="p-6 animate-fade-in-up delay-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-brand-400" />
                </div>
                Study Material
                <span className="text-slate-600 font-normal text-xs">({documents.length})</span>
              </h3>
              <Link to="/documents" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition-colors">
                Manage all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loadingDocs ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-slate-800/40 animate-pulse" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/30">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300 mb-1">No materials yet</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto mb-5 leading-relaxed">
                  Upload your first PDF, DOCX, or PPTX to unlock grounded AI chat, smart quizzes, and more.
                </p>
                <Link to="/documents">
                  <Button size="sm" icon={<UploadCloud className="w-3.5 h-3.5" />}>
                    Upload Your First File
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="group p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 hover:border-brand-500/30 hover:bg-slate-900/80 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors max-w-[140px]">
                            {doc.title}
                          </h4>
                          <span className="text-[10px] text-slate-600 font-mono">
                            {(doc.file_size / 1024).toFixed(1)} KB · {doc.file_name.split('.').pop()?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.title)}
                        className="p-1.5 rounded-lg text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="success" size="xs" dot>Indexed</Badge>
                      <Link to="/chat" className="text-[10px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-0.5 transition-colors">
                        Ask AI <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <Card className="p-5 animate-fade-in-up delay-300">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-0.5">
              <QuickAction to="/ai-tutor"  icon={Sparkles}      label="Chat with Prof. Spark"   desc="AI tutor for any subject"     color="text-violet-400" bg="bg-violet-500/10 border border-violet-500/20" />
              <QuickAction to="/quizzes"   icon={HelpCircle}    label="Generate a Quiz"          desc="5, 10 or 20 questions"        color="text-emerald-400" bg="bg-emerald-500/10 border border-emerald-500/20" />
              <QuickAction to="/progress"  icon={TrendingUp}    label="View Learning Insights"   desc="Scores & weak topics"         color="text-amber-400"  bg="bg-amber-500/10 border border-amber-500/20" />
              <QuickAction to="/documents" icon={BookOpen}      label="Upload Study Material"    desc="PDF, DOCX, PPTX supported"   color="text-sky-400"   bg="bg-sky-500/10 border border-sky-500/20" />
            </div>
          </Card>

          {/* Weak Topics */}
          <Card className="p-5 animate-fade-in-up delay-400">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Topics to Revisit
            </h3>
            {weakTopics.length > 0 ? (
              <div className="space-y-2">
                {weakTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"
                  >
                    <span className="text-xs font-semibold text-amber-300 truncate">{topic}</span>
                    <Link to="/quizzes" className="text-[10px] text-brand-400 hover:text-brand-300 font-bold ml-2 shrink-0">
                      Quiz →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center rounded-xl bg-slate-900/40 border border-slate-800/40">
                <Target className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">
                  Take a quiz to discover<br />your weak areas
                </p>
              </div>
            )}
          </Card>

          {/* Study tip */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-950/60 to-violet-950/40 border border-brand-500/15 animate-fade-in-up delay-500">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Study Strategy</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Ask Cogniva AI</strong> to clarify a concept →{' '}
              <strong className="text-slate-300">Prof. Spark</strong> for exam hacks →{' '}
              <strong className="text-slate-300">5-question quiz</strong> to lock in recall.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
