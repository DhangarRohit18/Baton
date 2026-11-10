import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, QrCode, ArrowRight,
  Sparkles, Sun, Moon, Zap, GitBranch, Terminal
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { staticLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = () => {
    staticLogin('admin');
    navigate('/dashboard');
  };

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

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Direct Login for Demo */}
          <button
            onClick={handleDemoAccess}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-cyan-950/70 dark:hover:bg-cyan-900/80 text-teal-700 dark:text-cyan-300 border border-teal-300 dark:border-cyan-800 text-xs font-bold transition-all shadow-xs"
            title="Instant Live Dashboard Tour (No credentials required)"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Live Demo Dashboard</span>
            <span className="sm:hidden">Demo</span>
          </button>

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
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hidden md:block"
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
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-500 dark:to-teal-500 text-white dark:text-slate-950 font-bold text-xs rounded-lg hover:from-teal-500 hover:to-cyan-500 transition-all shadow-md shadow-teal-500/20 hidden sm:inline-block"
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

        {/* CTA Buttons with Direct Login Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleDemoAccess}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-500 dark:to-teal-500 text-white dark:text-slate-950 font-bold text-sm rounded-xl hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span>Direct Login to Dashboard (Live Demo)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Custom Organization Login</span>
          </Link>
        </div>

        {/* Philosophy Callout */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-50 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 border border-slate-200 dark:border-slate-800 text-left max-w-3xl w-full shadow-md">
          <p className="text-sm italic text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
            "When a key engineer leaves, they don't just take skills with them — they take invisible architecture,
            unwritten workarounds, and implicit operational dependencies. BATON ensures the handover is backed by
            verbatim evidence, not vague conversational summaries."
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Enterprise Continuity Principle</span>
            <span className="font-mono text-teal-600 dark:text-cyan-400 font-bold">Zero Autonomous Approvals</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-cyan-950 flex items-center justify-center text-teal-600 dark:text-cyan-400 border border-teal-200 dark:border-cyan-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Deterministic Grounding Guard</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every claim extracted by AI is strictly cross-referenced against verbatim byte ranges in source artifacts before approval.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Knowledge Loss Radar</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detect single points of failure, bus-factor vulnerabilities, undocumented systems, and contradictory technical runbooks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Secure QR Knowledge Bridge</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Provide successors instant, cryptographically signed access tokens with usage limits, optional passphrases, and kill-switches.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>BATON &bull; Enterprise AI Knowledge Continuity &amp; Succession Engine &bull; Zero autonomous authority.</p>
      </footer>
    </div>
  );
};
