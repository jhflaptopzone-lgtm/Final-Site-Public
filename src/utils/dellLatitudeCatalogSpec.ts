export type LatitudeGen =
  | '6th Gen'
  | '7th Gen'
  | '8th Gen'
  | '9th Gen'
  | '10th Gen'
  | '11th Gen';

export interface TargetLatitudeModelSpec {
  model: string;
  generations: LatitudeGen[];
  defaultDisplay: string;
  defaultResolution: string;
  defaultRamType: string;
  notes?: string;
}

export interface BdstallSellerListing {
  sellerName: string;
  price: number;
  url?: string;
  condition?: string;
  stockText?: string;
}

export interface BdstallParsedCandidate {
  tempId: string;
  brand: 'Dell';
  series: 'Dell Latitude';
  model: string;
  generation: LatitudeGen;
  processor: string;
  processorFamily: 'Core i3' | 'Core i5' | 'Core i7' | 'Other';
  ram: string;
  ssd: string;
  hdd: string;
  display: string;
  touchscreen: 'Touchscreen' | 'Non-Touch';
  resolution: string;
  condition: 'Brand New' | 'Dubai Grade A++' | 'Grade A+' | 'Grade A' | 'Refurbished';
  marketPrice: number | null;
  marketPriceMin?: number | null;
  marketPriceMax?: number | null;
  sellerCount: number;
  sellerListings: BdstallSellerListing[];
  sourceUrl: string;
  lastUpdated: string;
  stockStatus: 'In Stock' | 'Out of Stock' | 'Unavailable on BDStall';
  rawTitle: string;
  configKey: string;
}

export const TARGET_LATITUDE_SERIES_BY_GEN: Record<LatitudeGen, string[]> = {
  '6th Gen': ['E5470', 'E5570', 'E7270', 'E7470', 'E7370'],
  '7th Gen': ['5280', '5480', '5580', '7280', '7380', '7480'],
  '8th Gen': ['3300', '3310', '5300', '5400', '5500', '7300', '7390', '7400', '7490'],
  '9th Gen': ['5401', '5501', '7300', '7400'],
  '10th Gen': ['5310', '5410', '5510', '7210', '7310', '7410', '7520', '9510'],
  '11th Gen': ['3120', '3320', '3420', '5320', '5420', '5520', '7320', '7420', '7520', '9420', '9520'],
};

export const ALL_TARGET_LATITUDE_MODELS: TargetLatitudeModelSpec[] = (() => {
  const map = new Map<string, TargetLatitudeModelSpec>();
  const screenByPrefix = (model: string): string => {
    const clean = model.replace(/^E/i, '');
    if (clean.startsWith('31')) return '11.6"';
    if (clean.startsWith('72') || clean.startsWith('52')) return '12.5"';
    if (clean.startsWith('73') || clean.startsWith('53') || clean.startsWith('33')) return '13.3"';
    if (clean.startsWith('75') || clean.startsWith('55') || clean.startsWith('95')) return '15.6"';
    return '14.0"';
  };

  (Object.keys(TARGET_LATITUDE_SERIES_BY_GEN) as LatitudeGen[]).forEach((gen) => {
    TARGET_LATITUDE_SERIES_BY_GEN[gen].forEach((model) => {
      const existing = map.get(model);
      if (existing) {
        if (!existing.generations.includes(gen)) existing.generations.push(gen);
      } else {
        map.set(model, {
          model,
          generations: [gen],
          defaultDisplay: screenByPrefix(model),
          defaultResolution: model === '3120' ? '1366x768 (HD)' : '1920x1080 (FHD)',
          defaultRamType: gen === '11th Gen' ? 'DDR4 / LPDDR4x' : 'DDR4',
        });
      }
    });
  });
  return Array.from(map.values());
})();

const FORBIDDEN_DELL_SERIES = [
  'inspiron',
  'vostro',
  'precision',
  'xps',
  'optiplex',
  'alienware',
  'g15',
  'g3',
  'g5',
  'g7',
  'thinkpad',
  'elitebook',
  'probook',
  'macbook',
  'pavilion',
  'ideapad',
];

