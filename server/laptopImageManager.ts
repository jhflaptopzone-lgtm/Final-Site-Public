import type { Express, Request, Response } from 'express';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_UPLOADS_DIR = path.resolve(__dirname, '..', 'public', 'uploads', 'laptop-images');

export type SourceTier = 'Official OEM' | 'Official Support / Open Media' | 'Trusted Tech Retailer' | 'Refurbished / Other';

export type VerificationJobStatus =
  | 'pending'
  | 'downloading'
  | 'verifying'
  | 'verified'
  | 'rejected'
  | 'failed';

export interface VerificationLogEntry {
  ts: string;
  stage: string;
  message: string;
}

export interface ImageSearchCandidate {
  candidateId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sourcePageUrl: string;
  sourceName: string;
  sourceDomain: string;
  sourceTier: SourceTier;
  title: string;
  width: number;
  height: number;
  license: string;
  attribution: string;
  preScore: number;
  mismatchWarning?: string;
  providerUsed: string;
}

export interface VisionVerificationResult {
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
}

export interface VerificationJobRecord {
  jobId: string;
  status: VerificationJobStatus;
  brand: string;
  series: string;
  exactModel: string;
  generation: string;
  imageUrl: string;
  sourcePageUrl: string;
  sourceName: string;
  title: string;
  attempt: number;
  maxAttempts: number;
  cached: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  durationMs?: number;
  logs: VerificationLogEntry[];
  result?: VisionVerificationResult;
  error?: string;
  errorCode?: string;
}

interface VerificationCacheEntry {
  cacheKey: string;
  brand: string;
  exactModel: string;
  generation: string;
  imageUrl: string;
  jobStatus: 'verified' | 'rejected';
  result: VisionVerificationResult;
  cachedAt: number;
  expiresAt: number;
}

function getVerificationConfig() {
  const clamp = (val: number, min: number, max: number, fallback: number) =>
    Number.isFinite(val) ? Math.min(max, Math.max(min, Math.floor(val))) : fallback;

  return {
    downloadTimeoutMs: clamp(Number(process.env.IMAGE_DOWNLOAD_TIMEOUT_MS), 3000, 60000, 12000),
    maxDownloadBytes: clamp(Number(process.env.IMAGE_MAX_DOWNLOAD_BYTES), 512 * 1024, 20 * 1024 * 1024, 10 * 1024 * 1024),
    visionTimeoutMs: clamp(Number(process.env.IMAGE_VISION_TIMEOUT_MS), 5000, 90000, 45000),
    maxRetries: clamp(Number(process.env.IMAGE_VERIFY_MAX_RETRIES), 0, 4, 2),
    cacheTtlMs: clamp(Number(process.env.IMAGE_VERIFY_CACHE_TTL_MS), 60000, 7 * 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000),
    visionMaxDim: 768,
    visionJpegQuality: 80,
  };
}

const verificationJobs = new Map<string, VerificationJobRecord>();
const verificationCache = new Map<string, VerificationCacheEntry>();

function buildVerificationCacheKey(params: {
  imageUrl: string;
  brand: string;
  exactModel: string;
  generation?: string;
}): string {
  return [
    params.imageUrl.trim(),
    params.brand.trim().toLowerCase(),
    params.exactModel.trim().toLowerCase(),
    (params.generation || '').trim().toLowerCase(),
  ].join('|');
}

function getCachedVerification(params: {
  imageUrl: string;
  brand: string;
  exactModel: string;
  generation?: string;
}): VerificationCacheEntry | null {
  const key = buildVerificationCacheKey(params);
  const entry = verificationCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    verificationCache.delete(key);
    return null;
  }
  return entry;
}

function findVerifiedCacheMatch(imageUrl: string, exactModel: string, brand?: string, generation?: string): VerificationCacheEntry | null {
  if (brand) {
    const direct = getCachedVerification({ imageUrl, brand, exactModel, generation });
    if (direct && direct.jobStatus === 'verified' && direct.result.isVerifiedExactMatch) {
      return direct;
    }
  }
  const now = Date.now();
  const cleanUrl = imageUrl.trim();
  const cleanModel = exactModel.trim().toLowerCase();
  for (const entry of verificationCache.values()) {
    if (now > entry.expiresAt) continue;
    if (
      entry.jobStatus === 'verified' &&
      entry.result.isVerifiedExactMatch &&
      entry.imageUrl === cleanUrl &&
      entry.exactModel.toLowerCase() === cleanModel
    ) {
      return entry;
    }
  }
  return null;
}

function storeVerificationCache(
  params: { imageUrl: string; brand: string; exactModel: string; generation?: string },
  jobStatus: 'verified' | 'rejected',
  result: VisionVerificationResult
) {
  const cfg = getVerificationConfig();
  const cacheKey = buildVerificationCacheKey(params);
  if (verificationCache.size >= 1000) {
    const oldestKey = verificationCache.keys().next().value;
    if (oldestKey) verificationCache.delete(oldestKey);
  }
  verificationCache.set(cacheKey, {
    cacheKey,
    brand: params.brand.trim(),
    exactModel: params.exactModel.trim(),
    generation: (params.generation || '').trim(),
    imageUrl: params.imageUrl.trim(),
    jobStatus,
    result,
    cachedAt: Date.now(),
    expiresAt: Date.now() + cfg.cacheTtlMs,
  });
}

function pruneJobsMap() {
  while (verificationJobs.size > 500) {
    const oldestKey = verificationJobs.keys().next().value;
    if (!oldestKey) break;
    verificationJobs.delete(oldestKey);
  }
}

function appendJobLog(job: VerificationJobRecord, stage: string, message: string) {
  const entry: VerificationLogEntry = {
    ts: new Date().toISOString(),
    stage,
    message,
  };
  job.logs.push(entry);
  if (job.logs.length > 60) {
    job.logs.shift();
  }
  job.updatedAt = entry.ts;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise.finally(() => {
      if (timer) clearTimeout(timer);
    }),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => {
        const err = new Error(message) as Error & { isTimeout?: boolean };
        err.name = 'TimeoutError';
        err.isTimeout = true;
        reject(err);
      }, timeoutMs);
    }),
  ]);
}

const BLOCKED_WATERMARK_DOMAINS = [
  'shutterstock.com',
  'istockphoto.com',
  'alamy.com',
  'dreamstime.com',
  '123rf.com',
  'depositphotos.com',
  'vecteezy.com',
  'gettyimages.com',
  'stock.adobe.com',
  'Freepik.com',
  'pinterest.com',
];

const OFFICIAL_OEM_DOMAINS = [
  'hp.com',
  'ssl-product-images.www8-hp.com',
  'h20195.www2.hp.com',
  'dell.com',
  'i.dell.com',
  'lenovo.com',
  'p1-ofp.static.pub',
  'p2-ofp.static.pub',
  'p3-ofp.static.pub',
  'p4-ofp.static.pub',
  'acer.com',
  'asus.com',
  'dlcdnwebimgs.asus.com',
  'microsoft.com',
  'dynabook.com',
  'toshiba.com',
  'fujitsu.com',
  'msi.com',
  'apple.com',
  'samsung.com',
];

const SUPPORT_AND_OPEN_DOMAINS = [
  'support.hp.com',
  'support.lenovo.com',
  'pcsupport.lenovo.com',
  'support.apple.com',
  'commons.wikimedia.org',
  'upload.wikimedia.org',
  'icecat.biz',
  'images.icecat.biz',
  'psref.lenovo.com',
];

const TRUSTED_RETAILER_DOMAINS = [
  'notebookcheck.net',
  'laptopmedia.com',
  'pcmag.com',
  'bhphotovideo.com',
  'cdw.com',
  'bestbuy.com',
  'amazon.com',
  'media-amazon.com',
  'm.media-amazon.com',
  'startech.com.bd',
  'ryans.com',
  'ryanscomputers.com',
  'techlandbd.com',
  'skyland.com.bd',
  'notebookcheck.org',
  '1worldsync.com',
  'cdn.cs.1worldsync.com',
];

function ensureUploadsDir() {
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
  }
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return 'unknown';
  }
}

function classifySourceTier(imageUrl: string, pageUrl: string): {
  tier: SourceTier;
  tierScore: number;
  domain: string;
} {
  const pageDomain = extractDomain(pageUrl);
  const imgDomain = extractDomain(imageUrl);
  const domains = [pageDomain, imgDomain];

  for (const d of domains) {
    if (d.includes('wikimedia')) {
      return {
        tier: 'Official Support / Open Media',
        tierScore: 22,
        domain: pageDomain !== 'unknown' ? pageDomain : imgDomain,
      };
    }
    if (OFFICIAL_OEM_DOMAINS.some((s) => d === s || d.endsWith(`.${s}`))) {
      return {
        tier: 'Official OEM',
        tierScore: 42,
        domain: pageDomain !== 'unknown' ? pageDomain : imgDomain,
      };
    }
    if (SUPPORT_AND_OPEN_DOMAINS.some((s) => d === s || d.endsWith(`.${s}`))) {
      return {
        tier: 'Official Support / Open Media',
        tierScore: 38,
        domain: pageDomain !== 'unknown' ? pageDomain : imgDomain,
      };
    }
  }

  for (const d of domains) {
    if (TRUSTED_RETAILER_DOMAINS.some((s) => d === s || d.endsWith(`.${s}`))) {
      return {
        tier: 'Trusted Tech Retailer',
        tierScore: 30,
        domain: pageDomain !== 'unknown' ? pageDomain : imgDomain,
      };
    }
  }

  return {
    tier: 'Refurbished / Other',
    tierScore: 14,
    domain: pageDomain !== 'unknown' ? pageDomain : imgDomain,
  };
}

