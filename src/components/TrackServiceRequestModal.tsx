import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../admin/adminStore';
import {
  ServiceRequest,
  ServiceRequestStatus,
  SERVICE_REQUEST_STATUSES,
  SERVICE_REQUEST_STATUS_DETAILS,
} from '../types/serviceRequest';
import {
  Search,
  X,
  CheckCircle2,
  Clock,
  Wrench,
  Truck,
  PackageCheck,
  Phone,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
  Laptop,
  Calendar,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface TrackServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSrNumber?: string;
  onOpenNewRequest?: () => void;
}

export const TrackServiceRequestModal: React.FC<TrackServiceRequestModalProps> = ({
  isOpen,
  onClose,
  initialSrNumber = '',
  onOpenNewRequest,
}) => {
  const { serviceRequests } = useAdminStore();
  const [srInput, setSrInput] = useState(initialSrNumber);
  const [searchedSr, setSearchedSr] = useState(initialSrNumber);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialSrNumber) {
      setSrInput(initialSrNumber);
      setSearchedSr(initialSrNumber);
      setHasSearched(true);
    }
  }, [initialSrNumber]);

  if (!isOpen) return null;

  // Find request in store (which is synced real-time from Firestore)
  const normalizedSr = searchedSr.trim().toUpperCase();
  const foundRequest: ServiceRequest | undefined = serviceRequests.find(
    (r) => r.srNumber?.trim().toUpperCase() === normalizedSr
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srInput.trim()) return;
    setSearchedSr(srInput.trim());
    setHasSearched(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status step calculation
  const getStepProgress = (currentStatus: ServiceRequestStatus) => {
    const details = SERVICE_REQUEST_STATUS_DETAILS[currentStatus];
    return details ? details.stepIndex : 1;
  };

  const currentStep = foundRequest ? getStepProgress(foundRequest.status) : 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 block">
                Public Live Service Request Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                🔎 Track Service Request
              </h2>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Enter your unique Service Request Number to view real-time laboratory diagnosis &amp; delivery updates. No login required.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={srInput}
                onChange={(e) => setSrInput(e.target.value)}
                placeholder="Enter SR Number (e.g. JHF-SR-20260914001)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-mono tracking-wider focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-5 sm:px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-600/30 transition shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Track Status</span>
            </button>
          </form>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {!hasSearched ? (
            /* Initial Prompt */
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto">
                <Laptop className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Track Your Laptop Repair Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Enter your SR number above. Format is <strong className="font-mono text-blue-500">JHF-SR-YYYYMMDDNNN</strong> provided upon service submission.
              </p>
              {onOpenNewRequest && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenNewRequest();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline pt-2"
                >
                  <span>Need to submit a new service request? Click here</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : !foundRequest ? (
            /* Not Found Screen */
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Service Request Not Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No active service request matching <strong className="font-mono text-rose-500">{searchedSr}</strong> was found in our system. Please check the spelling or format (e.g. JHF-SR-20260914001).
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href="https://wa.me/8801935693071?text=Hello%20JHF%20Laptop%20Zone,%20I%20need%20help%20tracking%20my%20service%20request"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>
          ) : (
            /* ==========================================
               12 & 13. CUSTOMER STATUS TIMELINE
               ========================================== */
            <div className="space-y-6">
              {/* Request Overview Card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Service Request Number
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-mono font-black text-blue-600 dark:text-blue-400">
                        {foundRequest.srNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(foundRequest.srNumber)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                        title="Copy SR Number"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${SERVICE_REQUEST_STATUS_DETAILS[foundRequest.status]?.bg || 'bg-blue-500/15'} ${SERVICE_REQUEST_STATUS_DETAILS[foundRequest.status]?.color || 'text-blue-400'} ${SERVICE_REQUEST_STATUS_DETAILS[foundRequest.status]?.border || 'border-blue-500/30'}`}>
                    {foundRequest.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Customer:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{foundRequest.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Device:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{foundRequest.laptopBrand} {foundRequest.laptopModel}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Problem:</span>
                    <strong className="text-rose-500">{foundRequest.problemCategory}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Submitted:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{new Date(foundRequest.createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* Latest Customer Note */}
                {foundRequest.customerUpdate && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-bold block text-[11px] mb-0.5">📢 Latest Update from Lab:</span>
                    <p>{foundRequest.customerUpdate}</p>
                  </div>
                )}
              </div>

              {/* Visual Status Timeline (Section 13) */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Service Request Lifecycle
                </div>

                <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {SERVICE_REQUEST_STATUSES.map((statusName, idx) => {
                    const stepNum = idx + 1;
                    const isPassed = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;
                    const isFuture = stepNum > currentStep;
                    const details = SERVICE_REQUEST_STATUS_DETAILS[statusName];

                    return (
                      <div key={statusName} className="relative flex items-start gap-3">
                        {/* Step Marker */}
                        <div
                          className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition ${
                            isPassed
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50'
                              : isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-600/40'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isPassed ? '✓' : stepNum}
                        </div>

                        {/* Status Content */}
                        <div
                          className={`flex-1 rounded-xl p-3 transition ${
                            isCurrent
                              ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 shadow-xs'
                              : isPassed
                              ? 'bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50'
                              : 'opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-black tracking-wide uppercase ${
                                isCurrent
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : isPassed
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {statusName}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 animate-pulse">
                                Active Step
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            {details.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status History Audit Log (Customer-safe) */}
              {foundRequest.statusHistory && foundRequest.statusHistory.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Audit Timeline
                  </div>
                  <div className="space-y-2">
                    {foundRequest.statusHistory.map((sh) => (
                      <div key={sh.id} className="text-xs flex items-start justify-between gap-3 border-b border-slate-200/60 dark:border-slate-700/40 pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {sh.newStatus}
                          </span>
                          {sh.customerNote && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                              {sh.customerNote}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(sh.changedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support Quick Contact */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  Have questions about this request?
                </span>
                <a
                  href={`https://wa.me/8801935693071?text=Hello%20JHF%20Laptop%20Zone,%20checking%20status%20for%20SR%20${foundRequest.srNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp JHF Support</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
