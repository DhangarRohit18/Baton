import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Claim } from '../types';

interface EvidenceDrawerProps {
  claim: Claim | null;
  onClose: () => void;
  onReVerify?: (claimId: number) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ claim, onClose, onReVerify }) => {
  if (!claim) return null;

  const isGrounded = claim.grounding_status === 'grounded';
  const scorePercent = Math.round(claim.grounding_score * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0D152A] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#080D1C]">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md ${isGrounded ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">Deterministic Grounding Guard</div>
              <div className="text-[11px] text-slate-400">Verifiable Evidence Anchoring Engine</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Claim statement card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                {claim.category}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Grounding Score:</span>
                <span className={`text-xs font-bold ${scorePercent >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {scorePercent}%
                </span>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-slate-100">{claim.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              "{claim.statement}"
            </p>
          </div>

          {/* Grounding Guard Verdict */}
          <div className={`p-4 rounded-xl border ${isGrounded ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-amber-950/20 border-amber-800/40'}`}>
            <div className="flex items-start gap-3">
              {isGrounded ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h5 className={`text-xs font-bold ${isGrounded ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isGrounded ? 'Grounding Proof Verified' : 'Caution: Pending Full Evidence Grounding'}
                </h5>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  {isGrounded
                    ? 'This claim was deterministically matched with the original source document. Lexical entities, technical numbers, and semantics correspond to the cited passage.'
                    : 'The extraction engine flagged potential variance from cited evidence. Human reviewer signoff is required before promotion to official handover.'}
                </p>
              </div>
            </div>
          </div>

          {/* Evidence Chunks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Anchored Source Citations ({claim.evidence_links.length})
              </h5>
              {onReVerify && (
                <button
                  onClick={() => onReVerify(claim.id)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                >
                  Re-Verify Guard
                </button>
              )}
            </div>

            {claim.evidence_links.length === 0 ? (
              <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-lg text-center text-xs text-slate-400">
                No direct evidence chunks linked. Claim is marked unverified.
              </div>
            ) : (
              claim.evidence_links.map((link) => (
                <div key={link.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      {link.document_title || 'Document Chunk'}
                    </span>
                    <span className="text-cyan-400 font-mono text-[10px]">
                      Method: {link.match_method}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 bg-slate-950/90 p-3 rounded border border-slate-800/80 font-mono leading-relaxed select-text">
                    {link.snippet || 'Verbatim quote preserved in secure blob snapshot.'}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Evidence Chunk #{link.evidence_id}</span>
                    <span className="text-emerald-400 font-semibold">Overlap: {Math.round(link.overlap_ratio * 100)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080D1C] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
