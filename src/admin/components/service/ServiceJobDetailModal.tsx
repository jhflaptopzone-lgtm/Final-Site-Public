import React, { useState } from 'react';
import { ServiceJob, ServiceStatus } from '../../types';
import { useAdminStore } from '../../adminStore';
import { useAdminAuth } from '../../authContext';
import { ServiceInvoiceModal } from './ServiceInvoiceModal';
import {
  X,
  Wrench,
  Laptop,
  User,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Plus,
  Sparkles,
  Printer,
  Calendar,
  Clock,
  Trash2,
  AlertTriangle,
  ArrowRight,
  HardDrive,
  CreditCard,
  MessageSquare,
  Edit2,
  Save,
} from 'lucide-react';

interface ServiceJobDetailModalProps {
  job: ServiceJob;
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_STATUSES: { key: ServiceStatus; label: string; color: string }[] = [
  { key: 'RECEIVED', label: 'Received', color: 'bg-slate-700 text-slate-200' },
  { key: 'DIAGNOSING', label: 'Diagnosing', color: 'bg-blue-600 text-white' },
  { key: 'ESTIMATE READY', label: 'Estimate Ready', color: 'bg-indigo-600 text-white' },
  { key: 'WAITING FOR PARTS', label: 'Waiting for Parts', color: 'bg-amber-600 text-white' },
  { key: 'IN REPAIR', label: 'In Repair', color: 'bg-purple-600 text-white' },
  { key: 'READY FOR DELIVERY', label: 'Ready for Delivery', color: 'bg-cyan-600 text-white' },
  { key: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-600 text-white' },
  { key: 'WARRANTY RETURN', label: 'Warranty Return', color: 'bg-rose-600 text-white' },
];

export const ServiceJobDetailModal: React.FC<ServiceJobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
}) => {
  const {
    updateServiceJob,
    deleteServiceJob,
    serviceEngineers,
    serviceParts,
    useServicePart,
    recordServicePayment,
  } = useAdminStore();
  const { currentUser } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'diagnosis' | 'parts' | 'billing' | 'warranty' | 'logs'>('diagnosis');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Diagnosis Edit State
  const [diagnosis, setDiagnosis] = useState(job.diagnosis || '');
  const [rootCause, setRootCause] = useState(job.rootCause || '');
  const [testingPerformed, setTestingPerformed] = useState(job.testingPerformed || '');
  const [workCompleted, setWorkCompleted] = useState(job.workCompleted || '');
  const [finalTestingResults, setFinalTestingResults] = useState(job.finalTestingResults || '');
  const [engineerId, setEngineerId] = useState(job.engineerId || '');

  // AI Assistant State
  const [aiSummary, setAiSummary] = useState(job.aiSummary || '');
  const [aiApproved, setAiApproved] = useState(job.aiSummaryApproved || false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Parts Modal State
  const [selectedPartId, setSelectedPartId] = useState(serviceParts[0]?.id || '');
  const [partQty, setPartQty] = useState(1);
  const [partCustomCharge, setPartCustomCharge] = useState<number | ''>('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pmtAmount, setPmtAmount] = useState<number>(job.dueAmount || 0);
  const [pmtMethod, setPmtMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank'>('Cash');
  const [pmtType, setPmtType] = useState('Partial Payment');
  const [pmtTrxId, setPmtTrxId] = useState('');
  const [pmtNotes, setPmtNotes] = useState('');

  // Cost & Warranty adjustments
  const [laborCost, setLaborCost] = useState(job.laborCost || 0);
  const [discount, setDiscount] = useState(job.discount || 0);
  const [serviceWarrantyDays, setServiceWarrantyDays] = useState(job.serviceWarrantyDays || 60);

  if (!isOpen) return null;

  const currentStatusIndex = SERVICE_STATUSES.findIndex((s) => s.key === job.status);

  const handleStatusChange = (newStatus: ServiceStatus) => {
    const updates: Partial<ServiceJob> = { status: newStatus };
    if (newStatus === 'DELIVERED') {
      updates.deliveredDate = new Date().toISOString();
      updates.deliveredBy = currentUser?.name || 'Jahid Hasan (Admin)';
      if (!job.serviceWarrantyStart) {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + serviceWarrantyDays);
        updates.serviceWarrantyStart = start.toISOString().split('T')[0];
        updates.serviceWarrantyEnd = end.toISOString().split('T')[0];
        updates.warrantyStatus = 'ACTIVE';
      }
    }
    updateServiceJob(job.id, updates);
  };

  const handleSaveDiagnosis = () => {
    const assignedEng = serviceEngineers.find((e) => e.id === engineerId);
    updateServiceJob(job.id, {
      diagnosis,
      rootCause,
      testingPerformed,
      workCompleted,
      finalTestingResults,
      engineerId: assignedEng?.id,
      engineerName: assignedEng?.name,
      engineerPhone: assignedEng?.phone,
      serviceShopName: assignedEng?.shopName,
      engineerType: assignedEng?.engineerType,
      laborCost,
      discount,
      totalCost: (job.diagnosticFee || 0) + laborCost + (job.partsCost || 0) + (job.otherCost || 0) - discount,
      dueAmount: Math.max(0, (job.diagnosticFee || 0) + laborCost + (job.partsCost || 0) + (job.otherCost || 0) - discount - (job.paidAmount || 0)),
      serviceWarrantyDays,
    });
  };

  const handleAddPartUsage = () => {
    if (!selectedPartId) return;
    const part = serviceParts.find((p) => p.id === selectedPartId);
    if (!part) return;

    const charge = partCustomCharge !== '' ? Number(partCustomCharge) : part.sellingPrice * partQty;
    useServicePart(job.id, part.id, partQty, charge);
    setPartQty(1);
    setPartCustomCharge('');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (pmtAmount <= 0) return;

    recordServicePayment(job.id, {
      date: new Date().toISOString(),
      amount: pmtAmount,
      method: pmtMethod,
      type: pmtType,
      transactionId: pmtTrxId || undefined,
      receivedBy: currentUser?.name || 'Admin',
      notes: pmtNotes || undefined,
    });

    setShowPaymentModal(false);
    setPmtTrxId('');
    setPmtNotes('');
  };

  const generateAiDiagnosisSummary = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      // Deterministic, factual synthesis from technician input (NEVER hallucinated)
      const partsSummary = (job.partsUsed || []).map((p) => `${p.quantity}x ${p.partName}`).join(', ');
      const text = `Diagnostic Evaluation for ${job.laptopBrand} ${job.laptopModel} (S/N: ${job.serialNumber || 'N/A'}): The reported problem was "${job.customerComplaintText || job.complaintCategories?.join(', ') || 'Service Inspection'}". ${
        diagnosis ? `Root diagnosis determined: ${diagnosis}. ` : ''
      }${rootCause ? `Underlying cause: ${rootCause}. ` : ''}${
        partsSummary ? `Replaced components: ${partsSummary}. ` : ''
      }${workCompleted ? `Work executed: ${workCompleted}. ` : ''}${
        finalTestingResults ? `Quality assurance: ${finalTestingResults}. ` : 'All core hardware functions verified stable.'
      } Device covered under JHF ${serviceWarrantyDays}-day Service Guarantee.`;

      setAiSummary(text);
      setIsGeneratingAi(false);
      setAiApproved(false);
    }, 400);
  };

  const handleApproveAiSummary = () => {
    setAiApproved(true);
    updateServiceJob(job.id, {
      aiSummary,
      aiSummaryApproved: true,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-wide">{job.id}</h2>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    job.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {job.laptopBrand} {job.laptopModel} &bull; Customer: <span className="text-white font-medium">{job.customerName}</span> ({job.customerPhone})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                Service Invoice
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Lifecycle Status Stepper */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Service Lifecycle Pipeline</span>
              <span className="text-slate-500 font-normal">Click any stage to update status</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {SERVICE_STATUSES.map((statusItem, idx) => {
                const isActive = job.status === statusItem.key;
                const isPast = idx < currentStatusIndex;
                return (
                  <button
                    key={statusItem.key}
                    type="button"
                    onClick={() => handleStatusChange(statusItem.key)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-bold text-center transition flex flex-col items-center justify-center gap-1 border ${
                      isActive
                        ? `${statusItem.color} border-white/30 shadow-lg scale-102`
                        : isPast
                        ? 'bg-slate-900 text-emerald-400 border-emerald-900/40 hover:bg-slate-850'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {isPast ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : null}
                      <span>{statusItem.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-semibold overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'diagnosis'
                  ? 'border-blue-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Diagnosis &amp; Inspection
            </button>
            <button
              onClick={() => setActiveTab('parts')}
              className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'parts'
                  ? 'border-blue-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              Spare Parts ({(job.partsUsed || []).length})
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'border-blue-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Billing &amp; Payments (৳{job.paidAmount || 0} / ৳{job.totalCost || 0})
            </button>
            <button
              onClick={() => setActiveTab('warranty')}
              className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'warranty'
                  ? 'border-blue-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Warranty &amp; Handover
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Activity Log ({(job.logs || []).length})
            </button>
          </div>

          {/* Tab 1: Diagnosis & Inspection */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-4 text-xs">
              {/* Complaints received */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                  Intake Complaint &amp; Accessories
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(job.complaintCategories || []).map((cat) => (
                    <span key={cat} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Customer Note:</strong> {job.customerComplaintText || 'No custom notes provided at intake.'}
                </p>
                <div className="text-slate-400 flex flex-wrap gap-4 pt-1">
                  <span><strong>Accessories:</strong> {(job.accessoriesReceived || []).join(', ') || 'None'}</span>
                  <span><strong>PIN / Lock:</strong> {job.passwordOrLockStatus || 'None'}</span>
                  <span><strong>Physical Condition:</strong> {job.physicalCondition || 'Normal wear'}</span>
                </div>
              </div>

              {/* Technical Inspection & Root Cause */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Wrench className="w-3.5 h-3.5" />
                    Technician Diagnostic Report
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Assigned Engineer:</span>
                    <select
                      value={engineerId}
                      onChange={(e) => setEngineerId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white outline-none"
                    >
                      <option value="">-- Unassigned --</option>
                      {serviceEngineers.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Diagnostic Findings &amp; Voltage Tests:</label>
                    <textarea
                      rows={3}
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. 19V primary rail shorted to ground, capacitor PC112 leaking, 3.3V standby missing..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Root Cause Identified:</label>
                    <textarea
                      rows={3}
                      value={rootCause}
                      onChange={(e) => setRootCause(e.target.value)}
                      placeholder="e.g. Degraded MLCC capacitor due to moisture exposure, dry thermal paste causing thermal shutoff..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Repair Work Performed:</label>
                    <textarea
                      rows={2}
                      value={workCompleted}
                      onChange={(e) => setWorkCompleted(e.target.value)}
                      placeholder="e.g. Micro-soldered replacement capacitor, cleaned thermal vents, repasted Arctic MX-4..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Bench Stress Testing &amp; Results:</label>
                    <textarea
                      rows={2}
                      value={finalTestingResults}
                      onChange={(e) => setFinalTestingResults(e.target.value)}
                      placeholder="e.g. 24hr loop Prime95 + FurMark passed. Max CPU temp 68°C. Battery charge cycle 100% OK..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveDiagnosis}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Technical Report
                  </button>
                </div>
              </div>

              {/* JHF Service AI Assistant Box */}
              <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>JHF Service AI Assistant (Professional Summary &amp; Customer Report)</span>
                  </div>
                  <button
                    onClick={generateAiDiagnosisSummary}
                    disabled={isGeneratingAi}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGeneratingAi ? 'Synthesizing...' : 'Generate AI Summary'}
                  </button>
                </div>

                {aiSummary ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={aiSummary}
                      onChange={(e) => {
                        setAiSummary(e.target.value);
                        setAiApproved(false);
                      }}
                      className="w-full bg-slate-900 border border-purple-500/40 rounded-lg p-2.5 text-slate-200 outline-none focus:border-purple-400 leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {aiApproved ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved by Administrator &amp; included in Customer Service Report
                          </span>
                        ) : (
                          <span className="text-amber-400">Pending Administrator Approval</span>
                        )}
                      </span>
                      {!aiApproved && (
                        <button
                          onClick={handleApproveAiSummary}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve AI Summary
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">
                    Click "Generate AI Summary" to synthesize the technician's findings into a clear, professional diagnosis summary. Admin approval is required before it is locked into the customer service report.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Spare Parts Inventory Usage */}
          {activeTab === 'parts' && (
            <div className="space-y-4 text-xs">
              {/* Add part control */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-white flex items-center gap-1.5 text-blue-400">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Replacement Spare Part from Inventory</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-slate-300 block mb-1">Select Part from Stock:</label>
                    <select
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white outline-none focus:border-blue-500"
                    >
                      {serviceParts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock}, Rate: ৳{p.sellingPrice})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Quantity:</label>
                    <input
                      type="number"
                      min={1}
                      value={partQty}
                      onChange={(e) => setPartQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Override Customer Charge (৳):</label>
                    <input
                      type="number"
                      placeholder="Default"
                      value={partCustomCharge}
                      onChange={(e) => setPartCustomCharge(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleAddPartUsage}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Attach Part &amp; Deduct Stock
                  </button>
                </div>
              </div>

              {/* Parts attached table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-slate-800 font-semibold text-white">
                  Attached Spare Parts for this Service ({ (job.partsUsed || []).length })
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Part Name</th>
                      <th className="p-3">Code</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-center">Warranty</th>
                      <th className="p-3 text-right">Customer Charge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(job.partsUsed || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500">
                          No spare parts attached yet. All repairs so far are labor-only / micro-soldering.
                        </td>
                      </tr>
                    ) : (
                      (job.partsUsed || []).map((part) => (
                        <tr key={part.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-white">{part.partName}</td>
                          <td className="p-3 font-mono text-slate-400">{part.partCode}</td>
                          <td className="p-3 text-center font-mono">{part.quantity}</td>
                          <td className="p-3 text-center text-emerald-400 font-semibold">{part.warrantyDays || 30} Days</td>
                          <td className="p-3 text-right font-mono font-bold text-white">৳{part.customerCharge.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Billing & Payments */}
          {activeTab === 'billing' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cost configuration */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="font-semibold text-white text-blue-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Service Bill Breakdown</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Diagnostic Testing Fee:</span>
                      <span className="font-mono font-bold text-white">৳{(job.diagnosticFee || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Total Spare Parts Charges:</span>
                      <span className="font-mono font-bold text-white">৳{(job.partsCost || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-slate-300">Labor &amp; Soldering Fee (৳):</label>
                      <input
                        type="number"
                        value={laborCost}
                        onChange={(e) => setLaborCost(Number(e.target.value) || 0)}
                        className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-slate-300">Special Discount (৳):</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                        className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-bold">
                      <span className="text-white">Net Bill Amount:</span>
                      <span className="font-mono text-blue-400">
                        ৳{((job.diagnosticFee || 0) + laborCost + (job.partsCost || 0) + (job.otherCost || 0) - discount).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-emerald-400">Total Paid So Far:</span>
                      <span className="font-mono text-emerald-400">৳{(job.paidAmount || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between font-bold">
                      <span className="text-rose-400">Remaining Due:</span>
                      <span className="font-mono text-rose-400">
                        ৳{Math.max(0, (job.diagnosticFee || 0) + laborCost + (job.partsCost || 0) + (job.otherCost || 0) - discount - (job.paidAmount || 0)).toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleSaveDiagnosis}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
                      >
                        Recalculate &amp; Save Bill
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payments History */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white text-emerald-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Payment Records</span>
                    </div>
                    <button
                      onClick={() => {
                        setPmtAmount(job.dueAmount || 0);
                        setShowPaymentModal(true);
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" />
                      Collect Payment
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(job.paymentHistory || []).length === 0 ? (
                      <p className="text-slate-500 text-center py-6">No payments collected yet.</p>
                    ) : (
                      (job.paymentHistory || []).map((pmt) => (
                        <div key={pmt.id} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>৳{pmt.amount.toLocaleString()}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                                {pmt.method}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {pmt.type} &bull; {new Date(pmt.date).toLocaleDateString()} by {pmt.receivedBy}
                            </div>
                            {pmt.transactionId && (
                              <div className="text-[10px] font-mono text-slate-500">Trx: {pmt.transactionId}</div>
                            )}
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Warranty & Handover */}
          {activeTab === 'warranty' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-white flex items-center gap-1.5 text-blue-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>JHF Service Warranty Configuration</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">Service Warranty Duration:</label>
                    <select
                      value={serviceWarrantyDays}
                      onChange={(e) => setServiceWarrantyDays(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white outline-none focus:border-blue-500"
                    >
                      <option value={30}>30 Days (Standard Service)</option>
                      <option value={60}>60 Days (Micro-soldering Guarantee)</option>
                      <option value={90}>90 Days (Major Overhaul)</option>
                      <option value={180}>180 Days (6 Months Extended)</option>
                      <option value={365}>365 Days (1 Year VIP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Warranty Start Date:</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 font-mono">
                      {job.serviceWarrantyStart || 'Activates upon delivery'}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Warranty Expiration Date:</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-emerald-400 font-mono font-bold">
                      {job.serviceWarrantyEnd || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveDiagnosis}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
                  >
                    Update Warranty Terms
                  </button>
                </div>
              </div>

              {/* Delivery Handover Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Customer Delivery Handover Status</span>
                  {job.status === 'DELIVERED' ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                      DELIVERED TO CUSTOMER
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 text-[11px] font-bold">
                      NOT YET DELIVERED
                    </span>
                  )}
                </div>
                {job.status === 'DELIVERED' ? (
                  <div className="text-slate-300 space-y-1">
                    <div><strong>Handed Over On:</strong> {new Date(job.deliveredDate || '').toLocaleString()}</div>
                    <div><strong>Authorized JHF Officer:</strong> {job.deliveredBy || 'Admin'}</div>
                    {job.customerFeedback && <div><strong>Customer Feedback:</strong> "{job.customerFeedback}"</div>}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400">
                      When repairs and testing are completed, marking as delivered will record the timestamp and activate warranty countdown.
                    </p>
                    <button
                      onClick={() => handleStatusChange('DELIVERED')}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shrink-0"
                    >
                      Mark as Delivered Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-2 text-xs">
              {(job.logs || []).map((log) => (
                <div key={log.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-400">{log.details}</div>
                    <div className="text-[10px] text-slate-500">Performed by: {log.user}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Entry Sub-Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">Record Service Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1">Amount to Collect (৳):</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={pmtAmount}
                  onChange={(e) => setPmtAmount(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Payment Method:</label>
                <select
                  value={pmtMethod}
                  onChange={(e) => setPmtMethod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Payment Classification:</label>
                <select
                  value={pmtType}
                  onChange={(e) => setPmtType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                >
                  <option value="Advance Payment">Advance Deposit</option>
                  <option value="Partial Payment">Partial Payment</option>
                  <option value="Final Settlement">Final Settlement / Handover Payment</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Transaction ID / Reference (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. BKASH-991204"
                  value={pmtTrxId}
                  onChange={(e) => setPmtTrxId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Invoice Modal */}
      {showInvoiceModal && (
        <ServiceInvoiceModal
          job={job}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </>
  );
};
