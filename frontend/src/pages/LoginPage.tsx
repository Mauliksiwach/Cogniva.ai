import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('error', 'Validation Error', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      showToast('success', 'Welcome Back!', 'Logged in to Cogniva AI.');
      navigate('/dashboard');
    } else {
      showToast('error', 'Login Failed', result.error || 'Invalid credentials.');
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    await signIn('student.demo@cogniva.ai', 'demo123456');
    setLoading(false);
    showToast('success', 'Demo Mode Activated', 'Logged in as Demo Student.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white flex items-center gap-1.5">
            Cogniva <span className="text-brand-400 text-xs px-1.5 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 font-mono">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Sign in to Cogniva AI</h2>
        <p className="mt-2 text-sm text-slate-400">
          Or <Link to="/signup" className="font-medium text-brand-400 hover:text-brand-300">create a new student account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <Card glow className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="University Email"
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />
            <Button type="submit" loading={loading} icon={<ArrowRight className="w-4 h-4" />} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-semibold">Quick Access</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleQuickDemo}
            icon={<Zap className="w-4 h-4 text-amber-400" />}
            className="w-full border-slate-700 hover:border-slate-600 text-slate-200"
          >
            Instant 1-Click Demo Login
          </Button>
        </Card>
      </div>
    </div>
  );
};