const MODEL_DEFAULT_GEN_MAP: Record<string, LatitudeGen> = {
  E5470: '6th Gen',
  E5570: '6th Gen',
  E7270: '6th Gen',
  E7370: '6th Gen',
  E7470: '6th Gen',
  '5280': '7th Gen',
  '5480': '7th Gen',
  '5580': '7th Gen',
  '7280': '7th Gen',
  '7380': '7th Gen',
  '7480': '7th Gen',
  '3300': '8th Gen',
  '3310': '8th Gen',
  '5300': '8th Gen',
  '5400': '8th Gen',
  '5500': '8th Gen',
  '7300': '8th Gen',
  '7390': '8th Gen',
  '7400': '8th Gen',
  '7490': '8th Gen',
  '5401': '9th Gen',
  '5501': '9th Gen',
  '5310': '10th Gen',
  '5410': '10th Gen',
  '5510': '10th Gen',
  '7210': '10th Gen',
  '7310': '10th Gen',
  '7410': '10th Gen',
  '9510': '10th Gen',
  '3120': '11th Gen',
  '3320': '11th Gen',
  '3420': '11th Gen',
  '5320': '11th Gen',
  '5420': '11th Gen',
  '5520': '11th Gen',
  '7320': '11th Gen',
  '7420': '11th Gen',
  '7520': '11th Gen',
  '9420': '11th Gen',
  '9520': '11th Gen',
};

const TARGET_MODEL_SET = new Set(Object.keys(MODEL_DEFAULT_GEN_MAP));

export function extractGenerationNumber(text: string): number | null {
  const lower = text.toLowerCase();

  // Explicit mention like "11th Gen", "8th Generation", "6th gen"
  const explicit = lower.match(/\b(1[0-4]|[1-9])(?:st|nd|rd|th)?\s*gen(?:eration)?\b/);
  if (explicit) {
    return parseInt(explicit[1], 10);
  }

  // Intel Core CPU sku like i5-1145G7, i7-10610U, i5-8350U, i5-7300U, i5-6300U, i5-1235U
  const cpu4Or5Digit = lower.match(/\bi[3579][-\s]?(\d{4,5})[a-z0-9]*/);
  if (cpu4Or5Digit) {
    const code = cpu4Or5Digit[1];
    if (code.length === 5) {
      return parseInt(code.slice(0, 2), 10);
    }
    if (code.length === 4) {
      return parseInt(code.slice(0, 1), 10);
    }
  }

  return null;
}

export function extractLatitudeModel(text: string): string | null {
  const upper = text.toUpperCase();
  // Sort longest first so E7470 matches before 7470
  const sortedModels = Array.from(TARGET_MODEL_SET).sort((a, b) => b.length - a.length);
  for (const model of sortedModels) {
    const regex = new RegExp(`\\b${model}\\b`, 'i');
    if (regex.test(upper)) return model;
  }

  // Generic Latitude 4-digit fallback like "Latitude 5490" or "Latitude E5450"
  const generic = upper.match(/\bLATITUDE\s+(E?\d{4})\b/);
  if (generic) return generic[1];
  return null;
}

export function normalizeRam(text: string): string {
  const match = text.match(/\b(4|8|12|16|24|32|64)\s*GB(?:\s*(?:DDR[345]|LPDDR[345]x?))?(?:\s*RAM)?/i);
  if (match) return `${match[1]}GB`;
  return '8GB';
}

