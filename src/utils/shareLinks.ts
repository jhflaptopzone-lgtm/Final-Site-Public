export type ShareItemType = 'laptop' | 'recondition' | 'software' | 'windows' | 'testing-tool';

export interface DeepLinkTarget {
  type: ShareItemType;
  slug: string;
}

export interface ShareableItemLike {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  sku?: string;
  code?: string;
}

const ROUTE_PREFIX_BY_TYPE: Record<ShareItemType, string> = {
  laptop: 'laptop',
  recondition: 'recondition',
  software: 'software',
  windows: 'windows',
  'testing-tool': 'testing-tool',
};

export const SHARE_NAVIGATE_EVENT = 'jhf:open-share-target';

export function slugifyShareText(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function cleanIdToken(id?: string): string {
  if (!id) return '';
  return id
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a clean, deterministic, unique slug for any item.
 * Examples:
 * - "Lenovo ThinkPad L14 Gen-2 Core i5 11th Gen" + id "lp-101" -> "lenovo-thinkpad-l14-gen-2-core-i5-11th-gen--lp-101"
 */
export function buildItemShareSlug(item: ShareableItemLike): string {
  const rawTitle = item.title || item.name || item.sku || item.code || item.id || 'item';
  const baseSlug = slugifyShareText(rawTitle) || 'item';
  if (item.slug && item.slug.trim()) {
    const cleanExisting = slugifyShareText(item.slug);
    const idToken = cleanIdToken(item.id);
    if (idToken && !cleanExisting.endsWith(`--${idToken}`)) {
      return `${cleanExisting}--${idToken}`;
    }
    return cleanExisting;
  }
  const idToken = cleanIdToken(item.id);
  if (idToken && !baseSlug.endsWith(idToken)) {
    return `${baseSlug}--${idToken}`;
  }
  return baseSlug;
}

/**
 * Always resolves dynamically against the current browser domain (window.location.origin),
 * so if the domain changes, every generated link updates automatically with zero hardcoding.
 */
export function getDynamicBaseOrigin(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return '';
}

export function buildSharePath(type: ShareItemType, item: ShareableItemLike): string {
  const prefix = ROUTE_PREFIX_BY_TYPE[type];
  const slug = buildItemShareSlug(item);
  return `/${prefix}/${encodeURIComponent(slug)}`;
}

export function buildShareUrl(type: ShareItemType, item: ShareableItemLike): string {
  const origin = getDynamicBaseOrigin();
  const path = buildSharePath(type, item);
  return origin ? `${origin}${path}` : path;
}

export function parseShareRoute(pathname: string, search = ''): DeepLinkTarget | null {
  const cleanPath = (pathname || '/').replace(/^\/+|\/+$/g, '');
  if (cleanPath) {
    const parts = cleanPath.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const seg = parts[0].toLowerCase();
      const joinedSlug = parts.slice(1).join('/');
      let rawSlug = joinedSlug;
      try {
        rawSlug = decodeURIComponent(joinedSlug);
      } catch {
        rawSlug = joinedSlug;
      }
      if (seg === 'laptop' || seg === 'laptops' || seg === 'product') {
        return { type: 'laptop', slug: rawSlug };
      }
      if (seg === 'recondition' || seg === 'reconditioned') {
        return { type: 'recondition', slug: rawSlug };
      }
      if (seg === 'software') {
        return { type: 'software', slug: rawSlug };
      }
      if (seg === 'windows' || seg === 'os') {
        return { type: 'windows', slug: rawSlug };
      }
      if (seg === 'testing-tool' || seg === 'testing-tools' || seg === 'testing' || seg === 'tool') {
        return { type: 'testing-tool', slug: rawSlug };
      }
    }
  }

  if (search) {
    try {
      const params = new URLSearchParams(search);
      const laptopParam = params.get('laptop') || params.get('product');
      if (laptopParam) return { type: 'laptop', slug: laptopParam };

      const recondParam = params.get('recondition');
      if (recondParam) return { type: 'recondition', slug: recondParam };

      const softwareParam = params.get('software');
      if (softwareParam) return { type: 'software', slug: softwareParam };

      const windowsParam = params.get('windows') || params.get('os');
      if (windowsParam) return { type: 'windows', slug: windowsParam };

      const toolParam = params.get('testing-tool') || params.get('tool');
      if (toolParam) return { type: 'testing-tool', slug: toolParam };
    } catch {
      // ignore invalid search string
    }
  }

  return null;
}

export function matchesShareSlug(item: ShareableItemLike, targetSlug: string): boolean {
  if (!targetSlug) return false;
  let decodedTarget = targetSlug;
  try {
    decodedTarget = decodeURIComponent(targetSlug);
  } catch {
    decodedTarget = targetSlug;
  }
  const normalizedTarget = decodedTarget.trim().toLowerCase();
  const sepIdx = normalizedTarget.lastIndexOf('--');
  const slugHead = sepIdx > -1 ? normalizedTarget.slice(0, sepIdx) : normalizedTarget;
  const slugIdSuffix = sepIdx > -1 ? normalizedTarget.slice(sepIdx + 2) : '';

  const itemId = cleanIdToken(item.id);
  const itemSku = cleanIdToken(item.sku || item.code);
  const itemGeneratedSlug = buildItemShareSlug(item).toLowerCase();
  const itemTitleSlug = slugifyShareText(item.title || item.name || '');
  const itemExplicitSlug = item.slug ? slugifyShareText(item.slug) : '';

  if (itemGeneratedSlug === normalizedTarget) return true;
  if (slugIdSuffix && itemId && itemId === slugIdSuffix) return true;
  if (item.id && item.id.toLowerCase() === normalizedTarget) return true;
  if (itemId && itemId === cleanIdToken(normalizedTarget)) return true;
  if (itemSku && itemSku === cleanIdToken(normalizedTarget)) return true;
  if (itemExplicitSlug && (itemExplicitSlug === normalizedTarget || itemExplicitSlug === slugHead)) return true;
  if (itemTitleSlug && (itemTitleSlug === normalizedTarget || itemTitleSlug === slugHead)) return true;

  return false;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    }
  } catch {
    return false;
  }
  return false;
}

