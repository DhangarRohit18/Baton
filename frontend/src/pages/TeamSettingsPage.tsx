import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { Users, UserPlus, Shield, ShieldCheck, Mail, RefreshCw, KeyRound } from 'lucide-react';

export const TeamSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTeamMembers();
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    setIsInviting(true);
    try {
      await api.inviteUser({
        email: inviteEmail.trim(),
        full_name: inviteName.trim(),
        role: inviteRole,
      });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      await loadMembers();
      alert('Team member invited successfully!');
    } catch (err: any) {
      alert('Invite failed: ' + err.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (targetUserId: number, newRole: string) => {
    try {
      await api.updateUserRole(targetUserId, newRole);
      await loadMembers();
    } catch (err: any) {
      alert('Role update failed: ' + err.message);
    }
  };

  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Team Roster &amp; Organization Security
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage institutional access roles, reviewers, successors, and security permissions
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {isOwnerOrAdmin && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>Invite Team Member</span>
            </button>
          )}
          <button
            onClick={loadMembers}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#10182E] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">Name &amp; Identity</th>
                <th className="py-3 px-4">Corporate Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Role Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-cyan-400 font-black flex items-center justify-center text-[10px] border border-slate-700">
                        {m.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{m.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{m.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isOwnerOrAdmin && m.id !== user?.id ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="member">Member</option>
                        <option value="successor">Successor</option>
                        <option value="auditor">Auditor</option>
                      </select>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Primary Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#10182E] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              Invite Team Member
            </h3>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dana Scully"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="dana@organization.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="admin">Admin (Full Management)</option>
                  <option value="reviewer">Reviewer (Claim Reviewer &amp; Grounding Approver)</option>
                  <option value="member">Member (Contributor)</option>
                  <option value="successor">Successor (Handover Recipient)</option>
                  <option value="auditor">Auditor (Read-Only Compliance)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 shadow-md shadow-cyan-500/20"
                >
                  {isInviting ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
