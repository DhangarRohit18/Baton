import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { KnowledgeGap, Contradiction } from '../types';
import {
  HelpCircle, AlertTriangle, ShieldAlert, CheckCircle2,
  RefreshCw, Plus, ArrowRight, MessageSquare, AlertOctagon
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const GapsRadarPage: React.FC = () => {
  const { activeProject } = useProject();
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Resolution modal state
  const [resolvingGap, setResolvingGap] = useState<KnowledgeGap | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Create manual gap modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState('high');
  const [newCategory, setNewCategory] = useState('operations');
  const [newQuestion, setNewQuestion] = useState('');

  const loadData = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const [gapsList, contraList] = await Promise.all([
        api.getGaps(activeProject.id),
        api.getContradictions(activeProject.id),
      ]);
      setGaps(gapsList);
      setContradictions(contraList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeProject]);

  const handleResolveGap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingGap || !resolutionNotes.trim()) return;
    setIsResolving(true);
    try {
      await api.resolveGap(resolvingGap.id, resolutionNotes.trim());
      setResolvingGap(null);
      setResolutionNotes('');
      await loadData();
    } catch (err: any) {
      alert('Error resolving gap: ' + err.message);
    } finally {
      setIsResolving(false);
    }
  };

  const handleCreateGap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newTitle.trim()) return;
    try {
      await api.createGap({
        project_id: activeProject.id,
        title: newTitle.trim(),
        description: newDesc.trim(),
        severity: newSeverity,
        category: newCategory,
        suggested_question: newQuestion.trim(),
      });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewQuestion('');
      await loadData();
    } catch (err: any) {
      alert('Error creating gap: ' + err.message);
    }
  };

  const openGaps = gaps.filter((g) => g.status !== 'resolved');
  const resolvedGaps = gaps.filter((g) => g.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Knowledge Loss Radar &amp; Conflict Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Institutional Blindspots, Bus-Factor Vulnerabilities &amp; Contradictions for{' '}
            <strong className="text-slate-200">{activeProject?.name || 'Project'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 text-cyan-400 hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Gap Advisory</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contradiction Detection Banner */}
      {contradictions.length > 0 && (
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertOctagon className="w-5 h-5" />
            Contradictory Technical Claims Detected ({contradictions.length})
          </div>
          <p className="text-xs text-slate-300">
            The BATON Conflict Engine flagged contradictory assertions in ingested documentation. Human reviewer reconciliation required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {contradictions.map((c) => (
              <div key={c.id} className="bg-slate-950/80 border border-rose-900/40 rounded-lg p-3 space-y-2 text-xs">
                <div className="text-rose-400 font-semibold">{c.conflict_summary}</div>
                <div className="text-slate-400 space-y-1 text-[11px]">
                  <div>Claim A: <span className="text-slate-200">"{c.claim_a_statement}"</span></div>
                  <div>Claim B: <span className="text-slate-200">"{c.claim_b_statement}"</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bus-Factor Radar Card */}
      <div className="bg-[#10182E] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            Domain Bus-Factor Vulnerability Assessment
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
            Risk Score: {activeProject?.bus_factor_risk || 0}%
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Primary Technical Lead: <strong className="text-slate-100">{activeProject?.lead_name || 'Unassigned'}</strong>{' '}
          ({activeProject?.lead_email || 'No email'}). If this lead leaves,{' '}
          <span className="text-cyan-400 font-semibold">{openGaps.length} unresolved operational areas</span> must be
          transferred via the Gap-Driven Exit Interview before departure.
        </p>
        <div className="pt-1">
          <Link
            to="/interviews"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
          >
            <span>Launch Gap-Driven Exit Interview Wizard &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Open Knowledge Gaps List */}
      <div className="bg-[#10182E] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              Active Knowledge Gaps ({openGaps.length})
            </h3>
            <p className="text-[11px] text-slate-400">Missing documentation, unrecorded secrets, and operational blindspots</p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {openGaps.length > 0 ? (
            openGaps.map((gap) => (
              <div
                key={gap.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        gap.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : gap.severity === 'high'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {gap.severity}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-cyan-400">
                      [{gap.category}]
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{gap.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300">{gap.description}</p>
                  <p className="text-[11px] text-slate-400 italic flex items-center gap-1.5 pt-1">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    Suggested Interview Question: "{gap.suggested_question}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    setResolvingGap(gap);
                    setResolutionNotes('');
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs rounded-lg transition-all self-start sm:self-center shrink-0"
                >
                  Resolve Gap
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No active knowledge gaps flagged for this domain.
            </div>
          )}
        </div>
      </div>

      {/* Resolved Gaps History */}
      {resolvedGaps.length > 0 && (
        <div className="bg-[#10182E] border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Resolved Knowledge Advisories ({resolvedGaps.length})
          </h3>
          <div className="space-y-2">
            {resolvedGaps.map((rg) => (
              <div key={rg.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">&#10003;</span>
                  {rg.title}
                </div>
                <div className="text-[11px] text-slate-400">{rg.resolved_notes}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolve Gap Modal */}
      {resolvingGap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#10182E] border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Resolve Knowledge Gap: {resolvingGap.title}
            </h3>
            <p className="text-xs text-slate-400">{resolvingGap.description}</p>
            <form onSubmit={handleResolveGap} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resolution Evidence / Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Document where credentials are stored, exact runbook steps, or attach clarification..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingGap(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResolving || !resolutionNotes.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-emerald-400 hover:to-teal-400"
                >
                  {isResolving ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Manual Gap Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#10182E] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Flag Custom Knowledge Gap
            </h3>
            <form onSubmit={handleCreateGap} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gap Advisory Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Vault Root Token Delegation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain what is undocumented or missing..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="operations">Operations</option>
                    <option value="credentials">Credentials</option>
                    <option value="architecture">Architecture</option>
                    <option value="deployment">Deployment</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Suggested Interview Question</label>
                <input
                  type="text"
                  placeholder="What question must the departing member answer?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400"
                >
                  Record Advisory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
