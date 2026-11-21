import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../adminStore';
import { formatWarrantyDays } from '../../../utils/warranty';
import { ShieldCheck, X, Check } from 'lucide-react';

interface WarrantyClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
}

export const WarrantyClaimModal: React.FC<WarrantyClaimModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceId,
}) => {
  const { services, addWarrantyClaim, serviceEngineers } = useAdminStore();

  const deliveredJobs = services.filter(
    (s) => s.status === 'DELIVERED' || s.id === preselectedServiceId
  );

  const [selectedJobId, setSelectedJobId] = useState(
    preselectedServiceId || deliveredJobs[0]?.id || ''
  );
  const [reportedProblem, setReportedProblem] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [resolution, setResolution] = useState('');
  const [handledBy, setHandledBy] = useState(
    serviceEngineers[0]?.name || 'In-House Engineer'
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (preselectedServiceId) {
      setSelectedJobId(preselectedServiceId);
    } else if (!selectedJobId && deliveredJobs.length > 0) {
      setSelectedJobId(deliveredJobs[0].id);
    }
  }, [isOpen, preselectedServiceId, deliveredJobs.length]);

  useEffect(() => {
    if (serviceEngineers.length > 0 && !serviceEngineers.some((e) => e.name === handledBy)) {
      setHandledBy(serviceEngineers[0].name);
    }
  }, [serviceEngineers]);

  if (!isOpen) return null;

  const currentJob = services.find((s) => s.id === selectedJobId);

  const isWarrantyActive = () => {
    if (!currentJob) return false;
    if ((currentJob.serviceWarrantyDays ?? 0) <= 0 && (currentJob.partsUsed || []).every((p) => (p.warrantyDays ?? 0) <= 0)) {
      return false;
    }
    if (!currentJob.serviceWarrantyEnd) return true;
    const endBoundary = new Date(`${currentJob.serviceWarrantyEnd}T23:59:59`);
    return endBoundary >= new Date();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentJob || !reportedProblem.trim()) return;

    addWarrantyClaim({
      originalServiceId: currentJob.id,
      customerName: currentJob.customerName,
      customerPhone: currentJob.customerPhone,
      laptopModel: `${currentJob.laptopBrand} ${currentJob.laptopModel}`,
      serialNumber: currentJob.serialNumber,
      reportedProblem: reportedProblem.trim(),
      diagnosis: diagnosis.trim() || undefined,
      resolution: resolution.trim() || 'Under inspection and bench testing',
      status: 'INSPECTION',
      handledBy,
      notes: notes.trim() || undefined,
      isDummy: false,
    });

    setReportedProblem('');
    setDiagnosis('');
    setResolution('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">File Service Warranty Claim</h2>
              <p className="text-xs text-slate-400">Customer return under JHF Service &amp; Parts Guarantee</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Service Selection */}
          <div>
            <label className="text-slate-300 block mb-1 font-medium">Select Delivered Service Record:</label>
            {deliveredJobs.length === 0 ? (
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300">
                No delivered service jobs found yet. Mark a service job as <strong>DELIVERED</strong> first before filing a warranty claim.
              </div>
            ) : (
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
              >
                {deliveredJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.id} - {j.customerName} ({j.laptopBrand} {j.laptopModel})
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentJob && (
            <div
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                isWarrantyActive()
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Warranty Status:</span>
                <span>{isWarrantyActive() ? '✓ VALID ACTIVE WARRANTY' : '⚠ WARRANTY EXPIRED / NONE'}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Customer: <strong>{currentJob.customerName}</strong> ({currentJob.customerPhone})
              </div>
              <div className="text-[11px] text-slate-300">
                Device: <strong>{currentJob.laptopBrand} {currentJob.laptopModel}</strong> (S/N: {currentJob.serialNumber || 'N/A'})
              </div>
              <div className="text-[11px] text-slate-400">
                Service Guarantee: <strong>{formatWarrantyDays(currentJob.serviceWarrantyDays ?? 0)}</strong> (Valid until: <strong>{currentJob.serviceWarrantyEnd || 'N/A'}</strong>)
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Customer Reported Return Problem *</label>
            <textarea
              rows={2}
              required
              placeholder="What symptom is the customer reporting after delivery?"
              value={reportedProblem}
              onChange={(e) => setReportedProblem(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Initial Bench Observation (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Display flickering or connector loose"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Assigned Engineer for Re-Inspection</label>
            {serviceEngineers.length > 0 ? (
              <select
                value={handledBy}
                onChange={(e) => setHandledBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
              >
                {serviceEngineers.map((eng) => (
                  <option key={eng.id} value={eng.name}>
                    {eng.name} ({eng.specialization})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={handledBy}
                onChange={(e) => setHandledBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
              />
            )}
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Internal Notes &amp; Resolution Plan</label>
            <input
              type="text"
              placeholder="e.g. Free warranty repair authorized by manager"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!currentJob}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
            >
              <Check className="w-4 h-4" />
              File Return &amp; Re-Open Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
