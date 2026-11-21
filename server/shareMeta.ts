import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Request } from 'express';
import {
  LAPTOPS_DATA,
  SOFTWARE_LIBRARY,
  TESTING_TOOLS,
  OS_ISOS,
  BRAND_LAPTOP_IMAGES,
  STORE_INFO,
} from '../src/data/jhfData.ts';
import { getDetailedSpecsForLaptop } from '../src/data/specsHelper.ts';
import {
  parseShareRoute,
  matchesShareSlug,
  type ShareItemType,
} from '../src/utils/shareLinks.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

interface FirebaseConfigLite {
  projectId?: string;
  firestoreDatabaseId?: string;
}

let firebaseConfigCache: FirebaseConfigLite | null = null;
function getFirebaseConfig(): FirebaseConfigLite {
  if (firebaseConfigCache) return firebaseConfigCache;
  try {
    const raw = fs.readFileSync(path.join(ROOT_DIR, 'firebase-applet-config.json'), 'utf8');
    firebaseConfigCache = JSON.parse(raw) as FirebaseConfigLite;
  } catch {
    firebaseConfigCache = {};
  }
  return firebaseConfigCache;
}

function decodeFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return undefined;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    return Array.isArray(val.arrayValue?.values)
      ? val.arrayValue.values.map(decodeFirestoreValue)
      : [];
  }
  if ('mapValue' in val) {
    const fields = val.mapValue?.fields || {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return undefined;
}

const firestoreCollectionCache = new Map<string, { fetchedAt: number; items: any[] }>();
const CACHE_TTL_MS = 60_000;

async function fetchPublicFirestoreCollection(collectionName: string): Promise<any[]> {
  const cached = firestoreCollectionCache.get(collectionName);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.items;
  }

  const cfg = getFirebaseConfig();
  if (!cfg.projectId || !cfg.firestoreDatabaseId) {
    return [];
  }

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    cfg.projectId
  )}/databases/${encodeURIComponent(cfg.firestoreDatabaseId)}/documents/${encodeURIComponent(
    collectionName
  )}?pageSize=300`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2200);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) {
      return cached?.items || [];
    }
    const json: any = await resp.json();
    const docs = Array.isArray(json.documents) ? json.documents : [];
    const items = docs.map((d: any) => {
      const id = String(d.name || '').split('/').pop() || '';
      const out: Record<string, any> = { id };
      const fields = d.fields || {};
      for (const [k, v] of Object.entries(fields)) {
        out[k] = decodeFirestoreValue(v);
      }
      if (!out.id) out.id = id;
      return out;
    });
    firestoreCollectionCache.set(collectionName, { fetchedAt: Date.now(), items });
    return items;
  } catch {
    return cached?.items || [];
  } finally {
    clearTimeout(timer);
  }
}

export function getRequestOrigin(req: Request): string {
  const fwdProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
  const proto = fwdProto || req.protocol || 'https';
  const fwdHost = (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim();
  const host = fwdHost || req.get('host') || STORE_INFO.domain;
  return `${proto}://${host}`.replace(/\/+$/, '');
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveBrandFallbackImage(brandOrTitle: string | undefined, origin: string): string {
  const text = (brandOrTitle || '').toLowerCase();
  let rel: string = BRAND_LAPTOP_IMAGES.Lenovo;
  if (text.includes('hp') || text.includes('elitebook') || text.includes('probook')) {
    rel = BRAND_LAPTOP_IMAGES.HP;
  } else if (text.includes('dell') || text.includes('latitude')) {
    rel = BRAND_LAPTOP_IMAGES.Dell;
  }
  return origin ? `${origin}${rel}` : rel;
}

function resolveAbsoluteImageUrl(rawImg: string | undefined, origin: string, brandHint?: string): string {
  const trimmed = (rawImg || '').trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return origin ? `${origin}${trimmed}` : trimmed;
  }
  return resolveBrandFallbackImage(brandHint, origin);
}

interface ResolvedShareMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'product' | 'website';
  price?: number;
  brand?: string;
}

