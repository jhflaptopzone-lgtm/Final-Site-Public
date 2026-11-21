import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useAdminStore } from '../adminStore';
import { ImageHistoryRecord, ImageVerificationStatus, Product } from '../types';
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  History,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Image as ImageIcon,
  Layers,
  Eye,
  RotateCcw,
  Play,
  Square,
  FileSpreadsheet,
  Globe,
  ScanSearch,
  Info,
  X,
  Check,
  Filter,
  ArrowRightLeft,
} from 'lucide-react';

export type VerificationJobStatus =
  | 'pending'
  | 'downloading'
  | 'verifying'
  | 'verified'
  | 'rejected'
  | 'failed';

interface VerificationLogEntry {
  ts: string;
  stage: string;
  message: string;
}

interface VerificationJobState {
  jobId: string;
  status: VerificationJobStatus;
  attempt?: number;
  maxAttempts?: number;
  cached?: boolean;
  durationMs?: number;
  logs: VerificationLogEntry[];
  error?: string;
  errorCode?: string;
}

interface ImageCandidate {
  candidateId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sourcePageUrl: string;
  sourceName: string;
  sourceDomain: string;
  sourceTier: 'Official OEM' | 'Official Support / Open Media' | 'Trusted Tech Retailer' | 'Refurbished / Other';
  title: string;
  width: number;
  height: number;
  license: string;
  attribution: string;
  preScore: number;
  mismatchWarning?: string;
  providerUsed: string;
  visionResult?: {
    success: boolean;
    status: 'Verified' | 'Verification Pending' | 'Rejected' | 'No Exact Match';
    isVerifiedExactMatch: boolean;
    confidence: number;
    detectedBrand: string;
    detectedModel: string;
    detectedGeneration: string;
    isWatermarkFree: boolean;
    isCleanProductPhoto: boolean;
    isAiGeneratedOrGraphic: boolean;
    actualWidth: number;
    actualHeight: number;
    actualResolution: string;
    visionInputResolution?: string;
    visionInputSizeKb?: number;
    mimeType: string;
    fileSizeKb: number;
    designCheckSummary: string;
    rejectionReason: string;
    modelUsed: string;
    cached?: boolean;
    jobId?: string;
    durationMs?: number;
  };
  verificationJob?: VerificationJobState;
  verifyError?: string;
}

interface ProviderStatusInfo {
  ok: boolean;
  activeProvider: string;
  searchEngine?: string;
  serpapiOnlyMode?: boolean;
  unusedProvidersOptional?: boolean;
  geminiVisionConfigured: boolean;
  visionModel: string;
  storageDir: string;
  verificationConfig?: {
    downloadTimeoutMs: number;
    maxDownloadBytes: number;
    visionTimeoutMs: number;
    maxRetries: number;
    cacheTtlMs: number;
    visionResizeMaxDim: number;
  };
  cacheEntriesCount?: number;
  configuredApiKeys: {
    serpapi: boolean;
    bingApi: boolean;
    googleCse: boolean;
  };
}

interface TestSearchResponseState {
  success: boolean;
  errorCode?: string;
  message: string;
  testQuery: string;
  rawCount?: number;
  rankedCount?: number;
  candidates?: ImageCandidate[];
  searchMetadata?: { id?: string; status?: string; totalTimeTaken?: number } | null;
}

interface BatchReportEntry {
  productId: string;
  sku: string;
  brand: string;
  exactModel: string;
  generation: string;
  previousStatus: string;
  finalStatus: ImageVerificationStatus | 'Skipped';
  confidence?: number;
  imageUrl?: string;
  sourceName?: string;
  notes: string;
}

const SHARED_GENERIC_PATTERNS = [
  '/images/lenovo-thinkpad.jpg',
  '/images/hp-elitebook.jpg',
  '/images/dell-latitude.jpg',
  'images.unsplash.com',
  'placeholder',
];

const ALL_STATUSES: ImageVerificationStatus[] = [
  'Image Found',
  'Verification Pending',
  'Verified',
  'Rejected',
  'No Exact Match',
  'Image Imported',
  'Image Missing',
];

export function deriveExactModel(product: Product): string {
  if (product.exactModel && product.exactModel.trim().length > 2) {
    return product.exactModel.trim();
  }
  const raw = (product.model || product.name || '').trim();
  // Clean spec noise such as "(i5 7th, 16gb/512gb)", "(32GB RAM, 512GB SSD)", "Core i5 11th Gen"
  let cleaned = raw
    .replace(/\(([^)]*(?:ram|ssd|hdd|gb|tb|i3|i5|i7|i9|ryzen|gen|touch|nvme)[^)]*)\)/gi, '')
    .replace(/\bCore\s*i[3579](?:\s*-\s*\w+)?(?:\s*\d{1,2}(?:th|st|nd|rd)\s*Gen)?\b/gi, '')
    .replace(/\b(?:8|16|32|64)\s*GB\s*(?:RAM|DDR\d)?\b/gi, '')
    .replace(/\b(?:128|256|512)\s*GB\s*(?:SSD|NVMe)?\b/gi, '')
    .replace(/\b(?:1|2)\s*TB\s*(?:SSD|HDD)?\b/gi, '')
    .replace(/Gen-(\d+)/gi, 'Gen $1')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip duplicate brand prefix if model already starts with brand
  const brandLower = (product.brand || '').toLowerCase();
  if (brandLower && cleaned.toLowerCase().startsWith(brandLower + ' ')) {
    cleaned = cleaned.slice(brandLower.length).trim();
  }
  return cleaned || product.model || product.name;
}

export function isGenericOrMissingImage(url?: string): boolean {
  if (!url || !url.trim()) return true;
  const lower = url.toLowerCase();
  return SHARED_GENERIC_PATTERNS.some((pat) => lower.includes(pat));
}

export function getEffectiveImageStatus(product: Product): ImageVerificationStatus {
  if (product.imageVerificationStatus) {
    // Safety check: if marked Verified/Imported but actual URL is a shared placeholder, flag pending
    const currentUrl = product.mainImageUrl || product.images?.[0];
    if (
      (product.imageVerificationStatus === 'Verified' ||
        product.imageVerificationStatus === 'Image Imported') &&
      isGenericOrMissingImage(currentUrl)
    ) {
      return 'Image Missing';
    }
    return product.imageVerificationStatus;
  }
  const currentUrl = product.mainImageUrl || product.images?.[0];
  if (!currentUrl) return 'Image Missing';
  if (isGenericOrMissingImage(currentUrl)) return 'Image Missing';
  return 'Verification Pending';
}

const STATUS_BADGE_STYLES: Record<ImageVerificationStatus, string> = {
  Verified: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Image Imported': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  'Image Found': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Verification Pending': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  Rejected: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'No Exact Match': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  'Image Missing': 'bg-slate-700/70 text-slate-300 border-slate-600',
};

