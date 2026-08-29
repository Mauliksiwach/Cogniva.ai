import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  LogOut,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    showToast('info', 'Logged Out', 'You have been signed out safely.');
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Workspace', icon: LayoutDashboard },
    { to: '/documents', label: 'Study Material', icon: FileText },
    { to: '/chat', label: 'Ask Cogniva AI', icon: MessageSquare },
    { to: '/quizzes', label: 'Cogniva Quiz', icon: HelpCircle },
    { to: '/progress', label: 'Learning Insights', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-slate-900/70 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            Cogniva <span className="text-brand-400 text-[10px] px-1 py-0.2 rounded bg-brand-500/10 border border-brand-500/20 font-mono">AI</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Learning Companion</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Learning Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {user?.full_name || user?.email?.split('@')[0]}
              </div>
              <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
