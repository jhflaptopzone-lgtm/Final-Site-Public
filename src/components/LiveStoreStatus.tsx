import React, { useMemo } from 'react';
import { useAdminStore } from '../admin/adminStore';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../context/LanguageContext';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export const LiveStoreStatus: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { products, reconditionLaptops } = useAdminStore();
  const { laptops: storeLaptops } = useStore();
  const { language } = useTranslation();

  const texts = {
    en: {
      storeOnline: 'STORE ONLINE',
      unitsReady: (count: number) => `${count} Units Ready`,
      liveInventory: 'Live Inventory',
      inStockVerified: 'In-Stock Verified:',
      laptopsSuffix: (count: number) => `${count} Laptops`,
      hardwareTested: 'Hardware Tested • Instant Delivery',
    },
    bn: {
      storeOnline: 'স্টোর অনলাইন',
      unitsReady: (count: number) => `${count} টি ল্যাপটপ রেডি`,
      liveInventory: 'লাইভ ইনভেন্টরি',
      inStockVerified: 'স্টকে প্রস্তুত:',
      laptopsSuffix: (count: number) => `${count} টি ল্যাপটপ`,
      hardwareTested: 'হার্ডওয়্যার টেস্টেড • দ্রুত ডেলিভারি',
    },
    hi: {
      storeOnline: 'स्टोर ऑनलाइन',
      unitsReady: (count: number) => `${count} लैपटॉप तैयार`,
      liveInventory: 'लाइव इन्वेंटरी',
      inStockVerified: 'स्टॉक में सत्यापित:',
      laptopsSuffix: (count: number) => `${count} लैपटॉप`,
      hardwareTested: 'हार्डवेयर परीक्षित • त्वरित डिलीवरी',
    },
  }[language] || {
    storeOnline: 'STORE ONLINE',
    unitsReady: (count: number) => `${count} Units Ready`,
    liveInventory: 'Live Inventory',
    inStockVerified: 'In-Stock Verified:',
    laptopsSuffix: (count: number) => `${count} Laptops`,
    hardwareTested: 'Hardware Tested • Instant Delivery',
  };

  // Calculate live inventory strictly from real state
  const totalLiveUnits = useMemo(() => {
    let count = 0;
    if (products && products.length > 0) {
      products.forEach((p) => {
        if (!p.isDeleted && p.status !== 'draft' && p.status !== 'archived') {
          count += typeof p.stockQuantity === 'number' ? Math.max(0, p.stockQuantity) : 1;
        }
      });
    } else {
      count = storeLaptops.length;
    }

    if (reconditionLaptops && reconditionLaptops.length > 0) {
      const availRec = reconditionLaptops.filter(
        (r) => !r.isDeleted && r.status === 'available'
      ).length;
      count += availRec;
    }

    return count;
  }, [products, reconditionLaptops, storeLaptops]);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>{texts.storeOnline}</span>
        <span className="text-slate-400 font-normal">|</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">{texts.unitsReady(totalLiveUnits)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              {texts.storeOnline}
            </span>
            <span className="bg-blue-900/60 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-700/50">
              {texts.liveInventory}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="text-slate-300">
          {texts.inStockVerified} <strong className="text-white font-bold">{texts.laptopsSuffix(totalLiveUnits)}</strong>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>{texts.hardwareTested}</span>
        </div>
      </div>
    </div>
  );
};
