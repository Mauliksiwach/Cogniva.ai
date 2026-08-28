import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BrainCircuit, HelpCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500/30">
      <Navbar />
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge variant="brand" size="md" className="mb-6 px-4 py-1.5 shadow-md shadow-brand-500/10">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI-Powered Study Copilot for University Students
          </Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Turn Your Study Notes Into <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Grounded Mastery</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload course slides, textbooks, and notes. Ask grounded questions with exact source citations, generate instant quizzes, and track your weak topics.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto px-8">
                Start Studying Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80 pt-10 text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Grounded Citations</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-400">&lt; 2s</div>
              <div className="text-xs text-slate-400 mt-0.5">Instant PDF Chunking</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">MCQ & Prep</div>
              <div className="text-xs text-slate-400 mt-0.5">Custom Difficulty Quizzes</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">Zero Leak</div>
              <div className="text-xs text-slate-400 mt-0.5">Postgres RLS Security</div>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="py-20 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">Built For Serious University Learning</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Not another generic ChatGPT wrapper. StudyPilot is a deterministic, retrieval-grounded engineering platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover glow>
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5 text-brand-400">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Grounded Document Q&A</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Answers cite exact document pages and paragraph snippets. When the material doesn’t contain the answer, StudyPilot tells you instead of fabricating.
              </p>
            </Card>
            <Card hover glow>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Quiz Generator</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transform any lecture slide deck or chapter into 5, 10, or 20 multiple-choice questions configured by difficulty (Easy, Medium, Hard).
              </p>
            </Card>
            <Card hover glow>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Weak Topic Mastery</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track your quiz progression over time, pinpoint conceptual vulnerabilities, and get targeted recommendations before exams.
              </p>
            </Card>
          </div>
        </div>
      </section>
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">StudyPilot</span>
            <span className="text-slate-500 text-xs ml-2">© 2026 Production-Ready Portfolio Project</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