function isBlockedDomain(urlStr: string): boolean {
  const dom = extractDomain(urlStr);
  return BLOCKED_WATERMARK_DOMAINS.some((b) => dom === b || dom.endsWith(`.${b.toLowerCase()}`));
}

/**
 * Deterministic model-identity token audit so different generations or suffix variants
 * (e.g. 840 G3 vs 840 G5, T480 vs T480s, Latitude 7490 vs 7480) are caught immediately.
 */
export function detectTextModelMismatch(
  requested: { brand: string; exactModel: string; generation?: string },
  candidateText: string
): string | undefined {
  const reqBrand = (requested.brand || '').trim().toLowerCase();
  const reqModel = (requested.exactModel || '').trim().toLowerCase();
  const text = (candidateText || '').toLowerCase();

  // Check conflicting brands
  const majorBrands = ['hp', 'dell', 'lenovo', 'acer', 'asus', 'apple', 'macbook', 'microsoft', 'surface', 'msi', 'toshiba', 'fujitsu', 'samsung'];
  if (reqBrand && !text.includes(reqBrand)) {
    for (const other of majorBrands) {
      if (other === reqBrand) continue;
      if (reqBrand === 'apple' && other === 'macbook') continue;
      if (reqBrand === 'microsoft' && other === 'surface') continue;
      if (new RegExp(`\\b${other}\\b`, 'i').test(text)) {
        return `Brand conflict: candidate mentions "${other}" instead of "${requested.brand}"`;
      }
    }
  }

  // Extract core alphanumeric model tokens (e.g. "840", "g8", "t480s", "5420", "x1", "e7470")
  const tokens = reqModel
    .replace(/[-_/()]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !['laptop', 'notebook', 'ultrabook', 'workstation', 'gen'].includes(t));

  // Detect G-series conflicts (e.g. G3 vs G4/G5/G6/G7/G8/G9/G10)
  const reqGMatch = reqModel.match(/\bg\s?(\d{1,2})\b/i);
  if (reqGMatch) {
    const reqG = reqGMatch[1];
    const foundGs = [...text.matchAll(/\bg\s?(\d{1,2})\b/gi)].map((m) => m[1]);
    const wrongG = foundGs.find((g) => g !== reqG);
    if (wrongG) {
      return `Generation mismatch: candidate references G${wrongG} while exact model requires G${reqG}`;
    }
  }

  // Detect "Gen X" conflicts (e.g. Gen 1 vs Gen 2, Gen 6 vs Gen 7)
  const reqGenNum = reqModel.match(/\bgen[\s-]?(\d{1,2})\b/i);
  if (reqGenNum) {
    const expected = reqGenNum[1];
    const foundGens = [...text.matchAll(/\bgen[\s-]?(\d{1,2})\b/gi)].map((m) => m[1]);
    const wrongGen = foundGens.find((g) => g !== expected);
    if (wrongGen) {
      return `Series generation conflict: found Gen ${wrongGen} instead of Gen ${expected}`;
    }
  }

  // Check competing 4-digit Latitude / ThinkPad / EliteBook series model numbers ONLY in series context
  // Avoid matching CPU numbers (i5-1135G7, i5-8250U), image dimensions (1500, 1466), or years (2021)
  const sanitizedForModelScan = text
    .replace(/(?:core\s*)?i[3579][-\s]?\d{4,5}[a-z0-9]*/gi, ' ')
    .replace(/\b\d{3,4}\s*[x×]\s*\d{3,4}\b/gi, ' ')
    .replace(/(?:width|height|size|sl|sr)=?\d{3,4}/gi, ' ');

  const numericModelTokens = tokens.filter((t) => /^[a-z]?\d{3,4}s?$/i.test(t));
  for (const numTok of numericModelTokens) {
    // Reject T480s if asking for T480 (and vice versa)
    if (numTok.endsWith('s')) {
      const base = numTok.slice(0, -1);
      if (
        new RegExp(`\\b${base}\\b(?!s)`, 'i').test(sanitizedForModelScan) &&
        !new RegExp(`\\b${numTok}\\b`, 'i').test(sanitizedForModelScan)
      ) {
        return `Variant conflict: candidate shows ${base.toUpperCase()} instead of ${numTok.toUpperCase()}`;
      }
    } else {
      if (new RegExp(`\\b${numTok}s\\b`, 'i').test(sanitizedForModelScan)) {
        return `Variant conflict: candidate shows ${numTok.toUpperCase()}s instead of ${numTok.toUpperCase()}`;
      }
    }

    const baseDigits = numTok.replace(/^[a-z]/i, '').replace(/s$/i, '');
    const explicitModelMentions = [
      ...sanitizedForModelScan.matchAll(
        /(?:latitude|thinkpad|elitebook|probook|precision|zbook)\s*[-]?\s*(e?\d{4}s?|[txl]\d{3}s?|8[2345]0|4[345]0|6[45]0)\b/gi
      ),
      ...sanitizedForModelScan.matchAll(/\b([txl]\d{3}s?|e[57]\d{3})\b/gi),
    ].map((m) => m[1].toLowerCase());

    if (explicitModelMentions.length > 0) {
      const hasExact = explicitModelMentions.some(
        (d) => d === numTok || d.replace(/^e/, '') === baseDigits
      );
      const conflict = explicitModelMentions.find(
        (d) => d !== numTok && d.replace(/^e/, '') !== baseDigits
      );
      if (!hasExact && conflict) {
        return `Model number conflict: found "${conflict.toUpperCase()}" instead of "${numTok.toUpperCase()}"`;
      }
    }
  }

  return undefined;
}

function buildPriorityQueries(params: {
  brand: string;
  series?: string;
  exactModel: string;
  generation?: string;
}): string[] {
  const brand = params.brand.trim();
  const model = params.exactModel.trim();
  const fullPrefix = model.toLowerCase().startsWith(brand.toLowerCase()) ? model : `${brand} ${model}`;

  return [
    `${fullPrefix} official product image`,
    `${fullPrefix} laptop`,
    `${fullPrefix} notebookcheck`,
  ];
}

function determineActiveProvider(): string {
  const explicit = (process.env.IMAGE_SEARCH_PROVIDER || 'serpapi').trim().toLowerCase();
  if (!explicit || explicit === 'auto') return 'serpapi';
  return explicit;
}

class SerpApiProviderError extends Error {
  code: 'SERPAPI_KEY_MISSING' | 'SERPAPI_KEY_INVALID' | 'SERPAPI_QUOTA_EXHAUSTED' | 'SERPAPI_ERROR';
  httpStatus: number;

  constructor(
    code: 'SERPAPI_KEY_MISSING' | 'SERPAPI_KEY_INVALID' | 'SERPAPI_QUOTA_EXHAUSTED' | 'SERPAPI_ERROR',
    httpStatus: number,
    message: string
  ) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

async function searchViaSerpApi(query: string): Promise<{
  candidates: ImageSearchCandidate[];
  searchMetadata?: Record<string, any>;
}> {
  const key = process.env.SERPAPI_API_KEY?.trim();
  if (!key || key === 'YOUR_SERPAPI_API_KEY' || key === 'MY_SERPAPI_API_KEY') {
    throw new SerpApiProviderError(
      'SERPAPI_KEY_MISSING',
      503,
      'SERPAPI_API_KEY is missing on the server. Add your real SerpAPI key in Environment Secrets (never client-side) to search images.'
    );
  }

  const url = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(
    query
  )}&ijn=0&safe=active&api_key=${encodeURIComponent(key)}`;

  let res: globalThis.Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  } catch (err) {
    throw new SerpApiProviderError(
      'SERPAPI_ERROR',
      502,
      err instanceof Error ? `Unable to reach SerpAPI: ${err.message}` : 'Network error connecting to SerpAPI.'
    );
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  const rawErr = String(data?.error || '').trim();
  const errLower = rawErr.toLowerCase();

  if (
    res.status === 401 ||
    res.status === 403 ||
    /invalid api key|unauthorized|api_key.*invalid|your account could not be verified/i.test(errLower)
  ) {
    throw new SerpApiProviderError(
      'SERPAPI_KEY_INVALID',
      401,
      rawErr || 'SerpAPI API key is invalid or unauthorized. Verify SERPAPI_API_KEY in server secrets.'
    );
  }

  if (
    res.status === 429 ||
    /quota|credit|run out of searches|plan.*limit|exceeded|rate limit/i.test(errLower)
  ) {
    throw new SerpApiProviderError(
      'SERPAPI_QUOTA_EXHAUSTED',
      429,
      rawErr || 'SerpAPI search quota / monthly credits exhausted. Upgrade or top up your SerpAPI plan.'
    );
  }

  if (!res.ok || rawErr) {
    throw new SerpApiProviderError(
      'SERPAPI_ERROR',
      res.status >= 400 ? res.status : 502,
      rawErr || `SerpAPI returned HTTP ${res.status}`
    );
  }

  const results: any[] = Array.isArray(data?.images_results) ? data.images_results : [];
  const candidates = results.slice(0, 15).map((r, idx) => {
    const imgUrl = String(r.original || r.thumbnail || '');
    const pageUrl = String(r.link || imgUrl);
    const { tier, tierScore, domain } = classifySourceTier(imgUrl, pageUrl);
    return {
      candidateId: `serp-${Date.now()}-${idx}`,
      imageUrl: imgUrl,
      thumbnailUrl: String(r.thumbnail || imgUrl),
      sourcePageUrl: pageUrl,
      sourceName: String(r.source || domain),
      sourceDomain: domain,
      sourceTier: tier,
      title: String(r.title || query),
      width: Number(r.original_width || 0),
      height: Number(r.original_height || 0),
      license:
        tier === 'Official OEM'
          ? 'Official Manufacturer Product Media'
          : 'External Source — Verify Usage Rights',
      attribution: String(r.source || domain),
      preScore: tierScore,
      providerUsed: 'serpapi_google_images',
    };
  });

  return {
    candidates,
    searchMetadata: data?.search_metadata
      ? {
          id: data.search_metadata.id,
          status: data.search_metadata.status,
          totalTimeTaken: data.search_metadata.total_time_taken,
        }
      : undefined,
  };
}

async function searchViaAzureBing(query: string): Promise<ImageSearchCandidate[]> {
  const key = process.env.BING_IMAGE_SEARCH_KEY?.trim();
  if (!key) return [];
  const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(query)}&count=12&imageType=Photo`;
  const res = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': key },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Bing Image API HTTP ${res.status}`);
  const data: any = await res.json();
  const values: any[] = Array.isArray(data?.value) ? data.value : [];
  return values.map((v, idx) => {
    const imgUrl = String(v.contentUrl || '');
    const pageUrl = String(v.hostPageUrl || imgUrl);
    const { tier, tierScore, domain } = classifySourceTier(imgUrl, pageUrl);
    return {
      candidateId: `bingapi-${Date.now()}-${idx}`,
      imageUrl: imgUrl,
      thumbnailUrl: String(v.thumbnailUrl || imgUrl),
      sourcePageUrl: pageUrl,
      sourceName: String(v.hostPageDisplayUrl || domain),
      sourceDomain: domain,
      sourceTier: tier,
      title: String(v.name || query),
      width: Number(v.width || 0),
      height: Number(v.height || 0),
      license: 'Verify source license before commercial use',
      attribution: domain,
      preScore: tierScore,
      providerUsed: 'bing_image_search_api',
    };
  });
}

