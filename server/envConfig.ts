export type ValidatedImageSearchProvider = 'serpapi' | 'open_fallback' | 'auto';

export interface ValidatedServerEnv {
  port: number;
  geminiApiKey: string | null;
  serpapiApiKey: string | null;
  imageSearchProvider: ValidatedImageSearchProvider;
  bdstallPermittedSourceUrl: string;
  warnings: string[];
}

const DEFAULT_BDSTALL_URL = 'https://www.bdstall.com/laptop/dell-latitude/';

const PLACEHOLDER_PATTERNS = [
  /^your[_-]/i,
  /^my[_-]/i,
  /^replace[_-]?me/i,
  /^placeholder/i,
  /^changeme/i,
  /^example/i,
  /^test[_-]?key/i,
  /^dummy/i,
  /^<.*>$/,
  /^\*+$/,
];

export function sanitizeSecretEnvValue(raw: string | undefined): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().replace(/^["']|["']$/g, '').trim();
  if (!trimmed) return null;
  if (PLACEHOLDER_PATTERNS.some((re) => re.test(trimmed))) {
    return null;
  }
  if (trimmed.length < 10 || /\s/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function validatePort(raw: string | undefined, warnings: string[]): number {
  if (!raw || !raw.trim()) return 3000;
  const parsed = Number(raw.trim());
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    warnings.push(`Invalid PORT "${raw}" ignored; defaulting to 3000.`);
    return 3000;
  }
  return parsed;
}

export function isPrivateOrLocalHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower.endsWith('.local') ||
    lower === '169.254.169.254' ||
    /^10\./.test(lower) ||
    /^192\.168\./.test(lower) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(lower)
  );
}

function validateExternalHttpUrl(raw: string | undefined, fallback: string, warnings: string[]): string {
  if (!raw || !raw.trim()) return fallback;
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      warnings.push('BDSTALL_PERMITTED_SOURCE_URL must use http or https; falling back to default.');
      return fallback;
    }
    if (isPrivateOrLocalHostname(parsed.hostname)) {
      warnings.push('BDSTALL_PERMITTED_SOURCE_URL cannot target private/local hosts; falling back to default.');
      return fallback;
    }
    return parsed.toString();
  } catch {
    warnings.push('BDSTALL_PERMITTED_SOURCE_URL is not a valid URL; falling back to default.');
    return fallback;
  }
}

function validateImageProvider(
  raw: string | undefined,
  hasSerpApiKey: boolean,
  warnings: string[]
): ValidatedImageSearchProvider {
  const normalized = (raw || 'auto').trim().toLowerCase();
  if (!normalized || normalized === 'auto') {
    return hasSerpApiKey ? 'serpapi' : 'open_fallback';
  }
  if (normalized === 'serpapi') {
    return hasSerpApiKey ? 'serpapi' : 'open_fallback';
  }
  if (normalized === 'open_fallback' || normalized === 'fallback' || normalized === 'wikimedia') {
    return 'open_fallback';
  }
  if (normalized === 'bing' || normalized === 'google_cse' || normalized === 'azure_bing') {
    warnings.push(
      `Image provider "${normalized}" is retired/removed; defaulting cleanly to ${
        hasSerpApiKey ? 'serpapi' : 'open_fallback'
      }.`
    );
    return hasSerpApiKey ? 'serpapi' : 'open_fallback';
  }
  warnings.push(
    `Unknown IMAGE_SEARCH_PROVIDER "${normalized}"; defaulting safely to ${
      hasSerpApiKey ? 'serpapi' : 'open_fallback'
    }.`
  );
  return hasSerpApiKey ? 'serpapi' : 'open_fallback';
}

export function getValidatedServerEnv(): ValidatedServerEnv {
  const warnings: string[] = [];

  const port = validatePort(process.env.PORT, warnings);
  const geminiApiKey = sanitizeSecretEnvValue(process.env.GEMINI_API_KEY);
  const serpapiApiKey = sanitizeSecretEnvValue(process.env.SERPAPI_API_KEY);

  if (process.env.SERPAPI_API_KEY?.trim() && !serpapiApiKey) {
    warnings.push('SERPAPI_API_KEY appears invalid or placeholder; using built-in open fallback.');
  }
  if (process.env.GEMINI_API_KEY?.trim() && !geminiApiKey) {
    warnings.push('GEMINI_API_KEY appears invalid or placeholder; AI Vision verification disabled until configured.');
  }

  const imageSearchProvider = validateImageProvider(
    process.env.IMAGE_SEARCH_PROVIDER,
    Boolean(serpapiApiKey),
    warnings
  );

  const bdstallPermittedSourceUrl = validateExternalHttpUrl(
    process.env.BDSTALL_PERMITTED_SOURCE_URL,
    DEFAULT_BDSTALL_URL,
    warnings
  );

  return {
    port,
    geminiApiKey,
    serpapiApiKey,
    imageSearchProvider,
    bdstallPermittedSourceUrl,
    warnings,
  };
}

export function logValidatedServerEnvSummary(): ValidatedServerEnv {
  const env = getValidatedServerEnv();
  for (const w of env.warnings) {
    console.warn(`[env] ${w}`);
  }
  console.log(
    `[env] Port=${env.port} | ImageSearch=${env.imageSearchProvider} | OptionalSerpAPI=${
      env.serpapiApiKey ? 'configured' : 'not-set (fallback active)'
    } | GeminiVision=${env.geminiApiKey ? 'configured' : 'not-set'}`
  );
  return env;
}
