import express, { type Request, type Response } from 'express';
import * as cheerio from 'cheerio';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  classifyBdstallListing,
  type BdstallParsedCandidate,
  type BdstallSellerListing,
} from './src/utils/dellLatitudeCatalogSpec.ts';
import { registerLaptopImageRoutes } from './server/laptopImageManager.ts';
import { registerServiceVoucherRoutes } from './server/serviceVoucherPdf.ts';
import { injectShareMetaTags } from './server/shareMeta.ts';
import { parseShareRoute } from './src/utils/shareLinks.ts';
import { getValidatedServerEnv, logValidatedServerEnvSummary } from './server/envConfig.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initialEnv = logValidatedServerEnvSummary();
const PORT = initialEnv.port;
const BDSTALL_BASE_URL = 'https://www.bdstall.com/laptop/dell-latitude/';

interface ExcludedListingInfo {
  rawTitle: string;
  reason: string;
  sourceUrl?: string;
}

interface ParsedHtmlSummary {
  candidates: BdstallParsedCandidate[];
  excluded: ExcludedListingInfo[];
  rawBlocksScanned: number;
  nextPageUrls: string[];
}

function isAntiBotChallenge(status: number, headers: Headers, html: string): boolean {
  const cfMitigated = headers.get('cf-mitigated') || '';
  if (status === 403 || status === 429 || cfMitigated.toLowerCase().includes('challenge')) {
    return true;
  }
  const lower = html.toLowerCase();
  return (
    lower.includes('just a moment...') && lower.includes('cf_chl') ||
    lower.includes('enable javascript and cookies to continue') ||
    lower.includes('attention required! | cloudflare') ||
    lower.includes('cdn-cgi/challenge-platform') ||
    lower.includes('g-recaptcha')
  );
}

