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
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { api } from '../api/client';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState<string>('checking...');

  useEffect(() => {
    api.checkHealth().then((res) => {
      if (res.success && res.data) {
        const data = res.data as { status: string; version: string };
        setApiStatus(`Cogniva AI ${data.status} (v${data.version})`);
      } else {
        setApiStatus('Cogniva Standby');
      }
    });
  }, []);

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
              Welcome back, {user?.full_name || user?.email?.split('@')[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Your personal AI learning workspace is ready. Ask questions with grounded citations, generate active recall quizzes, or review learning insights.
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
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-xs text-slate-500 mt-1">PDFs indexed for retrieval</div>
        </Card>
        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Questions Asked</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"><MessageSquare className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-xs text-slate-500 mt-1">Grounded study queries</div>
        </Card>
        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quizzes Completed</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><HelpCircle className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-xs text-slate-500 mt-1">Active recall sessions</div>
        </Card>
        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">--%</div>
          <div className="text-xs text-slate-500 mt-1">Across all quiz attempts</div>
        </Card>
      </div>

      {/* Main Workspace Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                Your Study Material
              </h3>
              <Link to="/documents" className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">No study material uploaded yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Upload your first lecture PDF or study guide to unlock grounded chat and quiz generation with Cogniva AI.
              </p>
              <Link to="/documents">
                <Button size="sm" icon={<UploadCloud className="w-3.5 h-3.5" />}>
                  Upload Material
                </Button>
              </Link>
            </div>
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
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <span className="text-xs text-slate-500">Take your first quiz to generate learning insights</span>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950/30">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Study Strategy Tip
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use <strong>Ask Cogniva AI</strong> to clarify difficult concepts, then immediately generate a <strong>5-question Medium quiz</strong> to test your active recall!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
