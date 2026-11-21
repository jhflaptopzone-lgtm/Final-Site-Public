import React, { useState, useEffect } from 'react';
import { ServiceJob, ServicePart, ServicePaymentRecord, ServiceStatus } from '../../types';
import { useAdminStore } from '../../adminStore';
import { useAdminAuth } from '../../authContext';
import { ServiceInvoiceModal } from './ServiceInvoiceModal';
import {
  formatWarrantyDays,
  SERVICE_WARRANTY_OPTIONS,
  SPARE_PART_WARRANTY_OPTIONS,
} from '../../../utils/warranty';
import {
  X,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Plus,
  Sparkles,
  Printer,
  Clock,
  Trash2,
  AlertTriangle,
  HardDrive,
  CreditCard,
  Save,
  PackagePlus,
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
  { key: 'CUSTOMER APPROVAL', label: 'Approval', color: 'bg-sky-600 text-white' },
  { key: 'WAITING FOR PARTS', label: 'Wait Parts', color: 'bg-amber-600 text-white' },
  { key: 'IN REPAIR', label: 'In Repair', color: 'bg-purple-600 text-white' },
  { key: 'TESTING', label: 'Testing QA', color: 'bg-teal-600 text-white' },
  { key: 'READY FOR DELIVERY', label: 'Ready', color: 'bg-cyan-600 text-white' },
  { key: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-600 text-white' },
  { key: 'WARRANTY RETURN', label: 'Warranty Ret.', color: 'bg-rose-600 text-white' },
  { key: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-800 text-slate-300' },
];

const PART_CATEGORIES: ServicePart['category'][] = [
  'Display',
  'Keyboard',
  'Battery',
  'RAM',
  'SSD / Storage',
  'Adapter / Charger',
  'Cooling Fan / Paste',
  'Hinge / Casing',
  'Motherboard',
  'DC Jack',
  'Cables & Ports',
  'Other',
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
    addCustomServicePartToJob,
    removeServicePart,
    recordServicePayment,
    removeServicePayment,
  } = useAdminStore();
  const { currentUser } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'diagnosis' | 'parts' | 'billing' | 'warranty' | 'logs'>('diagnosis');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [confirmDeleteJob, setConfirmDeleteJob] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

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

  // Parts Entry Mode: From Inventory OR Quick/Custom Part
  const [partEntryMode, setPartEntryMode] = useState<'inventory' | 'custom'>(
    serviceParts.length > 0 ? 'inventory' : 'custom'
  );
  const [selectedPartId, setSelectedPartId] = useState(serviceParts[0]?.id || '');
  const [partQty, setPartQty] = useState(1);
  const [partCustomCharge, setPartCustomCharge] = useState<number | ''>('');
  const [inventoryWarrantyOverride, setInventoryWarrantyOverride] = useState<string>('default');

  // Custom Part State
  const [customPartName, setCustomPartName] = useState('');
  const [customPartCode, setCustomPartCode] = useState('');
  const [customPartCategory, setCustomPartCategory] = useState<ServicePart['category']>('Display');
  const [customPartQty, setCustomPartQty] = useState(1);
  const [customPartPrice, setCustomPartPrice] = useState<number | ''>('');
  const [customPartCost, setCustomPartCost] = useState<number | ''>('');
  const [customPartWarrantyDays, setCustomPartWarrantyDays] = useState<number>(90);
  const [saveCustomToInventory, setSaveCustomToInventory] = useState(true);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pmtAmount, setPmtAmount] = useState<number>(job.dueAmount || 0);
  const [pmtMethod, setPmtMethod] = useState<ServicePaymentRecord['method']>('Cash');
  const [pmtType, setPmtType] = useState<ServicePaymentRecord['type']>('Partial Payment');
  const [pmtTrxId, setPmtTrxId] = useState('');
  const [pmtNotes, setPmtNotes] = useState('');

  // Cost & Warranty adjustments
  const [diagnosticFee, setDiagnosticFee] = useState(job.diagnosticFee ?? 0);
  const [laborCost, setLaborCost] = useState(job.laborCost ?? 0);
  const [otherCost, setOtherCost] = useState(job.otherCost ?? 0);
  const [discount, setDiscount] = useState(job.discount ?? 0);
  const [serviceWarrantyDays, setServiceWarrantyDays] = useState(job.serviceWarrantyDays ?? 30);

  // Keep local states synchronized when job switches or updates externally
  useEffect(() => {
    setDiagnosis(job.diagnosis || '');
    setRootCause(job.rootCause || '');
    setTestingPerformed(job.testingPerformed || '');
    setWorkCompleted(job.workCompleted || '');
    setFinalTestingResults(job.finalTestingResults || '');
    setEngineerId(job.engineerId || '');
    setAiSummary(job.aiSummary || '');
    setAiApproved(job.aiSummaryApproved || false);
    setDiagnosticFee(job.diagnosticFee ?? 0);
    setLaborCost(job.laborCost ?? 0);
    setOtherCost(job.otherCost ?? 0);
    setDiscount(job.discount ?? 0);
    setServiceWarrantyDays(job.serviceWarrantyDays ?? 30);
    setPmtAmount(job.dueAmount ?? 0);
    setConfirmDeleteJob(false);
  }, [job.id, job.updatedAt, isOpen]);

  // Keep selectedPartId valid when serviceParts list updates
  useEffect(() => {
    if (serviceParts.length === 0) {
      setSelectedPartId('');
      setPartEntryMode('custom');
    } else if (!selectedPartId || !serviceParts.some((p) => p.id === selectedPartId)) {
      setSelectedPartId(serviceParts[0].id);
    }
  }, [serviceParts, selectedPartId]);

  if (!isOpen) return null;

  const flashToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const currentStatusIndex = SERVICE_STATUSES.findIndex((s) => s.key === job.status);
  const selectedInventoryPart = serviceParts.find((p) => p.id === selectedPartId);

  const livePartsCost = (job.partsUsed || []).reduce(
    (sum, u) => sum + (Number(u.customerCharge) || 0),
    0
  );
  const liveTotalCost = Math.max(
    0,
    (diagnosticFee || 0) + (laborCost || 0) + livePartsCost + (otherCost || 0) - (discount || 0)
  );
  const liveRemainingDue = Math.max(0, liveTotalCost - (job.paidAmount || 0));

  const handleStatusChange = (newStatus: ServiceStatus) => {
    const updates: Partial<ServiceJob> = { status: newStatus };
    if (newStatus === 'DELIVERED') {
      updates.deliveredDate = new Date().toISOString();
      updates.deliveredBy = currentUser?.name || 'Jahid Hasan (Admin)';
      if (serviceWarrantyDays > 0) {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + serviceWarrantyDays);
        updates.serviceWarrantyStart = start.toISOString().split('T')[0];
        updates.serviceWarrantyEnd = end.toISOString().split('T')[0];
        updates.warrantyStatus = 'ACTIVE';
      } else {
        updates.serviceWarrantyStart = new Date().toISOString().split('T')[0];
        updates.serviceWarrantyEnd = undefined;
        updates.warrantyStatus = 'EXPIRED';
      }
    }
    updateServiceJob(job.id, updates);
    flashToast(`Job status updated to ${newStatus}.`);
  };

  const handleSaveBillAndDiagnosis = (message = 'Saved changes & recalculated service bill.') => {
    const assignedEng = serviceEngineers.find((e) => e.id === engineerId);
    const partsTotal = (job.partsUsed || []).reduce(
      (sum, u) => sum + (Number(u.customerCharge) || 0),
      0
    );
    const internalPartsTotal = (job.partsUsed || []).reduce(
      (sum, u) => sum + (Number(u.purchaseCost) || 0),
      0
    );
    const safeDiag = Math.max(0, Number(diagnosticFee) || 0);
    const safeLabor = Math.max(0, Number(laborCost) || 0);
    const safeOther = Math.max(0, Number(otherCost) || 0);
    const safeDiscount = Math.max(0, Number(discount) || 0);
    const safeTotal = Math.max(0, safeDiag + safeLabor + partsTotal + safeOther - safeDiscount);
    const safeDue = Math.max(0, safeTotal - (job.paidAmount || 0));
    const safeProfit = Math.max(0, safeTotal - (internalPartsTotal + safeDiag * 0.2));

    let nextWarrantyEnd = job.serviceWarrantyEnd;
    let nextWarrantyStatus = job.warrantyStatus;
    if (job.serviceWarrantyStart) {
      if (serviceWarrantyDays > 0) {
        const end = new Date(job.serviceWarrantyStart);
        end.setDate(end.getDate() + serviceWarrantyDays);
        nextWarrantyEnd = end.toISOString().split('T')[0];
        nextWarrantyStatus = 'ACTIVE';
      } else {
        nextWarrantyEnd = undefined;
        nextWarrantyStatus = 'EXPIRED';
      }
    }

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
      diagnosticFee: safeDiag,
      laborCost: safeLabor,
      otherCost: safeOther,
      discount: safeDiscount,
      partsCost: partsTotal,
      internalPartsCost: internalPartsTotal,
      totalCost: safeTotal,
      dueAmount: safeDue,
      profit: safeProfit,
      serviceWarrantyDays,
      serviceWarrantyEnd: nextWarrantyEnd,
      warrantyStatus: nextWarrantyStatus,
    });
    flashToast(message);
  };

  const handleAddPartUsage = () => {
    if (partEntryMode === 'inventory') {
      if (!selectedPartId) {
        flashToast('Please select a spare part from inventory or switch to Quick Custom Part.');
        return;
      }
      const part = serviceParts.find((p) => p.id === selectedPartId);
      if (!part) return;

      const qty = Math.max(1, Math.round(Number(partQty) || 1));
      const charge =
        partCustomCharge !== '' && !Number.isNaN(Number(partCustomCharge))
          ? Math.max(0, Number(partCustomCharge))
          : part.sellingPrice * qty;
      const overrideWarranty =
        inventoryWarrantyOverride === 'default'
          ? undefined
          : Math.max(0, Number(inventoryWarrantyOverride) || 0);

      useServicePart(job.id, part.id, qty, charge, overrideWarranty);
      setPartQty(1);
      setPartCustomCharge('');
      setInventoryWarrantyOverride('default');
      flashToast(`Added ${qty}x ${part.name} to bill.`);
      return;
    }

    // Custom / Ad-hoc Part mode
    if (!customPartName.trim()) {
      flashToast('Please enter Spare Part Name before adding to bill.');
      return;
    }
    const qty = Math.max(1, Math.round(Number(customPartQty) || 1));
    const charge =
      customPartPrice !== '' && !Number.isNaN(Number(customPartPrice))
        ? Math.max(0, Number(customPartPrice))
        : 0;
    const unitCost =
      customPartCost !== '' && !Number.isNaN(Number(customPartCost))
        ? Math.max(0, Number(customPartCost))
        : 0;

    addCustomServicePartToJob(job.id, {
      name: customPartName.trim(),
      code: customPartCode.trim() || undefined,
      category: customPartCategory,
      quantity: qty,
      purchaseCost: unitCost,
      customerCharge: charge,
      warrantyDays: Math.max(0, Number(customPartWarrantyDays) || 0),
      saveToInventory: saveCustomToInventory,
    });

    flashToast(`Added ${qty}x ${customPartName.trim()} to bill.`);
    setCustomPartName('');
    setCustomPartCode('');
    setCustomPartQty(1);
    setCustomPartPrice('');
    setCustomPartCost('');
  };

  const handleRemovePartFromBill = (usageId: string, partName: string) => {
    removeServicePart(job.id, usageId);
    flashToast(`Removed "${partName}" from bill & recalculated total.`);
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
    flashToast(`Recorded payment of ৳${pmtAmount.toLocaleString()}.`);
  };

  const handleRemovePaymentRecord = (paymentId: string, amount: number) => {
    removeServicePayment(job.id, paymentId);
    flashToast(`Removed payment record of ৳${amount.toLocaleString()} & updated due.`);
  };

  const generateAiDiagnosisSummary = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const partsSummary = (job.partsUsed || [])
        .map((p) => `${p.quantity}x ${p.partName} (${formatWarrantyDays(p.warrantyDays)})`)
        .join(', ');
      const text = `Diagnostic Evaluation for ${job.laptopBrand} ${job.laptopModel} (S/N: ${job.serialNumber || 'N/A'}): The reported problem was "${job.customerComplaintText || job.complaintCategories?.join(', ') || 'Service Inspection'}". ${
        diagnosis ? `Root diagnosis determined: ${diagnosis}. ` : ''
      }${rootCause ? `Underlying cause: ${rootCause}. ` : ''}${
        partsSummary ? `Replaced components: ${partsSummary}. ` : ''
      }${workCompleted ? `Work executed: ${workCompleted}. ` : ''}${
        finalTestingResults ? `Quality assurance: ${finalTestingResults}. ` : 'All core hardware functions verified stable.'
      } Service coverage: ${formatWarrantyDays(serviceWarrantyDays)}.`;

      setAiSummary(text);
      setIsGeneratingAi(false);
      setAiApproved(false);
    }, 350);
  };

  const handleApproveAiSummary = () => {
    setAiApproved(true);
    updateServiceJob(job.id, {
      aiSummary,
      aiSummaryApproved: true,
    });
    flashToast('Executive diagnostic summary approved.');
  };

  const renderAddAndListPartsSection = () => (
    <div className="space-y-4">
      {/* Add Spare Parts Box */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="font-semibold text-blue-400 flex items-center gap-1.5">
            <PackagePlus className="w-4 h-4" />
            <span>Add Spare Parts to Service &amp; Bill</span>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setPartEntryMode('inventory')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                partEntryMode === 'inventory'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              From Stock ({serviceParts.length})
            </button>
            <button
              type="button"
              onClick={() => setPartEntryMode('custom')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                partEntryMode === 'custom'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              + Quick / Custom Part
            </button>
          </div>
        </div>

        {partEntryMode === 'inventory' ? (
          serviceParts.length === 0 ? (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>No spare parts in inventory stock yet. Switch to &quot;Quick / Custom Part&quot; to add directly to bill.</span>
              <button
                type="button"
                onClick={() => setPartEntryMode('custom')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold shrink-0"
              >
                Use Quick Custom Part
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="text-slate-300 block mb-1">Select Part from Inventory:</label>
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white outline-none focus:border-blue-500"
                  >
                    {serviceParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}) — Stock: {p.stock} • ৳{p.sellingPrice} • {formatWarrantyDays(p.warrantyDays ?? 0)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1">Qty:</label>
                  <input
                    type="number"
                    min={1}
                    value={partQty}
                    onChange={(e) => setPartQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1">Total Charge (৳):</label>
                  <input
                    type="number"
                    min={0}
                    placeholder={selectedInventoryPart ? String(selectedInventoryPart.sellingPrice * partQty) : 'Default'}
                    value={partCustomCharge}
                    onChange={(e) => setPartCustomCharge(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-slate-300 block mb-1">Part Warranty:</label>
                  <select
                    value={inventoryWarrantyOverride}
                    onChange={(e) => setInventoryWarrantyOverride(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white outline-none focus:border-blue-500"
                  >
                    <option value="default">
                      Part Default ({formatWarrantyDays(selectedInventoryPart?.warrantyDays ?? 0)})
                    </option>
                    {SPARE_PART_WARRANTY_OPTIONS.map((opt) => (
                      <option key={opt.days} value={String(opt.days)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedInventoryPart && partQty > (selectedInventoryPart.stock || 0) && (
                <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Low Stock Notice: Requested {partQty} pcs, inventory currently shows {selectedInventoryPart.stock} pcs. Stock will floor at 0.
                  </span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddPartUsage}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Part to Bill &amp; Deduct Stock
                </button>
              </div>
            </>
          )
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="text-slate-300 block mb-1">Spare Part Name *</label>
                <input
                  type="text"
                  value={customPartName}
                  onChange={(e) => setCustomPartName(e.target.value)}
                  placeholder="e.g. HP 840 G6 FHD Display / Keyboard"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-300 block mb-1">Code / Model</label>
                <input
                  type="text"
                  value={customPartCode}
                  onChange={(e) => setCustomPartCode(e.target.value)}
                  placeholder="e.g. DSP-840G6"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-slate-300 block mb-1">Category</label>
                <select
                  value={customPartCategory}
                  onChange={(e) => setCustomPartCategory(e.target.value as ServicePart['category'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white outline-none"
                >
                  {PART_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="text-slate-300 block mb-1">Warranty (Shown on Voucher)</label>
                <select
                  value={customPartWarrantyDays}
                  onChange={(e) => setCustomPartWarrantyDays(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white outline-none focus:border-emerald-500"
                >
                  {SPARE_PART_WARRANTY_OPTIONS.map((opt) => (
                    <option key={opt.days} value={opt.days}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="text-slate-300 block mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={customPartQty}
                  onChange={(e) => setCustomPartQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-slate-300 block mb-1">Customer Total Charge (৳) *</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 4500"
                  value={customPartPrice}
                  onChange={(e) => setCustomPartPrice(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-slate-300 block mb-1">Unit Cost (৳ Optional)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 3200"
                  value={customPartCost}
                  onChange={(e) => setCustomPartCost(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono outline-none"
                />
              </div>
              <div className="sm:col-span-4 flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCustomToInventory}
                    onChange={(e) => setSaveCustomToInventory(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-900 text-emerald-500"
                  />
                  <span>Also save to Spare Parts Inventory</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddPartUsage}
                  className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Part to Bill
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Added Spare Parts List Table (Below Add Parts!) */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="font-semibold text-white">
            Added Spare Parts on Bill ({(job.partsUsed || []).length})
          </span>
          <span className="font-mono font-bold text-emerald-400">
            Parts Total: ৳{livePartsCost.toLocaleString()}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Part Name</th>
                <th className="p-3">Code</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-center">Warranty (Auto Voucher)</th>
                <th className="p-3 text-right">Customer Charge</th>
                <th className="p-3 text-center">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(job.partsUsed || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No spare parts added to this bill yet. Add a part above and it will appear right here.
                  </td>
                </tr>
              ) : (
                (job.partsUsed || []).map((part) => (
                  <tr key={part.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">
                      <div>{part.partName}</div>
                      {part.isCustomPart && (
                        <span className="text-[10px] text-slate-400 font-normal">Custom Entry</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{part.partCode}</td>
                    <td className="p-3 text-center font-mono">{part.quantity}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                          (part.warrantyDays ?? 0) > 0
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {formatWarrantyDays(part.warrantyDays ?? 0)}
                      </span>
                      {part.warrantyEnd && (part.warrantyDays ?? 0) > 0 && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Till {part.warrantyEnd}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      ৳{part.customerCharge.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePartFromBill(part.id, part.partName)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                        title="Remove spare part & recalculate bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[94vh] overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-wide">{job.id}</h2>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      job.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : job.status === 'WARRANTY RETURN'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {job.laptopBrand} {job.laptopModel} &bull; Customer: <span className="text-white font-medium">{job.customerName}</span> ({job.customerPhone})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!confirmDeleteJob ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteJob(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1 border border-rose-500/30 transition"
                  title="Delete Service Job"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/40 rounded-lg px-2 py-1 text-[11px]">
                  <span className="text-rose-200 font-semibold">Confirm delete?</span>
                  <button
                    type="button"
                    onClick={() => {
                      deleteServiceJob(job.id);
                      onClose();
                    }}
                    className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteJob(false)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                  >
                    No
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                Service Voucher / Invoice
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {feedbackToast && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {feedbackToast}
              </span>
              <button type="button" onClick={() => setFeedbackToast(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Interactive Lifecycle Status Stepper */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Service Lifecycle Pipeline</span>
              <span className="text-slate-500 font-normal">Click any stage to update status</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-1.5">
              {SERVICE_STATUSES.map((statusItem, idx) => {
                const isActive = job.status === statusItem.key;
                const isPast = currentStatusIndex > -1 && idx < currentStatusIndex && statusItem.key !== 'CANCELLED';
                return (
                  <button
                    key={statusItem.key}
                    type="button"
                    onClick={() => handleStatusChange(statusItem.key)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-bold text-center transition flex flex-col items-center justify-center gap-1 border ${
                      isActive
                        ? `${statusItem.color} border-white/30 shadow-lg`
                        : isPast
                        ? 'bg-slate-900 text-emerald-400 border-emerald-900/40 hover:bg-slate-800'
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
              type="button"
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
              type="button"
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
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'border-blue-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Billing &amp; Payments (৳{job.paidAmount || 0} / ৳{liveTotalCost})
            </button>
            <button
              type="button"
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
              type="button"
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
                <div className="font-semibold text-white flex flex-wrap items-center justify-between gap-2">
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
                      placeholder="e.g. 19V primary rail shorted to ground, capacitor PC112 leaking..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Root Cause Identified:</label>
                    <textarea
                      rows={3}
                      value={rootCause}
                      onChange={(e) => setRootCause(e.target.value)}
                      placeholder="e.g. Degraded MLCC capacitor, dry thermal paste..."
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
                      placeholder="e.g. Micro-soldered replacement capacitor, repasted Arctic MX-4..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Bench Stress Testing &amp; Results:</label>
                    <textarea
                      rows={2}
                      value={finalTestingResults}
                      onChange={(e) => setFinalTestingResults(e.target.value)}
                      placeholder="e.g. 24hr loop Prime95 + FurMark passed. Battery cycle 100% OK..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleSaveBillAndDiagnosis('Saved technical diagnostic report.')}
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
                    <span>Executive Summary Generator (Customer Report)</span>
                  </div>
                  <button
                    type="button"
                    onClick={generateAiDiagnosisSummary}
                    disabled={isGeneratingAi}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGeneratingAi ? 'Synthesizing...' : 'Generate Summary'}
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
                            Approved by Administrator &amp; included in Service Report
                          </span>
                        ) : (
                          <span className="text-amber-400">Pending Administrator Approval</span>
                        )}
                      </span>
                      {!aiApproved && (
                        <button
                          type="button"
                          onClick={handleApproveAiSummary}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Summary
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">
                    Click &quot;Generate Summary&quot; to synthesize technical findings &amp; part warranties into a clear customer report.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Spare Parts Inventory Usage */}
          {activeTab === 'parts' && (
            <div className="space-y-4 text-xs">{renderAddAndListPartsSection()}</div>
          )}

          {/* Tab 3: Billing & Payments (Includes Inline Add & Remove Spare Parts!) */}
          {activeTab === 'billing' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cost configuration */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Service Bill Breakdown</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300">Diagnostic Testing Fee (৳):</label>
                      <input
                        type="number"
                        min={0}
                        value={diagnosticFee}
                        onChange={(e) => setDiagnosticFee(Math.max(0, Number(e.target.value) || 0))}
                        className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Added Spare Parts Charges ({(job.partsUsed || []).length}):</span>
                      <span className="font-mono font-bold text-emerald-400">৳{livePartsCost.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-slate-300">Labor &amp; Soldering Fee (৳):</label>
                      <input
                        type="number"
                        min={0}
                        value={laborCost}
                        onChange={(e) => setLaborCost(Math.max(0, Number(e.target.value) || 0))}
                        className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-slate-300">Other / Cleaning Supplies (৳):</label>
                      <input
                        type="number"
                        min={0}
                        value={otherCost}
                        onChange={(e) => setOtherCost(Math.max(0, Number(e.target.value) || 0))}
                        className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-slate-300">Special Discount (৳):</label>
                      <input
                        type="number"
                        min={0}
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                        className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-bold">
                      <span className="text-white">Net Bill Amount:</span>
                      <span className="font-mono text-blue-400">
                        ৳{liveTotalCost.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-emerald-400">Total Paid So Far:</span>
                      <span className="font-mono text-emerald-400">৳{(job.paidAmount || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between font-bold">
                      <span className="text-rose-400">Remaining Due:</span>
                      <span className="font-mono text-rose-400">
                        ৳{liveRemainingDue.toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveBillAndDiagnosis('Service bill recalculated & saved!')}
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
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Payment Records</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPmtAmount(liveRemainingDue > 0 ? liveRemainingDue : 0);
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
                        <div key={pmt.id} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
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
                            {pmt.notes && (
                              <div className="text-[10px] text-slate-400 mt-0.5">Note: {pmt.notes}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <button
                              type="button"
                              onClick={() => handleRemovePaymentRecord(pmt.id, pmt.amount)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                              title="Remove payment record & recalculate due"
                              aria-label={`Remove payment record of ৳${pmt.amount}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Inline Add Parts + Parts Table Directly Inside Billing */}
              {renderAddAndListPartsSection()}
            </div>
          )}

          {/* Tab 4: Warranty & Handover */}
          {activeTab === 'warranty' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-blue-400 flex items-center gap-1.5">
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
                      {SERVICE_WARRANTY_OPTIONS.map((opt) => (
                        <option key={opt.days} value={opt.days}>
                          {opt.label}
                        </option>
                      ))}
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
                      {serviceWarrantyDays > 0 ? job.serviceWarrantyEnd || 'Pending delivery' : 'No Service Warranty'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveBillAndDiagnosis('Service warranty terms updated!')}
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
                    <div><strong>Handed Over On:</strong> {job.deliveredDate ? new Date(job.deliveredDate).toLocaleString() : 'N/A'}</div>
                    <div><strong>Authorized JHF Officer:</strong> {job.deliveredBy || 'Admin'}</div>
                    {job.customerFeedback && <div><strong>Customer Feedback:</strong> &quot;{job.customerFeedback}&quot;</div>}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-slate-400">
                      When repairs and testing are completed, marking as delivered records the handover timestamp and activates warranty dates.
                    </p>
                    <button
                      type="button"
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
              <button type="button" onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
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
                  onChange={(e) => setPmtAmount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Payment Method:</label>
                <select
                  value={pmtMethod}
                  onChange={(e) => setPmtMethod(e.target.value as ServicePaymentRecord['method'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Store Pickup">Store Pickup</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Payment Classification:</label>
                <select
                  value={pmtType}
                  onChange={(e) => setPmtType(e.target.value as ServicePaymentRecord['type'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                >
                  <option value="Advance Payment">Advance Payment</option>
                  <option value="Partial Payment">Partial Payment</option>
                  <option value="Final Payment">Final Payment / Handover</option>
                  <option value="Adjustment">Adjustment</option>
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

              <div>
                <label className="text-slate-300 block mb-1">Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Settled at delivery counter"
                  value={pmtNotes}
                  onChange={(e) => setPmtNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none"
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
