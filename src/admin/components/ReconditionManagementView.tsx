import React, { useState } from 'react';
import { useAdminStore, BUSINESS_INFO } from '../adminStore';
import { useAdminAuth } from '../authContext';
import { ReconditionLaptop } from '../types';
import {
  Laptop,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  Boxes,
  Trash2,
  Edit,
  Sparkles,
  Tag,
  Clock,
  Printer,
  X,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Battery,
  Cpu,
  HardDrive,
  Monitor,
  Phone,
  User,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ReconditionManagementView: React.FC = () => {
  const {
    reconditionLaptops,
    addReconditionLaptop,
    updateReconditionLaptop,
    deleteReconditionLaptop,
    markReconditionSold,
    markReconditionAvailable,
    clearAllReconditionLaptops,
    reconditionSummary,
  } = useAdminStore();
  const { currentUser } = useAdminAuth();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold' | 'booked'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'profit_desc'>('newest');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkSoldModalOpen, setIsMarkSoldModalOpen] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState<ReconditionLaptop | null>(null);

  // Mark Sold Form State
  const [soldForm, setSoldForm] = useState({
    soldPrice: 0,
    customerName: '',
    customerPhone: '',
    soldDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Cash',
    notes: '',
  });

  // Form State for Add / Edit
  const initialFormState = {
    code: '',
    title: '',
    brand: 'Lenovo',
    model: '',
    processor: '',
    ram: '16GB DDR4',
    storage: '256GB NVMe SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" FHD IPS Anti-Glare (1920x1080)',
    batteryBackup: '4 to 5 Hours (Health 90%+)',
    physicalCondition: 'A+ Grade (Mint/Scratchless)',
    conditionDetails: 'Original imported, zero dents or scratches, tested motherboard and keyboard.',
    includedAccessories: 'Original Charger, Power Cord, Laptop Bag, Wireless Mouse',
    serialNumber: '',
    sourceSupplier: 'Dubai Global Laptops Trading LLC',
    buyPrice: 22000,
    sellPrice: 28500,
    offerPrice: 27000,
    status: 'available' as const,
    images: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80',
    warranty: '15 Days Full Replacement + 2 Years Free Service Warranty',
    isFeatured: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Brands list for filter
  const brands = Array.from(new Set(reconditionLaptops.map((l) => l.brand))).filter(Boolean);

  // Filtered & Sorted list
  const filteredLaptops = reconditionLaptops
    .filter((laptop) => {
      // Status filter
      if (statusFilter !== 'all' && laptop.status !== statusFilter) return false;
      // Brand filter
      if (brandFilter !== 'all' && laptop.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = laptop.title.toLowerCase().includes(q);
        const matchesModel = laptop.model.toLowerCase().includes(q);
        const matchesCode = (laptop.code || '').toLowerCase().includes(q);
        const matchesSN = (laptop.serialNumber || '').toLowerCase().includes(q);
        const matchesProc = laptop.processor.toLowerCase().includes(q);
        const matchesSupplier = (laptop.sourceSupplier || '').toLowerCase().includes(q);
        const matchesCustomer = (laptop.soldToCustomer || '').toLowerCase().includes(q);
        return matchesTitle || matchesModel || matchesCode || matchesSN || matchesProc || matchesSupplier || matchesCustomer;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.offerPrice || a.sellPrice) - (b.offerPrice || b.sellPrice);
      if (sortBy === 'price_desc') return (b.offerPrice || b.sellPrice) - (a.offerPrice || a.sellPrice);
      if (sortBy === 'profit_desc') {
        const profitA = (a.soldPrice || a.offerPrice || a.sellPrice) - a.buyPrice;
        const profitB = (b.soldPrice || b.offerPrice || b.sellPrice) - b.buyPrice;
        return profitB - profitA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Handle open Add
  const handleOpenAdd = () => {
    const nextCode = `REC-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      ...initialFormState,
      code: nextCode,
      serialNumber: `SN-REC-${Math.floor(10000 + Math.random() * 90000)}`,
    });
    setIsAddModalOpen(true);
  };

  // Handle submit Add
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.model || formData.buyPrice <= 0 || formData.sellPrice <= 0) {
      alert('Please fill in title, model, buying price and selling price.');
      return;
    }

    const accessoriesArray = formData.includedAccessories
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const imagesArray = formData.images
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    addReconditionLaptop({
      code: formData.code,
      title: formData.title,
      brand: formData.brand,
      model: formData.model,
      processor: formData.processor,
      ram: formData.ram,
      storage: formData.storage,
      graphics: formData.graphics,
      display: formData.display,
      batteryBackup: formData.batteryBackup,
      physicalCondition: formData.physicalCondition,
      conditionDetails: formData.conditionDetails,
      includedAccessories: accessoriesArray.length > 0 ? accessoriesArray : ['Original Charger', 'Power Cord', 'Laptop Bag'],
      serialNumber: formData.serialNumber,
      sourceSupplier: formData.sourceSupplier,
      buyPrice: Number(formData.buyPrice) || 0,
      sellPrice: Number(formData.sellPrice) || 0,
      offerPrice: Number(formData.offerPrice) || Number(formData.sellPrice) || 0,
      status: formData.status,
      images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80'],
      warranty: formData.warranty,
      isFeatured: formData.isFeatured,
    });

    setIsAddModalOpen(false);
  };

  // Handle open Edit
  const handleOpenEdit = (laptop: ReconditionLaptop) => {
    setSelectedLaptop(laptop);
    setFormData({
      code: laptop.code,
      title: laptop.title,
      brand: laptop.brand,
      model: laptop.model,
      processor: laptop.processor,
      ram: laptop.ram,
      storage: laptop.storage,
      graphics: laptop.graphics,
      display: laptop.display,
      batteryBackup: laptop.batteryBackup,
      physicalCondition: laptop.physicalCondition,
      conditionDetails: laptop.conditionDetails || '',
      includedAccessories: (laptop.includedAccessories || []).join(', '),
      serialNumber: laptop.serialNumber || '',
      sourceSupplier: laptop.sourceSupplier || '',
      buyPrice: laptop.buyPrice,
      sellPrice: laptop.sellPrice,
      offerPrice: laptop.offerPrice || laptop.sellPrice,
      status: laptop.status,
      images: (laptop.images || []).join('\n'),
      warranty: laptop.warranty || '',
      isFeatured: !!laptop.isFeatured,
    });
    setIsEditModalOpen(true);
  };

  // Handle submit Edit
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaptop) return;

    const accessoriesArray = formData.includedAccessories
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const imagesArray = formData.images
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    updateReconditionLaptop(selectedLaptop.id, {
      code: formData.code,
      title: formData.title,
      brand: formData.brand,
      model: formData.model,
      processor: formData.processor,
      ram: formData.ram,
      storage: formData.storage,
      graphics: formData.graphics,
      display: formData.display,
      batteryBackup: formData.batteryBackup,
      physicalCondition: formData.physicalCondition,
      conditionDetails: formData.conditionDetails,
      includedAccessories: accessoriesArray,
      serialNumber: formData.serialNumber,
      sourceSupplier: formData.sourceSupplier,
      buyPrice: Number(formData.buyPrice) || 0,
      sellPrice: Number(formData.sellPrice) || 0,
      offerPrice: Number(formData.offerPrice) || Number(formData.sellPrice) || 0,
      status: formData.status,
      images: imagesArray,
      warranty: formData.warranty,
      isFeatured: formData.isFeatured,
    });

    setIsEditModalOpen(false);
    setSelectedLaptop(null);
  };

  // Handle open Mark Sold Modal
  const handleOpenMarkSold = (laptop: ReconditionLaptop) => {
    setSelectedLaptop(laptop);
    setSoldForm({
      soldPrice: laptop.offerPrice || laptop.sellPrice,
      customerName: '',
      customerPhone: '',
      soldDate: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Cash',
      notes: `Sold from shop showroom. Condition verified with customer.`,
    });
    setIsMarkSoldModalOpen(true);
  };

  // Handle confirm Sold
  const handleConfirmSold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaptop) return;
    const finalPrice = Number(soldForm.soldPrice) || selectedLaptop.offerPrice || selectedLaptop.sellPrice;
    const customer = soldForm.customerName.trim()
      ? `${soldForm.customerName.trim()}${soldForm.customerPhone ? ` (${soldForm.customerPhone.trim()})` : ''}`
      : 'Showroom Walk-in Customer';

    markReconditionSold(selectedLaptop.id, finalPrice, customer, soldForm.soldDate);
    setIsMarkSoldModalOpen(false);
    setSelectedLaptop(null);
  };

  // Print Recondition Stock Sheet
  const handlePrintStockSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              JHF RECONDITION ZONE
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">Pre-Owned / Used Laptop Inventory &amp; Profit Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Laptop className="w-7 h-7 text-emerald-400" />
            <span>JHF Recondition Zone (পুরনো ল্যাপটপ হিসাব)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Admin Management for Used / Reconditioned Laptops: Post new used models, update condition/battery health, mark as sold, and track independent <strong>Buy Price vs Sell Price vs Net Profit (আলাদা লাভ-ক্ষতি)</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Recondition Laptop</span>
          </button>
          <button
            onClick={handlePrintStockSheet}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2.5 rounded-xl transition flex items-center gap-1.5"
            title="Print Stock Sheet"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Stock Sheet</span>
          </button>
          {reconditionLaptops.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('⚠️ Are you sure you want to clear ALL reconditioned demo laptops? You can then enter your real shop stock.')) {
                  clearAllReconditionLaptops();
                }
              }}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs px-3 py-2.5 rounded-xl transition flex items-center gap-1.5"
              title="Clear all demo units"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* 5 Financial & Inventory KPI Cards (আলাদা লাভ ও ক্রয়-বিক্রয় হিসাব) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Stock Units */}
        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Total Sourced Units</span>
            <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{reconditionSummary.totalUnits} Laptops</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">{reconditionSummary.availableUnits} Available</span>
            <span>•</span>
            <span className="text-purple-400 font-bold">{reconditionSummary.soldUnits} Sold</span>
          </div>
        </div>

        {/* Total Buying Investment */}
        <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Total Buying Cost (ক্রয়)</span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400">
            ৳{reconditionSummary.totalInvestment.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total capital invested in used stock
          </div>
        </div>

        {/* Total Sold Revenue */}
        <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Total Sold Value (বিক্রয়)</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400">
            ৳{reconditionSummary.totalSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Realized cash from {reconditionSummary.soldUnits} sold units
          </div>
        </div>

        {/* Realized Profit (নিট লাভ) */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 transition shadow">
          <div className="flex items-center justify-between text-emerald-300 mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider">Realized Net Profit (লাভ)</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ৳{reconditionSummary.totalProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1">
            Formula: Sold Price − Buying Cost
          </div>
        </div>

        {/* Current Available Stock Value */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition shadow">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Unsold Stock Value</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">
            ৳{reconditionSummary.unsoldStockValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Projected Profit: +৳{reconditionSummary.projectedProfit.toLocaleString()}
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Units ({reconditionLaptops.length})
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'available' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Available ({reconditionSummary.availableUnits})
          </button>
          <button
            onClick={() => setStatusFilter('sold')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'sold' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Sold ({reconditionSummary.soldUnits})
          </button>
          <button
            onClick={() => setStatusFilter('booked')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'booked' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Booked ({reconditionSummary.bookedUnits})
          </button>
        </div>

        {/* Right Search, Brand & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Brand Filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 font-semibold"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 font-semibold"
          >
            <option value="newest">Sort: Recently Added</option>
            <option value="profit_desc">Sort: Highest Profit</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, SN, processor..."
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Inventory List / Grid */}
      {filteredLaptops.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Laptop className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Reconditioned Laptops Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery || statusFilter !== 'all' || brandFilter !== 'all'
              ? 'Try changing your search keywords or filter criteria.'
              : 'Post your first recondition laptop with complete specs, condition grade, and buying/selling price.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post Recondition Laptop</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredLaptops.map((laptop) => {
            const isSold = laptop.status === 'sold';
            const isAvailable = laptop.status === 'available';
            const finalSoldOrOfferPrice = isSold ? (laptop.soldPrice || laptop.offerPrice || laptop.sellPrice) : (laptop.offerPrice || laptop.sellPrice);
            const profitAmount = finalSoldOrOfferPrice - laptop.buyPrice;
            const profitMarginPercent = laptop.buyPrice > 0 ? Math.round((profitAmount / laptop.buyPrice) * 100) : 0;

            return (
              <div
                key={laptop.id}
                className={`bg-slate-900 border rounded-2xl p-4.5 transition flex flex-col justify-between gap-3 relative overflow-hidden ${
                  isSold
                    ? 'border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20'
                    : 'border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                {/* Top Row: Code, Status & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black bg-slate-800 text-slate-200 border border-slate-700">
                      {laptop.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isAvailable
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isSold
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {laptop.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {laptop.physicalCondition}
                    </span>
                    {laptop.serialNumber && (
                      <span className="text-[10px] font-mono text-slate-400">
                        SN: <strong className="text-slate-200">{laptop.serialNumber}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(laptop)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Edit Laptop Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${laptop.title}?`)) {
                          deleteReconditionLaptop(laptop.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition"
                      title="Delete Laptop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Body: Image + Specs */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Image */}
                  <div className="w-full sm:w-36 h-28 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative">
                    <img
                      src={laptop.images?.[0] || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80'}
                      alt={laptop.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isSold && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-black text-xs tracking-wider uppercase rotate-[-8deg] shadow-lg">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Core Specs */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h2 className="text-sm font-black text-white leading-snug line-clamp-2">
                      {laptop.title}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400 truncate">
                        <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{laptop.processor}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 truncate">
                        <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{laptop.ram} • {laptop.storage}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 truncate">
                        <Battery className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{laptop.batteryBackup}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 truncate">
                        <Monitor className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{laptop.display}</span>
                      </div>
                    </div>

                    {laptop.sourceSupplier && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span>Source Supplier:</span>
                        <span className="text-slate-400 font-semibold">{laptop.sourceSupplier}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Ledger Bar (Buy vs Sell vs Profit) */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Buying Cost (ক্রয়)</span>
                    <span className="font-mono font-bold text-slate-200">
                      ৳{laptop.buyPrice.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {isSold ? 'Sold Price (বিক্রয়)' : 'Selling Price (মূল্য)'}
                    </span>
                    <span className={`font-mono font-bold ${isSold ? 'text-purple-400' : 'text-emerald-400'}`}>
                      ৳{finalSoldOrOfferPrice.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {isSold ? 'Realized Profit (লাভ)' : 'Projected Profit'}
                    </span>
                    <span className={`font-mono font-black ${profitAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      +৳{profitAmount.toLocaleString()}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({profitMarginPercent}%)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Sold Details if Sold */}
                {isSold && (
                  <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-2.5 text-xs text-purple-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      <div>
                        <span>Sold to: <strong>{laptop.soldToCustomer || 'Customer'}</strong></span>
                        {laptop.soldDate && (
                          <span className="text-[11px] text-purple-300/70 ml-2">
                            on {laptop.soldDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => markReconditionAvailable(laptop.id)}
                      className="text-[11px] font-bold text-purple-300 hover:text-white underline"
                    >
                      Reactivate as Available
                    </button>
                  </div>
                )}

                {/* Bottom Action Footer for Available Laptop */}
                {isAvailable && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{laptop.warranty || '15 Days Replacement Guarantee'}</span>
                    </div>

                    <button
                      onClick={() => handleOpenMarkSold(laptop)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Sold</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Post New Recondition Laptop */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Post New Recondition Laptop</h2>
                <p className="text-xs text-slate-400">Add pre-owned laptop with specs, condition grade, and buying cost</p>
              </div>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs font-semibold text-slate-300">
              {/* Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Stock Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-slate-400">Listing Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Lenovo ThinkPad T480s (Core i5 8th Gen / 16GB / 256GB SSD)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Brand</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Lenovo">Lenovo</option>
                    <option value="Dell">Dell</option>
                    <option value="HP">HP</option>
                    <option value="Apple">Apple</option>
                    <option value="Asus">Asus</option>
                    <option value="Acer">Acer</option>
                    <option value="Toshiba">Toshiba</option>
                    <option value="Fujitsu">Fujitsu</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Model Name</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. ThinkPad T480s"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              {/* Processor & RAM & Storage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Processor</label>
                  <input
                    type="text"
                    value={formData.processor}
                    onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                    placeholder="e.g. Core i5-8350U"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">RAM</label>
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    placeholder="e.g. 16GB DDR4"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Storage / SSD</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    placeholder="e.g. 256GB NVMe SSD"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              {/* Display & Battery & Condition Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Display</label>
                  <input
                    type="text"
                    value={formData.display}
                    onChange={(e) => setFormData({ ...formData, display: e.target.value })}
                    placeholder="e.g. 14.0 FHD IPS"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Battery Backup &amp; Health</label>
                  <input
                    type="text"
                    value={formData.batteryBackup}
                    onChange={(e) => setFormData({ ...formData, batteryBackup: e.target.value })}
                    placeholder="e.g. 4-5 Hours (Health 92%)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Condition Grade</label>
                  <select
                    value={formData.physicalCondition}
                    onChange={(e) => setFormData({ ...formData, physicalCondition: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-emerald-400"
                  >
                    <option value="A+ Grade (Mint/Scratchless)">A+ Grade (Mint/Scratchless)</option>
                    <option value="A Grade (Very Light Signs)">A Grade (Very Light Signs)</option>
                    <option value="B+ Grade (Good Used Condition)">B+ Grade (Good Used Condition)</option>
                  </select>
                </div>
              </div>

              {/* Serial Number & Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Serial Number (Unique Unit SN)</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="e.g. SN-TP-T480S-8819"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Source Supplier / Batch</label>
                  <input
                    type="text"
                    value={formData.sourceSupplier}
                    onChange={(e) => setFormData({ ...formData, sourceSupplier: e.target.value })}
                    placeholder="e.g. Dubai Global Laptops LLC"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Financials: Buy Price, Sell Price, Offer Price */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-blue-400">Buying Cost (ক্রয় মূল্য ৳)</label>
                  <input
                    type="number"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-blue-500/40 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Only visible to Admin</span>
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Regular Selling Price (৳)</label>
                  <input
                    type="number"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-emerald-400">Special Offer Price (৳)</label>
                  <input
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-emerald-500/40 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-emerald-400">
                    Profit: +৳{(formData.offerPrice || formData.sellPrice) - formData.buyPrice}
                  </span>
                </div>
              </div>

              {/* Accessories & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Included Accessories (comma separated)</label>
                  <input
                    type="text"
                    value={formData.includedAccessories}
                    onChange={(e) => setFormData({ ...formData, includedAccessories: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Warranty Commitment</label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block mb-1 text-slate-400">Photo Image URL</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30"
                >
                  Post Recondition Laptop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Recondition Laptop */}
      {isEditModalOpen && selectedLaptop && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedLaptop(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Edit className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Edit Recondition Laptop</h2>
                <p className="text-xs text-slate-400">Update specs, pricing or physical condition</p>
              </div>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs font-semibold text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Stock Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-slate-400">Listing Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="available">Available (In Stock)</option>
                    <option value="sold">Sold Out</option>
                    <option value="booked">Booked / Advance Taken</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Processor</label>
                  <input
                    type="text"
                    value={formData.processor}
                    onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">RAM</label>
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Storage</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Battery & Condition Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Battery Health &amp; Backup</label>
                  <input
                    type="text"
                    value={formData.batteryBackup}
                    onChange={(e) => setFormData({ ...formData, batteryBackup: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Condition Grade</label>
                  <select
                    value={formData.physicalCondition}
                    onChange={(e) => setFormData({ ...formData, physicalCondition: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-emerald-400"
                  >
                    <option value="A+ Grade (Mint/Scratchless)">A+ Grade (Mint/Scratchless)</option>
                    <option value="A Grade (Very Light Signs)">A Grade (Very Light Signs)</option>
                    <option value="B+ Grade (Good Used Condition)">B+ Grade (Good Used Condition)</option>
                  </select>
                </div>
              </div>

              {/* Financials */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-blue-400">Buying Cost (ক্রয় মূল্য ৳)</label>
                  <input
                    type="number"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-blue-500/40 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Regular Selling Price (৳)</label>
                  <input
                    type="number"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-emerald-400">Offer Price (৳)</label>
                  <input
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-emerald-500/40 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block mb-1 text-slate-400">Photo URLs</label>
                <textarea
                  rows={2}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedLaptop(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Mark as Sold */}
      {isMarkSoldModalOpen && selectedLaptop && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setIsMarkSoldModalOpen(false);
                setSelectedLaptop(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Mark as Sold (বিক্রয় এন্ট্রি)</h2>
                <p className="text-xs text-slate-400">{selectedLaptop.title} ({selectedLaptop.code})</p>
              </div>
            </div>

            <form onSubmit={handleConfirmSold} className="space-y-4 text-xs font-semibold text-slate-300">
              
              {/* Financial preview */}
              <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Unit Buying Cost:</span>
                  <span className="text-sm font-bold text-slate-200">৳{selectedLaptop.buyPrice.toLocaleString()}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Sold Price:</span>
                  <span className="text-sm font-bold text-purple-300">৳{Number(soldForm.soldPrice).toLocaleString()}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Realized Profit (নিট লাভ):</span>
                  <span className="text-sm font-black text-emerald-400">
                    +৳{(Number(soldForm.soldPrice) - selectedLaptop.buyPrice).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Sold Price Input */}
              <div>
                <label className="block mb-1 text-slate-300">Final Selling Price (৳)</label>
                <input
                  type="number"
                  value={soldForm.soldPrice}
                  onChange={(e) => setSoldForm({ ...soldForm, soldPrice: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-purple-500/40 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  required
                />
              </div>

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Customer Name</label>
                  <input
                    type="text"
                    value={soldForm.customerName}
                    onChange={(e) => setSoldForm({ ...soldForm, customerName: e.target.value })}
                    placeholder="e.g. Kamrul Hasan"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Customer Phone</label>
                  <input
                    type="text"
                    value={soldForm.customerPhone}
                    onChange={(e) => setSoldForm({ ...soldForm, customerPhone: e.target.value })}
                    placeholder="e.g. 017..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Sold Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Sold Date</label>
                  <input
                    type="date"
                    value={soldForm.soldDate}
                    onChange={(e) => setSoldForm({ ...soldForm, soldDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Payment Received Via</label>
                  <select
                    value={soldForm.paymentMethod}
                    onChange={(e) => setSoldForm({ ...soldForm, paymentMethod: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Cash">Cash at Counter</option>
                    <option value="Bkash">bKash Merchant / Personal</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank Account">Bank Deposit / Transfer</option>
                    <option value="POS">Card POS Swiped</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMarkSoldModalOpen(false);
                    setSelectedLaptop(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-lg shadow-purple-600/30"
                >
                  Confirm Sold &amp; Record Profit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
