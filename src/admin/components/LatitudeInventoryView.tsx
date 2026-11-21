import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import { Product } from '../types';
import { BRAND_LAPTOP_IMAGES } from '../../data/jhfData';
import {
  ALL_TARGET_LATITUDE_MODELS,
  BdstallParsedCandidate,
  BdstallSellerListing,
  buildLatitudeConfigKey,
  LatitudeGen,
  TARGET_LATITUDE_SERIES_BY_GEN,
} from '../../utils/dellLatitudeCatalogSpec';
import {
  RefreshCw,
  Search,
  Download,
  FileSpreadsheet,
  Upload,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  ShieldAlert,
  Store,
  Check,
  X,
  Laptop,
  ArrowUpDown,
  FileCode2,
  History,
  CopyCheck,
} from 'lucide-react';

type ActiveSubTab = 'inventory' | 'approval' | 'matrix' | 'import';

interface StagingRow extends BdstallParsedCandidate {
  selected: boolean;
  matchStatus: 'new' | 'price_update' | 'duplicate_same' | 'unavailable';
  existingProductId?: string;
  previousMarketPrice?: number | null;
  myPurchasePrice: number;
  mySellingPrice: number;
  myStockQuantity: number;
  publishToCatalog: boolean;
}

interface ExcludedSummary {
  rawTitle: string;
  reason: string;
  sourceUrl?: string;
}

const GENERATIONS: LatitudeGen[] = [
  '6th Gen',
  '7th Gen',
  '8th Gen',
  '9th Gen',
  '10th Gen',
  '11th Gen',
];

function extractRamGb(val?: string): string {
  const m = (val || '').match(/\b(4|8|12|16|24|32|64)\s*GB\b/i);
  return m ? `${m[1]}GB` : val || '8GB';
}

function extractSsdCap(product: Product): string {
  if (product.ssd) return product.ssd;
  const s = product.storage || '';
  const m = s.match(/\b(128|256|512)\s*GB|\b(1|2)\s*TB/i);
  if (m) return m[0].replace(/\s+/g, '').toUpperCase();
  return '256GB';
}

function extractHddCap(product: Product): string {
  if (product.hdd) return product.hdd;
  const s = (product.storage || '').toLowerCase();
  const m = s.match(/\b(500)\s*gb\s*hdd|\b(1|2)\s*tb\s*hdd/i);
  if (m) return m[0].toUpperCase();
  return 'None';
}

function getTouchLabel(product: Product): 'Touchscreen' | 'Non-Touch' {
  if (product.touchscreen === true || String(product.touchscreen || '').toLowerCase() === 'touchscreen') {
    return 'Touchscreen';
  }
  const combined = `${product.display || ''} ${product.name || ''}`.toLowerCase();
  if (combined.includes('touch') && !combined.includes('non-touch') && !combined.includes('non touch')) {
    return 'Touchscreen';
  }
  return 'Non-Touch';
}