export function normalizeStorage(text: string): { ssd: string; hdd: string } {
  const lower = text.toLowerCase();
  let ssd = '256GB';
  let hdd = 'None';

  const ssdMatch =
    lower.match(/\b(128|256|512)\s*gb\s*(?:nvme|m\.?2|pcie)?\s*ssd\b/) ||
    lower.match(/\b(1|2)\s*tb\s*(?:nvme|m\.?2|pcie)?\s*ssd\b/) ||
    lower.match(/ssd\s*[:\-]?\s*(128|256|512)\s*gb/) ||
    lower.match(/ssd\s*[:\-]?\s*(1|2)\s*tb/);

  if (ssdMatch) {
    const num = ssdMatch[1];
    ssd = num === '1' || num === '2' ? `${num}TB` : `${num}GB`;
  } else {
    // Check slash pattern like "16GB/512GB" or "8GB 256GB"
    const slashStorage = lower.match(/\b(?:4|8|12|16|32)\s*gb\s*[/,\-+]\s*(128|256|512)\s*gb\b/);
    if (slashStorage) {
      ssd = `${slashStorage[1]}GB`;
    } else {
      const tbSlash = lower.match(/\b(?:4|8|12|16|32)\s*gb\s*[/,\-+]\s*(1|2)\s*tb\b/);
      if (tbSlash) ssd = `${tbSlash[1]}TB`;
    }
  }

  const hddMatch =
    lower.match(/\b(500)\s*gb\s*hdd\b/) ||
    lower.match(/\b(1|2)\s*tb\s*hdd\b/);
  if (hddMatch) {
    const val = hddMatch[1];
    hdd = val === '500' ? '500GB HDD' : `${val}TB HDD`;
  }

  return { ssd, hdd };
}

export function normalizeProcessor(text: string): {
  processor: string;
  processorFamily: 'Core i3' | 'Core i5' | 'Core i7' | 'Other';
} {
  const exactCpu = text.match(/Intel\s+Core\s+i[3579][-\s]?\d{4,5}[A-Z0-9]*/i) ||
    text.match(/Core\s+i[3579][-\s]?\d{4,5}[A-Z0-9]*/i) ||
    text.match(/\bi[3579][-\s]?\d{4,5}[A-Z0-9]*/i);

  let family: 'Core i3' | 'Core i5' | 'Core i7' | 'Other' = 'Core i5';
  if (/\bi7\b|core\s*i7/i.test(text)) family = 'Core i7';
  else if (/\bi3\b|core\s*i3/i.test(text)) family = 'Core i3';
  else if (/\bi5\b|core\s*i5/i.test(text)) family = 'Core i5';
  else family = 'Other';

  if (exactCpu) {
    const clean = exactCpu[0].replace(/^intel\s+/i, '').replace(/^core\s+/i, '');
    return {
      processor: `Intel Core ${clean}`,
      processorFamily: family,
    };
  }

  return {
    processor: family === 'Other' ? 'Intel Core i5' : `Intel ${family}`,
    processorFamily: family === 'Other' ? 'Core i5' : family,
  };
}

