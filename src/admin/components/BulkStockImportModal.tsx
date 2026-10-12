import React, { useState } from 'react';
import { useAdminStore } from '../adminStore';
import { Product, LaptopCondition } from '../types';
import { X, Upload, CheckCircle2, AlertCircle, FileText, Download, Layers, ArrowRight } from 'lucide-react';

interface BulkStockImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ParsedImportRow {
  index: number;
  brand: Product['brand'];
  series: string;
  model: string;
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  display: string;
  condition: LaptopCondition;
  grade: 'A++' | 'A+' | 'A' | 'B+' | 'B' | 'C';
  batteryCondition: string;
  warranty: string;
  sku: string;
  serialNumber?: string;
  purchasePrice: number;
  sellingPrice: number;
  discountPrice?: number;
  stockQuantity: number;
  isValid: boolean;
  errors: string[];
}

export const BulkStockImportModal: React.FC<BulkStockImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { products, addProduct } = useAdminStore();
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const existingSkus = new Set(products.map((p) => (p.sku || '').trim().toUpperCase()));
  const existingSerials = new Set(
    products
      .map((p) => (p.serialNumber || '').trim().toUpperCase())
      .filter(Boolean)
  );

  const handleDownloadSampleCsv = () => {
    const headers = [
      'Brand',
      'Series',
      'Model',
      'CPU',
      'RAM',
      'SSD',
      'GPU',
      'Display',
      'Condition',
      'Grade',
      'Battery',
      'Warranty',
      'SKU',
      'Serial',
      'PurchaseCost',
      'SellingPrice',
      'Stock',
    ];

    const sampleRows = [
      [
        'HP',
        'EliteBook',
        '840 G8',
        'Intel Core i5-1135G7',
        '16GB DDR4',
        '512GB NVMe SSD',
        'Intel Iris Xe',
        '14.0" FHD IPS',
        'Dubai Grade A++',
        'A++',
        '4-6 Hours (94%)',
        '1 Month Replacement + 5 Years Free Service',
        'JHF-HP-840G8-01',
        '5CD1234XYZ',
        '42000',
        '49500',
        '5',
      ],
      [
        'Dell',
        'Latitude',
        '7420',
        'Intel Core i5-1145G7 vPro',
        '16GB LPDDR4x',
        '512GB NVMe SSD',
        'Intel Iris Xe',
        '14.0" FHD 400 nits',
        'Dubai Grade A++',
        'A++',
        '5-7 Hours (92%)',
        '1 Month Replacement + 5 Years Free Service',
        'JHF-DELL-7420-01',
        '8KJ2901ABC',
        '43000',
        '50500',
        '3',
      ],
      [
        'Lenovo',
        'ThinkPad',
        'T14 Gen 2',
        'Intel Core i5-1135G7',
        '16GB DDR4',
        '512GB NVMe SSD',
        'Intel Iris Xe',
        '14.0" FHD IPS',
        'Dubai Grade A++',
        'A++',
        '5-6 Hours (91%)',
        '1 Month Replacement + 5 Years Free Service',
        'JHF-LEN-T14G2-01',
        'PF39019X',
        '44000',
        '51500',
        '4',
      ],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'jhf_laptop_stock_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvData = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length <= 1) {
      alert('CSV file is empty or missing data rows.');
      return;
    }

    const rows: ParsedImportRow[] = [];
    const seenFileSkus = new Set<string>();
    const seenFileSerials = new Set<string>();

    // Detect if header row exists
    const hasHeader =
      lines[0].toLowerCase().includes('brand') ||
      lines[0].toLowerCase().includes('model') ||
      lines[0].toLowerCase().includes('sku');

    const dataLines = hasHeader ? lines.slice(1) : lines;

    dataLines.forEach((line, idx) => {
      // Basic CSV splitter supporting quotes
      const values: string[] = [];
      let inQuotes = false;
      let cur = '';

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          values.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
      values.push(cur.trim());

      const cleanVal = (val?: string) => (val || '').replace(/^"|"$/g, '').trim();

      const brandRaw = cleanVal(values[0]) || 'Other';
      const series = cleanVal(values[1]) || 'Business';
      const model = cleanVal(values[2]);
      const cpu = cleanVal(values[3]) || 'Intel Core i5';
      const ram = cleanVal(values[4]) || '16GB DDR4';
      const ssd = cleanVal(values[5]) || '512GB NVMe SSD';
      const gpu = cleanVal(values[6]) || 'Intel Iris Xe';
      const display = cleanVal(values[7]) || '14.0" FHD IPS';
      const condition = (cleanVal(values[8]) as LaptopCondition) || 'Dubai Grade A++';
      const grade = (cleanVal(values[9]) as any) || 'A++';
      const battery = cleanVal(values[10]) || '4-5 Hours Backup (Good)';
      const warranty = cleanVal(values[11]) || '1 Month Replacement + 5 Years Free Service';
      const sku = cleanVal(values[12]) || `JHF-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`;
      const serial = cleanVal(values[13]) || '';
      const purchasePrice = parseFloat(cleanVal(values[14])) || 35000;
      const sellingPrice = parseFloat(cleanVal(values[15])) || 42000;
      const stock = parseInt(cleanVal(values[16]), 10) || 1;

      // Brand normalization
      let validBrand: Product['brand'] = 'Other';
      const bLower = brandRaw.toLowerCase();
      if (bLower.includes('hp')) validBrand = 'HP';
      else if (bLower.includes('dell')) validBrand = 'Dell';
      else if (bLower.includes('lenovo')) validBrand = 'Lenovo';
      else if (bLower.includes('apple')) validBrand = 'Apple';
      else if (bLower.includes('asus')) validBrand = 'Asus';
      else if (bLower.includes('acer')) validBrand = 'Acer';

      const errors: string[] = [];

      if (!model) errors.push('Model name is required');
      if (sellingPrice <= 0) errors.push('Selling price must be greater than 0');
      if (stock < 0) errors.push('Stock quantity cannot be negative');

      // SKU uniqueness check
      const upperSku = sku.toUpperCase();
      if (existingSkus.has(upperSku)) {
        errors.push(`Duplicate SKU: '${sku}' already exists in inventory`);
      } else if (seenFileSkus.has(upperSku)) {
        errors.push(`Duplicate SKU in file: '${sku}'`);
      }
      seenFileSkus.add(upperSku);

      // Serial uniqueness check
      if (serial) {
        const upperSerial = serial.toUpperCase();
        if (existingSerials.has(upperSerial)) {
          errors.push(`Duplicate Serial: '${serial}' already in system`);
        } else if (seenFileSerials.has(upperSerial)) {
          errors.push(`Duplicate Serial in file: '${serial}'`);
        }
        seenFileSerials.add(upperSerial);
      }

      rows.push({
        index: idx + 1,
        brand: validBrand,
        series,
        model: model || 'Unknown Model',
        processor: cpu,
        ram,
        storage: ssd,
        graphics: gpu,
        display,
        condition,
        grade,
        batteryCondition: battery,
        warranty,
        sku,
        serialNumber: serial || undefined,
        purchasePrice,
        sellingPrice,
        stockQuantity: stock,
        isValid: errors.length === 0,
        errors,
      });
    });

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setFileContent(text);
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const validItems = parsedRows.filter((r) => r.isValid);
    if (validItems.length === 0) {
      alert('No valid rows found to import.');
      return;
    }

    setIsProcessing(true);

    try {
      validItems.forEach((row) => {
        const fullName = `${row.brand} ${row.series} ${row.model} (${row.processor} / ${row.ram} / ${row.storage})`.trim();
        const slug = `${row.brand}-${row.model}-${row.sku}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const newProd: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
          sku: row.sku,
          name: fullName,
          slug,
          brand: row.brand,
          model: row.model,
          series: row.series,
          category: 'Business Laptop',
          condition: row.condition,
          grade: row.grade,
          processor: row.processor,
          generation: row.processor.includes('Gen') ? '11th Gen' : '',
          ram: row.ram,
          storage: row.storage,
          graphics: row.graphics,
          display: row.display,
          screenSize: '14.0"',
          resolution: '1920x1080',
          batteryCondition: row.batteryCondition,
          keyboardCondition: 'Original Backlit Keyboard',
          bodyCondition: `${row.grade} Dubai Tested Chassis`,
          operatingSystem: 'Windows 11 Pro 64-bit Genuine',
          includedAccessories: ['Original Charger', 'Power Cord', 'Laptop Bag'],
          purchasePrice: row.purchasePrice,
          sellingPrice: row.sellingPrice,
          discountPrice: row.sellingPrice,
          profitMargin: row.sellingPrice - row.purchasePrice,
          stockQuantity: row.stockQuantity,
          minimumStockAlert: 2,
          warranty: row.warranty,
          shortDescription: `Authentic ${row.brand} business laptop with ${row.processor}, ${row.ram}, ${row.storage}. 100% verified motherboard condition.`,
          specifications: `${row.display}, ${row.graphics}, Full Ports, High Performance.`,
          images: [
            'https://images.unsplash.com/photo-1544731612-de292439cc67?w=800&auto=format&fit=crop&q=80',
          ],
          status: 'published',
          isFeatured: true,
          serialNumber: row.serialNumber,
          specificationSource: 'Bulk Imported',
        };

        addProduct(newProd);
      });

      onSuccess(validItems.length);
      onClose();
    } catch (err: any) {
      alert('Error importing data: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0f17] border border-slate-800 w-full max-w-5xl rounded-2xl p-6 shadow-2xl relative my-8 max-h-[92vh] flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Bulk Stock Import</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CSV / EXCEL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Import multiple laptops directly with validation for duplicate SKUs, serials, and required specs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSampleCsv}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Sample CSV Template</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition bg-slate-900/40">
            <input
              type="file"
              accept=".csv, .txt, .tsv"
              id="bulk-csv-upload"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="bulk-csv-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <Upload className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="font-bold text-sm text-white">
                {fileName ? fileName : 'Choose CSV File or Drag & Drop'}
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Upload a CSV containing laptop inventory. Columns: Brand, Series, Model, CPU, RAM, SSD, GPU, Condition, SKU, Serial, Cost, Price, Stock.
              </p>
            </label>
          </div>

          {/* Verification Metrics */}
          {parsedRows.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">TOTAL ROWS</div>
                <div className="text-lg font-bold text-white mt-0.5">{parsedRows.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VALID ROWS</span>
                </div>
                <div className="text-lg font-bold text-emerald-300 mt-0.5">{validCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
                <div className="text-rose-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>INVALID / DUPLICATE</span>
                </div>
                <div className="text-lg font-bold text-rose-300 mt-0.5">{invalidCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <div className="text-blue-400">READY TO COMMIT</div>
                <div className="text-lg font-bold text-blue-300 mt-0.5">
                  {validCount > 0 ? `${validCount} units` : 'None'}
                </div>
              </div>
            </div>
          )}

          {/* Table Preview */}
          {parsedRows.length > 0 && (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>PREVIEW &amp; VALIDATION TABLE</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Only rows marked with <span className="text-emerald-400 font-bold">VALID</span> will be imported.
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900/90 text-slate-400 sticky top-0 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">Brand &amp; Model</th>
                      <th className="p-2.5">Specifications</th>
                      <th className="p-2.5">Serial</th>
                      <th className="p-2.5">Selling Price</th>
                      <th className="p-2.5">Stock</th>
                      <th className="p-2.5">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.index}
                        className={`hover:bg-slate-800/40 transition ${
                          row.isValid ? 'bg-slate-900/20' : 'bg-rose-950/20'
                        }`}
                      >
                        <td className="p-2.5 font-mono text-slate-500">{row.index}</td>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                              VALID
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold font-mono">
                              INVALID
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-white">{row.sku}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-white">
                            {row.brand} {row.model}
                          </div>
                          <div className="text-[10px] text-slate-400">{row.series}</div>
                        </td>
                        <td className="p-2.5 text-slate-300 text-[11px]">
                          <div>{row.processor}</div>
                          <div className="text-slate-400">
                            {row.ram} • {row.storage}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono text-slate-300">
                          {row.serialNumber || <span className="text-slate-500 italic">None</span>}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-400">
                          ৳ {row.sellingPrice.toLocaleString()}
                        </td>
                        <td className="p-2.5 font-mono text-white">{row.stockQuantity}</td>
                        <td className="p-2.5">
                          {row.errors.length > 0 ? (
                            <ul className="list-disc list-inside text-rose-400 text-[10px] leading-tight">
                              {row.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-emerald-400 text-[11px] font-semibold">Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={validCount === 0 || isProcessing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
              validCount > 0 && !isProcessing
                ? 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-600/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isProcessing ? (
              <span>IMPORTING TO INVENTORY...</span>
            ) : (
              <>
                <span>CONFIRM IMPORT ({validCount} VALID UNITS)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