async function searchViaGoogleCse(query: string): Promise<ImageSearchCandidate[]> {
  const key = process.env.GOOGLE_CSE_KEY?.trim();
  const cx = process.env.GOOGLE_CSE_CX?.trim();
  if (!key || !cx) return [];
  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(query)}&searchType=image&num=10`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Google CSE HTTP ${res.status}`);
  const data: any = await res.json();
  const items: any[] = Array.isArray(data?.items) ? data.items : [];
  return items.map((it, idx) => {
    const imgUrl = String(it.link || '');
    const pageUrl = String(it.image?.contextLink || imgUrl);
    const { tier, tierScore, domain } = classifySourceTier(imgUrl, pageUrl);
    return {
      candidateId: `gcse-${Date.now()}-${idx}`,
      imageUrl: imgUrl,
      thumbnailUrl: String(it.image?.thumbnailLink || imgUrl),
      sourcePageUrl: pageUrl,
      sourceName: String(it.displayLink || domain),
      sourceDomain: domain,
      sourceTier: tier,
      title: String(it.title || query),
      width: Number(it.image?.width || 0),
      height: Number(it.image?.height || 0),
      license: 'Verify source license before commercial use',
      attribution: String(it.displayLink || domain),
      preScore: tierScore,
      providerUsed: 'google_custom_search',
    };
  });
}

