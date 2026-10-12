import React, { useState, useRef } from 'react';
import { Printer, Download, Edit3, Check, X, Copy, CheckCheck } from 'lucide-react';
import { Order } from '../types';

export function numberToWordsBDT(num: number): string {
  if (!num || num === 0) return 'Zero Taka Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' ';
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  const cleanNum = Math.floor(Math.abs(num));
  const words = inWords(cleanNum).trim();
  return (words ? words : 'Zero') + ' Taka Only';
}

export interface InvoiceItem {
  id?: string;
  name: string;
  specs?: string;
  serialNo?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  salesBy: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: InvoiceItem[];
  totalAmount: number;
  inWords: string;
  fullLaptopWarranty: string;
  serviceWarranty: string;
  softwareAuthor: string;
}

interface SalesInvoiceModalProps {
  order?: Order | null;
  onClose: () => void;
}

export const SalesInvoiceModal: React.FC<SalesInvoiceModalProps> = ({ order, onClose }) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.07);

  // Initialize data from order or defaults
  const initialItems: InvoiceItem[] = order?.items && order.items.length > 0
    ? order.items.map((it, idx) => ({
        id: String(idx + 1),
        name: it.productName,
        specs: it.specs || 'i5 11th gen, 8gb ram, 256gb ssd',
        serialNo: (it as any).serialNo || 'Not Collect Yet',
        quantity: it.quantity || 1,
        unitPrice: it.unitPrice || 0,
        amount: (it.unitPrice || 0) * (it.quantity || 1),
      }))
    : [
        {
          id: '1',
          name: 'ThinkPad L14 Gen 2',
          specs: 'i5 11th gen, 8gb ram, 256gb ssd',
          serialNo: 'Not Collect Yet',
          quantity: 1,
          unitPrice: 40000,
          amount: 40000,
        },
      ];

  const initialTotal = order ? order.totalAmount : 40000;

  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNo: order?.orderNumber || `JHF${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(1000000 + Math.random() * 9000000)}`,
    date: order?.createdAt ? order.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    salesBy: order?.salesBy || 'Jahid Hasan',
    customerName: order?.customerName || 'Nahid Vai',
    customerPhone: order?.customerPhone || '01713447336',
    customerAddress: order?.deliveryAddress || 'Walton Factory',
    items: initialItems,
    totalAmount: initialTotal,
    inWords: numberToWordsBDT(initialTotal),
    fullLaptopWarranty: '1 Month',
    serviceWarranty: '5 Years',
    softwareAuthor: 'Software Developed By Jahid Hasan | JHF Laptop Zone',
  });

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...invoice.items];
    const target = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : target.quantity;
      const p = field === 'unitPrice' ? Number(value) : target.unitPrice;
      target.amount = (q || 0) * (p || 0);
    }
    updated[index] = target;

    const newTotal = updated.reduce((sum, it) => sum + (it.amount || 0), 0);
    setInvoice((prev) => ({
      ...prev,
      items: updated,
      totalAmount: newTotal,
      inWords: numberToWordsBDT(newTotal),
    }));
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: String(invoice.items.length + 1),
      name: 'Dell Latitude 7400',
      specs: 'i7 8th gen, 16gb ram, 512gb ssd',
      serialNo: 'Not Collect Yet',
      quantity: 1,
      unitPrice: 35000,
      amount: 35000,
    };
    const updated = [...invoice.items, newItem];
    const newTotal = updated.reduce((sum, it) => sum + (it.amount || 0), 0);
    setInvoice((prev) => ({
      ...prev,
      items: updated,
      totalAmount: newTotal,
      inWords: numberToWordsBDT(newTotal),
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (invoice.items.length <= 1) return;
    const updated = invoice.items.filter((_, i) => i !== index);
    const newTotal = updated.reduce((sum, it) => sum + (it.amount || 0), 0);
    setInvoice((prev) => ({
      ...prev,
      items: updated,
      totalAmount: newTotal,
      inWords: numberToWordsBDT(newTotal),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textReceipt = `*JHF LAPTOP ZONE - SALES INVOICE*
Invoice No: ${invoice.invoiceNo}
Date: ${invoice.date}
Sales By: ${invoice.salesBy}

Customer: ${invoice.customerName}
Mobile: ${invoice.customerPhone}
Address: ${invoice.customerAddress}

ITEMS:
${invoice.items
  .map(
    (it, idx) =>
      `${idx + 1}. ${it.name} (${it.specs}) | Qty: ${it.quantity} | Total: ৳${it.amount}`
  )
  .join('\n')}

TOTAL: ৳${invoice.totalAmount}
In Words: ${invoice.inWords}
Warranty: Full Laptop: ${invoice.fullLaptopWarranty} | Service: ${invoice.serviceWarranty}

Main Office: Sonali Trade, Shop No: 1001 & 1040, ECS Computer City Centre, Multiplan, Dhaka.
Mobile: 01935-693071, 01731-693071
Web: www.jhflaptopzone.com`;

    navigator.clipboard.writeText(textReceipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto flex justify-center items-start p-2 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Container Box */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-white font-mono">
              SALES INVOICE PREVIEW — {invoice.invoiceNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition ${
                isEditing
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Done Editing' : 'Edit Details'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Edit Form Panel (visible only when isEditing is true) */}
        {isEditing && (
          <div className="bg-slate-800/80 border-b border-slate-700 p-4 text-xs font-sans space-y-3 print:hidden">
            <div className="text-amber-400 font-semibold flex items-center justify-between">
              <span>Edit Invoice Metadata &amp; Serial Numbers</span>
              <span className="text-[11px] text-slate-400">Updates live in the preview below</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={invoice.customerName}
                  onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={invoice.customerPhone}
                  onChange={(e) => setInvoice({ ...invoice, customerPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Address</label>
                <input
                  type="text"
                  value={invoice.customerAddress}
                  onChange={(e) => setInvoice({ ...invoice, customerAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoiceNo}
                  onChange={(e) => setInvoice({ ...invoice, invoiceNo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Sales By (Staff Name)</label>
                <input
                  type="text"
                  value={invoice.salesBy}
                  onChange={(e) => setInvoice({ ...invoice, salesBy: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">
                  Watermark Transparency: {Math.round(watermarkOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.02"
                  max="0.25"
                  step="0.01"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Items edit */}
            <div className="pt-2 border-t border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-300">Items &amp; Specification</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-[11px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded"
                >
                  + Add Item
                </button>
              </div>

              {invoice.items.map((item, idx) => (
                <div key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 mb-2 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Specs (e.g. i5 11th, 8gb, 256gb)"
                      value={item.specs || ''}
                      onChange={(e) => handleItemChange(idx, 'specs', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Serial No"
                      value={item.serialNo || ''}
                      onChange={(e) => handleItemChange(idx, 'serialNo', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono"
                    />
                    {invoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* PRINTABLE INVOICE PAPER (A4 standard styling, pure white background, exact replica of uploaded image) */}
        <div
          ref={printableRef}
          id="sales-invoice-printable"
          className="relative bg-white text-black p-8 sm:p-12 mx-auto min-h-[960px] font-sans selection:bg-slate-200 overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '820px',
            color: '#000',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}
        >
          
          {/* ========================================================= */}
          {/* TRANSPARENT WATERMARK: "JHF Laptop Zone" in background      */}
          {/* ========================================================= */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
            aria-hidden="true"
            style={{
              opacity: watermarkOpacity,
              userSelect: 'none',
            }}
          >
            <div
              className="text-center transform -rotate-[32deg] tracking-[0.15em] font-black leading-tight"
              style={{
                fontSize: '5.2rem',
                color: '#000000',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              JHF Laptop Zone
            </div>
          </div>

          {/* Actual Invoice Content Layer (z-10 relative) */}
          <div className="relative z-10">

            {/* HEADER SECTION (Centered) */}
            <div className="text-center space-y-0.5 mb-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black" style={{ fontWeight: 800 }}>
                JHF Laptop Zone
              </h1>
              <p className="text-[12px] font-medium text-black">
                Best Laptop Buy , Sell &amp; Accessories Importer, Traders &amp; Suppliers
              </p>
              <p className="text-[11px] text-black">
                Branch Office : Baroipara Bazar, Chandra, Gazipur
              </p>
              <p className="text-[11px] text-black">
                Main Office : Sonali Trade, Shop No : 1001 &amp; 1040
              </p>
              <p className="text-[11px] text-black">
                ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka
              </p>
              <p className="text-[11px] text-black font-medium">
                Mobile : 01935-693071 , 01731-693071
              </p>
              <p className="text-[11px] text-black">
                Email : jhflaptopzone@gmail.com
              </p>
              <p className="text-[11px] text-black">
                Facebook : www.facebook.com/jhflaptopzone
              </p>
              <p className="text-[11px] text-black">
                Web : www.jhflaptopzone.com
              </p>
            </div>

            {/* HORIZONTAL SEPARATOR LINE */}
            <div className="w-full border-b-2 border-black my-4"></div>

            {/* TITLE: SALES INVOICE */}
            <div className="text-center my-4">
              <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-black" style={{ fontWeight: 900 }}>
                SALES INVOICE
              </h2>
            </div>

            {/* TWO COLUMN METADATA */}
            <div className="flex justify-between items-start text-[12px] text-black leading-relaxed my-4">
              {/* Left Column */}
              <div className="space-y-1">
                <div>
                  <span className="font-semibold">Customer : </span>
                  <span>{invoice.customerName}</span>
                </div>
                <div>
                  <span className="font-semibold">Mobile : </span>
                  <span>{invoice.customerPhone}</span>
                </div>
                <div>
                  <span className="font-semibold">Address : </span>
                  <span>{invoice.customerAddress}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-1 text-right">
                <div>
                  <span className="font-semibold">Invoice No : </span>
                  <span>{invoice.invoiceNo}</span>
                </div>
                <div>
                  <span className="font-semibold">Date : </span>
                  <span>{invoice.date}</span>
                </div>
                <div>
                  <span className="font-semibold">Sales By : </span>
                  <span>{invoice.salesBy}</span>
                </div>
              </div>
            </div>

            {/* MAIN ITEMS TABLE */}
            <div className="my-5">
              <table
                className="w-full text-left text-[12px] border-collapse"
                style={{ border: '1px solid #000' }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th
                      className="py-1.5 px-2 text-center font-bold"
                      style={{ borderRight: '1px solid #000', width: '45px' }}
                    >
                      SL
                    </th>
                    <th
                      className="py-1.5 px-3 font-bold"
                      style={{ borderRight: '1px solid #000' }}
                    >
                      Item Name
                    </th>
                    <th
                      className="py-1.5 px-2 text-center font-bold"
                      style={{ borderRight: '1px solid #000', width: '65px' }}
                    >
                      Qty
                    </th>
                    <th
                      className="py-1.5 px-3 text-right font-bold"
                      style={{ borderRight: '1px solid #000', width: '100px' }}
                    >
                      Unit Price
                    </th>
                    <th
                      className="py-1.5 px-3 text-right font-bold"
                      style={{ width: '100px' }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: idx === invoice.items.length - 1 ? 'none' : '1px solid #000',
                      }}
                    >
                      <td
                        className="py-3 px-2 text-center align-top font-medium"
                        style={{ borderRight: '1px solid #000' }}
                      >
                        {idx + 1}
                      </td>
                      <td
                        className="py-3 px-3 align-top"
                        style={{ borderRight: '1px solid #000' }}
                      >
                        <div className="font-bold text-black">{item.name}</div>
                        {item.specs && (
                          <div className="text-[11px] text-black leading-snug">{item.specs}</div>
                        )}
                        <div className="text-[11px] text-black">
                          Serial No : {item.serialNo || 'Not Collect Yet'}
                        </div>
                      </td>
                      <td
                        className="py-3 px-2 text-center align-top font-medium"
                        style={{ borderRight: '1px solid #000' }}
                      >
                        {item.quantity}
                      </td>
                      <td
                        className="py-3 px-3 text-right align-top font-mono font-medium"
                        style={{ borderRight: '1px solid #000' }}
                      >
                        {item.unitPrice}
                      </td>
                      <td className="py-3 px-3 text-right align-top font-mono font-medium">
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTAL BOX (Aligned Right Directly Below Table) */}
              <div className="flex justify-end mt-3">
                <div
                  className="flex items-center text-[13px] font-bold"
                  style={{ border: '1px solid #000' }}
                >
                  <div
                    className="py-1 px-4 text-center"
                    style={{ borderRight: '1px solid #000', minWidth: '90px' }}
                  >
                    Total
                  </div>
                  <div className="py-1 px-6 text-right font-mono" style={{ minWidth: '130px' }}>
                    {invoice.totalAmount} TK
                  </div>
                </div>
              </div>
            </div>

            {/* IN WORDS */}
            <div className="text-[12px] text-black font-semibold my-4">
              <span>In Words : </span>
              <span className="font-medium">{invoice.inWords}</span>
            </div>

            {/* WARRANTY POLICY */}
            <div className="text-[12px] text-black my-4 space-y-0.5 leading-relaxed">
              <div className="font-bold">Warranty Policy</div>
              <div className="pl-2">
                <div>• Full Laptop &amp; Spare Parts : {invoice.fullLaptopWarranty}</div>
                <div>• Service : {invoice.serviceWarranty}</div>
              </div>
            </div>

            {/* SIGNATURES SECTION */}
            <div className="pt-20 pb-6 flex justify-between items-center text-[12px] text-black">
              <div className="text-center">
                <div className="w-48 border-t border-black mb-1 mx-auto"></div>
                <div className="font-medium">Customer Signature</div>
              </div>

              <div className="text-center">
                <div className="w-48 border-t border-black mb-1 mx-auto"></div>
                <div className="font-medium">Authorized Signature</div>
              </div>
            </div>

            {/* GREETING MESSAGE */}
            <div className="text-center text-[13px] font-bold text-black my-3">
              Thank You For Your Purchase
            </div>

            {/* FOOTER BOTTOM */}
            <div className="text-center text-[10px] text-black pt-16 pb-2">
              {invoice.softwareAuthor}
            </div>

          </div>
        </div>

      </div>

      {/* Global CSS for Clean Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #sales-invoice-printable, #sales-invoice-printable * {
            visibility: visible;
          }
          #sales-invoice-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

    </div>
  );
};
