import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, AlertCircle, ArrowRight, Lock, Mail, Sun, Moon, Zap, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, staticLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaticLogin = (role: 'admin' | 'reviewer' | 'successor' = 'admin') => {
    staticLogin(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] flex flex-col justify-center items-center px-4 transition-colors relative py-12">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-slate-900 dark:text-slate-100">BATON</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in to Knowledge Vault</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Institutional memory continuity &amp; handover management</p>
        </div>

        {/* Primary Container */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md dark:shadow-2xl space-y-5 transition-colors">
          
          {/* Direct Instant Login Button for Static Demo */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-blue-950/40 border border-teal-200 dark:border-cyan-800/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[11px] font-bold text-teal-800 dark:text-cyan-300 uppercase tracking-wider">
                  One-Click Demo Access
                </span>
              </div>
              <span className="text-[10px] bg-teal-100 dark:bg-cyan-900/60 text-teal-700 dark:text-cyan-300 font-semibold px-2 py-0.5 rounded">
                Static Live Mode
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStaticLogin('admin')}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Direct Login for Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleStaticLogin('admin')}
                className="py-1.5 px-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors"
                title="Login as Lead Architect"
              >
                <Zap className="w-3 h-3 text-teal-600 dark:text-cyan-400" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleStaticLogin('reviewer')}
                className="py-1.5 px-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors"
                title="Login as Compliance Reviewer"
              >
                <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Reviewer</span>
              </button>
              <button
                type="button"
                onClick={() => handleStaticLogin('successor')}
                className="py-1.5 px-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-colors"
                title="Login as Successor"
              >
                <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Successor</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="shrink mx-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Or Custom Server Login
            </span>
            <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="engineer@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-600 dark:focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Access Password</label>
                <span className="text-[11px] text-teal-600 dark:text-cyan-400 cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-600 dark:focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign in with Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an enterprise vault?{' '}
          <Link to="/register" className="text-teal-600 dark:text-cyan-400 hover:underline font-semibold">
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
};
