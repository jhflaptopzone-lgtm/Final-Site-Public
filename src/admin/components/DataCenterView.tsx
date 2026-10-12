import React, { useState } from 'react';
import { useAdminStore } from '../adminStore';
import {
  Database,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Download,
  Boxes,
  ShoppingCart,
  Users,
  Wrench,
  DollarSign,
  MessageSquare,
  Truck,
  ArrowRight,
} from 'lucide-react';

export const DataCenterView: React.FC = () => {
  const {
    products,
    orders,
    customers,
    stockUnits,
    suppliers,
    expenses,
    emiPlans,
    services,
    serviceEngineers,
    serviceParts,
    warrantyClaims,
    customerReviews,
    toolComments,
    clearAllDummyData,
    exportDataAsJson,
  } = useAdminStore();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [purgeSuccess, setPurgeSuccess] = useState<number | null>(null);

  // Calculate dummy vs real stats across all models
  const collections = [
    {
      id: 'products',
      name: 'Laptop Products (Catalog)',
      icon: Boxes,
      total: products.length,
      dummy: products.filter((p) => p.isDummy === true).length,
      real: products.filter((p) => p.isDummy !== true).length,
      description: 'Physical and catalog laptops listed for sale.',
    },
    {
      id: 'orders',
      name: 'Customer Orders',
      icon: ShoppingCart,
      total: orders.length,
      dummy: orders.filter((o) => o.isDummy === true).length,
      real: orders.filter((o) => o.isDummy !== true).length,
      description: 'Web, retail, and WhatsApp sales orders.',
    },
    {
      id: 'customers',
      name: 'Customer CRM Records',
      icon: Users,
      total: customers.length,
      dummy: customers.filter((c) => c.isDummy === true).length,
      real: customers.filter((c) => c.isDummy !== true).length,
      description: 'Client profiles, phone numbers, and addresses.',
    },
    {
      id: 'services',
      name: 'JHF Service Jobs & Repairs',
      icon: Wrench,
      total: services.length,
      dummy: services.filter((s) => s.isDummy === true).length,
      real: services.filter((s) => s.isDummy !== true).length,
      description: 'Customer intake job sheets, repair lifecycle & diagnosis.',
    },
    {
      id: 'service_parts',
      name: 'Service Spare Parts Inventory',
      icon: HardDrive,
      total: serviceParts.length,
      dummy: serviceParts.filter((p) => p.isDummy === true).length,
      real: serviceParts.filter((p) => p.isDummy !== true).length,
      description: 'Displays, keyboards, batteries, RAM, SSDs for repair.',
    },
    {
      id: 'service_engineers',
      name: 'Technicians & Engineers',
      icon: Users,
      total: serviceEngineers.length,
      dummy: serviceEngineers.filter((e) => e.isDummy === true).length,
      real: serviceEngineers.filter((e) => e.isDummy !== true).length,
      description: 'Internal technicians & third-party service labs.',
    },
    {
      id: 'warranty',
      name: 'Service Warranty Claims',
      icon: ShieldCheck,
      total: warrantyClaims.length,
      dummy: warrantyClaims.filter((w) => w.isDummy === true).length,
      real: warrantyClaims.filter((w) => w.isDummy !== true).length,
      description: 'Customer return and warranty claim tracking.',
    },
    {
      id: 'stockUnits',
      name: 'Individual Serialized Units',
      icon: Boxes,
      total: stockUnits.length,
      dummy: stockUnits.filter((s) => s.isDummy === true).length,
      real: stockUnits.filter((s) => s.isDummy !== true).length,
      description: 'Unique Barcode/Serial units in inventory.',
    },
    {
      id: 'suppliers',
      name: 'Supplier Directory & Ledgers',
      icon: Truck,
      total: suppliers.length,
      dummy: suppliers.filter((s) => s.isDummy === true).length,
      real: suppliers.filter((s) => s.isDummy !== true).length,
      description: 'Wholesale importers and ledger balances.',
    },
    {
      id: 'expenses',
      name: 'Expense Ledger Records',
      icon: DollarSign,
      total: expenses.length,
      dummy: expenses.filter((e) => e.isDummy === true).length,
      real: expenses.filter((e) => e.isDummy !== true).length,
      description: 'Operational, rent, and utility expense logs.',
    },
    {
      id: 'emiPlans',
      name: 'EMI Installment Plans',
      icon: FileSpreadsheet,
      total: emiPlans.length,
      dummy: emiPlans.filter((ep) => ep.isDummy === true).length,
      real: emiPlans.filter((ep) => ep.isDummy !== true).length,
      description: 'Customer installment payment contracts.',
    },
    {
      id: 'reviews',
      name: 'Customer Reviews & Comments',
      icon: MessageSquare,
      total: customerReviews.length + toolComments.length,
      dummy: customerReviews.filter((r) => r.isDummy === true).length + toolComments.filter((c) => c.isDummy === true).length,
      real: customerReviews.filter((r) => r.isDummy !== true).length + toolComments.filter((c) => c.isDummy !== true).length,
      description: 'Store ratings and software zone comments.',
    },
  ];

  const totalAllRecords = collections.reduce((acc, c) => acc + c.total, 0);
  const totalDummyRecords = collections.reduce((acc, c) => acc + c.dummy, 0);
  const totalRealRecords = collections.reduce((acc, c) => acc + c.real, 0);

  const handlePurge = () => {
    if (typedConfirmation !== 'PURGE DEMO DATA') return;
    const res = clearAllDummyData();
    setConfirmModalOpen(false);
    setTypedConfirmation('');
    setPurgeSuccess(res.deletedTotal);
    setTimeout(() => setPurgeSuccess(null), 7000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                JHF DATA CENTER <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">ISDUMMY ENGINE</span>
              </h1>
              <p className="text-xs text-slate-400">
                Audited isolation between Live Business Data and Demo / Seed Data.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportDataAsJson()}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export System JSON
          </button>
          <button
            onClick={() => setConfirmModalOpen(true)}
            disabled={totalDummyRecords === 0}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-md ${
              totalDummyRecords > 0
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge Demo Data ({totalDummyRecords})
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {purgeSuccess !== null && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3 text-emerald-200 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-emerald-300">Data Center Cleanup Completed:</span> Safely purged{' '}
            <span className="font-mono font-bold text-white bg-emerald-900/60 px-1.5 py-0.5 rounded">{purgeSuccess}</span> sample records.
            All live customer orders, real inventory, and active financials are 100% intact.
          </div>
        </div>
      )}

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Database Entities</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{totalAllRecords}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across 12 ERP collections</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Live Production Data
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{totalRealRecords}</div>
            <div className="text-[11px] text-emerald-500/80 mt-0.5">Immutable &amp; Protected from Demo Purge</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-900/40 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
          <div>
            <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Demo / Seed Data (isDummy)
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{totalDummyRecords}</div>
            <div className="text-[11px] text-amber-500/80 mt-0.5">
              {totalDummyRecords > 0 ? 'Removable with 1-click safe purge' : 'Zero demo data remaining'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trash2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Safety Protocol Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white">The JHF Data Architecture Guarantee:</span> Every entity in this ERP carries a schema-enforced{' '}
            <code className="text-blue-300 font-mono bg-blue-950/60 px-1 py-0.5 rounded">isDummy?: boolean</code> flag. Only records explicitly flagged as{' '}
            <code className="text-amber-300 font-mono bg-amber-950/60 px-1 py-0.5 rounded">isDummy: true</code> are selected by the Data Center.
            Real customer invoices, genuine supplier payables, and authentic stock units are never deleted.
          </div>
        </div>
      </div>

      {/* Collection Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Database Collections Breakdown</span>
            <span className="text-[10px] text-slate-400 font-normal">({collections.length} modules)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Collection / Entity</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Total Records</th>
                <th className="py-3 px-4 text-center">Live Data</th>
                <th className="py-3 px-4 text-center">Demo Data</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {collections.map((col) => {
                const IconComponent = col.icon;
                return (
                  <tr key={col.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-white">{col.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{col.description}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{col.total}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                        {col.real}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {col.dummy > 0 ? (
                        <span className="font-mono text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                          {col.dummy}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {col.dummy > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Contains Demo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Clean Production
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Purge All Demo Data?</h3>
                <p className="text-xs text-slate-400">Safe operation: Only affects records tagged as isDummy.</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Total records to be removed:</span>
                <span className="font-mono text-rose-400 font-bold text-sm">{totalDummyRecords} records</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                This action will delete all pre-loaded sample laptops, mock orders, and test service jobs. All actual items created by you or your customers will be completely preserved.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">
                Type <span className="font-mono text-rose-400 font-bold select-all">PURGE DEMO DATA</span> to confirm:
              </label>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                placeholder="PURGE DEMO DATA"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-rose-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setConfirmModalOpen(false);
                  setTypedConfirmation('');
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePurge}
                disabled={typedConfirmation !== 'PURGE DEMO DATA'}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                  typedConfirmation === 'PURGE DEMO DATA'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-950/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm &amp; Purge Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
