import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, BrainCircuit, HelpCircle, TrendingUp, ArrowRight,
  BookOpen, Zap, ShieldCheck, Star, Users, GraduationCap,
  Upload, MessageSquare, BarChart3, ChevronRight
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

/* ── Stat pill ─────────────────────────────────────────────────── */
const StatItem = ({ value, label, color = 'text-white' }: { value: string; label: string; color?: string }) => (
  <div className="animate-fade-in-up">
    <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${color}`}>{value}</div>
    <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
  </div>
);

/* ── Feature card ──────────────────────────────────────────────── */
const FeatureCard = ({
  icon: Icon, title, desc, color, bg, delay = ''
}: { icon: React.ElementType; title: string; desc: string; color: string; bg: string; delay?: string }) => (
  <Card hover glow className={`p-6 animate-fade-in-up ${delay}`}>
    <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center mb-5 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-base font-bold text-white mb-2 tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${color} opacity-0 group-hover:opacity-100 transition-opacity`}>
      Learn more <ChevronRight className="w-3.5 h-3.5" />
    </div>
  </Card>
);

/* ── Step card ─────────────────────────────────────────────────── */
const StepCard = ({ n, title, desc, icon: Icon }: { n: string; title: string; desc: string; icon: React.ElementType }) => (
  <div className="relative flex flex-col p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition-all group">
    <span className="text-5xl font-black text-brand-500/10 group-hover:text-brand-500/20 transition-colors mb-4 leading-none">
      {n}
    </span>
    <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 text-brand-400">
      <Icon className="w-4 h-4" />
    </div>
    <h4 className="text-sm font-bold text-white mb-2">{title}</h4>
    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

/* ── Main ──────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/8 blur-[160px] rounded-full" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-violet-600/6 blur-[120px] rounded-full" />
          <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-indigo-500/5 blur-[100px] rounded-full" />
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge variant="brand" size="sm" dot className="mb-6 animate-fade-in-up shadow-glow-sm">
            <Sparkles className="w-3 h-3" />
            AI-Powered Study Companion — Built for University Students
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.05] animate-fade-in-up delay-100">
            Study Smarter,{' '}
            <span className="text-gradient">Not Harder</span>
            <br />
            with Cogniva AI
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Upload your lecture slides, notes, and textbooks. Cogniva AI turns them into a
            personalized tutor that answers questions, generates quizzes, and tracks your mastery — all grounded in <em>your</em> material.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up delay-300">
            <Link to="/signup">
              <Button size="xl" icon={<Zap className="w-4 h-4" />} className="px-8">
                Start Learning Free
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="xl" className="px-8">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex items-center justify-center gap-4 text-xs text-slate-500 animate-fade-in delay-500">
            {['No credit card required', 'Setup in 60 seconds', 'Works with any university'].map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-700" />}
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  {t}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-slate-800/60 pt-10 text-left animate-fade-in-up delay-400">
            <StatItem value="100%" label="Source-cited answers" color="text-brand-300" />
            <StatItem value="< 2s"  label="Instant PDF processing" color="text-violet-300" />
            <StatItem value="5×"    label="Better exam retention" color="text-emerald-300" />
            <StatItem value="Free"  label="Always. No paywall."   color="text-amber-300" />
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-900/20 border-y border-slate-800/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="brand" size="sm" className="mb-4">Everything you need</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Engineered for{' '}
              <span className="text-gradient">Deep Learning</span>
            </h2>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">
              Cogniva AI combines retrieval-augmented generation with active-recall science
              to help you truly master your university coursework — not just skim it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon={BrainCircuit}
              title="Ask Cogniva AI"
              desc="Ask anything about your uploaded study materials. Every answer cites exact document pages with zero hallucinations — like having a research assistant built into your notes."
              color="text-brand-400"
              bg="bg-brand-500/10 border border-brand-500/20"
              delay="delay-100"
            />
            <FeatureCard
              icon={HelpCircle}
              title="Smart Quiz Generator"
              desc="Instantly transform lecture slides and textbook chapters into targeted multiple-choice quizzes. Choose 5, 10, or 20 questions. Unique questions every attempt."
              color="text-indigo-400"
              bg="bg-indigo-500/10 border border-indigo-500/20"
              delay="delay-200"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Learning Insights"
              desc="Track your mastery score over time, identify conceptual weak spots, and get targeted exam revision recommendations before your next test."
              color="text-emerald-400"
              bg="bg-emerald-500/10 border border-emerald-500/20"
              delay="delay-300"
            />
          </div>

          {/* Secondary features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            {[
              { icon: BookOpen,       label: 'PDF & DOCX Support',   color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/20' },
              { icon: MessageSquare,  label: 'AI Tutor — Prof. Spark',color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { icon: BarChart3,      label: 'Progress Analytics',    color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20' },
              { icon: ShieldCheck,    label: 'Secure by Default',     color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
            ].map(({ icon: Icon, label, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 transition-all"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${bg} ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="info" size="sm" className="mb-4">Simple 3-step workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              From Upload to{' '}
              <span className="text-gradient">Exam Ready</span>
            </h2>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">
              A streamlined cognitive workflow designed for peak retention and exam performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StepCard
              n="01"
              icon={Upload}
              title="Upload Your Material"
              desc="Upload lecture slides, notes, textbook chapters, or any study material. Cogniva AI parses and indexes it securely in seconds."
            />
            <StepCard
              n="02"
              icon={MessageSquare}
              title="Ask & Test Yourself"
              desc="Ask questions in natural language, get cited answers from your docs, chat with Prof. Spark, and generate active-recall quizzes."
            />
            <StepCard
              n="03"
              icon={BarChart3}
              title="Track & Improve"
              desc="Review detailed explanations for wrong answers, track your score trend, and let AI pinpoint exactly which topics need more revision."
            />
          </div>
        </div>
      </section>

      {/* ── Social proof strip ────────────────────────────────── */}
      <section className="py-12 border-t border-slate-800/40 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500 mb-6 font-medium">Trusted by students at universities worldwide</p>
          <div className="flex items-center justify-center gap-8 flex-wrap text-slate-600 text-sm font-semibold">
            {['LPU', 'VIT', 'Manipal', 'BITS Pilani', 'IIT Delhi', 'SRM', 'Amity'].map((uni) => (
              <div key={uni} className="flex items-center gap-2 text-slate-500">
                <GraduationCap className="w-3.5 h-3.5 text-brand-500/60" />
                {uni}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-600/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <Badge variant="success" size="sm" dot className="mb-5">Free · No credit card · Instant access</Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            Start mastering your<br />
            <span className="text-gradient">coursework today</span>
          </h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-xl mx-auto">
            Join thousands of students who stopped cramming and started truly learning.
            Upload your first document and experience Cogniva AI in under 60 seconds.
          </p>
          <Link to="/signup">
            <Button size="xl" icon={<ArrowRight className="w-4 h-4" />} iconRight className="px-10 animate-pulse-glow">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-slate-800/60 bg-slate-950 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">Cogniva AI</span>
            <span className="text-slate-600 text-xs">© 2026 · AI Learning Companion</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link to="/login"  className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Start Learning</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
