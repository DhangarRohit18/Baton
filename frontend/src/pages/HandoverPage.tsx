import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { Handover, QRBridge } from '../types';
import {
  CheckCircle2, QrCode, FileText, Download, Printer,
  Sparkles, RefreshCw, KeyRound, AlertCircle, Share2
} from 'lucide-react';

export const HandoverPage: React.FC = () => {
  const { activeProject } = useProject();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [activeHandover, setActiveHandover] = useState<Handover | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mint QR Modal
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [mintTtl, setMintTtl] = useState(72);
  const [mintMaxUses, setMintMaxUses] = useState(5);
  const [mintPassphrase, setMintPassphrase] = useState('');
  const [mintedBridge, setMintedBridge] = useState<QRBridge | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // Generate Handover modal
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [genTitle, setGenTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const loadHandovers = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const list = await api.getHandovers(activeProject.id);
      setHandovers(list);
      if (list.length > 0 && !activeHandover) {
        setActiveHandover(list[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHandovers();
  }, [activeProject]);

  const handleGenerateHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !genTitle.trim()) return;
    setIsGenerating(true);
    try {
      const h = await api.generateHandover(activeProject.id, genTitle.trim());
      setIsGenModalOpen(false);
      setGenTitle('');
      await loadHandovers();
      setActiveHandover(h);
    } catch (err: any) {
      alert('Error synthesizing handover: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMintQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHandover) return;
    setIsMinting(true);
    try {
      const bridge = await api.mintQRBridge({
        handover_id: activeHandover.id,
        ttl_hours: mintTtl,
        max_uses: mintMaxUses,
        passphrase: mintPassphrase.trim() || undefined,
      });
      setMintedBridge(bridge);
    } catch (err: any) {
      alert('Error minting QR Knowledge Bridge: ' + err.message);
    } finally {
      setIsMinting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-teal-400" />
            Knowledge Continuity Handover Packs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Synthesized verified claims, runbooks, and 30-day action plans for{' '}
            <strong className="text-slate-200">{activeProject?.name || 'Project'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => {
              setGenTitle(`${activeProject?.name || 'Domain'} Successor Handover Pack`);
              setIsGenModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Compile New Handover</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Handover Packs Index */}
        <div className="bg-[#10182E] border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
            <span>Compiled Handovers</span>
            <span className="text-[10px] text-cyan-400 font-mono">{handovers.length} Total</span>
          </div>

          <div className="space-y-2">
            {handovers.length > 0 ? (
              handovers.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setActiveHandover(h)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    activeHandover?.id === h.id
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-100">{h.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Compiled: {new Date(h.created_at).toLocaleDateString()} &bull; {h.verified_claims_count} Grounded Claims
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="capitalize font-semibold text-teal-400">{h.status}</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {Math.round(h.readiness_score)}% Readiness
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No handovers compiled yet. Click "Compile New Handover" to synthesize verified knowledge.
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Handover Document View */}
        <div className="lg:col-span-2 space-y-4">
          {activeHandover ? (
            <div className="bg-[#10182E] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Document Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono uppercase text-teal-400 font-bold tracking-wider">
                    Institutional Continuity Handover &bull; ID #{activeHandover.id}
                  </div>
                  <h3 className="text-lg font-black text-slate-100 mt-0.5">{activeHandover.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMintedBridge(null);
                      setIsMintModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/40 hover:border-teal-400 text-teal-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Mint QR Bridge</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
                {/* Executive Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-cyan-400">
                    1. Executive Transition Brief
                  </h4>
                  <p className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 text-slate-300">
                    {activeHandover.executive_summary}
                  </p>
                </div>

                {/* Architecture Overview */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-cyan-400">
                    2. Architecture Baseline &amp; Decisions
                  </h4>
                  <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 whitespace-pre-line text-slate-300">
                    {activeHandover.architecture_overview}
                  </div>
                </div>

                {/* Unfinished Backlog */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400">
                    3. Unfinished Work &amp; Active Backlog
                  </h4>
                  <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 whitespace-pre-line text-slate-300">
                    {activeHandover.unfinished_work}
                  </div>
                </div>

                {/* Pitfalls & Risks */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-rose-400">
                    4. Technical Dependencies &amp; Pitfalls
                  </h4>
                  <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 whitespace-pre-line text-slate-300">
                    {activeHandover.pitfalls_and_risks}
                  </div>
                </div>

                {/* Operational Runbook */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-teal-400">
                    5. Operational Runbook &amp; Credentials Vault
                  </h4>
                  <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 whitespace-pre-line text-slate-300 font-mono text-[11px]">
                    {activeHandover.operational_runbook}
                  </div>
                </div>

                {/* First 30 Days Action Plan */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400">
                    6. First 30-Day Successor Action Plan
                  </h4>
                  <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2 text-slate-300">
                    <div>&bull; <strong>Days 1–7:</strong> Vault access verification, environment setup, and shadow on-call procedures.</div>
                    <div>&bull; <strong>Days 8–15:</strong> Resolve outstanding knowledge gaps flagged by departing lead; execute staging test deployment.</div>
                    <div>&bull; <strong>Days 16–30:</strong> Assume primary operational ownership; archive departing member's credentials and revoke transient QR bridge.</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#10182E] border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
              Select or compile a Handover Pack to inspect.
            </div>
          )}
        </div>
      </div>

      {/* Mint QR Modal */}
      {isMintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#10182E] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-400" />
              Mint Secure QR Knowledge Bridge
            </h3>

            {!mintedBridge ? (
              <form onSubmit={handleMintQR} className="space-y-3">
                <p className="text-xs text-slate-400">
                  Generates an HMAC-SHA256 cryptographically signed QR code granting time-bounded, single or multi-use access to this Handover Pack.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Time To Live (Hours)</label>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={mintTtl}
                      onChange={(e) => setMintTtl(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Max Redemptions</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={mintMaxUses}
                      onChange={(e) => setMintMaxUses(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Security Passphrase <span className="text-[10px] text-slate-400">(Optional Secondary Secret)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Optional passphrase for successor"
                    value={mintPassphrase}
                    onChange={(e) => setMintPassphrase(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMintModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isMinting}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-lg hover:from-teal-400 hover:to-cyan-400 shadow-md shadow-teal-500/20"
                  >
                    {isMinting ? 'Cryptographically Signing...' : 'Mint Bridge Token'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 inline-block mx-auto">
                  <img
                    src={mintedBridge.qr_data_url}
                    alt="BATON QR Knowledge Bridge"
                    className="w-48 h-48 rounded"
                  />
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-emerald-400">QR Knowledge Bridge Minted!</div>
                  <div className="text-[11px] text-slate-400">
                    Expires: {new Date(mintedBridge.expires_at).toLocaleString()} &bull; Allowed scans: {mintedBridge.max_uses}
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={mintedBridge.qr_data_url}
                    download={`BATON-QR-Handover-${activeHandover?.id || 'doc'}.png`}
                    className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(mintedBridge.signed_token)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Token</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsMintModalOpen(false)}
                  className="w-full py-2 bg-slate-900 text-slate-400 hover:text-slate-200 text-xs rounded-lg"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate Handover Modal */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#10182E] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Compile Successor Handover Pack
            </h3>
            <p className="text-xs text-slate-400">
              BATON synthesizes all approved claims, operational runbooks, unresolved backlog tickets, and dependencies into an actionable package.
            </p>
            <form onSubmit={handleGenerateHandover} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Handover Document Title *</label>
                <input
                  type="text"
                  required
                  value={genTitle}
                  onChange={(e) => setGenTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 shadow-md shadow-cyan-500/20"
                >
                  {isGenerating ? 'Synthesizing...' : 'Compile Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