async function resolveShareMeta(
  shareType: ShareItemType,
  slug: string,
  origin: string,
  fullPathWithQuery: string
): Promise<ResolvedShareMeta | null> {
  const canonicalUrl = `${origin}${fullPathWithQuery}`;

  if (shareType === 'laptop') {
    const [fsProducts, fsLaptops] = await Promise.all([
      fetchPublicFirestoreCollection('products'),
      fetchPublicFirestoreCollection('laptops'),
    ]);

    const normalizedFsProducts = fsProducts
      .filter((p) => !p.isDeleted && p.status !== 'draft' && p.status !== 'archived' && p.status !== 'out_of_stock')
      .map((p) => ({
        id: p.id,
        sku: p.sku || 'JHF-LP',
        title: p.name || p.title || 'Business Laptop',
        brand: (p.brand || 'Laptop') as 'Lenovo' | 'HP' | 'Dell',
        series: p.model || p.category || 'Business Series',
        specs: `${p.processor || ''} • ${p.ram || ''} • ${p.storage || ''} • ${p.display || ''} • ${p.graphics || ''}`
          .replace(/\s*•\s*•\s*/g, ' • ')
          .replace(/^\s*•\s*|\s*•\s*$/g, ''),
        numericPrice: Number(p.discountPrice || p.sellingPrice || 0),
        mrpPrice: Number(p.marketPrice || p.sellingPrice || 0),
        price: Number(p.discountPrice || p.sellingPrice || 0) > 0
          ? `৳ ${Number(p.discountPrice || p.sellingPrice).toLocaleString()}`
          : 'Call for Price',
        tag: p.condition || 'Dubai Grade A++',
        image: (Array.isArray(p.images) && p.images[0]) || p.image || '',
        warranty: p.warranty || '30 Days Replacement + 5 Years Free Service',
      }));

    const mergedPool: any[] = [
      ...normalizedFsProducts,
      ...fsLaptops.filter((l) => !l.isDeleted),
      ...LAPTOPS_DATA,
    ];

    const matched = mergedPool.find((item) => matchesShareSlug(item, slug));
    if (!matched) return null;

    const itemTitle = matched.title || matched.name || 'Laptop';
    const numericVal =
      typeof matched.numericPrice === 'number'
        ? matched.numericPrice
        : parseInt(String(matched.price || '').replace(/[^0-9]/g, ''), 10) || 0;
    const priceLabel = numericVal > 0 ? `৳ ${numericVal.toLocaleString()}` : 'Call for Price';

    const detailed = getDetailedSpecsForLaptop({
      id: matched.id || 'laptop',
      title: itemTitle,
      brand: (matched.brand || 'Lenovo') as 'Lenovo' | 'HP' | 'Dell',
      series: matched.series || 'Business Series',
      specs: matched.specs || '',
      price: priceLabel,
      tag: matched.tag || '100% Tested',
      image: matched.image || '',
    });

    const summarySpecs = [
      `Price: ${priceLabel}`,
      detailed.processorType,
      `RAM: ${detailed.ram}`,
      `SSD: ${detailed.hardDisk}`,
      `Display: ${detailed.screenSize}`,
      `Battery: ${detailed.battery}`,
      `Warranty: ${matched.warranty || detailed.replacementGuarantee}`,
    ]
      .filter(Boolean)
      .join(' | ');

    return {
      title: `${itemTitle} (${priceLabel}) | JHF Laptop Zone`,
      description: summarySpecs.slice(0, 300),
      image: resolveAbsoluteImageUrl(matched.image, origin, `${matched.brand || ''} ${itemTitle}`),
      url: canonicalUrl,
      type: 'product',
      price: numericVal > 0 ? numericVal : undefined,
      brand: matched.brand || 'Laptop',
    };
  }

  if (shareType === 'recondition') {
    const fsRecond = await fetchPublicFirestoreCollection('reconditionLaptops');
    const matched = fsRecond.find((l) => !l.isDeleted && l.status !== 'trash' && matchesShareSlug(l, slug));
    if (!matched) return null;

    const priceVal = Number(matched.offerPrice || matched.sellPrice || 0);
    const priceLabel = priceVal > 0 ? `৳ ${priceVal.toLocaleString()}` : 'Call for Price';
    const rawImg = Array.isArray(matched.images) ? matched.images[0] : matched.image;

    const summarySpecs = [
      `Price: ${priceLabel}`,
      matched.physicalCondition,
      matched.processor,
      `${matched.ram || ''} • ${matched.storage || ''}`,
      matched.display,
      matched.batteryBackup ? `Battery: ${matched.batteryBackup}` : '',
      matched.warranty || '15 Days Replacement + 2 Years Free Service Warranty',
    ]
      .filter(Boolean)
      .join(' | ');

    return {
      title: `${matched.title} (${priceLabel}) | JHF Recondition Zone`,
      description: summarySpecs.slice(0, 300),
      image: resolveAbsoluteImageUrl(rawImg, origin, `${matched.brand || ''} ${matched.title || ''}`),
      url: canonicalUrl,
      type: 'product',
      price: priceVal > 0 ? priceVal : undefined,
      brand: matched.brand || 'Laptop',
    };
  }

  if (shareType === 'software') {
    const fsSoftware = await fetchPublicFirestoreCollection('software');
    const matched = [...fsSoftware, ...SOFTWARE_LIBRARY].find((item) => matchesShareSlug(item, slug));
    if (!matched) return null;

    return {
      title: `${matched.title} — Free Download | JHF Software Zone`,
      description: [matched.category, matched.source, matched.size, matched.version, matched.description]
        .filter(Boolean)
        .join(' • ')
        .slice(0, 280),
      image: resolveAbsoluteImageUrl(matched.image, origin, 'Lenovo'),
      url: canonicalUrl,
      type: 'website',
    };
  }

  if (shareType === 'windows') {
    const fsOs = await fetchPublicFirestoreCollection('operatingSystems');
    const matched = [...fsOs, ...OS_ISOS].find((item) => matchesShareSlug(item, slug));
    if (!matched) return null;

    return {
      title: `${matched.title} — Windows & OS Zone | JHF Laptop Zone`,
      description: [matched.category, matched.source, matched.size, matched.version, matched.description]
        .filter(Boolean)
        .join(' • ')
        .slice(0, 280),
      image: resolveAbsoluteImageUrl(matched.image, origin, 'HP'),
      url: canonicalUrl,
      type: 'website',
    };
  }

  if (shareType === 'testing-tool') {
    const fsTools = await fetchPublicFirestoreCollection('testingTools');
    const matched = [...fsTools, ...TESTING_TOOLS].find((item) => matchesShareSlug(item, slug));
    if (!matched) return null;

    return {
      title: `${matched.title} — Diagnostic Tool | JHF Testing Tools Zone`,
      description: [matched.category, matched.source, matched.size, matched.description]
        .filter(Boolean)
        .join(' • ')
        .slice(0, 280),
      image: resolveAbsoluteImageUrl(matched.image, origin, 'Dell'),
      url: canonicalUrl,
      type: 'website',
    };
  }

  return null;
}