export function normalizeDisplayAndTouch(text: string, model: string): {
  display: string;
  touchscreen: 'Touchscreen' | 'Non-Touch';
  resolution: string;
} {
  const lower = text.toLowerCase();
  const sizeMatch = lower.match(/\b(11\.6|12\.5|13\.3|14\.0|14|15\.6)\s*(?:"|inch|in\b)/i);
  const specDefault = ALL_TARGET_LATITUDE_MODELS.find((m) => m.model === model);
  let display = specDefault?.defaultDisplay || '14.0"';
  if (sizeMatch) {
    const rawSize = sizeMatch[1];
    display = rawSize === '14' ? '14.0"' : `${rawSize}"`;
  }

  const isTouch = /\btouch(?:screen)?\b|\bx360\b|\b2-in-1\b/i.test(lower) && !/\bnon[-\s]?touch\b/i.test(lower);
  const touchscreen: 'Touchscreen' | 'Non-Touch' = isTouch ? 'Touchscreen' : 'Non-Touch';

  let resolution = specDefault?.defaultResolution || '1920x1080 (FHD)';
  if (/\b4k\b|\buhd\b|3840\s*x\s*2160/i.test(lower)) resolution = '3840x2160 (4K UHD)';
  else if (/\bqhd\b|2560\s*x\s*1440/i.test(lower)) resolution = '2560x1440 (QHD)';
  else if (/\bhd\b|1366\s*x\s*768/i.test(lower) && !/\bfhd\b|full\s*hd/i.test(lower)) resolution = '1366x768 (HD)';

  return { display, touchscreen, resolution };
}

export function normalizeCondition(text: string): 'Brand New' | 'Dubai Grade A++' | 'Grade A+' | 'Grade A' | 'Refurbished' {
  const lower = text.toLowerCase();
  if (/\bbrand\s*new\b|\bintact\b/.test(lower)) return 'Brand New';
  if (/\brefurbished\b/.test(lower)) return 'Refurbished';
  if (/\bused\b|\bpre-?owned\b|\bsecond\s*hand\b/.test(lower)) return 'Grade A+';
  return 'Dubai Grade A++';
}

export function buildLatitudeConfigKey(input: {
  model: string;
  generation: string;
  processorFamily?: string;
  processor?: string;
  ram: string;
  ssd: string;
  hdd?: string;
  touchscreen?: string | boolean;
}): string {
  const clean = (v?: string) => (v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cpuTier =
    input.processorFamily && input.processorFamily !== 'Other'
      ? clean(input.processorFamily)
      : /i7/i.test(input.processor || '')
      ? 'corei7'
      : /i3/i.test(input.processor || '')
      ? 'corei3'
      : 'corei5';

  const touchVal =
    input.touchscreen === true ||
    String(input.touchscreen || '').toLowerCase().includes('touch') &&
      !String(input.touchscreen || '').toLowerCase().includes('non')
      ? 'touch'
      : 'nontouch';

  return [
    'dell',
    'latitude',
    clean(input.model),
    clean(input.generation),
    cpuTier,
    clean(input.ram),
    clean(input.ssd || '256gb'),
    clean(input.hdd && input.hdd !== 'None' ? input.hdd : 'none'),
    touchVal,
  ].join('|');
}

export interface ClassificationResult {
  valid: boolean;
  reason?: string;
  candidate?: BdstallParsedCandidate;
}

export function classifyBdstallListing(params: {
  rawTitle: string;
  rawSpecsText?: string;
  priceText?: string;
  prices?: number[];
  sellerCount?: number;
  sellerListings?: BdstallSellerListing[];
  sourceUrl?: string;
  stockText?: string;
  lastUpdated?: string;
  conditionText?: string;
}): ClassificationResult {
  const combined = `${params.rawTitle} ${params.rawSpecsText || ''}`.trim();
  const lower = combined.toLowerCase();

  // Exclude non-Latitude Dell or other brands explicitly
  for (const forbidden of FORBIDDEN_DELL_SERIES) {
    if (new RegExp(`\\b${forbidden}\\b`, 'i').test(lower)) {
      return { valid: false, reason: `Excluded non-Latitude series (${forbidden})` };
    }
  }

  const model = extractLatitudeModel(combined);
  if (!model) {
    return { valid: false, reason: 'Could not identify a Dell Latitude model number' };
  }

  const mentionsLatitude = /\blatitude\b/i.test(lower);
  if (!mentionsLatitude && !TARGET_MODEL_SET.has(model)) {
    return { valid: false, reason: 'Not a recognized Dell Latitude model' };
  }

  // Determine generation and enforce strictly 6th to 11th Gen
  let genNum = extractGenerationNumber(combined);
  if (genNum === null) {
    const mapped = MODEL_DEFAULT_GEN_MAP[model];
    if (mapped) {
      genNum = parseInt(mapped, 10);
    }
  }

  if (genNum === null || genNum < 6 || genNum > 11) {
    return {
      valid: false,
      reason: `Generation outside 6th–11th Gen range (detected: ${genNum ?? 'unknown'})`,
    };
  }

  const generation = `${genNum}th Gen` as LatitudeGen;
  const { processor, processorFamily } = normalizeProcessor(combined);
  const ram = normalizeRam(combined);
  const { ssd, hdd } = normalizeStorage(combined);
  const { display, touchscreen, resolution } = normalizeDisplayAndTouch(combined, model);
  const condition = normalizeCondition(`${combined} ${params.conditionText || ''}`);

  // Parse real prices strictly (NEVER invent or estimate!)
  const parsedPrices: number[] = Array.isArray(params.prices)
    ? params.prices.filter((p) => Number.isFinite(p) && p > 1000 && p < 1000000)
    : [];

  if (params.priceText && parsedPrices.length === 0) {
    const matches = params.priceText.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})/g);
    if (matches) {
      matches.forEach((m) => {
        const val = parseInt(m.replace(/,/g, ''), 10);
        if (val >= 5000 && val <= 500000) parsedPrices.push(val);
      });
    }
  }

  const stockRaw = `${params.stockText || ''} ${params.priceText || ''}`.toLowerCase();
  const isOutOfStock =
    /\bout\s*of\s*stock\b|\bunavailable\b|\bdiscontinued\b|\bsold\s*out\b|\bcall\s*for\s*price\b|\bupcoming\b/.test(
      stockRaw
    ) || parsedPrices.length === 0;

  const marketPrice = parsedPrices.length > 0 ? Math.min(...parsedPrices) : null;
  const marketPriceMin = parsedPrices.length > 0 ? Math.min(...parsedPrices) : null;
  const marketPriceMax = parsedPrices.length > 0 ? Math.max(...parsedPrices) : null;

  const stockStatus: BdstallParsedCandidate['stockStatus'] =
    marketPrice === null
      ? 'Unavailable on BDStall'
      : isOutOfStock
      ? 'Out of Stock'
      : 'In Stock';

  const configKey = buildLatitudeConfigKey({
    model,
    generation,
    processorFamily,
    processor,
    ram,
    ssd,
    hdd,
    touchscreen,
  });

  return {
    valid: true,
    candidate: {
      tempId: `bd-${configKey}`,
      brand: 'Dell',
      series: 'Dell Latitude',
      model,
      generation,
      processor,
      processorFamily,
      ram,
      ssd,
      hdd,
      display,
      touchscreen,
      resolution,
      condition,
      marketPrice,
      marketPriceMin,
      marketPriceMax,
      sellerCount: params.sellerCount ?? (params.sellerListings?.length || (marketPrice ? 1 : 0)),
      sellerListings: params.sellerListings || [],
      sourceUrl: params.sourceUrl || 'https://www.bdstall.com/laptop/dell-latitude/',
      lastUpdated: params.lastUpdated || new Date().toISOString(),
      stockStatus,
      rawTitle: params.rawTitle,
      configKey,
    },
  };
}

