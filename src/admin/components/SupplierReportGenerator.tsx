import React, { useState, useMemo } from 'react';
import { useAdminStore, BUSINESS_INFO } from '../adminStore';
import { Supplier, SupplierPurchase, SupplierPayment } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Truck,
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';

interface SupplierReportGeneratorProps {
  initialSupplierId?: string;
}

export const SupplierReportGenerator: React.FC<SupplierReportGeneratorProps> = ({
  initialSupplierId,
}) => {
  const { suppliers, supplierPurchases, supplierPayments } = useAdminStore();

  // Filters State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(initialSupplierId || 'all');
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [typeFilter, setTypeFilter] = useState<'all' | 'purchase' | 'payment'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected supplier details
  const targetSupplier = useMemo(() => {
    if (selectedSupplierId === 'all') return null;
    return suppliers.find((s) => s.id === selectedSupplierId) || null;
  }, [suppliers, selectedSupplierId]);

  // Generate All Ledger Records chronologically
  const reportRecords = useMemo(() => {
    type LedgerRow = {
      id: string;
      date: string;
      type: 'PURCHASE' | 'PAYMENT';
      ref: string;
      supplierId: string;
      supplierName: string;
      companyName: string;
      description: string;
      paymentMethod: string;
      debit: number; // Purchase Amount
      credit: number; // Paid Amount
      balance: number; // Running due
      notes?: string;
    };

    const rows: LedgerRow[] = [];

    // 1. Process Purchases
    supplierPurchases.forEach((p) => {
      const s = suppliers.find((sup) => sup.id === p.supplierId);
      const sName = s?.name || 'Unknown Supplier';
      const cName = s?.companyName || '';

      // Main Purchase Debit
      rows.push({
        id: `pur-${p.id}`,
        date: p.purchaseDate,
        type: 'PURCHASE',
        ref: p.invoiceRef,
        supplierId: p.supplierId,
        supplierName: sName,
        companyName: cName,
        description: `${p.itemDescription} (Qty: ${p.quantity})`,
        paymentMethod: p.paymentMethod || 'Payable',
        debit: p.totalCost,
        credit: 0,
        balance: 0,
        notes: p.notes,
      });

      // If initial advance/paid upon purchase was recorded
      if (p.paidAmount && p.paidAmount > 0) {
        rows.push({
          id: `pur-adv-${p.id}`,
          date: p.purchaseDate,
          type: 'PAYMENT',
          ref: `${p.invoiceRef}-ADV`,
          supplierId: p.supplierId,
          supplierName: sName,
          companyName: cName,
          description: `Advance Payment on Purchase (${p.invoiceRef})`,
          paymentMethod: p.paymentMethod,
          debit: 0,
          credit: p.paidAmount,
          balance: 0,
          notes: `Paid at time of receiving lot via ${p.paymentMethod}`,
        });
      }
    });

    // 2. Process Separate Payments
    supplierPayments.forEach((pay) => {
      const s = suppliers.find((sup) => sup.id === pay.supplierId);
      const sName = s?.name || 'Unknown Supplier';
      const cName = s?.companyName || '';

      rows.push({
        id: `pay-${pay.id}`,
        date: pay.paymentDate,
        type: 'PAYMENT',
        ref: pay.transactionRef || 'DIRECT-PAY',
        supplierId: pay.supplierId,
        supplierName: sName,
        companyName: cName,
        description: pay.notes ? `Due Settlement: ${pay.notes}` : `Vendor Due Payment via ${pay.paymentMethod}`,
        paymentMethod: pay.paymentMethod,
        debit: 0,
        credit: pay.amount,
        balance: 0,
        notes: pay.notes,
      });
    });

    // Sort chronologically ascending to calculate running balance
    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate Running Balance for each supplier (or global)
    let running = 0;
    const withRunningBalance = rows.map((row) => {
      running += row.debit - row.credit;
      return {
        ...row,
        balance: running,
      };
    });

    // Apply User Filters
    return withRunningBalance.filter((row) => {
      // Supplier filter
      if (selectedSupplierId !== 'all' && row.supplierId !== selectedSupplierId) return false;

      // Date range filter
      if (startDate && row.date < startDate) return false;
      if (endDate && row.date > endDate) return false;

      // Transaction Type filter
      if (typeFilter === 'purchase' && row.type !== 'PURCHASE') return false;
      if (typeFilter === 'payment' && row.type !== 'PAYMENT') return false;

      // Payment method filter
      if (methodFilter !== 'all' && row.paymentMethod.toLowerCase() !== methodFilter.toLowerCase()) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = row.ref.toLowerCase().includes(q);
        const matchesSupplier = row.supplierName.toLowerCase().includes(q) || row.companyName.toLowerCase().includes(q);
        const matchesDesc = row.description.toLowerCase().includes(q);
        const matchesMethod = row.paymentMethod.toLowerCase().includes(q);
        return matchesRef || matchesSupplier || matchesDesc || matchesMethod;
      }

      return true;
    });
  }, [supplierPurchases, supplierPayments, suppliers, selectedSupplierId, startDate, endDate, typeFilter, methodFilter, searchQuery]);

  // Aggregated Summary Statistics
  const summary = useMemo(() => {
    const totalPurchases = reportRecords.reduce((sum, r) => sum + r.debit, 0);
    const totalPayments = reportRecords.reduce((sum, r) => sum + r.credit, 0);
    const netDue = Math.max(0, totalPurchases - totalPayments);

    // Method breakdown of payments
    const methodTotals: Record<string, number> = {};
    reportRecords
      .filter((r) => r.type === 'PAYMENT' && r.credit > 0)
      .forEach((r) => {
        const m = r.paymentMethod || 'Cash';
        methodTotals[m] = (methodTotals[m] || 0) + r.credit;
      });

    return {
      totalPurchases,
      totalPayments,
      netDue,
      methodTotals,
      totalTransactions: reportRecords.length,
    };
  }, [reportRecords]);

  // Presets for Date Range
  const handleDatePreset = (preset: 'all' | 'this_month' | 'last_month' | 'last_90') => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (preset === 'all') {
      setStartDate('2020-01-01');
      setEndDate(todayStr);
    } else if (preset === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      setStartDate(firstDay);
      setEndDate(todayStr);
    } else if (preset === 'last_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().slice(0, 10);
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'last_90') {
      const past90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setStartDate(past90);
      setEndDate(todayStr);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (reportRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Date (কবে)',
      'Transaction Type (ধরন)',
      'Voucher / Ref',
      'Supplier Name',
      'Company Name',
      'Item Description',
      'Payment Method (কিসের মাধ্যমে)',
      'Purchase Debit (৳)',
      'Paid Credit (৳)',
      'Running Due (৳)',
      'Notes',
    ];

    const csvRows = [
      headers.join(','),
      ...reportRecords.map((r) =>
        [
          `"${r.date}"`,
          `"${r.type}"`,
          `"${r.ref}"`,
          `"${r.supplierName}"`,
          `"${r.companyName}"`,
          `"${r.description.replace(/"/g, '""')}"`,
          `"${r.paymentMethod}"`,
          r.debit,
          r.credit,
          r.balance,
          `"${(r.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Supplier-Audit-Report-${startDate}-to-${endDate}.csv`;
    link.click();
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/70 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3 text-purple-400" />
              SUPPLIER REPORT GENERATOR &amp; AUDIT
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">কবে, কত টাকা, কিসের মাধ্যমে দিয়েছি ও বকেয়ার হিসাব</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-purple-400" />
            <span>Supplier Purchase, Payment &amp; Due Audit Report</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Generate printable vendor statements showing all laptop purchases, payment disbursements (bKash, Bank, Cash), and real-time outstanding dues for {BUSINESS_INFO.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Filters & Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Filter className="w-4 h-4 text-purple-400" />
            <span>Report Configuration &amp; Filter Parameters:</span>
          </div>

          {/* Quick Date Range Presets */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span className="text-slate-500 mr-1 hidden sm:inline">Quick Presets:</span>
            <button
              onClick={() => handleDatePreset('this_month')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              This Month
            </button>
            <button
              onClick={() => handleDatePreset('last_month')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Last Month
            </button>
            <button
              onClick={() => handleDatePreset('last_90')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Last 90 Days
            </button>
            <button
              onClick={() => handleDatePreset('all')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              All Time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-semibold text-slate-300">
          
          {/* Supplier Selector */}
          <div>
            <label className="block mb-1 text-slate-400">Select Supplier</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Suppliers (সংযুক্ত সকল ভেন্ডর)</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.companyName ? `(${s.companyName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block mb-1 text-slate-400">From Date (শুরুর তারিখ)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block mb-1 text-slate-400">To Date (শেষ তারিখ)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block mb-1 text-slate-400">Transaction Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All (Purchases + Payments)</option>
              <option value="purchase">Purchases Only (শুধু ক্রয়)</option>
              <option value="payment">Payments Only (শুধু পরিশোধ)</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block mb-1 text-slate-400">Payment Channel (মাধ্যম)</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Payment Channels</option>
              <option value="Cash">Cash (ক্যাশ)</option>
              <option value="Bkash">bKash (বিকাশ)</option>
              <option value="Nagad">Nagad (নগদ)</option>
              <option value="Rocket">Rocket (রকেট)</option>
              <option value="Bank Account">Bank Account / Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

        </div>

        {/* Live Search in Report */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report by voucher ref, supplier name, item description, payment channel..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

      </div>

      {/* 4 Summary Cards for the Filtered Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Purchases in Period */}
        <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Total Purchases (মোট ক্রয়)</span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400">
            ৳{summary.totalPurchases.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total lot goods invoiced in selected period
          </div>
        </div>

        {/* Total Payments Made in Period */}
        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Total Payments Made (মোট পরিশোধ)</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ৳{summary.totalPayments.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Transferred via Bank, bKash, Cash
          </div>
        </div>

        {/* Current Net Due (Payable) */}
        <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Net Outstanding Due (বকেয়া)</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400">
            ৳{summary.netDue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Formula: Purchases − Total Payments
          </div>
        </div>

        {/* Method Breakdown Pill Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 transition shadow flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Payment Channels Used (মাধ্যম ভিত্তিক)
          </span>
          <div className="space-y-1 text-xs">
            {Object.keys(summary.methodTotals).length === 0 ? (
              <span className="text-slate-500 text-[11px]">No payments in selected range</span>
            ) : (
              Object.entries(summary.methodTotals).map(([method, amt]) => (
                <div key={method} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300 font-semibold">{method}:</span>
                  <span className="font-mono font-bold text-emerald-400">৳{amt.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Official Printable Statement Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Printable Header Details (Visible on Screen & on Print) */}
        <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {BUSINESS_INFO.name} • SUPPLIER AUDIT STATEMENT
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">
              {targetSupplier ? `${targetSupplier.name} (${targetSupplier.companyName})` : 'Consolidated All Suppliers Ledger'}
            </h2>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>Period: <strong className="text-slate-200">{startDate}</strong> to <strong className="text-slate-200">{endDate}</strong></span>
              <span>•</span>
              <span>Audited Transactions: <strong className="text-slate-200">{reportRecords.length}</strong></span>
              {targetSupplier?.phone && (
                <>
                  <span>•</span>
                  <span>Phone: <strong className="text-slate-200">{targetSupplier.phone}</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            <div>Generated on: <strong className="text-slate-200">{new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}</strong></div>
            <div>Prepared by: <strong className="text-purple-400">{BUSINESS_INFO.developer} (Proprietor)</strong></div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Date (কবে)</th>
                <th className="py-3 px-3">Type (ধরন)</th>
                <th className="py-3 px-3">Voucher / Trx Ref</th>
                <th className="py-3 px-3">Supplier / Lot Details</th>
                <th className="py-3 px-3">Channel (কিসের মাধ্যমে)</th>
                <th className="py-3 px-3 text-right">Purchase (ক্রয় ৳)</th>
                <th className="py-3 px-3 text-right">Payment (পরিশোধ ৳)</th>
                <th className="py-3 px-3 text-right">Balance Due (বকেয়া ৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {reportRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No supplier purchase or payment records found matching the specified filter criteria.
                  </td>
                </tr>
              ) : (
                reportRecords.map((r) => {
                  const isPurchase = r.type === 'PURCHASE';
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      {/* Date */}
                      <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {r.date}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isPurchase
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isPurchase ? 'Purchase (ক্রয়)' : 'Payment (পরিশোধ)'}
                        </span>
                      </td>

                      {/* Voucher Ref */}
                      <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                        {r.ref}
                      </td>

                      {/* Supplier & Description */}
                      <td className="py-3 px-3 max-w-xs">
                        <span className="font-bold text-slate-200 block truncate">
                          {r.supplierName} {r.companyName ? `• ${r.companyName}` : ''}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {r.description}
                        </span>
                        {r.notes && (
                          <span className="text-[10px] text-slate-500 italic block truncate">
                            Note: {r.notes}
                          </span>
                        )}
                      </td>

                      {/* Payment Channel (কিসের মাধ্যমে) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 font-semibold text-[11px] border border-slate-700 inline-block">
                          {r.paymentMethod}
                        </span>
                      </td>

                      {/* Debit (Purchase) */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-400 whitespace-nowrap">
                        {r.debit > 0 ? `৳${r.debit.toLocaleString()}` : '—'}
                      </td>

                      {/* Credit (Payment) */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {r.credit > 0 ? `৳${r.credit.toLocaleString()}` : '—'}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3 px-3 text-right font-mono font-black text-purple-300 whitespace-nowrap">
                        ৳{r.balance.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            
            {/* Table Footer Totals */}
            {reportRecords.length > 0 && (
              <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-slate-200 text-xs">
                <tr>
                  <td colSpan={5} className="py-3.5 px-3 text-right uppercase tracking-wider text-slate-400">
                    Grand Period Total:
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-black text-blue-400">
                    ৳{summary.totalPurchases.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-400">
                    ৳{summary.totalPayments.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-black text-purple-400 text-sm">
                    ৳{summary.netDue.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Official Certification & Signature Line */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-400">
          <div>
            <h5 className="font-bold text-slate-300 mb-1">Company Guarantee &amp; Terms:</h5>
            <p className="text-[11px] leading-relaxed text-slate-400">
              All records generated by {BUSINESS_INFO.name} Enterprise Accounting System are verified against received physical lots and MFS/Bank transaction slips. Outstanding dues are scheduled as per vendor payment covenants.
            </p>
          </div>

          <div className="flex flex-col items-end justify-end">
            <div className="border-t border-slate-600 pt-2 w-56 text-center">
              <span className="font-bold text-white block">{BUSINESS_INFO.developer}</span>
              <span className="text-[10px] text-purple-400 block">Authorized Signature &amp; System Owner</span>
              <span className="text-[10px] text-slate-500 block">{BUSINESS_INFO.name}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
