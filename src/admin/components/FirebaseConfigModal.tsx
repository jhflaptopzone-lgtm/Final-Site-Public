import React, { useState } from 'react';
import { X, Check, Database, Save, RotateCcw, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../authContext';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { reloadFirebaseConfig, isFirebaseLive } = useAdminAuth();

  const [apiKey, setApiKey] = useState(() => {
    try {
      const stored = localStorage.getItem('jhf_firebase_config');
      return stored ? JSON.parse(stored).apiKey || '' : '';
    } catch {
      return '';
    }
  });

  const [authDomain, setAuthDomain] = useState(() => {
    try {
      const stored = localStorage.getItem('jhf_firebase_config');
      return stored ? JSON.parse(stored).authDomain || '' : '';
    } catch {
      return '';
    }
  });

  const [projectId, setProjectId] = useState(() => {
    try {
      const stored = localStorage.getItem('jhf_firebase_config');
      return stored ? JSON.parse(stored).projectId || '' : '';
    } catch {
      return '';
    }
  });

  const [storageBucket, setStorageBucket] = useState(() => {
    try {
      const stored = localStorage.getItem('jhf_firebase_config');
      return stored ? JSON.parse(stored).storageBucket || '' : '';
    } catch {
      return '';
    }
  });

  const [appId, setAppId] = useState(() => {
    try {
      const stored = localStorage.getItem('jhf_firebase_config');
      return stored ? JSON.parse(stored).appId || '' : '';
    } catch {
      return '';
    }
  });

  const [rawSnippet, setRawSnippet] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleParseSnippet = (snippet: string) => {
    setRawSnippet(snippet);
    try {
      const apiKeyMatch = snippet.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = snippet.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = snippet.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = snippet.match(/storageBucket:\s*["']([^"']+)["']/);
      const appIdMatch = snippet.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch) setApiKey(apiKeyMatch[1]);
      if (authDomainMatch) setAuthDomain(authDomainMatch[1]);
      if (projectIdMatch) setProjectId(projectIdMatch[1]);
      if (storageBucketMatch) setStorageBucket(storageBucketMatch[1]);
      if (appIdMatch) setAppId(appIdMatch[1]);
    } catch (e) {
      console.warn('Could not auto-parse snippet');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      alert('API Key and Project ID are required.');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      appId: appId.trim(),
    };

    localStorage.setItem('jhf_firebase_config', JSON.stringify(config));
    reloadFirebaseConfig();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    if (confirm('Clear Firebase config and revert to local storage mode?')) {
      localStorage.removeItem('jhf_firebase_config');
      setApiKey('');
      setAuthDomain('');
      setProjectId('');
      setStorageBucket('');
      setAppId('');
      setRawSnippet('');
      reloadFirebaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 sm:p-7 shadow-2xl relative my-8 text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Firebase Project Credentials</h2>
              <p className="text-xs text-slate-400">
                Current Status: {isFirebaseLive ? <span className="text-emerald-400 font-bold">Live Firebase Connected</span> : <span className="text-amber-400 font-bold">Local Storage Mode</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Paste Snippet */}
        <div className="mt-4 mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Quick Paste: Firebase SDK Config Snippet (from Project Settings)
          </label>
          <textarea
            rows={3}
            value={rawSnippet}
            onChange={(e) => handleParseSnippet(e.target.value)}
            placeholder="const firebaseConfig = { apiKey: '...', authDomain: '...', projectId: '...' };"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-cyan-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          ></textarea>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">API Key *</label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Project ID *</label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="jhf-laptop-zone"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="jhf-laptop-zone.firebaseapp.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Storage Bucket</label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="jhf-laptop-zone.appspot.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">App ID</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="1:123456789:web:abcdef"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
            <span className="text-slate-200 font-semibold">Note:</span> Credentials are saved strictly to your browser's private secure storage and used to initialize client-side Firebase Auth and Cloud Firestore.
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 py-2 px-3"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Local Mode</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 px-4 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-5 rounded-xl flex items-center gap-1.5 shadow"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved &amp; Connected!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save &amp; Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
