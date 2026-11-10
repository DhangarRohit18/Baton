import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditLogItem } from '../types';
import { ShieldAlert, RefreshCw, Filter, FileText, CheckCircle2, Ban } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('all');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs(100);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (filterAction === 'all') return true;
    return l.action.toLowerCase().includes(filterAction.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            Immutable Compliance Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident logs of all claim approvals, QR bridge mintings, gap resolutions, and revocations
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-[#10182E] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3 shadow-md">
        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-slate-200">{filteredLogs.length}</span> recorded actions
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="all">All Events</option>
          <option value="CLAIM">Claim Approvals / Reviews</option>
          <option value="QR">QR Knowledge Bridge Events</option>
          <option value="GAP">Gap Resolutions</option>
          <option value="DOCUMENT">Document Ingestion</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-[#10182E] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Steward Email</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-5">Details Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isRevoke = log.action.includes('REVOKED');
                  const isApproved = log.action.includes('APPROVED');
                  const isMint = log.action.includes('MINTED');

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-5 text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            isRevoke
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isMint
                              ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{log.user_email}</td>
                      <td className="py-3 px-4 text-cyan-400">
                        {log.resource_type}:{log.resource_id}
                      </td>
                      <td className="py-3 px-5 text-slate-400 text-[10px] max-w-xs truncate">
                        {log.details_json}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 text-xs font-sans">
                    No audit records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
