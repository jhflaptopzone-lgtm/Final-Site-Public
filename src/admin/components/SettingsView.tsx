import React, { useState } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import {
  Settings,
  Store,
  Phone,
  MessageSquare,
  MapPin,
  Save,
  Download,
  Upload,
  Database,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, exportDataAsJson } = useAdminStore();
  const { currentUser, isFirebaseLive } = useAdminAuth();

  const [businessName, setBusinessName] = useState(settings.businessName || 'JHF Laptop Zone');
  const [tagline, setTagline] = useState(settings.tagline || 'Best Laptop Buy , Sell & Accessories Importer, Traders & Suppliers');
  const [primaryWhatsApp, setPrimaryWhatsApp] = useState(settings.primaryWhatsApp || '8801935693071');
  const [secondaryPhone, setSecondaryPhone] = useState(settings.secondaryPhone || '8801731693071');
  const [mainOffice, setMainOffice] = useState(settings.mainOffice || 'Sonali Trade, Shop No : 1001 & 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka');
  const [branchOffice, setBranchOffice] = useState(settings.branchOffice || 'Baroipara Bazar, Chandra, Gazipur');
  const [shopAddress, setShopAddress] = useState(settings.location || 'Main Office: Sonali Trade, Shop No: 1001 & 1040, Multiplan, Dhaka | Branch: Baroipara Bazar, Chandra, Gazipur');
  const [storeTimings, setStoreTimings] = useState((settings as any).storeTimings || '10:00 AM - 9:00 PM (Weekly Off: Friday)');
  const [currencySymbol, setCurrencySymbol] = useState((settings as any).currencySymbol || '৳');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      tagline,
      primaryWhatsApp,
      secondaryPhone,
      mainOffice,
      branchOffice,
      location: shopAddress,
      deliveryTimeDhaka: settings.deliveryTimeDhaka,
      deliveryTimeOutside: settings.deliveryTimeOutside,
      defaultWarranty: settings.defaultWarranty,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Store Configuration &amp; Backup Operations</span>
          </h1>
          <p className="text-xs text-slate-400">
            Control shop address, WhatsApp support routing, warranty notices, and database backups.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-400" />
          <span>Business Identity &amp; Physical Store Details</span>
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          These details are displayed on official printed invoices and customer WhatsApp receipts.
        </p>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company / Store Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Business Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Primary WhatsApp Number (with country code) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={primaryWhatsApp}
                  onChange={(e) => setPrimaryWhatsApp(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono"
                />
                <MessageSquare className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Secondary Hotline</label>
              <div className="relative">
                <input
                  type="text"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono"
                />
                <Phone className="w-4 h-4 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Main Office (Multiplan, Dhaka) *</label>
              <input
                type="text"
                required
                value={mainOffice}
                onChange={(e) => setMainOffice(e.target.value)}
                placeholder="Sonali Trade, Shop No : 1001 & 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Branch Office (Gazipur) *</label>
              <input
                type="text"
                required
                value={branchOffice}
                onChange={(e) => setBranchOffice(e.target.value)}
                placeholder="Baroipara Bazar, Chandra, Gazipur"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Combined Store Location / Notice *</label>
            <input
              type="text"
              required
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Operating Hours</label>
              <input
                type="text"
                value={storeTimings}
                onChange={(e) => setStoreTimings(e.target.value)}
                placeholder="10:00 AM - 9:00 PM (Weekly Off: Friday)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl shadow transition flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Settings Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Database Backup & Disaster Recovery */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Disaster Recovery &amp; System Backup</span>
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Export full JSON snapshots of products, inventory ledger, orders, and customer CRM records.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => exportDataAsJson('products')}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold p-3 rounded-xl border border-slate-700 flex items-center justify-between transition"
          >
            <span>Backup Laptop Catalog</span>
            <Download className="w-4 h-4 text-blue-400" />
          </button>

          <button
            onClick={() => exportDataAsJson('orders')}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold p-3 rounded-xl border border-slate-700 flex items-center justify-between transition"
          >
            <span>Backup Orders &amp; Invoices</span>
            <Download className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => exportDataAsJson('customers')}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold p-3 rounded-xl border border-slate-700 flex items-center justify-between transition"
          >
            <span>Backup Customer CRM</span>
            <Download className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>

    </div>
  );
};
