import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Sparkles, AlertCircle, ArrowRight, Lock, Mail,
  Sun, Moon, Zap, ShieldCheck, UserCheck, LayoutDashboard,
  KeyRound, Check, X
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, staticLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setIsResetLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setResetMessage(res.message);
      if (res.reset_token) {
        setResetTokenInput(res.reset_token);
      }
      setResetStep('reset');
    } catch (err: any) {
      setResetError(err.message || 'Failed to initiate password reset.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleApplyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setIsResetLoading(true);
    try {
      const res = await api.resetPassword(resetTokenInput.trim(), newPasswordInput);
      setResetMessage(res.message);
      setEmail(forgotEmail);
      setPassword(newPasswordInput);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetStep('request');
        setResetMessage('');
      }, 1800);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      // In case backend is offline, notify user and provide immediate static entry
      setError(`${err.message || 'Server unavailable'}. Click 'Enter Dashboard Directly' below for instant static demo.`);
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
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-md shadow-teal-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-slate-900 dark:text-slate-100">BATON</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sign in to Knowledge Vault</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Institutional memory continuity &amp; handover management</p>
        </div>

        {/* Primary Container */}
        <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-5 transition-colors">
          
          {/* ULTRA-PROMINENT DIRECT DASHBOARD BUTTON */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleStaticLogin('admin')}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 group cursor-pointer border-2 border-teal-300 dark:border-cyan-300"
            >
              <LayoutDashboard className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <span>DIRECT ACCESS TO DASHBOARD</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-teal-700 dark:text-cyan-400 font-semibold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>One-Click Instant Access &bull; No Credentials Required</span>
            </div>
          </div>

          {/* Quick Role Selectors for Testing */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider text-center">
              Explore As Pre-Seeded Role:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStaticLogin('admin')}
                className="py-1.5 px-2 bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Lead Architect (Full Admin)"
              >
                <Zap className="w-3 h-3 text-teal-600 dark:text-cyan-400" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleStaticLogin('reviewer')}
                className="py-1.5 px-2 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Compliance Reviewer"
              >
                <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Reviewer</span>
              </button>
              <button
                type="button"
                onClick={() => handleStaticLogin('successor')}
                className="py-1.5 px-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Incoming Successor"
              >
                <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Successor</span>
              </button>
            </div>
          </div>

          {/* Divider */}
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

          {/* Traditional Credentials Form */}
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
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setResetError('');
                    setResetMessage('');
                    setResetStep('request');
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] text-teal-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
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
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In with Password'}</span>
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

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-cyan-500/10 text-teal-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {resetStep === 'request' ? 'Reset Vault Password' : 'Enter Reset Verification'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {resetStep === 'request'
                  ? 'Enter your corporate email address to receive a signed reset token.'
                  : 'Enter the reset token and set a new password for your account.'}
              </p>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{resetMessage}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="engineer@organization.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-600 dark:focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isResetLoading ? 'Dispatching Instructions...' : 'Request Reset Token'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleApplyReset} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetTokenInput}
                    onChange={(e) => setResetTokenInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-600 dark:focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-600 dark:focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isResetLoading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
                  <Check className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
