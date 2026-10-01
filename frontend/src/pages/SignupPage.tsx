import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
    showToast('success', 'Account Created!', 'Welcome to Cogniva AI!');
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { showToast('error', 'Required Fields', 'Please complete all fields.'); return; }
    setLoading(true);
    const result = await signUp(email, password, fullName);
    setLoading(false);
    if (result.success) {
      showToast('success', 'Welcome to Cogniva AI!', 'Your account is ready.');
      navigate('/dashboard');
    } else {
      showToast('error', 'Signup Failed', result.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950 border-r border-white/[0.05] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600/15 blur-[100px] rounded-full pointer-events-none" />

        <Link to="/" className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand-sm">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">
            Cogniva <span className="text-brand-400">AI</span>
          </span>
        </Link>

        <div className="relative space-y-6">
          <Badge variant="success" size="sm" dot>Free forever · No credit card</Badge>
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
            Join thousands of<br />
            <span className="text-gradient">smarter students.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Create your Cogniva AI account in 30 seconds. Upload your first document and start learning differently.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {[
              { label: 'AI Tutor', icon: GraduationCap, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
              { label: 'Smart Quizzes', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Cited Answers', icon: ShieldCheck, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
              { label: 'Track Progress', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            ].map(({ label, icon: Icon, color, bg }) => (
              <div key={label} className={`flex items-center gap-2 p-3 rounded-xl border ${bg} text-xs font-semibold ${color}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© 2026 Cogniva AI · AI Learning Companion</p>
      </div>

      {/* ── Right panel — form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-brand-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">Cogniva <span className="text-brand-400">AI</span></span>
          </Link>

          <div className="mb-8">
            <Badge variant="success" size="sm" dot className="mb-4">Free forever</Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] hover:border-white/[0.15] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-40"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign up with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-950 px-4 text-xs text-slate-600 font-semibold uppercase tracking-widest">
                  or sign up with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<UserIcon className="w-4 h-4" />}
              />
              <Input
                label="University Email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <Button type="submit" loading={loading} icon={<ArrowRight className="w-4 h-4" />} iconRight className="w-full" size="lg">
                Create Free Account
              </Button>
            </form>

            <p className="text-center text-xs text-slate-600">
              By signing up you agree to our{' '}
              <span className="text-slate-500 hover:text-slate-400 cursor-pointer">Terms</span>
              {' & '}
              <span className="text-slate-500 hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
