import React, { useState, useEffect, useMemo } from 'react';
import { useAdminStore } from '../admin/adminStore';
import { ServiceJob, ServiceJobStatus, WarrantyClaim } from '../admin/types';
import {
  ServiceRequest,
  ServiceRequestStatus,
  SERVICE_REQUEST_STATUSES,
  SERVICE_REQUEST_STATUS_DETAILS,
} from '../types/serviceRequest';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../admin/firebase';
import {
  Search,
  X,
  CheckCircle2,
  Clock,
  Wrench,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
  Laptop,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
  CreditCard,
  History,
  Loader2,
} from 'lucide-react';

interface TrackServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSrNumber?: string;
  onOpenNewRequest?: () => void;
}

const SERVICE_JOB_PIPELINE: { status: ServiceJobStatus; label: string; desc: string }[] = [
  { status: 'RECEIVED', label: 'Received', desc: 'Laptop received at JHF Service Lab.' },
  { status: 'DIAGNOSING', label: 'Diagnosing', desc: 'Hardware engineer inspecting faults on test bench.' },
  { status: 'ESTIMATE READY', label: 'Estimate Ready', desc: 'Repair cost & parts quotation prepared.' },
  { status: 'IN REPAIR', label: 'In Repair', desc: 'Micro-soldering, parts replacement or repair underway.' },
  { status: 'READY FOR DELIVERY', label: 'Ready for Delivery', desc: 'QA stress-tested and ready for handover.' },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Device handed over to customer with service warranty.' },
];

const getJobStepIndex = (status: ServiceJobStatus): number => {
  switch (status) {
    case 'RECEIVED':
      return 1;
    case 'DIAGNOSING':
      return 2;
    case 'ESTIMATE READY':
    case 'WAITING FOR PARTS':
      return 3;
    case 'IN REPAIR':
      return 4;
    case 'READY FOR DELIVERY':
      return 5;
    case 'DELIVERED':
    case 'WARRANTY RETURN':
      return 6;
    default:
      return 1;
  }
};

