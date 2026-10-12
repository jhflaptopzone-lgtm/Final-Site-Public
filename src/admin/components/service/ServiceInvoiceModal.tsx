import React, { useRef } from 'react';
import { ServiceJob } from '../../types';
import { BUSINESS_INFO } from '../../adminStore';
import { Printer, X, ShieldCheck, CheckCircle2, Phone, Mail, MapPin, Download } from 'lucide-react';

interface ServiceInvoiceModalProps {
  job: ServiceJob;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceInvoiceModal: React.FC<ServiceInvoiceModalProps> = ({ job, isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-6 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
              {job.id}
            </span>
            <span className="text-xs text-slate-400">JHF Official Service Invoice &amp; Delivery Sheet</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Invoice (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Container */}
        <div
          ref={printRef}
          className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 space-y-6 print:p-6 print:rounded-none shadow-sm"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-blue-700">JHF</span>
                <span className="text-2xl font-black tracking-tight text-slate-900">LAPTOP ZONE</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mt-0.5">
                Laptop Sales, Chip-Level Micro-Soldering &amp; Diagnostics Lab
              </div>
              <div className="text-[11px] text-slate-600 mt-2 space-y-0.5 max-w-md">
                <div className="flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                  <span><strong>Main Lab:</strong> Shop 1001 &amp; 1040, Level 10, Multiplan Centre, New Elephant Road, Dhaka</span>
                </div>
                <div className="flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                  <span><strong>Branch:</strong> Baroipara Bazar, Chandra, Gazipur</span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> +8801935693071</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500" /> jhflaptopzone@gmail.com</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-xs font-bold uppercase tracking-widest text-blue-800">
                SERVICE INVOICE
              </div>
              <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">{job.id}</div>
              <div className="text-[11px] text-slate-600 mt-1">
                <strong>Intake Date:</strong> {formatDate(job.createdAt)}
              </div>
              <div className="text-[11px] text-slate-600">
                <strong>Delivery Date:</strong> {formatDate(job.deliveredDate || job.estimatedDeliveryDate)}
              </div>
              <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                STATUS: {job.status}
              </div>
            </div>
          </div>

          {/* Customer & Laptop Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider text-[10px] text-slate-500">
                Customer Details
              </div>
              <div><strong>Name:</strong> {job.customerName}</div>
              <div><strong>Phone:</strong> {job.customerPhone}</div>
              {job.customerEmail && <div><strong>Email:</strong> {job.customerEmail}</div>}
              {job.customerAddress && <div><strong>Address:</strong> {job.customerAddress}</div>}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider text-[10px] text-slate-500">
                Device Under Service
              </div>
              <div><strong>Brand &amp; Model:</strong> {job.laptopBrand} {job.laptopModel}</div>
              <div><strong>Serial Number (S/N):</strong> <span className="font-mono">{job.serialNumber || 'N/A'}</span></div>
              {job.assetId && <div><strong>Asset / Device ID:</strong> <span className="font-mono">{job.assetId}</span></div>}
              {job.accessoriesReceived && job.accessoriesReceived.length > 0 && (
                <div><strong>Accessories:</strong> {job.accessoriesReceived.join(', ')}</div>
              )}
            </div>
          </div>

          {/* Reported Complaint & Diagnosis Summary */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 text-xs space-y-2">
            <div>
              <span className="font-bold text-slate-900">Customer Complaint:</span>{' '}
              <span className="text-slate-700">{job.customerComplaintText || 'Standard servicing and diagnostic check.'}</span>
            </div>
            {job.diagnosis && (
              <div>
                <span className="font-bold text-blue-900">Technical Diagnosis:</span>{' '}
                <span className="text-slate-700">{job.diagnosis}</span>
              </div>
            )}
            {job.workCompleted && (
              <div>
                <span className="font-bold text-emerald-900">Work Performed:</span>{' '}
                <span className="text-slate-700">{job.workCompleted}</span>
              </div>
            )}
          </div>

          {/* Charges Table */}
          <div className="space-y-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-100 text-[11px] font-bold text-slate-800 uppercase">
                  <th className="py-2 px-3">SL</th>
                  <th className="py-2 px-3">Description / Service Item</th>
                  <th className="py-2 px-3 text-center">Warranty</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Diagnostic Fee */}
                {job.diagnosticFee > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-mono">01</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">Comprehensive Hardware Diagnostics &amp; Bench Testing</div>
                      <div className="text-[10px] text-slate-500">Power rail measurements, voltage diagnostics, and inspection</div>
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500">-</td>
                    <td className="py-2 px-3 text-center font-mono">1</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">৳{job.diagnosticFee.toLocaleString()}</td>
                  </tr>
                )}

                {/* Labor Cost */}
                {job.laborCost > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-mono">02</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">Service Labor &amp; Micro-Soldering Charges</div>
                      <div className="text-[10px] text-slate-500">Performed by {job.engineerName || 'JHF Senior Hardware Engineer'}</div>
                    </td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-semibold">{job.serviceWarrantyDays || 30} Days</td>
                    <td className="py-2 px-3 text-center font-mono">1</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">৳{job.laborCost.toLocaleString()}</td>
                  </tr>
                )}