async function searchWikimediaCommons(query: string): Promise<ImageSearchCandidate[]> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1200&format=json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'JHF-Laptop-Zone-ImageFinder/1.0 (https://jhflaptopzone.com)',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
    const out: ImageSearchCandidate[] = [];

    for (const p of pages as any[]) {
      const info = Array.isArray(p?.imageinfo) ? p.imageinfo[0] : null;
      const targetUrl = String(info?.thumburl || info?.url || '');
      if (!targetUrl) continue;
      if (!/^image\/(jpeg|jpg|png|webp)$/i.test(String(info.mime || ''))) continue;
      const meta = info.extmetadata || {};
      const license = String(meta.LicenseShortName?.value || 'CC / Wikimedia Commons').replace(/<[^>]+>/g, '');
      const artist = String(meta.Artist?.value || 'Wikimedia Commons Contributor').replace(/<[^>]+>/g, '').slice(0, 80);
      const { tier, tierScore, domain } = classifySourceTier(targetUrl, info.descriptionurl || targetUrl);
      out.push({
        candidateId: `wiki-${p.pageid}`,
        imageUrl: targetUrl,
        thumbnailUrl: targetUrl,
        sourcePageUrl: String(info.descriptionurl || targetUrl),
        sourceName: 'Wikimedia Commons',
        sourceDomain: domain,
        sourceTier: tier,
        title: String(p.title || query).replace(/^File:/i, '').replace(/\.[^.]+$/, ''),
        width: Number(info.thumbwidth || info.width || 0),
        height: Number(info.thumbheight || info.height || 0),
        license,
        attribution: artist || 'Wikimedia Commons',
        preScore: tierScore,
        providerUsed: 'wikimedia_commons',
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function searchLiveWebImages(query: string): Promise<ImageSearchCandidate[]> {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const out: ImageSearchCandidate[] = [];

    $('a.iusc').each((idx, el) => {
      if (out.length >= 16) return;
      const mRaw = $(el).attr('m');
      if (!mRaw) return;
      try {
        const meta = JSON.parse(mRaw);
        const imgUrl = String(meta.murl || '');
        const pageUrl = String(meta.purl || imgUrl);
        // Never fall back to search query for title so unrelated thumbnails cannot match query tokens
        const t = String(meta.t || $(el).attr('aria-label') || '').replace(/|/g, '').trim();
        if (!imgUrl || !/^https?:\/\//i.test(imgUrl)) return;
        if (isBlockedDomain(imgUrl) || isBlockedDomain(pageUrl)) return;

        // Try reading natural image dimensions from data attributes if available
        let w = 0;
        let h = 0;
        const sizeLabel = $(el).closest('.iuscp').find('.img_info span').text().trim();
        const dimMatch = sizeLabel.match(/(\d{3,4})\s*[x×]\s*(\d{3,4})/i);
        if (dimMatch) {
          w = parseInt(dimMatch[1], 10);
          h = parseInt(dimMatch[2], 10);
        }

        const { tier, tierScore, domain } = classifySourceTier(imgUrl, pageUrl);
        out.push({
          candidateId: `web-${Date.now()}-${idx}`,
          imageUrl: imgUrl,
          thumbnailUrl: meta.turl ? String(meta.turl) : imgUrl,
          sourcePageUrl: pageUrl,
          sourceName: domain,
          sourceDomain: domain,
          sourceTier: tier,
          title: t || `${domain} media`,
          width: w,
          height: h,
          license:
            tier === 'Official OEM'
              ? 'Manufacturer Product Media (Attribution Saved)'
              : 'External Source — Verify Usage Rights',
          attribution: domain,
          preScore: tierScore,
          providerUsed: 'live_web_image_index',
        });
      } catch {
        // Ignore malformed card metadata
      }
    });

    return out;
  } catch {
    return [];
  }
}

function hasExactRelevanceTokens(
  combinedTextLower: string,
  requested: { brand: string; exactModel: string }
): boolean {
  const brandLower = requested.brand.toLowerCase();
  const brandAliases: Record<string, string[]> = {
    apple: ['apple', 'macbook'],
    microsoft: ['microsoft', 'surface'],
    hp: ['hp', 'elitebook', 'probook', 'zbook', 'pavilion', 'envy', 'spectre', 'omnibook'],
    dell: ['dell', 'latitude', 'precision', 'xps', 'inspiron', 'vostro'],
    lenovo: ['lenovo', 'thinkpad', 'ideapad', 'thinkbook', 'yoga'],
  };
  const expectedBrandTokens = brandAliases[brandLower] || [brandLower];
  const hasBrandOrFamily = expectedBrandTokens.some((tok) => combinedTextLower.includes(tok));

  // Require primary alphanumeric model token (e.g., 5420, 840, t480, x1, e7470, 3120)
  const coreTokens = requested.exactModel
    .toLowerCase()
    .replace(/[-_/()]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !['laptop', 'notebook', 'gen', 'core', 'pro', 'book'].includes(t));

  const codeTokens = coreTokens.filter((t) => /\d/.test(t));
  if (codeTokens.length > 0) {
    const hasPrimaryCode = codeTokens.some((tok) => combinedTextLower.includes(tok));
    return hasBrandOrFamily && hasPrimaryCode;
  }

  return hasBrandOrFamily && coreTokens.some((tok) => combinedTextLower.includes(tok));
}

function rankAndFilterCandidates(
  rawCandidates: ImageSearchCandidate[],
  requested: { brand: string; exactModel: string; generation?: string },
  excludeUrls: Set<string>
): ImageSearchCandidate[] {
  const seenUrls = new Set<string>();
  const scored: ImageSearchCandidate[] = [];

  for (const c of rawCandidates) {
    if (!c.imageUrl || seenUrls.has(c.imageUrl) || excludeUrls.has(c.imageUrl)) continue;
    if (isBlockedDomain(c.imageUrl) || isBlockedDomain(c.sourcePageUrl)) continue;
    if (/\.(svg|gif|ico)(\?|$)/i.test(c.imageUrl)) continue;
    seenUrls.add(c.imageUrl);

    const combinedText = `${c.title} ${c.imageUrl} ${c.sourcePageUrl}`;
    const combinedLower = combinedText.toLowerCase();

    // Filter out totally off-topic thumbnails from web indexes unless scanned directly from OEM page
    if (
      c.providerUsed !== 'direct_page_scanner' &&
      !hasExactRelevanceTokens(combinedLower, requested)
    ) {
      continue;
    }

    const mismatchWarning = detectTextModelMismatch(requested, combinedText);

    let score = c.preScore;

    // Bonus for resolution >= 1000px
    if (c.width >= 1000 && c.height >= 700) score += 22;
    else if (c.width >= 800 && c.height >= 500) score += 12;
    else if (c.width > 0 && c.width < 450) score -= 25;

    // Bonus if exact model appears cleanly in title or URL
    const cleanModel = requested.exactModel.toLowerCase();
    if (combinedLower.includes(cleanModel)) score += 20;

    // Bonus for clean product keywords
    if (/front|official|studio|white|product|notebookcheck/i.test(combinedText)) score += 8;

    // Strong penalty for model mismatch warning
    if (mismatchWarning) score -= 45;

    scored.push({
      ...c,
      mismatchWarning,
      preScore: Math.max(0, Math.min(100, score)),
    });
  }

  return scored.sort((a, b) => b.preScore - a.preScore).slice(0, 12);
}

interface TaggedImageError extends Error {
  httpStatus?: number;
  code?: string;
  retryable?: boolean;
  isTimeout?: boolean;
}

function createTaggedError(
  message: string,
  opts?: { httpStatus?: number; code?: string; retryable?: boolean; isTimeout?: boolean }
): TaggedImageError {
  const err = new Error(message) as TaggedImageError;
  if (opts?.httpStatus !== undefined) err.httpStatus = opts.httpStatus;
  if (opts?.code !== undefined) err.code = opts.code;
  if (opts?.retryable !== undefined) err.retryable = opts.retryable;
  if (opts?.isTimeout !== undefined) err.isTimeout = opts.isTimeout;
  return err;
}

function inspectImageMagicBytes(buffer: Buffer): { valid: boolean; detectedFormat?: string; reason?: string } {
  if (buffer.length < 16) {
    return { valid: false, reason: 'Buffer too small for image header signature.' };
  }
  // Reject HTML / XML / SVG / JSON payloads disguised with wrong extensions
  const headText = buffer.subarray(0, 128).toString('utf8').trim().toLowerCase();
  if (
    headText.startsWith('<!doctype') ||
    headText.startsWith('<html') ||
    headText.startsWith('<svg') ||
    headText.startsWith('<?xml') ||
    headText.startsWith('{')
  ) {
    return { valid: false, reason: 'Downloaded payload is HTML/XML/SVG/JSON rather than a raster product photo.' };
  }

  // Reject GIFs (often low-res animated banners / tracking pixels)
  if (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a') {
    return { valid: false, detectedFormat: 'gif', reason: 'GIF images are not accepted for product verification.' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedFormat: 'jpeg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedFormat: 'png' };
  }
  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, detectedFormat: 'webp' };
  }
  // AVIF / HEIF: ....ftyp(avif|avis|heic|mif1)
  if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brandTag = buffer.subarray(8, 12).toString('ascii');
    if (['avif', 'avis', 'heic', 'mif1'].includes(brandTag)) {
      return { valid: true, detectedFormat: 'avif' };
    }
  }
  // BMP / TIFF fall back cleanly to Sharp metadata verification
  if ((buffer[0] === 0x42 && buffer[1] === 0x4d) || (buffer[0] === 0x49 && buffer[1] === 0x49) || (buffer[0] === 0x4d && buffer[1] === 0x4d)) {
    return { valid: true, detectedFormat: 'raster' };
  }

  return { valid: false, reason: 'Unrecognized or corrupted binary image header.' };
}

function isRetryableDownloadFailure(err: unknown): boolean {
  const e = err as TaggedImageError | undefined;
  if (!e) return false;
  if (e.retryable === false) return false;
  if (e.retryable === true || e.isTimeout) return true;
  if (typeof e.httpStatus === 'number') {
    return [408, 429, 500, 502, 503, 504].includes(e.httpStatus);
  }
  const msg = String(e.message || e.name || '').toLowerCase();
  return /timeout|timed out|abort|econnreset|etimedout|eai_again|enotfound|epipe|fetch failed|network|socket/.test(msg);
}

function isRetryableVisionFailure(err: unknown): { retryable: boolean; code: string; httpStatus: number } {
  const msg = err instanceof Error ? err.message : String(err || '');
  if (/API_KEY_INVALID|PERMISSION_DENIED|\b401\b|\b403\b/i.test(msg)) {
    return { retryable: false, code: 'GEMINI_AUTH_ERROR', httpStatus: 403 };
  }
  if (/GEMINI_KEY_MISSING/i.test(msg)) {
    return { retryable: false, code: 'GEMINI_KEY_MISSING', httpStatus: 503 };
  }
  if ((err as TaggedImageError)?.isTimeout || /timeout|timed out|aborted/i.test(msg)) {
    return { retryable: true, code: 'VISION_TIMEOUT', httpStatus: 504 };
  }
  if (/429|RESOURCE_EXHAUSTED|quota|rate limit/i.test(msg)) {
    return { retryable: true, code: 'VISION_RATE_LIMIT', httpStatus: 429 };
  }
  if (/500|502|503|504|UNAVAILABLE|INTERNAL|fetch failed|econnreset|etimedout|network/i.test(msg)) {
    return { retryable: true, code: 'VISION_TRANSIENT_ERROR', httpStatus: 502 };
  }
  return { retryable: false, code: 'VISION_ERROR', httpStatus: 502 };
}

async function fetchAndInspectImageBytes(
  imageUrl: string,
  onLog?: (stage: string, message: string) => void
): Promise<{
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  fileSizeKb: number;
  downloadMs: number;
}> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw createTaggedError('Invalid image URL format.', { code: 'INVALID_URL', retryable: false });
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw createTaggedError(`Unsupported image URL protocol "${parsedUrl.protocol}". Only http/https allowed.`, {
      code: 'UNSUPPORTED_PROTOCOL',
      retryable: false,
    });
  }

  const cfg = getVerificationConfig();
  const startedAt = Date.now();
  const isWikimedia = /wikimedia\.org|wikipedia\.org/i.test(imageUrl);
  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => {
    controller.abort(
      createTaggedError(`Image download timed out after ${cfg.downloadTimeoutMs}ms`, {
        code: 'DOWNLOAD_TIMEOUT',
        retryable: true,
        isTimeout: true,
      })
    );
  }, cfg.downloadTimeoutMs);

  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  try {
    onLog?.('download', `Streaming download started (timeout ${cfg.downloadTimeoutMs}ms, limit ${Math.round(cfg.maxDownloadBytes / (1024 * 1024))}MB)...`);
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': isWikimedia
          ? 'JHF-Laptop-Zone-ImageFinder/1.0 (https://jhflaptopzone.com)'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw createTaggedError(`Image URL returned HTTP ${res.status}`, {
        httpStatus: res.status,
        code: `HTTP_${res.status}`,
        retryable: [408, 429, 500, 502, 503, 504].includes(res.status),
      });
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (
      contentType.includes('text/html') ||
      contentType.includes('application/json') ||
      contentType.includes('text/plain') ||
      contentType.includes('image/svg+xml') ||
      contentType.includes('image/gif')
    ) {
      throw createTaggedError(`Source URL returned disallowed content-type "${contentType}" instead of a clean raster photo`, {
        code: 'INVALID_CONTENT_TYPE',
        retryable: false,
      });
    }

    const contentLenHeader = res.headers.get('content-length');
    if (contentLenHeader) {
      const declaredBytes = parseInt(contentLenHeader, 10);
      if (Number.isFinite(declaredBytes)) {
        if (declaredBytes > cfg.maxDownloadBytes) {
          throw createTaggedError(
            `Image content-length (${Math.round(declaredBytes / 1024)} KB) exceeds ${Math.round(cfg.maxDownloadBytes / 1024)} KB limit`,
            { code: 'FILE_TOO_LARGE', retryable: false }
          );
        }
        if (declaredBytes > 0 && declaredBytes < 1500) {
          throw createTaggedError(`Image content-length (${declaredBytes} bytes) is too small to be a valid product photo`, {
            code: 'FILE_TOO_SMALL',
            retryable: false,
          });
        }
      }
    }

    let buffer: Buffer;
    if (res.body && typeof res.body.getReader === 'function') {
      reader = res.body.getReader();
      const chunks: Buffer[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.byteLength > 0) {
          totalBytes += value.byteLength;
          if (totalBytes > cfg.maxDownloadBytes) {
            try {
              await reader.cancel('Exceeded max download bytes');
            } catch {
              // ignore reader cancel error
            }
            controller.abort();
            throw createTaggedError(
              `Image stream aborted: exceeded ${Math.round(cfg.maxDownloadBytes / 1024)} KB safety limit`,
              { code: 'FILE_TOO_LARGE', retryable: false }
            );
          }
          chunks.push(Buffer.from(value));
        }
      }
      buffer = Buffer.concat(chunks, totalBytes);
    } else {
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      if (buffer.length > cfg.maxDownloadBytes) {
        throw createTaggedError(
          `Image size (${Math.round(buffer.length / 1024)} KB) exceeds ${Math.round(cfg.maxDownloadBytes / 1024)} KB limit`,
          { code: 'FILE_TOO_LARGE', retryable: false }
        );
      }
    }

    if (buffer.length < 1500) {
      throw createTaggedError(`Downloaded file is too small (${buffer.length} bytes) or corrupted`, {
        code: 'FILE_TOO_SMALL',
        retryable: false,
      });
    }

    const magicCheck = inspectImageMagicBytes(buffer);
    if (!magicCheck.valid) {
      throw createTaggedError(magicCheck.reason || 'File failed magic-byte image validation.', {
        code: 'INVALID_IMAGE_FILE',
        retryable: false,
      });
    }

    const meta = await sharp(buffer).metadata();
    const width = meta.width || 0;
    const height = meta.height || 0;
    const allowedSharpFormats = new Set(['jpeg', 'png', 'webp', 'avif', 'tiff', 'heif']);
    if (!meta.format || !allowedSharpFormats.has(meta.format)) {
      throw createTaggedError(`Unsupported image format "${meta.format || 'unknown'}"`, {
        code: 'UNSUPPORTED_IMAGE_FORMAT',
        retryable: false,
      });
    }
    if (width < 200 || height < 150) {
      throw createTaggedError(`Image resolution too small (${width}x${height}; minimum 200x150 required)`, {
        code: 'RESOLUTION_TOO_SMALL',
        retryable: false,
      });
    }

    const downloadMs = Date.now() - startedAt;
    const fileSizeKb = Math.round(buffer.length / 1024);
    onLog?.('download', `Streamed & validated ${width}x${height} ${meta.format.toUpperCase()} (${fileSizeKb} KB) in ${downloadMs}ms.`);

    return {
      buffer,
      mimeType: `image/${meta.format}`,
      width,
      height,
      fileSizeKb,
      downloadMs,
    };
  } catch (err) {
    if (controller.signal.aborted && controller.signal.reason instanceof Error) {
      throw controller.signal.reason;
    }
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw createTaggedError(`Image download timed out after ${cfg.downloadTimeoutMs}ms`, {
        code: 'DOWNLOAD_TIMEOUT',
        retryable: true,
        isTimeout: true,
      });
    }
    throw err;
  } finally {
    clearTimeout(timeoutTimer);
    if (reader) {
      try {
        reader.releaseLock();
      } catch {
        // ignore lock release
      }
    }
  }
}

