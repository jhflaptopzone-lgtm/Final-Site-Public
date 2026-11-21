import React, { useState } from 'react';
import { DownloadItem } from '../data/jhfData';
import { ShareItemType, buildShareUrl, copyTextToClipboard } from '../utils/shareLinks';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  ExternalLink,
  HardDrive,
  Disc,
  Wrench,
  Sparkles,
  Link2,
} from 'lucide-react';

interface ResourceShareModalProps {
  item: DownloadItem | null;
  type: Extract<ShareItemType, 'software' | 'windows' | 'testing-tool'>;
  onClose: () => void;
}

export const ResourceShareModal: React.FC<ResourceShareModalProps> = ({
  item,
  type,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const shareUrl = buildShareUrl(type, item);

  const handleCopyLink = async () => {
    const ok = await copyTextToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const zoneMeta =
    type === 'windows'
      ? {
          badge: 'JHF Operating System Zone',
          accentText: 'text-purple-600 dark:text-purple-400',
          accentBg: 'bg-purple-600 hover:bg-purple-700',
          pillBg: 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300',
          icon: Disc,
        }
      : type === 'testing-tool'
      ? {
          badge: 'JHF Testing Tools Zone',
          accentText: 'text-emerald-600 dark:text-emerald-400',
          accentBg: 'bg-emerald-600 hover:bg-emerald-700',
          pillBg: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300',
          icon: Wrench,
        }
      : {
          badge: 'JHF Software Zone',
          accentText: 'text-blue-600 dark:text-blue-400',
          accentBg: 'bg-blue-600 hover:bg-blue-700',
          pillBg: 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300',
          icon: HardDrive,
        };

  const Icon = zoneMeta.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <Icon className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {zoneMeta.badge}
              </span>
              <h2 className="font-bold text-sm sm:text-base text-white truncate">
                {item.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition shrink-0"
            aria-label="Close resource modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex items-start gap-4">
            {item.image ? (
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Icon className={`w-7 h-7 ${zoneMeta.accentText}`} />
              </div>
            )}

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${zoneMeta.pillBg}`}>
                  {item.category}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Server: {item.source}
                </span>
                {item.size && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.size}
                  </span>
                )}
                {item.version && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.version}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.description || 'Verified direct download package hosted by JHF Laptop Zone for clean installation & diagnostics.'}
              </p>
            </div>
          </div>

          {/* Direct Shareable Link Box (Auto-adapts to current domain) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                title={shareUrl}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Unique Shareable Direct Link</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-adapts to domain
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-blue-700 dark:text-blue-300 hover:underline truncate"
              >
                {shareUrl}
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Verified Safe by JHF Laptop Zone
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Link Copied' : 'Share Link'}</span>
              </button>

              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className={`${zoneMeta.accentBg} text-white text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition`}
              >
                <Download className="w-4 h-4" />
                <span>Download Now</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
