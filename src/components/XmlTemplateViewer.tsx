import React, { useState } from 'react';
import { Copy, Check, Download, Code, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface XmlTemplateViewerProps {
  xmlContent: string;
}

export const XmlTemplateViewer: React.FC<XmlTemplateViewerProps> = ({ xmlContent }) => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'code' | 'instructions'>('code');

  const copyToClipboard = () => {
    if (!xmlContent) return;
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadXml = () => {
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blogger-template.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Valid Blogger XML (v3 Responsive Theme)</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              blogger-template.xml Code & Installation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Ready to install directly on <a href="https://www.jhflaptopzone.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">jhflaptopzone.com</a> Blogger theme
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('code')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeSubTab === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              XML Code Viewer
            </button>
            <button
              onClick={() => setActiveSubTab('instructions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeSubTab === 'instructions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              How to Install in Blogger
            </button>

            <button
              onClick={copyToClipboard}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : '1-Click Copy XML'}</span>
            </button>

            <button
              onClick={downloadXml}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download .xml</span>
            </button>
          </div>
        </div>

        {activeSubTab === 'code' ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>File size: ~63 KB • 1,733+ lines of clean HTML5, CSS3, Blogger layout tags & JS</span>
              <span>Encoding: UTF-8</span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>blogger-template.xml</span>
                <button
                  onClick={copyToClipboard}
                  className="text-slate-300 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-200 p-4 text-xs font-mono overflow-auto max-h-[600px] leading-relaxed select-all">
                <code>{xmlContent}</code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6 max-w-3xl">
            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="font-bold text-slate-900 dark:text-white">Note:</strong> Your existing Blogger blog posts, product pages, labels and comments will <strong>NOT</strong> be deleted. The new theme will format them cleanly into the e-commerce layout!
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Open Blogger Admin</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Visit <a href="https://draft.blogger.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">blogger.com</a> and login with your JHF LAPTOP ZONE account.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Backup Old Theme</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Click <strong>Theme</strong> on the left menu &rarr; click the arrow dropdown next to <strong>Customize</strong> &rarr; click <strong>Backup</strong> &rarr; click Download.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Edit HTML</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    In the same dropdown menu next to Customize, click <strong>Edit HTML</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Paste New XML Template</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Press <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">Ctrl + A</kbd> to select all old code, press Delete, then paste the copied XML code.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  5
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Save and Launch!</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Click the <strong>Save</strong> (floppy disk icon) at the top-right corner. Open <a href="https://www.jhflaptopzone.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">jhflaptopzone.com</a> to see your redesigned store live!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={copyToClipboard}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied XML Code!' : 'Copy XML Code to Clipboard'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
