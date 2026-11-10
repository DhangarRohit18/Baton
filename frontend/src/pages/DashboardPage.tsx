import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, FileCheck, HelpCircle,
  FolderGit2, CheckCircle2, ArrowUpRight, ArrowRight,
  TrendingUp, Users, Activity, Sparkles, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { api } from '../services/api';
import { RadarOverview } from '../types';
import { useProject } from '../context/ProjectContext';

export const DashboardPage: React.FC = () => {
  const { activeProject } = useProject();
  const [radar, setRadar] = useState<RadarOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRadarOverview();
      setRadar(data);
    } catch (e) {
      console.error('Failed to load radar overview', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mock timeline chart based on claims & documents
  const activityData = [
    { day: 'Mon', claims: 12, gaps: 2 },
    { day: 'Tue', claims: 24, gaps: 5 },
    { day: 'Wed', claims: 18, gaps: 3 },
    { day: 'Thu', claims: 35, gaps: 4 },
    { day: 'Fri', claims: 42, gaps: 1 },
    { day: 'Sat', claims: 28, gaps: 2 },
    { day: 'Sun', claims: 31, gaps: 0 },
  ];

  const readinessScore = radar?.overall_readiness_score ?? 85.0;
  const riskScore = radar?.overall_risk_score ?? 15.0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#101935] via-[#0E172E] to-[#0A1226] border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            Live Institutional Continuity Engine
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100">
            Organizational Memory & Handover Radar
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time monitoring of operational dependencies, bus-factor vulnerabilities, and evidence-grounded transition assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/handovers"
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <span>Generate Handover Pack</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Continuity Readiness Score */}
        <div className="bg-[#10182E] border border-slate-800/90 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Continuity Readiness</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100">{readinessScore}%</span>
            <span className="text-[11px] font-semibold text-emerald-400">Target &gt; 80%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-400 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${readinessScore}%` }}
            ></div>
          </div>
        </div>

        {/* Bus-Factor Risk Alerts */}
        <div className="bg-[#10182E] border border-slate-800/90 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Bus-Factor Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100">{radar?.bus_factor_alert_count || 0}</span>
            <span className="text-[11px] font-semibold text-amber-400">Isolated Owners</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">Single points of operational departure</p>
        </div>

        {/* Unresolved Knowledge Gaps */}
        <div className="bg-[#10182E] border border-slate-800/90 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Unresolved Gaps</span>
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100">{radar?.unresolved_gaps_count || 0}</span>
            <span className="text-[11px] font-semibold text-slate-400">Action items</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">Targeted for exit interviews</p>
        </div>

        {/* Active Handover Packs */}
        <div className="bg-[#10182E] border border-slate-800/90 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Handover Packs</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100">{radar?.active_handovers_count || 0}</span>
            <span className="text-[11px] font-semibold text-teal-400">Compiled</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">Secured with QR Knowledge Bridges</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Ingestion & Claim Activity */}
        <div className="lg:col-span-2 bg-[#10182E] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Continuity Knowledge Extraction Velocity
              </h3>
              <p className="text-[11px] text-slate-400">Verified claims vs detected gaps over past 7 days</p>
            </div>
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              7D ROLLUP
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="claimGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="claims" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#claimGradient)" name="Verified Claims" />
                <Area type="monotone" dataKey="gaps" stroke="#F59E0B" strokeWidth={1.5} fillOpacity={1} fill="url(#gapGradient)" name="Gaps Identified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Factors Breakdown */}
        <div className="bg-[#10182E] border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Continuity Risk Indicators
            </h3>
            <p className="text-[11px] text-slate-400">Weighted risk vectors analyzed by Radar</p>
          </div>

          <div className="space-y-3.5 my-auto">
            {radar?.risk_breakdown && radar.risk_breakdown.length > 0 ? (
              radar.risk_breakdown.map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{r.category}</span>
                    <span className={`font-bold ${r.risk_level === 'Critical' ? 'text-rose-400' : r.risk_level === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {r.risk_level} ({Math.round(r.score)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${r.risk_level === 'Critical' ? 'bg-rose-500' : r.risk_level === 'High' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, r.score)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{r.explanation}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No active critical risk flags identified across projects.
              </div>
            )}
          </div>

          <Link
            to="/radar"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-between pt-2 border-t border-slate-800/80"
          >
            <span>Deep Dive in Knowledge Loss Radar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Project Matrix Table */}
      <div className="bg-[#10182E] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              Project Domain Continuity Health
            </h3>
            <p className="text-[11px] text-slate-400">Operational projects, bus-factor risk scores, and claims ledger status</p>
          </div>
          <Link
            to="/ingestion"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>Upload Artifacts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">Project Domain</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Total Claims</th>
                <th className="py-3 px-4">Unverified</th>
                <th className="py-3 px-4">Open Gaps</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {radar?.project_risk_matrix && radar.project_risk_matrix.length > 0 ? (
                radar.project_risk_matrix.map((p) => (
                  <tr key={p.project_id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-200">{p.project_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: #{p.project_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[10px] font-semibold bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            p.risk_score > 60 ? 'bg-rose-500' : p.risk_score > 30 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="font-semibold text-slate-200">{p.risk_score}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{p.total_claims}</td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">{p.unverified_claims_count}</td>
                    <td className="py-3.5 px-4 font-mono text-rose-400">{p.open_gaps_count}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/claims?project_id=${p.project_id}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                      >
                        Claim Ledger &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                    No projects found. Create your first project from the top bar to begin knowledge continuity mapping.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
