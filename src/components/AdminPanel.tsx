import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LaptopItem, DownloadItem } from '../data/jhfData';
import {
  Laptop,
  Layers,
  Wrench,
  Disc,
  Phone,
  Shield,
  Code,
  Download,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  ExternalLink,
  Check,
  Search,
  Copy,
  FileJson,
  Upload,
  AlertTriangle,
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AdminPanel: React.FC<{ onSwitchToPreview: () => void }> = ({ onSwitchToPreview }) => {
  const {
    laptops,
    softwareList,
    testingTools,
    osList,
    warrantyTiers,
    storeInfo,
    adminEmail,
    logout,
    addLaptop,
    updateLaptop,
    deleteLaptop,
    addSoftware,
    updateSoftware,
    deleteSoftware,
    addTestingTool,
    updateTestingTool,
    deleteTestingTool,
    addOsItem,
    updateOsItem,
    deleteOsItem,
    updateStoreInfo,
    updateWarrantyTier,
    resetAllToDefault,
    exportDatabaseJson,
    importDatabaseJson,
    generateDynamicXml
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'laptops' | 'software' | 'testing' | 'os' | 'store' | 'warranty' | 'xml' | 'backup'
  >('laptops');

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedXml, setCopiedXml] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Laptop Form State
  const [editingLaptopId, setEditingLaptopId] = useState<string | null>(null);
  const [laptopForm, setLaptopForm] = useState<Omit<LaptopItem, 'id'>>({
    title: '',
    brand: 'Lenovo',
    series: 'ThinkPad T-Series',
    specs: '',
    price: '৳ 35,000',
    tag: 'Dubai Original',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/'
  });

  // Software / Download Item Form State
  const [editingDownloadId, setEditingDownloadId] = useState<string | null>(null);
  const [downloadForm, setDownloadForm] = useState<Omit<DownloadItem, 'id'>>({
    title: '',
    category: 'System Utilities',
    link: '',
    source: 'Google Drive',
    description: ''
  });

  // Store Info State for inline editing
  const [storeForm, setStoreForm] = useState(storeInfo);

  // XML string generated from real-time store state
  const currentGeneratedXml = generateDynamicXml();

  const handleSaveLaptop = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLaptopId) {
      updateLaptop(editingLaptopId, laptopForm);
      showToast('Laptop specifications updated successfully!');
      setEditingLaptopId(null);
    } else {
      addLaptop(laptopForm);
      showToast('New laptop added to inventory!');
    }
    // Reset form
    setLaptopForm({
      title: '',
      brand: 'Lenovo',
      series: 'ThinkPad Series',
      specs: '',
      price: '৳ 35,000',
      tag: 'Dubai Original',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80',
      url: 'https://www.jhflaptopzone.com/'
    });
  };

  const handleEditLaptopClick = (laptop: LaptopItem) => {
    setEditingLaptopId(laptop.id);
    setLaptopForm({
      title: laptop.title,
      brand: laptop.brand,
      series: laptop.series,
      specs: laptop.specs,
      price: laptop.price,
      tag: laptop.tag,
      image: laptop.image,
      url: laptop.url || ''
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSaveDownloadItem = (
    type: 'software' | 'testing' | 'os',
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (editingDownloadId) {
      if (type === 'software') updateSoftware(editingDownloadId, downloadForm);
      if (type === 'testing') updateTestingTool(editingDownloadId, downloadForm);
      if (type === 'os') updateOsItem(editingDownloadId, downloadForm);
      showToast('Download link & details updated!');
      setEditingDownloadId(null);
    } else {
      if (type === 'software') addSoftware(downloadForm);
      if (type === 'testing') addTestingTool(downloadForm);
      if (type === 'os') addOsItem(downloadForm);
      showToast('New item added to library!');
    }
    setDownloadForm({
      title: '',
      category: 'System Utilities',
      link: '',
      source: 'Google Drive',
      description: ''
    });
  };

  const handleEditDownloadClick = (item: DownloadItem) => {
    setEditingDownloadId(item.id);
    setDownloadForm({
      title: item.title,
      category: item.category,
      link: item.link,
      source: item.source,
      description: item.description || ''
    });
  };

  const handleCopyXml = () => {
    navigator.clipboard.writeText(currentGeneratedXml);
    setCopiedXml(true);
    showToast('Updated Blogger Theme XML copied to clipboard!');
    setTimeout(() => setCopiedXml(false), 2500);
  };

  const handleDownloadXmlFile = () => {
    const element = document.createElement('a');
    const file = new Blob([currentGeneratedXml], { type: 'text/xml' });
    element.href = URL.createObjectURL(file);
    element.download = 'jhf-blogger-theme-customized.xml';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('jhf-blogger-theme-customized.xml downloaded!');
  };

  const handleExportJson = () => {
    const jsonStr = exportDatabaseJson();
    const element = document.createElement('a');
    const file = new Blob([jsonStr], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `jhf-store-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Store Database Backup JSON exported!');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        const content = event.target?.result as string;
        const ok = importDatabaseJson(content);
        if (ok) {
          showToast('Database imported successfully!');
        } else {
          alert('Error: Invalid JSON backup file format.');
        }
      };
    }
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all store data, software links, and testing tools back to the factory defaults?'
      )
    ) {
      resetAllToDefault();
      showToast('All store data reset to verified factory defaults!');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slideIn">
          <Check className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>JHF Master Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <span>Admin Customizer &amp; Editor</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">{adminEmail}</strong> • Full edit access to products, links, XML generator &amp; store settings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onSwitchToPreview}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center gap-2"
          >
            <span>View Live Site</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyXml}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center gap-1.5"
          >
            {copiedXml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedXml ? 'Copied XML' : 'Copy Blogger XML'}</span>
          </button>

          <button
            onClick={logout}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm flex flex-wrap gap-1.5">
        {[
          { id: 'laptops', label: '💻 Laptops Inventory', count: laptops.length },
          { id: 'software', label: '⚡ Software Zone', count: softwareList.length },
          { id: 'testing', label: '🧪 Testing Tools', count: testingTools.length },
          { id: 'os', label: '💿 OS & ISOs', count: osList.length },
          { id: 'store', label: '🏢 Store & Contact', count: null },
          { id: 'warranty', label: '🛡️ Warranty Policy', count: warrantyTiers.length },
          { id: 'xml', label: '📄 Blogger XML Theme', count: null },
          { id: 'backup', label: '💾 Backup & Reset', count: null }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setEditingLaptopId(null);
              setEditingDownloadId(null);
            }}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: LAPTOPS INVENTORY */}
      {activeTab === 'laptops' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Laptop Add/Edit Form */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {editingLaptopId ? <Edit2 className="w-4 h-4 text-blue-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                <span>{editingLaptopId ? 'Edit Laptop Details' : 'Add New Laptop Product'}</span>
              </h3>
              {editingLaptopId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingLaptopId(null);
                    setLaptopForm({
                      title: '',
                      brand: 'Lenovo',
                      series: 'ThinkPad Series',
                      specs: '',
                      price: '৳ 35,000',
                      tag: 'Dubai Original',
                      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80',
                      url: 'https://www.jhflaptopzone.com/'
                    });
                  }}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveLaptop} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Laptop Title</label>
                <input
                  type="text"
                  required
                  value={laptopForm.title}
                  onChange={(e) => setLaptopForm({ ...laptopForm, title: e.target.value })}
                  placeholder="e.g. Lenovo ThinkPad T480s (i5 8th / 16GB / 512GB SSD)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                  <select
                    value={laptopForm.brand}
                    onChange={(e) => setLaptopForm({ ...laptopForm, brand: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Lenovo">Lenovo</option>
                    <option value="HP">HP</option>
                    <option value="Dell">Dell</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Price (৳)</label>
                  <input
                    type="text"
                    required
                    value={laptopForm.price}
                    onChange={(e) => setLaptopForm({ ...laptopForm, price: e.target.value })}
                    placeholder="৳ 35,000"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-blue-600 dark:text-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Series</label>
                  <input
                    type="text"
                    value={laptopForm.series}
                    onChange={(e) => setLaptopForm({ ...laptopForm, series: e.target.value })}
                    placeholder="ThinkPad T-Series"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Badge / Tag</label>
                  <input
                    type="text"
                    value={laptopForm.tag}
                    onChange={(e) => setLaptopForm({ ...laptopForm, tag: e.target.value })}
                    placeholder="Dubai Original / Most Popular"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Specifications</label>
                <textarea
                  rows={3}
                  required
                  value={laptopForm.specs}
                  onChange={(e) => setLaptopForm({ ...laptopForm, specs: e.target.value })}
                  placeholder="Intel Core i5-8350U • 16GB DDR4 • 512GB SSD • 14 FHD IPS • Type-C"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Photo URL</label>
                <input
                  type="url"
                  value={laptopForm.image}
                  onChange={(e) => setLaptopForm({ ...laptopForm, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blogger Post URL (Optional)</label>
                <input
                  type="url"
                  value={laptopForm.url}
                  onChange={(e) => setLaptopForm({ ...laptopForm, url: e.target.value })}
                  placeholder="https://www.jhflaptopzone.com/2024/..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{editingLaptopId ? 'Save Changes' : 'Publish Laptop'}</span>
              </button>
            </form>
          </div>

          {/* Laptops Inventory List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Current Laptop Stock ({laptops.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage prices, specs, and stock details in real-time
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search laptops..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto pr-1">
              {laptops
                .filter((l) => ((l.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())) || ((l.brand || '').toLowerCase().includes((searchQuery || '').toLowerCase())))
                .map((laptop) => (
                  <div key={laptop.id} className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition">
                    <div className="flex items-start gap-3">
                      <img
                        src={laptop.image}
                        alt={laptop.title}
                        className="w-14 h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {laptop.title}
                          </span>
                          <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                            {laptop.brand}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {laptop.specs}
                        </div>
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1">
                          {laptop.price}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditLaptopClick(laptop)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition"
                        title="Edit Laptop"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${laptop.title}?`)) {
                            deleteLaptop(laptop.id);
                            showToast('Laptop deleted from inventory.');
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                        title="Delete Laptop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SOFTWARE ZONE (22 ITEMS) */}
      {activeTab === 'software' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Edit / Add Software Form */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {editingDownloadId ? <Edit2 className="w-4 h-4 text-blue-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                <span>{editingDownloadId ? 'Edit Software Link' : 'Add New Software Package'}</span>
              </h3>
              {editingDownloadId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingDownloadId(null);
                    setDownloadForm({
                      title: '',
                      category: 'System Utilities',
                      link: '',
                      source: 'Google Drive',
                      description: ''
                    });
                  }}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={(e) => handleSaveDownloadItem('software', e)} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Software Title</label>
                <input
                  type="text"
                  required
                  value={downloadForm.title}
                  onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })}
                  placeholder="e.g. Bijoy 52 (Bayanno) with Key"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={downloadForm.category}
                    onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value })}
                    placeholder="Typing & Bangla / Graphics"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Source Host</label>
                  <select
                    value={downloadForm.source}
                    onChange={(e) => setDownloadForm({ ...downloadForm, source: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Google Drive">Google Drive</option>
                    <option value="Mega">Mega</option>
                    <option value="Direct">Direct Host</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Google Drive / Download Link</label>
                <input
                  type="url"
                  required
                  value={downloadForm.link}
                  onChange={(e) => setDownloadForm({ ...downloadForm, link: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={downloadForm.description}
                  onChange={(e) => setDownloadForm({ ...downloadForm, description: e.target.value })}
                  placeholder="e.g. Pre-activated with genuine serial key"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{editingDownloadId ? 'Update Link' : 'Add Software'}</span>
              </button>
            </form>
          </div>

          {/* Software List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  JHF Software Zone Downloads ({softwareList.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct Google Drive &amp; Mega download packages
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto pr-1">
              {softwareList.map((sw) => (
                <div key={sw.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {sw.title}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {sw.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate max-w-md mt-0.5">
                      {sw.link}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={sw.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Test Link in New Tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleEditDownloadClick(sw)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition"
                      title="Edit Software"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${sw.title}?`)) {
                          deleteSoftware(sw.id);
                          showToast('Software deleted.');
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                      title="Delete Software"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: TESTING TOOLS ZONE (18 ITEMS) */}
      {activeTab === 'testing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit / Add Testing Tool Form */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {editingDownloadId ? <Edit2 className="w-4 h-4 text-blue-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                <span>{editingDownloadId ? 'Edit Testing Tool' : 'Add Diagnostic Tool'}</span>
              </h3>
              {editingDownloadId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingDownloadId(null);
                    setDownloadForm({
                      title: '',
                      category: 'Hardware Diagnostic',
                      link: '',
                      source: 'Google Drive',
                      description: ''
                    });
                  }}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={(e) => handleSaveDownloadItem('testing', e)} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnostic Tool Name</label>
                <input
                  type="text"
                  required
                  value={downloadForm.title}
                  onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })}
                  placeholder="e.g. Hard Disk Sentinel Pro 6.20"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnostic Category</label>
                <input
                  type="text"
                  required
                  value={downloadForm.category}
                  onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value })}
                  placeholder="Battery Diagnostic / SSD Health / Display"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Google Drive Link</label>
                <input
                  type="url"
                  required
                  value={downloadForm.link}
                  onChange={(e) => setDownloadForm({ ...downloadForm, link: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnostic Purpose</label>
                <input
                  type="text"
                  value={downloadForm.description}
                  onChange={(e) => setDownloadForm({ ...downloadForm, description: e.target.value })}
                  placeholder="e.g. Tests SSD health percentage and bad sectors"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{editingDownloadId ? 'Update Tool Link' : 'Add Diagnostic Tool'}</span>
              </button>
            </form>
          </div>

          {/* Testing Tools List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Hardware Diagnostic Tools ({testingTools.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Diagnostic utilities for testing battery, SSD health, display &amp; GPU
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto pr-1">
              {testingTools.map((tool) => (
                <div key={tool.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {tool.title}
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                        {tool.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate max-w-md mt-0.5">
                      {tool.link}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Test Link in New Tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleEditDownloadClick(tool)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition"
                      title="Edit Tool"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${tool.title}?`)) {
                          deleteTestingTool(tool.id);
                          showToast('Testing tool deleted.');
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                      title="Delete Tool"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OS & ISO ZONE (9 ITEMS) */}
      {activeTab === 'os' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {editingDownloadId ? <Edit2 className="w-4 h-4 text-blue-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                <span>{editingDownloadId ? 'Edit OS / ISO Item' : 'Add Windows ISO Link'}</span>
              </h3>
            </div>

            <form onSubmit={(e) => handleSaveDownloadItem('os', e)} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ISO / Tool Name</label>
                <input
                  type="text"
                  required
                  value={downloadForm.title}
                  onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })}
                  placeholder="e.g. Windows 11 Pro + Office 2021"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={downloadForm.category}
                  onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value })}
                  placeholder="Operating System / Boot Tool"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Download Link</label>
                <input
                  type="url"
                  required
                  value={downloadForm.link}
                  onChange={(e) => setDownloadForm({ ...downloadForm, link: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{editingDownloadId ? 'Update ISO Link' : 'Add OS ISO'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Operating Systems &amp; ISO Downloads ({osList.length})
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto pr-1">
              {osList.map((os) => (
                <div key={os.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {os.title}
                      </span>
                      <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                        {os.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate max-w-md mt-0.5">
                      {os.link}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={os.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Test Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleEditDownloadClick(os)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${os.title}?`)) {
                          deleteOsItem(os.id);
                          showToast('OS Item deleted.');
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STORE SETTINGS & CONTACT */}
      {activeTab === 'store' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              🏢 Store Identity &amp; Contact Hotlines
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Updating these fields updates your website header, WhatsApp order buttons, visiting card, and generated Blogger XML
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Store Name</label>
              <input
                type="text"
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Custom Domain</label>
              <input
                type="text"
                value={storeForm.domain}
                onChange={(e) => setStoreForm({ ...storeForm, domain: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Order Number</label>
              <input
                type="text"
                value={storeForm.whatsapp}
                onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hotline Phones (Comma separated)</label>
              <input
                type="text"
                value={storeForm.phones.join(', ')}
                onChange={(e) =>
                  setStoreForm({
                    ...storeForm,
                    phones: e.target.value.split(',').map((p) => p.trim())
                  })
                }
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Physical Location</label>
              <input
                type="text"
                value={storeForm.location}
                onChange={(e) => setStoreForm({ ...storeForm, location: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Scope</label>
              <input
                type="text"
                value={storeForm.delivery}
                onChange={(e) => setStoreForm({ ...storeForm, delivery: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Google Drive Gallery Folder Link</label>
              <input
                type="url"
                value={storeForm.galleryFolder}
                onChange={(e) => setStoreForm({ ...storeForm, galleryFolder: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Visiting Card Image URL</label>
              <input
                type="url"
                value={storeForm.visitingCardImg}
                onChange={(e) => setStoreForm({ ...storeForm, visitingCardImg: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-[11px]"
              />
            </div>
          </div>

          <button
            onClick={() => {
              updateStoreInfo(storeForm);
              showToast('Store settings and contact hotlines updated!');
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      )}

      {/* TAB 6: WARRANTY POLICIES */}
      {activeTab === 'warranty' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              🛡️ Warranty Policies &amp; Terms Customizer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Edit the 3 warranty tiers shown to customers and exported to Blogger XML
            </p>
          </div>

          <div className="space-y-4">
            {warrantyTiers.map((tier) => (
              <div key={tier.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{tier.emoji}</span>
                    <span>{tier.title}</span>
                  </div>
                  <input
                    type="text"
                    value={tier.badge}
                    onChange={(e) => updateWarrantyTier(tier.id, { badge: e.target.value })}
                    placeholder="Badge Text"
                    className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={tier.descriptionBn}
                  onChange={(e) => updateWarrantyTier(tier.id, { descriptionBn: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white leading-relaxed"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => showToast('Warranty policies updated!')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Warranty Terms</span>
          </button>
        </div>
      )}

      {/* TAB 7: BLOGGER XML GENERATOR & EXPORT */}
      {activeTab === 'xml' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-500" />
                <span>Live Dynamic Blogger Theme XML</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Auto-generates clean, responsive Blogger XML code matching your latest customized inventory, links &amp; hotlines
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyXml}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition"
              >
                {copiedXml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedXml ? 'Copied to Clipboard!' : '1-Click Copy XML'}</span>
              </button>
              <button
                onClick={handleDownloadXmlFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download .xml File</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              readOnly
              value={currentGeneratedXml}
              rows={16}
              className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none select-all"
            />
          </div>
        </div>
      )}

      {/* TAB 8: DATABASE BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              💾 Store Database Backup, Import &amp; Factory Reset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Safely backup your customized laptops and software catalog, or restore from a JSON file
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Export */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3">
                  <FileJson className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Export Full Backup</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Download all laptops, software links, diagnostic tools &amp; settings as a single .json file.
                </p>
              </div>
              <button
                onClick={handleExportJson}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup (.json)</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Import Backup File</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Restore previously exported store settings and inventory from a .json file.
                </p>
              </div>
              <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Select .json Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Factory Reset */}
            <div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">Factory Reset</h4>
                <p className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-1">
                  Reset all laptop products and software links back to default JHF factory data.
                </p>
              </div>
              <button
                onClick={handleResetDefaults}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Defaults</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
