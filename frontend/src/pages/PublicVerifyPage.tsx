import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertOctagon, Sparkles, Search, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const PublicVerifyPage: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setIsVerifying(true);
    setSearched(true);
    try {
      const res = await api.verifyPublicQR(tokenInput.trim());
      setVerificationResult(res);
    } catch (err: any) {
      setVerificationResult({
        valid: false,
        verification_status: 'ERROR',
        message: err.message || 'Verification request failed.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-base tracking-wider text-slate-100">BATON VERIFICATION</span>
        </Link>
        <Link to="/login" className="text-xs text-slate-400 hover:text-cyan-400">
          Sign In &rarr;
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-100">
            Public Knowledge Artifact Integrity Verification
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Validate the cryptographic provenance of a BATON Handover Token without exposing confidential institutional assets.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="w-full bg-[#10182E] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder="Paste BATON-eyJ... signed token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || !tokenInput.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            {isVerifying ? 'Verifying HMAC Signature...' : 'Verify Cryptographic Integrity'}
          </button>
        </form>

        {/* Results Card */}
        {searched && verificationResult && (
          <div
            className={`w-full rounded-xl border p-5 space-y-3 shadow-2xl animate-in fade-in ${
              verificationResult.valid
                ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                : 'bg-rose-950/20 border-rose-800/40 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {verificationResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-400" />
              )}
              <h3 className="text-sm font-bold">
                {verificationResult.valid ? 'Cryptographic Integrity Validated' : 'Verification Flagged'}
              </h3>
            </div>

            {verificationResult.valid ? (
              <div className="space-y-2 text-xs pt-1 border-t border-emerald-800/30">
                <div className="flex justify-between">
                  <span className="text-slate-400">Public Verification ID:</span>
                  <span className="font-mono text-cyan-400 font-bold">{verificationResult.verification_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Artifact Status:</span>
                  <span className="text-emerald-400 font-bold">{verificationResult.integrity_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Published Timestamp:</span>
                  <span className="font-mono text-slate-300">
                    {new Date(verificationResult.published_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Claims Anchored:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {verificationResult.claims_count_verified}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 italic pt-1">{verificationResult.note}</p>
              </div>
            ) : (
              <div className="text-xs text-rose-300">
                {verificationResult.message || 'Signature mismatch or expired token.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
