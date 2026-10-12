import React, { useState } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import { Expense } from '../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Receipt,
  Download,
  Calendar,
  Filter,
  X,
  PieChart,
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { orders, expenses, addExpense, exportDataAsCsv } = useAdminStore();
  const { hasPermission, currentUser } = useAdminAuth();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('shop_rent');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseNotes, setExpenseNotes] = useState('');

  // Financial Computations
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'partially_paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalCostOfGoods = orders.reduce((sum, o) => {
    return sum + o.items.reduce((c, item) => c + item.purchaseCost * item.quantity, 0);
  }, 0);

  const grossProfit = totalRevenue - totalCostOfGoods;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || expenseAmount <= 0) return;

    addExpense({
      title: expenseTitle,
      category: expenseCategory,
      amount: expenseAmount,
      date: new Date().toISOString(),
      notes: expenseNotes,
      recordedBy: currentUser?.uid || 'system',
      recordedByName: currentUser?.name || 'Admin',
    });

    setIsAddExpenseOpen(false);
    setExpenseTitle('');
    setExpenseAmount(0);
    setExpenseNotes('');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Financials, Revenue &amp; Expense Tracking</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time profit &amp; loss analysis, cost of goods sold, operating overheads, and net margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('Finance', 'write') && (
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          )}

          <button
            onClick={() => exportDataAsCsv('expenses')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl border border-slate-700 font-semibold"
          >
            Export Expenses
          </button>
        </div>
      </div>

      {/* 4 Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Gross Invoiced Revenue</span>
          <div className="text-2xl font-extrabold text-white">৳{totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active customer billing</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Cost of Laptops (COGS)</span>
          <div className="text-2xl font-extrabold text-slate-300">৳{totalCostOfGoods.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Direct unit import expense</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Operating Expenses</span>
          <div className="text-2xl font-extrabold text-rose-400">৳{totalExpenses.toLocaleString()}</div>
          <div className="text-[11px] text-rose-300/80 mt-1 flex items-center gap-1 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Rent, staff, delivery, utilities</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Estimated Net Profit</span>
          <div className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ৳{netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Margin: {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}% of turnover
          </div>
        </div>
      </div>

      {/* Expenses Breakdown & Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>Business Operating Expenses Ledger</span>
            </h2>
            <p className="text-xs text-slate-400">Recorded expenses for shop maintenance, logistics, and staff</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Expense Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-3 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No operating expenses recorded yet.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(exp.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{exp.title}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-400">
                      ৳{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{exp.notes || '—'}</td>
                    <td className="py-3 px-3 text-right text-slate-300 text-[11px]">
                      {exp.recordedByName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                <span>Record Store Expense</span>
              </h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. Shop Rent for September 2026"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="shop_rent">Shop Rent (Multiplan Centre / Baroipara)</option>
                  <option value="import_duty">Import &amp; Dubai Customs Duty</option>
                  <option value="courier_fees">Courier / Delivery Fees</option>
                  <option value="salaries">Staff Salaries</option>
                  <option value="marketing">Facebook Ads &amp; Marketing</option>
                  <option value="shop_utilities">Utilities &amp; WiFi</option>
                  <option value="packaging">Packaging &amp; Bags</option>
                  <option value="other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount (৳) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  placeholder="25000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes / Voucher Reference</label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="Voucher #, Receipt attached"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1.5 px-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-4 rounded-xl shadow"
                >
                  Save Expense
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
