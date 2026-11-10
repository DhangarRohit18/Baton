import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { QRScannerModal } from './QRScannerModal';
import {
  FolderKanban, Plus, QrCode, ShieldCheck, ChevronDown,
  Bell, AlertCircle, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const { projects, activeProject, setActiveProject, refreshProjects } = useProject();
  const { user } = useAuth();
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
    // Navigate to successor portal or handover view
    navigate('/successor', { state: { redeemedPackage: result } });
  };

  return (
    <>
      <header className="h-16 bg-[#0B132B]/95 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        {/* Project Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <FolderKanban className="w-4 h-4 text-cyan-400" />
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const found = projects.find((p) => p.id === parseInt(e.target.value, 10));
                if (found) setActiveProject(found);
              }}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-4"
            >
              {projects.length === 0 ? (
                <option value="">No Active Projects</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                    {p.name} ({p.status})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Create New Project"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">New Domain</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-3">
          {/* Quick QR Scanner */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/15 to-teal-500/15 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Bridge</span>
          </button>

          {/* Public Verification */}
          <button
            onClick={() => navigate('/verify-bridge')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verify Token</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-800"></div>

          {/* User initials */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#10182E] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Create Knowledge Continuity Project
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Payment Gateway / Billing Engine"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Operational Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief context on architecture and business role..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Technical Lead</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Principal Architect"
                  value={newProjectLead}
                  onChange={(e) => setNewProjectLead(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400"
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
