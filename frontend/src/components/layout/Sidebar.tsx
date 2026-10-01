import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  LogOut,
  BrainCircuit,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const navItems = [
  { to: '/dashboard',  label: 'Workspace',         sub: 'Your learning hub',      icon: LayoutDashboard, color: 'text-brand-400',   bg: 'bg-brand-500/10'   },
  { to: '/ai-tutor',   label: 'Prof. Spark',        sub: 'AI Tutor — ask anything',icon: Sparkles,        color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
  { to: '/documents',  label: 'Study Material',     sub: 'Upload & manage files',  icon: FileText,        color: 'text-sky-400',     bg: 'bg-sky-500/10'     },
  { to: '/chat',       label: 'Ask Cogniva AI',     sub: 'Grounded Q&A from docs', icon: MessageSquare,   color: 'text-indigo-400',  bg: 'bg-indigo-500/10'  },
  { to: '/quizzes',    label: 'Cogniva Quiz',       sub: 'Active recall practice', icon: HelpCircle,      color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { to: '/progress',   label: 'Learning Insights',  sub: 'Track your mastery',     icon: TrendingUp,      color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
];

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    showToast('info', 'Signed Out', 'See you next time!');
    navigate('/');
  };

  const initials = (user?.full_name || user?.email || 'C')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="w-64 flex flex-col h-screen sticky top-0 shrink-0 select-none bg-slate-950/80 backdrop-blur-xl border-r border-white/[0.05]">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand-sm">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Cogniva
              <span className="text-[10px] px-1 py-0.5 rounded bg-brand-500/20 border border-brand-500/30 text-brand-300 font-mono tracking-widest">
                AI
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">AI Learning Companion</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600/20 border border-brand-500/25 text-white shadow-glow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? item.bg : 'bg-transparent group-hover:' + item.bg.replace('bg-', 'bg-')}`}>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-500 group-hover:' + item.color.replace('text-', 'text-')}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {item.label}
                    </div>
                    <div className="text-[9px] text-slate-600 group-hover:text-slate-500 truncate hidden group-hover:block transition-all">
                      {item.sub}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 text-brand-400 shrink-0" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors group">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/30 to-indigo-500/30 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-xs">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border-2 border-slate-950 rounded-full" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-200 truncate" title={user?.full_name || user?.email}>
              {user?.full_name || user?.email?.split('@')[0] || 'Student'}
            </div>
            <div className="text-[10px] text-slate-500 truncate" title={user?.email}>
              {user?.email}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
