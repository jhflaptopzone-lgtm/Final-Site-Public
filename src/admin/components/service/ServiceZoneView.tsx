import React, { useState } from 'react';
import { useAdminStore } from '../../adminStore';
import { ServiceJob, ServiceStatus, ServicePart, ServiceEngineer } from '../../types';
import { NewServiceJobModal } from './NewServiceJobModal';
import { ServiceJobDetailModal } from './ServiceJobDetailModal';
import { ServiceInvoiceModal } from './ServiceInvoiceModal';
import { WarrantyClaimModal } from './WarrantyClaimModal';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HardDrive,
  Users,
  ShieldCheck,
  Printer,
  FileText,
  DollarSign,
  TrendingUp,
  Laptop,
  ArrowRight,
  Phone,
  Calendar,
  Sparkles,
  Layers,
  ChevronRight,
  Check,
  X,
  CreditCard,
} from 'lucide-react';

interface ServiceZoneViewProps {
  initialTab?:
    | 'dashboard'
    | 'new'
    | 'active'
    | 'estimates'
    | 'engineers'
    | 'parts'
    | 'warranty'
    | 'invoices'
    | 'reports';
}

export const ServiceZoneView: React.FC<ServiceZoneViewProps> = ({ initialTab = 'dashboard' }) => {
  const {
    services,
    serviceEngineers,
    serviceParts,
    warrantyClaims,
    addServiceEngineer,
    addServicePart,
    deleteServicePart,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'new' | 'active' | 'estimates' | 'engineers' | 'parts' | 'warranty' | 'invoices' | 'reports'
  >(initialTab);

  // Search & Filter for jobs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<ServiceJob | null>(null);
  const [selectedJobForInvoice, setSelectedJobForInvoice] = useState<ServiceJob | null>(null);
  const [warrantyModalOpen, setWarrantyModalOpen] = useState(false);

  // New Engineer Modal
  const [newEngOpen, setNewEngOpen] = useState(false);
  const [engName, setEngName] = useState('');
  const [engPhone, setEngPhone] = useState('');
  const [engSpecialization, setEngSpecialization] = useState('');
  const [engType, setEngType] = useState<'internal' | 'external'>('internal');
  const [engShop, setEngShop] = useState('JHF In-House Lab');

  // New Part Modal
  const [newPartOpen, setNewPartOpen] = useState(false);
  const [partName, setPartName] = useState('');
  const [partCode, setPartCode] = useState('');
  const [partCategory, setPartCategory] = useState<ServicePart['category']>('Display');
  const [partStock, setPartStock] = useState(5);
  const [partCost, setPartCost] = useState(3000);
  const [partPrice, setPartPrice] = useState(4500);
  const [partWarranty, setPartWarranty] = useState(180);

  // Stats
  const totalJobs = services.length;
  const inDiagnosis = services.filter((s) => s.status === 'DIAGNOSING').length;
  const inRepair = services.filter((s) => ['IN REPAIR', 'WAITING FOR PARTS'].includes(s.status)).length;
  const readyForDelivery = services.filter((s) => s.status === 'READY FOR DELIVERY').length;
  const delivered = services.filter((s) => s.status === 'DELIVERED').length;
  const warrantyReturns = services.filter((s) => s.status === 'WARRANTY RETURN').length;
  const totalServiceRevenue = services.reduce((acc, s) => acc + (s.totalCost || 0), 0);
  const totalPaid = services.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const totalDue = services.reduce((acc, s) => acc + (s.dueAmount || 0), 0);
  const totalProfit = services.reduce((acc, s) => acc + (s.profit || 0), 0);

  // Filtered jobs
  const filteredJobs = services.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerPhone.includes(searchQuery) ||
      job.laptopModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.serialNumber && job.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddEngineer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!engName.trim() || !engPhone.trim()) return;
    addServiceEngineer({
      name: engName,
      phone: engPhone,
      specialization: engSpecialization || 'General Laptop Servicing',
      engineerType: engType,
      shopName: engShop,
      status: 'active',
      totalJobs: 0,
      completedJobs: 0,
      isDummy: false,
    });
    setNewEngOpen(false);
    setEngName('');
    setEngPhone('');
    setEngSpecialization('');
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim() || !partCode.trim()) return;
    addServicePart({
      name: partName,
      code: partCode,
      category: partCategory,
      stock: partStock,
      minStockAlert: 2,
      purchaseCost: partCost,
      sellingPrice: partPrice,
      warrantyDays: partWarranty,
      isDummy: false,
    });
    setNewPartOpen(false);
    setPartName('');
    setPartCode('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              JHF SERVICE ZONE <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">DIAGNOSTICS &amp; LAB</span>
            </h1>
            <p className="text-xs text-slate-400">
              Complete laptop repair operations: intake, chip-level soldering, parts, billing &amp; warranty management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setWarrantyModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            File Warranty Claim
          </button>
          <button
            onClick={() => setNewJobModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition"
          >
            <Plus className="w-4 h-4" />
            New Service Intake
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold overflow-x-auto gap-1">
        {[
          { id: 'dashboard', label: 'Service Dashboard', icon: TrendingUp },
          { id: 'active', label: `Active Services (${services.filter((s) => s.status !== 'DELIVERED').length})`, icon: Wrench },
          { id: 'estimates', label: `Estimates (${services.filter((s) => s.status === 'ESTIMATE READY').length})`, icon: DollarSign },
          { id: 'engineers', label: `Engineers (${serviceEngineers.length})`, icon: Users },
          { id: 'parts', label: `Service Parts (${serviceParts.length})`, icon: HardDrive },
          { id: 'warranty', label: `Warranty Claims (${warrantyClaims.length})`, icon: ShieldCheck },
          { id: 'invoices', label: 'Service Invoices', icon: Printer },
          { id: 'reports', label: 'Service Reports', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-white bg-slate-850'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SERVICE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Intake</div>
              <div className="text-xl font-bold font-mono text-white mt-1">{totalJobs}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">All time repair jobs</div>
            </div>

            <div className="bg-slate-900 border border-blue-900/40 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-blue-400 uppercase">Diagnosing</div>
              <div className="text-xl font-bold font-mono text-blue-300 mt-1">{inDiagnosis}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">On testing bench</div>
            </div>

            <div className="bg-slate-900 border border-purple-900/40 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-purple-400 uppercase">In Repair</div>
              <div className="text-xl font-bold font-mono text-purple-300 mt-1">{inRepair}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Micro-soldering/Parts</div>
            </div>

            <div className="bg-slate-900 border border-cyan-900/40 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-cyan-400 uppercase">Ready Delivery</div>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{readyForDelivery}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Passed QA testing</div>
            </div>

            <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase">Delivered</div>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{delivered}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Handed to client</div>
            </div>

            <div className="bg-slate-900 border border-rose-900/40 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-rose-400 uppercase">Warranty Claims</div>
              <div className="text-xl font-bold font-mono text-rose-300 mt-1">{warrantyReturns}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Warranty returns</div>
            </div>
          </div>

          {/* Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Service Bill</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">৳{totalServiceRevenue.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Labor + Spare Parts</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-emerald-400 uppercase">Collected Payments</div>
                <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">৳{totalPaid.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-500/80 mt-0.5">Cash / bKash / Bank</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-rose-900/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-rose-400 uppercase">Outstanding Due</div>
                <div className="text-2xl font-bold font-mono text-rose-300 mt-1">৳{totalDue.toLocaleString()}</div>
                <div className="text-[10px] text-rose-500/80 mt-0.5">Payable at delivery</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-purple-900/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-purple-400 uppercase">Service Net Profit</div>
                <div className="text-2xl font-bold font-mono text-purple-300 mt-1">৳{totalProfit.toLocaleString()}</div>
                <div className="text-[10px] text-purple-500/80 mt-0.5">Labor profit margin</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Active Pipeline Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Service Job Queue</h3>
              </div>
              <button
                onClick={() => setActiveTab('active')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
              >
                <span>View Full Active Table</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {services
                .filter((s) => s.status !== 'DELIVERED')
                .slice(0, 5)
                .map((job) => (
                  <div key={job.id} className="p-4 hover:bg-slate-800/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{job.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold uppercase">
                          {job.status}
                        </span>
                        <span className="text-slate-400 font-medium">
                          {job.laptopBrand} {job.laptopModel}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-3">
                        <span>Customer: <strong className="text-slate-300">{job.customerName}</strong> ({job.customerPhone})</span>
                        <span>Assigned: <strong className="text-slate-300">{job.engineerName || 'General Queue'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <div className="font-bold text-white">৳{job.totalCost.toLocaleString()}</div>
                        <div className={`text-[10px] ${job.dueAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {job.dueAmount > 0 ? `Due: ৳${job.dueAmount.toLocaleString()}` : 'Paid in Full'}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedJobForDetail(job)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SERVICES TABLE */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Job ID, customer, phone, model, S/N..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {['ALL', 'RECEIVED', 'DIAGNOSING', 'ESTIMATE READY', 'WAITING FOR PARTS', 'IN REPAIR', 'READY FOR DELIVERY', 'DELIVERED', 'WARRANTY RETURN'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Job ID / Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Device &amp; Specs</th>
                    <th className="py-3 px-4">Assigned Engineer</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Bill / Due</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No service jobs matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-white">{job.id}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{job.customerName}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {job.customerPhone}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{job.laptopBrand} {job.laptopModel}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            S/N: {job.serialNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200">{job.engineerName || 'Unassigned'}</div>
                          <div className="text-[10px] text-slate-500">{job.serviceShopName || 'Main Lab'}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            job.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : job.status === 'WARRANTY RETURN'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-bold text-white">৳{job.totalCost.toLocaleString()}</div>
                          <div className={`text-[10px] font-semibold ${job.dueAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {job.dueAmount > 0 ? `Due: ৳${job.dueAmount.toLocaleString()}` : 'Paid'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedJobForDetail(job)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition"
                            >
                              Job Sheet
                            </button>
                            <button
                              onClick={() => setSelectedJobForInvoice(job)}
                              title="Print Service Invoice"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 3: ESTIMATES */}
      {activeTab === 'estimates' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white">Service Estimates Pending Customer Approval</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quotes calculated by technicians awaiting client go-ahead.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services
              .filter((s) => s.status === 'ESTIMATE READY')
              .map((job) => (
                <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono font-bold text-white text-sm">{job.id}</div>
                      <div className="font-medium text-slate-300">{job.laptopBrand} {job.laptopModel}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Customer: {job.customerName} ({job.customerPhone})</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                      Estimate Ready
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div><strong>Diagnosis:</strong> {job.diagnosis || 'Diagnostic inspection completed.'}</div>
                    <div><strong>Labor:</strong> ৳{job.laborCost} | <strong>Parts:</strong> ৳{job.partsCost}</div>
                    <div className="text-blue-400 font-bold text-sm pt-1">
                      Total Estimated Cost: ৳{job.totalCost.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSelectedJobForDetail(job)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                    >
                      Open Job Sheet &amp; Approve
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: ENGINEERS ROSTER */}
      {activeTab === 'engineers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div>
              <h3 className="text-sm font-bold text-white">Technicians &amp; Micro-Soldering Specialists</h3>
              <p className="text-xs text-slate-400 mt-0.5">In-house hardware engineers and third-party specialty labs.</p>
            </div>
            <button
              onClick={() => setNewEngOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Engineer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {serviceEngineers.map((eng) => (
              <div key={eng.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{eng.name}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    eng.engineerType === 'internal'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {eng.engineerType}
                  </span>
                </div>

                <div className="text-slate-400 space-y-1">
                  <div><strong>Phone:</strong> {eng.phone}</div>
                  <div><strong>Specialty:</strong> {eng.specialization}</div>
                  <div><strong>Lab:</strong> {eng.shopName}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 font-mono text-center">
                  <div className="bg-slate-950/60 p-2 rounded">
                    <div className="text-slate-500 text-[10px]">TOTAL JOBS</div>
                    <div className="font-bold text-white text-sm">{eng.totalJobs || 0}</div>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded">
                    <div className="text-slate-500 text-[10px]">COMPLETED</div>
                    <div className="font-bold text-emerald-400 text-sm">{eng.completedJobs || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SERVICE PARTS INVENTORY */}
      {activeTab === 'parts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div>
              <h3 className="text-sm font-bold text-white">Laptop Service Spare Parts Inventory</h3>
              <p className="text-xs text-slate-400 mt-0.5">Dedicated repair stock: Displays, Keyboards, Batteries, RAM, SSD, Adapters.</p>
            </div>
            <button
              onClick={() => setNewPartOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Spare Part
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">Part Name</th>
                  <th className="py-3 px-4">Part Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">In Stock</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Warranty</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {serviceParts.map((part) => (
                  <tr key={part.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-semibold text-white">{part.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{part.code}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px]">
                        {part.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        part.stock <= part.minStockAlert ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {part.stock} pcs
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">৳{part.purchaseCost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">৳{part.sellingPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-semibold">{part.warrantyDays || 30} Days</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteServicePart(part.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: WARRANTY CLAIMS */}
      {activeTab === 'warranty' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div>
              <h3 className="text-sm font-bold text-white">Customer Service Warranty Claims &amp; Returns</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tracking post-delivery warranty claims under the JHF Service Guarantee.</p>
            </div>
            <button
              onClick={() => setWarrantyModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              File Warranty Claim
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {warrantyClaims.map((claim) => (
              <div key={claim.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono font-bold text-white text-sm">{claim.id}</div>
                    <div className="text-slate-400 text-[11px]">Original Job: <strong className="text-white">{claim.originalServiceId}</strong></div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
                    {claim.status}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div><strong>Customer:</strong> {claim.customerName} ({claim.customerPhone})</div>
                  <div><strong>Device:</strong> {claim.laptopModel}</div>
                  <div><strong>Reported Problem:</strong> {claim.reportedProblem}</div>
                  {claim.resolution && <div className="text-emerald-400"><strong>Resolution:</strong> {claim.resolution}</div>}
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between items-center">
                  <span>Handled By: {claim.handledBy}</span>
                  <span>Filed: {new Date(claim.claimDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SERVICE INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white">Official JHF Service &amp; Repair Invoices</h3>
            <p className="text-xs text-slate-400 mt-0.5">Printable and downloadable delivery sheets and service invoices.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">Invoice / Job ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Laptop Model</th>
                  <th className="py-3 px-4 text-center">Service Warranty</th>
                  <th className="py-3 px-4 text-right">Net Bill</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {services.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">{job.id}</td>
                    <td className="py-3 px-4">{job.customerName}</td>
                    <td className="py-3 px-4">{job.laptopBrand} {job.laptopModel}</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-semibold">{job.serviceWarrantyDays || 30} Days</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">৳{job.totalCost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedJobForInvoice(job)}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center gap-1 mx-auto transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        Print A4 Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: SERVICE REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white">Technical Service &amp; Diagnostic Quality Reports</h3>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit logs of repairs, micro-soldering, and burn-in tests.</p>
          </div>

          <div className="space-y-3">
            {services.map((job) => (
              <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-white text-sm">{job.id}</span> &bull;{' '}
                    <span className="font-semibold text-slate-200">{job.laptopBrand} {job.laptopModel}</span>
                    <div className="text-[11px] text-slate-400">Customer: {job.customerName} &bull; Engineer: {job.engineerName}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase text-[10px]">
                    {job.status}
                  </span>
                </div>

                {job.aiSummary && (
                  <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3 text-purple-200 text-xs leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Executive Service Report Summary</span>
                    </div>
                    <p>{job.aiSummary}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 pt-1">
                  <div><strong>Complaint:</strong> {job.customerComplaintText || 'General inspection'}</div>
                  <div><strong>Diagnosis:</strong> {job.diagnosis || 'Pending inspection'}</div>
                  <div><strong>Testing:</strong> {job.finalTestingResults || 'Not recorded'}</div>
                  <div><strong>Parts Attached:</strong> {(job.partsUsed || []).map((p) => p.partName).join(', ') || 'None (Labor only)'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Service Job Intake Modal */}
      {newJobModalOpen && (
        <NewServiceJobModal
          isOpen={newJobModalOpen}
          onClose={() => setNewJobModalOpen(false)}
          onCreated={(newJob) => setSelectedJobForDetail(newJob)}
        />
      )}

      {/* Job Sheet Detail Modal */}
      {selectedJobForDetail && (
        <ServiceJobDetailModal
          job={selectedJobForDetail}
          isOpen={!!selectedJobForDetail}
          onClose={() => setSelectedJobForDetail(null)}
        />
      )}

      {/* Service Invoice Modal */}
      {selectedJobForInvoice && (
        <ServiceInvoiceModal
          job={selectedJobForInvoice}
          isOpen={!!selectedJobForInvoice}
          onClose={() => setSelectedJobForInvoice(null)}
        />
      )}

      {/* Warranty Claim Modal */}
      {warrantyModalOpen && (
        <WarrantyClaimModal
          isOpen={warrantyModalOpen}
          onClose={() => setWarrantyModalOpen(false)}
        />
      )}

      {/* New Engineer Modal */}
      {newEngOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm">Add Service Engineer / Lab</h3>
            <form onSubmit={handleAddEngineer} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={engName}
                  onChange={(e) => setEngName(e.target.value)}
                  placeholder="e.g. Engr. Tanvir Ahmed"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={engPhone}
                  onChange={(e) => setEngPhone(e.target.value)}
                  placeholder="01712-345678"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Specialization</label>
                <input
                  type="text"
                  value={engSpecialization}
                  onChange={(e) => setEngSpecialization(e.target.value)}
                  placeholder="e.g. Motherboard Micro-soldering, Power Rail"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Type</label>
                <select
                  value={engType}
                  onChange={(e) => setEngType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                >
                  <option value="internal">In-House Technician (JHF)</option>
                  <option value="external">External Third-Party Lab</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewEngOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Add Engineer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Spare Part Modal */}
      {newPartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm">Add New Spare Part to Inventory</h3>
            <form onSubmit={handleAddPart} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1">Part Name *</label>
                <input
                  type="text"
                  required
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="e.g. 14.0 FHD IPS Panel"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Part Code / SKU *</label>
                  <input
                    type="text"
                    required
                    value={partCode}
                    onChange={(e) => setPartCode(e.target.value)}
                    placeholder="DSP-14-IPS"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Category</label>
                  <select
                    value={partCategory}
                    onChange={(e) => setPartCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                  >
                    <option value="Display">Display Panel</option>
                    <option value="Keyboard">Keyboard</option>
                    <option value="Battery">Battery</option>
                    <option value="RAM">RAM</option>
                    <option value="SSD / Storage">SSD / Storage</option>
                    <option value="Adapter / Charger">Adapter / Charger</option>
                    <option value="Cooling Fan / Paste">Cooling Fan / Paste</option>
                    <option value="Other Component">Other Component</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={partStock}
                    onChange={(e) => setPartStock(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Cost (৳)</label>
                  <input
                    type="number"
                    value={partCost}
                    onChange={(e) => setPartCost(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Selling (৳)</label>
                  <input
                    type="number"
                    value={partPrice}
                    onChange={(e) => setPartPrice(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPartOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Spare Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