export interface DellLatitudeCatalogSeedItem {
  id: string;
  sku: string;
  model: string;
  generation: LatitudeGen;
  processor: string;
  ram: string;
  ssd: string;
  hdd: string;
  display: string;
  touchscreen: 'Touchscreen' | 'Non-Touch';
  resolution: string;
  tag: string;
  configKey: string;
  offerPrice: number;
  mrpPrice: number;
  purchasePrice: number;
  stockQuantity: number;
}

const DEFAULT_CPU_BY_GEN: Record<LatitudeGen, string> = {
  '6th Gen': 'Intel Core i5-6300U (6th Gen)',
  '7th Gen': 'Intel Core i5-7300U (7th Gen)',
  '8th Gen': 'Intel Core i5-8350U (8th Gen)',
  '9th Gen': 'Intel Core i5-9400H (9th Gen)',
  '10th Gen': 'Intel Core i5-10310U (10th Gen)',
  '11th Gen': 'Intel Core i5-1145G7 (11th Gen)',
};

// Bangladesh / BDStall market Offer Price (discountPrice), MRP (+2,500 to +5,000 BDT), Wholesale Purchase Price & Stock
const BD_MARKET_PRICE_TABLE: Record<
  string,
  { offer: number; mrp: number; purchase: number; stock: number }
