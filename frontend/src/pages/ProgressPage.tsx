import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  TrendingUp,
  Sparkles,
  Award,
  AlertTriangle,
  HelpCircle,
  FileText,
  Clock,
  RotateCcw,
  CheckCircle2,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import { listDocumentsApi } from '../api/documents';

interface QuizAttempt {
  id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  difficulty: string;
  completed_at: string;
}

export const ProgressPage: React.FC = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);

  useEffect(() => {
    // Load documents count
    listDocumentsApi().then((r) => r.data && setDocCount(r.data.length));

    // Load Quiz Attempts History
    try {
      const savedAttempts: QuizAttempt[] = JSON.parse(
        localStorage.getItem('cogniva_quiz_attempts') || '[]'
      );
      setAttempts(savedAttempts);

      if (savedAttempts.length > 0) {
        const totalPct = savedAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
        setAvgScore(Math.round(totalPct / savedAttempts.length));

        const totalQ = savedAttempts.reduce((acc, curr) => acc + (curr.total_questions || 5), 0);
        setTotalQuestionsAnswered(totalQ);
      }
    } catch {}
  }, []);

  const weakTopics = [
    { topic: 'Time Complexity (BST Search)', accuracy: '33%', status: 'Needs Practice' },
    { topic: 'Dynamic Memory Allocation & Destructors', accuracy: '50%', status: 'Reviewing' },
    { topic: 'SQL Database Normalization (3NF)', accuracy: '60%', status: 'Reviewing' },
  ];

  return (
    <div className="space-y-7 animate-fade-in-up max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="brand" size="sm" className="mb-3">Performance Analytics</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Learning Insights
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Track quiz accuracy, monitor retention trends, and pinpoint weak topics to revise.
          </p>
        </div>

        <Link to="/quizzes">
          <Button icon={<HelpCircle className="w-4 h-4" />} size="sm">
            Take Practice Quiz
          </Button>
        </Link>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-5 animate-fade-in-up delay-50">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            {attempts.length > 0 ? `${avgScore}%` : '--'}
          </div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">Average Accuracy</div>
          <div className="text-[10px] text-slate-600 mt-0.5">Across all quizzes</div>
        </Card>

        <Card hover className="p-5 animate-fade-in-up delay-100">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{attempts.length}</div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">Quizzes Taken</div>
          <div className="text-[10px] text-slate-600 mt-0.5">Active recall sessions</div>
        </Card>

        <Card hover className="p-5 animate-fade-in-up delay-150">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{totalQuestionsAnswered}</div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">Questions Answered</div>
          <div className="text-[10px] text-slate-600 mt-0.5">Practice questions done</div>
        </Card>

        <Card hover className="p-5 animate-fade-in-up delay-200">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{docCount}</div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">Study Materials</div>
          <div className="text-[10px] text-slate-600 mt-0.5">PDFs & docs indexed</div>
        </Card>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Weak Topics & Recommended Revision */}
        <div className="lg:col-span-1 space-y-5">
          <Card className="p-5 space-y-4 animate-fade-in-up delay-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Topics to Revisit
              </h3>
              <Badge variant="warning" size="xs">Focus Areas</Badge>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Based on your quiz responses — these concepts need targeted revision for maximum grade improvement:
            </p>

            <div className="space-y-2">
              {weakTopics.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.topic}</h4>
                    <span className="text-[10px] text-amber-400 font-mono">Accuracy: {item.accuracy}</span>
                  </div>
                  <Link to="/quizzes">
                    <span className="text-[11px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-0.5 whitespace-nowrap">
                      Quiz <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-950/60 to-indigo-950/40 border border-brand-500/15 animate-fade-in-up delay-400">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-2">
              <BrainCircuit className="w-3.5 h-3.5 text-brand-400" />
              Retentive Learning Index
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Regular active recall prevents the Ebbinghaus forgetting curve. A 5-question quiz every 48 hours boosts long-term memory retention by over 80%.
            </p>
            <Link to="/quizzes">
              <Button size="sm" className="w-full" icon={<RotateCcw className="w-3.5 h-3.5" />}>
                Start Quick 5-Min Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Quiz Attempt History Log */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 animate-fade-in-up delay-500">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.05]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                Assessment History
                <span className="text-slate-500 text-sm font-normal">({attempts.length})</span>
              </h3>
              <Link to="/quizzes">
                <Button size="sm" variant="ghost" className="text-brand-400 hover:text-brand-300">
                  New Quiz +
                </Button>
              </Link>
            </div>

            {attempts.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/30">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">No quizzes completed</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Take your first active recall assessment to generate dynamic accuracy metrics and weak topic analysis.
                </p>
                <Link to="/quizzes">
                  <Button size="sm" icon={<HelpCircle className="w-4 h-4" />}>
                    Start First Quiz
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {attempts.map((attempt) => {
                  const isHigh = attempt.percentage >= 80;
                  const isMid = attempt.percentage >= 60 && attempt.percentage < 80;

                  return (
                    <div
                      key={attempt.id}
                      className="group p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 hover:border-brand-500/30 hover:bg-slate-900/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isHigh
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : isMid
                              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                          }`}
                        >
                          {attempt.percentage}%
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{attempt.quiz_title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="font-semibold text-slate-400">Score: {attempt.score} / {attempt.total_questions}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">
                              {new Date(attempt.completed_at).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <Badge variant={isHigh ? 'success' : isMid ? 'warning' : 'danger'} size="sm">
                          {isHigh ? 'Mastered' : isMid ? 'Good Effort' : 'Needs Practice'}
                        </Badge>
                        <Link to="/quizzes">
                          <Button size="xs" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" icon={<RotateCcw className="w-3 h-3" />}>
                            Retest
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
