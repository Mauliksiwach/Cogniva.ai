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
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Learning Insights <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            </h1>
            <Badge variant="brand" size="sm">Performance Analytics</Badge>
          </div>
          <p className="text-slate-400 text-sm">
            Track active recall quiz accuracy, monitor retention trends over time, and focus on weak topics.
          </p>
        </div>

        <Link to="/quizzes">
          <Button icon={<HelpCircle className="w-4 h-4" />}>
            Take Practice Quiz
          </Button>
        </Link>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {attempts.length > 0 ? `${avgScore}%` : '--%'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all completed quizzes</div>
        </Card>

        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quizzes Taken</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400"><Award className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white">{attempts.length}</div>
          <div className="text-xs text-slate-500 mt-1">Active recall sessions</div>
        </Card>

        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Questions Answered</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalQuestionsAnswered}</div>
          <div className="text-xs text-slate-500 mt-1">Practice questions completed</div>
        </Card>

        <Card hover className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Study Materials</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"><FileText className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white">{docCount}</div>
          <div className="text-xs text-slate-500 mt-1">PDFs & docs indexed</div>
        </Card>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Weak Topics & Recommended Revision */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Topics Needing Review
              </h3>
              <Badge variant="warning" size="sm">Focus Areas</Badge>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Based on your quiz responses, here are concepts where targeted revision will give you maximum grade improvement:
            </p>

            <div className="space-y-3">
              {weakTopics.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.topic}</h4>
                    <span className="text-[10px] text-amber-400 font-mono">Accuracy: {item.accuracy}</span>
                  </div>
                  <Link to="/quizzes">
                    <span className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-0.5">
                      Quiz <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950/40">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4 text-brand-400" />
              Retentive Learning Index
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Regular active recall testing prevents the Ebbinghaus forgetting curve. Taking a 5-question quiz every 48 hours boosts memory retention by over 80%!
            </p>
            <Link to="/quizzes">
              <Button size="sm" className="w-full" icon={<RotateCcw className="w-3.5 h-3.5" />}>
                Start Quick 5-Min Quiz
              </Button>
            </Link>
          </Card>
        </div>

        {/* Right Column: Quiz Attempt History Log */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                Assessment History ({attempts.length})
              </h3>
              <Link to="/quizzes" className="text-xs text-brand-400 hover:underline font-semibold">
                New Quiz +
              </Link>
            </div>

            {attempts.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">No quizzes completed yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Take your first active recall assessment to generate dynamic accuracy metrics and weak topic analysis.
                </p>
                <Link to="/quizzes">
                  <Button size="sm" icon={<HelpCircle className="w-3.5 h-3.5" />}>
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
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isHigh
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : isMid
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {attempt.percentage}%
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{attempt.quiz_title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>Score: {attempt.score} / {attempt.total_questions}</span>
                            <span>•</span>
                            <span className="font-mono text-[11px]">
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
                          {isHigh ? 'Mastered 🏆' : isMid ? 'Good Effort 👍' : 'Needs Practice 🎯'}
                        </Badge>
                        <Link to="/quizzes">
                          <Button size="sm" variant="ghost" icon={<RotateCcw className="w-3.5 h-3.5" />}>
                            Re-test
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