                {/* Parts Used */}
                {(job.partsUsed || []).map((part, idx) => (
                  <tr key={part.id || idx}>
                    <td className="py-2 px-3 font-mono">{String(idx + 3).padStart(2, '0')}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">{part.partName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Part Code: {part.partCode}</div>
                    </td>
                    <td className="py-2 px-3 text-center text-emerald-700 font-semibold">
                      {part.warrantyDays ? `${part.warrantyDays} Days` : 'Standard'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">{part.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">৳{part.customerCharge.toLocaleString()}</td>
                  </tr>
                ))}

                {/* Other Cost if any */}
                {job.otherCost > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-mono">-</td>
                    <td className="py-2 px-3">Miscellaneous Supplies &amp; Cleaning Consumables</td>
                    <td className="py-2 px-3 text-center text-slate-500">-</td>
                    <td className="py-2 px-3 text-center font-mono">1</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">৳{job.otherCost.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Calculations Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono font-medium">
                    ৳{((job.diagnosticFee || 0) + (job.laborCost || 0) + (job.partsCost || 0) + (job.otherCost || 0)).toLocaleString()}
                  </span>
                </div>
                {job.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-৳{job.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t-2 border-slate-900 pt-1">
                  <span>Net Payable:</span>
                  <span className="font-mono text-blue-700">৳{job.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>Paid Amount:</span>
                  <span className="font-mono text-emerald-700">৳{job.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-t border-slate-200 pt-1">
                  <span>Balance Due:</span>
                  <span className={`font-mono ${job.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    ৳{job.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warranty & Terms Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>JHF Service Warranty Policy ({job.serviceWarrantyDays || 30} Days Guarantee)</span>
            </div>
            <p>
              1. JHF Laptop Zone covers all labor and repair rework under warranty until{' '}
              <strong className="text-slate-900">{formatDate(job.serviceWarrantyEnd)}</strong>. Replaced hardware components carry warranty as listed above.
            </p>
            <p>
              2. Warranty is strictly void in the event of liquid spillage, physical drop/impact, lightning/power surge, or unauthorized third-party tampering.
            </p>
            <p>
              3. For warranty support &amp; inquiries: Hotline <strong>+8801935693071</strong> &bull; Email: <strong>jhflaptopzone@gmail.com</strong>
            </p>
          </div>

          {/* Signature Lines */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center border-t border-slate-200">
            <div>
              <div className="w-40 border-b border-slate-400 mx-auto mb-1"></div>
              <div className="font-semibold text-slate-800">Customer Signature</div>
              <div className="text-[10px] text-slate-500">I have received the laptop tested &amp; in working order</div>
            </div>
            <div>
              <div className="w-40 border-b border-slate-400 mx-auto mb-1"></div>
              <div className="font-semibold text-slate-800">Authorized JHF Signature</div>
              <div className="text-[10px] text-slate-500">Service Department &amp; Quality Check Passed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
