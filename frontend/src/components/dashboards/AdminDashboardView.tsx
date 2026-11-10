import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight,
  TrendingUp, Activity, QrCode, Sparkles, Building2,
  FileCheck, ShieldAlert, KeyRound, Lock, UserX
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { RadarOverview, Project } from '../../types';

interface Props {
  radar: RadarOverview | null;
  projects: Project[];
  activeProject: Project | null;
}

export const AdminDashboardView: React.FC<Props> = ({ radar, projects, activeProject }) => {
  const [tokenRevoked, setTokenRevoked] = useState(false);

  const readinessScore = radar?.overall_readiness_score ?? 74.2;
  const busFactorRisk = Math.round((radar?.overall_risk_score ?? 0.68) * 100);

  const trendData = [
    { week: 'W1', readiness: 45, risks: 8 },
    { week: 'W2', readiness: 52, risks: 7 },
    { week: 'W3', readiness: 61, risks: 6 },
    { week: 'W4', readiness: 68, risks: 4 },
    { week: 'W5', readiness: 74, risks: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Mission Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-teal-50/90 via-cyan-50/70 to-blue-50/60 dark:from-[#101935] dark:via-[#0E172E] dark:to-[#0A1226] border border-teal-200/80 dark:border-cyan-900/60 p-6 rounded-2xl shadow-xs transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
            Executive Continuity Oversight &bull; Chief Architect Perspective
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
            Enterprise Memory &amp; Bus-Factor Radar
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Real-time governance over organizational knowledge assets, emergency QR bridge kill-switches, and successor handover pipelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <Link
            to="/handovers"
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compile Handover Pack</span>
          </Link>
          <Link
            to="/qr-bridge"
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500 dark:hover:border-cyan-500 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
            <span>Mint QR Bridge</span>
          </Link>
        </div>
      </div>

      {/* Admin Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Enterprise Readiness</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{readinessScore}%</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+12% this month</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full" style={{ width: `${readinessScore}%` }}></div>
          </div>
        </div>

        {/* Bus-Factor Alert */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Bus-Factor Risk Index</span>
            <UserX className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{busFactorRisk}%</span>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">2 Critical Domains</span>
          </div>
          <div className="text-[11px] text-slate-500">Sole-author vulnerability in Core Ledger</div>
        </div>

        {/* Unresolved Gaps */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Undocumented Gaps</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{radar?.unresolved_gaps_count ?? 8}</span>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">4 Critical</span>
          </div>
          <Link to="/gaps" className="text-[11px] text-teal-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold">
            <span>View Knowledge Gaps</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active Bridges */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Active QR Bridges</span>
            <QrCode className="w-4 h-4 text-teal-500 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{radar?.active_handovers_count ?? 3}</span>
            <span className="text-[11px] font-semibold text-teal-600 dark:text-cyan-400">HMAC-SHA256</span>
          </div>
          <div className="text-[11px] text-slate-500">All tokens rate-limited &amp; revocable</div>
        </div>
      </div>

      {/* Main Charts & Executive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Domain Risk Matrix */}
        <div className="lg:col-span-2 bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Project Continuity Matrix</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bus-factor risk scores and transition readiness by operational domain</p>
            </div>
            <Link to="/team" className="text-xs font-bold text-teal-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              <span>Manage Leads</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {projects.map((p) => {
              const risk = Math.round(p.bus_factor_risk * 100);
              const isHigh = risk > 65;
              return (
                <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isHigh ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Lead: <strong>{p.lead_name}</strong></span>
                      <span>&bull;</span>
                      <span>{p.document_count} Artifacts</span>
                      <span>&bull;</span>
                      <span>{p.claim_count} Grounded Claims</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Bus-Factor Risk</div>
                      <div className={`font-mono font-bold text-xs ${isHigh ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {risk}%
                      </div>
                    </div>
                    <Link
                      to="/handovers"
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Dossier
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Emergency QR Kill-Switch & Admin Actions */}
        <div className="space-y-5">
          {/* Emergency Kill Switch */}
          <div className="bg-white dark:bg-[#10182E] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Emergency Bridge Revocation</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Instantly revoke all cryptographic QR Knowledge Bridges if a departing member departs ahead of schedule or credential breach is suspected.
            </p>

            {tokenRevoked ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Emergency Token Kill-Switch Triggered. 3 Bridges Revoked.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setTokenRevoked(true)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Execute Emergency Revocation</span>
              </button>
            )}
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs transition-colors">
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Governance Shortcuts</h4>
            <div className="space-y-2">
              <Link
                to="/interviews"
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span>Initiate Exit Transition Interview</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
              </Link>
              <Link
                to="/audit"
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span>View SOC2 / ISO Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
              </Link>
              <Link
                to="/team"
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span>Invite Successor or Reviewer</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
