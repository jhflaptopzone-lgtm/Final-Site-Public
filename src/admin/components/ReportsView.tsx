import React, { useState } from 'react';
import { useAdminStore, BUSINESS_INFO } from '../adminStore';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Boxes,
  Users,
} from 'lucide-react';
import { SupplierReportGenerator } from './SupplierReportGenerator';

export const ReportsView: React.FC = () => {
  const {
    orders,
    emiPlans,
    products,
    suppliers,
    supplierPurchases,
    supplierPayments,
    customers,
    expenses,
    exportDataAsCsv,
  } = useAdminStore();

  const [selectedReport, setSelectedReport] = useState<'monthly_sales' | 'yearly_sales' | 'supplier_due' | 'profit_loss'>('monthly_sales');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('09'); // September

  // Calculate monthly stats
  const monthlyOrders = orders.filter((o) => {
    return o.createdAt.startsWith(`${selectedYear}-${selectedMonth}`);
  });
  const monthlyEmiSales = emiPlans.filter((p) => {
    return p.saleDate.startsWith(`${selectedYear}-${selectedMonth}`);
  });
  const monthlyExpenses = expenses.filter((e) => {
    return e.date.startsWith(`${selectedYear}-${selectedMonth}`);
  });

  const totalMonthlySalesCash = monthlyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalMonthlyEmiSales = monthlyEmiSales.reduce((sum, p) => sum + (p.sellPrice || 0), 0);
  const totalMonthlyEmiProfit = monthlyEmiSales.reduce((sum, p) => sum + (p.profit || 0), 0);
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netMonthlyProfit = totalMonthlyEmiProfit + (totalMonthlySalesCash * 0.12) - totalMonthlyExpenses;

  // Yearly stats
  const yearlyOrders = orders.filter((o) => o.createdAt.startsWith(selectedYear));
  const yearlyEmiSales = emiPlans.filter((p) => p.saleDate.startsWith(selectedYear));
  const yearlyExpenses = expenses.filter((e) => e.date.startsWith(selectedYear));
  const totalYearlySales = yearlyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) +
    yearlyEmiSales.reduce((sum, p) => sum + (p.sellPrice || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
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
          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Screen Controls Header */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              EXECUTIVE REPORTING ENGINE
            </span>
            <span className="text-xs text-slate-400">
              A4 Landscape PDF &amp; Export Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>ERP Business Analytics &amp; Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {BUSINESS_INFO.name} • Location: {BUSINESS_INFO.location} • Dev: {BUSINESS_INFO.developer}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportDataAsCsv('orders')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Sales CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Current Report (A4 PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs (No Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedReport('monthly_sales')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedReport === 'monthly_sales'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Monthly Sales Report
          </button>
          <button
            onClick={() => setSelectedReport('yearly_sales')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedReport === 'yearly_sales'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Yearly Sales Report
          </button>
          <button
            onClick={() => setSelectedReport('supplier_due')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedReport === 'supplier_due'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Supplier Due Ledger Report
          </button>
          <button
            onClick={() => setSelectedReport('profit_loss')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedReport === 'profit_loss'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Profit &amp; Loss Statement
          </button>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
          >
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
          </select>
          {selectedReport === 'monthly_sales' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
            >
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          )}
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="print-container bg-slate-900 print:bg-white border border-slate-800 print:border-none rounded-2xl p-6 shadow-lg">
        {/* Letterhead */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-4 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-black text-white print:text-black">{BUSINESS_INFO.name}</h2>
            <div className="text-xs text-slate-400 print:text-slate-600 font-medium">
              {BUSINESS_INFO.location} • Mobile: {BUSINESS_INFO.phone}
            </div>
            <div className="text-[11px] text-blue-400 print:text-slate-500">
              ERP System Developed by: {BUSINESS_INFO.developer} ({BUSINESS_INFO.developerRole})
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-blue-400 print:text-black uppercase">
              {selectedReport === 'monthly_sales' && `Monthly Sales Report (${selectedMonth}/${selectedYear})`}
              {selectedReport === 'yearly_sales' && `Annual Sales Performance Report (${selectedYear})`}
              {selectedReport === 'supplier_due' && 'Supplier Procurement & Due Ledger'}
              {selectedReport === 'profit_loss' && `Profit & Loss Statement (${selectedMonth}/${selectedYear})`}
            </div>
            <div className="text-xs text-slate-400 print:text-slate-600">
              Print Date: {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>

        {/* Report Content: Monthly Sales */}
        {selectedReport === 'monthly_sales' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                  Total Sales Volume
                </span>
                <span className="text-lg font-black text-white print:text-black mt-1 block">
                  ৳{(totalMonthlySalesCash + totalMonthlyEmiSales).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                  Total Units Sold
                </span>
                <span className="text-lg font-black text-blue-400 print:text-black mt-1 block">
                  {monthlyOrders.length + monthlyEmiSales.length} Units
                </span>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                  Gross Profit (EMI + Cash)
                </span>
                <span className="text-lg font-black text-emerald-400 print:text-black mt-1 block">
                  ৳{(totalMonthlyEmiProfit + totalMonthlySalesCash * 0.12).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 print:bg-slate-100 p-3 rounded-xl border border-slate-800 print:border-slate-300">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-bold block">
                  Net Estimated Margin
                </span>
                <span className="text-lg font-black text-purple-400 print:text-black mt-1 block">
                  ৳{netMonthlyProfit.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead className="bg-slate-950 print:bg-slate-200 text-[10px] font-bold text-slate-400 print:text-slate-800 uppercase tracking-wider border-b border-slate-800 print:border-slate-400">
                  <tr>
                    <th className="px-3 py-2.5">Invoice #</th>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Model / Items</th>
                    <th className="px-3 py-2.5 text-right">Amount (৳)</th>
                    <th className="px-3 py-2.5 text-right">Profit (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                  {monthlyEmiSales.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 font-mono font-bold text-blue-400 print:text-black">{p.invoiceNo}</td>
                      <td className="px-3 py-2">{p.saleDate}</td>
                      <td className="px-3 py-2 font-semibold">{p.customerName}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 print:text-black font-bold text-[10px]">
                          EMI Plan
                        </span>
                      </td>
                      <td className="px-3 py-2">{p.productModel} (SN: {p.serialNumber})</td>
                      <td className="px-3 py-2 text-right font-bold">৳{p.sellPrice.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-400 print:text-black">
                        +৳{p.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {monthlyOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-3 py-2 font-mono font-bold text-slate-300 print:text-black">{o.orderNumber}</td>
                      <td className="px-3 py-2">{o.createdAt.slice(0, 10)}</td>
                      <td className="px-3 py-2 font-semibold">{o.customerName}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 print:text-black font-bold text-[10px]">
                          Instant Cash
                        </span>
                      </td>
                      <td className="px-3 py-2">{o.items?.map((i) => i.productName).join(', ') || 'Laptop'}</td>
                      <td className="px-3 py-2 text-right font-bold">৳{o.totalAmount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-400 print:text-black">
                        +৳{(o.totalAmount * 0.12).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Content: Supplier Due Ledger & Comprehensive Audit Statement */}
        {selectedReport === 'supplier_due' && (
          <div className="space-y-6">
            <SupplierReportGenerator />
          </div>
        )}

        {/* Report Content: Profit & Loss Statement */}
        {selectedReport === 'profit_loss' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-2xl p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center text-sm font-bold text-white print:text-black border-b border-slate-800 pb-2">
                <span>Revenue &amp; Gross Sales</span>
                <span className="text-emerald-400 print:text-black">
                  ৳{(totalMonthlySalesCash + totalMonthlyEmiSales).toLocaleString()}
                </span>
              </div>

              <div className="pl-4 space-y-2 text-slate-400 print:text-slate-700">
                <div className="flex justify-between">
                  <span>Cash &amp; Counter Sales</span>
                  <span>৳{totalMonthlySalesCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Installment (EMI) Sales</span>
                  <span>৳{totalMonthlyEmiSales.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-white print:text-black border-b border-slate-800 pb-2 pt-2">
                <span>Direct Product Cost (COGS)</span>
                <span className="text-rose-400 print:text-black">
                  -৳{(totalMonthlyEmiSales - totalMonthlyEmiProfit).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-white print:text-black border-b border-slate-800 pb-2 pt-2">
                <span>Operating Expenses</span>
                <span className="text-rose-400 print:text-black">-৳{totalMonthlyExpenses.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-base font-black text-emerald-400 print:text-black border-t-2 border-emerald-500/40 pt-3">
                <span>Estimated Net Profit</span>
                <span className="text-lg">৳{netMonthlyProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Report Content: Yearly Sales */}
        {selectedReport === 'yearly_sales' && (
          <div className="space-y-4">
            <div className="bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-2xl p-6 text-center">
              <div className="text-sm font-bold text-slate-400 print:text-slate-600">
                Total Annual Business Turnover ({selectedYear})
              </div>
              <div className="text-3xl font-black text-blue-400 print:text-black mt-2">
                ৳{totalYearlySales.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Total {yearlyOrders.length + yearlyEmiSales.length} laptops &amp; accessories delivered
              </div>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-8 pt-6 border-t border-slate-800 print:border-slate-300 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-400 print:text-black">
          <div>
            <div className="h-10 border-b border-dashed border-slate-700 print:border-black mb-1"></div>
            <span>Prepared By</span>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-700 print:border-black mb-1"></div>
            <span>Accounts Verified</span>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-700 print:border-black mb-1"></div>
            <span>Proprietor / MD Approval</span>
          </div>
        </div>
      </div>
    </div>
  );
};