export const ProductImageManagerView: React.FC = () => {
  const {
    products,
    imageHistory,
    pendingAutoImageProductIds,
    dismissAutoImageAlert,
    assignVerifiedProductImage,
    rejectProductImage,
    rollbackProductImage,
    removeWrongProductImage,
    updateProductImageStatus,
  } = useAdminStore();

  const activeProducts = useMemo(() => products.filter((p) => !p.isDeleted), [products]);

  const [providerStatus, setProviderStatus] = useState<ProviderStatusInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [onlyMissingShared, setOnlyMissingShared] = useState(false);

  // Per-product candidate cache inside session (keyed by productId)
  const [candidatesByProduct, setCandidatesByProduct] = useState<Record<string, ImageCandidate[]>>({});
  const [loadingProductIds, setLoadingProductIds] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Candidate Drawer Modal
  const [drawerProductId, setDrawerProductId] = useState<string | null>(null);
  const [customPageUrl, setCustomPageUrl] = useState('');
  const [scanningPage, setScanningPage] = useState(false);
  const [verifyingCandidateId, setVerifyingCandidateId] = useState<string | null>(null);
  const [importingCandidateId, setImportingCandidateId] = useState<string | null>(null);

  // Source Details Modal & History Modal & Bulk Import Modal
  const [sourceModalProduct, setSourceModalProduct] = useState<Product | null>(null);
  const [historyModalProductId, setHistoryModalProductId] = useState<string | 'ALL' | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportBusy, setBulkImportBusy] = useState(false);

  // Batch Automation State ("FIND & UPDATE ALL LAPTOP IMAGES")
  const [batchRunning, setBatchRunning] = useState(false);
  const batchStopRef = useRef(false);
  const [batchProgress, setBatchProgress] = useState({
    current: 0,
    total: 0,
    currentLabel: '',
    autoImported: 0,
    pendingReview: 0,
    noMatch: 0,
    errors: 0,
  });
  const [batchReport, setBatchReport] = useState<BatchReportEntry[] | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testSearchResult, setTestSearchResult] = useState<TestSearchResponseState | null>(null);
  const [verificationLogsModalOpen, setVerificationLogsModalOpen] = useState(false);
  const [serverLogsLoading, setServerLogsLoading] = useState(false);
  const [serverVerificationLogs, setServerVerificationLogs] = useState<{
    cacheSize: number;
    totalJobsTracked: number;
    jobs: Array<{
      jobId: string;
      status: VerificationJobStatus;
      brand: string;
      exactModel: string;
      generation: string;
      imageUrl: string;
      attempt: number;
      maxAttempts: number;
      cached: boolean;
      durationMs?: number;
      createdAt: string;
      completedAt?: string;
      confidence?: number;
      visionStatus?: string;
      error?: string;
      errorCode?: string;
      logs: VerificationLogEntry[];
    }>;
  } | null>(null);

  const showNotice = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast((curr) => (curr?.message === message ? null : curr)), 6000);
  };

  const refreshProviderStatus = () => {
    fetch('/api/images/provider-status')
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d === 'object') setProviderStatus(d);
      })
      .catch(() => {
        // Ignore silent status load fail
      });
  };

  const loadServerVerificationLogs = async () => {
    setServerLogsLoading(true);
    try {
      const r = await fetch('/api/images/verify/logs');
      const d = await r.json();
      if (r.ok && d?.success) {
        setServerVerificationLogs({
          cacheSize: Number(d.cacheSize || 0),
          totalJobsTracked: Number(d.totalJobsTracked || 0),
          jobs: Array.isArray(d.jobs) ? d.jobs : [],
        });
      }
    } catch {
      // Ignore silent log fetch fail
    } finally {
      setServerLogsLoading(false);
    }
  };

  useEffect(() => {
    refreshProviderStatus();
  }, []);

  const runTestImageSearch = async () => {
    setTestingConnection(true);
    setTestSearchResult(null);
    const testQuery = 'HP EliteBook 840 G6 official product image';
    try {
      const res = await fetch('/api/images/test-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery }),
      });
      const data = await res.json();
      setTestSearchResult({
        success: Boolean(data?.success),
        errorCode: data?.errorCode,
        message: data?.message || (res.ok ? 'Search test completed.' : `HTTP ${res.status}`),
        testQuery: data?.testQuery || testQuery,
        rawCount: data?.rawCount,
        rankedCount: data?.rankedCount,
        candidates: Array.isArray(data?.candidates) ? data.candidates : [],
        searchMetadata: data?.searchMetadata || null,
      });
      refreshProviderStatus();
      showNotice(
        data?.success ? 'success' : 'error',
        data?.message || (data?.success ? 'SerpAPI connection verified.' : 'SerpAPI test failed.')
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach server test endpoint.';
      setTestSearchResult({
        success: false,
        errorCode: 'NETWORK_ERROR',
        message: msg,
        testQuery,
        candidates: [],
      });
      showNotice('error', msg);
    } finally {
      setTestingConnection(false);
    }
  };

  const stats = useMemo(() => {
    const counts: Record<ImageVerificationStatus, number> = {
      Verified: 0,
      'Image Imported': 0,
      'Image Found': 0,
      'Verification Pending': 0,
      Rejected: 0,
      'No Exact Match': 0,
      'Image Missing': 0,
    };
    const uniqueExactModels = new Set<string>();
    activeProducts.forEach((p) => {
      const st = getEffectiveImageStatus(p);
      counts[st] = (counts[st] || 0) + 1;
      uniqueExactModels.add(`${p.brand}::${deriveExactModel(p).toLowerCase()}`);
    });
    return {
      totalProducts: activeProducts.length,
      uniqueModelCount: uniqueExactModels.size,
      counts,
      needsWorkCount:
        counts['Image Missing'] +
        counts['No Exact Match'] +
        counts.Rejected +
        counts['Verification Pending'],
    };
  }, [activeProducts]);

  const brandOptions = useMemo(() => {
    const set = new Set<string>(['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Apple', 'MSI', 'Samsung', 'Other']);
    activeProducts.forEach((p) => set.add(p.brand));
    return ['ALL', ...Array.from(set)];
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return activeProducts.filter((p) => {
      const effStatus = getEffectiveImageStatus(p);
      if (brandFilter !== 'ALL' && p.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
      if (statusFilter !== 'ALL' && effStatus !== statusFilter) return false;
      if (onlyMissingShared && effStatus !== 'Image Missing' && !isGenericOrMissingImage(p.mainImageUrl || p.images?.[0])) {
        return false;
      }
      if (!q) return true;
      const exact = deriveExactModel(p).toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        exact.includes(q) ||
        (p.generation || '').toLowerCase().includes(q)
      );
    });
  }, [activeProducts, brandFilter, statusFilter, onlyMissingShared, searchTerm]);

  const drawerProduct = useMemo(
    () => activeProducts.find((p) => p.id === drawerProductId) || null,
    [activeProducts, drawerProductId]
  );

  const pendingAutoProducts = useMemo(
    () =>
      pendingAutoImageProductIds
        .map((id) => activeProducts.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [pendingAutoImageProductIds, activeProducts]
  );

  // Action: Search exact model candidates for 1 product
  const searchCandidatesForProduct = async (product: Product, openDrawer = false): Promise<ImageCandidate[]> => {
    const exactModel = deriveExactModel(product);
    setLoadingProductIds((prev) => ({ ...prev, [product.id]: true }));
    if (openDrawer) setDrawerProductId(product.id);

    try {
      const res = await fetch('/api/images/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: product.brand,
          series: product.series || '',
          exactModel,
          generation: product.generation || '',
          excludeUrls: product.rejectedImageUrls || [],
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        const errMsg =
          data?.message || `Image search provider error (HTTP ${res.status}).`;
        showNotice('error', errMsg);
        return [];
      }

      const candidates: ImageCandidate[] = Array.isArray(data?.candidates) ? data.candidates : [];

      setCandidatesByProduct((prev) => ({ ...prev, [product.id]: candidates }));

      if (candidates.length > 0) {
        const currentEff = getEffectiveImageStatus(product);
        if (currentEff === 'Image Missing' || currentEff === 'No Exact Match') {
          updateProductImageStatus(
            product.id,
            'Image Found',
            `Found ${candidates.length} candidate(s) for exact model "${exactModel}". Pending AI / Admin verification.`
          );
        }
        showNotice('info', `Fetched ${candidates.length} candidate image(s) for ${product.brand} ${exactModel}.`);
      } else {
        updateProductImageStatus(
          product.id,
          'No Exact Match',
          `No clean candidate found for exact model "${exactModel}". Try scanning an official manufacturer URL.`
        );
        showNotice('error', `No exact image match found for ${product.brand} ${exactModel}.`);
      }
      return candidates;
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : 'Failed to search model images.');
      return [];
    } finally {
      setLoadingProductIds((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Helper: Execute asynchronous verification job via /api/images/verify/start + status polling
  const runAsyncVerificationJob = async (
    params: {
      brand: string;
      series?: string;
      exactModel: string;
      generation?: string;
      candidate: Partial<ImageCandidate> & { imageUrl: string };
    },
    onJobUpdate?: (jobState: VerificationJobState) => void
  ): Promise<{
    jobState: VerificationJobState;
    visionResult?: ImageCandidate['visionResult'];
  }> => {
    const startRes = await fetch('/api/images/verify/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const startData = await startRes.json();

    if (!startRes.ok || startData?.success === false || !startData?.jobId) {
      throw new Error(startData?.message || `Failed to start verification job (HTTP ${startRes.status})`);
    }

    const buildJobState = (payload: any): VerificationJobState => ({
      jobId: payload.jobId,
      status: payload.status as VerificationJobStatus,
      attempt: payload.attempt,
      maxAttempts: payload.maxAttempts,
      cached: Boolean(payload.cached),
      durationMs: payload.durationMs,
      logs: Array.isArray(payload.logs) ? payload.logs : [],
      error: payload.error,
      errorCode: payload.errorCode,
    });

    let currentJob = buildJobState(startData);
    onJobUpdate?.(currentJob);

    if (['verified', 'rejected', 'failed'].includes(currentJob.status)) {
      return {
        jobState: currentJob,
        visionResult: startData.result,
      };
    }

    const pollStartedAt = Date.now();
    const maxPollWaitMs = 95000;

    while (Date.now() - pollStartedAt < maxPollWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const statusRes = await fetch(`/api/images/verify/status/${encodeURIComponent(currentJob.jobId)}`);
      const statusData = await statusRes.json();

      if (!statusRes.ok || statusData?.success === false) {
        throw new Error(statusData?.message || `Unable to check job status (HTTP ${statusRes.status})`);
      }

      currentJob = buildJobState(statusData);
      onJobUpdate?.(currentJob);

      if (['verified', 'rejected', 'failed'].includes(currentJob.status)) {
        return {
          jobState: currentJob,
          visionResult: statusData.result,
        };
      }
    }

    const timeoutJob: VerificationJobState = {
      ...currentJob,
      status: 'failed',
      error: 'Verification polling timed out waiting for background job completion.',
      errorCode: 'POLL_TIMEOUT',
    };
    onJobUpdate?.(timeoutJob);
    return { jobState: timeoutJob };
  };

  // Action: Run Asynchronous Gemini Vision AI Verification on a single candidate
  const verifyCandidate = async (product: Product, candidate: ImageCandidate) => {
    const exactModel = deriveExactModel(product);
    setVerifyingCandidateId(candidate.candidateId);

    const updateCandidateState = (patch: Partial<ImageCandidate>) => {
      setCandidatesByProduct((prev) => ({
        ...prev,
        [product.id]: (prev[product.id] || []).map((c) =>
          c.candidateId === candidate.candidateId ? { ...c, ...patch } : c
        ),
      }));
    };

    try {
      const { jobState, visionResult } = await runAsyncVerificationJob(
        {
          brand: product.brand,
          series: product.series || '',
          exactModel,
          generation: product.generation || '',
          candidate,
        },
        (liveJob) => {
          updateCandidateState({
            verificationJob: liveJob,
            verifyError: undefined,
          });
        }
      );

      if (jobState.status === 'failed' || !visionResult) {
        const errMsg = jobState.error || 'Verification failed or timed out.';
        updateCandidateState({
          verificationJob: jobState,
          visionResult: undefined,
          verifyError: errMsg,
        });
        showNotice('error', `Verification failed (${exactModel}): ${errMsg}`);
        return null;
      }

      updateCandidateState({
        width: visionResult.actualWidth || candidate.width,
        height: visionResult.actualHeight || candidate.height,
        visionResult,
        verificationJob: jobState,
        verifyError: undefined,
      });

      refreshProviderStatus();
      showNotice(
        jobState.status === 'verified' ? 'success' : 'info',
        `AI Verification (${exactModel}): ${visionResult.status} — ${visionResult.confidence}% confidence (${visionResult.actualResolution})${jobState.cached ? ' [Cached]' : ''}`
      );
      return visionResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI verification request failed.';
      updateCandidateState({
        verifyError: msg,
        visionResult: undefined,
      });
      showNotice('error', msg);
      return null;
    } finally {
      setVerifyingCandidateId(null);
    }
  };

  // Action: Approve & Import STRICTLY VERIFIED candidate -> WebP download + thumbnail + DB update
  const approveAndImportCandidate = async (product: Product, candidate: ImageCandidate) => {
    const exactModel = deriveExactModel(product);
    if (
      !candidate.visionResult ||
      candidate.visionResult.status !== 'Verified' ||
      candidate.visionResult.isVerifiedExactMatch !== true ||
      candidate.verificationJob?.status === 'failed' ||
      candidate.verificationJob?.status === 'rejected'
    ) {
      showNotice(
        'error',
        'Only AI-verified exact-model images can be approved and imported. Run AI Verify first.'
      );
      return false;
    }

    setImportingCandidateId(candidate.candidateId);

    try {
      const res = await fetch('/api/images/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          brand: product.brand,
          exactModel,
          generation: product.generation || '',
          imageUrl: candidate.imageUrl,
          verificationJobId: candidate.verificationJob?.jobId || candidate.visionResult.jobId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotice('error', data.message || 'Image import blocked: image verification required.');
        return false;
      }

      assignVerifiedProductImage(product.id, {
        exactModel,
        mainImageUrl: data.mainImageUrl,
        imageStoragePath: data.imageStoragePath,
        imageThumbnailPath: data.imageThumbnailPath,
        imageSourceUrl: candidate.sourcePageUrl || candidate.imageUrl,
        imageSourceName: `${candidate.sourceName} (${candidate.sourceTier})`,
        imageLicense: candidate.license,
        imageAttribution: candidate.attribution,
        imageResolution: data.imageResolution,
        imageVerificationStatus: 'Image Imported',
        imageConfidence: candidate.visionResult.confidence,
        verificationNotes:
          candidate.visionResult.designCheckSummary ||
          `AI Verified & imported WebP (${data.imageResolution}, ${data.fileSizeKb} KB)`,
        action: 'imported',
      });

      showNotice(
        'success',
        `Imported verified WebP (${data.imageResolution}, ${data.fileSizeKb} KB) for ${product.brand} ${exactModel}!`
      );
      return true;
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : 'Failed to import candidate image.');
      return false;
    } finally {
      setImportingCandidateId(null);
    }
  };

  // Action: Scan custom official manufacturer or retailer URL
  const handleScanOfficialUrl = async () => {
    if (!drawerProduct || !customPageUrl.trim()) return;
    setScanningPage(true);
    try {
      const exactModel = deriveExactModel(drawerProduct);
      const res = await fetch('/api/images/scan-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageUrl: customPageUrl.trim(),
          brand: drawerProduct.brand,
          exactModel,
          generation: drawerProduct.generation || '',
        }),
      });
      const data = await res.json();
      const found: ImageCandidate[] = Array.isArray(data?.candidates) ? data.candidates : [];
      if (found.length > 0) {
        setCandidatesByProduct((prev) => {
          const existing = prev[drawerProduct.id] || [];
          const existingUrls = new Set(existing.map((c) => c.imageUrl));
          return {
            ...prev,
            [drawerProduct.id]: [...found.filter((f) => !existingUrls.has(f.imageUrl)), ...existing],
          };
        });
        showNotice('success', `Extracted ${found.length} product image(s) from source URL.`);
        setCustomPageUrl('');
      } else {
        showNotice('error', data?.message || 'No valid product images found on that page.');
      }
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : 'Failed to scan source page.');
    } finally {
      setScanningPage(false);
    }
  };

  // Action: Reject candidate inside drawer
  const handleRejectCandidate = (product: Product, candidate: ImageCandidate) => {
    const exactModel = deriveExactModel(product);
    const reason =
      candidate.visionResult?.rejectionReason ||
      candidate.mismatchWarning ||
      `Admin rejected candidate from ${candidate.sourceName}`;
    rejectProductImage(product.id, {
      candidateUrl: candidate.imageUrl,
      exactModel,
      reason,
      status: getEffectiveImageStatus(product) === 'Image Imported' ? 'Image Imported' : 'Rejected',
    });
    setCandidatesByProduct((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || []).filter((c) => c.candidateId !== candidate.candidateId),
    }));
    showNotice('info', `Rejected candidate and saved to exclusion list for ${exactModel}.`);
  };

  // Action: Auto-select & verify best candidate inside drawer
  const handleSelectAndVerifyBest = async (product: Product) => {
    let list = candidatesByProduct[product.id] || [];
    if (list.length === 0) {
      list = await searchCandidatesForProduct(product, true);
    }
    if (list.length === 0) return;
    // Pick highest preScore with clean/no mismatch warning & >= 800px when known
    const best =
      list.find((c) => !c.mismatchWarning && (c.width === 0 || c.width >= 1000)) ||
      list.find((c) => !c.mismatchWarning) ||
      list[0];
    if (best) {
      await verifyCandidate(product, best);
    }
  };

  // Action: Download current image file
  const handleDownloadProductImage = (product: Product) => {
    const url = product.mainImageUrl || product.images?.[0];
    if (!url) {
      showNotice('error', 'No image URL to download.');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.brand}-${deriveExactModel(product)}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.webp';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Primary Bulk Automation ("FIND & UPDATE ALL LAPTOP IMAGES", "Find Missing Images", "Recheck Mismatched", "Retry Failed")
  const runBatchAutomation = async (targetProducts: Product[], jobTitle: string) => {
    if (batchRunning) return;
    if (targetProducts.length === 0) {
      showNotice('info', `No matching products found for "${jobTitle}".`);
      return;
    }

    batchStopRef.current = false;
    setBatchRunning(true);
    setBatchReport(null);
    const reportEntries: BatchReportEntry[] = [];
    // Cache per exact model WITHIN this batch run so identical configs (e.g. two RAM variants of ThinkPad T480) reuse verified exact model result without duplicate search calls, while NEVER mixing different models!
    const exactModelSearchCache = new Map<string, ImageCandidate[]>();
    const exactModelVerifiedCache = new Map<
      string,
      { candidate: ImageCandidate; vision: NonNullable<ImageCandidate['visionResult']> } | null
    >();

    let autoImported = 0;
    let pendingReview = 0;
    let noMatch = 0;
    let errors = 0;
    let geminiDisabledNoticeShown = false;

    setBatchProgress({
      current: 0,
      total: targetProducts.length,
      currentLabel: 'Initializing exact-model jobs...',
      autoImported: 0,
      pendingReview: 0,
      noMatch: 0,
      errors: 0,
    });

    for (let i = 0; i < targetProducts.length; i++) {
      if (batchStopRef.current) break;
      const prod = targetProducts[i];
      const exactModel = deriveExactModel(prod);
      const prevStatus = getEffectiveImageStatus(prod);
      const modelCacheKey = `${prod.brand.toLowerCase()}::${exactModel.toLowerCase()}::${(prod.generation || '').toLowerCase()}`;

      setBatchProgress({
        current: i + 1,
        total: targetProducts.length,
        currentLabel: `${prod.brand} ${exactModel} (${prod.sku})`,
        autoImported,
        pendingReview,
        noMatch,
        errors,
      });

      // Never downgrade an already Verified / Image Imported product unless explicitly rechecking
      if (
        jobTitle === 'FIND & UPDATE ALL LAPTOP IMAGES' &&
        (prevStatus === 'Verified' || prevStatus === 'Image Imported') &&
        !isGenericOrMissingImage(prod.mainImageUrl || prod.images?.[0])
      ) {
        reportEntries.push({
          productId: prod.id,
          sku: prod.sku,
          brand: prod.brand,
          exactModel,
          generation: prod.generation,
          previousStatus: prevStatus,
          finalStatus: 'Skipped',
          confidence: prod.imageConfidence,
          imageUrl: prod.mainImageUrl || prod.images?.[0],
          sourceName: prod.imageSourceName,
          notes: 'Already has verified exact model image (protected from overwrite).',
        });
        continue;
      }

      try {
        // 1. Reuse verified exact-model asset if same exact model+gen already verified in this run
        const cachedVerified = exactModelVerifiedCache.get(modelCacheKey);
        if (cachedVerified) {
          const impRes = await fetch('/api/images/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: prod.id,
              brand: prod.brand,
              exactModel,
              generation: prod.generation || '',
              imageUrl: cachedVerified.candidate.imageUrl,
              verificationJobId: cachedVerified.vision.jobId,
            }),
          });
          const impData = await impRes.json();
          if (impRes.ok && impData.success) {
            assignVerifiedProductImage(prod.id, {
              exactModel,
              mainImageUrl: impData.mainImageUrl,
              imageStoragePath: impData.imageStoragePath,
              imageThumbnailPath: impData.imageThumbnailPath,
              imageSourceUrl: cachedVerified.candidate.sourcePageUrl || cachedVerified.candidate.imageUrl,
              imageSourceName: `${cachedVerified.candidate.sourceName} (${cachedVerified.candidate.sourceTier})`,
              imageLicense: cachedVerified.candidate.license,
              imageAttribution: cachedVerified.candidate.attribution,
              imageResolution: impData.imageResolution,
              imageVerificationStatus: 'Image Imported',
              imageConfidence: cachedVerified.vision.confidence,
              verificationNotes: cachedVerified.vision.designCheckSummary,
              action: 'imported',
            });
            autoImported++;
            reportEntries.push({
              productId: prod.id,
              sku: prod.sku,
              brand: prod.brand,
              exactModel,
              generation: prod.generation,
              previousStatus: prevStatus,
              finalStatus: 'Image Imported',
              confidence: cachedVerified.vision.confidence,
              imageUrl: impData.mainImageUrl,
              sourceName: cachedVerified.candidate.sourceName,
              notes: `Matched same exact model & imported WebP (${impData.imageResolution}).`,
            });
            continue;
          }
        }

        // 2. Search exact model candidates
        let candidates = exactModelSearchCache.get(modelCacheKey);
        if (!candidates) {
          const searchRes = await fetch('/api/images/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              brand: prod.brand,
              series: prod.series || '',
              exactModel,
              generation: prod.generation || '',
              excludeUrls: prod.rejectedImageUrls || [],
            }),
          });
          const searchData = await searchRes.json();
          if (!searchRes.ok || searchData?.success === false) {
            const errCode = String(searchData?.errorCode || '');
            const errMsg = searchData?.message || `SerpAPI search failed (HTTP ${searchRes.status})`;
            if (
              errCode === 'SERPAPI_KEY_MISSING' ||
              errCode === 'SERPAPI_KEY_INVALID' ||
              errCode === 'SERPAPI_QUOTA_EXHAUSTED'
            ) {
              errors++;
              reportEntries.push({
                productId: prod.id,
                sku: prod.sku,
                brand: prod.brand,
                exactModel,
                generation: prod.generation,
                previousStatus: prevStatus,
                finalStatus: 'Skipped',
                notes: errMsg,
              });
              showNotice('error', errMsg);
              batchStopRef.current = true;
              break;
            }
            throw new Error(errMsg);
          }
          candidates = Array.isArray(searchData?.candidates) ? searchData.candidates : [];
          exactModelSearchCache.set(modelCacheKey, candidates);
        }

        const rejectedSet = new Set(prod.rejectedImageUrls || []);
        const eligibleCandidates = candidates.filter((c) => !rejectedSet.has(c.imageUrl) && !c.mismatchWarning);
        setCandidatesByProduct((prev) => ({ ...prev, [prod.id]: candidates || [] }));

        if (eligibleCandidates.length === 0) {
          noMatch++;
          updateProductImageStatus(
            prod.id,
            'No Exact Match',
            `Searched exact model "${prod.brand} ${exactModel}" — no mismatch-free candidate found.`
          );
          reportEntries.push({
            productId: prod.id,
            sku: prod.sku,
            brand: prod.brand,
            exactModel,
            generation: prod.generation,
            previousStatus: prevStatus,
            finalStatus: 'No Exact Match',
            notes: 'Zero mismatch-free candidates found.',
          });
          continue;
        }

        // 3. Verify top up to 2 candidates via async job queue + Gemini Vision AI
        let verifiedMatch: {
          candidate: ImageCandidate;
          vision: NonNullable<ImageCandidate['visionResult']>;
        } | null = null;
        let pendingMatch: {
          candidate: ImageCandidate;
          vision: NonNullable<ImageCandidate['visionResult']>;
        } | null = null;
        let visionUnavailableReason = '';

        for (const cand of eligibleCandidates.slice(0, 2)) {
          if (batchStopRef.current) break;
          try {
            const { jobState, visionResult } = await runAsyncVerificationJob(
              {
                brand: prod.brand,
                series: prod.series || '',
                exactModel,
                generation: prod.generation || '',
                candidate: cand,
              },
              (liveJob) => {
                setCandidatesByProduct((prev) => ({
                  ...prev,
                  [prod.id]: (prev[prod.id] || []).map((x) =>
                    x.candidateId === cand.candidateId ? { ...x, verificationJob: liveJob } : x
                  ),
                }));
              }
            );

            if (jobState.status === 'failed' || !visionResult) {
              visionUnavailableReason = jobState.error || 'Verification job failed.';
              setCandidatesByProduct((prev) => ({
                ...prev,
                [prod.id]: (prev[prod.id] || []).map((x) =>
                  x.candidateId === cand.candidateId
                    ? { ...x, verificationJob: jobState, verifyError: visionUnavailableReason }
                    : x
                ),
              }));
              if (jobState.errorCode === 'GEMINI_KEY_MISSING' || jobState.errorCode === 'GEMINI_AUTH_ERROR') {
                geminiDisabledNoticeShown = true;
                break;
              }
              continue;
            }

            setCandidatesByProduct((prev) => ({
              ...prev,
              [prod.id]: (prev[prod.id] || []).map((x) =>
                x.candidateId === cand.candidateId
                  ? { ...x, visionResult, verificationJob: jobState, verifyError: undefined }
                  : x
              ),
            }));

            if (jobState.status === 'verified' && visionResult.status === 'Verified' && visionResult.isVerifiedExactMatch) {
              verifiedMatch = { candidate: cand, vision: visionResult };
              break;
            } else if (visionResult.status === 'Verification Pending' && !pendingMatch) {
              pendingMatch = { candidate: cand, vision: visionResult };
            }
          } catch (candErr) {
            visionUnavailableReason = candErr instanceof Error ? candErr.message : 'Verification error';
            if (/GEMINI_KEY_MISSING|API key/i.test(visionUnavailableReason)) {
              geminiDisabledNoticeShown = true;
              break;
            }
          }
        }

        if (verifiedMatch) {
          exactModelVerifiedCache.set(modelCacheKey, verifiedMatch);
          const impRes = await fetch('/api/images/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: prod.id,
              brand: prod.brand,
              exactModel,
              generation: prod.generation || '',
              imageUrl: verifiedMatch.candidate.imageUrl,
              verificationJobId: verifiedMatch.vision.jobId,
            }),
          });
          const impData = await impRes.json();
          if (impRes.ok && impData.success) {
            assignVerifiedProductImage(prod.id, {
              exactModel,
              mainImageUrl: impData.mainImageUrl,
              imageStoragePath: impData.imageStoragePath,
              imageThumbnailPath: impData.imageThumbnailPath,
              imageSourceUrl: verifiedMatch.candidate.sourcePageUrl || verifiedMatch.candidate.imageUrl,
              imageSourceName: `${verifiedMatch.candidate.sourceName} (${verifiedMatch.candidate.sourceTier})`,
              imageLicense: verifiedMatch.candidate.license,
              imageAttribution: verifiedMatch.candidate.attribution,
              imageResolution: impData.imageResolution,
              imageVerificationStatus: 'Image Imported',
              imageConfidence: verifiedMatch.vision.confidence,
              verificationNotes: verifiedMatch.vision.designCheckSummary,
              action: 'imported',
            });
            autoImported++;
            reportEntries.push({
              productId: prod.id,
              sku: prod.sku,
              brand: prod.brand,
              exactModel,
              generation: prod.generation,
              previousStatus: prevStatus,
              finalStatus: 'Image Imported',
              confidence: verifiedMatch.vision.confidence,
              imageUrl: impData.mainImageUrl,
              sourceName: verifiedMatch.candidate.sourceName,
              notes: verifiedMatch.vision.designCheckSummary,
            });
          } else {
            pendingReview++;
            updateProductImageStatus(
              prod.id,
              'Verification Pending',
              impData?.message || 'Verified by AI, manual import needed.'
            );
            reportEntries.push({
              productId: prod.id,
              sku: prod.sku,
              brand: prod.brand,
              exactModel,
              generation: prod.generation,
              previousStatus: prevStatus,
              finalStatus: 'Verification Pending',
              confidence: verifiedMatch.vision.confidence,
              notes: impData?.message || 'Import error',
            });
          }
        } else if (pendingMatch) {
          pendingReview++;
          updateProductImageStatus(
            prod.id,
            'Verification Pending',
            `Confidence ${pendingMatch.vision.confidence}% — ${pendingMatch.vision.designCheckSummary}. Queued for admin review.`
          );
          reportEntries.push({
            productId: prod.id,
            sku: prod.sku,
            brand: prod.brand,
            exactModel,
            generation: prod.generation,
            previousStatus: prevStatus,
            finalStatus: 'Verification Pending',
            confidence: pendingMatch.vision.confidence,
            notes: pendingMatch.vision.designCheckSummary,
          });
        } else if (visionUnavailableReason) {
          pendingReview++;
          updateProductImageStatus(
            prod.id,
            'Image Found',
            `Found ${eligibleCandidates.length} candidate(s). Verification failed: ${visionUnavailableReason}`
          );
          reportEntries.push({
            productId: prod.id,
            sku: prod.sku,
            brand: prod.brand,
            exactModel,
            generation: prod.generation,
            previousStatus: prevStatus,
            finalStatus: 'Image Found',
            notes: `Candidates fetched (${eligibleCandidates.length}); verification did not complete: ${visionUnavailableReason}`,
          });
        } else {
          noMatch++;
          updateProductImageStatus(
            prod.id,
            'No Exact Match',
            'All top candidates failed strict exact-model AI vision audit.'
          );
          reportEntries.push({
            productId: prod.id,
            sku: prod.sku,
            brand: prod.brand,
            exactModel,
            generation: prod.generation,
            previousStatus: prevStatus,
            finalStatus: 'No Exact Match',
            notes: 'Rejected by strict model/generation check.',
          });
        }
      } catch (err) {
        errors++;
        reportEntries.push({
          productId: prod.id,
          sku: prod.sku,
          brand: prod.brand,
          exactModel,
          generation: prod.generation,
          previousStatus: prevStatus,
          finalStatus: 'No Exact Match',
          notes: err instanceof Error ? err.message : 'Batch item error',
        });
      }
    }

    setBatchRunning(false);
    setBatchReport(reportEntries);
    showNotice(
      geminiDisabledNoticeShown ? 'info' : 'success',
      geminiDisabledNoticeShown
        ? `Batch search completed (${reportEntries.length} models). Candidates fetched & cached; configure GEMINI_API_KEY in server secrets for automated AI Vision verification.`
        : `Batch completed: ${autoImported} WebP imported, ${pendingReview} pending admin review, ${noMatch} no exact match.`
    );
  };

  // Action: Bulk Image Import from CSV / JSON lines
  const handleBulkImportSubmit = async () => {
    const raw = bulkImportText.trim();
    if (!raw) return;
    setBulkImportBusy(true);
    let parsedRows: Array<{ modelOrSku: string; imageUrl: string; sourceUrl?: string }> = [];

    try {
      if (raw.startsWith('[')) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          parsedRows = arr.map((r: any) => ({
            modelOrSku: String(r.sku || r.exactModel || r.model || '').trim(),
            imageUrl: String(r.imageUrl || r.url || '').trim(),
            sourceUrl: String(r.sourceUrl || r.pageUrl || '').trim(),
          }));
        }
      } else {
        const lines = raw.split(/\r?\n/).filter((l) => l.trim());
        for (const line of lines) {
          const parts = line.split(/[,\t|]/).map((s) => s.trim());
          if (parts.length >= 2 && /^https?:\/\//i.test(parts[1])) {
            parsedRows.push({ modelOrSku: parts[0], imageUrl: parts[1], sourceUrl: parts[2] || parts[1] });
          }
        }
      }

      let importedCount = 0;
      let skippedCount = 0;
      for (const row of parsedRows) {
        const key = row.modelOrSku.toLowerCase();
        const matchingProducts = activeProducts.filter(
          (p) =>
            p.sku.toLowerCase() === key ||
            deriveExactModel(p).toLowerCase() === key ||
            p.id.toLowerCase() === key
        );
        if (matchingProducts.length === 0) {
          skippedCount++;
          continue;
        }
        for (const prod of matchingProducts) {
          const exactModel = deriveExactModel(prod);
          // Strict rule: verify every bulk image through AI Vision before importing
          const { jobState, visionResult } = await runAsyncVerificationJob({
            brand: prod.brand,
            series: prod.series || '',
            exactModel,
            generation: prod.generation || '',
            candidate: {
              imageUrl: row.imageUrl,
              sourcePageUrl: row.sourceUrl || row.imageUrl,
              sourceName: 'Bulk URL Import',
              title: `${prod.brand} ${exactModel}`,
            },
          });

          if (jobState.status !== 'verified' || !visionResult?.isVerifiedExactMatch) {
            skippedCount++;
            continue;
          }

          const impRes = await fetch('/api/images/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: prod.id,
              brand: prod.brand,
              exactModel,
              generation: prod.generation || '',
              imageUrl: row.imageUrl,
              verificationJobId: jobState.jobId,
            }),
          });
          const impData = await impRes.json();
          if (impRes.ok && impData.success) {
            assignVerifiedProductImage(prod.id, {
              exactModel,
              mainImageUrl: impData.mainImageUrl,
              imageStoragePath: impData.imageStoragePath,
              imageThumbnailPath: impData.imageThumbnailPath,
              imageSourceUrl: row.sourceUrl || row.imageUrl,
              imageSourceName: 'Verified Bulk Import',
              imageLicense: 'AI Verified Commercial Asset',
              imageResolution: impData.imageResolution,
              imageVerificationStatus: 'Image Imported',
              imageConfidence: visionResult.confidence,
              verificationNotes: `${visionResult.designCheckSummary} (${impData.imageResolution}, ${impData.fileSizeKb} KB)`,
              action: 'imported',
            });
            importedCount++;
          } else {
            skippedCount++;
          }
        }
      }

      showNotice(
        importedCount > 0 ? 'success' : 'info',
        `Bulk Verify & Import finished: ${importedCount} verified & imported, ${skippedCount} skipped (unverified or failed).`
      );
      setBulkImportOpen(false);
      setBulkImportText('');
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : 'Invalid bulk import format.');
    } finally {
      setBulkImportBusy(false);
    }
  };

  const exportCompletionReportCsv = () => {
    const rows = batchReport || [];
    if (rows.length === 0) return;
    const headers = [
      'Product ID',
      'SKU',
      'Brand',
      'Exact Model',
      'Generation',
      'Previous Status',
      'Final Status',
      'Confidence',
      'Image URL',
      'Source',
      'Notes',
    ];
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.productId,
          r.sku,
          r.brand,
          r.exactModel,
          r.generation,
          r.previousStatus,
          r.finalStatus,
          r.confidence ?? '',
          r.imageUrl ?? '',
          r.sourceName ?? '',
          r.notes,
        ]
          .map(escape)
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jhf-image-verification-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const modalHistoryRecords = useMemo(() => {
    if (!historyModalProductId) return [];
    if (historyModalProductId === 'ALL') return imageHistory;
    return imageHistory.filter((h) => h.productId === historyModalProductId);
  }, [historyModalProductId, imageHistory]);

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
              : 'bg-blue-500/20 border-blue-500/40 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 11: Automatic New Product Monitoring Alert Banner */}
      {pendingAutoProducts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-200">
                New Inventory Detected ({pendingAutoProducts.length} model{pendingAutoProducts.length > 1 ? 's' : ''} without verified exact photo)
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Auto-monitor queued:{' '}
                {pendingAutoProducts
                  .slice(0, 3)
                  .map((p) => `${p.brand} ${deriveExactModel(p)}`)
                  .join(', ')}
                {pendingAutoProducts.length > 3 ? ` +${pendingAutoProducts.length - 3} more` : ''}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => runBatchAutomation(pendingAutoProducts, 'Auto-Search New Models')}
              disabled={batchRunning}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Auto-Search New Models</span>
            </button>
            <button
              onClick={() => pendingAutoProducts.forEach((p) => dismissAutoImageAlert(p.id))}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header + Master Automation Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white">
                <ScanSearch className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">
                  Universal Exact Model Image Finder & Auto Image Manager
                </h1>
                <p className="text-xs text-slate-400">
                  Strict per-model & generation verification (HP, Dell, Lenovo, Acer, Asus, Surface, Apple, MSI & more) • WebP optimization • Full rollback audit
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {batchRunning ? (
              <button
                onClick={() => {
                  batchStopRef.current = true;
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg"
              >
                <Square className="w-4 h-4" />
                <span>Stop Automation</span>
              </button>
            ) : (
              <button
                onClick={() => runBatchAutomation(activeProducts, 'FIND & UPDATE ALL LAPTOP IMAGES')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>FIND & UPDATE ALL LAPTOP IMAGES</span>
              </button>
            )}

            <button
              onClick={() => {
                setOnlyMissingShared(true);
                setStatusFilter('ALL');
                const missing = activeProducts.filter(
                  (p) =>
                    getEffectiveImageStatus(p) === 'Image Missing' ||
                    isGenericOrMissingImage(p.mainImageUrl || p.images?.[0])
                );
                runBatchAutomation(missing, 'Find Missing Images');
              }}
              disabled={batchRunning}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find Missing Images</span>
            </button>

            <button
              onClick={() => {
                const mismatched = activeProducts.filter((p) => {
                  const s = getEffectiveImageStatus(p);
                  return s === 'Rejected' || s === 'Verification Pending' || s === 'No Exact Match';
                });
                runBatchAutomation(mismatched, 'Recheck Mismatched Images');
              }}
              disabled={batchRunning}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recheck Mismatched</span>
            </button>

            <button
              onClick={() => {
                const failed = activeProducts.filter((p) => {
                  const s = getEffectiveImageStatus(p);
                  return s === 'No Exact Match' || s === 'Rejected';
                });
                runBatchAutomation(failed, 'Retry Failed Searches');
              }}
              disabled={batchRunning}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-300 border border-orange-500/30 text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Failed</span>
            </button>

            <button
              onClick={() => setBulkImportOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bulk Image Import</span>
            </button>

            <button
              onClick={runTestImageSearch}
              disabled={testingConnection || batchRunning}
              className="px-3 py-2.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/35 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title='Test SerpAPI Google Images with "HP EliteBook 840 G6 official product image"'
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Testing SerpAPI...' : 'Test Image Search'}</span>
            </button>

            <button
              onClick={() => {
                setVerificationLogsModalOpen(true);
                loadServerVerificationLogs();
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ScanSearch className="w-3.5 h-3.5" />
              <span>Verification Logs</span>
            </button>

            <button
              onClick={() => setHistoryModalProductId('ALL')}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>Image History ({imageHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Provider & AI Vision Engine Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Image Provider:{' '}
              <strong className="text-slate-200 uppercase">
                {providerStatus?.activeProvider || 'serpapi'} ({providerStatus?.searchEngine || 'google_images'})
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  providerStatus?.configuredApiKeys?.serpapi ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              SerpAPI Key:{' '}
              <strong
                className={
                  providerStatus?.configuredApiKeys?.serpapi ? 'text-emerald-300' : 'text-rose-300'
                }
              >
                {providerStatus?.configuredApiKeys?.serpapi
                  ? 'Configured (Server-Side)'
                  : 'Missing — Add SERPAPI_API_KEY in Server Secrets'}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck
                className={`w-3.5 h-3.5 ${
                  providerStatus?.geminiVisionConfigured ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              AI Vision:{' '}
              <strong className={providerStatus?.geminiVisionConfigured ? 'text-emerald-300' : 'text-amber-300'}>
                {providerStatus?.geminiVisionConfigured
                  ? `Active (${providerStatus.visionModel} • Max ${providerStatus.verificationConfig?.visionResizeMaxDim || 896}px)`
                  : 'GEMINI_API_KEY needed'}
              </strong>
            </span>
            {typeof providerStatus?.cacheEntriesCount === 'number' && (
              <span className="text-slate-400">
                Verification Cache: <strong className="text-cyan-300">{providerStatus.cacheEntriesCount}</strong>
              </span>
            )}
          </div>
          <div>
            Inventory: <strong className="text-white">{stats.totalProducts}</strong> SKUs across{' '}
            <strong className="text-cyan-300">{stats.uniqueModelCount}</strong> distinct exact models
          </div>
        </div>

        {/* Test Image Search Live Result Panel */}
        {testSearchResult && (
          <div
            className={`rounded-xl border p-4 space-y-3 ${
              testSearchResult.success
                ? 'bg-emerald-950/30 border-emerald-500/40'
                : 'bg-rose-950/30 border-rose-500/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 font-extrabold">
                  {testSearchResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className={testSearchResult.success ? 'text-emerald-200' : 'text-rose-200'}>
                    SerpAPI Connection Test — Query: &quot;{testSearchResult.testQuery}&quot;
                  </span>
                  {testSearchResult.errorCode && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[10px]">
                      {testSearchResult.errorCode}
                    </span>
                  )}
                </div>
                <p className={testSearchResult.success ? 'text-emerald-300/90' : 'text-rose-300/90'}>
                  {testSearchResult.message}
                </p>
              </div>
              <button
                onClick={() => setTestSearchResult(null)}
                className="text-slate-400 hover:text-white p-1"
                title="Close test panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {testSearchResult.success &&
              testSearchResult.candidates &&
              testSearchResult.candidates.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {testSearchResult.candidates.map((c) => (
                    <div
                      key={c.candidateId}
                      className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-[10px]"
                    >
                      <div className="h-20 bg-white flex items-center justify-center p-1">
                        <img
                          src={c.thumbnailUrl || c.imageUrl}
                          alt={c.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <div className="text-slate-200 font-semibold truncate">{c.sourceName}</div>
                        <div className="text-slate-400 font-mono">
                          {c.width && c.height ? `${c.width}x${c.height}` : c.sourceTier}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Live Batch Progress Bar */}
        {batchRunning && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Processing {batchProgress.current} / {batchProgress.total}: {batchProgress.currentLabel}
              </span>
              <span className="text-slate-400 font-mono">
                Imported: <strong className="text-emerald-400">{batchProgress.autoImported}</strong> • Pending:{' '}
                <strong className="text-amber-400">{batchProgress.pendingReview}</strong> • No Match:{' '}
                <strong className="text-orange-400">{batchProgress.noMatch}</strong>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{
                  width: `${batchProgress.total ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Batch Completion Report */}
        {batchReport && !batchRunning && (
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Automation Run Summary: {batchReport.filter((r) => r.finalStatus === 'Image Imported').length} Imported •{' '}
                  {batchReport.filter((r) => r.finalStatus === 'Verification Pending' || r.finalStatus === 'Image Found').length} Pending Review •{' '}
                  {batchReport.filter((r) => r.finalStatus === 'No Exact Match').length} No Exact Match •{' '}
                  {batchReport.filter((r) => r.finalStatus === 'Skipped').length} Protected Skipped
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportCompletionReportCsv}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV Report</span>
                </button>
                <button
                  onClick={() => setBatchReport(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7-Status Summary Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <button
          onClick={() => {
            setStatusFilter('ALL');
            setOnlyMissingShared(false);
          }}
          className={`p-3 rounded-xl border text-left transition ${
            statusFilter === 'ALL' && !onlyMissingShared
              ? 'bg-slate-800 border-cyan-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider">All Models</div>
          <div className="text-lg font-extrabold text-white mt-0.5">{stats.totalProducts}</div>
        </button>

        {ALL_STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(statusFilter === st ? 'ALL' : st);
              setOnlyMissingShared(false);
            }}
            className={`p-3 rounded-xl border text-left transition ${
              statusFilter === st
                ? 'bg-slate-800 border-cyan-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider truncate">{st}</div>
            <div className="text-lg font-extrabold text-white mt-0.5">{stats.counts[st] || 0}</div>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exact model, brand, generation, SKU (e.g. EliteBook 840 G8, Latitude 5420, ThinkPad T480)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none"
            >
              {brandOptions.map((b) => (
                <option key={b} value={b} className="bg-slate-900">
                  {b === 'ALL' ? 'All Brands' : b}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setOnlyMissingShared(!onlyMissingShared)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
              onlyMissingShared
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Shared / Missing Only ({stats.needsWorkCount})
          </button>
        </div>
      </div>

      {/* Product Image Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Current Preview</th>
                <th className="py-3 px-4">Exact Model Job & Specs</th>
                <th className="py-3 px-4">Status & AI Score</th>
                <th className="py-3 px-4">Source / Resolution</th>
                <th className="py-3 px-4 text-right">Image Manager Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredProducts.map((prod) => {
                const exactModel = deriveExactModel(prod);
                const effStatus = getEffectiveImageStatus(prod);
                const currentImg = prod.mainImageUrl || prod.images?.[0] || '';
                const isShared = isGenericOrMissingImage(currentImg);
                const isLoading = Boolean(loadingProductIds[prod.id]);
                const cachedCands = candidatesByProduct[prod.id] || [];

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 w-28">
                      <div className="relative w-24 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                        {currentImg ? (
                          <img
                            src={currentImg}
                            alt={exactModel}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-600" />
                        )}
                        {isShared && (
                          <span className="absolute bottom-0.5 right-0.5 bg-amber-500/90 text-black text-[9px] font-extrabold px-1 rounded">
                            SHARED
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{prod.brand}</span>
                        <span className="text-cyan-300">{exactModel}</span>
                        {prod.generation && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {prod.generation}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">{prod.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        SKU: {prod.sku} • {prod.ram} • {prod.storage}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${STATUS_BADGE_STYLES[effStatus]}`}
                      >
                        {effStatus}
                      </span>
                      {typeof prod.imageConfidence === 'number' && prod.imageConfidence > 0 && (
                        <div className="text-[11px] text-slate-300 mt-1 font-semibold">
                          Confidence: <span className="text-emerald-400">{prod.imageConfidence}%</span>
                        </div>
                      )}
                      {prod.verificationNotes && (
                        <div className="text-[10px] text-slate-400 mt-0.5 max-w-xs line-clamp-2">
                          {prod.verificationNotes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-slate-200 font-semibold">
                        {prod.imageSourceName || (isShared ? 'Shared Brand Stock Asset' : 'Local Catalog Asset')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {prod.imageResolution ? `Res: ${prod.imageResolution}` : 'Resolution unverified'}
                        {prod.imageStoragePath ? ' • WebP Stored' : ''}
                      </div>
                      {cachedCands.length > 0 && (
                        <div className="text-[10px] text-cyan-400 mt-0.5 font-semibold">
                          {cachedCands.length} candidate(s) ready in drawer
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          onClick={() => searchCandidatesForProduct(prod, true)}
                          disabled={isLoading}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-bold flex items-center gap-1"
                          title="Search Exact Model Images & Fetch Candidates"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Search className="w-3 h-3" />
                          )}
                          <span>Search / Candidates</span>
                        </button>

                        <button
                          onClick={() => setDrawerProductId(prod.id)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1"
                          title="Replace Image / Manual Review Drawer"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Replace</span>
                        </button>

                        <button
                          onClick={() => setSourceModalProduct(prod)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                          title="View Image Source & License Metadata"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setHistoryModalProductId(prod.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                          title="View Image History & Rollback"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDownloadProductImage(prod)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                          title="Download Current Image"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {prod.previousImageUrl && (
                          <button
                            onClick={() => {
                              const r = rollbackProductImage(prod.id);
                              showNotice(r.success ? 'success' : 'error', r.message);
                            }}
                            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30"
                            title="1-Click Rollback to Previous Image"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            removeWrongProductImage(prod.id, `Removed wrong image for exact model ${exactModel}`);
                            showNotice('info', `Removed image for ${exactModel} and recorded in history.`);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30"
                          title="Remove Wrong Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500 text-xs">
                    No laptop models match your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANDIDATE VERIFICATION & IMPORT DRAWER */}
      {drawerProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-end">
          <div className="w-full max-w-4xl h-full bg-slate-950 border-l border-slate-800 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-white">
                    {drawerProduct.brand} {deriveExactModel(drawerProduct)}
                  </h2>
                  {drawerProduct.generation && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                      {drawerProduct.generation}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Strict Exact-Model Candidate Review • Only verified or admin-approved clean product photos are imported
                </p>
              </div>
              <button
                onClick={() => setDrawerProductId(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Top Actions + Scan Official Product URL */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => searchCandidatesForProduct(drawerProduct, true)}
                    disabled={Boolean(loadingProductIds[drawerProduct.id])}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Fetch Candidates</span>
                  </button>
                  <button
                    onClick={() => handleSelectAndVerifyBest(drawerProduct)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AI Verify Best Candidate</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customPageUrl}
                    onChange={(e) => setCustomPageUrl(e.target.value)}
                    placeholder="Paste official HP/Dell/Lenovo or retailer product page URL..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleScanOfficialUrl}
                    disabled={scanningPage || !customPageUrl.trim()}
                    className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shrink-0"
                  >
                    {scanningPage ? 'Scanning...' : 'Scan URL'}
                  </button>
                </div>
              </div>

              {/* Candidate Grid */}
              {(candidatesByProduct[drawerProduct.id] || []).length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                  <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">No candidates loaded yet for this exact model</p>
                  <p className="text-xs text-slate-500">
                    Click &quot;Fetch Candidates&quot; above to search Wikimedia Commons & web product indexes, or paste an official product page URL.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(candidatesByProduct[drawerProduct.id] || []).map((cand) => {
                    const v = cand.visionResult;
                    const job = cand.verificationJob;
                    const isActiveJob =
                      job?.status === 'pending' ||
                      job?.status === 'downloading' ||
                      job?.status === 'verifying';
                    const isVerifying = verifyingCandidateId === cand.candidateId || isActiveJob;
                    const isImporting = importingCandidateId === cand.candidateId;
                    const canApproveAndImport = Boolean(
                      v &&
                        v.status === 'Verified' &&
                        v.isVerifiedExactMatch === true &&
                        !cand.mismatchWarning &&
                        job?.status !== 'failed' &&
                        job?.status !== 'rejected'
                    );

                    const jobBadgeStyle =
                      job?.status === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : job?.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : job?.status === 'failed'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

                    return (
                      <div
                        key={cand.candidateId}
                        className={`bg-slate-900 border rounded-2xl overflow-hidden flex flex-col ${
                          v?.isVerifiedExactMatch
                            ? 'border-emerald-500/60'
                            : cand.mismatchWarning || v?.status === 'Rejected' || job?.status === 'failed'
                            ? 'border-rose-500/50'
                            : 'border-slate-800'
                        }`}
                      >
                        <div className="relative h-48 bg-white/95 flex items-center justify-center p-2">
                          <img
                            src={cand.thumbnailUrl || cand.imageUrl}
                            alt={cand.title}
                            className="max-h-full max-w-full object-contain"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/85 text-cyan-300 text-[10px] font-bold">
                            {cand.sourceTier}
                          </span>
                          {(v?.actualResolution || (cand.width > 0 && cand.height > 0)) && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/85 text-slate-200 text-[10px] font-mono">
                              {v?.actualResolution || `${cand.width}x${cand.height}`}
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                          <div className="space-y-1.5">
                            <div className="font-bold text-white line-clamp-2">{cand.title}</div>
                            <div className="text-[11px] text-slate-400 flex items-center justify-between gap-2">
                              <span className="truncate">{cand.sourceName}</span>
                              <a
                                href={cand.sourcePageUrl || cand.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline flex items-center gap-0.5 shrink-0"
                              >
                                Source <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="text-[10px] text-slate-500">License: {cand.license}</div>

                            {job && (
                              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[10px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded border font-bold uppercase tracking-wide ${jobBadgeStyle}`}
                                  >
                                    Job: {job.status}
                                  </span>
                                  <span className="text-slate-400 font-mono">
                                    {job.cached
                                      ? 'CACHE HIT'
                                      : job.attempt
                                      ? `Attempt ${job.attempt}/${job.maxAttempts || 1}`
                                      : ''}
                                    {typeof job.durationMs === 'number' ? ` • ${job.durationMs}ms` : ''}
                                  </span>
                                </div>
                                {job.logs.length > 0 && (
                                  <div className="text-slate-400 font-mono truncate">
                                    {job.logs[job.logs.length - 1]?.message}
                                  </div>
                                )}
                              </div>
                            )}

                            {cand.mismatchWarning && (
                              <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px]">
                                <strong>Pre-Audit Mismatch Alert:</strong> {cand.mismatchWarning}
                              </div>
                            )}

                            {cand.verifyError && (
                              <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px]">
                                <strong>Verification Error:</strong> {cand.verifyError}
                              </div>
                            )}

                            {v && (
                              <div
                                className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                                  v.isVerifiedExactMatch
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                                    : v.status === 'Verification Pending'
                                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                                    : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold">
                                  <span>
                                    AI Verdict: {v.status} ({v.confidence}%)
                                  </span>
                                  <span>
                                    {v.detectedBrand} {v.detectedModel}
                                  </span>
                                </div>
                                <div className="text-[10px] opacity-90">{v.designCheckSummary}</div>
                                {v.visionInputResolution && (
                                  <div className="text-[10px] opacity-75 font-mono">
                                    Vision payload resized: {v.visionInputResolution} ({v.visionInputSizeKb} KB)
                                  </div>
                                )}
                                {v.rejectionReason && (
                                  <div className="text-[10px] text-rose-300 font-semibold">
                                    Reason: {v.rejectionReason}
                                  </div>
                                )}
                              </div>
                            )}

                            {job && job.logs.length > 0 && (
                              <details className="bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-400">
                                <summary className="cursor-pointer font-semibold text-slate-300">
                                  Verification Logs ({job.logs.length})
                                </summary>
                                <div className="mt-1.5 space-y-1 max-h-28 overflow-y-auto font-mono">
                                  {job.logs.map((lg, idx) => (
                                    <div key={idx} className="leading-snug">
                                      <span className="text-cyan-400">[{lg.stage}]</span> {lg.message}
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
                            <button
                              onClick={() => verifyCandidate(drawerProduct, cand)}
                              disabled={isVerifying || isImporting}
                              className="flex-1 px-2.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 text-purple-300 border border-purple-500/40 font-bold flex items-center justify-center gap-1"
                            >
                              {isVerifying ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {job?.status === 'downloading'
                                  ? 'Downloading...'
                                  : job?.status === 'verifying'
                                  ? 'Verifying...'
                                  : isVerifying
                                  ? 'Pending...'
                                  : 'AI Verify'}
                              </span>
                            </button>

                            <button
                              onClick={() => approveAndImportCandidate(drawerProduct, cand)}
                              disabled={isImporting || isVerifying || !canApproveAndImport}
                              className="flex-1 px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-extrabold flex items-center justify-center gap-1"
                              title={
                                cand.mismatchWarning
                                  ? 'Blocked due to model mismatch warning'
                                  : !canApproveAndImport
                                  ? 'Run AI Verify first — only verified images can be approved & imported'
                                  : 'Approve verified image, convert to WebP & assign to product'
                              }
                            >
                              {isImporting ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>{canApproveAndImport ? 'Approve & Import' : 'Verify Required'}</span>
                            </button>

                            <button
                              onClick={() => handleRejectCandidate(drawerProduct, cand)}
                              className="px-2.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold"
                              title="Reject Image"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW IMAGE SOURCE & METADATA MODAL */}
      {sourceModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">
                Image Metadata & Attribution — {sourceModalProduct.brand} {deriveExactModel(sourceModalProduct)}
              </h3>
              <button onClick={() => setSourceModalProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white/95 rounded-xl p-3 flex items-center justify-center h-48">
              <img
                src={sourceModalProduct.mainImageUrl || sourceModalProduct.images?.[0]}
                alt={sourceModalProduct.name}
                className="max-h-full object-contain"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <div>
                <span className="text-slate-500 block">Status</span>
                <strong className="text-white">{getEffectiveImageStatus(sourceModalProduct)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Confidence</span>
                <strong className="text-emerald-400">
                  {sourceModalProduct.imageConfidence ? `${sourceModalProduct.imageConfidence}%` : 'Unverified'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Source Name</span>
                <strong className="text-slate-200">{sourceModalProduct.imageSourceName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Resolution</span>
                <strong className="text-slate-200">{sourceModalProduct.imageResolution || 'Unknown'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">License / Attribution</span>
                <strong className="text-slate-200">
                  {sourceModalProduct.imageLicense || 'N/A'} — {sourceModalProduct.imageAttribution || 'N/A'}
                </strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Local Storage Path (WebP)</span>
                <code className="text-cyan-300 text-[11px] break-all">
                  {sourceModalProduct.imageStoragePath || sourceModalProduct.images?.[0] || 'None'}
                </code>
              </div>
              {sourceModalProduct.imageSourceUrl && (
                <div className="col-span-2">
                  <span className="text-slate-500 block">Original Source URL</span>
                  <a
                    href={sourceModalProduct.imageSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline break-all text-[11px]"
                  >
                    {sourceModalProduct.imageSourceUrl}
                  </a>
                </div>
              )}
              {sourceModalProduct.verificationNotes && (
                <div className="col-span-2">
                  <span className="text-slate-500 block">Verification Notes</span>
                  <p className="text-slate-300 mt-0.5">{sourceModalProduct.verificationNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW IMAGE HISTORY & 1-CLICK ROLLBACK MODAL */}
      {historyModalProductId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <span>
                  Image Audit History & Rollback (
                  {historyModalProductId === 'ALL' ? 'All Models' : activeProducts.find((p) => p.id === historyModalProductId)?.model})
                </span>
              </h3>
              <button onClick={() => setHistoryModalProductId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              {modalHistoryRecords.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No image changes logged yet for this selection.
                </div>
              ) : (
                modalHistoryRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {rec.imageUrl && (
                        <img
                          src={rec.imageUrl}
                          alt={rec.exactModel}
                          className="w-16 h-12 rounded-lg object-contain bg-white p-0.5 shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-bold text-white">
                          {rec.brand} {rec.exactModel}{' '}
                          <span className="text-cyan-400 uppercase text-[10px]">[{rec.action}]</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Status: {rec.imageVerificationStatus} • By {rec.performedBy} •{' '}
                          {new Date(rec.timestamp).toLocaleString()}
                        </div>
                        {rec.verificationNotes && (
                          <div className="text-[10px] text-slate-500 mt-0.5">{rec.verificationNotes}</div>
                        )}
                      </div>
                    </div>
                    {rec.previousImageUrl && (
                      <button
                        onClick={() => {
                          const res = rollbackProductImage(rec.productId, rec);
                          showNotice(res.success ? 'success' : 'error', res.message);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore Previous</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* BULK IMAGE IMPORT MODAL */}
      {bulkImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">Bulk Exact-Model Image Import (CSV or JSON)</h3>
              <button onClick={() => setBulkImportOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Paste rows as <code className="text-cyan-300">SKU_or_ExactModel, Image_URL, Optional_Source_Page_URL</code> (one per line) or a JSON array. Each image is downloaded, integrity-checked, and converted to local WebP.
            </p>
            <textarea
              rows={7}
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              placeholder={`EliteBook 840 G8, https://example.com/elitebook-840-g8.jpg, https://hp.com/840-g8\nLatitude 5420, https://example.com/latitude-5420.png, https://dell.com/5420`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setBulkImportOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImportSubmit}
                disabled={bulkImportBusy || !bulkImportText.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-extrabold"
              >
                {bulkImportBusy ? 'Verifying & Importing WebP...' : 'Verify & Run Bulk WebP Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION JOBS, LOGS & CACHE MONITOR MODAL */}
      {verificationLogsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ScanSearch className="w-5 h-5 text-cyan-400" />
                  <span>Async Verification Jobs, Logs & Cache Monitor</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cached exact matches: <strong className="text-cyan-300">{serverVerificationLogs?.cacheSize ?? 0}</strong> •
                  Jobs tracked: <strong className="text-white">{serverVerificationLogs?.totalJobsTracked ?? 0}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadServerVerificationLogs}
                  disabled={serverLogsLoading}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${serverLogsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setVerificationLogsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              {!serverVerificationLogs || serverVerificationLogs.jobs.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No async verification jobs recorded yet in this server session. Click &quot;AI Verify&quot; on any candidate to test.
                </div>
              ) : (
                serverVerificationLogs.jobs.map((job) => (
                  <div key={job.jobId} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${
                            job.status === 'verified'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : job.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : job.status === 'failed'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}
                        >
                          {job.status}
                        </span>
                        <strong className="text-white">
                          {job.brand} {job.exactModel}
                        </strong>
                        {job.cached && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                            CACHED
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {job.jobId} • {typeof job.durationMs === 'number' ? `${job.durationMs}ms` : 'running'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">{job.imageUrl}</div>

                    {job.error && (
                      <div className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-2.5 py-1.5">
                        Error ({job.errorCode || 'ERROR'}): {job.error}
                      </div>
                    )}

                    <div className="bg-slate-900/70 rounded-lg p-2.5 space-y-1 font-mono text-[10px] text-slate-300 max-h-36 overflow-y-auto">
                      {job.logs.map((lg, i) => (
                        <div key={i}>
                          <span className="text-slate-500">{new Date(lg.ts).toLocaleTimeString()}</span>{' '}
                          <span className="text-cyan-400">[{lg.stage}]</span> {lg.message}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

