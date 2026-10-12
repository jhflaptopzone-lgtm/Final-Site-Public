import React, { useState } from 'react';
import { useAdminStore, BUSINESS_INFO } from '../adminStore';
import { Supplier, SupplierPurchase, SupplierPayment } from '../types';
import {
  Truck,
  Plus,
  Search,
  DollarSign,
  FileText,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Printer,
  X,
  CreditCard,
  ShoppingBag,
  Edit,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';
import { SupplierReportGenerator } from './SupplierReportGenerator';

export const SupplierManagementView: React.FC = () => {
  const {
    suppliers,
    supplierPurchases,
    supplierPayments,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    clearAllSuppliers,
    addSupplierPurchase,
    deleteSupplierPurchase,
    addSupplierPayment,
    deleteSupplierPayment,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'suppliers' | 'purchases' | 'payments' | 'ledger' | 'report'>('suppliers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierForLedger, setSelectedSupplierForLedger] = useState<string>(suppliers[0]?.id || '');

  // Modals
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isRecordPurchaseOpen, setIsRecordPurchaseOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // New Supplier Form
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    productsSupplied: 'Refurbished Laptops, SSDs, RAM',
    notes: '',
  });

  // Record Purchase Form
  const [newPurchase, setNewPurchase] = useState({
    supplierId: suppliers[0]?.id || '',
    invoiceRef: `PUR-${Date.now().toString().slice(-6)}`,
    purchaseDate: new Date().toISOString().slice(0, 10),
    itemDescription: 'Dubai A+ Grade ThinkPad & Dell Latitude Batch',
    quantity: 5,
    unitCost: 35000,
    paidAmount: 100000,
    paymentMethod: 'Bank Transfer' as any,
    notes: 'Direct flight shipment via Hazrat Shahjalal International Airport',
  });

  // Record Payment Form
  const [newPayment, setNewPayment] = useState({
    supplierId: suppliers[0]?.id || '',
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: 50000,
    paymentMethod: 'Bank Account' as any,
    transactionRef: `TRX-${Date.now().toString().slice(-6)}`,
    notes: 'Weekly vendor installment payment',
  });

  // Total KPIs
  const totalSuppliers = suppliers.length;
  const totalPurchasesVolume = suppliers.reduce((sum, s) => sum + (s.totalPurchases || 0), 0);
  const totalPaymentsMade = suppliers.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
  const totalSupplierDue = Math.max(0, totalPurchasesVolume - totalPaymentsMade);

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.companyName.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });

  // Submissions
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.phone) return;
    addSupplier({
      name: newSupplier.name,
      companyName: newSupplier.companyName || newSupplier.name,
      phone: newSupplier.phone,
      email: newSupplier.email,
      address: newSupplier.address,
      productsSupplied: newSupplier.productsSupplied.split(',').map((p) => p.trim()),
      totalPurchases: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      notes: newSupplier.notes,
    });
    setIsAddSupplierOpen(false);
    setNewSupplier({
      name: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      productsSupplied: 'Refurbished Laptops, SSDs, RAM',
      notes: '',
    });
  };

  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === newPurchase.supplierId);
    if (!sup) return;

    const totalCost = newPurchase.quantity * newPurchase.unitCost;
    const dueAmount = Math.max(0, totalCost - newPurchase.paidAmount);

    addSupplierPurchase({
      supplierId: sup.id,
      supplierName: sup.name,
      invoiceRef: newPurchase.invoiceRef,
      purchaseDate: newPurchase.purchaseDate,
      itemDescription: newPurchase.itemDescription,
      quantity: Number(newPurchase.quantity),
      unitCost: Number(newPurchase.unitCost),
      totalPurchase: totalCost,
      paidAmount: Number(newPurchase.paidAmount),
      dueAmount,
      paymentMethod: newPurchase.paymentMethod,
      notes: newPurchase.notes,
    });

    setIsRecordPurchaseOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === newPayment.supplierId);
    if (!sup) return;

    addSupplierPayment({
      supplierId: sup.id,
      supplierName: sup.name,
      paymentDate: newPayment.paymentDate,
      amount: Number(newPayment.amount),
      paymentMethod: newPayment.paymentMethod,
      transactionRef: newPayment.transactionRef,
      notes: newPayment.notes,
    });

    setIsRecordPaymentOpen(false);
  };

  // Build Ledger for selected supplier
  const targetSupplier = suppliers.find((s) => s.id === selectedSupplierForLedger) || suppliers[0];
  const supplierLedgerItems: Array<{
    date: string;
    type: 'PURCHASE' | 'PAYMENT';
    ref: string;
    description: string;
    debit: number; // Increases Due (Purchases)
    credit: number; // Decreases Due (Payments)
  }> = [];

  if (targetSupplier) {
    supplierPurchases
      .filter((p) => p.supplierId === targetSupplier.id)
      .forEach((p) => {
        supplierLedgerItems.push({
          date: p.purchaseDate,
          type: 'PURCHASE',
          ref: p.invoiceRef,
          description: `${p.itemDescription} (${p.quantity} units @ ৳${p.unitCost})`,
          debit: p.totalPurchase,
          credit: 0,
        });
        if (p.paidAmount > 0) {
          supplierLedgerItems.push({
            date: p.purchaseDate,
            type: 'PAYMENT',
            ref: `${p.invoiceRef}-ADV`,
            description: `Advance/Initial Paid upon Purchase (${p.paymentMethod})`,
            debit: 0,
            credit: p.paidAmount,
          });
        }
      });

    supplierPayments
      .filter((p) => p.supplierId === targetSupplier.id)
      .forEach((pay) => {
        supplierLedgerItems.push({
          date: pay.paymentDate,
          type: 'PAYMENT',
          ref: pay.transactionRef || 'DIRECT-PAY',
          description: `Vendor Due Settlement via ${pay.paymentMethod}${pay.notes ? ` (${pay.notes})` : ''}`,
          debit: 0,
          credit: pay.amount,
        });
      });

    // Sort chronologically
    supplierLedgerItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Calculate Running Balance for each item
  let runningBalance = 0;
  const ledgerWithBalance = supplierLedgerItems.map((item) => {
    runningBalance += item.debit - item.credit;
    return {
      ...item,
      balance: runningBalance,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              SUPPLIER &amp; VENDOR LEDGER
            </span>
            <span className="text-xs text-slate-400">
              Auto Formula: Supplier Due = Total Purchase − Total Paid
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-400" />
            <span>Supplier Management &amp; Ledger System</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {BUSINESS_INFO.name} • {BUSINESS_INFO.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('report')}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Audit Report</span>
          </button>
          <button
            onClick={() => setIsRecordPurchaseOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Record Purchase</span>
          </button>
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>Payment Entry</span>
          </button>
          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>

          {suppliers.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('⚠️ Are you sure you want to delete ALL suppliers, purchase records, and payments? This clears dummy vendor records so you can record your real laptop importers.')) {
                  clearAllSuppliers();
                }
              }}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5"
              title="Clear all demo suppliers"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Dummy</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Suppliers</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalSuppliers}</div>
          <div className="text-[11px] text-slate-500 mt-1">Dubai &amp; Domestic Importers</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Purchases Volume</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">৳{totalPurchasesVolume.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total procurement cost</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Payments Made</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">৳{totalPaymentsMade.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">Settled vendor payments</div>
        </div>

        <div className="bg-slate-900/90 border border-amber-900/30 rounded-2xl p-4.5 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Total Supplier Outstanding Due</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">৳{totalSupplierDue.toLocaleString()}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Purchase − Paid = Net Payable</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'suppliers'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Suppliers Directory ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'ledger'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Detailed Supplier Ledger</span>
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'purchases'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Purchases History ({supplierPurchases.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'payments'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Payment Entries ({supplierPayments.length})
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'report'
              ? 'bg-amber-600 text-slate-950 font-black shadow'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Audit Report &amp; Statements (সব রিপোর্ট)</span>
        </button>
      </div>

      {/* TAB 1: Suppliers Directory */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search supplier name, company, phone..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base">{supplier.name}</h3>
                      <div className="text-xs text-purple-400 font-semibold">{supplier.companyName}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        supplier.outstandingBalance > 0
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {supplier.outstandingBalance > 0 ? 'Has Due' : 'Settled'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{supplier.phone}</span>
                    </div>
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{supplier.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  </div>

                  {/* Financial Mini Balance */}
                  <div className="mt-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Purchases:</span>
                      <span className="font-bold text-slate-200">৳{(supplier.totalPurchases || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Paid:</span>
                      <span className="font-bold text-emerald-400">৳{(supplier.totalPaid || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span className="font-bold text-amber-400">Outstanding Due:</span>
                      <span className="font-black text-amber-400 text-sm">৳{supplier.outstandingBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedSupplierForLedger(supplier.id);
                      setActiveTab('ledger');
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold text-xs py-2 px-2 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ledger</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSupplierForLedger(supplier.id);
                      setActiveTab('report');
                    }}
                    className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-semibold text-xs py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1"
                    title="Generate Supplier Audit Report"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewPayment((prev) => ({ ...prev, supplierId: supplier.id }));
                      setIsRecordPaymentOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-2 rounded-xl transition"
                  >
                    Pay
                  </button>
                  <button
                    onClick={() => setEditingSupplier(supplier)}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 p-2 rounded-xl transition"
                    title="Edit Supplier Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete supplier ${supplier.name}? All associated purchases and ledger will be removed.`)) {
                        deleteSupplier(supplier.id);
                      }
                    }}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 p-2 rounded-xl transition"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Supplier Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-300 whitespace-nowrap">Select Supplier:</label>
              <select
                value={selectedSupplierForLedger}
                onChange={(e) => setSelectedSupplierForLedger(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 min-w-[240px]"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.companyName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Ledger Statement</span>
              </button>
            </div>
          </div>

          {targetSupplier && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              {/* Supplier Profile Info Header */}
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-black text-white">{targetSupplier.name} — Vendor Account Ledger</h2>
                  <div className="text-xs text-purple-400 font-semibold">{targetSupplier.companyName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Phone: {targetSupplier.phone} • Address: {targetSupplier.address}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    Current Net Balance Due
                  </div>
                  <div className="text-xl font-black text-amber-400">
                    ৳{targetSupplier.outstandingBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Reference #</th>
                      <th className="px-4 py-3">Description / Note</th>
                      <th className="px-4 py-3 text-right">Debit / Purchase (৳)</th>
                      <th className="px-4 py-3 text-right">Credit / Payment (৳)</th>
                      <th className="px-4 py-3 text-right text-amber-400">Running Due Balance (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {ledgerWithBalance.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-500">
                          No transactions recorded yet for {targetSupplier.name}.
                        </td>
                      </tr>
                    ) : (
                      ledgerWithBalance.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 text-slate-300">{row.date}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                row.type === 'PURCHASE'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-200">{row.ref}</td>
                          <td className="px-4 py-3 text-slate-300 max-w-[280px] truncate">{row.description}</td>
                          <td className="px-4 py-3 text-right font-semibold text-blue-400">
                            {row.debit > 0 ? `৳${row.debit.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                            {row.credit > 0 ? `৳${row.credit.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-amber-400">
                            ৳{row.balance.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Purchases History */}
      {activeTab === 'purchases' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date &amp; Ref</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-right">Total Purchase</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right text-amber-400">Due Amount</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {supplierPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-blue-400">{p.invoiceRef}</div>
                      <div className="text-[10px] text-slate-500">{p.purchaseDate}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{p.supplierName}</td>
                    <td className="px-4 py-3 text-slate-300">{p.itemDescription}</td>
                    <td className="px-4 py-3 text-right font-bold">{p.quantity}</td>
                    <td className="px-4 py-3 text-right">৳{p.unitCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-white">৳{p.totalPurchase.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400">৳{p.paidAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-black text-amber-400">৳{p.dueAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete purchase ref ${p.invoiceRef}?`)) {
                            deleteSupplierPurchase(p.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                        title="Delete Purchase Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Payments History */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date &amp; Ref</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Authorized By</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {supplierPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-emerald-400">{pay.transactionRef || 'DIRECT'}</div>
                      <div className="text-[10px] text-slate-500">{pay.paymentDate}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{pay.supplierName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-emerald-400 text-sm">
                      ৳{pay.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{pay.notes || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{pay.createdBy}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete payment transaction ${pay.transactionRef || pay.id}?`)) {
                            deleteSupplierPayment(pay.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                        title="Delete Payment Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Supplier Report Generator & Audit Statement (সব রিপোর্ট) */}
      {activeTab === 'report' && (
        <SupplierReportGenerator initialSupplierId={selectedSupplierForLedger} />
      )}

      {/* Modal: Add Supplier */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Add New Supplier</span>
              </h3>
              <button onClick={() => setIsAddSupplierOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="p-5 space-y-3.5 text-xs text-slate-300">
              <div>
                <label className="block mb-1 font-semibold text-white">Contact Person / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Tariqul Islam"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-white">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dubai Global Laptops LLC"
                  value={newSupplier.companyName}
                  onChange={(e) => setNewSupplier({ ...newSupplier, companyName: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-white">Mobile / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +971 50 123 4567"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-white">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. sales@dubaiglobal.com"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-white">Office / Warehouse Address</label>
                <input
                  type="text"
                  placeholder="e.g. Deira Computer Street, Dubai / Elephant Road, Dhaka"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-white">Products Supplied</label>
                <input
                  type="text"
                  placeholder="Comma-separated items"
                  value={newSupplier.productsSupplied}
                  onChange={(e) => setNewSupplier({ ...newSupplier, productsSupplied: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Purchase */}
      {isRecordPurchaseOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <span>Record Supplier Purchase</span>
              </h3>
              <button onClick={() => setIsRecordPurchaseOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPurchase} className="p-5 space-y-3.5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-white">Select Supplier *</label>
                  <select
                    value={newPurchase.supplierId}
                    onChange={(e) => setNewPurchase({ ...newPurchase, supplierId: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-white">Invoice Ref #</label>
                  <input
                    type="text"
                    value={newPurchase.invoiceRef}
                    onChange={(e) => setNewPurchase({ ...newPurchase, invoiceRef: e.target.value })}
                    className="w-full bg-slate-800 text-blue-400 font-mono font-bold px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-white">Item Description *</label>
                <input
                  type="text"
                  required
                  value={newPurchase.itemDescription}
                  onChange={(e) => setNewPurchase({ ...newPurchase, itemDescription: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-white">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    value={newPurchase.quantity}
                    onChange={(e) => setNewPurchase({ ...newPurchase, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-white font-bold px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-white">Unit Cost (৳) *</label>
                  <input
                    type="number"
                    value={newPurchase.unitCost}
                    onChange={(e) => setNewPurchase({ ...newPurchase, unitCost: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-white font-bold px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-emerald-400">Paid Now (৳) *</label>
                  <input
                    type="number"
                    value={newPurchase.paidAmount}
                    onChange={(e) => setNewPurchase({ ...newPurchase, paidAmount: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-emerald-400 font-bold px-3 py-2 rounded-xl border border-emerald-500/40"
                  />
                </div>
              </div>

              {/* Auto Cost Summary */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between text-xs">
                <div>
                  <span className="text-slate-400">Total Purchase: </span>
                  <span className="font-bold text-white">
                    ৳{(newPurchase.quantity * newPurchase.unitCost).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Auto Supplier Due: </span>
                  <span className="font-black text-amber-400">
                    ৳{Math.max(0, newPurchase.quantity * newPurchase.unitCost - newPurchase.paidAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPurchaseOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Save Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Record Payment to Supplier</span>
              </h3>
              <button onClick={() => setIsRecordPaymentOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5 text-xs text-slate-300">
              <div>
                <label className="block mb-1 font-semibold text-white">Select Supplier *</label>
                <select
                  value={newPayment.supplierId}
                  onChange={(e) => setNewPayment({ ...newPayment, supplierId: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 font-bold"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Current Due: ৳{s.outstandingBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-white">Payment Amount (৳) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                  className="w-full bg-slate-800 text-emerald-400 font-black text-lg px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-white">Payment Method *</label>
                  <select
                    value={newPayment.paymentMethod}
                    onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value as any })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  >
                    <option value="Bank Account">Bank Account (Eastern / City / Brac)</option>
                    <option value="Cash">Cash at Hand</option>
                    <option value="Bkash">bKash Merchant</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="POS">POS Machine</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-white">Transaction Reference</label>
                  <input
                    type="text"
                    value={newPayment.transactionRef}
                    onChange={(e) => setNewPayment({ ...newPayment, transactionRef: e.target.value })}
                    className="w-full bg-slate-800 text-white font-mono px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Payment Notes / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Dubai shipment installment clearance"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Supplier */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-400" />
                <span>Edit Supplier Details</span>
              </h3>
              <button onClick={() => setEditingSupplier(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSupplier(editingSupplier.id, {
                  name: editingSupplier.name,
                  companyName: editingSupplier.companyName,
                  phone: editingSupplier.phone,
                  email: editingSupplier.email,
                  address: editingSupplier.address,
                  productsSupplied: Array.isArray(editingSupplier.productsSupplied)
                    ? editingSupplier.productsSupplied
                    : (editingSupplier.productsSupplied as string).split(',').map((s) => s.trim()),
                  notes: editingSupplier.notes,
                });
                setEditingSupplier(null);
              }}
              className="p-5 space-y-3.5 text-xs text-slate-300"
            >
              <div>
                <label className="block mb-1 font-semibold text-white">Contact Person / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-white">Company / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={editingSupplier.companyName}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, companyName: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-white">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={editingSupplier.phone}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={editingSupplier.email || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Office / Warehouse Address</label>
                <input
                  type="text"
                  value={editingSupplier.address}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Products Supplied (Comma separated)</label>
                <input
                  type="text"
                  value={
                    Array.isArray(editingSupplier.productsSupplied)
                      ? editingSupplier.productsSupplied.join(', ')
                      : editingSupplier.productsSupplied || ''
                  }
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      productsSupplied: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Internal Notes</label>
                <textarea
                  rows={2}
                  value={editingSupplier.notes || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, notes: e.target.value })}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Update Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
