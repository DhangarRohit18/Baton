import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  UserCheck, CheckCircle2, ShieldCheck, QrCode, AlertTriangle,
  FileText, ExternalLink, Calendar, CheckSquare, Square
} from 'lucide-react';
import { QRScannerModal } from '../components/QRScannerModal';

export const SuccessorPortalPage: React.FC = () => {
  const location = useLocation();
  const redeemed = (location.state as any)?.redeemedPackage;
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activePackage, setActivePackage] = useState<any>(redeemed || null);

  // 30-day checklist state
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('baton_successor_tasks');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleTask = (taskId: string) => {
    const updated = { ...checkedTasks, [taskId]: !checkedTasks[taskId] };
    setCheckedTasks(updated);
    localStorage.setItem('baton_successor_tasks', JSON.stringify(updated));
  };

  const tasks = [
    { id: 't1', phase: 'Week 1: Days 1–7', label: 'Verify personal access to HashiCorp Vault / Cloud IAM credentials' },
    { id: 't2', phase: 'Week 1: Days 1–7', label: 'Clone GitHub repositories and replicate local development environment' },
    { id: 't3', phase: 'Week 1: Days 1–7', label: 'Shadow current lead during scheduled on-call maintenance rotation' },
    { id: 't4', phase: 'Week 2: Days 8–15', label: 'Review and verify all Grounded Claims in the BATON Claim Ledger' },
    { id: 't5', phase: 'Week 2: Days 8–15', label: 'Execute test deployment and rollback drill in staging cluster' },
    { id: 't6', phase: 'Week 3 & 4: Days 16–30', label: 'Assume primary operational and architectural signoff ownership' },
    { id: 't7', phase: 'Week 3 & 4: Days 16–30', label: 'Confirm departing member credential deactivation & revoke temporary QR bridge' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            Successor Onboarding &amp; Knowledge Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorised operational onboarding interface unlocked via Secure QR Knowledge Bridge
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 self-start"
        >
          <QrCode className="w-4 h-4 text-slate-950" />
          <span>Redeem New Bridge Token</span>
        </button>
      </div>

      {activePackage ? (
        <div className="space-y-6">
          {/* Welcome Unlocked Banner */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                Cryptographic Proof Validated
              </span>
              <h3 className="text-base font-bold text-slate-100">
                Unlocked Handover: {activePackage.handover?.title || activePackage.project_name}
              </h3>
              <p className="text-xs text-slate-300">
                Domain: <strong className="text-cyan-400">{activePackage.project_name}</strong> &bull; Remaining QR uses: {activePackage.remaining_uses}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
                <ShieldCheck className="w-4 h-4" />
                Continuity Authenticated
              </span>
            </div>
          </div>

          {/* 30-Day Onboarding Interactive Checklist */}
          <div className="bg-[#10182E] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  First 30-Day Successor Action Plan
                </h3>
                <p className="text-[11px] text-slate-400">Track milestones and operational handoff checklists</p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {Object.values(checkedTasks).filter(Boolean).length} / {tasks.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => {
                const isChecked = Boolean(checkedTasks[task.id]);
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <div className="text-xs flex-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold mr-2">
                        [{task.phase}]
                      </span>
                      <span className={isChecked ? 'line-through text-slate-400' : 'text-slate-200'}>
                        {task.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified Claims in this Package */}
          <div className="bg-[#10182E] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Verified Knowledge Ledger Claims ({activePackage.verified_claims?.length || 0})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePackage.verified_claims && activePackage.verified_claims.length > 0 ? (
                activePackage.verified_claims.map((claim: any) => (
                  <div key={claim.id} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {claim.category}
                      </span>
                      <span className="text-emerald-400 font-semibold text-[10px]">
                        Grounded ({Math.round((claim.grounding_score || 1) * 100)}%)
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-200">{claim.title}</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">"{claim.statement}"</p>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs col-span-2">No claims attached to this package.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#10182E] border border-slate-800 rounded-xl p-12 text-center space-y-4 shadow-xl max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">No Handover Package Currently Unlocked</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            If you are a successor stepping into a new role or project domain, scan the manager-minted QR code or paste your signed token to unlock the continuity vault.
          </p>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 inline-flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-slate-950" />
            <span>Scan or Enter QR Bridge Token</span>
          </button>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccessRedeem={(pkg) => setActivePackage(pkg)}
      />
    </div>
  );
};

