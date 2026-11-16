import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderGit2, CheckCircle2,
  AlertTriangle, HelpCircle, FileCheck, UserCheck, QrCode,
  ShieldAlert, Users, LogOut, Sparkles, FileText, Zap, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Continuity Radar', path: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { label: 'Knowledge Sources', path: '/ingestion', icon: FolderGit2, roles: ['admin'] },
    { label: 'Claim Ledger', path: '/claims', icon: FileCheck, roles: ['reviewer'] },
    { label: 'Knowledge Loss Radar', path: '/radar', icon: AlertTriangle, roles: ['admin'] },
    { label: 'Gaps & Conflicts', path: '/gaps', icon: HelpCircle, roles: ['reviewer'] },
    { label: 'Exit Interviews', path: '/interviews', icon: FileText, roles: ['member', 'admin'] },
    { label: 'Handover Packs', path: '/handovers', icon: CheckCircle2, roles: ['successor', 'admin'] },
    { label: 'Successor Portal', path: '/successor', icon: UserCheck, roles: ['successor'] },
    { label: 'QR Knowledge Bridge', path: '/qr-bridge', icon: QrCode, roles: ['successor', 'admin'] },
    { label: 'Audit Trail', path: '/audit', icon: ShieldAlert, roles: ['admin', 'reviewer'] },
    { label: 'Team & Security', path: '/team', icon: Users, roles: ['admin'] },
  ];

  const handleRoleSwitch = (role: 'admin' | 'reviewer' | 'successor') => {
    switchRole(role);
    if (role === 'admin') navigate('/dashboard');
    else if (role === 'reviewer') navigate('/claims');
    else if (role === 'successor') navigate('/successor');
  };

  return (
    <aside className="w-64 bg-slate-50 dark:bg-[#0A0F1D] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none transition-colors">
      <div>
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-200 dark:border-slate-800/80">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-md shadow-teal-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 tracking-wider text-base flex items-center gap-1.5">
              BATON
              <span className="text-[10px] bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-400 font-bold px-1.5 py-0.5 rounded border border-teal-200 dark:border-cyan-800/60">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">AI Knowledge Continuity</p>
          </div>
        </div>

        {/* Fast Role Switcher */}
        <div className="px-3 pt-3 pb-1">
          <div className="p-1 bg-slate-200/60 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 shadow-2xs">
            <button
              onClick={() => handleRoleSwitch('admin')}
              title="Chief Architect View"
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                user?.role === 'admin'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Architect</span>
            </button>
            <button
              onClick={() => handleRoleSwitch('reviewer')}
              title="Reviewer View"
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                user?.role === 'reviewer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Reviewer</span>
            </button>
            <button
              onClick={() => handleRoleSwitch('successor')}
              title="Successor View"
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                user?.role === 'successor'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Successor</span>
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isRoleFocused = user?.role && item.roles.includes(user.role);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 dark:bg-cyan-500/10 dark:text-cyan-400 border border-teal-200 dark:border-cyan-500/20 shadow-xs'
                      : isRoleFocused
                      ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 opacity-80'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {isRoleFocused && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-cyan-400 shrink-0"></span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & sign out */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80">
        <div className="bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800/60 flex items-center justify-between shadow-xs">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{user?.full_name}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="capitalize">{user?.role || 'Member'}</span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
