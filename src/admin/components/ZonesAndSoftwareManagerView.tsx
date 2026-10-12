import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { DownloadItem } from '../../data/jhfData';
import {
  Download,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Wrench,
  Disc,
  CreditCard,
  Phone,
  RotateCcw,
  Sparkles,
  Link,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface ZonesAndSoftwareManagerViewProps {
  initialZone?: 'software' | 'testing' | 'os' | 'cards';
}

export const ZonesAndSoftwareManagerView: React.FC<ZonesAndSoftwareManagerViewProps> = ({
  initialZone = 'software',
}) => {
  const {
    softwareList,
    testingTools,
    osList,
    storeInfo,
    addSoftware,
    updateSoftware,
    deleteSoftware,
    clearAllSoftware,
    addTestingTool,
    updateTestingTool,
    deleteTestingTool,
    clearAllTestingTools,
    addOsItem,
    updateOsItem,
    deleteOsItem,
    clearAllOsItems,
    updateStoreInfo,
    resetAllToDefault,
  } = useStore();

  const [activeZone, setActiveZone] = useState<'software' | 'testing' | 'os' | 'cards'>(initialZone);

  useEffect(() => {
    if (initialZone) {
      setActiveZone(initialZone);
    }
  }, [initialZone]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for Software / Tool / OS
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DownloadItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Utility');
  const [formLink, setFormLink] = useState('');
  const [formSource, setFormSource] = useState<'Google Drive' | 'Mega' | 'Direct'>('Direct');
  const [formSize, setFormSize] = useState('50 MB');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formVersion, setFormVersion] = useState('v1.0');

  // Visiting Card / Payment Card Form State
  const [visitingCardUrl, setVisitingCardUrl] = useState(storeInfo.visitingCardImg || '');
  const [paymentCardUrl, setPaymentCardUrl] = useState(storeInfo.paymentCardImg || '');
  const [storePhones, setStorePhones] = useState(storeInfo.phones.join(', '));
  const [storeWhatsapp, setStoreWhatsapp] = useState(storeInfo.whatsapp || '');
  const [storeLocation, setStoreLocation] = useState(storeInfo.location || '');
  const [cardSaveSuccess, setCardSaveSuccess] = useState(false);

  // File Input Ref for Local Image Upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const visitingCardFileInputRef = useRef<HTMLInputElement | null>(null);
  const paymentCardFileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper for reading image file to base64
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'form' | 'visiting' | 'payment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (allow up to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (target === 'form') {
        setFormImage(result);
      } else if (target === 'visiting') {
        setVisitingCardUrl(result);
      } else if (target === 'payment') {
        setPaymentCardUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: DownloadItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormLink(item.link);
    setFormSource(item.source);
    setFormSize(item.size || '50 MB');
    setFormDescription(item.description || '');
    setFormImage(item.image || '');
    setFormVersion(item.version || 'v1.0');
    setIsEditModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory(activeZone === 'software' ? 'Drivers & Essentials' : activeZone === 'testing' ? 'Hardware Testing' : 'Operating System');
    setFormLink('https://');
    setFormSource('Direct');
    setFormSize('100 MB');
    setFormDescription('');
    setFormImage('');
    setFormVersion('v1.0');
    setIsAddModalOpen(true);
  };

  // Handle Save (Add / Edit)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formLink.trim()) {
      alert('Please fill in both the Title and Download Link');
      return;
    }

    const itemPayload = {
      title: formTitle.trim(),
      category: formCategory.trim() || 'General',
      link: formLink.trim(),
      source: formSource,
      size: formSize.trim() || '50 MB',
      description: formDescription.trim(),
      image: formImage.trim(),
      version: formVersion.trim(),
    };

    if (editingItem) {
      // Update
      if (activeZone === 'software') {
        updateSoftware(editingItem.id, itemPayload);
      } else if (activeZone === 'testing') {
        updateTestingTool(editingItem.id, itemPayload);
      } else if (activeZone === 'os') {
        updateOsItem(editingItem.id, itemPayload);
      }
    } else {
      // Add
      if (activeZone === 'software') {
        addSoftware(itemPayload);
      } else if (activeZone === 'testing') {
        addTestingTool(itemPayload);
      } else if (activeZone === 'os') {
        addOsItem(itemPayload);
      }
    }

    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  // Handle Delete
  const handleDeleteItem = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    if (activeZone === 'software') {
      deleteSoftware(id);
    } else if (activeZone === 'testing') {
      deleteTestingTool(id);
    } else if (activeZone === 'os') {
      deleteOsItem(id);
    }
  };

  // Handle Clear All Dummy for active zone
  const handleClearAllZoneItems = () => {
    const zoneName = activeZone === 'software' ? 'Software Zone' : activeZone === 'testing' ? 'Laptop Testing Tools' : 'Operating System ISOs';
    if (!window.confirm(`WARNING: Are you sure you want to remove ALL items from ${zoneName}? This lets you clear all dummy data and start fresh with your own files!`)) return;

    if (activeZone === 'software') {
      clearAllSoftware();
    } else if (activeZone === 'testing') {
      clearAllTestingTools();
    } else if (activeZone === 'os') {
      clearAllOsItems();
    }
  };

  // Save Store Cards & Media
  const handleSaveCardsAndMedia = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneArray = storePhones
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    updateStoreInfo({
      visitingCardImg: visitingCardUrl.trim(),
      paymentCardImg: paymentCardUrl.trim(),
      phones: phoneArray.length > 0 ? phoneArray : storeInfo.phones,
      whatsapp: storeWhatsapp.trim() || storeInfo.whatsapp,
      location: storeLocation.trim() || storeInfo.location,
    });

    setCardSaveSuccess(true);
    setTimeout(() => setCardSaveSuccess(false), 3000);
  };

  // Filter items for current zone
  const currentList =
    activeZone === 'software' ? softwareList : activeZone === 'testing' ? testingTools : osList;

  const filteredItems = currentList.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Full CRUD Zone &amp; Download Manager</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Software, Tools, ISO &amp; Media Pictures Manager
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Edit download links, file sizes, software names, categories, and pictures. Delete dummy demo records with 1-click or add your own custom real files for customers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all software, tools, OS, and media to system original defaults?')) {
                  resetAllToDefault();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
              title="Reset all content to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Defaults</span>
            </button>

            {activeZone !== 'cards' && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New {activeZone === 'software' ? 'Software' : activeZone === 'testing' ? 'Testing Tool' : 'OS ISO'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Zone Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => { setActiveZone('software'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeZone === 'software'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Software Zone ({softwareList.length})</span>
          </button>

          <button
            onClick={() => { setActiveZone('testing'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeZone === 'testing'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Laptop Testing Tools ({testingTools.length})</span>
          </button>

          <button
            onClick={() => { setActiveZone('os'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeZone === 'os'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>Operating System ISOs ({osList.length})</span>
          </button>

          <button
            onClick={() => { setActiveZone('cards'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeZone === 'cards'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Visiting Card &amp; Payment QR Photos</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeZone !== 'cards' ? (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={`Search ${activeZone === 'software' ? 'software' : activeZone === 'testing' ? 'tools' : 'ISOs'} by title or category...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400">
                Total: <strong className="text-white">{filteredItems.length}</strong> items
              </span>

              {currentList.length > 0 && (
                <button
                  onClick={handleClearAllZoneItems}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Wipe dummy items so you can start with real links"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All ({activeZone})</span>
                </button>
              )}
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">No items found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                {currentList.length === 0
                  ? 'All dummy items have been cleared. Click "Add New" above to post your real software, download links, and pictures!'
                  : 'No items match your search query.'}
              </p>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Item</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition group shadow-md"
                >
                  <div>
                    {/* Header with image preview and category badge */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // fallback icon if image link broken
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : activeZone === 'testing' ? (
                          <Wrench className="w-6 h-6 text-amber-400" />
                        ) : activeZone === 'os' ? (
                          <Disc className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Download className="w-6 h-6 text-blue-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-blue-400 border border-slate-700">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.source}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate" title={item.title}>
                          {item.title}
                        </h4>
                        {item.version && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.version}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}

                    {/* Metadata pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-mono text-slate-400">
                      {item.size && (
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          📦 {item.size}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                        ✓ Verified
                      </span>
                    </div>

                    {/* Link display */}
                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-2 mb-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono truncate">
                        <Link className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{item.link}</span>
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-400 transition shrink-0"
                        title="Open download link in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Actions Row: Edit & Delete */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Link &amp; Details</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                      title="Delete this item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tab 4: Visiting Card & Payment QR Photos */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <span>Store Visiting Card &amp; Payment QR Code Pictures</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Change the official JHF Laptop Zone visiting card picture, payment QR card photo, and store contact info. You can either paste an image URL or upload any image directly from your phone/computer!
            </p>

            {cardSaveSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Store cards and contact pictures updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveCardsAndMedia} className="space-y-6">
              {/* Visiting Card Section */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-200">Official Visiting Card Picture</label>
                    <p className="text-[11px] text-slate-400">Displayed in Store Cards &amp; About Us pages</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={visitingCardFileInputRef}
                      onChange={(e) => handleImageFileUpload(e, 'visiting')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => visitingCardFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Card Image from Device</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={visitingCardUrl}
                  onChange={(e) => setVisitingCardUrl(e.target.value)}
                  placeholder="Paste image URL (https://...) or upload above"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                {visitingCardUrl && (
                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Live Card Preview:</span>
                    <img
                      src={visitingCardUrl}
                      alt="Visiting Card Preview"
                      className="max-h-48 rounded-lg border border-slate-800 shadow-md object-contain bg-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Payment QR Card Section */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-200">Bkash / Nagad / Bank Payment Card or QR Picture</label>
                    <p className="text-[11px] text-slate-400">Shown to buyers for instant account payments and installments</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={paymentCardFileInputRef}
                      onChange={(e) => handleImageFileUpload(e, 'payment')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => paymentCardFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload QR Photo from Device</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={paymentCardUrl}
                  onChange={(e) => setPaymentCardUrl(e.target.value)}
                  placeholder="Paste payment QR card image URL or upload above"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />

                {paymentCardUrl && (
                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Live QR Card Preview:</span>
                    <img
                      src={paymentCardUrl}
                      alt="Payment Card Preview"
                      className="max-h-48 rounded-lg border border-slate-800 shadow-md object-contain bg-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Store Contact Info */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <label className="text-xs font-bold text-slate-200 block">Store Phone &amp; WhatsApp Contacts</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Hotline Numbers (comma separated)</label>
                    <input
                      type="text"
                      value={storePhones}
                      onChange={(e) => setStorePhones(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">WhatsApp Number (e.g. 8801935693071)</label>
                    <input
                      type="text"
                      value={storeWhatsapp}
                      onChange={(e) => setStoreWhatsapp(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Store Address / Location</label>
                  <input
                    type="text"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Visiting Card &amp; Contact Pictures</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Modal for Software, Testing Tools, OS */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-400" />
                <span>
                  {editingItem ? `Edit ${editingItem.title}` : `Add New ${activeZone === 'software' ? 'Software' : activeZone === 'testing' ? 'Testing Tool' : 'OS ISO'}`}
                </span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Software / File Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. BatteryMon, FurMark, Windows 11 Pro"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Battery, GPU Benchmark, OS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 mb-1.5"
                  />
                  {/* Category Quick Pills */}
                  <div className="flex flex-wrap gap-1">
                    {activeZone === 'testing' &&
                      ['Battery Health', 'SSD Diagnostics', 'Keyboard & Mouse', 'Screen & Pixel', 'CPU / GPU Stress'].map(
                        (cat) => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setFormCategory(cat)}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition"
                          >
                            + {cat}
                          </button>
                        )
                      )}
                    {activeZone === 'os' &&
                      ['Windows 11 Clean ISO', 'Windows 10 Clean ISO', 'Bootable USB (Ventoy)', '11th Gen VMD Driver', 'Live Portable OS'].map(
                        (cat) => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setFormCategory(cat)}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition"
                          >
                            + {cat}
                          </button>
                        )
                      )}
                    {activeZone === 'software' &&
                      ['Drivers & Essentials', 'Office & Productivity', 'System Utilities', 'Media Tools'].map(
                        (cat) => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setFormCategory(cat)}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition"
                          >
                            + {cat}
                          </button>
                        )
                      )}
                  </div>
                </div>
              </div>

              {/* Download Link */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Download Link (Mega / Google Drive / Direct URL) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://mega.nz/... or https://drive.google.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Source, Size & Version */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Source Server</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Direct">Direct Server</option>
                    <option value="Google Drive">Google Drive</option>
                    <option value="Mega">Mega Cloud</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">File Size</label>
                  <input
                    type="text"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    placeholder="e.g. 45 MB, 4.2 GB"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Version / Build</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    placeholder="e.g. v2.4, 23H2"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Image / Logo Upload or URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Software Icon / Picture (Optional)
                  </label>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleImageFileUpload(e, 'form')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] flex items-center gap-1 transition"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Image File</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="Paste image URL (https://...) or upload above"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  {formImage && (
                    <div className="w-8 h-8 rounded bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Description / Features (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short note or description for customers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'Save Changes' : 'Post to Zone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
