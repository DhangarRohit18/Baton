import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderGit2, FileText, CheckCircle2,
  AlertTriangle, HelpCircle, FileCheck, UserCheck, QrCode,
  ShieldAlert, Users, LogOut, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Continuity Radar', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Knowledge Sources', path: '/ingestion', icon: FolderGit2 },
    { label: 'Claim Ledger', path: '/claims', icon: FileCheck },
    { label: 'Knowledge Loss Radar', path: '/radar', icon: AlertTriangle },
    { label: 'Gaps & Conflicts', path: '/gaps', icon: HelpCircle },
    { label: 'Exit Interviews', path: '/interviews', icon: FileText },
    { label: 'Handover Packs', path: '/handovers', icon: CheckCircle2 },
    { label: 'Successor Portal', path: '/successor', icon: UserCheck },
    { label: 'QR Knowledge Bridge', path: '/qr-bridge', icon: QrCode },
    { label: 'Audit Trail', path: '/audit', icon: ShieldAlert },
    { label: 'Team & Security', path: '/team', icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#0A0F1D] border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      <div>
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="font-extrabold text-slate-100 tracking-wider text-base flex items-center gap-1.5">
              BATON
              <span className="text-[10px] bg-cyan-950 text-cyan-400 font-bold px-1.5 py-0.5 rounded border border-cyan-800/60">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">AI Knowledge Continuity</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & sign out */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="capitalize">{user?.role || 'Member'}</span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