export const TrackServiceRequestModal: React.FC<TrackServiceRequestModalProps> = ({
  isOpen,
  onClose,
  initialSrNumber = '',
  onOpenNewRequest,
}) => {
  const { serviceRequests, services, warrantyClaims } = useAdminStore();
  const safeInitial = typeof initialSrNumber === 'string' ? initialSrNumber : '';

  const [srInput, setSrInput] = useState(safeInitial);
  const [searchedSr, setSearchedSr] = useState(safeInitial);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  // Remote Firestore fallback cache for codes not yet in local state
  const [remoteRequest, setRemoteRequest] = useState<ServiceRequest | null>(null);
  const [remoteJob, setRemoteJob] = useState<ServiceJob | null>(null);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

  // Selected index if multiple records match (e.g. searching by mobile number)
  const [selectedMatchIdx, setSelectedMatchIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    if (safeInitial.trim()) {
      setSrInput(safeInitial.trim());
      setSearchedSr(safeInitial.trim());
      setHasSearched(true);
      setSelectedMatchIdx(0);
    } else {
      setSrInput('');
      setSearchedSr('');
      setHasSearched(false);
      setRemoteRequest(null);
      setRemoteJob(null);
      setSelectedMatchIdx(0);
    }
  }, [isOpen, safeInitial]);

  const normalizedQuery = searchedSr.trim().toUpperCase();
  const phoneDigits = normalizedQuery.replace(/\D/g, '');

  // Match across Service Requests, Service Zone Jobs (Service History), and Warranty Claims
  const { matchedRequests, matchedJobs, matchedClaims } = useMemo(() => {
    if (!normalizedQuery) {
      return {
        matchedRequests: [] as ServiceRequest[],
        matchedJobs: [] as ServiceJob[],
        matchedClaims: [] as WarrantyClaim[],
      };
    }

    const reqMatches = (serviceRequests || []).filter((r) => {
      const sr = r.srNumber?.trim().toUpperCase() || '';
      const id = r.id?.trim().toUpperCase() || '';
      const jobId = r.serviceJobId?.trim().toUpperCase() || '';
      const serial = r.serialNumber?.trim().toUpperCase() || '';
      const mob = r.mobile?.replace(/\D/g, '') || '';

      return (
        sr === normalizedQuery ||
        id === normalizedQuery ||
        jobId === normalizedQuery ||
        (serial && serial !== 'N/A' && serial === normalizedQuery) ||
        (phoneDigits.length >= 6 && mob.includes(phoneDigits))
      );
    });

    const jobMatches = (services || []).filter((s) => {
      const id = s.id?.trim().toUpperCase() || '';
      const sr = s.srNumber?.trim().toUpperCase() || '';
      const asset = s.assetId?.trim().toUpperCase() || '';
      const serial = s.serialNumber?.trim().toUpperCase() || '';
      const phone = s.customerPhone?.replace(/\D/g, '') || '';

      return (
        id === normalizedQuery ||
        sr === normalizedQuery ||
        (asset && asset === normalizedQuery) ||
        (serial && serial !== 'N/A' && serial === normalizedQuery) ||
        (phoneDigits.length >= 6 && phone.includes(phoneDigits))
      );
    });

    const claimMatches = (warrantyClaims || []).filter((w) => {
      const id = w.id?.trim().toUpperCase() || '';
      const orig = w.originalServiceId?.trim().toUpperCase() || '';
      const serial = w.serialNumber?.trim().toUpperCase() || '';
      const phone = w.customerPhone?.replace(/\D/g, '') || '';

      return (
        id === normalizedQuery ||
        orig === normalizedQuery ||
        (serial && serial !== 'N/A' && serial === normalizedQuery) ||
        (phoneDigits.length >= 6 && phone.includes(phoneDigits))
      );
    });

    // If warranty claim matched directly by WCL ID, also surface its original ServiceJob
    if (claimMatches.length > 0 && jobMatches.length === 0) {
      claimMatches.forEach((cl) => {
        const linked = (services || []).find(
          (s) => s.id?.trim().toUpperCase() === cl.originalServiceId?.trim().toUpperCase()
        );
        if (linked && !jobMatches.some((j) => j.id === linked.id)) {
          jobMatches.push(linked);
        }
      });
    }

    return {
      matchedRequests: reqMatches,
      matchedJobs: jobMatches,
      matchedClaims: claimMatches,
    };
  }, [normalizedQuery, phoneDigits, serviceRequests, services, warrantyClaims]);

  // Combined unified records list so multi-match (like phone search) lets user switch records
  const combinedMatches = useMemo(() => {
    const items: { key: string; label: string; request?: ServiceRequest; job?: ServiceJob }[] = [];
    const seenJobIds = new Set<string>();

    matchedRequests.forEach((req) => {
      const linkedJob = (services || []).find(
        (s) =>
          (req.serviceJobId && s.id?.toUpperCase() === req.serviceJobId.toUpperCase()) ||
          (s.srNumber && s.srNumber.toUpperCase() === req.srNumber.toUpperCase())
      );
      if (linkedJob) seenJobIds.add(linkedJob.id);
      items.push({
        key: `sr-${req.id}`,
        label: linkedJob ? `${req.srNumber} • ${linkedJob.id}` : req.srNumber,
        request: req,
        job: linkedJob,
      });
    });

    matchedJobs.forEach((job) => {
      if (seenJobIds.has(job.id)) return;
      const linkedReq = (serviceRequests || []).find(
        (r) =>
          (job.srNumber && r.srNumber?.toUpperCase() === job.srNumber.toUpperCase()) ||
          (r.serviceJobId && r.serviceJobId.toUpperCase() === job.id.toUpperCase())
      );
      items.push({
        key: `job-${job.id}`,
        label: linkedReq ? `${job.id} • ${linkedReq.srNumber}` : job.id,
        request: linkedReq,
        job,
      });
    });

    if (items.length === 0 && (remoteRequest || remoteJob)) {
      items.push({
        key: `remote-${remoteRequest?.id || remoteJob?.id}`,
        label: remoteJob?.id || remoteRequest?.srNumber || searchedSr,
        request: remoteRequest || undefined,
        job: remoteJob || undefined,
      });
    }

    return items;
  }, [matchedRequests, matchedJobs, services, serviceRequests, remoteRequest, remoteJob, searchedSr]);

  const activeMatch = combinedMatches[selectedMatchIdx] || combinedMatches[0] || null;
  const foundRequest = activeMatch?.request;
  const foundJob = activeMatch?.job;
  const linkedClaims = useMemo(() => {
    if (!foundJob) return matchedClaims;
    return (warrantyClaims || []).filter(
      (w) => w.originalServiceId?.toUpperCase() === foundJob.id?.toUpperCase()
    );
  }, [foundJob, warrantyClaims, matchedClaims]);

  // Firestore fallback lookup when local state has no match
  const performRemoteFirestoreLookup = async (queryText: string) => {
    const clean = queryText.trim().toUpperCase();
    const digits = clean.replace(/\D/g, '');
    if (!clean) return;

    setIsSearchingRemote(true);
    setRemoteRequest(null);
    setRemoteJob(null);

    try {
      let foundReq: ServiceRequest | null = null;
      let foundSrv: ServiceJob | null = null;

      // Fast direct doc check for JHF-SRV-... IDs
      if (clean.startsWith('JHF-SRV-')) {
        try {
          const directSnap = await getDoc(doc(db, 'services', clean));
          if (directSnap.exists()) {
            foundSrv = { ...(directSnap.data() as ServiceJob), id: directSnap.id };
          }
        } catch {}
      }

      if (!foundSrv) {
        const srvSnap = await getDocs(collection(db, 'services'));
        srvSnap.forEach((d) => {
          if (foundSrv) return;
          const data = { ...(d.data() as ServiceJob), id: d.id };
          const id = data.id?.trim().toUpperCase() || '';
          const sr = data.srNumber?.trim().toUpperCase() || '';
          const asset = data.assetId?.trim().toUpperCase() || '';
          const serial = data.serialNumber?.trim().toUpperCase() || '';
          const phone = data.customerPhone?.replace(/\D/g, '') || '';
          if (
            id === clean ||
            sr === clean ||
            (asset && asset === clean) ||
            (serial && serial !== 'N/A' && serial === clean) ||
            (digits.length >= 6 && phone.includes(digits))
          ) {
            foundSrv = data;
          }
        });
      }

      const srSnap = await getDocs(collection(db, 'serviceRequests'));
      srSnap.forEach((d) => {
        if (foundReq) return;
        const data = { ...(d.data() as ServiceRequest), id: d.id };
        const sr = data.srNumber?.trim().toUpperCase() || '';
        const id = data.id?.trim().toUpperCase() || '';
        const jobId = data.serviceJobId?.trim().toUpperCase() || '';
        const serial = data.serialNumber?.trim().toUpperCase() || '';
        const mob = data.mobile?.replace(/\D/g, '') || '';
        if (
          sr === clean ||
          id === clean ||
          jobId === clean ||
          (serial && serial !== 'N/A' && serial === clean) ||
          (digits.length >= 6 && mob.includes(digits)) ||
          (foundSrv?.srNumber && sr === foundSrv.srNumber.trim().toUpperCase())
        ) {
          foundReq = data;
        }
      });

      if (foundReq) setRemoteRequest(foundReq);
      if (foundSrv) setRemoteJob(foundSrv);
    } catch (err) {
      console.warn('Remote service lookup notice:', err);
    } finally {
      setIsSearchingRemote(false);
    }
  };

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = srInput.trim();
    if (!trimmed) return;
    setSearchedSr(trimmed);
    setHasSearched(true);
    setSelectedMatchIdx(0);
    setRemoteRequest(null);
    setRemoteJob(null);

    const upper = trimmed.toUpperCase();
    const digits = upper.replace(/\D/g, '');
    const hasLocalReq = (serviceRequests || []).some(
      (r) =>
        r.srNumber?.trim().toUpperCase() === upper ||
        r.id?.trim().toUpperCase() === upper ||
        r.serviceJobId?.trim().toUpperCase() === upper ||
        (digits.length >= 6 && r.mobile?.replace(/\D/g, '').includes(digits))
    );
    const hasLocalJob = (services || []).some(
      (s) =>
        s.id?.trim().toUpperCase() === upper ||
        s.srNumber?.trim().toUpperCase() === upper ||
        s.assetId?.trim().toUpperCase() === upper ||
        (s.serialNumber && s.serialNumber !== 'N/A' && s.serialNumber.trim().toUpperCase() === upper) ||
        (digits.length >= 6 && s.customerPhone?.replace(/\D/g, '').includes(digits))
    );

    if (!hasLocalReq && !hasLocalJob) {
      await performRemoteFirestoreLookup(trimmed);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepProgress = (currentStatus: ServiceRequestStatus) => {
    const details = SERVICE_REQUEST_STATUS_DETAILS[currentStatus];
    return details ? details.stepIndex : 1;
  };

  const currentStep = foundRequest ? getStepProgress(foundRequest.status) : 1;
  const currentJobStep = foundJob ? getJobStepIndex(foundJob.status) : 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 relative">
          <button
            type="button"
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
                Public Live Service Request &amp; History Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                🔎 Track SR &amp; Service History
              </h2>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Enter SR Number (<span className="font-mono text-blue-300">JHF-SR-...</span>), Service History Code (<span className="font-mono text-emerald-300">JHF-SRV-...</span>), Serial Number, or Mobile Number.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={srInput}
                onChange={(e) => setSrInput(e.target.value)}
                placeholder="JHF-SR-..., JHF-SRV-..., Serial No, or Mobile"
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-mono tracking-wider focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingRemote}
              className="px-5 sm:px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-600/30 transition shrink-0"
            >
              {isSearchingRemote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
                Track Your Laptop Repair &amp; Service History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                আপনার <strong className="font-mono text-blue-500">JHF-SR-YYYYMMDDNNN</strong> (Service Request) অথবা <strong className="font-mono text-emerald-500">JHF-SRV-YYYYMMDDNNN</strong> (Service History Code), সিরিয়াল নম্বর বা মোবাইল নম্বর দিয়ে সার্চ করুন।
              </p>
              {onOpenNewRequest && (
                <button
                  type="button"
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
          ) : isSearchingRemote ? (
            <div className="text-center py-10 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Searching Cloud Service Records...
              </div>
              <p className="text-xs text-slate-500">Checking Service Requests &amp; Lab Repair History</p>
            </div>
          ) : !foundRequest && !foundJob ? (
            /* Not Found Screen */
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Service Record Not Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                No service request or service history matching <strong className="font-mono text-rose-500">{searchedSr}</strong> was found. Please check your code (<span className="font-mono">JHF-SR-...</span> or <span className="font-mono">JHF-SRV-...</span>), Serial Number, or Mobile Number.
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
            <div className="space-y-6">
              {/* Multiple Matches Switcher */}
              {combinedMatches.length > 1 && (
                <div className="bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Found {combinedMatches.length} Matching Service Records — Select One:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {combinedMatches.map((m, idx) => (
                      <button
                        type="button"
                        key={m.key}
                        onClick={() => setSelectedMatchIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
                          selectedMatchIdx === idx
                            ? 'bg-blue-600 text-white border-blue-500 shadow'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PART A: CUSTOMER SERVICE REQUEST (if present) */}
              {foundRequest && (
                <div className="space-y-5">
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
                            type="button"
                            onClick={() => handleCopy(foundRequest.srNumber)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                            title="Copy SR Number"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

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

                    {foundRequest.customerUpdate && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
                        <span className="font-bold block text-[11px] mb-0.5">📢 Latest Update from Lab:</span>
                        <p>{foundRequest.customerUpdate}</p>
                      </div>
                    )}
                  </div>

                  {/* Visual SR Timeline */}
                  <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Service Request Lifecycle
                    </div>

                    <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {SERVICE_REQUEST_STATUSES.map((statusName, idx) => {
                        const stepNum = idx + 1;
                        const isPassed = stepNum < currentStep;
                        const isCurrent = stepNum === currentStep;
                        const details = SERVICE_REQUEST_STATUS_DETAILS[statusName];

                        return (
                          <div key={statusName} className="relative flex items-start gap-3">
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

                  {/* SR Status History */}
                  {foundRequest.statusHistory && foundRequest.statusHistory.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Request Status Timeline
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
                </div>
              )}

              {/* PART B: SERVICE ZONE LAB HISTORY / JOB DETAILS (if found directly or linked) */}
              {foundJob && (
                <div className="space-y-5 pt-2 border-t border-slate-200 dark:border-slate-800 first:border-t-0 first:pt-0">
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                          <History className="w-3.5 h-3.5" />
                          Service History / Lab Job Code
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-lg sm:text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                            {foundJob.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(foundJob.id)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                            title="Copy Service History Code"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {foundJob.srNumber && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Linked SR: <strong className="font-mono text-blue-500">{foundJob.srNumber}</strong>
                          </div>
                        )}
                      </div>

                      <div className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {foundJob.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Customer:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{foundJob.customerName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Device:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{foundJob.laptopBrand} {foundJob.laptopModel}</strong>
                        {foundJob.serialNumber && foundJob.serialNumber !== 'N/A' && (
                          <span className="block text-[10px] font-mono text-slate-400">S/N: {foundJob.serialNumber}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Assigned Engineer:</span>
                        <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-blue-400" />
                          {foundJob.engineerName || 'JHF Lab Team'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          {foundJob.deliveredDate ? 'Delivered Date:' : 'Est. Delivery:'}
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {foundJob.deliveredDate
                            ? new Date(foundJob.deliveredDate).toLocaleDateString()
                            : foundJob.estimatedDeliveryDate || new Date(foundJob.createdAt).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>

                    {/* Diagnostic & Repair Findings */}
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase block">Reported Issue:</span>
                        <p className="text-slate-800 dark:text-slate-200">{foundJob.customerComplaintText || (foundJob.complaintCategories || []).join(', ') || 'General Hardware Inspection'}</p>
                      </div>
                      {foundJob.diagnosis && (
                        <div>
                          <span className="font-bold text-blue-500 text-[10px] uppercase block">Lab Diagnosis:</span>
                          <p className="text-slate-700 dark:text-slate-300">{foundJob.diagnosis}</p>
                        </div>
                      )}
                      {foundJob.workCompleted && (
                        <div>
                          <span className="font-bold text-emerald-500 text-[10px] uppercase block">Work Completed:</span>
                          <p className="text-slate-700 dark:text-slate-300">{foundJob.workCompleted}</p>
                        </div>
                      )}
                      {foundJob.finalTestingResults && (
                        <div>
                          <span className="font-bold text-purple-400 text-[10px] uppercase block">QA &amp; Stress Testing:</span>
                          <p className="text-slate-700 dark:text-slate-300">{foundJob.finalTestingResults}</p>
                        </div>
                      )}
                    </div>

                    {/* Billing & Service Warranty Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-blue-400" />
                            Service Billing
                          </div>
                          <div className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">
                            Total: ৳{(foundJob.totalCost || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right font-mono text-[11px]">
                          <div className="text-emerald-500 font-bold">Paid: ৳{(foundJob.paidAmount || 0).toLocaleString()}</div>
                          <div className={(foundJob.dueAmount || 0) > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'}>
                            Due: ৳{(foundJob.dueAmount || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            JHF Service Warranty
                          </div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {foundJob.serviceWarrantyDays || 30} Days Guarantee
                          </div>
                        </div>
                        <div className="text-right text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                            {foundJob.warrantyStatus || 'ACTIVE'}
                          </span>
                          {foundJob.serviceWarrantyEnd && (
                            <div className="text-slate-400 mt-0.5">Until {foundJob.serviceWarrantyEnd}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lab Pipeline Progress */}
                  <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Lab Repair Lifecycle</span>
                    </div>

                    <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {SERVICE_JOB_PIPELINE.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isPassed = stepNum < currentJobStep;
                        const isCurrent = stepNum === currentJobStep;

                        return (
                          <div key={step.status} className="relative flex items-start gap-3">
                            <div
                              className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition ${
                                isPassed
                                  ? 'bg-emerald-500 text-white'
                                  : isCurrent
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isPassed ? '✓' : stepNum}
                            </div>

                            <div
                              className={`flex-1 rounded-xl p-3 transition ${
                                isCurrent
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70'
                                  : isPassed
                                  ? 'bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50'
                                  : 'opacity-50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-xs font-black uppercase ${
                                    isCurrent || isPassed
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {step.status === 'ESTIMATE READY' && foundJob.status === 'WAITING FOR PARTS'
                                    ? 'WAITING FOR PARTS'
                                    : step.label}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                    Current Stage
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Service History Audit Logs */}
                  {foundJob.logs && foundJob.logs.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Service History Audit Log</span>
                      </div>
                      <div className="space-y-2">
                        {foundJob.logs.map((log) => (
                          <div key={log.id} className="text-xs flex items-start justify-between gap-3 border-b border-slate-200/60 dark:border-slate-700/40 pb-2 last:border-b-0 last:pb-0">
                            <div>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {log.action}
                              </span>
                              {log.details && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                  {log.details}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked Warranty Claims */}
                  {linkedClaims.length > 0 && (
                    <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 space-y-2 text-xs">
                      <div className="font-bold text-rose-500 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Service Warranty Claim History ({linkedClaims.length})</span>
                      </div>
                      {linkedClaims.map((cl) => (
                        <div key={cl.id} className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-3 space-y-1">
                          <div className="flex justify-between font-mono font-bold">
                            <span>{cl.id}</span>
                            <span className="text-emerald-500">{cl.status}</span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-300"><strong>Issue:</strong> {cl.reportedProblem}</div>
                          {cl.resolution && (
                            <div className="text-emerald-600 dark:text-emerald-400"><strong>Resolution:</strong> {cl.resolution}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Support Quick Contact */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  Have questions about this service record?
                </span>
                <a
                  href={`https://wa.me/8801935693071?text=Hello%20JHF%20Laptop%20Zone,%20checking%20status%20for%20${encodeURIComponent(
                    foundJob?.id || foundRequest?.srNumber || searchedSr
                  )}`}
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
