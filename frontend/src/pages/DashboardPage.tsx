import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { RadarOverview, Claim, Handover, ExitInterview } from '../types';
import { AdminDashboardView } from '../components/dashboards/AdminDashboardView';
import { ReviewerDashboardView } from '../components/dashboards/ReviewerDashboardView';
import { SuccessorDashboardView } from '../components/dashboards/SuccessorDashboardView';
import { DepartingMemberDashboardView } from '../components/dashboards/DepartingMemberDashboardView';
import {
  ShieldCheck, UserCheck, FileText, Zap,
  RefreshCw, CheckCircle2, Building2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { projects, activeProject } = useProject();

  const [radar, setRadar] = useState<RadarOverview | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [interviews, setInterviews] = useState<ExitInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active perspective matches user.role by default, but allows fast switching
  const [activeRole, setActiveRole] = useState<'admin' | 'reviewer' | 'successor' | 'member'>(
    (user?.role as any) || 'admin'
  );

  useEffect(() => {
    if (user?.role) {
      const validRoles = ['admin', 'reviewer', 'successor', 'member'];
      if (validRoles.includes(user.role)) {
        setActiveRole(user.role as any);
      }
    }
  }, [user?.role]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [radarData, claimsData, handoversData, interviewsData] = await Promise.all([
        api.getRadarOverview(),
        api.getClaims(activeProject?.id || 1),
        api.getHandovers(activeProject?.id || 1),
        api.getInterviews(activeProject?.id || 1),
      ]);
      setRadar(radarData);
      setClaims(claimsData);
      setHandovers(handoversData);
      setInterviews(interviewsData);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeProject]);

  const handleRoleChange = (role: 'admin' | 'reviewer' | 'successor' | 'member') => {
    setActiveRole(role);
    switchRole(role);
  };

  return (
    <div className="space-y-6">
      {/* Role / Perspective Switcher Pill Bar */}
      <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Active Dashboard Perspective:
          </span>
        </div>

        {/* 4 Dedicated Dashboard Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-cyan-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Chief Architect</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('reviewer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'reviewer'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Reviewer</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('successor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'successor'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Successor</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('member')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'member'
                ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Departing Lead</span>
          </button>
        </div>

        <button
          onClick={loadData}
          className="self-end md:self-auto p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh Dashboard Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Render Respective Dashboard View */}
      {activeRole === 'admin' && (
        <AdminDashboardView
          radar={radar}
          projects={projects}
          activeProject={activeProject}
        />
      )}

      {activeRole === 'reviewer' && (
        <ReviewerDashboardView
          claims={claims}
          activeProject={activeProject}
          onRefresh={loadData}
        />
      )}

      {activeRole === 'successor' && (
        <SuccessorDashboardView
          handovers={handovers}
          activeProject={activeProject}
        />
      )}

      {activeRole === 'member' && (
        <DepartingMemberDashboardView
          interviews={interviews}
          activeProject={activeProject}
          onRefresh={loadData}
        />
      )}
    </div>
  );
};
