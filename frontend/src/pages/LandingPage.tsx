import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, QrCode, ArrowRight,
  Sparkles, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200 dark:border-slate-800/80 px-6 md:px-12 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-md shadow-teal-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wider text-slate-900 dark:text-slate-100">BATON</span>
            <span className="ml-2 text-[10px] bg-teal-50 dark:bg-cyan-950 text-teal-700 dark:text-cyan-400 font-bold px-2 py-0.5 rounded border border-teal-200 dark:border-cyan-800">
              AI CONTINUITY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
            title="Toggle Pure White / Dark Navy"
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
            )}
          </button>

          <Link
            to="/verify-bridge"
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hidden sm:block"
          >
            Verify Token
          </Link>
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-cyan-400 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-500 dark:to-teal-500 text-white dark:text-slate-950 font-bold text-xs rounded-lg hover:from-teal-500 hover:to-cyan-500 transition-all shadow-md shadow-teal-500/20"
          >
            Deploy Vault
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-cyan-950/60 border border-teal-200 dark:border-cyan-800/70 text-teal-800 dark:text-cyan-400 text-xs font-bold mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero-Hallucination Institutional Continuity Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight max-w-4xl">
          Prevent Critical Knowledge Loss When{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 dark:from-cyan-400 dark:via-teal-300 dark:to-emerald-400">
            Engineers &amp; Leads Depart.
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          BATON reconstructs operational memory, anchors AI claims to verbatim byte offsets with a
          <strong className="text-slate-900 dark:text-slate-200"> Deterministic Grounding Guard</strong>, detects hidden bus-factor risks,
          and generates cryptographically protected <strong className="text-slate-900 dark:text-slate-200">QR Knowledge Bridges</strong>.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-500 dark:to-teal-500 text-white dark:text-slate-950 font-bold text-sm rounded-xl hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
          >
            <span>Start Free Organization Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Access Existing Vault</span>
          </Link>
        </div>

        {/* Philosophy Callout */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-50 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 border border-slate-200 dark:border-slate-800 text-left max-w-3xl w-full shadow-md">
          <div className="text-xs uppercase font-mono tracking-widest text-teal-700 dark:text-cyan-400 mb-2 font-bold">
            The BATON Continuity Doctrine
          </div>
          <blockquote className="text-sm md:text-base text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed border-l-2 border-teal-500 pl-4 py-1">
            "Preserve not only what an organisation knows, but why decisions were made, what remains unfinished, and how the next person can continue."
          </blockquote>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-cyan-500/10 text-teal-700 dark:text-cyan-400 flex items-center justify-center border border-teal-200 dark:border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Deterministic Grounding Guard</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No claim enters your institutional ledger without byte-level citation to original evidence chunks. AI is mathematically constrained from inventing operational facts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Knowledge Loss Radar</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Continuously maps technical dependencies, single points of contact (bus factor), and contradicting architecture decisions across engineering silos.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Secure QR Knowledge Bridge</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cryptographically signed HMAC tokens provide time-bounded, single or multi-use successor onboarding with immediate manager revocation rights.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        BATON &copy; 2026. Production-Oriented AI Knowledge Continuity SaaS Platform.
      </footer>
    </div>
  );
};