> = {
  // 6th Gen (All >= ৳21,000 Offer, >= ৳23,500 MRP)
  '6th Gen|E5470': { offer: 21000, mrp: 23500, purchase: 17000, stock: 5 },
  '6th Gen|E5570': { offer: 22500, mrp: 25000, purchase: 18500, stock: 4 },
  '6th Gen|E7270': { offer: 21500, mrp: 24000, purchase: 17500, stock: 5 },
  '6th Gen|E7370': { offer: 22500, mrp: 25500, purchase: 18500, stock: 3 },
  '6th Gen|E7470': { offer: 23500, mrp: 26500, purchase: 19500, stock: 6 },
  // 7th Gen (৳24,000 - ৳27,500 Offer)
  '7th Gen|5280': { offer: 24000, mrp: 26500, purchase: 20000, stock: 4 },
  '7th Gen|5480': { offer: 25000, mrp: 28000, purchase: 21000, stock: 6 },
  '7th Gen|5580': { offer: 26500, mrp: 29500, purchase: 22000, stock: 4 },
  '7th Gen|7280': { offer: 25500, mrp: 28500, purchase: 21500, stock: 5 },
  '7th Gen|7380': { offer: 26000, mrp: 29000, purchase: 22000, stock: 4 },
  '7th Gen|7480': { offer: 27500, mrp: 30500, purchase: 23000, stock: 6 },
  // 8th Gen (৳25,500 - ৳32,000 Offer)
  '8th Gen|3300': { offer: 25500, mrp: 28500, purchase: 21500, stock: 5 },
  '8th Gen|3310': { offer: 26500, mrp: 29500, purchase: 22000, stock: 4 },
  '8th Gen|5300': { offer: 28000, mrp: 31000, purchase: 23500, stock: 5 },
  '8th Gen|5400': { offer: 29000, mrp: 32500, purchase: 24500, stock: 7 },
  '8th Gen|5500': { offer: 31000, mrp: 34500, purchase: 26500, stock: 4 },
  '8th Gen|7300': { offer: 29500, mrp: 33000, purchase: 25000, stock: 5 },
  '8th Gen|7390': { offer: 31000, mrp: 34500, purchase: 26500, stock: 5 },
  '8th Gen|7490': { offer: 30500, mrp: 34000, purchase: 26000, stock: 6 },
  '8th Gen|7400': { offer: 32000, mrp: 36000, purchase: 27000, stock: 6 },
  // 9th Gen (৳33,500 - ৳37,500 Offer)
  '9th Gen|7300': { offer: 33500, mrp: 37000, purchase: 28500, stock: 3 },
  '9th Gen|7400': { offer: 35000, mrp: 39000, purchase: 30000, stock: 4 },
  '9th Gen|5401': { offer: 35500, mrp: 39500, purchase: 30500, stock: 4 },
  '9th Gen|5501': { offer: 37500, mrp: 41500, purchase: 32000, stock: 4 },
  // 10th Gen (৳35,500 - ৳58,000 Offer)
  '10th Gen|5310': { offer: 35500, mrp: 39500, purchase: 30500, stock: 4 },
  '10th Gen|5410': { offer: 36500, mrp: 40500, purchase: 31500, stock: 6 },
  '10th Gen|5510': { offer: 39500, mrp: 43500, purchase: 34000, stock: 4 },
  '10th Gen|7210': { offer: 38500, mrp: 42500, purchase: 33000, stock: 3 },
  '10th Gen|7310': { offer: 39500, mrp: 43500, purchase: 34000, stock: 4 },
  '10th Gen|7410': { offer: 41500, mrp: 46000, purchase: 35500, stock: 5 },
  '10th Gen|7520': { offer: 44500, mrp: 49000, purchase: 38500, stock: 3 },
  '10th Gen|9510': { offer: 58000, mrp: 63000, purchase: 50000, stock: 3 },
  // 11th Gen (৳25,500 Core i3 Compact - ৳65,000 Evo Flagship)
  '11th Gen|3120': { offer: 25500, mrp: 28500, purchase: 21500, stock: 5 },
  '11th Gen|3320': { offer: 35500, mrp: 39500, purchase: 30500, stock: 4 },
  '11th Gen|3420': { offer: 38500, mrp: 42500, purchase: 33000, stock: 5 },
  '11th Gen|5320': { offer: 41500, mrp: 46000, purchase: 35500, stock: 4 },
  '11th Gen|5420': { offer: 42500, mrp: 47000, purchase: 36500, stock: 6 },
  '11th Gen|5520': { offer: 46500, mrp: 51000, purchase: 40000, stock: 4 },
  '11th Gen|7320': { offer: 44500, mrp: 49000, purchase: 38500, stock: 4 },
  '11th Gen|7420': { offer: 47500, mrp: 52500, purchase: 41000, stock: 5 },
  '11th Gen|7520': { offer: 50500, mrp: 55500, purchase: 43500, stock: 3 },
  '11th Gen|9420': { offer: 59500, mrp: 64500, purchase: 51500, stock: 3 },
  '11th Gen|9520': { offer: 65000, mrp: 70000, purchase: 56000, stock: 3 },
};

