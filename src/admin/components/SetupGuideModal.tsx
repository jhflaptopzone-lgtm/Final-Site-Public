import React from 'react';
import { X, ShieldAlert, CheckCircle2, Copy, ExternalLink, Terminal, Key, Database, UserCheck } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConfig: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose, onOpenConfig }) => {
  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const sampleJson = `{
  "name": "MD. Jahid Hasan",
  "username": "jhfboss",
  "email": "jhfboss",
  "role": "super_admin",
  "status": "active",
  "createdAt": "2026-09-01T00:00:00Z",
  "lastLogin": "2026-09-01T00:00:00Z"
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">First Super Admin Account Setup Guide</h2>
              <p className="text-xs text-slate-400">Zero-Trust Authentication &amp; Firestore Initialization</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-6 text-sm">
          
          {/* Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-xs text-blue-300 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Strict Security Guarantee: No Hardcoded Credentials</strong>
              Per production security standards, passwords are never stored in JavaScript frontend code. You own full authority over your authentication database in Google Firebase.
            </div>
          </div>

          {/* Step 1 */}
          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-xs flex items-center justify-center">1</span>
              <span>Create Firebase Project &amp; Enable Auth</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Go to the Firebase Console, create or select your project, navigate to <strong>Build &rarr; Authentication &rarr; Sign-in method</strong>, and enable <strong>Email/Password</strong>.
            </p>
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              <span>Open Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-xs flex items-center justify-center">2</span>
              <span>Create First Admin User in Firebase Auth</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Under <strong>Authentication &rarr; Users</strong>, click <strong>"Add user"</strong> and create your official login:
            </p>
            <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 flex justify-between items-center">
              <span>Admin Username / Login ID: jhfboss</span>
              <span className="text-slate-500 text-[10px]">Super Admin Root</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-xs flex items-center justify-center">3</span>
              <span>Bootstrap Super Admin Profile in Cloud Firestore</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              In <strong>Firestore Database</strong>, create a collection named <code className="text-blue-400 bg-blue-950/40 px-1 py-0.5 rounded">users</code>.
              Add a document with the <strong>Document ID = YOUR_FIREBASE_AUTH_UID</strong> and insert the following fields:
            </p>

            <div className="relative">
              <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
                {sampleJson}
              </pre>
              <button
                onClick={() => copyToClipboard(sampleJson)}
                className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-xs text-white px-2 py-1 rounded flex items-center gap-1 border border-slate-700"
              >
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-xs flex items-center justify-center">4</span>
              <span>Deploy Firestore Security Rules</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              The project root file <code className="text-blue-400">firestore.rules</code> contains the complete role-based zero-trust security rules with default-deny.
              In Firebase Console &rarr; Firestore &rarr; <strong>Rules</strong>, paste the contents of <code className="text-blue-400">firestore.rules</code> and click <strong>Publish</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Ready to connect your keys?
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Done
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenConfig();
                }}
                className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Database className="w-4 h-4" />
                <span>Connect Firebase Project</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
