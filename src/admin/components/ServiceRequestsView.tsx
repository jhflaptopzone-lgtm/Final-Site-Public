import React, { useState, useMemo } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import {
  ServiceRequest,
  ServiceRequestStatus,
  SERVICE_REQUEST_STATUSES,
  SERVICE_REQUEST_STATUS_DETAILS,
} from '../../types/serviceRequest';
import {
  Search,
  Filter,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
  Phone,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Trash2,
  Archive,
  Download,
  Calendar,
  User,
  MapPin,
  Laptop,
  FileText,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
  Check,
  Copy,
  ChevronDown,
  X,
} from 'lucide-react';

export const ServiceRequestsView: React.FC = () => {
  const {
    serviceRequests,
    serviceEngineers,
    updateServiceRequestStatus,
    updateServiceRequest,
    deleteServiceRequest,
    convertRequestToServiceJob,
  } = useAdminStore();
  const { currentUser } = useAdminAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<ServiceRequestStatus>('CONTACTING SOON');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [customerNoteInput, setCustomerNoteInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Convert to Job Modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);

  // Status feedback toast
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [copiedSr, setCopiedSr] = useState(false);

  // Time-based filtering calculations
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // KPI calculations
  const totalCount = serviceRequests.length;
  const newRequestsCount = serviceRequests.filter((r) => r.status === 'REQUEST RECEIVED').length;
  const pendingCount = serviceRequests.filter((r) => r.status === 'PENDING').length;
  const contactingCount = serviceRequests.filter((r) => r.status === 'CONTACTING SOON').length;
  const runningCount = serviceRequests.filter((r) => r.status === 'RUNNING').length;
  const waitingCourierCount = serviceRequests.filter((r) => r.status === 'WAITING FOR COURIER').length;
  const deliveryCount = serviceRequests.filter((r) => r.status === 'DELIVERY').length;
  const completedCount = serviceRequests.filter((r) => r.status === 'COMPLETED').length;

  const todayCount = serviceRequests.filter((r) => r.createdAt?.slice(0, 10) === todayStr).length;
  const thisWeekCount = serviceRequests.filter((r) => new Date(r.createdAt) >= oneWeekAgo).length;
  const thisMonthCount = serviceRequests.filter((r) => new Date(r.createdAt) >= oneMonthAgo).length;

  // Filtered List
  const filteredRequests = useMemo(() => {
    return serviceRequests.filter((r) => {
      // Search
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        r.srNumber?.toLowerCase().includes(q) ||
        r.customerName?.toLowerCase().includes(q) ||
        r.mobile?.toLowerCase().includes(q) ||
        r.laptopModel?.toLowerCase().includes(q) ||
        r.problemCategory?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q);

      // Status
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

      // Time
      let matchesTime = true;
      if (timeFilter === 'today') {
        matchesTime = r.createdAt?.slice(0, 10) === todayStr;
      } else if (timeFilter === 'week') {
        matchesTime = new Date(r.createdAt) >= oneWeekAgo;
      } else if (timeFilter === 'month') {
        matchesTime = new Date(r.createdAt) >= oneMonthAgo;
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [serviceRequests, searchTerm, statusFilter, timeFilter, todayStr]);

  // Open Status Update Dialog
  const handleOpenStatusModal = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setStatusToUpdate(req.status);
    setInternalNoteInput(req.internalNote || '');
    setCustomerNoteInput(req.customerUpdate || '');
    setIsStatusModalOpen(true);
  };

  // Submit Status Update
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsUpdatingStatus(true);

    try {
      await updateServiceRequestStatus(
        selectedRequest.id,
        statusToUpdate,
        customerNoteInput.trim() || '',
        internalNoteInput.trim() || ''
      );
      setActionFeedback(`Status of ${selectedRequest.srNumber} updated to ${statusToUpdate}`);
      setIsStatusModalOpen(false);
    } catch (err: any) {
      setActionFeedback(`Error: ${err?.message || 'Failed to update'}`);
    } finally {
      setIsUpdatingStatus(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Open Convert to Job Dialog
  const handleOpenConvertModal = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setSelectedEngineerId(serviceEngineers[0]?.id || '');
    setIsConvertModalOpen(true);
  };

  // Submit Convert to Job
  const handleConvertJob = async () => {
    if (!selectedRequest) return;
    setIsConverting(true);

    try {
      const createdJob = await convertRequestToServiceJob(selectedRequest.id, selectedEngineerId);
      if (createdJob) {
        setActionFeedback(`Created Service Job ${createdJob.id} from ${selectedRequest.srNumber}!`);
      }
      setIsConvertModalOpen(false);
    } catch (err: any) {
      setActionFeedback(`Error: ${err?.message || 'Failed to convert'}`);
    } finally {
      setIsConverting(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Archive / Delete
  const handleArchive = async (req: ServiceRequest) => {
    await updateServiceRequest(req.id, { isArchived: !req.isArchived });
    setActionFeedback(`Request ${req.srNumber} ${req.isArchived ? 'restored' : 'archived'}.`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleDelete = async (req: ServiceRequest) => {
    if (window.confirm(`Are you sure you want to permanently delete service request ${req.srNumber}?`)) {
      await deleteServiceRequest(req.id);
      setActionFeedback(`Deleted ${req.srNumber} permanently.`);
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const handleCopySr = (srNumber: string) => {
    navigator.clipboard.writeText(srNumber);
    setCopiedSr(true);
    setTimeout(() => setCopiedSr(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {actionFeedback && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header & KPI Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span>Customer Inflow &amp; Service Intake Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Customer Service Requests
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Public requests submitted directly by customers from the homepage without account login. Convert requests to internal Service Jobs when ready.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Today</span>
              <strong className="text-base text-white font-mono">{todayCount}</strong>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">This Week</span>
              <strong className="text-base text-white font-mono">{thisWeekCount}</strong>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">This Month</span>
              <strong className="text-base text-white font-mono">{thisMonthCount}</strong>
            </div>
          </div>
        </div>

        {/* Section 16: KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
          {/* TOTAL REQUESTS */}
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'ALL'
                ? 'bg-blue-600/20 border-blue-500/50 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total</span>
            <div className="text-xl font-mono font-black text-white mt-1">{totalCount}</div>
          </div>

          {/* NEW REQUESTS */}
          <div
            onClick={() => setStatusFilter('REQUEST RECEIVED')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'REQUEST RECEIVED'
                ? 'bg-blue-600/30 border-blue-400 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">New</span>
            <div className="text-xl font-mono font-black text-blue-300 mt-1">{newRequestsCount}</div>
          </div>

          {/* CONTACTING SOON */}
          <div
            onClick={() => setStatusFilter('CONTACTING SOON')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'CONTACTING SOON'
                ? 'bg-cyan-600/30 border-cyan-400 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Contacting</span>
            <div className="text-xl font-mono font-black text-cyan-300 mt-1">{contactingCount}</div>
          </div>

          {/* PENDING */}
          <div
            onClick={() => setStatusFilter('PENDING')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600/30 border-amber-400 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pending</span>
            <div className="text-xl font-mono font-black text-amber-300 mt-1">{pendingCount}</div>
          </div>

          {/* RUNNING */}
          <div
            onClick={() => setStatusFilter('RUNNING')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'RUNNING'
                ? 'bg-purple-600/30 border-purple-400 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Running</span>
            <div className="text-xl font-mono font-black text-purple-300 mt-1">{runningCount}</div>
          </div>

          {/* WAITING FOR COURIER */}
          <div
            onClick={() => setStatusFilter('WAITING FOR COURIER')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'WAITING FOR COURIER'
                ? 'bg-orange-600/30 border-orange-400 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Courier</span>
            <div className="text-xl font-mono font-black text-orange-300 mt-1">{waitingCourierCount}</div>
          </div>

          {/* DELIVERY */}
          <div
            onClick={() => setStatusFilter('DELIVERY')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'DELIVERY'
                ? 'bg-indigo-600/30 border-indigo-400 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Delivery</span>
            <div className="text-xl font-mono font-black text-indigo-300 mt-1">{deliveryCount}</div>
          </div>

          {/* COMPLETED */}
          <div
            onClick={() => setStatusFilter('COMPLETED')}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-600/30 border-emerald-400 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Completed</span>
            <div className="text-xl font-mono font-black text-emerald-300 mt-1">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SR Number, Customer, Phone, Model..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold outline-none"
          >
            <option value="ALL">All Statuses ({totalCount})</option>
            {SERVICE_REQUEST_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Time Filter */}
          <div className="flex rounded-xl bg-slate-800 border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                timeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                timeFilter === 'today' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                timeFilter === 'week' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </div>

      {/* Section 17: Admin Request Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">SR Number</th>
                <th className="py-3.5 px-4 font-bold">Date</th>
                <th className="py-3.5 px-4 font-bold">Customer</th>
                <th className="py-3.5 px-4 font-bold">Mobile</th>
                <th className="py-3.5 px-4 font-bold">Location</th>
                <th className="py-3.5 px-4 font-bold">Laptop</th>
                <th className="py-3.5 px-4 font-bold">Problem</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Assigned Staff</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No service requests found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const statusInfo = SERVICE_REQUEST_STATUS_DETAILS[req.status] || {
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                  };

                  return (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition">
                      {/* SR Number */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{req.srNumber}</span>
                          <button
                            onClick={() => handleCopySr(req.srNumber)}
                            className="p-1 hover:text-white text-slate-500 transition"
                            title="Copy SR Number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                        {req.customerName}
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-4 text-slate-300 font-mono whitespace-nowrap">
                        <a
                          href={`tel:${req.mobile}`}
                          className="hover:text-blue-400 hover:underline"
                        >
                          {req.mobile}
                        </a>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {req.city || 'Dhaka'}
                      </td>

                      {/* Laptop */}
                      <td className="py-3 px-4 text-slate-200 whitespace-nowrap">
                        <span className="font-bold">{req.laptopBrand}</span> {req.laptopModel}
                      </td>

                      {/* Problem */}
                      <td className="py-3 px-4 font-medium text-rose-400 whitespace-nowrap">
                        {req.problemCategory}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Assigned Staff */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {req.assignedStaff || req.serviceJobId ? (
                          <span className="text-emerald-400 font-semibold">{req.assignedStaff || req.serviceJobId}</span>
                        ) : (
                          <span className="text-slate-600">Unassigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* VIEW */}
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="View Full Request Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* UPDATE STATUS */}
                          <button
                            onClick={() => handleOpenStatusModal(req)}
                            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition"
                            title="Update Status &amp; Notes"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* WHATSAPP CONTACT */}
                          <a
                            href={`https://wa.me/${req.mobile.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(req.customerName)},%20regarding%20your%20JHF%20Laptop%20Zone%20service%20request%20${req.srNumber}...`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                            title="Contact via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* CREATE SERVICE JOB */}
                          {!req.serviceJobId ? (
                            <button
                              onClick={() => handleOpenConvertModal(req)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 transition shadow"
                              title="Convert to JHF Service Job"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Create Job</span>
                            </button>
                          ) : (
                            <span className="px-2 py-1 rounded bg-slate-800 text-[10px] text-emerald-400 font-mono" title="Linked Job ID">
                              {req.serviceJobId}
                            </span>
                          )}

                          {/* DELETE */}
                          <button
                            onClick={() => handleDelete(req)}
                            className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white transition"
                            title="Delete Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          18. REQUEST DETAIL MODAL
          ========================================== */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block">
                  Service Request Inspection
                </span>
                <h3 className="text-xl font-mono font-black text-white">
                  {selectedRequest.srNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Status Header */}
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Status</span>
                  <div className="text-base font-black text-white mt-0.5">{selectedRequest.status}</div>
                </div>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenStatusModal(selectedRequest);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  Change Status
                </button>
              </div>

              {/* Customer Information */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-700/60 pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Customer Details</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Name:</span>
                    <strong className="text-white text-sm">{selectedRequest.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Mobile:</span>
                    <a href={`tel:${selectedRequest.mobile}`} className="text-blue-400 font-mono font-bold hover:underline">
                      {selectedRequest.mobile}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Location:</span>
                    <span>{selectedRequest.city}, {selectedRequest.country}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Area / Detailed:</span>
                    <span>{selectedRequest.address || selectedRequest.area || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Preferred Contact:</span>
                    <span>{selectedRequest.preferredContactMethod || 'WhatsApp'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Preferred Time:</span>
                    <span>{selectedRequest.preferredServiceTime || 'Standard'}</span>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-700/60 pb-1.5 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Device Information</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Brand:</span>
                    <strong className="text-white">{selectedRequest.laptopBrand}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Model:</span>
                    <strong className="text-white">{selectedRequest.laptopModel}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Serial Number:</span>
                    <span className="font-mono">{selectedRequest.serialNumber || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Linked Service Job:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {selectedRequest.serviceJobId || 'Not yet converted'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem Details */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-700/60 pb-1.5 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-rose-400" />
                  <span>Problem Complaint &amp; Notes</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Reported Issue:</span>
                    <span className="text-rose-400 font-bold text-sm">{selectedRequest.problemCategory}</span>
                  </div>
                  {selectedRequest.problemDescription && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Customer Description:</span>
                      <p className="bg-slate-950 p-3 rounded-xl text-slate-300 mt-1 italic">
                        "{selectedRequest.problemDescription}"
                      </p>
                    </div>
                  )}
                  {selectedRequest.customerUpdate && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Public Customer-Facing Note:</span>
                      <p className="bg-blue-950/40 border border-blue-800/60 p-3 rounded-xl text-blue-300 mt-1">
                        {selectedRequest.customerUpdate}
                      </p>
                    </div>
                  )}
                  {selectedRequest.internalNote && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">🔒 Internal Admin Note (Hidden from Customer):</span>
                      <p className="bg-amber-950/30 border border-amber-800/60 p-3 rounded-xl text-amber-300 mt-1 font-mono">
                        {selectedRequest.internalNote}
                      </p>
                    </div>
                  )}
                </div>

                {/* Uploaded Photos */}
                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                  <div className="pt-2">
                    <span className="text-slate-500 block text-[10px] mb-1.5">Uploaded Problem Screenshots / Photos:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.attachments.map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 block hover:opacity-80 transition"
                        >
                          <img src={img} alt="attachment" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status History */}
              {selectedRequest.statusHistory && selectedRequest.statusHistory.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-700/60 pb-1.5">
                    Lifecycle Audit History
                  </div>
                  <div className="space-y-2">
                    {selectedRequest.statusHistory.map((sh) => (
                      <div key={sh.id} className="text-[11px] flex items-start justify-between gap-3 border-b border-slate-800 pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <span className="font-bold text-blue-400">{sh.newStatus}</span>
                          <span className="text-slate-500 ml-2">by {sh.changedBy}</span>
                          {sh.customerNote && <p className="text-slate-400 mt-0.5">{sh.customerNote}</p>}
                          {sh.internalNote && <p className="text-amber-400/80 font-mono mt-0.5 text-[10px]">🔒 {sh.internalNote}</p>}
                        </div>
                        <span className="text-slate-500 shrink-0 font-mono text-[10px]">
                          {new Date(sh.changedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              {!selectedRequest.serviceJobId && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenConvertModal(selectedRequest);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Convert to Service Job</span>
                </button>
              )}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          19 & 20. ADMIN STATUS CONTROL MODAL
          ========================================== */}
      {isStatusModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block">
                  Update Request Status
                </span>
                <h3 className="text-lg font-mono font-black text-white">
                  {selectedRequest.srNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Select New Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_REQUEST_STATUSES.map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setStatusToUpdate(st)}
                      className={`py-2 px-3 rounded-xl font-bold text-left transition ${
                        statusToUpdate === st
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 21: Customer-facing update note */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Public Customer Update Note (Visible on SR Tracking)
                </label>
                <textarea
                  rows={2}
                  value={customerNoteInput}
                  onChange={(e) => setCustomerNoteInput(e.target.value)}
                  placeholder="e.g. Laptop received at showroom lab. Motherboard diagnostics underway."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Section 20: Internal Admin Note */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  🔒 Internal Admin Note (Hidden from Customer)
                </label>
                <textarea
                  rows={2}
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  placeholder="e.g. Customer contacted via WhatsApp. Estimate quoted ৳2,500. Awaiting approval."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2"
                >
                  {isUpdatingStatus ? 'Saving...' : 'Save Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          CONVERT TO SERVICE JOB MODAL
          ========================================== */}
      {isConvertModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest block">
                  Convert to JHF Service Job
                </span>
                <h3 className="text-base font-mono font-black text-white">
                  {selectedRequest.srNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-300">
                This will automatically convert customer request <strong className="text-blue-400">{selectedRequest.srNumber}</strong> into an official JHF Service Zone job sheet, update its status to <strong className="text-purple-400">RUNNING</strong>, and assign it to a hardware engineer.
              </p>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Assign Lead Hardware Engineer
                </label>
                <select
                  value={selectedEngineerId}
                  onChange={(e) => setSelectedEngineerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                >
                  {serviceEngineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} ({eng.specialty || 'Chip-Level'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isConverting}
                  onClick={handleConvertJob}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
                >
                  {isConverting ? 'Converting...' : 'Confirm & Create Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