export const DELL_LATITUDE_CATALOG_SEED: DellLatitudeCatalogSeedItem[] = (() => {
  const list: DellLatitudeCatalogSeedItem[] = [];
  const seen = new Set<string>();

  const screenByModel = (model: string): string => {
    const clean = model.replace(/^E/i, '');
    if (clean.startsWith('31')) return '11.6"';
    if (clean.startsWith('72') || clean.startsWith('52')) return '12.5"';
    if (clean.startsWith('73') || clean.startsWith('53') || clean.startsWith('33')) return '13.3"';
    if (clean.startsWith('75') || clean.startsWith('55') || clean.startsWith('95')) return '15.6"';
    return '14.0"';
  };

  (Object.keys(TARGET_LATITUDE_SERIES_BY_GEN) as LatitudeGen[]).forEach((gen) => {
    TARGET_LATITUDE_SERIES_BY_GEN[gen].forEach((model) => {
      const genNum = parseInt(gen, 10);
      const isUpper = (genNum >= 10 || model.startsWith('9')) && model !== '3120';
      const ram = isUpper ? '16GB' : '8GB';
      const ssd = isUpper ? '512GB' : '256GB';
      const processor =
        model === '3120'
          ? 'Intel Core i3-1115G4 (11th Gen)'
          : DEFAULT_CPU_BY_GEN[gen];
      const display = screenByModel(model);
      const resolution = model === '3120' ? '1366x768 (HD)' : '1920x1080 (FHD)';
      const touchscreen: 'Touchscreen' | 'Non-Touch' =
        model === '3120' || model === '7390' || model === '9420' || model === '9510' || model === '9520'
          ? 'Touchscreen'
          : 'Non-Touch';

      const configKey = buildLatitudeConfigKey({
        model,
        generation: gen,
        processor,
        ram,
        ssd,
        hdd: 'None',
        touchscreen,
      });

      if (seen.has(configKey)) return;
      seen.add(configKey);

      const priceInfo = BD_MARKET_PRICE_TABLE[`${gen}|${model}`] || {
        offer: 28000,
        mrp: 31500,
        purchase: 23500,
        stock: 4,
      };

      const id = `prod-dell-lat-${model.toLowerCase()}-${genNum}th`;
      const sku = `JHF-DELL-${model.toUpperCase()}-${genNum}G`;
      list.push({
        id,
        sku,
        model,
        generation: gen,
        processor,
        ram,
        ssd,
        hdd: 'None',
        display,
        touchscreen,
        resolution,
        tag: `${gen} Latitude`,
        configKey,
        offerPrice: priceInfo.offer,
        mrpPrice: priceInfo.mrp,
        purchasePrice: priceInfo.purchase,
        stockQuantity: priceInfo.stock,
      });
    });
  });

  return list;
})();