export function navigateToShareTarget(type: ShareItemType, item: ShareableItemLike) {
  if (typeof window === 'undefined') return;
  const path = buildSharePath(type, item);
  const slug = buildItemShareSlug(item);
  try {
    window.history.pushState({ shareTarget: { type, slug } }, '', path);
  } catch {
    // ignore pushState error
  }
  window.dispatchEvent(new CustomEvent(SHARE_NAVIGATE_EVENT, { detail: { type, slug } }));
}

export function handleShareAnchorClick(
  event: {
    defaultPrevented?: boolean;
    button?: number;
    metaKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    preventDefault: () => void;
  },
  type: ShareItemType,
  item: ShareableItemLike
) {
  if (
    event.defaultPrevented ||
    (typeof event.button === 'number' && event.button !== 0) ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  event.preventDefault();
  navigateToShareTarget(type, item);
}

export function clearShareUrlFromHistory() {
  if (typeof window === 'undefined') return;
  const current = parseShareRoute(window.location.pathname, window.location.search);
  if (current) {
    try {
      window.history.replaceState(null, '', '/');
    } catch {
      // ignore
    }
  }
}

export function syncClientDocumentMeta(meta: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  if (typeof document === 'undefined') return;
  document.title = meta.title;

  const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('property', 'og:title', meta.title);
  setMeta('name', 'twitter:title', meta.title);
  if (meta.description) {
    setMeta('name', 'description', meta.description);
    setMeta('property', 'og:description', meta.description);
    setMeta('name', 'twitter:description', meta.description);
  }
  if (meta.image) {
    const absImg =
      meta.image.startsWith('/') && typeof window !== 'undefined'
        ? `${window.location.origin}${meta.image}`
        : meta.image;
    if (!absImg.startsWith('data:')) {
      setMeta('property', 'og:image', absImg);
      setMeta('name', 'twitter:image', absImg);
    }
  }
  if (meta.url) {
    setMeta('property', 'og:url', meta.url);
  }
}

