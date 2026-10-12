import React, { useState } from 'react';
import { useAdminStore } from '../../adminStore';
import { useAdminAuth } from '../../authContext';
import { ServiceJob, ServiceStatus } from '../../types';
import { SERVICE_COMPLAINT_PRESETS } from '../../data/serviceInitialData';
import { X, Wrench, Laptop, User, Calendar, DollarSign, Check, Plus, AlertCircle } from 'lucide-react';

interface NewServiceJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (job: ServiceJob) => void;
}

export const NewServiceJobModal: React.FC<NewServiceJobModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { serviceEngineers, addServiceJob } = useAdminStore();
  const { currentUser } = useAdminAuth();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [laptopBrand, setLaptopBrand] = useState('HP');
  const [laptopModel, setLaptopModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [assetId, setAssetId] = useState('');
  const [passwordOrLockStatus, setPasswordOrLockStatus] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(['Original Charger']);

  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [customComplaintText, setCustomComplaintText] = useState('');

  const [engineerId, setEngineerId] = useState(serviceEngineers[0]?.id || '');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const [diagnosticFee, setDiagnosticFee] = useState<number>(300);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank'>('Cash');
  const [advanceTrxId, setAdvanceTrxId] = useState('');

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const accessoryOptions = ['Original Charger', 'Power Cable', 'Laptop Bag / Sleeve', 'Mouse', 'USB Dongle', 'RAM / SSD Box'];

  const toggleComplaint = (complaint: string) => {
    setSelectedComplaints((prev) =>
      prev.includes(complaint) ? prev.filter((c) => c !== complaint) : [...prev, complaint]
    );
  };

  const toggleAccessory = (acc: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Customer phone number is required.');
      return;
    }
    if (!laptopModel.trim()) {
      setError('Laptop model is required.');
      return;
    }

    const assignedEng = serviceEngineers.find((e) => e.id === engineerId);

    const paymentHistory = [];
    if (advancePaid > 0) {
      paymentHistory.push({
        id: `pmt-${Date.now()}`,
        date: new Date().toISOString(),
        amount: advancePaid,
        method: advancePaymentMethod,
        type: 'Advance Payment',
        transactionId: advanceTrxId || undefined,
        receivedBy: currentUser?.name || 'Admin',
        notes: 'Initial intake advance deposit',
      });
    }

    const totalEstimated = diagnosticFee;
    const dueAmount = Math.max(0, totalEstimated - advancePaid);

    const newJob = addServiceJob({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      customerAddress: customerAddress || undefined,
      laptopBrand,
      laptopModel,
      serialNumber: serialNumber || undefined,
      assetId: assetId || undefined,
      passwordOrLockStatus: passwordOrLockStatus || undefined,
      physicalCondition: physicalCondition || undefined,
      accessoriesReceived: selectedAccessories,
      complaintCategories: selectedComplaints,
      customerComplaintText: customComplaintText,
      engineerId: assignedEng?.id,
      engineerName: assignedEng?.name,
      engineerPhone: assignedEng?.phone,
      serviceShopName: assignedEng?.shopName,
      engineerType: assignedEng?.engineerType || 'internal',
      assignedDate: assignedEng ? new Date().toISOString() : undefined,
      status: 'RECEIVED' as ServiceStatus,
      estimatedDeliveryDate,
      receivedBy: currentUser?.name || 'Jahid Hasan (Admin)',
      diagnosticFee,
      laborCost: 0,
      partsCost: 0,
      internalPartsCost: 0,
      otherCost: 0,
      discount: 0,
      totalCost: totalEstimated,
      paidAmount: advancePaid,
      dueAmount,
      profit: diagnosticFee * 0.8,
      paymentHistory,
      partsUsed: [],
      serviceWarrantyDays: 60,
      warrantyStatus: 'ACTIVE',
      isDummy: false, // NEW REAL USER JOB!
    });

    if (onCreated) {
      onCreated(newJob);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Register New Service Job Intake</h2>
              <p className="text-xs text-slate-400">JHF Service Zone customer intake sheet &amp; diagnostic assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-lg p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Section 1: Customer Details */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="font-semibold text-white flex items-center gap-1.5 text-xs text-blue-400">
              <User className="w-3.5 h-3.5" />
              <span>1. Customer Profile</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Mobile Phone (WhatsApp Active) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01712-345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="tanvir@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Uttara Sector 4, Dhaka"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Laptop & Hardware Details */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="font-semibold text-white flex items-center gap-1.5 text-xs text-blue-400">
              <Laptop className="w-3.5 h-3.5" />
              <span>2. Laptop Specification &amp; Physical Condition</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Brand</label>
                <select
                  value={laptopBrand}
                  onChange={(e) => setLaptopBrand(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="HP">HP</option>
                  <option value="Dell">Dell</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="Apple">Apple MacBook</option>
                  <option value="Asus">Asus</option>
                  <option value="Acer">Acer</option>
                  <option value="MSI">MSI</option>
                  <option value="Microsoft">Microsoft Surface</option>
                  <option value="Other">Other Brand</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-300 block mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EliteBook 840 G7 / ThinkPad T14 / Latitude 7420"
                  value={laptopModel}
                  onChange={(e) => setLaptopModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Serial Number (S/N)</label>
                <input
                  type="text"
                  placeholder="e.g. 5CG0394K8Q"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Windows Password / PIN</label>
                <input
                  type="text"
                  placeholder="PIN: 1234 or 'None'"
                  value={passwordOrLockStatus}
                  onChange={(e) => setPasswordOrLockStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Accessories Received */}
            <div className="pt-2">
              <label className="text-slate-300 block mb-1.5 font-medium">Accessories Received with Laptop:</label>
              <div className="flex flex-wrap gap-1.5">
                {accessoryOptions.map((acc) => {
                  const isSelected = selectedAccessories.includes(acc);
                  return (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleAccessory(acc)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {acc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Physical condition */}
            <div>
              <label className="text-slate-300 block mb-1">Physical Condition at Intake:</label>
              <input
                type="text"
                placeholder="e.g. Scratches on bottom cover, rubber foot missing, hinge loose"
                value={physicalCondition}
                onChange={(e) => setPhysicalCondition(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 3: Customer Complaint & Symptoms */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="font-semibold text-white flex items-center gap-1.5 text-xs text-blue-400">
              <Wrench className="w-3.5 h-3.5" />
              <span>3. Reported Problem &amp; Symptoms</span>
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">Select Common Symptoms:</label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-900/80 rounded-lg border border-slate-800">
                {SERVICE_COMPLAINT_PRESETS.map((complaint) => {
                  const isSelected = selectedComplaints.includes(complaint);
                  return (
                    <button
                      type="button"
                      key={complaint}
                      onClick={() => toggleComplaint(complaint)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {complaint}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Detailed Customer Description / Remarks:</label>
              <textarea
                rows={2}
                placeholder="Explain exact symptoms, when the problem started, previous repair attempts, etc."
                value={customComplaintText}
                onChange={(e) => setCustomComplaintText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 4: Engineer Assignment & Initial Deposit */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="font-semibold text-white flex items-center gap-1.5 text-xs text-blue-400">
              <DollarSign className="w-3.5 h-3.5" />
              <span>4. Engineer Assignment &amp; Intake Charges</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Assign Technician / Lab</label>
                <select
                  value={engineerId}
                  onChange={(e) => setEngineerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="">-- Unassigned (General Queue) --</option>
                  {serviceEngineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} ({eng.engineerType === 'internal' ? 'In-House' : 'External'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Diagnostic Testing Fee (৳)</label>
                <input
                  type="number"
                  value={diagnosticFee}
                  onChange={(e) => setDiagnosticFee(Number(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Advance Deposit Collected (৳)</label>
                <input
                  type="number"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(Number(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {advancePaid > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-slate-300 block mb-1">Deposit Payment Method</label>
                  <select
                    value={advancePaymentMethod}
                    onChange={(e) => setAdvancePaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                  >
                    <option value="Cash">Cash at Counter</option>
                    <option value="bKash">bKash Personal / Merchant</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Transaction ID / Reference (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BKASH-89X201"
                    value={advanceTrxId}
                    onChange={(e) => setAdvanceTrxId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition"
            >
              <Check className="w-4 h-4" />
              Register Service Job Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