async function downloadImageWithRetries(
  imageUrl: string,
  maxRetries: number,
  onLog?: (stage: string, message: string) => void
) {
  let lastError: unknown;
  const totalAttempts = maxRetries + 1;
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      return await fetchAndInspectImageBytes(imageUrl, onLog);
    } catch (err) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : 'Download failed';
      const canRetry = isRetryableDownloadFailure(err) && attempt < totalAttempts;
      if (!canRetry) {
        throw err;
      }
      const backoffMs = 700 * Math.pow(2, attempt - 1);
      onLog?.('retry', `Download attempt ${attempt}/${totalAttempts} failed (${errMsg}). Retrying in ${backoffMs}ms...`);
      await sleep(backoffMs);
    }
  }
  throw lastError;
}

async function executeVerificationPipeline(params: {
  job: VerificationJobRecord;
}): Promise<{ job: VerificationJobRecord }> {
  const { job } = params;
  const cfg = getVerificationConfig();
  const pipelineStartedAt = Date.now();

  try {
    const ai = getGeminiClient();
    if (!ai) {
      throw createTaggedError(
        'GEMINI_API_KEY is not configured on the server. AI vision verification requires an active key in Settings > Secrets.',
        { code: 'GEMINI_KEY_MISSING', retryable: false }
      );
    }

    // 1. Check verification cache first
    const cacheHit = getCachedVerification({
      imageUrl: job.imageUrl,
      brand: job.brand,
      exactModel: job.exactModel,
      generation: job.generation,
    });
    if (cacheHit) {
      job.cached = true;
      job.status = cacheHit.jobStatus;
      job.completedAt = new Date().toISOString();
      job.durationMs = Date.now() - pipelineStartedAt;
      job.result = {
        ...cacheHit.result,
        cached: true,
        jobId: job.jobId,
        durationMs: job.durationMs,
      };
      appendJobLog(
        job,
        'cache',
        `Verification cache hit (${cacheHit.result.status}, ${cacheHit.result.confidence}% confidence) — reused cached result.`
      );
      return { job };
    }

    // 2. Download stage (streaming + timeouts + size limit + validation + retries)
    job.status = 'downloading';
    appendJobLog(job, 'downloading', `Fetching candidate image: ${job.imageUrl}`);

    const inspected = await downloadImageWithRetries(
      job.imageUrl,
      cfg.maxRetries,
      (stage, msg) => appendJobLog(job, stage, msg)
    );

    // 3. Resize before Vision to compact JPEG <= 896x896
    const resized = await sharp(inspected.buffer)
      .resize({
        width: cfg.visionMaxDim,
        height: cfg.visionMaxDim,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: cfg.visionJpegQuality })
      .toBuffer({ resolveWithObject: true });

    const visionPayloadKb = Math.max(1, Math.round(resized.data.length / 1024));
    const visionInputResolution = `${resized.info.width}x${resized.info.height}`;
    appendJobLog(
      job,
      'resize',
      `Resized ${inspected.width}x${inspected.height} (${inspected.fileSizeKb} KB) -> ${visionInputResolution} (${visionPayloadKb} KB JPEG) for Gemini Vision.`
    );

    // 4. Deterministic text/source audit
    const textMismatch = detectTextModelMismatch(
      { brand: job.brand, exactModel: job.exactModel, generation: job.generation },
      `${job.title} ${job.imageUrl} ${job.sourcePageUrl}`
    );
    if (textMismatch) {
      appendJobLog(job, 'audit', `Deterministic pre-audit flagged mismatch: ${textMismatch}`);
    }

    // 5. Gemini AI Vision Verification stage (timeout + ThinkingLevel.LOW + retries)
    job.status = 'verifying';
    const prompt = `You are a strict Laptop Hardware Identification & E-commerce Quality Auditor for JHF Laptop Zone.
Inspect this candidate image and verify whether it is an authentic, clean product photograph of the EXACT requested laptop model:

REQUESTED LAPTOP IDENTITY:
- Brand: ${job.brand}
- Series: ${job.series || 'N/A'}
- Exact Model: ${job.exactModel}
- Generation: ${job.generation || 'N/A'}

CANDIDATE METADATA:
- Source Title: ${job.title || 'Unknown'}
- Source Site: ${job.sourceName} (${job.sourcePageUrl})
- Original Resolution: ${inspected.width}x${inspected.height}

STRICT VERIFICATION RULES (ZERO GUESSING):
1. Do NOT approve just because the brand matches!
2. Inspect visible hardware design cues:
   - HP EliteBook 840 G3/G4 (silver/black keyboard deck with pointing stick & 2-button trackpad + discrete silver hinge bar) vs G5/G6 (angular aluminum wedge chassis, top speaker grill) vs G7/G8/G9 (narrow bezel, sleek rounded corner CNC aluminum, side speaker or thin top bezel).
   - Dell Latitude E5470/E7470 (matte black business chassis, dual trackpad buttons, blue/orange accent or E-series latch) vs 5480/7480/7490 vs 5400/7400 (compact narrow bezel matte/carbon) vs 5410/7410 vs 5420/7420 (2021 silver/gray 5420 or carbon/aluminum 7420 with wider clickpad).
   - Lenovo ThinkPad T460/T470/T480 (classic ThinkPad red TrackPoint, physical trackpad top buttons, hinge shape, T480 vs slim T480s vs T490/T14 speaker grill above keyboard).
   - MacBook, Acer, Asus, Surface, MSI, Toshiba, Fujitsu: verify exact silhouette, bezel thickness, logo, keyboard deck, hinge.
3. Reject if:
   - The image shows a different generation or sibling model (e.g. 840 G3 vs 840 G5/G6, 7490 vs 7480, T480 vs T480s/T490).
   - The image has watermarks, stock overlays, heavy promotional banner text, price tags, collages, or is an AI-generated render.
   - The laptop is barely visible or cropped.
4. Confidence scoring:
   - 85-100: Visual hardware cues + clean source metadata clearly match the EXACT model & generation cleanly on a neutral/professional background.
   - 60-84: Likely matches brand & family, but exact sub-generation is uncertain from the angle/metadata -> status MUST be "Verification Pending".
   - 0-59: Mismatch, generic placeholder, watermark, promotional ad, or wrong model -> status MUST be "Rejected" or "No Exact Match".`;

    const base64Image = resized.data.toString('base64');
    const totalVisionAttempts = cfg.maxRetries + 1;
    let parsed: any = null;
    let visionLatencyMs = 0;

    for (let attempt = 1; attempt <= totalVisionAttempts; attempt++) {
      job.attempt = attempt;
      job.maxAttempts = totalVisionAttempts;
      const attemptStart = Date.now();
      appendJobLog(
        job,
        'verifying',
        `Calling Gemini Vision (gemini-4-hydrogen, ThinkingLevel.LOW, attempt ${attempt}/${totalVisionAttempts}, timeout ${cfg.visionTimeoutMs}ms)...`
      );

      try {
        const aiResponse = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image,
                  },
                },
                { text: prompt },
              ],
            },
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              systemInstruction:
                'Be conservative and exact. Never fabricate high confidence when visual cues or metadata conflict with the requested laptop model.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  isVerifiedExactMatch: { type: Type.BOOLEAN },
                  detectedBrand: { type: Type.STRING },
                  detectedModel: { type: Type.STRING },
                  detectedGeneration: { type: Type.STRING },
                  confidence: { type: Type.INTEGER },
                  status: {
                    type: Type.STRING,
                    enum: ['Verified', 'Verification Pending', 'Rejected', 'No Exact Match'],
                  },
                  isWatermarkFree: { type: Type.BOOLEAN },
                  isCleanProductPhoto: { type: Type.BOOLEAN },
                  isAiGeneratedOrGraphic: { type: Type.BOOLEAN },
                  designCheckSummary: { type: Type.STRING },
                  rejectionReason: { type: Type.STRING },
                },
                required: [
                  'isVerifiedExactMatch',
                  'detectedBrand',
                  'detectedModel',
                  'confidence',
                  'status',
                  'isWatermarkFree',
                  'isCleanProductPhoto',
                  'isAiGeneratedOrGraphic',
                  'designCheckSummary',
                  'rejectionReason',
                ],
              },
            },
          }),
          cfg.visionTimeoutMs,
          `Gemini AI Vision timed out after ${cfg.visionTimeoutMs}ms`
        );

        const rawText = (aiResponse.text ?? '').trim();
        if (!rawText) {
          throw createTaggedError('Gemini Vision returned an empty response.', {
            code: 'VISION_EMPTY_RESPONSE',
            retryable: true,
          });
        }

        try {
          parsed = JSON.parse(rawText);
        } catch {
          throw createTaggedError('Gemini Vision returned malformed JSON output.', {
            code: 'VISION_INVALID_JSON',
            retryable: true,
          });
        }

        visionLatencyMs = Date.now() - attemptStart;
        appendJobLog(job, 'verifying', `Gemini Vision responded in ${visionLatencyMs}ms.`);
        break;
      } catch (err) {
        const failure = isRetryableVisionFailure(err);
        const errMsg = err instanceof Error ? err.message : 'Vision request error';
        const isTransient = failure.retryable || (err as TaggedImageError)?.retryable === true;

        if (isTransient && attempt < totalVisionAttempts) {
          const backoffMs = 900 * Math.pow(2, attempt - 1);
          appendJobLog(
            job,
            'retry',
            `Vision attempt ${attempt}/${totalVisionAttempts} failed (${errMsg}). Retrying in ${backoffMs}ms...`
          );
          await sleep(backoffMs);
          continue;
        }
        throw createTaggedError(errMsg, {
          code: failure.code,
          httpStatus: failure.httpStatus,
          retryable: false,
          isTimeout: (err as TaggedImageError)?.isTimeout,
        });
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      throw createTaggedError('Vision model failed to produce a structured verification verdict.', {
        code: 'VISION_NO_RESULT',
        httpStatus: 502,
      });
    }

    let confidence = Math.max(0, Math.min(100, Number(parsed.confidence || 0)));
    let status: VisionVerificationResult['status'] = parsed.status || 'Verification Pending';
    let isVerifiedExactMatch = Boolean(parsed.isVerifiedExactMatch);
    let rejectionReason = String(parsed.rejectionReason || '').trim();

    // Apply hard anti-mismatch guardrails regardless of optimistic AI output
    if (textMismatch) {
      status = 'Rejected';
      isVerifiedExactMatch = false;
      confidence = Math.min(confidence, 35);
      rejectionReason = textMismatch;
    } else if (parsed.isAiGeneratedOrGraphic || !parsed.isWatermarkFree) {
      status = 'Rejected';
      isVerifiedExactMatch = false;
      confidence = Math.min(confidence, 30);
      rejectionReason =
        rejectionReason || 'Rejected: watermark or AI-generated / promotional graphic detected.';
    } else if (!parsed.isCleanProductPhoto) {
      status = confidence >= 60 ? 'Verification Pending' : 'Rejected';
      isVerifiedExactMatch = false;
      rejectionReason = rejectionReason || 'Image does not show a clean standalone laptop product photo.';
    } else if (confidence < 82 || !isVerifiedExactMatch) {
      if (confidence >= 60) {
        status = 'Verification Pending';
        isVerifiedExactMatch = false;
        rejectionReason =
          rejectionReason || `Confidence (${confidence}%) below 82% strict verification threshold.`;
      } else {
        status = status === 'No Exact Match' ? 'No Exact Match' : 'Rejected';
        isVerifiedExactMatch = false;
      }
    } else {
      status = 'Verified';
      isVerifiedExactMatch = true;
    }

    const totalDurationMs = Date.now() - pipelineStartedAt;
    const jobStatus: 'verified' | 'rejected' =
      status === 'Verified' && isVerifiedExactMatch ? 'verified' : 'rejected';

    const result: VisionVerificationResult = {
      success: true,
      status,
      isVerifiedExactMatch,
      confidence,
      detectedBrand: String(parsed.detectedBrand || job.brand),
      detectedModel: String(parsed.detectedModel || job.exactModel),
      detectedGeneration: String(parsed.detectedGeneration || job.generation || ''),
      isWatermarkFree: Boolean(parsed.isWatermarkFree),
      isCleanProductPhoto: Boolean(parsed.isCleanProductPhoto),
      isAiGeneratedOrGraphic: Boolean(parsed.isAiGeneratedOrGraphic),
      actualWidth: inspected.width,
      actualHeight: inspected.height,
      actualResolution: `${inspected.width}x${inspected.height}`,
      visionInputResolution,
      visionInputSizeKb: visionPayloadKb,
      mimeType: inspected.mimeType,
      fileSizeKb: inspected.fileSizeKb,
      designCheckSummary: String(parsed.designCheckSummary || ''),
      rejectionReason,
      modelUsed: 'gemini-4-hydrogen',
      cached: false,
      jobId: job.jobId,
      durationMs: totalDurationMs,
    };

    job.status = jobStatus;
    job.completedAt = new Date().toISOString();
    job.durationMs = totalDurationMs;
    job.result = result;
    appendJobLog(
      job,
      jobStatus,
      jobStatus === 'verified'
        ? `Exact match VERIFIED (${confidence}% confidence) — ${result.detectedBrand} ${result.detectedModel} approved for import in ${totalDurationMs}ms.`
        : `Verification outcome "${status}" (${confidence}% confidence) — job marked ${jobStatus}: ${rejectionReason || 'did not pass strict verification.'}`
    );

    // Cache completed verified / rejected outcomes (NEVER transient failed errors)
    storeVerificationCache(
      {
        imageUrl: job.imageUrl,
        brand: job.brand,
        exactModel: job.exactModel,
        generation: job.generation,
      },
      jobStatus,
      result
    );

    return { job };
  } catch (err) {
    const tagged = err as TaggedImageError;
    const msg = err instanceof Error ? err.message : 'Verification pipeline failed';
    const errCode = tagged?.code || (tagged?.isTimeout ? 'VERIFICATION_TIMEOUT' : 'VERIFICATION_FAILED');
    job.status = 'failed';
    job.error = msg;
    job.errorCode = errCode;
    job.completedAt = new Date().toISOString();
    job.durationMs = Date.now() - pipelineStartedAt;
    // Never mark an image as verified when download or Vision analysis fails or times out
    job.result = undefined;
    appendJobLog(job, 'failed', `Verification failed (${errCode}): ${msg}`);
    return { job };
  }
}

