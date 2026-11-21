import type { Express, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const VOUCHER_CACHE_DIR = path.resolve(__dirname, '.voucher-cache');

interface VoucherPartUsage {
  id?: string;
  partName: string;
  partCode?: string;
  quantity: number;
  customerCharge: number;
  warrantyDays?: number;
  warrantyEnd?: string;
  serialNumber?: string;
}

export interface VoucherServiceJobSnapshot {
  id: string;
  publicVoucherToken?: string;
  createdAt?: string;
  updatedAt?: string;
  deliveredDate?: string;
  estimatedDeliveryDate?: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  laptopBrand: string;
  laptopModel: string;
  serialNumber?: string;
  assetId?: string;
  accessoriesReceived?: string[];
  customerComplaintText?: string;
  diagnosis?: string;
  workCompleted?: string;
  engineerName?: string;
  diagnosticFee?: number;
  laborCost?: number;
  partsCost?: number;
  otherCost?: number;
  discount?: number;
  totalCost?: number;
  paidAmount?: number;
  dueAmount?: number;
  serviceWarrantyDays?: number;
  serviceWarrantyEnd?: string;
  partsUsed?: VoucherPartUsage[];
}

const memoryVoucherCache = new Map<string, VoucherServiceJobSnapshot>();

function sanitizeJobId(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

function sanitizeToken(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

function ensureCacheDir() {
  try {
    if (!fs.existsSync(VOUCHER_CACHE_DIR)) {
      fs.mkdirSync(VOUCHER_CACHE_DIR, { recursive: true });
    }
  } catch {
    // non-fatal if filesystem is read-only
  }
}

function writeVoucherCache(job: VoucherServiceJobSnapshot) {
  const safeId = sanitizeJobId(job.id);
  if (!safeId || !job.publicVoucherToken) return;
  memoryVoucherCache.set(safeId, job);
  try {
    ensureCacheDir();
    fs.writeFileSync(
      path.join(VOUCHER_CACHE_DIR, `${safeId}.json`),
      JSON.stringify(job),
      'utf8'
    );
  } catch {
    // memory cache remains available
  }
}

function readLocalVoucherCache(jobId: string): VoucherServiceJobSnapshot | null {
  const safeId = sanitizeJobId(jobId);
  if (!safeId) return null;
  const mem = memoryVoucherCache.get(safeId);
  if (mem) return mem;
  try {
    const filePath = path.join(VOUCHER_CACHE_DIR, `${safeId}.json`);
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as VoucherServiceJobSnapshot;
      if (parsed && parsed.id) {
        memoryVoucherCache.set(safeId, parsed);
        return parsed;
      }
    }
  } catch {
    // ignore corrupt cache file
  }
  return null;
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

async function fetchServiceJobFromFirestore(jobId: string): Promise<VoucherServiceJobSnapshot | null> {
  try {
    const rawCfg = fs.readFileSync(path.join(ROOT_DIR, 'firebase-applet-config.json'), 'utf8');
    const cfg = JSON.parse(rawCfg) as { projectId?: string; firestoreDatabaseId?: string };
    if (!cfg.projectId || !cfg.firestoreDatabaseId) return null;

    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      cfg.projectId
    )}/databases/${encodeURIComponent(cfg.firestoreDatabaseId)}/documents/services/${encodeURIComponent(
      jobId
    )}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      const resp = await fetch(url, { signal: controller.signal });
      if (!resp.ok) return null;
      const docJson: any = await resp.json();
      const fields = docJson?.fields;
      if (!fields || typeof fields !== 'object') return null;
      const decoded: Record<string, any> = { id: jobId };
      for (const [k, v] of Object.entries(fields)) {
        decoded[k] = decodeFirestoreValue(v);
      }
      return decoded as VoucherServiceJobSnapshot;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

function tokensMatch(expected: string | undefined, provided: string): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function formatPdfDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
}

function formatPdfMoney(amount?: number): string {
  const num = Number(amount || 0);
  return `BDT ${Math.round(num).toLocaleString('en-US')}`;
}

function formatPdfWarranty(days?: number | null, emptyLabel = 'No Warranty'): string {
  if (days === undefined || days === null || Number.isNaN(Number(days))) {
    return emptyLabel;
  }
  const n = Math.max(0, Math.round(Number(days)));
  if (n === 0) return emptyLabel;
  if (n === 30) return '30 Days (1 Month)';
  if (n === 90) return '90 Days (3 Months)';
  if (n === 180) return '180 Days (6 Months)';
  if (n === 365) return '365 Days (1 Year)';
  if (n === 730) return '730 Days (2 Years)';
  return `${n} Days`;
}

function streamServiceVoucherPdf(job: VoucherServiceJobSnapshot, res: Response) {
  const safeId = sanitizeJobId(job.id) || 'Service-Voucher';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="JHF-Service-Voucher-${safeId}.pdf"`
  );
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const doc = new PDFDocument({
    size: 'A4',
    margin: 36,
    info: {
      Title: `JHF Service Voucher - ${safeId}`,
      Author: 'JHF Laptop Zone',
      Subject: `Service Voucher & Invoice for ${job.customerName} (${job.laptopBrand} ${job.laptopModel})`,
    },
  });

  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const ensureSpace = (neededHeight: number) => {
    if (doc.y + neededHeight > pageHeight - margin - 24) {
      doc.addPage();
    }
  };

  // --- HEADER ---
  const headerTop = doc.y;

  // Left: Store Brand & Lab Locations
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor('#1d4ed8')
    .text('JHF ', margin, headerTop, { continued: true })
    .fillColor('#0f172a')
    .text('LAPTOP ZONE');

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#334155')
    .text('LAPTOP SALES, CHIP-LEVEL MICRO-SOLDERING & DIAGNOSTICS LAB', margin, doc.y + 2);

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#475569')
    .text(
      'Main Lab: Shop 1001 & 1040, Level 10, Multiplan Centre, New Elephant Road, Dhaka',
      margin,
      doc.y + 4,
      { width: 320 }
    )
    .text('Branch: Baroipara Bazar, Chandra, Gazipur', margin, doc.y + 2, { width: 320 })
    .text('Hotline: +8801935693071  |  Email: jhflaptopzone@gmail.com', margin, doc.y + 2, {
      width: 320,
    });

  const leftBottom = doc.y;

  // Right: Voucher Info Box
  const rightBoxWidth = 185;
  const rightBoxX = pageWidth - margin - rightBoxWidth;
  doc
    .save()
    .roundedRect(rightBoxX, headerTop, rightBoxWidth, 74, 6)
    .fillAndStroke('#f8fafc', '#cbd5e1')
    .restore();

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#1e40af')
    .text('SERVICE VOUCHER / INVOICE', rightBoxX + 10, headerTop + 8, {
      width: rightBoxWidth - 20,
      align: 'right',
    });

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#0f172a')
    .text(job.id, rightBoxX + 10, headerTop + 20, {
      width: rightBoxWidth - 20,
      align: 'right',
    });

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#475569')
    .text(`Intake: ${formatPdfDate(job.createdAt)}`, rightBoxX + 10, headerTop + 36, {
      width: rightBoxWidth - 20,
      align: 'right',
    })
    .text(
      `Delivery: ${formatPdfDate(job.deliveredDate || job.estimatedDeliveryDate)}`,
      rightBoxX + 10,
      headerTop + 47,
      {
        width: rightBoxWidth - 20,
        align: 'right',
      }
    );

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#065f46')
    .text(`STATUS: ${job.status || 'RECEIVED'}`, rightBoxX + 10, headerTop + 59, {
      width: rightBoxWidth - 20,
      align: 'right',
    });

  const dividerY = Math.max(leftBottom, headerTop + 76) + 8;
  doc
    .moveTo(margin, dividerY)
    .lineTo(pageWidth - margin, dividerY)
    .lineWidth(1.5)
    .strokeColor('#0f172a')
    .stroke();

  doc.y = dividerY + 12;

  // --- CUSTOMER & DEVICE TWO-COLUMN BOXES ---
  const colGap = 12;
  const colWidth = (contentWidth - colGap) / 2;
  const infoStartY = doc.y;
  const boxHeight = 82;

  doc
    .save()
    .roundedRect(margin, infoStartY, colWidth, boxHeight, 5)
    .fillAndStroke('#f8fafc', '#e2e8f0')
    .roundedRect(margin + colWidth + colGap, infoStartY, colWidth, boxHeight, 5)
    .fillAndStroke('#f8fafc', '#e2e8f0')
    .restore();

  // Left card: Customer
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#64748b')
    .text('CUSTOMER DETAILS', margin + 10, infoStartY + 8, { width: colWidth - 20 });

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#0f172a')
    .text(`Name: ${job.customerName || 'N/A'}`, margin + 10, infoStartY + 22, { width: colWidth - 20 })
    .text(`Phone: ${job.customerPhone || 'N/A'}`, margin + 10, doc.y + 2, { width: colWidth - 20 });

  if (job.customerEmail) {
    doc.text(`Email: ${job.customerEmail}`, margin + 10, doc.y + 2, { width: colWidth - 20 });
  }
  if (job.customerAddress) {
    doc.text(`Address: ${job.customerAddress}`, margin + 10, doc.y + 2, {
      width: colWidth - 20,
      height: 22,
      ellipsis: true,
    });
  }

  // Right card: Device
  const rightColX = margin + colWidth + colGap;
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#64748b')
    .text('DEVICE UNDER SERVICE', rightColX + 10, infoStartY + 8, { width: colWidth - 20 });

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#0f172a')
    .text(
      `Model: ${job.laptopBrand || ''} ${job.laptopModel || ''}`.trim(),
      rightColX + 10,
      infoStartY + 22,
      { width: colWidth - 20 }
    )
    .text(`Serial (S/N): ${job.serialNumber || 'N/A'}`, rightColX + 10, doc.y + 2, {
      width: colWidth - 20,
    });

  if (job.assetId) {
    doc.text(`Asset ID: ${job.assetId}`, rightColX + 10, doc.y + 2, { width: colWidth - 20 });
  }
  if (Array.isArray(job.accessoriesReceived) && job.accessoriesReceived.length > 0) {
    doc.text(`Accessories: ${job.accessoriesReceived.join(', ')}`, rightColX + 10, doc.y + 2, {
      width: colWidth - 20,
      height: 22,
      ellipsis: true,
    });
  }

  doc.y = infoStartY + boxHeight + 12;

  // --- COMPLAINT / DIAGNOSIS / WORK SUMMARY ---
  const summaryLines: { label: string; value: string; color: string }[] = [
    {
      label: 'Customer Complaint: ',
      value: job.customerComplaintText || 'Standard servicing and diagnostic check.',
      color: '#0f172a',
    },
  ];
  if (job.diagnosis) {
    summaryLines.push({ label: 'Technical Diagnosis: ', value: job.diagnosis, color: '#1e3a8a' });
  }
  if (job.workCompleted) {
    summaryLines.push({ label: 'Work Performed: ', value: job.workCompleted, color: '#065f46' });
  }

  let estSummaryHeight = 16;
  doc.font('Helvetica').fontSize(8.5);
  for (const item of summaryLines) {
    estSummaryHeight +=
      doc.heightOfString(`${item.label}${item.value}`, { width: contentWidth - 20 }) + 4;
  }

  ensureSpace(estSummaryHeight + 10);
  const sumTop = doc.y;
  doc
    .save()
    .roundedRect(margin, sumTop, contentWidth, estSummaryHeight, 5)
    .fillAndStroke('#eff6ff', '#bfdbfe')
    .restore();

  let curSumY = sumTop + 8;
  for (const item of summaryLines) {
    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(item.color)
      .text(item.label, margin + 10, curSumY, { width: contentWidth - 20, continued: true })
      .font('Helvetica')
      .fillColor('#334155')
      .text(item.value);
    curSumY = doc.y + 3;
  }

  doc.y = sumTop + estSummaryHeight + 14;

  // --- CHARGES TABLE ---
  interface TableRow {
    sl: string;
    title: string;
    sub?: string;
    warranty: string;
    qty: string;
    amount: string;
  }

  const rows: TableRow[] = [];
  const nextSl = () => String(rows.length + 1).padStart(2, '0');
  const serviceWarrantyLabel = formatPdfWarranty(job.serviceWarrantyDays ?? 0, 'No Service Warranty');

  if ((job.diagnosticFee || 0) > 0) {
    rows.push({
      sl: nextSl(),
      title: 'Comprehensive Hardware Diagnostics & Bench Testing',
      sub: 'Power rail measurements, voltage diagnostics, and inspection',
      warranty: '-',
      qty: '1',
      amount: formatPdfMoney(job.diagnosticFee),
    });
  }

  if ((job.laborCost || 0) > 0) {
    rows.push({
      sl: nextSl(),
      title: 'Service Labor & Micro-Soldering Charges',
      sub: `Performed by ${job.engineerName || 'JHF Senior Hardware Engineer'}`,
      warranty: (job.serviceWarrantyDays ?? 0) > 0 ? serviceWarrantyLabel : 'No Warranty',
      qty: '1',
      amount: formatPdfMoney(job.laborCost),
    });
  }

  for (const part of job.partsUsed || []) {
    const wLabel = formatPdfWarranty(part.warrantyDays ?? 0);
    const wEnd =
      (part.warrantyDays ?? 0) > 0 && part.warrantyEnd
        ? `${wLabel}\n(Till ${formatPdfDate(part.warrantyEnd)})`
        : wLabel;
    rows.push({
      sl: nextSl(),
      title: part.partName,
      sub: `Part Code: ${part.partCode || 'N/A'}${part.serialNumber ? ` | S/N: ${part.serialNumber}` : ''}`,
      warranty: wEnd,
      qty: String(part.quantity || 1),
      amount: formatPdfMoney(part.customerCharge),
    });
  }

  if ((job.otherCost || 0) > 0) {
    rows.push({
      sl: nextSl(),
      title: 'Miscellaneous Supplies & Cleaning Consumables',
      warranty: '-',
      qty: '1',
      amount: formatPdfMoney(job.otherCost),
    });
  }

  const colSL = 28;
  const colDesc = 235;
  const colWarr = 115;
  const colQty = 40;
  const colAmt = contentWidth - colSL - colDesc - colWarr - colQty;

  const drawTableHeader = () => {
    const thY = doc.y;
    doc
      .save()
      .rect(margin, thY, contentWidth, 22)
      .fill('#f1f5f9')
      .restore();
    doc
      .moveTo(margin, thY + 22)
      .lineTo(pageWidth - margin, thY + 22)
      .lineWidth(1.2)
      .strokeColor('#0f172a')
      .stroke();

    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e293b');
    doc.text('SL', margin + 6, thY + 7, { width: colSL - 8 });
    doc.text('DESCRIPTION / SERVICE & SPARE PARTS', margin + colSL + 4, thY + 7, {
      width: colDesc - 8,
    });
    doc.text('WARRANTY', margin + colSL + colDesc + 4, thY + 7, {
      width: colWarr - 8,
      align: 'center',
    });
    doc.text('QTY', margin + colSL + colDesc + colWarr + 2, thY + 7, {
      width: colQty - 4,
      align: 'center',
    });
    doc.text('AMOUNT (BDT)', margin + colSL + colDesc + colWarr + colQty + 2, thY + 7, {
      width: colAmt - 8,
      align: 'right',
    });
    doc.y = thY + 24;
  };

  ensureSpace(60);
  drawTableHeader();

  if (rows.length === 0) {
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor('#64748b')
      .text('No billable charges recorded on this service sheet yet.', margin, doc.y + 10, {
        width: contentWidth,
        align: 'center',
      });
    doc.y += 14;
  } else {
    for (const r of rows) {
      doc.font('Helvetica-Bold').fontSize(8.5);
      const titleH = doc.heightOfString(r.title, { width: colDesc - 8 });
      doc.font('Helvetica').fontSize(7.5);
      const subH = r.sub ? doc.heightOfString(r.sub, { width: colDesc - 8 }) + 2 : 0;
      const warrH = doc.heightOfString(r.warranty, { width: colWarr - 8 });
      const rowH = Math.max(titleH + subH, warrH, 16) + 10;

      if (doc.y + rowH > pageHeight - margin - 24) {
        doc.addPage();
        drawTableHeader();
      }

      const ry = doc.y;
      doc.font('Helvetica').fontSize(8.5).fillColor('#334155');
      doc.text(r.sl, margin + 6, ry + 5, { width: colSL - 8 });

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#0f172a')
        .text(r.title, margin + colSL + 4, ry + 5, { width: colDesc - 8 });
      if (r.sub) {
        doc
          .font('Helvetica')
          .fontSize(7.3)
          .fillColor('#64748b')
          .text(r.sub, margin + colSL + 4, ry + 5 + titleH + 1, { width: colDesc - 8 });
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(7.8)
        .fillColor(r.warranty.includes('No') || r.warranty === '-' ? '#64748b' : '#047857')
        .text(r.warranty, margin + colSL + colDesc + 4, ry + 5, {
          width: colWarr - 8,
          align: 'center',
        });

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#0f172a')
        .text(r.qty, margin + colSL + colDesc + colWarr + 2, ry + 5, {
          width: colQty - 4,
          align: 'center',
        });

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#0f172a')
        .text(r.amount, margin + colSL + colDesc + colWarr + colQty + 2, ry + 5, {
          width: colAmt - 8,
          align: 'right',
        });

      doc
        .moveTo(margin, ry + rowH)
        .lineTo(pageWidth - margin, ry + rowH)
        .lineWidth(0.5)
        .strokeColor('#e2e8f0')
        .stroke();

      doc.y = ry + rowH;
    }
  }

  doc.y += 10;

  // --- TOTALS SUMMARY ---
  ensureSpace(95);
  const grossSubtotal =
    (job.diagnosticFee || 0) +
    (job.laborCost || 0) +
    (job.partsCost || 0) +
    (job.otherCost || 0);

  const totalsWidth = 210;
  const totalsX = pageWidth - margin - totalsWidth;
  let ty = doc.y;

  const drawTotalRow = (
    label: string,
    val: string,
    opts?: { bold?: boolean; size?: number; color?: string; valColor?: string; topRule?: boolean }
  ) => {
    if (opts?.topRule) {
      doc
        .moveTo(totalsX, ty)
        .lineTo(pageWidth - margin, ty)
        .lineWidth(opts.bold ? 1.2 : 0.6)
        .strokeColor(opts.bold ? '#0f172a' : '#cbd5e1')
        .stroke();
      ty += 4;
    }
    doc
      .font(opts?.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(opts?.size || 8.5)
      .fillColor(opts?.color || '#475569')
      .text(label, totalsX, ty, { width: 110 });
    doc
      .font(opts?.bold ? 'Helvetica-Bold' : 'Helvetica-Bold')
      .fontSize(opts?.size || 8.5)
      .fillColor(opts?.valColor || '#0f172a')
      .text(val, totalsX + 110, ty, { width: totalsWidth - 110, align: 'right' });
    ty += (opts?.size || 8.5) + 6;
  };

  drawTotalRow('Gross Subtotal:', formatPdfMoney(grossSubtotal));
  if ((job.discount || 0) > 0) {
    drawTotalRow('Discount Applied:', `-${formatPdfMoney(job.discount)}`, {
      color: '#047857',
      valColor: '#047857',
    });
  }
  drawTotalRow('Net Payable:', formatPdfMoney(job.totalCost || 0), {
    bold: true,
    size: 10,
    color: '#0f172a',
    valColor: '#1d4ed8',
    topRule: true,
  });
  drawTotalRow('Paid Amount:', formatPdfMoney(job.paidAmount || 0), {
    bold: true,
    color: '#334155',
    valColor: '#047857',
  });
  drawTotalRow('Balance Due:', formatPdfMoney(job.dueAmount || 0), {
    bold: true,
    color: '#0f172a',
    valColor: (job.dueAmount || 0) > 0 ? '#be123c' : '#047857',
    topRule: true,
  });

  doc.y = ty + 10;

  // --- WARRANTY BOX ---
  const warrantyParts = (job.partsUsed || []).filter((p) => (p.warrantyDays ?? 0) > 0);
  const warrantyBoxEstHeight = 78 + (warrantyParts.length > 0 ? warrantyParts.length * 13 + 22 : 0);
  ensureSpace(warrantyBoxEstHeight + 65);

  const wBoxTop = doc.y;
  const wTitle = `JHF Service & Spare Parts Warranty Coverage (${
    (job.serviceWarrantyDays ?? 0) > 0 ? `${serviceWarrantyLabel} Service Guarantee` : 'No Service Labor Warranty'
  })`;

  // Measure actual height first
  let measuredWHeight = 26;
  doc.font('Helvetica').fontSize(7.8);
  const term1 =
    (job.serviceWarrantyDays ?? 0) > 0
      ? `1. JHF Laptop Zone covers labor and rework under warranty until ${formatPdfDate(
          job.serviceWarrantyEnd
        )}. Replaced spare parts carry exact warranty terms shown above.`
      : '1. Replaced spare parts carry only the specific component warranty listed in the voucher table above.';
  const term2 =
    '2. Warranty is strictly void in the event of liquid spillage, physical drop/impact, burn marks/power surge, broken seal/sticker, or unauthorized third-party tampering.';
  const term3 = '3. For warranty support & inquiries: Hotline +8801935693071 | Email: jhflaptopzone@gmail.com';

  measuredWHeight += doc.heightOfString(term1, { width: contentWidth - 20 }) + 3;
  measuredWHeight += doc.heightOfString(term2, { width: contentWidth - 20 }) + 3;
  measuredWHeight += doc.heightOfString(term3, { width: contentWidth - 20 }) + 8;
  if (warrantyParts.length > 0) {
    measuredWHeight += 20 + warrantyParts.length * 13;
  }

  doc
    .save()
    .roundedRect(margin, wBoxTop, contentWidth, measuredWHeight, 5)
    .fillAndStroke('#f8fafc', '#cbd5e1')
    .restore();

  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor('#0f172a')
    .text(wTitle, margin + 10, wBoxTop + 8, { width: contentWidth - 20 });

  if (job.serviceWarrantyEnd && (job.serviceWarrantyDays ?? 0) > 0) {
    doc
      .font('Helvetica-Bold')
      .fontSize(7.8)
      .fillColor('#047857')
      .text(
        `Service Valid Until: ${formatPdfDate(job.serviceWarrantyEnd)}`,
        margin + 10,
        wBoxTop + 8,
        { width: contentWidth - 20, align: 'right' }
      );
  }

  let wy = doc.y + 5;
  if (warrantyParts.length > 0) {
    doc
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .fillColor('#065f46')
      .text('INSTALLED SPARE PARTS WARRANTY CERTIFICATE:', margin + 10, wy);
    wy = doc.y + 2;
    for (const part of warrantyParts) {
      const partTxt = `- ${part.quantity}x ${part.partName} (${part.partCode || 'N/A'}): ${formatPdfWarranty(
        part.warrantyDays
      )}${part.warrantyEnd ? ` (Till ${formatPdfDate(part.warrantyEnd)})` : ''}`;
      doc.font('Helvetica').fontSize(7.8).fillColor('#1e293b').text(partTxt, margin + 14, wy, {
        width: contentWidth - 28,
      });
      wy = doc.y + 1;
    }
    wy += 4;
  }

  doc.font('Helvetica').fontSize(7.8).fillColor('#475569');
  doc.text(term1, margin + 10, wy, { width: contentWidth - 20 });
  doc.text(term2, margin + 10, doc.y + 2, { width: contentWidth - 20 });
  doc.text(term3, margin + 10, doc.y + 2, { width: contentWidth - 20 });

  doc.y = wBoxTop + measuredWHeight + 26;

  // --- SIGNATURES ---
  ensureSpace(55);
  const sigY = doc.y + 14;
  const sigW = 150;
  const leftSigX = margin + 45;
  const rightSigX = pageWidth - margin - 45 - sigW;

  doc
    .moveTo(leftSigX, sigY)
    .lineTo(leftSigX + sigW, sigY)
    .lineWidth(0.8)
    .strokeColor('#64748b')
    .stroke();
  doc
    .moveTo(rightSigX, sigY)
    .lineTo(rightSigX + sigW, sigY)
    .lineWidth(0.8)
    .strokeColor('#64748b')
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor('#0f172a')
    .text('Customer Signature', leftSigX, sigY + 5, { width: sigW, align: 'center' })
    .text('Authorized JHF Signature', rightSigX, sigY + 5, { width: sigW, align: 'center' });

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#64748b')
    .text('Received laptop tested & in working order', leftSigX, sigY + 17, {
      width: sigW,
      align: 'center',
    })
    .text('Service Department & Quality Check Passed', rightSigX, sigY + 17, {
      width: sigW,
      align: 'center',
    });

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#94a3b8')
    .text(
      `Public Digital Service Voucher | Job ID: ${job.id} | Generated by JHF Laptop Zone`,
      margin,
      pageHeight - margin - 10,
      { width: contentWidth, align: 'center' }
    );

  doc.end();
}

export function registerServiceVoucherRoutes(app: Express) {
  // Register / sync a service voucher snapshot with its unique public token
  app.post('/api/service-voucher/register', (req: Request, res: Response) => {
    const rawJob = req.body?.job as VoucherServiceJobSnapshot | undefined;
    if (!rawJob || typeof rawJob !== 'object' || !rawJob.id || !rawJob.publicVoucherToken) {
      res.status(400).json({ ok: false, error: 'Missing service job id or publicVoucherToken.' });
      return;
    }

    const safeId = sanitizeJobId(rawJob.id);
    const safeToken = sanitizeToken(rawJob.publicVoucherToken);
    if (!safeId || safeToken.length < 8) {
      res.status(400).json({ ok: false, error: 'Invalid service voucher identifier or token.' });
      return;
    }

    const normalizedJob: VoucherServiceJobSnapshot = {
      ...rawJob,
      id: safeId,
      publicVoucherToken: safeToken,
    };

    writeVoucherCache(normalizedJob);
    res.json({
      ok: true,
      jobId: safeId,
      pdfPath: `/service-voucher/${encodeURIComponent(safeId)}/${encodeURIComponent(safeToken)}.pdf`,
    });
  });

  // Public unique PDF viewer endpoint (no login required, token-authenticated via URL)
  app.get('/service-voucher/:jobId/:token', async (req: Request, res: Response) => {
    const safeJobId = sanitizeJobId(req.params.jobId);
    const safeToken = sanitizeToken(req.params.token);

    if (!safeJobId || safeToken.length < 8) {
      res.status(404).send('Service voucher PDF link is invalid or incomplete.');
      return;
    }

    // Prefer latest persisted Firestore copy, with instant local cache fallback
    const [firestoreJob, cachedJob] = await Promise.all([
      fetchServiceJobFromFirestore(safeJobId),
      Promise.resolve(readLocalVoucherCache(safeJobId)),
    ]);

    let matchedJob: VoucherServiceJobSnapshot | null = null;
    if (firestoreJob && tokensMatch(firestoreJob.publicVoucherToken, safeToken)) {
      matchedJob = firestoreJob;
      writeVoucherCache(firestoreJob);
    } else if (cachedJob && tokensMatch(cachedJob.publicVoucherToken, safeToken)) {
      matchedJob = cachedJob;
    }

    if (!matchedJob) {
      res
        .status(404)
        .send('Service voucher PDF not found or link has expired. Please request a fresh voucher link from JHF Laptop Zone.');
      return;
    }

    try {
      streamServiceVoucherPdf(matchedJob, res);
    } catch (err) {
      console.error('Failed to stream service voucher PDF:', err);
      if (!res.headersSent) {
        res.status(500).send('Unable to generate service voucher PDF right now.');
      }
    }
  });
}
