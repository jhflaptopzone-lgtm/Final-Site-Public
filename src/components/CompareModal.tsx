import React from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useTranslation } from '../context/LanguageContext';
import {
  X,
  Scale,
  Trash2,
  ShoppingBag,
  Eye,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface CompareModalProps {
  onOpenOrder: (laptop: any) => void;
  onOpenSpecs: (laptop: any) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ onOpenOrder, onOpenSpecs }) => {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    isCompareModalOpen,
    setIsCompareModalOpen,
  } = useCustomer();
  const { formatPrice, currency, language } = useTranslation();

  const texts = {
    en: {
      title: 'Compare Laptops Side-by-Side',
      selected: (n: number) => `${n}/3 Selected`,
      subtitle: 'Detailed side-by-side hardware analysis & specifications comparison',
      clearAll: 'Clear All',
      emptyTitle: 'No Laptops in Comparison List',
      emptyDesc: 'Browse our laptop catalog or recondition zone and click "Compare" on up to 3 models to inspect side-by-side.',
      browseBtn: 'Browse Laptop Catalog',
      productOverview: 'Product Overview',
      specsBtn: 'Specs',
      orderBtn: 'Order',
      thBrandSeries: 'Brand & Series',
      thPrice: 'Price',
      thCondition: 'Condition',
      thFullSpecs: 'Full Specs',
      thBatteryHealth: 'Battery & Health',
      thWarranty: 'Warranty Support',
      defaultWarranty: '30 Days Replacement + 5 Years Service',
      defaultBattery: 'Tested 4-5 Hours Original Backup',
      defaultCondition: 'Dubai Grade A++',
      defaultSeries: 'Business Series',
    },
    bn: {
      title: 'ল্যাপটপ পাশাপাশি তুলনা করুন',
      selected: (n: number) => `${n}/৩ টি নির্বাচিত`,
      subtitle: 'পাশাপাশি বিস্তারিত হার্ডওয়্যার বিশ্লেষণ ও স্পেসিফিকেশন তুলনা',
      clearAll: 'সব মুছুন',
      emptyTitle: 'তুলনা তালিকায় কোনো ল্যাপটপ নেই',
      emptyDesc: 'ল্যাপটপ ক্যাটালগ অথবা রিকন্ডিশন জোন থেকে সর্বোচ্চ ৩টি মডেল নির্বাচন করে পাশাপাশি তুলনা করুন।',
      browseBtn: 'ল্যাপটপ ক্যাটালগ দেখুন',
      productOverview: 'পণ্যের বিবরণ',
      specsBtn: 'স্পেক্স',
      orderBtn: 'অর্ডার',
      thBrandSeries: 'ব্র্যান্ড ও সিরিজ',
      thPrice: 'মূল্য',
      thCondition: 'কন্ডিশন',
      thFullSpecs: 'সম্পূর্ণ স্পেক্স',
      thBatteryHealth: 'ব্যাটারি ও হেলথ',
      thWarranty: 'ওয়ারেন্টি সুবিধা',
      defaultWarranty: '৩০ দিন রিপ্লেসমেন্ট + ৫ বছর সার্ভিস',
      defaultBattery: 'টেস্টেড ৪-৫ ঘণ্টা আসল ব্যাকআপ',
      defaultCondition: 'দুবাই গ্রেড A++',
      defaultSeries: 'বিজনেস সিরিজ',
    },
    hi: {
      title: 'लैपटॉप की साथ-साथ तुलना करें',
      selected: (n: number) => `${n}/३ चयनित`,
      subtitle: 'हार्डवेयर विश्लेषण और विनिर्देशों की विस्तृत तुलना',
      clearAll: 'सभी हटाएं',
      emptyTitle: 'तुलना सूची में कोई लैपटॉप नहीं है',
      emptyDesc: 'कैटलॉग या रिकंडीशन ज़ोन से अधिकतम ३ मॉडल चुनकर उनकी साथ-साथ तुलना करें।',
      browseBtn: 'लैपटॉप कैटलॉग देखें',
      productOverview: 'उत्पाद विवरण',
      specsBtn: 'विवरण',
      orderBtn: 'ऑर्डर',
      thBrandSeries: 'ब्रांड और सीरीज़',
      thPrice: 'कीमत',
      thCondition: 'कंडीशन',
      thFullSpecs: 'पूर्ण विवरण',
      thBatteryHealth: 'बैटरी व स्वास्थ्य',
      thWarranty: 'वारंटी सहायता',
      defaultWarranty: '३० दिन रिप्लेसमेंट + ५ वर्ष सर्विस',
      defaultBattery: 'परीक्षित ४-५ घंटे मूल बैकअप',
      defaultCondition: 'दुबई ग्रेड A++',
      defaultSeries: 'बिजनेस सीरीज़',
    },
  }[language] || {
    title: 'Compare Laptops Side-by-Side',
    selected: (n: number) => `${n}/3 Selected`,
    subtitle: 'Detailed side-by-side hardware analysis & specifications comparison',
    clearAll: 'Clear All',
    emptyTitle: 'No Laptops in Comparison List',
    emptyDesc: 'Browse our laptop catalog or recondition zone and click "Compare" on up to 3 models to inspect side-by-side.',
    browseBtn: 'Browse Laptop Catalog',
    productOverview: 'Product Overview',
    specsBtn: 'Specs',
    orderBtn: 'Order',
    thBrandSeries: 'Brand & Series',
    thPrice: 'Price',
    thCondition: 'Condition',
    thFullSpecs: 'Full Specs',
    thBatteryHealth: 'Battery & Health',
    thWarranty: 'Warranty Support',
    defaultWarranty: '30 Days Replacement + 5 Years Service',
    defaultBattery: 'Tested 4-5 Hours Original Backup',
    defaultCondition: 'Dubai Grade A++',
    defaultSeries: 'Business Series',
  };

  const getItemPrice = (item: any) => {
    const numeric =
      typeof item.numericPrice === 'number'
        ? item.numericPrice
        : parseInt(String(item.price || '').replace(/[^0-9]/g, ''), 10) || 0;
    if (numeric > 0) {
      return formatPrice(numeric);
    }
    return item.price;
  };

  if (!isCompareModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {texts.title}
                </h3>
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {texts.selected(compareList.length)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {texts.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-rose-600 hover:text-rose-500 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{texts.clearAll}</span>
              </button>
            )}
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto overflow-x-auto">
          {compareList.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <Scale className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {texts.emptyTitle}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {texts.emptyDesc}
              </p>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                {texts.browseBtn}
              </button>
            </div>
          ) : (
            <div className="min-w-[650px]">
              {/* Cards row */}
              <div className="grid grid-cols-4 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center">
                  {texts.productOverview}
                </div>
                {compareList.map((item) => (
                  <div key={item.id} className="relative bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 flex flex-col">
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white flex items-center justify-center transition"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'}
                      alt={item.title || item.name}
                      className="w-full h-28 object-cover rounded-xl mb-2"
                    />

                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                      {item.brand}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                      {item.title || item.name}
                    </h4>
                    <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                      {getItemPrice(item)}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setIsCompareModalOpen(false);
                          onOpenSpecs(item);
                        }}
                        className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{texts.specsBtn}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsCompareModalOpen(false);
                          onOpenOrder(item);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>{texts.orderBtn}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specs Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* Brand */}
                <div className="grid grid-cols-4 py-3 items-center">
                  <div className="font-bold text-slate-500 dark:text-slate-400">{texts.thBrandSeries}</div>
                  {compareList.map((item) => (
                    <div key={item.id} className="font-semibold text-slate-900 dark:text-white px-2">
                      {item.brand} • {item.series || item.model || texts.defaultSeries}
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="grid grid-cols-4 py-3 items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="font-bold text-slate-500 dark:text-slate-400">{texts.thPrice} ({currency})</div>
                  {compareList.map((item) => (
                    <div key={item.id} className="font-black text-blue-600 dark:text-blue-400 px-2 text-sm">
                      {getItemPrice(item)}
                    </div>
                  ))}
                </div>

                {/* Condition */}
                <div className="grid grid-cols-4 py-3 items-center">
                  <div className="font-bold text-slate-500 dark:text-slate-400">{texts.thCondition}</div>
                  {compareList.map((item) => (
                    <div key={item.id} className="px-2">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.tag || item.physicalCondition || texts.defaultCondition}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Hardware Specs */}
                <div className="grid grid-cols-4 py-3 items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="font-bold text-slate-500 dark:text-slate-400">{texts.thFullSpecs}</div>
                  {compareList.map((item) => (
                    <div key={item.id} className="text-slate-700 dark:text-slate-300 px-2 leading-relaxed text-[11px]">
                      {item.specs || `${item.processor || ''} • ${item.ram || ''} • ${item.storage || ''}`}
                    </div>
                  ))}
                </div>

                {/* Battery & Health */}
                <div className="grid grid-cols-4 py-3 items-center">
                  <div className="font-bold text-slate-500 dark:text-slate-400">{texts.thBatteryHealth}</div>
                  {compareList.map((item) => (
                    <div key={item.id} className="text-slate-700 dark:text-slate-300 px-2 text-[11px]">
                      {item.batteryBackup || item.batteryCondition || texts.defaultBattery}
                    </div>
                  ))}
                </div>

                {/* Warranty */}
                <div className="grid grid-cols-4 py-3 items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="font-bold text-slate-500 dark:text-slate-400">{texts.thWarranty}</div>
                  {compareList.map((item) => (
                    <div key={item.id} className="text-slate-700 dark:text-slate-300 px-2 text-[11px] font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>{item.warranty || texts.defaultWarranty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
