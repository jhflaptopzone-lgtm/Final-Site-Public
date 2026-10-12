import React, { useState } from 'react';
import { useAdminStore, BUSINESS_INFO, generateInvoiceNumber } from '../adminStore';
import { useAdminAuth } from '../authContext';
import { EmiPlan } from '../types';
import {
  CreditCard,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  History,
  FileText,
  User,
  Phone,
  Laptop,
  ArrowRight,
  Printer,
  X,
  Building,
  ShieldCheck,
  Check,
  Trash2,
  Edit,
} from 'lucide-react';
import { SalesInvoiceModal } from './SalesInvoiceModal';
import { BarcodeGenerator } from './BarcodeGenerator';

export const EmiManagementView: React.FC = () => {
  const {
    emiPlans,
    addEmiPlan,
    updateEmiPlan,
    deleteEmiPlan,
    deleteEmiPayment,
    clearAllEmiPlans,
    recordEmiPayment,
    suppliers,
    stockUnits,
  } = useAdminStore();
  const { currentUser } = useAdminAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'overdue' | 'completed'>('all');
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<EmiPlan | null>(null);
  const [selectedPlanForTimeline, setSelectedPlanForTimeline] = useState<EmiPlan | null>(null);
  const [selectedPlanForInvoice, setSelectedPlanForInvoice] = useState<EmiPlan | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bkash' | 'Nagad' | 'Rocket' | 'Bank Account' | 'POS'>('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // New EMI Sale Form State
  const [newSale, setNewSale] = useState({
    invoiceNo: generateInvoiceNumber(),
    saleDate: new Date().toISOString().slice(0, 10),
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerNid: '',
    guarantorName: '',
    guarantorPhone: '',
    productModel: 'Lenovo ThinkPad L14 Gen-2',
    serialNumber: '',
    configuration: 'Core i5 11th Gen / 16GB RAM / 512GB SSD',
    supplierName: suppliers[0]?.name || 'Dubai Global Laptops Trading LLC',
    salesPerson: currentUser?.name || 'Md. Jahid Hasan',
    buyPrice: 38000,
    sellPrice: 46500,
    downPayment: 20000,
    planMonths: 6 as 2 | 3 | 4 | 6 | 9 | 12,
    notes: '',
  });

  // Calculate stats
  const totalPlans = emiPlans.length;
  const activePlans = emiPlans.filter((p) => p.status === 'active' || p.status === 'overdue');
  const overduePlans = emiPlans.filter((p) => p.isOverdue || p.status === 'overdue');
  const totalOutstandingDue = emiPlans.reduce((sum, p) => sum + (p.remainingDue || 0), 0);
  const totalCollectedAmount = emiPlans.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

  // Filtered plans
  const filteredPlans = emiPlans.filter((p) => {
    if (filterStatus === 'active') return p.status === 'active';
    if (filterStatus === 'overdue') return p.isOverdue || p.status === 'overdue';
    if (filterStatus === 'completed') return p.status === 'completed';
    return true;
  }).filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.customerName.toLowerCase().includes(q) ||
      p.customerPhone.toLowerCase().includes(q) ||
      p.invoiceNo.toLowerCase().includes(q) ||
      p.productModel.toLowerCase().includes(q) ||
      p.serialNumber.toLowerCase().includes(q)
    );
  });

  // Handle New Sale submission
  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.customerName || !newSale.customerPhone || !newSale.productModel) {
      alert('Please fill in customer name, phone, and product model.');
      return;
    }

    const remainingDue = Math.max(0, newSale.sellPrice - newSale.downPayment);
    const monthlyInstallment = Math.ceil(remainingDue / newSale.planMonths);

    // Calculate dates
    const today = new Date();
    const nextDue = new Date(today);
    nextDue.setMonth(nextDue.getMonth() + 1);
    const finalDate = new Date(today);
    finalDate.setMonth(finalDate.getMonth() + newSale.planMonths);

    addEmiPlan({
      invoiceNo: newSale.invoiceNo,
      saleDate: newSale.saleDate,
      customerName: newSale.customerName,
      customerPhone: newSale.customerPhone,
      customerAddress: newSale.customerAddress,
      customerNid: newSale.customerNid,
      guarantorName: newSale.guarantorName,
      guarantorPhone: newSale.guarantorPhone,
      productModel: newSale.productModel,
      serialNumber: newSale.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      configuration: newSale.configuration,
      supplierName: newSale.supplierName,
      salesPerson: newSale.salesPerson,
      buyPrice: Number(newSale.buyPrice),
      sellPrice: Number(newSale.sellPrice),
      profit: Number(newSale.sellPrice) - Number(newSale.buyPrice),
      downPayment: Number(newSale.downPayment),
      totalDue: remainingDue,
      paidAmount: Number(newSale.downPayment),
      remainingDue: remainingDue,
      planMonths: newSale.planMonths,
      monthlyInstallment,
      nextDueDate: nextDue.toISOString().slice(0, 10),
      estimatedFinalPayDate: finalDate.toISOString().slice(0, 10),
      isOverdue: false,
      status: remainingDue === 0 ? 'completed' : 'active',
      notes: newSale.notes,
    });

    setIsNewSaleOpen(false);
    // Reset form
    setNewSale({
      invoiceNo: generateInvoiceNumber(),
      saleDate: new Date().toISOString().slice(0, 10),
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerNid: '',
      guarantorName: '',
      guarantorPhone: '',
      productModel: 'Lenovo ThinkPad L14 Gen-2',
      serialNumber: '',
      configuration: 'Core i5 11th Gen / 16GB RAM / 512GB SSD',
      supplierName: suppliers[0]?.name || 'Dubai Global Laptops Trading LLC',
      salesPerson: currentUser?.name || 'Md. Jahid Hasan',
      buyPrice: 38000,
      sellPrice: 46500,
      downPayment: 20000,
      planMonths: 6,
      notes: '',
    });
  };

  const handleOpenPayment = (plan: EmiPlan) => {
    setSelectedPlanForPayment(plan);
    setPaymentAmount(plan.monthlyInstallment > plan.remainingDue ? plan.remainingDue : plan.monthlyInstallment);
    setPaymentSuccessMsg('');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPayment || paymentAmount <= 0) return;

    const res = recordEmiPayment(selectedPlanForPayment.id, paymentAmount, paymentMethod, paymentNotes);
    if (res.success) {
      setPaymentSuccessMsg(res.message || 'Payment recorded!');
      setTimeout(() => {
        setSelectedPlanForPayment(null);
        setPaymentSuccessMsg('');
      }, 1500);
    } else {
      alert(res.message || 'Payment failed');
    }
  };

  const autoRemaining = Math.max(0, Number(newSale.sellPrice) - Number(newSale.downPayment));
  const autoProfit = Math.max(0, Number(newSale.sellPrice) - Number(newSale.buyPrice));
  const autoMonthly = Math.ceil(autoRemaining / (newSale.planMonths || 6));

  return (
    <div className="space-y-6">
      {/* Business ERP Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                ERP INSTALLMENT &amp; EMI ENGINE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Auto Profit &amp; Overdue Detection Active
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-400" />
              <span>{BUSINESS_INFO.name} — EMI &amp; Installment Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {BUSINESS_INFO.location} • Hotline: {BUSINESS_INFO.phone} • Developer: {BUSINESS_INFO.developer} ({BUSINESS_INFO.developerRole})
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setNewSale((prev) => ({ ...prev, invoiceNo: generateInvoiceNumber() }));
                setIsNewSaleOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New EMI Sale</span>
            </button>

            {emiPlans.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('⚠️ Are you sure you want to delete ALL EMI / Installment plans and their payment histories? This clears demo contracts.')) {
                    clearAllEmiPlans();
                  }
                }}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs px-3 py-2.5 rounded-xl transition flex items-center gap-1.5"
                title="Clear all demo EMI plans"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Dummy</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Active EMI</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{activePlans.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total {totalPlans} all-time contracts</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Outstanding Due Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">৳{totalOutstandingDue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">Principal to be collected</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Recovered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">৳{totalCollectedAmount.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">Down payments + Installments</div>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/30 rounded-2xl p-4.5 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">Overdue Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">{overduePlans.length} Accounts</div>
          <div className="text-[11px] text-rose-400/70 mt-1">Requires immediate follow-up</div>
        </div>
      </div>

      {/* Overdue Banner Warning */}
      {overduePlans.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-rose-200 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-rose-100">Attention Required: </span>
              There are {overduePlans.length} customer(s) with overdue installments past their designated grace period.
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('overdue')}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shrink-0 transition"
          >
            Filter Overdue Accounts
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Contracts ({emiPlans.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === 'active'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Active ({emiPlans.filter((p) => p.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              filterStatus === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'text-rose-400 hover:text-white hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue ({overduePlans.length})</span>
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Completed ({emiPlans.filter((p) => p.status === 'completed').length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, phone, invoice, serial..."
            className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* EMI Plans Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Invoice &amp; Date</th>
                <th className="px-4 py-3">Customer Details</th>
                <th className="px-4 py-3">Laptop &amp; Serial</th>
                <th className="px-4 py-3">Plan / Term</th>
                <th className="px-4 py-3 text-right">Price / Profit</th>
                <th className="px-4 py-3 text-right">Paid / Remaining Due</th>
                <th className="px-4 py-3">Next Due</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    No EMI contracts found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-blue-400">{plan.invoiceNo}</div>
                      <div className="text-[10px] text-slate-500">{plan.saleDate}</div>
                      <div className="mt-1">
                        <BarcodeGenerator value={plan.invoiceNo} height={20} showText={false} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{plan.customerName}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{plan.customerPhone}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {plan.customerAddress}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-100">{plan.productModel}</div>
                      <div className="font-mono text-[10px] text-emerald-400">SN: {plan.serialNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {plan.configuration}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-slate-800 text-blue-300 border border-slate-700">
                        {plan.planMonths} Months Plan
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1">
                        ৳{plan.monthlyInstallment.toLocaleString()} / mo
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="font-bold text-white">৳{plan.sellPrice.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Buy: ৳{plan.buyPrice.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        Profit: +৳{plan.profit.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="text-emerald-400 font-semibold">
                        Paid: ৳{plan.paidAmount.toLocaleString()}
                      </div>
                      <div className="text-amber-400 font-bold text-sm">
                        Due: ৳{plan.remainingDue.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Down: ৳{plan.downPayment.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className={`font-semibold ${plan.isOverdue ? 'text-rose-400' : 'text-slate-300'}`}>
                        {plan.nextDueDate}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Final: {plan.estimatedFinalPayDate}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {plan.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Check className="w-3 h-3" /> Fully Paid
                        </span>
                      ) : plan.isOverdue || plan.status === 'overdue' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Clock className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {plan.remainingDue > 0 && (
                          <button
                            onClick={() => handleOpenPayment(plan)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow transition"
                            title="Collect Installment"
                          >
                            Collect
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPlanForTimeline(plan)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold px-2 py-1.5 rounded-lg border border-slate-700 transition"
                          title="View Payment Timeline"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedPlanForInvoice(plan)}
                          className="bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-semibold px-2 py-1.5 rounded-lg border border-slate-700 transition"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete EMI Plan ${plan.invoiceNo} for customer ${plan.customerName}?`)) {
                              deleteEmiPlan(plan.id);
                            }
                          }}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold px-2 py-1.5 rounded-lg border border-rose-500/30 transition"
                          title="Delete EMI Contract"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New EMI Sale Modal */}
      {isNewSaleOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-6">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span>Create New EMI / Installment Sale</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Auto Invoice, 1st Installment Instant Payment, Flexible Plan &amp; Auto Profit Calculation
                </p>
              </div>
              <button
                onClick={() => setIsNewSaleOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="p-6 space-y-5 text-xs text-slate-300">
              {/* Top Banner: Auto invoice & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Invoice Number (Auto)</label>
                  <input
                    type="text"
                    value={newSale.invoiceNo}
                    readOnly
                    className="w-full bg-slate-800 text-blue-400 font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Sale Date</label>
                  <input
                    type="date"
                    value={newSale.saleDate}
                    onChange={(e) => setNewSale({ ...newSale, saleDate: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Sales Person</label>
                  <input
                    type="text"
                    value={newSale.salesPerson}
                    onChange={(e) => setNewSale({ ...newSale, salesPerson: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700"
                  />
                </div>
              </div>

              {/* Section 1: Customer & Guarantor */}
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-blue-400">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer &amp; Guarantor Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nahid Hasan"
                      value={newSale.customerName}
                      onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Customer Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 01713-447336"
                      value={newSale.customerPhone}
                      onChange={(e) => setNewSale({ ...newSale, customerPhone: e.target.value })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Customer NID Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 1995331289000124"
                      value={newSale.customerNid}
                      onChange={(e) => setNewSale({ ...newSale, customerNid: e.target.value })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div className="sm:col-span-1">
                    <label className="block mb-1 font-semibold">Delivery Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Walton Factory, Chandra, Gazipur"
                      value={newSale.customerAddress}
                      onChange={(e) => setNewSale({ ...newSale, customerAddress: e.target.value })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Guarantor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Engr. Mofizur Rahman"
                      value={newSale.guarantorName}
                      onChange={(e) => setNewSale({ ...newSale, guarantorName: e.target.value })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Guarantor Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. 01811-224466"
                      value={newSale.guarantorPhone}
                      onChange={(e) => setNewSale({ ...newSale, guarantorPhone: e.target.value })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Laptop & Serial Info */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-emerald-400">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Laptop &amp; Inventory Serial Tracking</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold">Laptop Model *</label>
                    <input
                      type="text"
                      required
                      value={newSale.productModel}
                      onChange={(e) => setNewSale({ ...newSale, productModel: e.target.value })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Serial Number (SN)</label>
                    <input
                      type="text"
                      placeholder="e.g. SN-LEN-L14-88422"
                      value={newSale.serialNumber}
                      onChange={(e) => setNewSale({ ...newSale, serialNumber: e.target.value })}
                      className="w-full bg-slate-800 text-white font-mono px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Linked Supplier</label>
                    <select
                      value={newSale.supplierName}
                      onChange={(e) => setNewSale({ ...newSale, supplierName: e.target.value })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block mb-1 font-semibold">Full Configuration / Specs</label>
                  <input
                    type="text"
                    value={newSale.configuration}
                    onChange={(e) => setNewSale({ ...newSale, configuration: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Section 3: Financials & Flexible EMI Plan */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-amber-400">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Financials &amp; Flexible Installment Plan</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold">Buy Price (৳)</label>
                    <input
                      type="number"
                      value={newSale.buyPrice}
                      onChange={(e) => setNewSale({ ...newSale, buyPrice: Number(e.target.value) })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Sell Price (৳) *</label>
                    <input
                      type="number"
                      required
                      value={newSale.sellPrice}
                      onChange={(e) => setNewSale({ ...newSale, sellPrice: Number(e.target.value) })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-emerald-400">
                      1st Installment (Instant) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newSale.downPayment}
                      onChange={(e) => setNewSale({ ...newSale, downPayment: Number(e.target.value) })}
                      className="w-full bg-slate-800 text-emerald-400 px-3 py-2 rounded-xl border border-emerald-500/40 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">Flexible Plan Duration *</label>
                    <select
                      value={newSale.planMonths}
                      onChange={(e) => setNewSale({ ...newSale, planMonths: Number(e.target.value) as any })}
                      className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none font-bold"
                    >
                      <option value={2}>2 Months Plan</option>
                      <option value={3}>3 Months Plan</option>
                      <option value={4}>4 Months Plan</option>
                      <option value={6}>6 Months Plan</option>
                      <option value={9}>9 Months Plan</option>
                      <option value={12}>12 Months Plan</option>
                    </select>
                  </div>
                </div>

                {/* Auto Calculated Summary Pill */}
                <div className="mt-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Auto Profit</span>
                    <span className="text-base font-black text-emerald-400">৳{autoProfit.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Remaining Due</span>
                    <span className="text-base font-black text-amber-400">৳{autoRemaining.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Monthly Installment</span>
                    <span className="text-base font-black text-blue-400">৳{autoMonthly.toLocaleString()} / mo</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Term</span>
                    <span className="text-base font-black text-white">{newSale.planMonths} Months</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewSaleOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-600/25 transition"
                >
                  Complete &amp; Save EMI Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect EMI Payment Modal */}
      {selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Collect EMI Installment Payment</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">{selectedPlanForPayment.invoiceNo}</p>
              </div>
              <button
                onClick={() => setSelectedPlanForPayment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs text-slate-300">
              {paymentSuccessMsg && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{paymentSuccessMsg}</span>
                </div>
              )}

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Customer:</span>
                  <span className="font-bold text-white">{selectedPlanForPayment.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Laptop Model:</span>
                  <span className="text-slate-200">{selectedPlanForPayment.productModel}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Rate:</span>
                  <span className="font-semibold text-blue-400">৳{selectedPlanForPayment.monthlyInstallment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span className="font-bold text-amber-400">Current Remaining Due:</span>
                  <span className="font-black text-amber-400 text-sm">৳{selectedPlanForPayment.remainingDue.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-white">Payment Amount (৳) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedPlanForPayment.remainingDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 text-emerald-400 font-bold text-base px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(selectedPlanForPayment.monthlyInstallment)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    1 Month Installment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(selectedPlanForPayment.remainingDue)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 hover:text-amber-300"
                  >
                    Full Balance (Pay All)
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-white">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
                >
                  <option value="Cash">Cash at Shop</option>
                  <option value="Bkash">bKash (Merchant / Personal)</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank Account">Bank Account (Eastern / City / Brac)</option>
                  <option value="POS">Card POS Machine</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Notes / Receipt Reference</label>
                <input
                  type="text"
                  placeholder="Optional memo or transaction ID"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForPayment(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg transition"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline History Modal */}
      {selectedPlanForTimeline && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" />
                  <span>Installment Payment Timeline</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedPlanForTimeline.customerName} • {selectedPlanForTimeline.invoiceNo}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlanForTimeline(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[420px] overflow-y-auto space-y-3 text-xs">
              {selectedPlanForTimeline.paymentHistory.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between gap-3 relative"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      #{item.installmentNumber}
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>৳{item.amountPaid.toLocaleString()}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.paymentMethod}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Receipt: <span className="font-mono text-slate-300">{item.receiptNo}</span>
                      </div>
                      {item.notes && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">{item.notes}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <div className="text-[11px] text-slate-400">{item.paymentDate}</div>
                    <div className="text-[10px] text-amber-400 font-semibold">
                      Rem: ৳{item.remainingAfterPayment.toLocaleString()}
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete payment receipt ${item.receiptNo}?`)) {
                          deleteEmiPayment(selectedPlanForTimeline.id, item.id);
                          setSelectedPlanForTimeline(null);
                        }
                      }}
                      className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-[10px] flex items-center gap-1"
                      title="Delete payment record"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Total Paid: </span>
                <span className="font-bold text-emerald-400">৳{selectedPlanForTimeline.paidAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Remaining Due: </span>
                <span className="font-bold text-amber-400">৳{selectedPlanForTimeline.remainingDue.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedPlanForTimeline(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {selectedPlanForInvoice && (
        <SalesInvoiceModal
          onClose={() => setSelectedPlanForInvoice(null)}
          order={{
            id: selectedPlanForInvoice.id,
            orderNumber: selectedPlanForInvoice.invoiceNo,
            createdAt: selectedPlanForInvoice.saleDate,
            updatedAt: selectedPlanForInvoice.saleDate,
            customerName: selectedPlanForInvoice.customerName,
            customerPhone: selectedPlanForInvoice.customerPhone,
            deliveryAddress: selectedPlanForInvoice.customerAddress,
            district: 'Gazipur',
            items: [
              {
                id: '1',
                productId: selectedPlanForInvoice.productId || 'p1',
                productName: selectedPlanForInvoice.productModel,
                quantity: 1,
                unitPrice: selectedPlanForInvoice.sellPrice,
                totalPrice: selectedPlanForInvoice.sellPrice,
                specs: selectedPlanForInvoice.configuration,
              } as any,
            ],
            subtotal: selectedPlanForInvoice.sellPrice,
            discount: 0,
            deliveryCharge: 0,
            totalAmount: selectedPlanForInvoice.sellPrice,
            paymentMethod: 'Installment (EMI)',
            paymentStatus: selectedPlanForInvoice.remainingDue === 0 ? 'paid' : 'partial',
            orderStatus: 'delivered',
            salesBy: selectedPlanForInvoice.salesPerson,
          }}
        />
      )}
    </div>
  );
};
