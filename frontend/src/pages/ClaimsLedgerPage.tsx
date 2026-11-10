import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { Claim } from '../types';
import { EvidenceDrawer } from '../components/EvidenceDrawer';
import {
  FileCheck, ShieldCheck, CheckCircle2, XCircle, AlertCircle,
  Search, Filter, RefreshCw, Eye, ThumbsUp, ThumbsDown, AlertTriangle
} from 'lucide-react';

export const ClaimsLedgerPage: React.FC = () => {
  const { activeProject } = useProject();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [inspectingClaim, setInspectingClaim] = useState<Claim | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadClaims = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const data = await api.getClaims(
        activeProject.id,
        selectedStatus === 'all' ? undefined : selectedStatus,
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setClaims(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [activeProject, selectedCategory, selectedStatus]);

  const handleReview = async (claimId: number, decision: 'approved' | 'rejected' | 'disputed') => {
    try {
      await api.reviewClaim(claimId, decision, `Human verified as ${decision}`);
      setActionMsg(`Claim #${claimId} marked as ${decision.toUpperCase()}.`);
      setTimeout(() => setActionMsg(null), 3000);
      await loadClaims();
    } catch (err: any) {
      alert('Review action failed: ' + err.message);
    }
  };

  const handleReVerify = async (claimId: number) => {
    try {
      const res = await api.verifyClaim(claimId);
      setActionMsg(`Deterministic Grounding Guard executed: ${Math.round(res.grounding_score * 100)}% overlap.`);
      setTimeout(() => setActionMsg(null), 4000);
      await loadClaims();
      // Update drawer if open
      if (inspectingClaim && inspectingClaim.id === claimId) {
        setInspectingClaim({
          ...inspectingClaim,
          grounding_score: res.grounding_score,
          grounding_status: res.grounding_status as any,
        });
      }
    } catch (err: any) {
      alert('Verification error: ' + err.message);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.statement.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-cyan-400" />
            Evidence-Linked Claim Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic Grounding Guard &amp; Human Approval Workflow for{' '}
            <strong className="text-slate-200">{activeProject?.name || 'Project'}</strong>
          </p>
        </div>

        <button
          onClick={loadClaims}
          className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Claims</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#10182E] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search claims, decisions, runbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="architecture">Architecture</option>
            <option value="operational">Operational</option>
            <option value="credentials">Credentials / Vault</option>
            <option value="unfinished">Unfinished / Backlog</option>
            <option value="risk">Technical Risk</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Review States</option>
            <option value="approved">Approved by Human</option>
            <option value="extracted">Extracted (Pending)</option>
            <option value="disputed">Disputed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-[#10182E] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">Claim Assertion</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Deterministic Grounding</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-right">Human Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => {
                  const isGrounded = claim.grounding_status === 'grounded';
                  const isApproved = claim.status === 'approved';
                  const isDisputed = claim.status === 'disputed';
                  const isRejected = claim.status === 'rejected';

                  return (
                    <tr key={claim.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-5 max-w-md">
                        <div className="font-bold text-slate-100 mb-1">{claim.title}</div>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          "{claim.statement}"
                        </p>
                        {claim.reviewer_notes && (
                          <div className="mt-1 text-[10px] text-slate-400 italic">
                            Reviewer: {claim.reviewer_notes}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {claim.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setInspectingClaim(claim)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border transition-all ${
                              isGrounded
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>
                              {isGrounded ? 'Grounded' : 'Unverified'} (
                              {Math.round(claim.grounding_score * 100)}%)
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`capitalize text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isApproved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : isDisputed
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : isRejected
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setInspectingClaim(claim)}
                          title="Inspect Evidence Passages"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Evidence</span>
                        </button>
                        <button
                          onClick={() => handleReview(claim.id, 'approved')}
                          title="Approve Claim"
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs transition-colors"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReview(claim.id, 'disputed')}
                          title="Mark Disputed"
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs transition-colors"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReview(claim.id, 'rejected')}
                          title="Reject Claim"
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs transition-colors"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 text-xs">
                    No claims matched the filter. Ingest documentation to extract verifiable claims.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Drawer Modal */}
      <EvidenceDrawer
        claim={inspectingClaim}
        onClose={() => setInspectingClaim(null)}
        onReVerify={handleReVerify}
      />
    </div>
  );
};
