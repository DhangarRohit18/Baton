import React, { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { QrCode, X, Camera, KeyRound, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedeem: (data: any) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onSuccessRedeem }) => {
  const [manualToken, setManualToken] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (codeReaderRef.current) {
        codeReaderRef.current = null;
      }
      return;
    }

    if (activeTab === 'camera') {
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      codeReader.decodeFromVideoDevice(undefined, videoRef.current || undefined, (result) => {
        if (result) {
          const text = result.getText();
          if (text) {
            handleRedemption(text);
          }
        }
      }).catch((err) => {
        console.warn('Camera scan initialization failed:', err);
        setErrorMsg('Camera access unavailable or blocked. Please paste token manually.');
        setActiveTab('manual');
      });
    }

    return () => {
      codeReaderRef.current = null;
    };
  }, [isOpen, activeTab]);

  const handleRedemption = async (tokenToUse: string) => {
    setErrorMsg('');
    setIsRedeeming(true);
    try {
      const res = await api.redeemQRBridge(tokenToUse.trim(), passphrase.trim() || undefined);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      onSuccessRedeem(res);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to redeem QR Knowledge Bridge.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#10182E] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B132B]">
          <div className="flex items-center gap-2 text-teal-700 dark:text-cyan-400 font-bold text-sm">
            <QrCode className="w-5 h-5" />
            Secure QR Knowledge Bridge Scanner
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 text-xs font-semibold rounded flex items-center justify-center gap-2 ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-cyan-500/20 text-teal-700 dark:text-cyan-400 shadow-xs border border-slate-200 dark:border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" /> Camera Scan
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-xs font-semibold rounded flex items-center justify-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-cyan-500/20 text-teal-700 dark:text-cyan-400 shadow-xs border border-slate-200 dark:border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Manual Token / Passcode
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'camera' ? (
            <div className="space-y-3">
              <div className="relative aspect-square max-h-56 mx-auto bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-teal-500/50 rounded-lg pointer-events-none animate-pulse"></div>
              </div>
              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                Align the BATON QR code inside the frame. Camera scanning will verify cryptographic proof instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Signed QR Bridge Token</label>
                <textarea
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste BATON-eyJ... cryptographic token"
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Optional Passphrase */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Passphrase <span className="text-[10px] text-slate-500 dark:text-slate-400">(Leave blank if token has no password guard)</span>
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter bridge security passphrase"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            onClick={() => handleRedemption(manualToken)}
            disabled={isRedeeming || (activeTab === 'manual' && !manualToken.trim())}
            className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-cyan-500 dark:to-teal-500 text-white dark:text-slate-950 font-bold text-xs rounded-lg hover:from-teal-500 hover:to-cyan-500 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
          >
            {isRedeeming ? 'Validating Cryptographic Proof...' : 'Unlock Handover Knowledge'}
          </button>
        </div>
      </div>
    </div>
  );
};
