import React, { useState } from 'react';
import { useAdminAuth } from '../authContext';
import { ShieldAlert, Lock, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface SensitiveActionModalProps {
  isOpen: boolean;
  actionTitle: string;
  actionDescription: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const SensitiveActionModal: React.FC<SensitiveActionModalProps> = ({
  isOpen,
  actionTitle,
  actionDescription,
  onConfirm,
  onClose,
}) => {
  const { reauthenticateSensitiveAction, currentUser } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    const verified = await reauthenticateSensitiveAction(password);
    setIsVerifying(false);

    if (verified) {
      onConfirm();
      onClose();
    } else {
      setError('ACCESS DENIED: Authentication challenge failed. Action aborted.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-[#0d121a] border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Security Challenge Required
            </h3>
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
              {actionTitle}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          {actionDescription}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm Admin Password ({currentUser?.email || 'Active User'})
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password to authorize"
                className="w-full pl-9 pr-3 py-2.5 bg-[#080c12] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 text-xs font-mono font-bold transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/40 disabled:opacity-50"
            >
              {isVerifying ? (
                <span>VERIFYING...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CONFIRM ACTION</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