export const LatitudeInventoryView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    permanentDeleteProduct,
    bdstallImportHistory,
    approveBdstallImportBatch,
  } = useAdminStore();
  const { hasPermission } = useAdminAuth();
  const canWrite = hasPermission('Products', 'write');

  const [activeTab, setActiveTab] = useState<ActiveSubTab>('inventory');
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // Inventory Filters & Sorting
  const [searchModel, setSearchModel] = useState('');
  const [filterGen, setFilterGen] = useState<string>('all');
  const [filterProcessor, setFilterProcessor] = useState<string>('all');
  const [filterRam, setFilterRam] = useState<string>('all');
  const [filterSsd, setFilterSsd] = useState<string>('all');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('all');
  const [onlyDuplicates, setOnlyDuplicates] = useState(false);
  const [sortBy, setSortBy] = useState<
    'model_asc' | 'market_asc' | 'market_desc' | 'selling_asc' | 'selling_desc' | 'purchase_asc'
  >('model_asc');

  // BDStall Fetch & Staging State
  const [isFetchingBdstall, setIsFetchingBdstall] = useState(false);
  const [fetchDiagnostics, setFetchDiagnostics] = useState<{
    status: string;
    message: string;
    sourceUrl: string;
    fetchedAt?: string;
    pagesFetched?: number;
    excludedCount: number;
    excluded: ExcludedSummary[];
    importMethod: 'live_fetch' | 'html_snapshot' | 'csv_excel';
  } | null>(null);
  const [stagingRows, setStagingRows] = useState<StagingRow[]>([]);

  // HTML Snapshot Paste / File Upload
  const [htmlPasteInput, setHtmlPasteInput] = useState('');
  const [snapshotSourceUrl, setSnapshotSourceUrl] = useState('https://www.bdstall.com/laptop/dell-latitude/');
  const [isParsingSnapshot, setIsParsingSnapshot] = useState(false);

  // Seller Modal
  const [sellerModalTarget, setSellerModalTarget] = useState<{
    title: string;
    sourceUrl?: string;
    marketPrice?: number | null;
    marketPriceMin?: number | null;
    marketPriceMax?: number | null;
    sellers: BdstallSellerListing[];
  } | null>(null);

  // Add / Edit 19-Field Latitude Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    model: '7420',
    generation: '11th Gen' as LatitudeGen,
    processor: 'Intel Core i5-1145G7',
    ram: '16GB',
    ssd: '512GB',
    hdd: 'None',
    display: '14.0"',
    touchscreen: 'Non-Touch' as 'Touchscreen' | 'Non-Touch',
    resolution: '1920x1080 (FHD)',
    condition: 'Dubai Grade A++' as Product['condition'],
    purchasePrice: 0,
    marketPrice: '',
    sellingPrice: 0,
    stockQuantity: 1,
    sourceUrl: 'https://www.bdstall.com/laptop/dell-latitude/',
    lastUpdated: new Date().toISOString().slice(0, 10),
    stockStatus: 'In Stock' as NonNullable<Product['stockStatus']>,
    publishToCatalog: true,
  });

  const showNotice = (type: 'success' | 'warning' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 6000);
  };

  // All Dell Latitude products in DB (6th-11th Gen)
  const latitudeProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (p.isDeleted) return false;
        const brandOk = (p.brand || '').toLowerCase() === 'dell';
        const isLat =
          (p.series || '').toLowerCase().includes('latitude') ||
          (p.name || '').toLowerCase().includes('latitude');
        return brandOk && isLat;
      })
      .map((p) => {
        const ramNorm = extractRamGb(p.ram);
        const ssdNorm = extractSsdCap(p);
        const hddNorm = extractHddCap(p);
        const touchNorm = getTouchLabel(p);
        const configKey =
          p.configKey ||
          buildLatitudeConfigKey({
            model: p.model || p.name,
            generation: p.generation || '8th Gen',
            processor: p.processor,
            ram: ramNorm,
            ssd: ssdNorm,
            hdd: hddNorm,
            touchscreen: touchNorm,
          });
        return {
          ...p,
          ramNorm,
          ssdNorm,
          hddNorm,
          touchNorm,
          computedConfigKey: configKey,
        };
      });
  }, [products]);

  // Duplicate detection map across active Dell Latitude configurations
  const duplicateKeySet = useMemo(() => {
    const counts = new Map<string, number>();
    latitudeProducts.forEach((p) => {
      counts.set(p.computedConfigKey, (counts.get(p.computedConfigKey) || 0) + 1);
    });
    const dupes = new Set<string>();
    counts.forEach((count, key) => {
      if (count > 1) dupes.add(key);
    });
    return dupes;
  }, [latitudeProducts]);

  const filteredLatitudeProducts = useMemo(() => {
    const q = searchModel.trim().toLowerCase();
    return latitudeProducts
      .filter((p) => {
        if (onlyDuplicates && !duplicateKeySet.has(p.computedConfigKey)) return false;
        if (filterGen !== 'all' && p.generation !== filterGen) return false;
        if (filterProcessor !== 'all') {
          if (!`${p.processor} ${p.name}`.toLowerCase().includes(filterProcessor.toLowerCase())) {
            return false;
          }
        }
        if (filterRam !== 'all' && p.ramNorm.toUpperCase() !== filterRam.toUpperCase()) return false;
        if (filterSsd !== 'all' && p.ssdNorm.toUpperCase() !== filterSsd.toUpperCase()) return false;
        if (filterStockStatus !== 'all') {
          const st = p.stockStatus || (p.stockQuantity > 0 ? 'In Stock' : 'Out of Stock');
          if (st !== filterStockStatus) return false;
        }
        if (q) {
          const hay = `${p.model} ${p.name} ${p.processor} ${p.sku} ${p.generation} ${p.ramNorm} ${p.ssdNorm}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'market_asc') return (a.marketPrice ?? Number.MAX_SAFE_INTEGER) - (b.marketPrice ?? Number.MAX_SAFE_INTEGER);
        if (sortBy === 'market_desc') return (b.marketPrice ?? -1) - (a.marketPrice ?? -1);
        if (sortBy === 'selling_asc') return (a.sellingPrice || 0) - (b.sellingPrice || 0);
        if (sortBy === 'selling_desc') return (b.sellingPrice || 0) - (a.sellingPrice || 0);
        if (sortBy === 'purchase_asc') return (a.purchasePrice || 0) - (b.purchasePrice || 0);
        return (a.model || '').localeCompare(b.model || '');
      });
  }, [
    latitudeProducts,
    onlyDuplicates,
    duplicateKeySet,
    filterGen,
    filterProcessor,
    filterRam,
    filterSsd,
    filterStockStatus,
    searchModel,
    sortBy,
  ]);

  // Build staging rows matched against existing DB by exact configKey
  const populateStagingFromCandidates = (
    candidates: BdstallParsedCandidate[],
    meta: {
      status: string;
      message: string;
      sourceUrl: string;
      fetchedAt?: string;
      pagesFetched?: number;
      excluded: ExcludedSummary[];
      importMethod: 'live_fetch' | 'html_snapshot' | 'csv_excel';
    },
    spreadsheetExtras?: Map<string, { purchasePrice?: number; sellingPrice?: number; stockQuantity?: number }>
  ) => {
    const existingByKey = new Map<string, (typeof latitudeProducts)[number]>();
    latitudeProducts.forEach((p) => {
      if (!existingByKey.has(p.computedConfigKey)) {
        existingByKey.set(p.computedConfigKey, p);
      }
    });

    const staged: StagingRow[] = candidates.map((cand) => {
      const existing = existingByKey.get(cand.configKey);
      const extra = spreadsheetExtras?.get(cand.configKey);

      let matchStatus: StagingRow['matchStatus'] = 'new';
      if (cand.stockStatus === 'Unavailable on BDStall' || cand.marketPrice === null) {
        matchStatus = existing && existing.marketPrice !== cand.marketPrice ? 'price_update' : 'unavailable';
      } else if (existing) {
        if (existing.marketPrice !== cand.marketPrice) {
          matchStatus = 'price_update';
        } else {
          matchStatus = 'duplicate_same';
        }
      }

      // IMPORTANT RULE: Never automatically overwrite purchasePrice or sellingPrice with marketPrice!
      const defaultPurchase =
        typeof extra?.purchasePrice === 'number' && extra.purchasePrice > 0
          ? extra.purchasePrice
          : existing
          ? existing.purchasePrice
          : 0;
      const defaultSelling =
        typeof extra?.sellingPrice === 'number' && extra.sellingPrice > 0
          ? extra.sellingPrice
          : existing
          ? existing.sellingPrice
          : 0;
      const defaultStock =
        typeof extra?.stockQuantity === 'number' && extra.stockQuantity >= 0
          ? extra.stockQuantity
          : existing
          ? existing.stockQuantity
          : 0;

      return {
        ...cand,
        selected: matchStatus === 'new' || matchStatus === 'price_update',
        matchStatus,
        existingProductId: existing?.id,
        previousMarketPrice: existing?.marketPrice ?? null,
        myPurchasePrice: defaultPurchase,
        mySellingPrice: defaultSelling,
        myStockQuantity: defaultStock,
        publishToCatalog: existing ? existing.status === 'published' : false,
      };
    });

    setStagingRows(staged);
    setFetchDiagnostics({
      ...meta,
      excludedCount: meta.excluded.length,
    });
    setActiveTab('approval');
  };

  // Automation Button: "Fetch Latest BDStall Prices"
  const handleFetchLatestBdstallPrices = async () => {
    setIsFetchingBdstall(true);
    try {
      const response = await fetch('/api/bdstall/fetch-latitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxPages: 4 }),
      });
      const data = await response.json();

      if (data.status === 'blocked_by_anti_bot' || data.status === 'disallowed_by_robots') {
        populateStagingFromCandidates(data.candidates || [], {
          status: data.status,
          message: data.message,
          sourceUrl: data.sourceUrl || 'https://www.bdstall.com/laptop/dell-latitude/',
          fetchedAt: data.fetchedAt,
          pagesFetched: data.pagesFetched || 0,
          excluded: data.excluded || [],
          importMethod: 'live_fetch',
        });
        showNotice(
          'warning',
          'BDStall requires browser Cloudflare verification. Use the Snapshot HTML or Excel/CSV importer inside Approval Queue — zero prices were invented.'
        );
        return;
      }

      if (!data.success) {
        setFetchDiagnostics({
          status: data.status || 'error',
          message: data.message || 'Could not complete live fetch.',
          sourceUrl: data.sourceUrl || 'https://www.bdstall.com/laptop/dell-latitude/',
          fetchedAt: data.fetchedAt,
          pagesFetched: data.pagesFetched || 0,
          excludedCount: 0,
          excluded: [],
          importMethod: 'live_fetch',
        });
        setActiveTab('approval');
        showNotice('error', data.message || 'BDStall fetch encountered an upstream error.');
        return;
      }

      populateStagingFromCandidates(data.candidates || [], {
        status: 'ok',
        message: `Fetched ${data.pagesFetched || 1} page(s), extracted ${(data.candidates || []).length} valid Dell Latitude (6th–11th Gen) configurations.`,
        sourceUrl: data.sourceUrl,
        fetchedAt: data.fetchedAt,
        pagesFetched: data.pagesFetched,
        excluded: data.excluded || [],
        importMethod: 'live_fetch',
      });
      showNotice('success', `Extracted ${(data.candidates || []).length} Dell Latitude records for admin review.`);
    } catch (err) {
      showNotice(
        'error',
        err instanceof Error ? `Network error: ${err.message}` : 'Failed to contact backend fetch API.'
      );
    } finally {
      setIsFetchingBdstall(false);
    }
  };

  // Parse Pasted or Uploaded HTML Snapshot from BDStall
  const handleParseHtmlSnapshot = async (htmlOverride?: string) => {
    const htmlContent = (htmlOverride ?? htmlPasteInput).trim();
    if (!htmlContent) {
      showNotice('warning', 'Please paste or upload a saved BDStall HTML page first.');
      return;
    }

    setIsParsingSnapshot(true);
    try {
      const response = await fetch('/api/bdstall/parse-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: htmlContent,
          sourceUrl: snapshotSourceUrl.trim() || 'https://www.bdstall.com/laptop/dell-latitude/',
        }),
      });
      const data = await response.json();
      const candidates: BdstallParsedCandidate[] = data.candidates || [];

      populateStagingFromCandidates(candidates, {
        status: candidates.length > 0 ? 'ok' : 'empty_parse',
        message:
          candidates.length > 0
            ? `Parsed ${candidates.length} valid Dell Latitude (6th–11th Gen) listings from saved BDStall HTML.`
            : 'No matching Dell Latitude (6th–11th Gen) listings were detected in that HTML snippet. Make sure you saved the full product listing page HTML after the page loaded in your browser.',
        sourceUrl: snapshotSourceUrl,
        fetchedAt: data.fetchedAt,
        excluded: data.excluded || [],
        importMethod: 'html_snapshot',
      });
      showNotice(
        candidates.length > 0 ? 'success' : 'warning',
        candidates.length > 0
          ? `Ready to approve ${candidates.length} parsed BDStall configs.`
          : 'No matching Latitude 6th–11th Gen listings found in HTML.'
      );
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : 'Failed to parse HTML snapshot.');
    } finally {
      setIsParsingSnapshot(false);
    }
  };

  // Upload HTML or CSV/Excel file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const lowerName = file.name.toLowerCase();

    try {
      if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
        const text = await file.text();
        setHtmlPasteInput(text.slice(0, 50000));
        await handleParseHtmlSnapshot(text);
        return;
      }

      if (lowerName.endsWith('.csv') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], {
          defval: '',
        });

        const extrasMap = new Map<
          string,
          { purchasePrice?: number; sellingPrice?: number; stockQuantity?: number }
        >();

        setIsParsingSnapshot(true);
        const response = await fetch('/api/bdstall/parse-snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rows,
            sourceUrl: 'https://www.bdstall.com/laptop/dell-latitude/',
          }),
        });
        const data = await response.json();
        const candidates: BdstallParsedCandidate[] = data.candidates || [];

        // Match spreadsheet purchase_price / selling_price / stock_quantity cleanly
        candidates.forEach((cand) => {
          const matchingRow = rows.find((raw) => {
            const m = String(raw.model || raw.Model || '').toUpperCase();
            return m && cand.model.toUpperCase().includes(m);
          });
          if (matchingRow) {
            const pPrice = Number(matchingRow.purchase_price ?? matchingRow.PurchasePrice ?? 0);
            const sPrice = Number(matchingRow.selling_price ?? matchingRow.SellingPrice ?? 0);
            const qQty = Number(matchingRow.stock_quantity ?? matchingRow.StockQuantity ?? 0);
            extrasMap.set(cand.configKey, {
              purchasePrice: Number.isFinite(pPrice) ? pPrice : 0,
              sellingPrice: Number.isFinite(sPrice) ? sPrice : 0,
              stockQuantity: Number.isFinite(qQty) ? qQty : 0,
            });
          }
        });

        populateStagingFromCandidates(
          candidates,
          {
            status: 'ok',
            message: `Parsed ${candidates.length} Dell Latitude (6th–11th Gen) rows from ${file.name}.`,
            sourceUrl: 'https://www.bdstall.com/laptop/dell-latitude/',
            fetchedAt: data.fetchedAt,
            excluded: data.excluded || [],
            importMethod: 'csv_excel',
          },
          extrasMap
        );
        showNotice('success', `Loaded ${candidates.length} rows from ${file.name} into Approval Queue.`);
      } else {
        showNotice('warning', 'Unsupported file format. Please upload .xlsx, .xls, .csv, or .html.');
      }
    } catch (err) {
      showNotice('error', err instanceof Error ? err.message : 'File import failed.');
    } finally {
      setIsParsingSnapshot(false);
      e.target.value = '';
    }
  };

  // Approve & Save Selected Records to Firebase Inventory
  const handleApproveSelected = () => {
    const selected = stagingRows.filter((r) => r.selected);
    if (selected.length === 0) {
      showNotice('warning', 'Select at least one row to approve and save.');
      return;
    }

    const result = approveBdstallImportBatch({
      items: selected.map((r) => ({
        existingProductId: r.existingProductId,
        brand: 'Dell',
        series: 'Dell Latitude',
        model: r.model,
        generation: r.generation,
        processor: r.processor,
        ram: r.ram,
        ssd: r.ssd,
        hdd: r.hdd,
        display: r.display,
        touchscreen: r.touchscreen,
        resolution: r.resolution,
        condition: r.condition,
        purchasePrice: r.myPurchasePrice,
        marketPrice: r.marketPrice,
        marketPriceMin: r.marketPriceMin,
        marketPriceMax: r.marketPriceMax,
        sellingPrice: r.mySellingPrice,
        stockQuantity: r.myStockQuantity,
        sellerCount: r.sellerCount,
        sellerListings: r.sellerListings,
        sourceUrl: r.sourceUrl,
        lastUpdated: r.lastUpdated,
        stockStatus: r.stockStatus,
        configKey: r.configKey,
        publishToCatalog: r.publishToCatalog,
      })),
      importMethod: fetchDiagnostics?.importMethod || 'live_fetch',
      sourceUrl: fetchDiagnostics?.sourceUrl || 'https://www.bdstall.com/laptop/dell-latitude/',
      fetchedAt: fetchDiagnostics?.fetchedAt || new Date().toISOString(),
      totalExtracted: stagingRows.length,
      skippedCount: stagingRows.length - selected.length,
    });

    showNotice(
      'success',
      `Approved & persisted to Firebase: ${result.added} new configuration(s), ${result.updated} updated record(s).`
    );
    setStagingRows([]);
    setActiveTab('inventory');
  };

  // Export CSV or Excel (.xlsx) with all 19 Database Fields
  const buildExportRows = () => {
    return filteredLatitudeProducts.map((p) => ({
      product_id: p.id,
      brand: p.brand,
      series: p.series || 'Dell Latitude',
      model: p.model,
      generation: p.generation,
      processor: p.processor,
      ram: p.ramNorm,
      ssd: p.ssdNorm,
      hdd: p.hddNorm,
      display: p.screenSize || p.display,
      touchscreen: p.touchNorm,
      resolution: p.resolution || '1920x1080 (FHD)',
      condition: p.condition,
      purchase_price: p.purchasePrice ?? 0,
      market_price: p.marketPrice ?? '',
      selling_price: p.sellingPrice ?? 0,
      stock_quantity: p.stockQuantity ?? 0,
      seller_count: p.sellerCount ?? 0,
      source_url: p.sourceUrl || '',
      last_updated: p.lastUpdated || p.updatedAt,
      stock_status: p.stockStatus || (p.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'),
    }));
  };

  const handleExportCsv = () => {
    const rows = buildExportRows();
    if (rows.length === 0) {
      showNotice('warning', 'No Dell Latitude products available to export.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jhf_dell_latitude_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const rows = buildExportRows();
    if (rows.length === 0) {
      showNotice('warning', 'No Dell Latitude products available to export.');
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Dell_Latitude_Inventory');
    XLSX.writeFile(wb, `jhf_dell_latitude_inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleDownloadImportTemplate = (format: 'xlsx' | 'csv') => {
    const templateRows = [
      {
        brand: 'Dell',
        series: 'Dell Latitude',
        model: '7420',
        generation: '11th Gen',
        processor: 'Intel Core i5-1145G7',
        ram: '16GB',
        ssd: '512GB',
        hdd: 'None',
        display: '14.0"',
        touchscreen: 'Non-Touch',
        resolution: '1920x1080 (FHD)',
        condition: 'Dubai Grade A++',
        purchase_price: '',
        market_price: '',
        selling_price: '',
        stock_quantity: 0,
        seller_count: 0,
        source_url: 'https://www.bdstall.com/laptop/dell-latitude/',
        last_updated: new Date().toISOString().slice(0, 10),
        stock_status: 'Pending Fetch',
      },
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    if (format === 'xlsx') {
      XLSX.writeFile(wb, 'jhf_dell_latitude_import_template.xlsx');
    } else {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jhf_dell_latitude_import_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Open Add / Edit Modal
  const openAddModal = (presetModel?: string, presetGen?: LatitudeGen) => {
    const modelSpec = ALL_TARGET_LATITUDE_MODELS.find((m) => m.model === presetModel);
    const genToUse = presetGen || modelSpec?.generations[0] || '11th Gen';
    setEditingProductId(null);
    setFormState({
      model: presetModel || '7420',
      generation: genToUse,
      processor: 'Intel Core i5',
      ram: '16GB',
      ssd: '512GB',
      hdd: 'None',
      display: modelSpec?.defaultDisplay || '14.0"',
      touchscreen: 'Non-Touch',
      resolution: modelSpec?.defaultResolution || '1920x1080 (FHD)',
      condition: 'Dubai Grade A++',
      purchasePrice: 0,
      marketPrice: '',
      sellingPrice: 0,
      stockQuantity: 1,
      sourceUrl: 'https://www.bdstall.com/laptop/dell-latitude/',
      lastUpdated: new Date().toISOString().slice(0, 10),
      stockStatus: 'In Stock',
      publishToCatalog: true,
    });
    setEditModalOpen(true);
  };

  const openEditModal = (prod: (typeof latitudeProducts)[number]) => {
    setEditingProductId(prod.id);
    setFormState({
      model: prod.model || '7420',
      generation: (GENERATIONS.includes(prod.generation as LatitudeGen)
        ? prod.generation
        : '8th Gen') as LatitudeGen,
      processor: prod.processor || 'Intel Core i5',
      ram: prod.ramNorm,
      ssd: prod.ssdNorm,
      hdd: prod.hddNorm,
      display: prod.screenSize || '14.0"',
      touchscreen: prod.touchNorm,
      resolution: prod.resolution || '1920x1080 (FHD)',
      condition: prod.condition || 'Dubai Grade A++',
      purchasePrice: prod.purchasePrice || 0,
      marketPrice:
        typeof prod.marketPrice === 'number' && prod.marketPrice > 0 ? String(prod.marketPrice) : '',
      sellingPrice: prod.sellingPrice || 0,
      stockQuantity: prod.stockQuantity ?? 0,
      sourceUrl: prod.sourceUrl || 'https://www.bdstall.com/laptop/dell-latitude/',
      lastUpdated: (prod.lastUpdated || prod.updatedAt || new Date().toISOString()).slice(0, 10),
      stockStatus: prod.stockStatus || (prod.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'),
      publishToCatalog: prod.status === 'published',
    });
    setEditModalOpen(true);
  };

  const handleSaveManualProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMarket = formState.marketPrice.trim()
      ? parseInt(formState.marketPrice.replace(/[^0-9]/g, ''), 10)
      : null;

    const storageStr =
      formState.hdd && formState.hdd !== 'None'
        ? `${formState.ssd} NVMe SSD + ${formState.hdd}`
        : `${formState.ssd} NVMe SSD`;

    const configKey = buildLatitudeConfigKey({
      model: formState.model,
      generation: formState.generation,
      processor: formState.processor,
      ram: formState.ram,
      ssd: formState.ssd,
      hdd: formState.hdd,
      touchscreen: formState.touchscreen,
    });

    const payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      sku: `JHF-LAT-${formState.model.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${formState.ram.toUpperCase()}-${formState.ssd.toUpperCase()}`,
      name: `Dell Latitude ${formState.model} (${formState.generation} ${formState.processor.replace('Intel ', '')} / ${formState.ram} / ${formState.ssd}${formState.hdd && formState.hdd !== 'None' ? ' + ' + formState.hdd : ''})`,
      slug: `dell-latitude-${formState.model.toLowerCase()}-${formState.ram.toLowerCase()}-${formState.ssd.toLowerCase()}`,
      brand: 'Dell',
      series: 'Dell Latitude',
      model: formState.model.trim(),
      category: 'Business Laptop',
      condition: formState.condition,
      processor: formState.processor.trim(),
      generation: formState.generation,
      ram: formState.ram,
      storage: storageStr,
      ssd: formState.ssd,
      hdd: formState.hdd,
      graphics: 'Intel UHD / Iris Graphics',
      display: `${formState.display} ${formState.resolution} (${formState.touchscreen})`,
      screenSize: formState.display,
      resolution: formState.resolution,
      touchscreen: formState.touchscreen,
      batteryCondition: 'Tested 3–5 Hours Backup',
      keyboardCondition: 'Backlit Original',
      bodyCondition: 'Verified Corporate Grade',
      operatingSystem: 'Windows 10 / 11 Pro Ready',
      includedAccessories: ['Original Dell Charger', 'Power Cord'],
      purchasePrice: Number(formState.purchasePrice) || 0,
      sellingPrice: Number(formState.sellingPrice) || 0,
      profitMargin: (Number(formState.sellingPrice) || 0) - (Number(formState.purchasePrice) || 0),
      marketPrice: parsedMarket && parsedMarket > 0 ? parsedMarket : null,
      stockQuantity: Number(formState.stockQuantity) || 0,
      minimumStockAlert: 1,
      warranty: '30 Days Replacement + 5 Years Free Service',
      shortDescription: `Dell Latitude ${formState.model} • ${formState.generation} • ${formState.processor} • ${formState.ram} • ${storageStr}`,
      specifications: `${formState.processor} • ${formState.ram} • ${storageStr} • ${formState.display} ${formState.resolution} • ${formState.touchscreen}`,
      images: [BRAND_LAPTOP_IMAGES.Dell],
      status: formState.publishToCatalog ? 'published' : 'draft',
      isFeatured: false,
      specificationSource: 'Admin Edited',
      sourceUrl: formState.sourceUrl.trim(),
      lastUpdated: formState.lastUpdated || new Date().toISOString(),
      stockStatus: formState.stockStatus,
      configKey,
    };

    if (editingProductId) {
      updateProduct(editingProductId, payload);
      showNotice('success', `Updated Dell Latitude ${formState.model} configuration.`);
    } else {
      addProduct(payload);
      showNotice('success', `Added Dell Latitude ${formState.model} (${formState.ram}/${formState.ssd}) to Firebase Inventory.`);
    }
    setEditModalOpen(false);
  };

  // Metrics for KPI cards
  const coveredTargetModelsCount = useMemo(() => {
    const presentModels = new Set(latitudeProducts.map((p) => p.model.toUpperCase()));
    return ALL_TARGET_LATITUDE_MODELS.filter((t) => presentModels.has(t.model.toUpperCase())).length;
  }, [latitudeProducts]);

  const totalPhysicalUnits = useMemo(
    () => latitudeProducts.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
    [latitudeProducts]
  );

  const unavailableCount = useMemo(
    () =>
      latitudeProducts.filter(
        (p) => p.stockStatus === 'Out of Stock' || p.stockStatus === 'Unavailable on BDStall' || p.stockQuantity <= 0
      ).length,
    [latitudeProducts]
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : toast.type === 'warning'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)} className="hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Dell Latitude • 6th – 11th Gen
            </span>
            <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Price Safety Active
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Laptop className="w-5 h-5 text-blue-400" />
            <span>Dell Latitude Inventory &amp; BDStall Import System</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track real BDStall market prices separately from your own Purchase Price, Selling Price &amp; Physical Stock. Zero invented prices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFetchLatestBdstallPrices}
            disabled={isFetchingBdstall}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingBdstall ? 'animate-spin' : ''}`} />
            <span>{isFetchingBdstall ? 'Fetching BDStall...' : 'Fetch Latest BDStall Prices'}</span>
          </button>

          {canWrite && (
            <>
              <button
                onClick={() => setActiveTab('import')}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Import Products</span>
              </button>

              <button
                onClick={() => openAddModal()}
                className="bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-extrabold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Configuration</span>
              </button>
            </>
          )}

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={handleExportCsv}
              className="text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold">Saved Latitude Configs</div>
          <div className="text-2xl font-black text-white mt-1">{latitudeProducts.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Distinct RAM/SSD variants</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold">Target Series Coverage</div>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {coveredTargetModelsCount} / {ALL_TARGET_LATITUDE_MODELS.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">6th–11th Gen models</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold">My Physical Stock</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{totalPhysicalUnits}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Units in showroom stock</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold">Duplicate Configs</div>
          <div className={`text-2xl font-black mt-1 ${duplicateKeySet.size > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {duplicateKeySet.size}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Exact model+RAM+SSD checks</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold">Out of Stock / Unlisted</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{unavailableCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {bdstallImportHistory[0]
              ? `Last sync: ${new Date(bdstallImportHistory[0].approvedAt).toLocaleDateString()}`
              : 'No BDStall import yet'}
          </div>
        </div>
      </div>

      {/* Duplicate Alert Banner */}
      {duplicateKeySet.size > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <CopyCheck className="w-4 h-4 shrink-0" />
            <span>
              Duplicate Product Detection: Found {duplicateKeySet.size} configuration key(s) with multiple entries in inventory.
            </span>
          </div>
          <button
            onClick={() => {
              setOnlyDuplicates(!onlyDuplicates);
              setActiveTab('inventory');
            }}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            {onlyDuplicates ? 'Show All Products' : 'Inspect Duplicates'}
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>View All Products ({latitudeProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('approval')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'approval'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>BDStall Approval Queue ({stagingRows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>6th–11th Gen Target Matrix ({ALL_TARGET_LATITUDE_MODELS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'import'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Bulk Import &amp; Sync Logs ({bdstallImportHistory.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: VIEW ALL PRODUCTS (SEARCH, FILTERS, 3-PRICE TABLE)   */}
      {/* ============================================================ */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search + Multi-Filters + Price Sort */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
                placeholder="Search by Model (e.g. 7420, E5470, i5)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterGen}
              onChange={(e) => setFilterGen(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Generations (6th–11th)</option>
              {GENERATIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={filterProcessor}
              onChange={(e) => setFilterProcessor(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Processors</option>
              <option value="i3">Core i3</option>
              <option value="i5">Core i5</option>
              <option value="i7">Core i7</option>
            </select>

            <select
              value={filterRam}
              onChange={(e) => setFilterRam(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All RAM</option>
              <option value="4GB">4GB RAM</option>
              <option value="8GB">8GB RAM</option>
              <option value="16GB">16GB RAM</option>
              <option value="32GB">32GB RAM</option>
            </select>

            <select
              value={filterSsd}
              onChange={(e) => setFilterSsd(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All SSD</option>
              <option value="128GB">128GB SSD</option>
              <option value="256GB">256GB SSD</option>
              <option value="512GB">512GB SSD</option>
              <option value="1TB">1TB SSD</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="model_asc">Sort: Model A–Z</option>
              <option value="market_asc">BDStall Market: Low → High</option>
              <option value="market_desc">BDStall Market: High → Low</option>
              <option value="selling_asc">My Selling Price: Low → High</option>
              <option value="selling_desc">My Selling Price: High → Low</option>
              <option value="purchase_asc">My Purchase Price: Low → High</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Stock Status:</span>
              {['all', 'In Stock', 'Out of Stock', 'Unavailable on BDStall'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStockStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    filterStockStatus === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>
            <span className="text-slate-400">
              Showing <strong className="text-white">{filteredLatitudeProducts.length}</strong> configuration(s)
            </span>
          </div>

          {/* Inventory Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Model &amp; Hardware Specs</th>
                    <th className="py-3 px-3">Display &amp; Condition</th>
                    <th className="py-3 px-3">BDStall Market Price</th>
                    <th className="py-3 px-3">My Purchase Price</th>
                    <th className="py-3 px-3">My Selling Price</th>
                    <th className="py-3 px-3">My Physical Stock</th>
                    <th className="py-3 px-3">Source &amp; Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredLatitudeProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 space-y-2">
                        <Laptop className="w-8 h-8 text-slate-600 mx-auto" />
                        <div className="font-bold text-slate-300">
                          No Dell Latitude configurations match your current filter.
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Click <strong>"Fetch Latest BDStall Prices"</strong>, upload a BDStall HTML/Excel snapshot, or add a configuration manually.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLatitudeProducts.map((prod) => {
                      const isDup = duplicateKeySet.has(prod.computedConfigKey);
                      const margin = (prod.sellingPrice || 0) - (prod.purchasePrice || 0);
                      const stockStatus =
                        prod.stockStatus || (prod.stockQuantity > 0 ? 'In Stock' : 'Out of Stock');

                      return (
                        <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-2.5">
                              <img
                                src={prod.images?.[0] || BRAND_LAPTOP_IMAGES.Dell}
                                alt={prod.model}
                                className="w-11 h-9 rounded-lg object-cover bg-slate-800 shrink-0 mt-0.5"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-white">
                                    Latitude {prod.model}
                                  </span>
                                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {prod.generation}
                                  </span>
                                  {isDup && (
                                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                      DUPLICATE
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-300 mt-0.5">
                                  {prod.processor} • <strong className="text-cyan-300">{prod.ramNorm}</strong> •{' '}
                                  <strong className="text-emerald-300">{prod.ssdNorm} SSD</strong>
                                  {prod.hddNorm !== 'None' ? ` + ${prod.hddNorm}` : ''}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                  ID: {prod.id} • SKU: {prod.sku}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="text-slate-200 font-medium">
                              {prod.screenSize || '14.0"'} • {prod.touchNorm}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {prod.resolution || '1920x1080 (FHD)'}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                              {prod.condition}
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono">
                            {typeof prod.marketPrice === 'number' && prod.marketPrice > 0 ? (
                              <div>
                                <div className="font-bold text-amber-300">
                                  ৳{prod.marketPrice.toLocaleString()}
                                  {prod.marketPriceMax && prod.marketPriceMax > prod.marketPrice && (
                                    <span className="text-[10px] text-slate-400">
                                      {' '}
                                      – ৳{prod.marketPriceMax.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() =>
                                    setSellerModalTarget({
                                      title: `Dell Latitude ${prod.model} (${prod.ramNorm} / ${prod.ssdNorm})`,
                                      sourceUrl: prod.sourceUrl,
                                      marketPrice: prod.marketPrice,
                                      marketPriceMin: prod.marketPriceMin,
                                      marketPriceMax: prod.marketPriceMax,
                                      sellers: prod.sellerListings || [],
                                    })
                                  }
                                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                                >
                                  <Store className="w-3 h-3" />
                                  <span>{prod.sellerCount || 1} seller(s)</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">
                                Unavailable / Not fetched
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono text-slate-300">
                            {prod.purchasePrice > 0 ? `৳${prod.purchasePrice.toLocaleString()}` : '৳0'}
                          </td>

                          <td className="py-3 px-3 font-mono">
                            <div className="font-extrabold text-white">
                              {prod.sellingPrice > 0 ? `৳${prod.sellingPrice.toLocaleString()}` : '৳0'}
                            </div>
                            {prod.sellingPrice > 0 && prod.purchasePrice > 0 && (
                              <div
                                className={`text-[10px] font-semibold ${
                                  margin >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {margin >= 0 ? '+' : ''}৳{margin.toLocaleString()} margin
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-white">
                              {prod.stockQuantity} unit(s)
                            </div>
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                                stockStatus === 'In Stock' && prod.stockQuantity > 0
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : stockStatus === 'Unavailable on BDStall'
                                  ? 'bg-slate-700 text-slate-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {stockStatus}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="text-[10px] text-slate-400">
                              {(prod.lastUpdated || prod.updatedAt || '').slice(0, 10)}
                            </div>
                            {prod.sourceUrl && (
                              <a
                                href={prod.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline mt-0.5"
                              >
                                <span>Source Link</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {canWrite && (
                                <>
                                  <button
                                    onClick={() => openEditModal(prod)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 text-[11px] font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <Edit className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Delete Latitude ${prod.model} (${prod.ramNorm}/${prod.ssdNorm})?`)) {
                                        permanentDeleteProduct(prod.id);
                                        showNotice('success', 'Deleted product from inventory.');
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: BDSTALL FETCH & ADMIN APPROVAL STAGING QUEUE         */}
      {/* ============================================================ */}
      {activeTab === 'approval' && (
        <div className="space-y-4">
          {fetchDiagnostics && (
            <div
              className={`rounded-2xl border p-4 space-y-2 ${
                fetchDiagnostics.status === 'ok'
                  ? 'bg-emerald-950/30 border-emerald-500/30'
                  : 'bg-amber-950/30 border-amber-500/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  {fetchDiagnostics.status === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  )}
                  <span>
                    {fetchDiagnostics.status === 'blocked_by_anti_bot'
                      ? 'BDStall Anti-Bot Protection Detected (Compliant Mode Active)'
                      : 'BDStall Extraction Summary'}
                  </span>
                </div>
                <a
                  href={fetchDiagnostics.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open BDStall Dell Latitude Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{fetchDiagnostics.message}</p>
              {fetchDiagnostics.excludedCount > 0 && (
                <div className="text-[11px] text-slate-400">
                  Excluded {fetchDiagnostics.excludedCount} non-Latitude or out-of-range (outside 6th–11th Gen) listing(s).
                </div>
              )}
            </div>
          )}

          {/* Permitted Snapshot Import Helper when Blocked or Updating via Saved HTML */}
          {(stagingRows.length === 0 || fetchDiagnostics?.status === 'blocked_by_anti_bot') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-cyan-400" />
                    <span>Permitted BDStall HTML Snapshot / Spreadsheet Importer</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Open{' '}
                    <a
                      href="https://www.bdstall.com/laptop/dell-latitude/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline"
                    >
                      bdstall.com/laptop/dell-latitude/
                    </a>{' '}
                    in your browser, save the page HTML (<code className="text-slate-300">Ctrl+S</code>) or copy its source, or upload CSV/Excel to extract exact listings without inventing prices.
                  </p>
                </div>

                <label className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Upload .HTML / .XLSX / .CSV</span>
                  <input
                    type="file"
                    accept=".html,.htm,.csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={htmlPasteInput}
                  onChange={(e) => setHtmlPasteInput(e.target.value)}
                  placeholder="Optional: Paste copied HTML from https://www.bdstall.com/laptop/dell-latitude/ here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleParseHtmlSnapshot()}
                    disabled={isParsingSnapshot || !htmlPasteInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black text-xs font-extrabold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    {isParsingSnapshot ? 'Parsing HTML...' : 'Parse Pasted BDStall HTML'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Approval Preview Staging Table */}
          {stagingRows.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Approval Preview ({stagingRows.filter((r) => r.selected).length} / {stagingRows.length} selected)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Review new &amp; updated prices before saving. Your Purchase Price &amp; Selling Price are never replaced automatically.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      setStagingRows((prev) =>
                        prev.map((r) => ({
                          ...r,
                          selected: r.matchStatus === 'new' || r.matchStatus === 'price_update',
                        }))
                      )
                    }
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    Select New &amp; Updated
                  </button>
                  <button
                    onClick={() => setStagingRows((prev) => prev.map((r) => ({ ...r, selected: false })))}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={handleApproveSelected}
                    className="bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve &amp; Save to Database</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Approve</th>
                      <th className="py-3 px-3">Status &amp; Match</th>
                      <th className="py-3 px-3">Extracted Latitude Config</th>
                      <th className="py-3 px-3">BDStall Market Price</th>
                      <th className="py-3 px-3">My Purchase Price (৳)</th>
                      <th className="py-3 px-3">My Selling Price (৳)</th>
                      <th className="py-3 px-3">My Stock Qty</th>
                      <th className="py-3 px-3">Catalog</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {stagingRows.map((row, idx) => (
                      <tr key={row.configKey + idx} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(e) =>
                              setStagingRows((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, selected: e.target.checked } : item
                                )
                              )
                            }
                            className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              row.matchStatus === 'new'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : row.matchStatus === 'price_update'
                                ? 'bg-blue-500/20 text-blue-300'
                                : row.matchStatus === 'duplicate_same'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {row.matchStatus === 'new'
                              ? 'New Config'
                              : row.matchStatus === 'price_update'
                              ? 'Price Update'
                              : row.matchStatus === 'duplicate_same'
                              ? 'Duplicate (Same Price)'
                              : 'Unavailable'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">{row.stockStatus}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-white">
                            Dell Latitude {row.model} ({row.generation})
                          </div>
                          <div className="text-[11px] text-slate-300">
                            {row.processor} • {row.ram} • {row.ssd} SSD
                            {row.hdd !== 'None' ? ` + ${row.hdd}` : ''}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {row.display} • {row.resolution} • {row.touchscreen}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono">
                          {row.marketPrice ? (
                            <div>
                              <span className="font-bold text-amber-300">
                                ৳{row.marketPrice.toLocaleString()}
                              </span>
                              {row.marketPriceMax && row.marketPriceMax > row.marketPrice && (
                                <span className="text-[10px] text-slate-400">
                                  {' '}
                                  – ৳{row.marketPriceMax.toLocaleString()}
                                </span>
                              )}
                              {typeof row.previousMarketPrice === 'number' &&
                                row.previousMarketPrice !== row.marketPrice && (
                                  <div className="text-[10px] text-slate-400">
                                    Prev: ৳{row.previousMarketPrice.toLocaleString()}
                                  </div>
                                )}
                              <div className="text-[10px] text-blue-400">
                                {row.sellerCount} seller(s)
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">No price listed</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min={0}
                            value={row.myPurchasePrice}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setStagingRows((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, myPurchasePrice: val } : it))
                              );
                            }}
                            className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                          />
                        </td>

                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min={0}
                            value={row.mySellingPrice}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setStagingRows((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, mySellingPrice: val } : it))
                              );
                            }}
                            className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                          />
                        </td>

                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min={0}
                            value={row.myStockQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setStagingRows((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, myStockQuantity: val } : it))
                              );
                            }}
                            className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                          />
                        </td>

                        <td className="py-3 px-3">
                          <label className="inline-flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={row.publishToCatalog}
                              onChange={(e) =>
                                setStagingRows((prev) =>
                                  prev.map((it, i) =>
                                    i === idx ? { ...it, publishToCatalog: e.target.checked } : it
                                  )
                                )
                              }
                            />
                            <span>Publish</span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: TARGET MODEL COVERAGE MATRIX (6th – 11th GEN)         */}
      {/* ============================================================ */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {GENERATIONS.map((gen) => {
            const targetModels = TARGET_LATITUDE_SERIES_BY_GEN[gen];
            return (
              <div key={gen} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-lg text-xs">
                      {gen}
                    </span>
                    <span>Dell Latitude Target Series ({targetModels.length} models)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {targetModels.map((modelCode) => {
                    const matching = latitudeProducts.filter(
                      (p) =>
                        p.model.toUpperCase() === modelCode.toUpperCase() &&
                        (p.generation === gen || !p.generation)
                    );
                    const verifiedPrices = matching
                      .map((m) => m.marketPrice)
                      .filter((v): v is number => typeof v === 'number' && v > 0);
                    const minMarket = verifiedPrices.length > 0 ? Math.min(...verifiedPrices) : null;
                    const maxMarket = verifiedPrices.length > 0 ? Math.max(...verifiedPrices) : null;
                    const totalStock = matching.reduce((s, m) => s + (m.stockQuantity || 0), 0);

                    return (
                      <div
                        key={`${gen}-${modelCode}`}
                        className={`p-3 rounded-xl border transition ${
                          matching.length > 0
                            ? 'bg-slate-950/80 border-emerald-500/30'
                            : 'bg-slate-950/40 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-white text-xs">
                            Latitude {modelCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              matching.length > 0
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {matching.length} config(s)
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400">
                          BDStall Market:{' '}
                          {minMarket ? (
                            <span className="text-amber-300 font-mono font-bold">
                              ৳{minMarket.toLocaleString()}
                              {maxMarket && maxMarket > minMarket ? `–৳${maxMarket.toLocaleString()}` : ''}
                            </span>
                          ) : (
                            <span className="italic text-slate-500">Not fetched</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-400">
                            My Stock: <strong className="text-white">{totalStock}</strong>
                          </span>
                          {canWrite && (
                            <button
                              onClick={() => openAddModal(modelCode, gen)}
                              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                            >
                              + Add Config
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: BULK IMPORT (CSV/EXCEL/HTML) & SYNC AUDIT LOGS        */}
      {/* ============================================================ */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Bulk Import CSV / Excel / Saved BDStall HTML</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a structured <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong> spreadsheet containing Dell Latitude 6th–11th Gen configurations, or upload a saved HTML file from{' '}
              <code className="text-slate-300">bdstall.com/laptop/dell-latitude/</code>. All imports route through duplicate detection &amp; admin approval first.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownloadImportTemplate('xlsx')}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel Template (.xlsx)</span>
              </button>
              <button
                onClick={() => handleDownloadImportTemplate('csv')}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV Template (.csv)</span>
              </button>
            </div>

            <label className="block border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-950/50">
              <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">
                Click to upload .XLSX, .XLS, .CSV, or .HTML file
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Strictly validates Dell Latitude 6th–11th Gen &amp; preserves distinct RAM/SSD configurations
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.html,.htm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <span>Approved BDStall Import Audit History</span>
            </h3>
            {bdstallImportHistory.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center">
                No BDStall import batches have been approved yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {bdstallImportHistory.map((batch) => (
                  <div
                    key={batch.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-[11px]">
                        {batch.importMethod.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(batch.approvedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      Approved: <strong className="text-emerald-400">{batch.approvedNewCount} new</strong>,{' '}
                      <strong className="text-blue-400">{batch.approvedUpdatedCount} updated</strong> (Skipped{' '}
                      {batch.skippedCount})
                    </div>
                    <div className="text-[10px] text-slate-500">By: {batch.approvedBy}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SELLER LISTINGS COMPARISON MODAL                             */}
      {/* ============================================================ */}
      {sellerModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white">{sellerModalTarget.title}</h3>
                <p className="text-[11px] text-slate-400">
                  BDStall Listed Seller Comparison (Market reference only — separate from your physical stock)
                </p>
              </div>
              <button
                onClick={() => setSellerModalTarget(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Recorded Market Price Range:</span>
              <span className="font-mono font-bold text-amber-300">
                {sellerModalTarget.marketPrice
                  ? `৳${sellerModalTarget.marketPrice.toLocaleString()}${
                      sellerModalTarget.marketPriceMax &&
                      sellerModalTarget.marketPriceMax > sellerModalTarget.marketPrice
                        ? ` – ৳${sellerModalTarget.marketPriceMax.toLocaleString()}`
                        : ''
                    }`
                  : 'N/A'}
              </span>
            </div>

            {sellerModalTarget.sellers.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sellerModalTarget.sellers.map((s, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{s.sellerName}</div>
                      {s.stockText && <div className="text-[10px] text-slate-400">{s.stockText}</div>}
                    </div>
                    <div className="font-mono font-bold text-emerald-400">
                      ৳{s.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-4">
                Individual seller breakdown was not included in the summary listing; view source URL for live seller offers.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              {sellerModalTarget.sourceUrl && (
                <a
                  href={sellerModalTarget.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <span>Open BDStall Listing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => setSellerModalTarget(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD / EDIT 19-FIELD DELL LATITUDE MODAL                      */}
      {/* ============================================================ */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveManualProduct}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {editingProductId ? 'Edit Dell Latitude Configuration' : 'Add Dell Latitude Configuration'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Three separate price fields preserved. Different RAM &amp; SSD configurations remain distinct products.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Exact Model *</label>
                <input
                  required
                  value={formState.model}
                  onChange={(e) => setFormState({ ...formState, model: e.target.value })}
                  placeholder="e.g. 7420, E5470"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Generation (6th–11th) *</label>
                <select
                  value={formState.generation}
                  onChange={(e) => setFormState({ ...formState, generation: e.target.value as LatitudeGen })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {GENERATIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Processor Model *</label>
                <input
                  required
                  value={formState.processor}
                  onChange={(e) => setFormState({ ...formState, processor: e.target.value })}
                  placeholder="e.g. Intel Core i5-1145G7"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">RAM Capacity *</label>
                <select
                  value={formState.ram}
                  onChange={(e) => setFormState({ ...formState, ram: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {['4GB', '8GB', '12GB', '16GB', '24GB', '32GB'].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">SSD Capacity *</label>
                <select
                  value={formState.ssd}
                  onChange={(e) => setFormState({ ...formState, ssd: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {['128GB', '256GB', '512GB', '1TB', '2TB', 'None'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">HDD Capacity (Optional)</label>
                <select
                  value={formState.hdd}
                  onChange={(e) => setFormState({ ...formState, hdd: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {['None', '500GB HDD', '1TB HDD', '2TB HDD'].map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Display Size</label>
                <input
                  value={formState.display}
                  onChange={(e) => setFormState({ ...formState, display: e.target.value })}
                  placeholder='e.g. 14.0"'
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Touchscreen</label>
                <select
                  value={formState.touchscreen}
                  onChange={(e) => setFormState({ ...formState, touchscreen: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Non-Touch">Non-Touch</option>
                  <option value="Touchscreen">Touchscreen</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Display Resolution</label>
                <input
                  value={formState.resolution}
                  onChange={(e) => setFormState({ ...formState, resolution: e.target.value })}
                  placeholder="1920x1080 (FHD)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Condition</label>
                <select
                  value={formState.condition}
                  onChange={(e) => setFormState({ ...formState, condition: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Dubai Grade A++">Dubai Grade A++</option>
                  <option value="Grade A+">Grade A+</option>
                  <option value="Grade A">Grade A</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Brand New">Brand New</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">My Physical Stock Qty</label>
                <input
                  type="number"
                  min={0}
                  value={formState.stockQuantity}
                  onChange={(e) => setFormState({ ...formState, stockQuantity: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Stock Status</label>
                <select
                  value={formState.stockStatus}
                  onChange={(e) => setFormState({ ...formState, stockStatus: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Unavailable on BDStall">Unavailable on BDStall</option>
                  <option value="Pending Fetch">Pending Fetch</option>
                </select>
              </div>
            </div>

            {/* 3 Separate Price Fields */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-amber-300 font-bold mb-1">
                  1. BDStall Market Price (৳)
                </label>
                <input
                  type="text"
                  value={formState.marketPrice}
                  onChange={(e) => setFormState({ ...formState, marketPrice: e.target.value })}
                  placeholder="Leave blank if unavailable"
                  className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-cyan-300 font-bold mb-1">
                  2. My Purchase Price (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formState.purchasePrice}
                  onChange={(e) => setFormState({ ...formState, purchasePrice: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">
                  3. My Selling Price (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formState.sellingPrice}
                  onChange={(e) => setFormState({ ...formState, sellingPrice: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Product Source URL</label>
                <input
                  type="url"
                  value={formState.sourceUrl}
                  onChange={(e) => setFormState({ ...formState, sourceUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Last Price Update Date</label>
                <input
                  type="date"
                  value={formState.lastUpdated}
                  onChange={(e) => setFormState({ ...formState, lastUpdated: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.publishToCatalog}
                  onChange={(e) => setFormState({ ...formState, publishToCatalog: e.target.checked })}
                />
                <span>Publish to Storefront Catalog when stock &gt; 0</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-extrabold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Save to Firebase
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
