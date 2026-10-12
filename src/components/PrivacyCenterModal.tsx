import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Cookie,
  Server,
  Trash2,
  CheckCircle2,
  Mail,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { STORE_INFO } from '../data/jhfData';

interface PrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'cookies' | 'data' | 'terms';
}

export const PrivacyCenterModal: React.FC<PrivacyCenterModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'cookies' | 'data' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Privacy &amp; Data Governance Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent Data Principles • Zero Covert Tracking • Purpose-Limited Security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-xs font-bold">
          {[
            { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
            { id: 'cookies', label: 'Cookie & Tracking', icon: Cookie },
            { id: 'data', label: 'Download & Security Data', icon: Server },
            { id: 'terms', label: 'Terms of Service', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 pb-3 border-b-2 px-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Strict Data-Minimization Commitment</span>
                </div>
                <p className="text-xs">
                  At JHF Laptop Zone, we treat customer trust with utmost seriousness. We never sell your personal information, share order records with third-party advertising networks, or install covert trackers on your device.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  1. Information We Collect
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                  <li><strong>Order Information:</strong> Name, delivery phone number, district/city, and shipping address necessary to deliver your laptop via courier.</li>
                  <li><strong>Technical Telemetry:</strong> Anonymized browser type, approximate city/country, and download timestamps to safeguard our server bandwidth against denial-of-service scrapers.</li>
                  <li><strong>Support Messages:</strong> Chat logs submitted to our AI Assistant or WhatsApp dispatcher for customer warranty and purchase validation.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  2. What We NEVER Collect
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <span className="text-rose-500 font-bold block">✕ No Covert Cameras / Audio</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">No microphone or camera is accessed without explicit user initiation during voice features.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                    <span className="text-rose-500 font-bold block">✕ No Keyloggers or Passwords</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">We never record keystrokes or sensitive credential entries.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  3. Retention &amp; Auto-Purge
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Temporary telemetry logs are automatically purged on a rolling 30-day schedule. Verified order receipts are retained for the duration of the laptop's warranty period (15 days to 5 years).
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: COOKIES */}
          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Cookies and local browser storage are utilized to improve your shopping experience and remember your site preferences.
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">Strictly Necessary Cookies</span>
                    <span className="text-[10px] font-extrabold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">ALWAYS ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Required for shopping cart, dark/light theme persistence, comparison lists, and session security.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">Preferences &amp; Language</span>
                    <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">CONFIGURABLE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Stores your chosen display language (English, বাংলা, हिन्दी) and currency preference (BDT, INR, USD, EUR, etc.).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">Security Rate-Limiting</span>
                    <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">CONFIGURABLE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tracks download frequencies locally to stop aggressive automated robots from exhausting file download links.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOAD & SECURITY */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Software &amp; Tool Download Security Architecture
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All software, diagnostic utilities, and OS ISO files provided on JHF Laptop Zone are stored in verified Google Drive and Mega repositories. When you start a download:
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>MD5 / Virus Scanned:</strong> Every tool (CrystalDiskInfo, BatteryInfoView, FurMark, etc.) has been scanned against malware before indexing.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Audit Logs:</strong> Downloads are logged with timestamp and approximate region to monitor bandwidth demand and prevent abuse.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Right to Erasure (GDPR Art. 17):</strong> Customers may contact our admin desk at any time to request erasure of their IP or order logs.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                JHF Laptop Zone Terms of Service
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                By purchasing or downloading tools from JHF Laptop Zone, you agree to the following terms:
              </p>

              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
                <li><strong>Hardware Warranty:</strong> Laptops come with standard 15-day to 30-day replacement guarantees and 2 to 5-year free service warranties as specified on each model invoice.</li>
                <li><strong>Testing Tools Disclaimer:</strong> All utilities in the Testing Tools Zone are free third-party diagnostic software provided as-is to assist customers in verifying hardware specs.</li>
                <li><strong>Courier Delivery:</strong> Nationwide delivery in all 64 districts with inspection before final payment condition.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>{STORE_INFO.email}</span>
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
              <span>{STORE_INFO.phones[0]}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-sm"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
};
