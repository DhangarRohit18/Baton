import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { QRScannerModal } from './QRScannerModal';
import {
  FolderKanban, Plus, QrCode, ShieldCheck,
  Sun, Moon, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const { projects, activeProject, setActiveProject, refreshProjects } = useProject();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectLead, setNewProjectLead] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsCreating(true);
    try {
      const p = await api.createProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        lead_name: newProjectLead.trim() || user?.full_name,
        lead_email: user?.email,
      });
      await refreshProjects();
      setActiveProject(p);
      setIsNewProjectModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectLead('');
    } catch (err: any) {
      alert('Error creating project: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRedeemSuccess = (result: any) => {
    navigate('/successor', { state: { redeemedPackage: result } });
  };

  return (
    <>
      <header className="h-16 theme-surface border-b theme-border px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md transition-colors">
        {/* Project Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 theme-subtle border theme-border px-3 py-1.5 rounded-lg shadow-xs">
            <FolderKanban className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const found = projects.find((p) => p.id === parseInt(e.target.value, 10));
                if (found) setActiveProject(found);
              }}
              className="bg-transparent text-xs font-semibold theme-text-pri focus:outline-none cursor-pointer pr-4"
            >
              {projects.length === 0 ? (
                <option value="">No Active Projects</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id} className="theme-surface">
                    {p.name} ({p.status})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="p-1.5 theme-subtle hover:bg-slate-100 dark:hover:bg-slate-800 border theme-border theme-text-sec rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Create New Project"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">New Domain</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle (Pure White / Dark Navy) */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border theme-border theme-subtle hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold theme-text-sec transition-all shadow-xs"
            title={`Switch to ${theme === 'light' ? 'Dark Navy' : 'Pure White'} theme`}
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span className="hidden md:inline font-medium">Pure White</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                <span className="hidden md:inline font-medium">Dark Navy</span>
              </>
            )}
          </button>

          {/* Quick QR Scanner */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-500/15 to-cyan-500/15 border border-teal-500/30 hover:border-teal-500 text-teal-600 dark:text-cyan-400 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Bridge</span>
          </button>

          {/* Public Verification */}
          <button
            onClick={() => navigate('/verify-bridge')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs theme-text-mut hover:theme-text-pri transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verify Token</span>
          </button>

          <div className="h-5 w-[1px] theme-border bg-slate-300 dark:bg-slate-800"></div>

          {/* User initials */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shadow-md">
              {user?.full_name?.slice(0, 2).toUpperCase() || 'BA'}
            </div>
          </div>
        </div>
      </header>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccessRedeem={handleRedeemSuccess}
      />

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="theme-surface border theme-border rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold theme-text-pri flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
              Create Knowledge Continuity Project
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold theme-text-sec mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Payment Gateway / Billing Engine"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full theme-input border rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold theme-text-sec mb-1">Operational Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief context on architecture and business role..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full theme-input border rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold theme-text-sec mb-1">Primary Technical Lead</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Principal Architect"
                  value={newProjectLead}
                  onChange={(e) => setNewProjectLead(e.target.value)}
                  className="w-full theme-input border rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 theme-subtle hover:bg-slate-200 dark:hover:bg-slate-700 theme-text-sec text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-xs rounded-lg hover:from-teal-500 hover:to-cyan-500 shadow-md shadow-teal-500/20"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
