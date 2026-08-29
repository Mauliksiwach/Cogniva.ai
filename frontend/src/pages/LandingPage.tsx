import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BrainCircuit, HelpCircle, TrendingUp, ArrowRight, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge variant="brand" size="md" className="mb-6 px-4 py-1.5 shadow-md shadow-brand-500/10">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Your AI-Powered Learning Companion
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Transform Your Study Material into an <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Interactive Experience</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Turn your study material into an interactive learning experience. Ask questions, generate quizzes, understand difficult concepts, and track your progress — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto px-8">
                Start Learning
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80 pt-10 text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Grounded Source Citations</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-400">&lt; 2s</div>
              <div className="text-xs text-slate-400 mt-0.5">Instant PDF Processing</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">Active Recall</div>
              <div className="text-xs text-slate-400 mt-0.5">Custom Difficulty Quizzes</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">Zero Leak</div>
              <div className="text-xs text-slate-400 mt-0.5">Postgres RLS Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">Engineered for Deep Comprehension</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Cogniva AI combines deterministic retrieval with generative intelligence to help you master university coursework.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover glow>
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5 text-brand-400">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ask Cogniva AI</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ask anything about your uploaded study materials. Answers cite exact document pages and paragraph excerpts with zero hallucinations.
              </p>
            </Card>

            <Card hover glow>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cogniva Quiz Generator</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transform any lecture slide deck or textbook chapter into active-recall multiple-choice quizzes tailored by difficulty.
              </p>
            </Card>

            <Card hover glow>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Learning Insights</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Monitor mastery over time, pinpoint conceptual vulnerabilities, and get targeted recommendations before exams.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">How Cogniva AI Works</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              A 3-step streamlined learning workflow designed for cognitive retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-900/30 border border-slate-800">
              <span className="text-4xl font-extrabold text-brand-500/30 mb-4">01</span>
              <h4 className="text-lg font-bold text-white mb-2">Upload Study Material</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload lecture slides, notes, or textbook chapters. Cogniva AI parses, cleans, and indexes content securely.
              </p>
            </div>

            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-900/30 border border-slate-800">
              <span className="text-4xl font-extrabold text-brand-500/30 mb-4">02</span>
              <h4 className="text-lg font-bold text-white mb-2">Ask & Test Yourself</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ask questions to understand difficult concepts, generate revision summaries, and take practice quizzes to test active recall.
              </p>
            </div>

            <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-900/30 border border-slate-800">
              <span className="text-4xl font-extrabold text-brand-500/30 mb-4">03</span>
              <h4 className="text-lg font-bold text-white mb-2">Track Learning Insights</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Review detailed explanations for mistakes, track your quiz scores, and focus revision on identified weak topics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Cogniva AI</span>
            <span className="text-slate-500 text-xs ml-2">© 2026 — Your AI-Powered Learning Companion</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Start Learning</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
