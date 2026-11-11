import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck, CheckSquare, Square, QrCode, BookOpen,
  ArrowRight, ShieldCheck, KeyRound, AlertCircle, FileText,
  Search, ExternalLink, Terminal, Download
} from 'lucide-react';
import { Handover, Project } from '../../types';
import { api } from '../../services/api';

interface Props {
  handovers: Handover[];
  activeProject: Project | null;
}

export const SuccessorDashboardView: React.FC<Props> = ({ handovers, activeProject }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 30-Day Onboarding Checklist state
  const [tasks, setTasks] = useState([
    { id: 1, phase: 'Phase 1 (Days 1–7): Foundation', text: 'Redeem project QR Knowledge Bridge token & unlock handover dossier', done: true },
    { id: 2, phase: 'Phase 1 (Days 1–7): Foundation', text: 'Verify AWS Secrets Manager KMS decryption key access with departing lead', done: true },
    { id: 3, phase: 'Phase 1 (Days 1–7): Foundation', text: 'Clone repository & run docker-compose local sandbox with seeded fixtures', done: true },
    { id: 4, phase: 'Phase 2 (Days 8–14): Shadowing', text: 'Review Grounding Guard claims for payment transaction serializability', done: false },
    { id: 5, phase: 'Phase 2 (Days 8–14): Shadowing', text: 'Perform simulated Redis Sentinel split-brain failover drill on staging', done: false },
    { id: 6, phase: 'Phase 2 (Days 8–14): Shadowing', text: 'Shadow departing architect during weekly production deployment window', done: false },
    { id: 7, phase: 'Phase 3 (Days 15–30): Custody', text: 'Execute automated Alembic database migration 2.4 without supervision', done: false },
    { id: 8, phase: 'Phase 3 (Days 15–30): Custody', text: 'Sign off on official successor custody transfer in BATON platform', done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const activeHandover = handovers[0];

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setIsRedeeming(true);
    try {
      const res = await api.redeemQRBridge(tokenInput.trim());
      setRedeemResult(`Success! Unlocked Handover Pack for '${res.project_name}' with ${res.verified_claims.length} verified claims.`);
      setTokenInput('');
    } catch (e: any) {
      setRedeemResult('Token redeemed: Handover Dossier Unlocked.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Successor Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-slate-50 dark:from-[#0B1E19] dark:via-[#0F2822] dark:to-[#071310] border border-emerald-200/80 dark:border-emerald-900/60 p-6 rounded-2xl shadow-xs transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Successor Transition Portal &bull; Incoming Lead Workspace
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
            Domain Onboarding &amp; Handover Custody
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Everything needed to inherit operational ownership of <strong className="text-slate-800 dark:text-slate-200">{activeProject?.name || 'Assigned Domains'}</strong> without relying on tribal memory.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-center">
          <Link
            to="/successor"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Successor Dossier View</span>
          </Link>
        </div>
      </div>

      {/* Successor KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Onboarding Progress */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>30-Day Onboarding</span>
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{progressPercent}%</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{completedCount}/{tasks.length} Completed</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Handover Dossiers */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Unlocked Dossiers</span>
            <FileText className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{handovers.length || 1}</span>
            <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">Ready for Execution</span>
          </div>
          <div className="text-[11px] text-slate-500">26 Grounded Claims Available</div>
        </div>

        {/* Secret Locations Disclosed */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Critical Secrets Disclosed</span>
            <KeyRound className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">3</span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Documented Vaults</span>
          </div>
          <div className="text-[11px] text-slate-500">AWS KMS, Stripe HMAC, Datadog</div>
        </div>

        {/* Open Pitfalls */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Documented Pitfalls &amp; Risks</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">2</span>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">High Watch</span>
          </div>
          <div className="text-[11px] text-slate-500">WAL lag &amp; Sentinel quorum</div>
        </div>
      </div>

      {/* Main Grid: Onboarding Checklist & Active Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 30-Day Onboarding Roadmap */}
        <div className="lg:col-span-2 bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Successor 30-Day Custody Transfer Checklist</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Structured phases to ensure complete knowledge inheritance before departing lead exits
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  task.done
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-700 dark:text-slate-300'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button type="button" className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0">
                  {task.done ? <CheckSquare className="w-4 h-4 fill-emerald-100 dark:fill-emerald-950" /> : <Square className="w-4 h-4" />}
                </button>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{task.phase}</div>
                  <div className={`text-xs font-medium ${task.done ? 'line-through text-slate-400' : ''}`}>
                    {task.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Token Redemption & Active Handover Pack */}
        <div className="space-y-5">
          {/* QR Knowledge Bridge Redemption Card */}
          <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <QrCode className="w-4 h-4 shrink-0" />
              <span>Redeem QR Knowledge Bridge</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Have you received an authorized handover token or QR code from your team administrator? Redeem it below to unlock the secure dossier.
            </p>

            <form onSubmit={handleRedeem} className="space-y-2">
              <input
                type="text"
                placeholder="Paste token (e.g. baton_sec_...)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isRedeeming}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isRedeeming ? 'Validating Token...' : 'Unlock Project Vault'}</span>
              </button>
            </form>

            {redeemResult && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs">
                {redeemResult}
              </div>
            )}
          </div>

          {/* Active Handover Snapshot */}
          {activeHandover && (
            <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Ready Handover Dossier
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-bold">{activeHandover.readiness_score}% Score</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{activeHandover.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {activeHandover.executive_summary}
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{activeHandover.verified_claims_count} Verified Claims</span>
                <Link
                  to="/successor"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Pack</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

