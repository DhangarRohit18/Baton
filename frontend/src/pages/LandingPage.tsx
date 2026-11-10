import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, QrCode, FileText, ArrowRight,
  Sparkles, CheckCircle2, Lock, Cpu, Database, Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-800/80 px-6 md:px-12 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wider text-slate-100">BATON</span>
            <span className="ml-2 text-[10px] bg-cyan-950 text-cyan-400 font-bold px-2 py-0.5 rounded border border-cyan-800">
              AI CONTINUITY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/verify-bridge"
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 hidden sm:block"
          >
            Verify QR Token
          </Link>
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20"
          >
            Deploy Vault
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/70 text-cyan-400 text-xs font-bold mb-6">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Zero-Hallucination Institutional Continuity Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight leading-tight max-w-4xl">
          Prevent Critical Knowledge Loss When{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Engineers & Leads Depart.
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          BATON reconstructs operational memory, anchors AI claims to verbatim byte offsets with a
          <strong className="text-slate-200"> Deterministic Grounding Guard</strong>, detects hidden bus-factor risks,
          and generates cryptographically protected <strong className="text-slate-200">QR Knowledge Bridges</strong>.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-sm rounded-xl hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
          >
            <span>Start Free Organization Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <span>Access Existing Vault</span>
          </Link>
        </div>

        {/* Philosophy Callout */}
        <div className="mt-16 p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 text-left max-w-3xl w-full shadow-2xl">
          <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 mb-2 font-bold">
            The BATON Continuity Doctrine
          </div>
          <blockquote className="text-sm md:text-base text-slate-200 italic font-medium leading-relaxed border-l-2 border-cyan-500 pl-4 py-1">
            "Preserve not only what an organisation knows, but why decisions were made, what remains unfinished, and how the next person can continue."
          </blockquote>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-800/80 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Deterministic Grounding Guard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No claim enters your institutional ledger without byte-level citation to original evidence chunks. AI is mathematically constrained from inventing operational facts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Knowledge Loss Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuously maps technical dependencies, single points of contact (bus factor), and contradicting architecture decisions across engineering silos.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Secure QR Knowledge Bridge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographically signed HMAC tokens provide time-bounded, single or multi-use successor onboarding with immediate manager revocation rights.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        BATON &copy; 2026. Production-Oriented AI Knowledge Continuity SaaS Platform.
      </footer>
    </div>
  );
};