export async function injectShareMetaTags(html: string, req: Request): Promise<string> {
  const queryPart = req.originalUrl.includes('?') ? `?${req.originalUrl.split('?')[1]}` : '';
  const target = parseShareRoute(req.path, queryPart);
  if (!target) return html;

  const origin = getRequestOrigin(req);
  const meta = await resolveShareMeta(target.type, target.slug, origin, req.originalUrl);
  if (!meta) return html;

  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const safeImg = escapeHtml(meta.image);
  const safeUrl = escapeHtml(meta.url);

  const jsonLd = meta.type === 'product'
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: meta.title,
        description: meta.description,
        image: [meta.image],
        brand: meta.brand ? { '@type': 'Brand', name: meta.brand } : undefined,
        offers: meta.price
          ? {
              '@type': 'Offer',
              priceCurrency: 'BDT',
              price: String(meta.price),
              availability: 'https://schema.org/InStock',
              url: meta.url,
            }
          : undefined,
      }).replace(/</g, '\\u003c')
    : '';

  const ogBlock = [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDesc}" />`,
    `<link rel="canonical" href="${safeUrl}" />`,
    `<meta property="og:site_name" content="JHF Laptop Zone" />`,
    `<meta property="og:type" content="${meta.type === 'product' ? 'product' : 'website'}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    `<meta property="og:image" content="${safeImg}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDesc}" />`,
    `<meta name="twitter:image" content="${safeImg}" />`,
    jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  // Strip existing default title & description/og tags so crawlers don't pick stale defaults
  const stripped = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(?:name|property)=["'](?:description|og:title|og:description|og:type|og:image|og:url|twitter:card|twitter:title|twitter:description|twitter:image)["'][^>]*>/gi, '');

  return stripped.replace(/<\/head>/i, `    ${ogBlock}\n  </head>`);
}
