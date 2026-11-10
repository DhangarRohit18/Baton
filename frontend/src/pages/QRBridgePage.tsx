import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { QRBridge, Handover } from '../types';
import { QRScannerModal } from '../components/QRScannerModal';
import {
  QrCode, ShieldCheck, Download, Share2, AlertTriangle,
  RefreshCw, Camera, KeyRound, Lock, Ban, CheckCircle2
} from 'lucide-react';

export const QRBridgePage: React.FC = () => {
  const { activeProject } = useProject();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [bridges, setBridges] = useState<QRBridge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Revocation modal state
  const [revokingBridge, setRevokingBridge] = useState<QRBridge | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  const loadData = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const hList = await api.getHandovers(activeProject.id);
      setHandovers(hList);

      const allBridges: QRBridge[] = [];
      for (const h of hList) {
        const bList = await api.listQRBridges(h.id);
        allBridges.push(...bList);
      }
      setBridges(allBridges);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeProject]);

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingBridge || !revokeReason.trim()) return;
    setIsRevoking(true);
    try {
      await api.revokeQRBridge(revokingBridge.id, revokeReason.trim());
      setRevokingBridge(null);
      setRevokeReason('');
      await loadData();
    } catch (err: any) {
      alert('Revocation failed: ' + err.message);
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Token copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-cyan-400" />
            Secure QR Knowledge Bridge Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            HMAC-SHA256 Cryptographic Token Lifecycle, Scanning &amp; Instantaneous Revocation
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>Launch Camera Scanner</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bridges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bridges.length > 0 ? (
          bridges.map((bridge) => {
            const isExpired = new Date(bridge.expires_at) < new Date();
            const isDepleted = bridge.current_uses >= bridge.max_uses;
            const isInactive = bridge.is_revoked || isExpired || isDepleted;

            return (
              <div
                key={bridge.id}
                className={`bg-[#10182E] border rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-xl transition-all ${
                  bridge.is_revoked
                    ? 'border-rose-900/40 opacity-75'
                    : isExpired
                    ? 'border-amber-900/40 opacity-80'
                    : 'border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-cyan-400 border border-slate-800">
                      Token #{bridge.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        bridge.is_revoked
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : isExpired
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : isDepleted
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {bridge.is_revoked
                        ? 'Revoked'
                        : isExpired
                        ? 'Expired'
                        : isDepleted
                        ? 'Depleted'
                        : 'Active Guard'}
                    </span>
                  </div>

                  {/* QR Image */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-center">
                    <img
                      src={bridge.qr_data_url}
                      alt="QR Bridge"
                      className="w-36 h-36 rounded"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Redemptions:</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {bridge.current_uses} / {bridge.max_uses} Used
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Passphrase Protection:</span>
                      <span className="font-semibold text-slate-200">
                        {bridge.has_passphrase ? 'Encrypted' : 'Standard Token'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Expires:</span>
                      <span className="text-slate-300 font-mono text-[10px]">
                        {new Date(bridge.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex gap-2">
                    <a
                      href={bridge.qr_data_url}
                      download={`BATON-QR-${bridge.id}.png`}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG</span>
                    </a>
                    <button
                      onClick={() => copyToClipboard(bridge.signed_token)}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-semibold rounded-lg border border-slate-800 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Token</span>
                    </button>
                  </div>

                  {!bridge.is_revoked && (
                    <button
                      onClick={() => {
                        setRevokingBridge(bridge);
                        setRevokeReason('');
                      }}
                      className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Revoke Immediately</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-[#10182E] border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs space-y-3">
            <QrCode className="w-10 h-10 text-slate-600 mx-auto" />
            <p>No QR Knowledge Bridges minted yet for this project. Go to Handover Packs and click "Mint QR Bridge".</p>
          </div>
        )}
      </div>

      {/* Revocation Confirmation Modal */}
      {revokingBridge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#10182E] border border-rose-800/40 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-400" />
              Emergency Token Revocation
            </h3>
            <p className="text-xs text-slate-300">
              Revoking Token #{revokingBridge.id} immediately invalidates the cryptographic signature and records an audit compliance event.
            </p>
            <form onSubmit={handleRevoke} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Revocation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employee departure completed / suspicious access"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokingBridge(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRevoking || !revokeReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold text-xs rounded-lg transition-colors"
                >
                  {isRevoking ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccessRedeem={() => loadData()}
      />
    </div>
  );
};
