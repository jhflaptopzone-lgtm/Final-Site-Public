import React, { useState, useRef } from 'react';
import { useAdminStore, BUSINESS_INFO } from '../admin/adminStore';
import { PREDEFINED_LAPTOP_PROBLEMS, ServiceRequest } from '../types/serviceRequest';
import {
  Wrench,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  MessageSquare,
  Search,
  Laptop,
  User,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Send,
} from 'lucide-react';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrackSr?: (srNumber?: string) => void;
}

const BANGLADESH_DISTRICTS = [
  'Dhaka',
  'Chattogram',
  'Gazipur',
  'Rajshahi',
  'Khulna',
  'Sylhet',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Bogura',
  'Narayanganj',
  'Tangail',
  'Feni',
  'Cox\'s Bazar',
  'Jessore',
  'Faridpur',
  'Pabna',
  'Dinajpur',
  'Kushtia',
];

const LAPTOP_BRANDS = [
  'Lenovo ThinkPad',
  'HP EliteBook / ProBook',
  'Dell Latitude / XPS',
  'Apple MacBook (M-Series / Intel)',
  'Asus ZenBook / ROG',
  'Acer Swift / Predator',
  'Toshiba Dynabook',
  'MSI Gaming / Prestige',
  'Microsoft Surface',
  'Samsung Galaxy Book',
  'Other / Custom Laptop',
];

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  onOpenTrackSr,
}) => {
  const { addServiceRequest } = useAdminStore();

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [city, setCity] = useState('Dhaka');
  const [area, setArea] = useState('');
  const [detailedLocation, setDetailedLocation] = useState('');

  const [laptopBrand, setLaptopBrand] = useState('Lenovo ThinkPad');
  const [laptopModel, setLaptopModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  const [problemCategory, setProblemCategory] = useState('No Power');
  const [problemDescription, setProblemDescription] = useState('');
  const [preferredContact, setPreferredContact] = useState<'WhatsApp' | 'Phone Call' | 'Email'>('WhatsApp');
  const [preferredTime, setPreferredTime] = useState<'Morning (10AM - 1PM)' | 'Afternoon (2PM - 6PM)' | 'Evening (6PM - 9PM)' | 'Urgent Same-Day'>('Morning (10AM - 1PM)');

  // Optional Photos (Base64)
  const [attachments, setAttachments] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<ServiceRequest | null>(null);
  const [copiedSr, setCopiedSr] = useState(false);

  if (!isOpen) return null;

  // Handle Photo Upload (strictly client-side file picker, NO webcam)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPhotoError(null);

    const newPhotos: string[] = [];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    Array.from(files).forEach((file) => {
      if (file.size > MAX_SIZE_BYTES) {
        setPhotoError(`File "${file.name}" exceeds 5MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same file can be selected if needed
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!fullName.trim()) {
      setValidationError('Please enter your Full Name.');
      return;
    }
    if (!mobileNumber.trim()) {
      setValidationError('Please enter your Mobile Number.');
      return;
    }
    if (!city.trim()) {
      setValidationError('Please specify your City or District.');
      return;
    }
    if (!laptopModel.trim()) {
      setValidationError('Please specify your Laptop Model (e.g. ThinkPad T480s, HP 840 G6).');
      return;
    }
    if (!problemCategory.trim()) {
      setValidationError('Please select the Laptop Problem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await addServiceRequest({
        customerName: fullName.trim(),
        mobile: mobileNumber.trim(),
        country: country.trim() || 'Bangladesh',
        city: city.trim(),
        area: area.trim(),
        address: detailedLocation.trim(),
        laptopBrand,
        laptopModel: laptopModel.trim(),
        serialNumber: serialNumber.trim() || undefined,
        problemCategory,
        problemDescription: problemDescription.trim(),
        preferredContactMethod: preferredContact,
        preferredServiceTime: preferredTime,
        attachments,
        status: 'PENDING',
        customerUpdate: 'Your service request has been logged. Our diagnostic team is reviewing your hardware issue.',
      });

      setSubmittedRequest(created);
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to submit service request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySrNumber = () => {
    if (!submittedRequest?.srNumber) return;
    navigator.clipboard.writeText(submittedRequest.srNumber);
    setCopiedSr(true);
    setTimeout(() => setCopiedSr(false), 2500);
  };

  const handleWhatsAppJhf = () => {
    if (!submittedRequest) return;
    const msg = `Hello JHF Laptop Zone, I submitted a service request.\n\nSR Number: ${submittedRequest.srNumber}\nName: ${submittedRequest.customerName}\nDevice: ${submittedRequest.laptopBrand} ${submittedRequest.laptopModel}\nProblem: ${submittedRequest.problemCategory}\nLocation: ${submittedRequest.city}`;
    const url = `https://wa.me/8801935693071?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handlePrintRequest = () => {
    window.print();
  };

  const handleResetForm = () => {
    setSubmittedRequest(null);
    setFullName('');
    setMobileNumber('');
    setLaptopModel('');
    setSerialNumber('');
    setProblemDescription('');
    setAttachments([]);
    setValidationError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-6 print:border-none print:shadow-none print:my-0">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition print:hidden"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <Wrench className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200 block">
                JHF Professional Lab &amp; Chip-Level Repair
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                🔧 Request Laptop Service
              </h2>
            </div>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
            Directly submit your laptop for servicing. No customer login required. Instant unique SR tracking number generated.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto">
          {submittedRequest ? (
            /* ==========================================
               9. CUSTOMER SUCCESS SCREEN
               ========================================== */
            <div className="space-y-6 animate-fade-in print:text-black">
              {/* Success Badge */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  SERVICE REQUEST SUBMITTED
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Your JHF Laptop Zone service request has been received. Please keep this number to track your service request.
                </p>

                {/* SR Number Highlight Card */}
                <div className="bg-white dark:bg-slate-950 border-2 border-dashed border-blue-500/40 rounded-2xl p-4 max-w-md mx-auto mt-4 shadow-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Your Service Request Number
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-tight my-1">
                    {submittedRequest.srNumber}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Status: {submittedRequest.status}</span>
                  </div>
                </div>
              </div>

              {/* Request Summary Grid */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs sm:text-sm">
                <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/60 pb-2">
                  Request Summary
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customer Name:</span>
                    <strong className="text-slate-900 dark:text-white">{submittedRequest.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mobile Number:</span>
                    <strong className="text-slate-900 dark:text-white">{submittedRequest.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Laptop Model:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {submittedRequest.laptopBrand} {submittedRequest.laptopModel}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Reported Problem:</span>
                    <strong className="text-rose-500 dark:text-rose-400">{submittedRequest.problemCategory}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Request Date:</span>
                    <strong>{new Date(submittedRequest.createdAt).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Service Location:</span>
                    <strong>{submittedRequest.city}, {submittedRequest.country}</strong>
                  </div>
                </div>
                {submittedRequest.problemDescription && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[11px]">Customer Notes:</span>
                    <p className="italic text-slate-600 dark:text-slate-400 mt-0.5">
                      "{submittedRequest.problemDescription}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 print:hidden">
                <button
                  onClick={() => {
                    if (onOpenTrackSr) {
                      onOpenTrackSr(submittedRequest.srNumber);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition"
                >
                  <Search className="w-4 h-4" />
                  <span>TRACK SERVICE REQUEST</span>
                </button>

                <button
                  onClick={handleWhatsAppJhf}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WHATSAPP JHF LAPTOP ZONE</span>
                </button>

                <button
                  onClick={handlePrintRequest}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT REQUEST</span>
                </button>

                <button
                  onClick={handleCopySrNumber}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  {copiedSr ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSr ? 'SR NUMBER COPIED!' : 'COPY SR NUMBER'}</span>
                </button>
              </div>

              {/* Reset to make another request */}
              <div className="text-center pt-2 print:hidden">
                <button
                  onClick={handleResetForm}
                  className="text-xs text-blue-500 hover:underline font-semibold"
                >
                  Submit another laptop service request
                </button>
              </div>
            </div>
          ) : (
            /* ==========================================
               PUBLIC SERVICE REQUEST FORM
               ========================================== */
            <form onSubmit={handleSubmit} className="space-y-6">
              {validationError && (
                <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* 1. CUSTOMER INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <User className="w-4 h-4" />
                  <span>1. Customer Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 01712-345678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* LOCATION (Section 3: Bangladesh and international support) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Bangladesh"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      City / District <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      list="district-options"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Dhaka, Gazipur"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <datalist id="district-options">
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Area / Thana
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Multiplan, Uttara, Chandra"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Detailed Location / Delivery Address
                  </label>
                  <input
                    type="text"
                    value={detailedLocation}
                    onChange={(e) => setDetailedLocation(e.target.value)}
                    placeholder="House/Road/Landmark details for showroom dropoff or courier dispatch"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* 2. DEVICE INFORMATION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Laptop className="w-4 h-4" />
                  <span>2. Device Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Laptop Brand
                    </label>
                    <select
                      value={laptopBrand}
                      onChange={(e) => setLaptopBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {LAPTOP_BRANDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Laptop Model <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={laptopModel}
                      onChange={(e) => setLaptopModel(e.target.value)}
                      placeholder="e.g. ThinkPad T480s, EliteBook 840 G6"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Serial Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g. SN-882149"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. SERVICE INFORMATION & LAPTOP PROBLEM (Section 4) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Wrench className="w-4 h-4" />
                  <span>3. Service Information &amp; Problem Details</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Laptop Problem <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={problemCategory}
                    onChange={(e) => setProblemCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {PREDEFINED_LAPTOP_PROBLEMS.map((prob) => (
                      <option key={prob} value={prob}>{prob}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Describe Your Problem in Your Own Words
                  </label>
                  <textarea
                    rows={3}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="Tell our engineers what happened (e.g. charging stopped after power surge, fan makes grinding noise, screen shows lines, spilled water...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Preferred Contact Method
                    </label>
                    <select
                      value={preferredContact}
                      onChange={(e) => setPreferredContact(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    >
                      <option value="WhatsApp">WhatsApp Message</option>
                      <option value="Phone Call">Direct Phone Call</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Preferred Service / Contact Time
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    >
                      <option value="Morning (10AM - 1PM)">Morning (10AM - 1PM)</option>
                      <option value="Afternoon (2PM - 6PM)">Afternoon (2PM - 6PM)</option>
                      <option value="Evening (6PM - 9PM)">Evening (6PM - 9PM)</option>
                      <option value="Urgent Same-Day">Urgent Same-Day Priority</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. OPTIONAL PHOTO UPLOAD (Section 5: strictly explicit user files, no webcam) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>4. Optional Photos / Screenshot Upload</span>
                  </div>
                  <span className="text-[10px] text-slate-400 lowercase font-normal">(optional - max 5MB)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>Upload Laptop / Error Photo</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Laptop photo, error screenshot, or blue screen picture.
                  </span>
                </div>

                {photoError && (
                  <div className="text-xs text-rose-500">{photoError}</div>
                )}

                {/* Attachments Preview Grid */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {attachments.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm group">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shadow"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. SERVICE REQUEST SUBMISSION (Section 6) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Service Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>SUBMIT SERVICE REQUEST</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  🔒 Transactional duplicate-safe server sequence generator active. Your unique SR number is immediately generated.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