function createVerificationJob(input: {
  brand: string;
  series?: string;
  exactModel: string;
  generation?: string;
  candidate: {
    imageUrl: string;
    sourcePageUrl?: string;
    sourceName?: string;
    title?: string;
  };
}): VerificationJobRecord {
  const cfg = getVerificationConfig();
  const now = new Date().toISOString();
  const jobId = `vjob-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const sourcePageUrl = String(input.candidate.sourcePageUrl || input.candidate.imageUrl).trim();
  const job: VerificationJobRecord = {
    jobId,
    status: 'pending',
    brand: input.brand.trim(),
    series: String(input.series || '').trim(),
    exactModel: input.exactModel.trim(),
    generation: String(input.generation || '').trim(),
    imageUrl: String(input.candidate.imageUrl || '').trim(),
    sourcePageUrl,
    sourceName: String(input.candidate.sourceName || extractDomain(sourcePageUrl)).trim(),
    title: String(input.candidate.title || '').trim(),
    attempt: 0,
    maxAttempts: cfg.maxRetries + 1,
    cached: false,
    createdAt: now,
    updatedAt: now,
    logs: [],
  };
  appendJobLog(job, 'pending', `Queued verification job for ${job.brand} ${job.exactModel}.`);
  pruneJobsMap();
  verificationJobs.set(jobId, job);
  return job;
}

export function registerLaptopImageRoutes(app: Express) {
  ensureUploadsDir();

  // Provider & AI Vision configuration status (never leaks credentials)
  app.get('/api/images/provider-status', (_req: Request, res: Response) => {
    const provider = determineActiveProvider();
    const serpKey = process.env.SERPAPI_API_KEY?.trim();
    const hasSerpKey = Boolean(serpKey && serpKey !== 'YOUR_SERPAPI_API_KEY' && serpKey !== 'MY_SERPAPI_API_KEY');
    const cfg = getVerificationConfig();
    res.json({
      ok: true,
      activeProvider: provider,
      searchEngine: provider === 'serpapi' ? 'google_images' : provider,
      serpapiOnlyMode: provider === 'serpapi',
      unusedProvidersOptional: true,
      geminiVisionConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      visionModel: 'gemini-4-hydrogen',
      storageDir: '/uploads/laptop-images',
      verificationConfig: {
        downloadTimeoutMs: cfg.downloadTimeoutMs,
        maxDownloadBytes: cfg.maxDownloadBytes,
        visionTimeoutMs: cfg.visionTimeoutMs,
        maxRetries: cfg.maxRetries,
        cacheTtlMs: cfg.cacheTtlMs,
        visionResizeMaxDim: cfg.visionMaxDim,
      },
      cacheEntriesCount: verificationCache.size,
      configuredApiKeys: {
        serpapi: hasSerpKey,
        bingApi: Boolean(process.env.BING_IMAGE_SEARCH_KEY?.trim()),
        googleCse: Boolean(process.env.GOOGLE_CSE_KEY?.trim() && process.env.GOOGLE_CSE_CX?.trim()),
      },
    });
  });

  // Test Image Search Connection Endpoint (Default query: "HP EliteBook 840 G6 official product image")
  app.post('/api/images/test-search', async (req: Request, res: Response) => {
    const testQuery =
      String(req.body?.query || '').trim() || 'HP EliteBook 840 G6 official product image';
    const provider = determineActiveProvider();

    try {
      const serpRes = await searchViaSerpApi(testQuery);
      const ranked = rankAndFilterCandidates(
        serpRes.candidates,
        { brand: 'HP', exactModel: 'EliteBook 840 G6', generation: '8th Gen' },
        new Set<string>()
      );

      res.json({
        success: true,
        provider: 'serpapi',
        engine: 'google_images',
        testQuery,
        rawCount: serpRes.candidates.length,
        rankedCount: ranked.length,
        searchMetadata: serpRes.searchMetadata || null,
        candidates: ranked.slice(0, 6),
        message: `Connected to SerpAPI Google Images successfully. Returned ${serpRes.candidates.length} image results (${ranked.length} clean exact-model candidates).`,
      });
    } catch (error) {
      if (error instanceof SerpApiProviderError) {
        res.status(error.httpStatus).json({
          success: false,
          provider,
          engine: 'google_images',
          testQuery,
          errorCode: error.code,
          message: error.message,
          candidates: [],
        });
        return;
      }
      res.status(502).json({
        success: false,
        provider,
        engine: 'google_images',
        testQuery,
        errorCode: 'SERPAPI_ERROR',
        message: error instanceof Error ? error.message : 'SerpAPI connection test failed.',
        candidates: [],
      });
    }
  });

  // Step 2: Search exact model images via SerpAPI Google Images (engine=google_images)
  app.post('/api/images/search', async (req: Request, res: Response) => {
    const brand = String(req.body?.brand || '').trim();
    const series = String(req.body?.series || '').trim();
    const exactModel = String(req.body?.exactModel || '').trim();
    const generation = String(req.body?.generation || '').trim();
    const excludeUrls = new Set<string>(
      Array.isArray(req.body?.excludeUrls) ? req.body.excludeUrls.map((u: any) => String(u)) : []
    );

    if (!brand || !exactModel) {
      res.status(400).json({
        success: false,
        message: 'Both brand and exactModel are required for exact model search.',
        candidates: [],
      });
      return;
    }

    const queries = buildPriorityQueries({ brand, series, exactModel, generation });
    const provider = determineActiveProvider();

    try {
      let collected: ImageSearchCandidate[] = [];
      let searchMetadata: Record<string, any> | undefined;

      if (provider === 'serpapi') {
        const serpRes = await searchViaSerpApi(queries[0]);
        collected = serpRes.candidates;
        searchMetadata = serpRes.searchMetadata;
      } else if (provider === 'bing') {
        collected = await searchViaAzureBing(queries[0]);
      } else if (provider === 'google_cse') {
        collected = await searchViaGoogleCse(queries[0]);
      } else {
        const fullPrefix = exactModel.toLowerCase().startsWith(brand.toLowerCase())
          ? exactModel
          : `${brand} ${exactModel}`;
        const [wiki, webPrimary, webSecondary] = await Promise.all([
          searchWikimediaCommons(fullPrefix),
          searchLiveWebImages(queries[0]),
          searchLiveWebImages(queries[1]),
        ]);
        collected = [...wiki, ...webPrimary, ...webSecondary];
      }

      const ranked = rankAndFilterCandidates(collected, { brand, exactModel, generation }, excludeUrls);

      res.json({
        success: true,
        provider,
        engine: provider === 'serpapi' ? 'google_images' : provider,
        queriesUsed: queries,
        totalRawFound: collected.length,
        searchMetadata,
        candidates: ranked,
      });
    } catch (error) {
      if (error instanceof SerpApiProviderError) {
        res.status(error.httpStatus).json({
          success: false,
          provider: 'serpapi',
          errorCode: error.code,
          queriesUsed: queries,
          message: error.message,
          candidates: [],
        });
        return;
      }
      res.status(502).json({
        success: false,
        provider,
        errorCode: 'PROVIDER_ERROR',
        queriesUsed: queries,
        message: error instanceof Error ? error.message : 'Image search provider error',
        candidates: [],
      });
    }
  });

  // Step 3A: Start Asynchronous Verification Job (prevents long-lived HTTP request timeouts)
  app.post('/api/images/verify/start', async (req: Request, res: Response) => {
    const brand = String(req.body?.brand || '').trim();
    const series = String(req.body?.series || '').trim();
    const exactModel = String(req.body?.exactModel || '').trim();
    const generation = String(req.body?.generation || '').trim();
    const candidate = req.body?.candidate || {};
    const imageUrl = String(candidate.imageUrl || req.body?.imageUrl || '').trim();

    if (!brand || !exactModel || !imageUrl) {
      res.status(400).json({
        success: false,
        message: 'brand, exactModel, and candidate.imageUrl are required to start verification.',
      });
      return;
    }

    if (!getGeminiClient()) {
      res.status(503).json({
        success: false,
        code: 'GEMINI_KEY_MISSING',
        message:
          'GEMINI_API_KEY is not configured on the server. AI vision verification requires an active key in Settings > Secrets.',
      });
      return;
    }

    const job = createVerificationJob({
      brand,
      series,
      exactModel,
      generation,
      candidate: {
        imageUrl,
        sourcePageUrl: candidate.sourcePageUrl,
        sourceName: candidate.sourceName,
        title: candidate.title,
      },
    });

    // Fast-path synchronous resolve when exact URL+model combination is already cached
    const cached = getCachedVerification({ imageUrl, brand, exactModel, generation });
    if (cached) {
      await executeVerificationPipeline({ job });
      res.status(200).json({
        success: true,
        jobId: job.jobId,
        status: job.status,
        attempt: job.attempt,
        maxAttempts: job.maxAttempts,
        cached: true,
        logs: job.logs,
        result: job.result,
      });
      return;
    }

    // Trigger asynchronous background pipeline without holding the HTTP request open
    setImmediate(() => {
      void executeVerificationPipeline({ job });
    });

    res.status(202).json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      attempt: job.attempt,
      maxAttempts: job.maxAttempts,
      cached: false,
      logs: job.logs,
    });
  });

  // Step 3B: Poll Asynchronous Verification Job Status & Detailed Logs
  app.get('/api/images/verify/status/:jobId', (req: Request, res: Response) => {
    const jobId = String(req.params.jobId || '').trim();
    const job = verificationJobs.get(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        code: 'JOB_NOT_FOUND',
        message: `Verification job "${jobId}" was not found or has expired.`,
      });
      return;
    }

    res.json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      brand: job.brand,
      exactModel: job.exactModel,
      generation: job.generation,
      imageUrl: job.imageUrl,
      attempt: job.attempt,
      maxAttempts: job.maxAttempts,
      cached: job.cached,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
      durationMs: job.durationMs,
      logs: job.logs,
      result: job.result,
      error: job.error,
      errorCode: job.errorCode,
    });
  });

  // Step 3C: Inspect Recent Verification Jobs, Errors, and Cache Stats
  app.get('/api/images/verify/logs', (_req: Request, res: Response) => {
    const recentJobs = Array.from(verificationJobs.values())
      .slice(-50)
      .reverse()
      .map((j) => ({
        jobId: j.jobId,
        status: j.status,
        brand: j.brand,
        exactModel: j.exactModel,
        generation: j.generation,
        imageUrl: j.imageUrl,
        attempt: j.attempt,
        maxAttempts: j.maxAttempts,
        cached: j.cached,
        durationMs: j.durationMs,
        createdAt: j.createdAt,
        completedAt: j.completedAt,
        confidence: j.result?.confidence,
        visionStatus: j.result?.status,
        error: j.error,
        errorCode: j.errorCode,
        logs: j.logs,
      }));

    res.json({
      success: true,
      cacheSize: verificationCache.size,
      totalJobsTracked: verificationJobs.size,
      jobs: recentJobs,
    });
  });

  // Step 3 (Backwards-compatible direct endpoint using the same cached/retrying/streaming pipeline)
  app.post('/api/images/verify', async (req: Request, res: Response) => {
    const brand = String(req.body?.brand || '').trim();
    const series = String(req.body?.series || '').trim();
    const exactModel = String(req.body?.exactModel || '').trim();
    const generation = String(req.body?.generation || '').trim();
    const candidate = req.body?.candidate || {};
    const imageUrl = String(candidate.imageUrl || req.body?.imageUrl || '').trim();

    if (!brand || !exactModel || !imageUrl) {
      res.status(400).json({
        success: false,
        message: 'brand, exactModel, and candidate.imageUrl are required for verification.',
      });
      return;
    }

    if (!getGeminiClient()) {
      res.status(503).json({
        success: false,
        code: 'GEMINI_KEY_MISSING',
        message:
          'GEMINI_API_KEY is not configured on the server. AI vision verification requires an active key in Settings > Secrets.',
      });
      return;
    }

    const job = createVerificationJob({
      brand,
      series,
      exactModel,
      generation,
      candidate: {
        imageUrl,
        sourcePageUrl: candidate.sourcePageUrl,
        sourceName: candidate.sourceName,
        title: candidate.title,
      },
    });

    await executeVerificationPipeline({ job });

    if (job.status === 'failed' || !job.result) {
      const httpCode =
        job.errorCode === 'GEMINI_AUTH_ERROR'
          ? 403
          : job.errorCode === 'GEMINI_KEY_MISSING'
          ? 503
          : job.errorCode === 'VISION_RATE_LIMIT'
          ? 429
          : job.errorCode === 'VISION_TIMEOUT' || job.errorCode === 'DOWNLOAD_TIMEOUT'
          ? 504
          : 502;
      res.status(httpCode).json({
        success: false,
        jobId: job.jobId,
        jobStatus: job.status,
        status: 'No Exact Match',
        isVerifiedExactMatch: false,
        confidence: 0,
        code: job.errorCode || 'VERIFICATION_FAILED',
        message: job.error || 'Verification failed.',
        rejectionReason: job.error || 'Verification failed.',
        logs: job.logs,
      });
      return;
    }

    res.json({
      ...job.result,
      jobId: job.jobId,
      jobStatus: job.status,
      cached: job.cached,
      logs: job.logs,
    });
  });

  // Step 5: Strictly Verified-Only Image Import -> Download, validate, convert to WebP + thumbnail
  app.post('/api/images/import', async (req: Request, res: Response) => {
    const productId = String(req.body?.productId || '').trim();
    const brand = String(req.body?.brand || '').trim();
    const exactModel = String(req.body?.exactModel || '').trim();
    const generation = String(req.body?.generation || '').trim();
    const imageUrl = String(req.body?.imageUrl || '').trim();
    const verificationJobId = String(req.body?.verificationJobId || '').trim();

    if (!productId || !exactModel || !imageUrl) {
      res.status(400).json({
        success: false,
        message: 'productId, exactModel, and imageUrl are required.',
      });
      return;
    }

    // Strict Verification Gate: NEVER publish or import an unverified image
    let verifiedProof: { confidence: number; jobId?: string; summary: string } | null = null;

    if (verificationJobId) {
      const job = verificationJobs.get(verificationJobId);
      if (
        job &&
        job.status === 'verified' &&
        job.result?.isVerifiedExactMatch === true &&
        job.result?.status === 'Verified' &&
        job.imageUrl === imageUrl.trim() &&
        job.exactModel.toLowerCase() === exactModel.toLowerCase()
      ) {
        verifiedProof = {
          confidence: job.result.confidence,
          jobId: job.jobId,
          summary: job.result.designCheckSummary,
        };
      }
    }

    if (!verifiedProof) {
      const cacheMatch = findVerifiedCacheMatch(imageUrl, exactModel, brand || undefined, generation || undefined);
      if (cacheMatch) {
        verifiedProof = {
          confidence: cacheMatch.result.confidence,
          summary: cacheMatch.result.designCheckSummary,
        };
      }
    }

    if (!verifiedProof) {
      res.status(400).json({
        success: false,
        code: 'UNVERIFIED_IMAGE_BLOCKED',
        message:
          'Verification required: Only AI-verified exact-model images (status "verified") can be approved and published to product inventory.',
      });
      return;
    }

    try {
      ensureUploadsDir();
      const cfg = getVerificationConfig();
      const inspected = await downloadImageWithRetries(imageUrl, cfg.maxRetries);

      const safeSlug = `${productId}-${exactModel}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 64);
      const stamp = Date.now();
      const mainFileName = `${safeSlug}-${stamp}.webp`;
      const thumbFileName = `${safeSlug}-${stamp}-thumb.webp`;

      const mainDiskPath = path.join(PUBLIC_UPLOADS_DIR, mainFileName);
      const thumbDiskPath = path.join(PUBLIC_UPLOADS_DIR, thumbFileName);

      // Convert main image to high-quality optimized WebP (up to 1400px)
      const mainInfo = await sharp(inspected.buffer)
        .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(mainDiskPath);

      // Generate crisp 480px catalog thumbnail WebP
      await sharp(inspected.buffer)
        .resize({ width: 480, height: 360, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(thumbDiskPath);

      res.json({
        success: true,
        mainImageUrl: `/uploads/laptop-images/${mainFileName}`,
        imageStoragePath: `/uploads/laptop-images/${mainFileName}`,
        imageThumbnailPath: `/uploads/laptop-images/${thumbFileName}`,
        imageResolution: `${mainInfo.width}x${mainInfo.height}`,
        fileSizeKb: Math.round(mainInfo.size / 1024),
        sourceFormat: inspected.mimeType,
        verifiedJobId: verifiedProof.jobId,
        verifiedConfidence: verifiedProof.confidence,
        importedAt: new Date().toISOString(),
      });
    } catch (error) {
      res.status(422).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import and optimize image',
      });
    }
  });

  // Scan an official OEM or retailer product page URL for high-res product images
  app.post('/api/images/scan-page', async (req: Request, res: Response) => {
    const pageUrl = String(req.body?.pageUrl || '').trim();
    const brand = String(req.body?.brand || '').trim();
    const exactModel = String(req.body?.exactModel || '').trim();
    const generation = String(req.body?.generation || '').trim();

    if (!/^https?:\/\//i.test(pageUrl)) {
      res.status(400).json({ success: false, message: 'Provide a valid http/https product page URL.', candidates: [] });
      return;
    }

    try {
      const upstream = await fetch(pageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!upstream.ok) {
        res.status(200).json({
          success: false,
          message: `Source page responded with HTTP ${upstream.status}`,
          candidates: [],
        });
        return;
      }

      const html = await upstream.text();
      const $ = cheerio.load(html);
      const pageTitle = $('title').text().trim() || `${brand} ${exactModel}`;
      const rawUrls = new Set<string>();

      const addUrl = (u?: string) => {
        if (!u) return;
        try {
          const abs = new URL(u.trim(), pageUrl).toString();
          if (/^https?:\/\//i.test(abs) && !/\.(svg|gif|ico)(\?|$)/i.test(abs)) {
            rawUrls.add(abs);
          }
        } catch {
          // ignore malformed URL
        }
      };

      addUrl($('meta[property="og:image"]').attr('content'));
      addUrl($('meta[name="twitter:image"]').attr('content'));
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const j = JSON.parse($(el).html() || '{}');
          const imgs = Array.isArray(j.image) ? j.image : j.image ? [j.image] : [];
          imgs.forEach((im: any) => addUrl(typeof im === 'string' ? im : im?.url));
        } catch {
          // ignore
        }
      });
      $('img').each((_, img) => {
        const src = $(img).attr('data-src') || $(img).attr('src');
        if (src && !/logo|icon|sprite|avatar|badge|flag/i.test(src)) {
          addUrl(src);
        }
      });

      const candidates: ImageSearchCandidate[] = [];
      let idx = 0;
      for (const imgUrl of rawUrls) {
        if (idx >= 12) break;
        const { tier, tierScore, domain } = classifySourceTier(imgUrl, pageUrl);
        candidates.push({
          candidateId: `page-${Date.now()}-${idx++}`,
          imageUrl: imgUrl,
          thumbnailUrl: imgUrl,
          sourcePageUrl: pageUrl,
          sourceName: domain,
          sourceDomain: domain,
          sourceTier: tier,
          title: pageTitle,
          width: 0,
          height: 0,
          license:
            tier === 'Official OEM'
              ? 'Official Manufacturer Product Page'
              : 'Verify source license before commercial use',
          attribution: domain,
          preScore: tierScore + 15,
          providerUsed: 'direct_page_scanner',
        });
      }

      const ranked = rankAndFilterCandidates(
        candidates,
        { brand, exactModel, generation },
        new Set<string>()
      );

      res.json({
        success: true,
        pageTitle,
        candidates: ranked,
      });
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unable to scan page URL',
        candidates: [],
      });
    }
  });
}