function toAbsoluteBdstallUrl(href?: string, baseUrl: string = BDSTALL_BASE_URL): string {
  if (!href) return baseUrl;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function extractPricesFromText(text: string): number[] {
  const cleaned = text.replace(/\u09F3/g, '৳');
  const matches = cleaned.match(/(?:৳|tk\.?|bdt)?\s*(\d{1,3}(?:,\d{3})+|\d{4,6})/gi) || [];
  const nums: number[] = [];
  for (const m of matches) {
    const digits = m.replace(/[^0-9]/g, '');
    if (!digits) continue;
    const val = parseInt(digits, 10);
    if (val >= 5000 && val <= 450000 && !nums.includes(val)) {
      nums.push(val);
    }
  }
  return nums;
}

function parseBdstallHtmlContent(html: string, pageUrl: string = BDSTALL_BASE_URL): ParsedHtmlSummary {
  const $ = cheerio.load(html);
  const candidatesByKey = new Map<string, BdstallParsedCandidate>();
  const excluded: ExcludedListingInfo[] = [];
  const nextPageUrls: string[] = [];
  let rawBlocksScanned = 0;

  const mergeCandidate = (cand: BdstallParsedCandidate) => {
    const existing = candidatesByKey.get(cand.configKey);
    if (!existing) {
      candidatesByKey.set(cand.configKey, cand);
      return;
    }

    // Merge multiple seller offers for the exact same configuration without inventing prices
    const mergedSellers: BdstallSellerListing[] = [...existing.sellerListings];
    for (const s of cand.sellerListings) {
      if (!mergedSellers.some((m) => m.sellerName === s.sellerName && m.price === s.price)) {
        mergedSellers.push(s);
      }
    }

    const allPrices = [
      ...(existing.marketPrice !== null ? [existing.marketPrice] : []),
      ...(existing.marketPriceMin ? [existing.marketPriceMin] : []),
      ...(existing.marketPriceMax ? [existing.marketPriceMax] : []),
      ...(cand.marketPrice !== null ? [cand.marketPrice] : []),
      ...(cand.marketPriceMin ? [cand.marketPriceMin] : []),
      ...(cand.marketPriceMax ? [cand.marketPriceMax] : []),
      ...mergedSellers.map((s) => s.price),
    ].filter((v) => typeof v === 'number' && v > 0);

    const minP = allPrices.length > 0 ? Math.min(...allPrices) : null;
    const maxP = allPrices.length > 0 ? Math.max(...allPrices) : null;

    existing.sellerListings = mergedSellers;
    existing.sellerCount = Math.max(
      existing.sellerCount,
      cand.sellerCount,
      mergedSellers.length
    );
    existing.marketPrice = minP;
    existing.marketPriceMin = minP;
    existing.marketPriceMax = maxP;
    if (minP !== null && existing.stockStatus === 'Unavailable on BDStall') {
      existing.stockStatus = cand.stockStatus;
    }
  };

  // 1. Parse JSON-LD Product / ItemList blocks if present
  $('script[type="application/ld+json"]').each((_, el) => {
    const jsonText = $(el).html();
    if (!jsonText) return;
    try {
      const parsed = JSON.parse(jsonText);
      const items: any[] = [];
      if (Array.isArray(parsed)) {
        items.push(...parsed);
      } else if (parsed['@type'] === 'ItemList' && Array.isArray(parsed.itemListElement)) {
        for (const entry of parsed.itemListElement) {
          items.push(entry.item || entry);
        }
      } else {
        items.push(parsed);
      }

      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const title = String(item.name || item.headline || '').trim();
        if (!title) continue;
        rawBlocksScanned++;

        const offersRaw = item.offers
          ? Array.isArray(item.offers)
            ? item.offers
            : [item.offers]
          : [];
        const sellerListings: BdstallSellerListing[] = [];
        const prices: number[] = [];
        let stockText = '';

        for (const off of offersRaw) {
          const p = Number(off.price || off.lowPrice);
          const highP = Number(off.highPrice);
          if (Number.isFinite(p) && p >= 5000) prices.push(p);
          if (Number.isFinite(highP) && highP >= 5000) prices.push(highP);
          if (off.availability) stockText += ` ${String(off.availability)}`;
          if (Number.isFinite(p) && p >= 5000) {
            sellerListings.push({
              sellerName: String(off.seller?.name || 'BDStall Listed Seller'),
              price: p,
              url: off.url ? toAbsoluteBdstallUrl(String(off.url), pageUrl) : undefined,
              stockText: off.availability ? String(off.availability) : undefined,
            });
          }
        }

        const res = classifyBdstallListing({
          rawTitle: title,
          rawSpecsText: String(item.description || ''),
          prices,
          sellerCount: sellerListings.length || (prices.length > 0 ? 1 : 0),
          sellerListings,
          sourceUrl: item.url ? toAbsoluteBdstallUrl(String(item.url), pageUrl) : pageUrl,
          stockText,
        });

        if (res.valid && res.candidate) {
          mergeCandidate(res.candidate);
        } else if (title.toLowerCase().includes('dell') || title.toLowerCase().includes('latitude')) {
          excluded.push({ rawTitle: title, reason: res.reason || 'Filtered out' });
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  });

  // 2. Parse BDStall listing cards / product grid containers / tables
  const cardSelectors = [
    '.product-box',
    '.product-card',
    '.product-item',
    '.cat-product',
    '.bdstall-product',
    '.listing-item',
    '.product_list_item',
    'article.product',
    'div[class*="product"]',
    'li[class*="product"]',
    'tr',
  ];

  const seenRawTitles = new Set<string>();

  for (const selector of cardSelectors) {
    $(selector).each((_, el) => {
      const container = $(el);
      // Avoid giant outer wrapper divs that contain nested product cards
      if (container.find('a[href*="/details/"], a[href*="/laptop/"]').length > 6) return;

      const text = container.text().replace(/\s+/g, ' ').trim();
      if (text.length < 12 || text.length > 1200) return;
      if (!/latitude|\bdell\b/i.test(text)) return;

      const anchor =
        container.find('a[href*="/details/"], h2 a, h3 a, h4 a, .title a, a[title]').first() ||
        container.find('a').first();
      const rawTitle = (
        container.find('h2, h3, h4, .title, .product-title, .product-name').first().text() ||
        anchor.attr('title') ||
        anchor.text() ||
        text.slice(0, 120)
      )
        .replace(/\s+/g, ' ')
        .trim();

      if (!rawTitle || rawTitle.length < 5) return;
      const href = anchor.attr('href');
      const sourceUrl = toAbsoluteBdstallUrl(href, pageUrl);
      const dedupeKey = `${rawTitle.toLowerCase()}|${sourceUrl}`;
      if (seenRawTitles.has(dedupeKey)) return;
      seenRawTitles.add(dedupeKey);

      rawBlocksScanned++;

      const sellerText = container.find('[class*="seller"], [class*="shop"], .store-count').text().trim();
      const sellerCountMatch = `${sellerText} ${text}`.match(/(\d+)\s*(?:seller|sellers|shop|shops|store|stores)/i);
      const sellerCount = sellerCountMatch ? parseInt(sellerCountMatch[1], 10) : undefined;

      const priceText =
        container.find('[class*="price"], .tk, .amount').text().replace(/\s+/g, ' ').trim() || text;
      const prices = extractPricesFromText(priceText);

      // Parse individual seller sub-rows inside the card/detail page if any
      const sellerListings: BdstallSellerListing[] = [];
      container.find('[class*="seller-row"], [class*="vendor"], .shop-list li').each((__, sEl) => {
        const sText = $(sEl).text().replace(/\s+/g, ' ').trim();
        const sPrices = extractPricesFromText(sText);
        if (sPrices.length > 0) {
          const sName =
            $(sEl).find('[class*="name"], a, strong').first().text().trim() || 'BDStall Seller';
          sellerListings.push({
            sellerName: sName,
            price: sPrices[0],
            url: sourceUrl,
          });
        }
      });

      const res = classifyBdstallListing({
        rawTitle,
        rawSpecsText: text,
        priceText,
        prices,
        sellerCount,
        sellerListings,
        sourceUrl,
        stockText: text,
      });

      if (res.valid && res.candidate) {
        mergeCandidate(res.candidate);
      } else {
        excluded.push({
          rawTitle,
          reason: res.reason || 'Excluded by Dell Latitude 6th–11th Gen rules',
          sourceUrl,
        });
      }
    });
  }

  // 3. Collect pagination links (e.g. ?page=2, rel="next")
  $('a[rel="next"], .pagination a[href], ul.pager a[href]').each((_, a) => {
    const href = $(a).attr('href');
    const txt = $(a).text().trim();
    if (!href) return;
    if (/^\d+$/.test(txt) || /next|›|»/i.test(txt) || $(a).attr('rel') === 'next') {
      const abs = toAbsoluteBdstallUrl(href, pageUrl);
      if (abs.includes('bdstall.com') && !nextPageUrls.includes(abs) && abs !== pageUrl) {
        nextPageUrls.push(abs);
      }
    }
  });

  return {
    candidates: Array.from(candidatesByKey.values()),
    excluded: excluded.slice(0, 50),
    rawBlocksScanned,
    nextPageUrls: nextPageUrls.slice(0, 6),
  };
}

async function checkRobotsTxtAllowed(): Promise<{ allowed: boolean; rawSnippet: string }> {
  try {
    const res = await fetch('https://www.bdstall.com/robots.txt', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JHF-Laptop-Zone-Inventory/1.0)',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { allowed: true, rawSnippet: `HTTP ${res.status}` };
    const txt = await res.text();
    const lines = txt.split(/\r?\n/).map((l) => l.trim());
    let inWildcard = false;
    for (const line of lines) {
      if (/^user-agent:\s*\*/i.test(line)) {
        inWildcard = true;
      } else if (/^user-agent:/i.test(line)) {
        inWildcard = false;
      } else if (inWildcard && /^disallow:\s*\/laptop/i.test(line)) {
        return { allowed: false, rawSnippet: line };
      }
    }
    return { allowed: true, rawSnippet: txt.slice(0, 240) };
  } catch {
    return { allowed: true, rawSnippet: 'robots.txt timeout' };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads')));

  // Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: 'JHF Laptop Zone Inventory & BDStall Sync API',
      timestamp: new Date().toISOString(),
    });
  });

  // Live BDStall Permitted Fetch Endpoint (with pagination & anti-bot transparency)
  app.post('/api/bdstall/fetch-latitude', async (req: Request, res: Response) => {
    const requestedMaxPages = Math.min(Math.max(Number(req.body?.maxPages || 3), 1), 6);
    const targetUrl = getValidatedServerEnv().bdstallPermittedSourceUrl;

    try {
      const robots = await checkRobotsTxtAllowed();
      if (!robots.allowed) {
        res.status(403).json({
          success: false,
          status: 'disallowed_by_robots',
          robotsAllowed: false,
          sourceUrl: targetUrl,
          message: `Fetching disallowed by robots.txt (${robots.rawSnippet}).`,
          pagesFetched: 0,
          candidates: [],
          excluded: [],
        });
        return;
      }

      const visitedUrls = new Set<string>();
      const queue: string[] = [targetUrl];
      const combinedMap = new Map<string, BdstallParsedCandidate>();
      const excluded: ExcludedListingInfo[] = [];
      let pagesFetched = 0;
      let totalBlocks = 0;

      while (queue.length > 0 && pagesFetched < requestedMaxPages) {
        const currentUrl = queue.shift()!;
        if (visitedUrls.has(currentUrl)) continue;
        visitedUrls.add(currentUrl);

        const upstream = await fetch(currentUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: AbortSignal.timeout(12000),
        });

        const html = await upstream.text();

        if (isAntiBotChallenge(upstream.status, upstream.headers, html)) {
          res.status(200).json({
            success: false,
            status: 'blocked_by_anti_bot',
            httpStatus: upstream.status,
            robotsAllowed: robots.allowed,
            sourceUrl: currentUrl,
            fetchedAt: new Date().toISOString(),
            message:
              'BDStall returned a Cloudflare anti-bot verification challenge (HTTP ' +
              upstream.status +
              '). Per strict compliance policy, automated CAPTCHA/anti-bot bypass is never performed and no prices are invented. Open the BDStall link in your browser and use "Snapshot / File Import" (HTML, CSV, or Excel) to import real BDStall listings into the Approval Preview Queue.',
            pagesFetched,
            candidates: Array.from(combinedMap.values()),
            excluded,
          });
          return;
        }

        if (!upstream.ok) {
          res.status(200).json({
            success: false,
            status: 'upstream_error',
            httpStatus: upstream.status,
            robotsAllowed: robots.allowed,
            sourceUrl: currentUrl,
            fetchedAt: new Date().toISOString(),
            message: `BDStall responded with HTTP ${upstream.status}.`,
            pagesFetched,
            candidates: Array.from(combinedMap.values()),
            excluded,
          });
          return;
        }

        pagesFetched++;
        const parsed = parseBdstallHtmlContent(html, currentUrl);
        totalBlocks += parsed.rawBlocksScanned;
        excluded.push(...parsed.excluded);
        for (const c of parsed.candidates) {
          if (!combinedMap.has(c.configKey)) {
            combinedMap.set(c.configKey, c);
          }
        }
        for (const nextUrl of parsed.nextPageUrls) {
          if (!visitedUrls.has(nextUrl) && !queue.includes(nextUrl)) {
            queue.push(nextUrl);
          }
        }

        if (queue.length > 0 && pagesFetched < requestedMaxPages) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }

      res.json({
        success: true,
        status: 'ok',
        httpStatus: 200,
        robotsAllowed: robots.allowed,
        sourceUrl: targetUrl,
        fetchedAt: new Date().toISOString(),
        pagesFetched,
        rawBlocksScanned: totalBlocks,
        candidates: Array.from(combinedMap.values()),
        excluded: excluded.slice(0, 50),
      });
    } catch (error) {
      res.status(200).json({
        success: false,
        status: 'network_error',
        sourceUrl: targetUrl,
        fetchedAt: new Date().toISOString(),
        message:
          error instanceof Error
            ? `Live fetch failed: ${error.message}`
            : 'Unable to reach BDStall.',
        pagesFetched: 0,
        candidates: [],
        excluded: [],
      });
    }
  });

  // Authorized HTML Snapshot or Spreadsheet Rows Parser Endpoint
  app.post('/api/bdstall/parse-snapshot', (req: Request, res: Response) => {
    const html = typeof req.body?.html === 'string' ? req.body.html : '';
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const sourceUrl =
      typeof req.body?.sourceUrl === 'string' && req.body.sourceUrl.trim()
        ? req.body.sourceUrl.trim()
        : BDSTALL_BASE_URL;

    if (!html && rows.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Provide either saved BDStall HTML content or parsed spreadsheet rows.',
        candidates: [],
        excluded: [],
      });
      return;
    }

    if (html) {
      const parsed = parseBdstallHtmlContent(html, sourceUrl);
      res.json({
        success: true,
        status: 'ok',
        sourceUrl,
        fetchedAt: new Date().toISOString(),
        rawBlocksScanned: parsed.rawBlocksScanned,
        candidates: parsed.candidates,
        excluded: parsed.excluded,
      });
      return;
    }

    // Parse structured CSV / Excel rows cleanly without inventing any prices
    const candidatesByKey = new Map<string, BdstallParsedCandidate>();
    const excluded: ExcludedListingInfo[] = [];

    for (const rawRow of rows) {
      if (!rawRow || typeof rawRow !== 'object') continue;
      const r: Record<string, string> = {};
      for (const [k, v] of Object.entries(rawRow)) {
        r[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = String(v ?? '').trim();
      }

      const modelText = r.model || r.modelnumber || r.title || r.name || '';
      const genText = r.generation || r.gen || '';
      const cpuText = r.processor || r.cpu || '';
      const ramText = r.ram || '';
      const ssdText = r.ssd || r.storage || '';
      const hddText = r.hdd || '';
      const displayText = r.display || r.screensize || '';
      const touchText = r.touchscreen || r.touch || '';
      const resText = r.resolution || '';
      const condText = r.condition || '';
      const priceStr = r.marketprice || r.bdstallprice || r.bdstalllistedprice || r.price || '';
      const sellerCountNum = parseInt(r.sellercount || r.sellers || '', 10);
      const stockText = r.stockstatus || r.availability || '';
      const rowUrl = r.sourceurl || r.url || sourceUrl;

      const combinedTitle = `Dell Latitude ${modelText} ${genText} ${cpuText} ${ramText} ${ssdText ? ssdText + ' SSD' : ''} ${hddText && hddText !== 'None' ? hddText + ' HDD' : ''} ${displayText} ${touchText} ${resText}`.trim();
      const parsedPrices = extractPricesFromText(priceStr);

      const classified = classifyBdstallListing({
        rawTitle: combinedTitle,
        rawSpecsText: combinedTitle,
        priceText: priceStr,
        prices: parsedPrices,
        sellerCount: Number.isFinite(sellerCountNum) ? sellerCountNum : undefined,
        sourceUrl: rowUrl,
        stockText,
        lastUpdated: r.lastupdated || new Date().toISOString(),
        conditionText: condText,
      });

      if (classified.valid && classified.candidate) {
        if (displayText) classified.candidate.display = displayText;
        if (resText) classified.candidate.resolution = resText;
        candidatesByKey.set(classified.candidate.configKey, classified.candidate);
      } else {
        excluded.push({
          rawTitle: combinedTitle || JSON.stringify(rawRow).slice(0, 80),
          reason: classified.reason || 'Excluded row',
          sourceUrl: rowUrl,
        });
      }
    }

    res.json({
      success: true,
      status: 'ok',
      sourceUrl,
      fetchedAt: new Date().toISOString(),
      rawBlocksScanned: rows.length,
      candidates: Array.from(candidatesByKey.values()),
      excluded: excluded.slice(0, 50),
    });
  });

  // Universal Exact Model Laptop Image Finder & AI Vision Verification Routes
  registerLaptopImageRoutes(app);

  // Public Service Zone Voucher / Invoice PDF Routes
  registerServiceVoucherRoutes(app);

  const isSharePageGetRequest = (req: Request) => {
    if (req.method !== 'GET') return false;
    if (
      req.path.startsWith('/api/') ||
      req.path.startsWith('/service-voucher/') ||
      req.path.startsWith('/src/') ||
      req.path.startsWith('/@') ||
      req.path.startsWith('/node_modules/') ||
      /\.[a-z0-9]{2,6}$/i.test(req.path)
    ) {
      return false;
    }
    const queryPart = req.originalUrl.includes('?') ? `?${req.originalUrl.split('?')[1]}` : '';
    return Boolean(parseShareRoute(req.path, queryPart));
  };

  const distDir = path.resolve(__dirname, 'dist');
  const distIndexPath = path.join(distDir, 'index.html');
  const isExplicitProd = process.env.NODE_ENV === 'production';
  const isDevScript = process.env.npm_lifecycle_event === 'dev';
  const isStartScript = process.env.npm_lifecycle_event === 'start';
  const isRunningViaTsx = process.execArgv.some((arg) => arg.includes('tsx'));
  const useProductionStatic =
    isExplicitProd ||
    (!isDevScript && (isStartScript || !isRunningViaTsx) && fs.existsSync(distIndexPath));

  if (!useProductionStatic) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(async (req: Request, res: Response, next) => {
      if (!isSharePageGetRequest(req)) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        const viteHtml = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        const enrichedHtml = await injectShareMetaTags(viteHtml, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(enrichedHtml);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    app.use('/api/*', (_req: Request, res: Response) => {
      res.status(404).json({ ok: false, error: 'API endpoint not found' });
    });
    app.use(express.static(distDir));
    app.get('*', async (req: Request, res: Response) => {
      if (fs.existsSync(distIndexPath)) {
        try {
          const rawHtml = fs.readFileSync(distIndexPath, 'utf-8');
          const enrichedHtml = await injectShareMetaTags(rawHtml, req);
          res.status(200).set({ 'Content-Type': 'text/html' }).send(enrichedHtml);
        } catch {
          res.sendFile(distIndexPath);
        }
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JHF Laptop Zone full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
