import React, { useState } from 'react';
import { useAdminStore, BUSINESS_INFO } from '../adminStore';
import { EmiPlan } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Download,
  AlertTriangle,
  User,
  Phone,
  Laptop,
  Building,
  CheckCircle2,
  DollarSign,
  Calendar,
  X,
  CreditCard,
} from 'lucide-react';
import { BarcodeGenerator } from './BarcodeGenerator';

export const CustomerDueReportView: React.FC = () => {
  const { emiPlans, recordEmiPayment } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(true);
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Quick Payment Modal
  const [payingPlan, setPayingPlan] = useState<EmiPlan | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'Cash' | 'Bkash' | 'Nagad' | 'Rocket' | 'Bank Account' | 'POS'>('Cash');
  const [payNotes, setPayNotes] = useState('');
  const [message, setMessage] = useState('');

  // Filter plans
  const duePlans = emiPlans.filter((p) => {
    if (filterDueOnly && p.remainingDue <= 0) return false;
    if (overdueOnly && !p.isOverdue && p.status !== 'overdue') return false;

    const q = searchQuery.toLowerCase();
    return (
      p.customerName.toLowerCase().includes(q) ||
      p.customerPhone.toLowerCase().includes(q) ||
      p.invoiceNo.toLowerCase().includes(q) ||
      p.productModel.toLowerCase().includes(q) ||
      p.serialNumber.toLowerCase().includes(q) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(q))
    );
  });

  // Aggregates
  const totalBuy = duePlans.reduce((sum, p) => sum + (p.buyPrice || 0), 0);
  const totalSell = duePlans.reduce((sum, p) => sum + (p.sellPrice || 0), 0);
  const totalPaid = duePlans.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const totalDue = duePlans.reduce((sum, p) => sum + (p.remainingDue || 0), 0);
  const totalProfit = duePlans.reduce((sum, p) => sum + ((p.sellPrice || 0) - (p.buyPrice || 0)), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'Invoice No',
      'Model',
      'Serial Number',
      'Configuration',
      'Sale Date',
      'Buy Price (BDT)',
      'Sell Price (BDT)',
      'Profit (BDT)',
      'Paid Amount (BDT)',
      'Remaining Due (BDT)',
      'Estimated Final Pay Date',
      'Customer Name',
      'Customer Phone',
      'Customer Address',
      'Customer NID',
      'Supplier Name',
      'Sales Person',
    ].join(',');

    const rows = duePlans.map((p) => [
      `"${p.invoiceNo}"`,
      `"${p.productModel.replace(/"/g, '""')}"`,
      `"${p.serialNumber}"`,
      `"${(p.configuration || '').replace(/"/g, '""')}"`,
      `"${p.saleDate}"`,
      p.buyPrice,
      p.sellPrice,
      p.profit,
      p.paidAmount,
      p.remainingDue,
      `"${p.estimatedFinalPayDate}"`,
      `"${p.customerName.replace(/"/g, '""')}"`,
      `"${p.customerPhone}"`,
      `"${(p.customerAddress || '').replace(/"/g, '""')}"`,
      `"${p.customerNid || ''}"`,
      `"${(p.supplierName || '').replace(/"/g, '""')}"`,
      `"${p.salesPerson}"`,
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jhf_customer_due_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingPlan || payAmount <= 0) return;
    const res = recordEmiPayment(payingPlan.id, payAmount, payMethod, payNotes);
    if (res.success) {
      setMessage(res.message || 'Payment recorded!');
      setTimeout(() => {
        setPayingPlan(null);
        setMessage('');
      }, 1400);
    }
  };

  return (
    <div className="space-y-6">
      {/* Styles for print / A4 landscape */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .report-table {
            border-collapse: collapse !important;
            width: 100% !important;
            font-size: 8.5pt !important;
          }
          .report-table th, .report-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 4px 6px !important;
            color: #0f172a !important;
          }
          .report-table th {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>

      {/* Screen Header Controls (No Print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              AUDIT &amp; DUE LEDGER
            </span>
            <span className="text-xs text-slate-400">
              A4 Landscape PDF &amp; Thermal Printing Supported
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-400" />
            <span>Customer Due &amp; Installment Report</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {BUSINESS_INFO.name} • {BUSINESS_INFO.location} • Dev: {BUSINESS_INFO.developer}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-amber-600/20 flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export A4 Landscape PDF</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar (No Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <input
              type="checkbox"
              checked={filterDueOnly}
              onChange={(e) => setFilterDueOnly(e.target.checked)}
              className="w-3.5 h-3.5 accent-amber-500"
            />
            <span>Show Accounts With Due Only</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-rose-300 font-semibold cursor-pointer bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-800/40">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="w-3.5 h-3.5 accent-rose-500"
            />
            <span>Overdue Only</span>
          </label>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, phone, model, SN..."
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 rounded-2xl p-5 shadow-lg">
        {/* Printable Business Letterhead */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-black text-white print:text-black tracking-tight">
              {BUSINESS_INFO.name}
            </h2>
            <div className="text-xs text-slate-400 print:text-slate-600 font-medium">
              {BUSINESS_INFO.location} | Mobile: {BUSINESS_INFO.phone}
            </div>
            <div className="text-[11px] text-blue-400 print:text-slate-500">
              Developed by: {BUSINESS_INFO.developer} ({BUSINESS_INFO.developerRole})
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-amber-400 print:text-black uppercase">
              Official Customer Due &amp; Installment Report
            </div>
            <div className="text-xs text-slate-400 print:text-slate-600">
              Generated on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* 12-Column ERP Report Table */}
        <div className="overflow-x-auto">
          <table className="report-table w-full text-left text-[11px] text-slate-300 print:text-black">
            <thead className="bg-slate-950/80 print:bg-slate-100 text-[10px] font-black text-slate-400 print:text-slate-700 uppercase tracking-wider border-b border-slate-800 print:border-slate-300">
              <tr>
                <th className="px-2.5 py-2.5">1. Model</th>
                <th className="px-2.5 py-2.5">2. Serial Number</th>
                <th className="px-2.5 py-2.5">3. Configuration</th>
                <th className="px-2.5 py-2.5">4. Sale Date</th>
                <th className="px-2.5 py-2.5 text-right">5. Buy (৳)</th>
                <th className="px-2.5 py-2.5 text-right">6. Sell (৳)</th>
                <th className="px-2.5 py-2.5 text-right">7. Paid (৳)</th>
                <th className="px-2.5 py-2.5 text-right text-amber-400 print:text-black">8. Due (৳)</th>
                <th className="px-2.5 py-2.5">9. Est. Final Date</th>
                <th className="px-2.5 py-2.5">10. Customer Details</th>
                <th className="px-2.5 py-2.5">11. Supplier</th>
                <th className="px-2.5 py-2.5">12. Sales Person</th>
                <th className="px-2.5 py-2.5 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {duePlans.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-10 text-slate-500">
                    No customer due records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                duePlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                    {/* 1. Model */}
                    <td className="px-2.5 py-2 font-bold text-white print:text-black">
                      {plan.productModel}
                      <div className="text-[9px] text-blue-400 print:text-slate-500 font-mono">
                        {plan.invoiceNo}
                      </div>
                    </td>

                    {/* 2. Serial Number */}
                    <td className="px-2.5 py-2 font-mono text-[10px] text-emerald-400 print:text-black">
                      {plan.serialNumber}
                    </td>

                    {/* 3. Configuration */}
                    <td className="px-2.5 py-2 text-[10px] text-slate-400 print:text-slate-700 max-w-[140px] truncate">
                      {plan.configuration}
                    </td>

                    {/* 4. Sale Date */}
                    <td className="px-2.5 py-2 text-slate-300 print:text-black whitespace-nowrap">
                      {plan.saleDate}
                    </td>

                    {/* 5. Buy Price */}
                    <td className="px-2.5 py-2 text-right font-medium">
                      ৳{plan.buyPrice.toLocaleString()}
                    </td>

                    {/* 6. Sell Price */}
                    <td className="px-2.5 py-2 text-right font-bold text-white print:text-black">
                      ৳{plan.sellPrice.toLocaleString()}
                    </td>

                    {/* 7. Paid Amount */}
                    <td className="px-2.5 py-2 text-right font-semibold text-emerald-400 print:text-black">
                      ৳{plan.paidAmount.toLocaleString()}
                    </td>

                    {/* 8. Remaining Due */}
                    <td className="px-2.5 py-2 text-right font-black text-amber-400 print:text-black">
                      ৳{plan.remainingDue.toLocaleString()}
                      {plan.isOverdue && (
                        <span className="block text-[8px] text-rose-400 print:text-red-600 font-bold uppercase">
                          Overdue
                        </span>
                      )}
                    </td>

                    {/* 9. Estimated Final Pay Date */}
                    <td className="px-2.5 py-2 text-slate-300 print:text-black whitespace-nowrap">
                      {plan.estimatedFinalPayDate}
                      <div className="text-[9px] text-slate-500 print:text-slate-600">
                        {plan.planMonths}M Plan (৳{plan.monthlyInstallment}/mo)
                      </div>
                    </td>

                    {/* 10. Customer Details */}
                    <td className="px-2.5 py-2">
                      <div className="font-bold text-white print:text-black">{plan.customerName}</div>
                      <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono">
                        {plan.customerPhone}
                      </div>
                      <div className="text-[9px] text-slate-500 print:text-slate-600 max-w-[130px] truncate">
                        {plan.customerAddress}
                      </div>
                    </td>

                    {/* 11. Supplier Name */}
                    <td className="px-2.5 py-2 text-[10px] text-slate-400 print:text-slate-700 max-w-[100px] truncate">
                      {plan.supplierName || 'Dubai Importer'}
                    </td>

                    {/* 12. Sales Person */}
                    <td className="px-2.5 py-2 text-[10px] text-slate-300 print:text-black">
                      {plan.salesPerson}
                    </td>

                    {/* Action (No Print) */}
                    <td className="px-2.5 py-2 text-center no-print">
                      {plan.remainingDue > 0 && (
                        <button
                          onClick={() => {
                            setPayingPlan(plan);
                            setPayAmount(plan.monthlyInstallment > plan.remainingDue ? plan.remainingDue : plan.monthlyInstallment);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded shadow transition whitespace-nowrap"
                        >
                          Collect
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Total Aggregates Row */}
            <tfoot className="bg-slate-950 print:bg-slate-100 font-black border-t-2 border-slate-700 print:border-slate-400">
              <tr>
                <td colSpan={4} className="px-2.5 py-2.5 text-right uppercase tracking-wider text-slate-300 print:text-black">
                  Total Summary ({duePlans.length} Accounts):
                </td>
                <td className="px-2.5 py-2.5 text-right text-slate-300 print:text-black">
                  ৳{totalBuy.toLocaleString()}
                </td>
                <td className="px-2.5 py-2.5 text-right text-white print:text-black">
                  ৳{totalSell.toLocaleString()}
                </td>
                <td className="px-2.5 py-2.5 text-right text-emerald-400 print:text-black">
                  ৳{totalPaid.toLocaleString()}
                </td>
                <td className="px-2.5 py-2.5 text-right text-amber-400 print:text-black text-sm">
                  ৳{totalDue.toLocaleString()}
                </td>
                <td colSpan={5} className="px-2.5 py-2.5 text-left text-[10px] text-emerald-400 print:text-black">
                  Total Profit Projected: +৳{totalProfit.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Printable Footer / Signatures */}
        <div className="mt-8 pt-6 border-t border-slate-800 print:border-slate-400 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-400 print:text-black">
          <div>
            <div className="h-10 border-b border-dashed border-slate-700 print:border-black mb-1"></div>
            <span>Prepared By (Accounts Officer)</span>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-700 print:border-black mb-1"></div>
            <span>Verified By (Store Manager)</span>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-700 print:border-black mb-1"></div>
            <span>Authorized Signature / Managing Director</span>
          </div>
        </div>
      </div>

      {/* Quick Pay Modal */}
      {payingPlan && (
        <div className="no-print fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Collect Payment directly from Due Report</span>
                </h3>
                <p className="text-[11px] text-slate-400">{payingPlan.customerName} • {payingPlan.invoiceNo}</p>
              </div>
              <button onClick={() => setPayingPlan(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickPay} className="p-5 space-y-4 text-xs text-slate-300">
              {message && (
                <div className="bg-emerald-500/20 text-emerald-300 p-2.5 rounded-xl text-center font-bold">
                  {message}
                </div>
              )}

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Current Due:</span>
                  <span className="font-bold text-amber-400">৳{payingPlan.remainingDue.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-white">Payment Amount (৳)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={payingPlan.remainingDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 text-emerald-400 font-bold px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-white">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                >
                  <option value="Cash">Cash at Shop</option>
                  <option value="Bkash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Account">Bank Account</option>
                  <option value="POS">Card POS</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingPlan(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
