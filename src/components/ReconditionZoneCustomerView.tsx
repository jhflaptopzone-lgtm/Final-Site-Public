import React, { useState } from 'react';
import { useAdminStore, BUSINESS_INFO } from '../admin/adminStore';
import { useStore } from '../context/StoreContext';
import { useCustomer } from '../context/CustomerContext';
import { useTranslation } from '../context/LanguageContext';
import { ReconditionLaptop } from '../admin/types';
import { CustomerOrderModal } from './CustomerOrderModal';
import { ReviewsAndRatingModal } from './ReviewsAndRatingModal';
import {
  Laptop,
  Search,
  CheckCircle2,
  ShieldCheck,
  Battery,
  Cpu,
  HardDrive,
  Monitor,
  PhoneCall,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  Truck,
  ArrowRight,
  Info,
  X,
  Layers,
  Award,
  Clock,
  Gift,
  Scale,
  Heart,
  Star,
  Check,
} from 'lucide-react';

export const ReconditionZoneCustomerView: React.FC = () => {
  const { reconditionLaptops } = useAdminStore();
  const { storeInfo } = useStore();
  const { formatPrice, currency, language } = useTranslation();
  const {
    favorites,
    toggleFavorite,
    isFavorite,
    addToCompare,
    isComparing,
    getAverageRating,
  } = useCustomer();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedLaptopForDetails, setSelectedLaptopForDetails] = useState<ReconditionLaptop | null>(null);
  const [orderModalLaptop, setOrderModalLaptop] = useState<ReconditionLaptop | null>(null);
  const [reviewModalTarget, setReviewModalTarget] = useState<{ id: string; name: string } | null>(null);

  const texts = {
    en: {
      hubBadge: 'JHF Recondition Zone • Pre-Owned Laptop Hub',
      heroHeadingPrefix: 'Directly imported from Dubai & Singapore ',
      heroHeadingGrad: 'A+ Grade 100% Original',
      heroHeadingSuffix: ' Laptops',
      heroDesc: '100% motherboard-tested business-class laptops without repairs. Every laptop comes with a 15-day replacement guarantee, 2-year free service warranty, original charger, and premium free gift box.',
      pillar1Title: '15 Days Replacement',
      pillar1Sub: '2 Years Free Service',
      pillar2Title: '3-5 Hours Battery',
      pillar2Sub: 'Health Verified',
      pillar3Title: '64 Districts Delivery',
      pillar3Sub: 'Courier Condition',
      pillar4Title: 'Free Gift Pack',
      pillar4Sub: 'Bag, Mouse, Charger',
      allBrands: 'All Brands',
      allConditions: 'All Condition Grades',
      conditionAplus: 'A+ Grade (Mint Condition)',
      conditionA: 'A Grade',
      searchPlaceholder: 'Search model, core i5, ThinkPad...',
      emptyTitle: 'No reconditioned laptops found',
      emptyDesc: 'Contact us directly for inventory of your preferred brand or model.',
      whatsappStock: 'Check Stock on WhatsApp (01935-693071)',
      testedAplus: 'Tested A+',
      certified: 'Certified',
      guarantee15d: '15 Days Guarantee',
      freeGifts: 'Free Gifts',
      offerPrice: 'Special Offer Price',
      save: 'Save',
      detailsBtn: 'Full Details',
      similarBtn: 'Inquire Similar',
      orderNow: 'Order Now',
      soldOut: 'Sold Out',
      whatsappInquiry: 'WhatsApp Inquiry',
      specsTitle: 'Hardware Configuration Specifications:',
      conditionReportTitle: 'Physical Condition & Testing Report:',
      defaultConditionReport: '100% fresh original condition. No scratches or dents. Keyboard, display, USB ports, and motherboard fully verified.',
      freeAccessoriesTitle: 'Included Free Accessories:',
      defaultAccessories: ['Original Charger', 'Power Cord', 'Laptop Bag', 'Mouse'],
      warrantyPolicyTitle: 'Warranty Policy:',
      defaultWarranty: '15 Days parts replacement and 2 Years free service warranty.',
      sellingPrice: 'Selling Price',
      inStock: 'In Stock',
      inCompareTitle: 'In Compare',
      addToCompareTitle: 'Add to Compare',
      saveToFavorites: 'Save to Favorites',
      certifiedPreOwned: 'Certified Pre-Owned',
      stockCodeLabel: 'Stock Code',
      serialLabel: 'Serial',
      specProcessor: 'Processor',
      specRam: 'RAM',
      specStorage: 'Storage',
      specDisplay: 'Display',
      specGraphics: 'Graphics',
      specBattery: 'Battery Backup',
      waSoldOutMsg: (title: string) => `Hello JHF Laptop Zone, I noticed ${title} is sold out. Do you have similar laptops available?`,
      waInquiryMsg: (title: string, code: string, price: string) => `Hello JHF Laptop Zone, I want to inquire about: ${title} (${code}) - Price: ${price}`,
    },
    bn: {
      hubBadge: 'জেএইচএফ রিকন্ডিশন জোন • প্রি-ওউনড ল্যাপটপ হাব',
      heroHeadingPrefix: 'দুবাই ও সিঙ্গাপুর থেকে সরাসরি আমদানিকৃত ',
      heroHeadingGrad: 'A+ গ্রেড ১০০% অরিজিনাল',
      heroHeadingSuffix: ' ল্যাপটপ',
      heroDesc: 'কোনোরকম রিপেয়ারিং ছাড়া ১০০% মাদারবোর্ড টেস্টেড বিজনেস ক্লাস ল্যাপটপ। প্রতিটি ল্যাপটপের সাথে থাকছে ১৫ দিনের রিপ্লেসমেন্ট গ্যারান্টি, ২ বছরের ফ্রি সার্ভিস ওয়ারেন্টি, অরিজিনাল চার্জার এবং আকর্ষণীয় ফ্রি গিফট বক্স।',
      pillar1Title: '১৫ দিন রিপ্লেসমেন্ট',
      pillar1Sub: '২ বছর ফ্রি সার্ভিস',
      pillar2Title: '৩-৫ ঘণ্টা ব্যাটারি',
      pillar2Sub: 'হেলথ ভেরিফাইড',
      pillar3Title: '৬৪ জেলায় ডেলিভারি',
      pillar3Sub: 'কুরিয়ার কন্ডিশন',
      pillar4Title: 'ফ্রি গিফট প্যাক',
      pillar4Sub: 'ব্যাগ, মাউস, চার্জার',
      allBrands: 'সকল ব্র্যান্ড',
      allConditions: 'সকল কন্ডিশন গ্রেড',
      conditionAplus: 'A+ গ্রেড (মিন্ট কন্ডিশন)',
      conditionA: 'A গ্রেড',
      searchPlaceholder: 'মডেল, কোর আই৫, থিংকপ্যাড খুঁজুন...',
      emptyTitle: 'কোনো রিকন্ডিশন ল্যাপটপ পাওয়া যায়নি',
      emptyDesc: 'আপনার পছন্দের ব্র্যান্ড বা মডেলের স্টকের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।',
      whatsappStock: 'WhatsApp-এ স্টক জানুন (01935-693071)',
      testedAplus: 'টেস্টেড A+',
      certified: 'ভেরিফাইড',
      guarantee15d: '১৫ দিন গ্যারান্টি',
      freeGifts: 'ফ্রি গিফট',
      offerPrice: 'বিশেষ অফার মূল্য',
      save: 'সেভ',
      detailsBtn: 'বিস্তারিত দেখুন',
      similarBtn: 'অনুরূপ চান',
      orderNow: 'অর্ডার করুন',
      soldOut: 'স্টক শেষ',
      whatsappInquiry: 'WhatsApp ইনকোয়ারি',
      specsTitle: 'হার্ডওয়্যার কনফিগারেশন স্পেসিফিকেশন:',
      conditionReportTitle: 'শারীরিক কন্ডিশন ও টেস্টিং রিপোর্ট:',
      defaultConditionReport: '১০০% ফ্রেশ অরিজিনাল কন্ডিশন। কোনো দাগ বা ডেন্ট নেই। কিবোর্ড, ডিসপ্লে, ইউএসবি পোর্ট এবং মাদারবোর্ড ফুল ভেরিফাইড।',
      freeAccessoriesTitle: 'ফ্রি অ্যাক্সেসরিজ যা সাথে পাবেন:',
      defaultAccessories: ['অরিজিনাল চার্জার', 'পাওয়ার কর্ড', 'ল্যাপটপ ব্যাগ', 'মাউস'],
      warrantyPolicyTitle: 'ওয়ারেন্টি পলিসি:',
      defaultWarranty: '১৫ দিনের পার্টস রিপ্লেসমেন্ট এবং ২ বছরের ফ্রি সার্ভিস ওয়ারেন্টি।',
      sellingPrice: 'বিক্রয় মূল্য',
      inStock: 'স্টকে আছে',
      inCompareTitle: 'তুলনা তালিকায় যুক্ত',
      addToCompareTitle: 'তুলনা তালিকায় যোগ করুন',
      saveToFavorites: 'পছন্দের তালিকায় রাখুন',
      certifiedPreOwned: 'ভেরিফাইড প্রি-ওউনড',
      stockCodeLabel: 'স্টক কোড',
      serialLabel: 'সিরিয়াল',
      specProcessor: 'প্রসেসর',
      specRam: 'র‍্যাম',
      specStorage: 'স্টোরেজ',
      specDisplay: 'ডিসপ্লে',
      specGraphics: 'গ্রাফিক্স',
      specBattery: 'ব্যাটারি ব্যাকআপ',
      waSoldOutMsg: (title: string) => `আসসালামু আলাইকুম JHF Laptop Zone, আমি লক্ষ্য করলাম ${title} স্টক শেষ। এই ধরনের অনুরূপ ল্যাপটপ স্টকে আছে কি?`,
      waInquiryMsg: (title: string, code: string, price: string) => `আসসালামু আলাইকুম JHF Laptop Zone, আমি এই ল্যাপটপটি সম্পর্কে জানতে চাই: ${title} (${code}) - মূল্য: ${price}`,
    },
    hi: {
      hubBadge: 'जेएचएफ रिकंडीशन ज़ोन • प्री-ओन्ड लैपटॉप हब',
      heroHeadingPrefix: 'दुबई और सिंगापुर से सीधे आयातित ',
      heroHeadingGrad: 'A+ ग्रेड १००% असली',
      heroHeadingSuffix: ' लैपटॉप',
      heroDesc: 'बिना किसी मरम्मत के १००% मदरबोर्ड परीक्षित बिजनेस क्लास लैपटॉप। प्रत्येक लैपटॉप के साथ १५ दिन रिप्लेसमेंट गारंटी, २ वर्ष निःशुल्क सर्विस वारंटी, मूल चार्जर और आकर्षक मुफ्त उपहार पैक शामिल है।',
      pillar1Title: '१५ दिन रिप्लेसमेंट',
      pillar1Sub: '२ वर्ष फ्री सर्विस',
      pillar2Title: '३-५ घंटे बैटरी',
      pillar2Sub: 'स्वास्थ्य सत्यापित',
      pillar3Title: '६४ जिलों में डिलीवरी',
      pillar3Sub: 'कूरियर कंडीशन',
      pillar4Title: 'फ्री गिफ्ट पैक',
      pillar4Sub: 'बैग, माउस, चार्जर',
      allBrands: 'सभी ब्रांड्स',
      allConditions: 'सभी कंडीशन ग्रेड',
      conditionAplus: 'A+ ग्रेड (एकदम नया जैसा)',
      conditionA: 'A ग्रेड',
      searchPlaceholder: 'मॉडल, कोर i5, थिंकपैड खोजें...',
      emptyTitle: 'कोई रिकंडीशन लैपटॉप नहीं मिला',
      emptyDesc: 'अपने पसंदीदा ब्रांड या मॉडल के स्टॉक के लिए हमसे सीधे संपर्क करें।',
      whatsappStock: 'व्हाट्सएप पर स्टॉक जांचें (01935-693071)',
      testedAplus: 'परीक्षित A+',
      certified: 'प्रमाणित',
      guarantee15d: '१५ दिन गारंटी',
      freeGifts: 'मुफ्त उपहार',
      offerPrice: 'विशेष ऑफर मूल्य',
      save: 'बचत',
      detailsBtn: 'विवरण देखें',
      similarBtn: 'समान लैपटॉप खोजें',
      orderNow: 'ऑर्डर करें',
      soldOut: 'बिक गया',
      whatsappInquiry: 'व्हाट्सएप पूछताछ',
      specsTitle: 'हार्डवेयर कॉन्फ़िगरेशन विवरण:',
      conditionReportTitle: 'शारीरिक स्थिति और परीक्षण रिपोर्ट:',
      defaultConditionReport: '१००% फ्रेश असली स्थिति। कोई खरोंच या डेंट नहीं। कीबोर्ड, डिस्प्ले, यूएसबी पोर्ट और मदरबोर्ड पूरी तरह से परीक्षित।',
      freeAccessoriesTitle: 'शामिल मुफ्त उपकरण:',
      defaultAccessories: ['मूल चार्जर', 'पावर कॉर्ड', 'लैपटॉप बैग', 'माउस'],
      warrantyPolicyTitle: 'वारंटी नीति:',
      defaultWarranty: '१५ दिन पार्ट्स रिप्लेसमेंट और २ वर्ष निःशुल्क सर्विस वारंटी।',
      sellingPrice: 'बिक्री मूल्य',
      inStock: 'स्टॉक में उपलब्ध',
      inCompareTitle: 'तुलना सूची में शामिल',
      addToCompareTitle: 'तुलना में जोड़ें',
      saveToFavorites: 'पसंदीदा में सहेजें',
      certifiedPreOwned: 'प्रमाणित प्री-ओन्ड',
      stockCodeLabel: 'स्टॉक कोड',
      serialLabel: 'सीरियल',
      specProcessor: 'प्रोसेसर',
      specRam: 'रैम',
      specStorage: 'स्टोरेज',
      specDisplay: 'डिस्प्ले',
      specGraphics: 'ग्राफ़िक्स',
      specBattery: 'बैटरी बैकअप',
      waSoldOutMsg: (title: string) => `नमस्ते JHF Laptop Zone, मैंने देखा कि ${title} बिक चुका है। क्या आपके पास समान लैपटॉप उपलब्ध हैं?`,
      waInquiryMsg: (title: string, code: string, price: string) => `नमस्ते JHF Laptop Zone, मैं इस लैपटॉप के बारे में पूछताछ करना चाहता हूँ: ${title} (${code}) - मूल्य: ${price}`,
    },
  }[language] || {
    hubBadge: 'JHF Recondition Zone • Pre-Owned Laptop Hub',
    heroHeadingPrefix: 'Directly imported from Dubai & Singapore ',
    heroHeadingGrad: 'A+ Grade 100% Original',
    heroHeadingSuffix: ' Laptops',
    heroDesc: '100% motherboard-tested business-class laptops without repairs. Every laptop comes with a 15-day replacement guarantee, 2-year free service warranty, original charger, and premium free gift box.',
    pillar1Title: '15 Days Replacement',
    pillar1Sub: '2 Years Free Service',
    pillar2Title: '3-5 Hours Battery',
    pillar2Sub: 'Health Verified',
    pillar3Title: '64 Districts Delivery',
    pillar3Sub: 'Courier Condition',
    pillar4Title: 'Free Gift Pack',
    pillar4Sub: 'Bag, Mouse, Charger',
    allBrands: 'All Brands',
    allConditions: 'All Condition Grades',
    conditionAplus: 'A+ Grade (Mint Condition)',
    conditionA: 'A Grade',
    searchPlaceholder: 'Search model, core i5, ThinkPad...',
    emptyTitle: 'No reconditioned laptops found',
    emptyDesc: 'Contact us directly for inventory of your preferred brand or model.',
    whatsappStock: 'Check Stock on WhatsApp (01935-693071)',
    testedAplus: 'Tested A+',
    certified: 'Certified',
    guarantee15d: '15 Days Guarantee',
    freeGifts: 'Free Gifts',
    offerPrice: 'Special Offer Price',
    save: 'Save',
    detailsBtn: 'Full Details',
    similarBtn: 'Inquire Similar',
    orderNow: 'Order Now',
    soldOut: 'Sold Out',
    whatsappInquiry: 'WhatsApp Inquiry',
    specsTitle: 'Hardware Configuration Specifications:',
    conditionReportTitle: 'Physical Condition & Testing Report:',
    defaultConditionReport: '100% fresh original condition. No scratches or dents. Keyboard, display, USB ports, and motherboard fully verified.',
    freeAccessoriesTitle: 'Included Free Accessories:',
    defaultAccessories: ['Original Charger', 'Power Cord', 'Laptop Bag', 'Mouse'],
    warrantyPolicyTitle: 'Warranty Policy:',
    defaultWarranty: '15 Days parts replacement and 2 Years free service warranty.',
    sellingPrice: 'Selling Price',
    inStock: 'In Stock',
    inCompareTitle: 'In Compare',
    addToCompareTitle: 'Add to Compare',
    saveToFavorites: 'Save to Favorites',
    certifiedPreOwned: 'Certified Pre-Owned',
    stockCodeLabel: 'Stock Code',
    serialLabel: 'Serial',
    specProcessor: 'Processor',
    specRam: 'RAM',
    specStorage: 'Storage',
    specDisplay: 'Display',
    specGraphics: 'Graphics',
    specBattery: 'Battery Backup',
    waSoldOutMsg: (title: string) => `Hello JHF Laptop Zone, I noticed ${title} is sold out. Do you have similar laptops available?`,
    waInquiryMsg: (title: string, code: string, price: string) => `Hello JHF Laptop Zone, I want to inquire about: ${title} (${code}) - Price: ${price}`,
  };

  // Brands
  const brands = Array.from(new Set(reconditionLaptops.map((l) => l.brand))).filter(Boolean) as string[];

  // Filtered laptops (Public sees all non-deleted and non-trashed, with available shown first)
  const filteredLaptops = reconditionLaptops
    .filter((laptop) => {
      // Don't show soft deleted or trashed laptops on public view
      if ((laptop as any).isDeleted) return false;
      if (laptop.status === 'trash') return false;
      if (selectedBrand !== 'all' && laptop.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      if (selectedCondition !== 'all' && !laptop.physicalCondition.toLowerCase().includes(selectedCondition.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          laptop.title.toLowerCase().includes(q) ||
          laptop.model.toLowerCase().includes(q) ||
          laptop.processor.toLowerCase().includes(q) ||
          laptop.brand.toLowerCase().includes(q) ||
          (laptop.code || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Available first, then sold
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (a.status !== 'available' && b.status === 'available') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <section id="jhf-recondition-zone" className="space-y-8 font-sans scroll-mt-20">
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/70 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{texts.hubBadge}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {texts.heroHeadingPrefix}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {texts.heroHeadingGrad}
            </span>
            {texts.heroHeadingSuffix}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            {texts.heroDesc}
          </p>

          {/* Key Trust Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 text-xs">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">{texts.pillar1Title}</span>
                <span className="text-[10px] text-slate-400">{texts.pillar1Sub}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex items-center gap-2.5">
              <Battery className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">{texts.pillar2Title}</span>
                <span className="text-[10px] text-slate-400">{texts.pillar2Sub}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">{texts.pillar3Title}</span>
                <span className="text-[10px] text-slate-400">{texts.pillar3Sub}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex items-center gap-2.5">
              <Gift className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">{texts.pillar4Title}</span>
                <span className="text-[10px] text-slate-400">{texts.pillar4Sub}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Brand Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setSelectedBrand('all')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
              selectedBrand === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {texts.allBrands} ({reconditionLaptops.length})
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                selectedBrand.toLowerCase() === b.toLowerCase()
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Condition Filter & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none"
          >
            <option value="all">{texts.allConditions}</option>
            <option value="A+ Grade">{texts.conditionAplus}</option>
            <option value="A Grade">{texts.conditionA}</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={texts.searchPlaceholder}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

      </div>

      {/* Laptop Cards Grid */}
      {filteredLaptops.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          <Laptop className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{texts.emptyTitle}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            {texts.emptyDesc}
          </p>
          <a
            href={`https://wa.me/${storeInfo.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{texts.whatsappStock}</span>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLaptops.map((laptop) => {
            const isSold = laptop.status === 'sold';
            const price = laptop.offerPrice || laptop.sellPrice;
            const hasDiscount = laptop.offerPrice && laptop.offerPrice < laptop.sellPrice;
            const savings = hasDiscount ? laptop.sellPrice - laptop.offerPrice : 0;

            return (
              <div
                key={laptop.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition duration-200 flex flex-col justify-between ${
                  isSold
                    ? 'border-slate-300 dark:border-slate-800 opacity-80'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50'
                }`}
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative h-52 bg-slate-100 dark:bg-slate-950 overflow-hidden group">
                    <img
                      src={laptop.images?.[0] || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80'}
                      alt={laptop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                        {laptop.physicalCondition}
                      </span>
                      {laptop.code && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-900/80 backdrop-blur-md text-slate-300">
                          {laptop.code}
                        </span>
                      )}
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {/* Compare Button */}
                      <button
                        onClick={() =>
                          addToCompare({
                            id: laptop.id,
                            title: laptop.title,
                            brand: laptop.brand,
                            series: laptop.model,
                            price: formatPrice(laptop.offerPrice || laptop.sellPrice),
                            specs: `${laptop.processor} • ${laptop.ram} • ${laptop.storage}`,
                            image: laptop.images?.[0],
                            warranty: laptop.warranty,
                            physicalCondition: laptop.physicalCondition,
                            batteryBackup: laptop.batteryBackup,
                          })
                        }
                        className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow transition ${
                          isComparing(laptop.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900/70 text-slate-200 hover:text-white hover:bg-slate-900'
                        }`}
                        title={isComparing(laptop.id) ? texts.inCompareTitle : texts.addToCompareTitle}
                      >
                        {isComparing(laptop.id) ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
                      </button>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleFavorite(laptop.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow transition ${
                          isFavorite(laptop.id)
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-900/70 text-slate-200 hover:text-white hover:bg-slate-900'
                        }`}
                        title={texts.saveToFavorites}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite(laptop.id) ? 'fill-white' : ''}`} />
                      </button>

                      {isSold ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                          {texts.soldOut}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          {texts.inStock}
                        </span>
                      )}
                    </div>

                    {/* Battery Indicator pill at bottom */}
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Battery className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold">{laptop.batteryBackup}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">{texts.testedAplus}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    {/* Brand, Model Title & Rating */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                          {laptop.brand} {texts.certified}
                        </span>
                        {/* Star Rating button */}
                        <button
                          onClick={() => setReviewModalTarget({ id: laptop.id, name: laptop.title })}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-600 transition"
                          title="View / Write Review"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{getAverageRating(laptop.id).rating}</span>
                          <span className="text-slate-400 font-normal text-[10px]">
                            ({getAverageRating(laptop.id).count})
                          </span>
                        </button>
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2 mt-0.5">
                        {laptop.title}
                      </h3>
                    </div>

                    {/* Spec Highlights Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 truncate">
                        <Cpu className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{laptop.processor}</span>
                      </div>

                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 truncate">
                        <HardDrive className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{laptop.ram} • {laptop.storage}</span>
                      </div>

                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 truncate">
                        <Monitor className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="truncate">{laptop.display}</span>
                      </div>

                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{texts.guarantee15d}</span>
                      </div>
                    </div>

                    {/* Included Gifts */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">
                        {texts.freeGifts}: {(laptop.includedAccessories || texts.defaultAccessories).join(', ')}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Pricing & CTA Buttons */}
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 space-y-3">
                  
                  {/* Price Tag */}
                  <div className="flex items-baseline justify-between pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {texts.offerPrice} {currency !== 'BDT' && <span className="text-amber-500 font-mono">({currency})</span>}
                      </span>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          {formatPrice(price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through font-semibold">
                            {formatPrice(laptop.sellPrice)}
                          </span>
                        )}
                        {currency !== 'BDT' && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            (৳{price.toLocaleString()} BDT)
                          </span>
                        )}
                      </div>
                    </div>

                    {hasDiscount && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        {texts.save} {formatPrice(savings)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedLaptopForDetails(laptop)}
                      className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{texts.detailsBtn}</span>
                    </button>

                    {isSold ? (
                      <a
                        href={`https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(
                          texts.waSoldOutMsg(laptop.title)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-slate-800 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{texts.similarBtn}</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => setOrderModalLaptop(laptop)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-2.5 rounded-xl shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{texts.orderNow}</span>
                      </button>
                    )}
                  </div>

                  {/* Quick WhatsApp & Call Bar */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <a
                      href={`https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(
                        texts.waInquiryMsg(laptop.title, laptop.code || '', formatPrice(price))
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{texts.whatsappInquiry}</span>
                    </a>

                    <a
                      href={`tel:${storeInfo.phones[0] ? storeInfo.phones[0].replace('-', '') : '01935693071'}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>01935-693071</span>
                    </a>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Full Specs & Condition Inspection Report */}
      {selectedLaptopForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 relative text-slate-800 dark:text-slate-200">
            <button
              onClick={() => setSelectedLaptopForDetails(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block mb-1.5">
                {selectedLaptopForDetails.physicalCondition} • {texts.certifiedPreOwned}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                {selectedLaptopForDetails.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {texts.stockCodeLabel}: <strong>{selectedLaptopForDetails.code}</strong> {selectedLaptopForDetails.serialNumber && `• ${texts.serialLabel}: ${selectedLaptopForDetails.serialNumber}`}
              </p>
            </div>

            {/* Photo */}
            <div className="h-64 rounded-2xl overflow-hidden mb-5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <img
                src={selectedLaptopForDetails.images?.[0] || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80'}
                alt={selectedLaptopForDetails.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Complete Hardware Specs Table */}
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{texts.specsTitle}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">{texts.specProcessor}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLaptopForDetails.processor}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">{texts.specRam}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLaptopForDetails.ram}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">{texts.specStorage}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLaptopForDetails.storage}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">{texts.specDisplay}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLaptopForDetails.display}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">{texts.specGraphics}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLaptopForDetails.graphics}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">{texts.specBattery}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLaptopForDetails.batteryBackup}</span>
                </div>
              </div>

              {/* Condition Note */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                  {texts.conditionReportTitle}
                </span>
                <p className="text-emerald-900/80 dark:text-emerald-200/90 leading-relaxed">
                  {selectedLaptopForDetails.conditionDetails || texts.defaultConditionReport}
                </p>
              </div>

              {/* Accessories & Warranty */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] block">{texts.freeAccessoriesTitle}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(selectedLaptopForDetails.includedAccessories || texts.defaultAccessories).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">{texts.warrantyPolicyTitle}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedLaptopForDetails.warranty || texts.defaultWarranty}
                  </span>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {texts.sellingPrice} {currency !== 'BDT' && `(${currency})`}:
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatPrice(selectedLaptopForDetails.offerPrice || selectedLaptopForDetails.sellPrice)}
                    </span>
                    {currency !== 'BDT' && (
                      <span className="text-xs text-slate-400 font-mono">
                        (৳{(selectedLaptopForDetails.offerPrice || selectedLaptopForDetails.sellPrice).toLocaleString()} BDT)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const laptop = selectedLaptopForDetails;
                      setSelectedLaptopForDetails(null);
                      setOrderModalLaptop(laptop);
                    }}
                    disabled={selectedLaptopForDetails.status === 'sold'}
                    className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{selectedLaptopForDetails.status === 'sold' ? texts.soldOut : texts.orderNow}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: Customer Order Checkout with AI WhatsApp Dispatch and AdminStore Integration */}
      <CustomerOrderModal
        laptop={
          orderModalLaptop
            ? {
                id: orderModalLaptop.id,
                title: orderModalLaptop.title,
                brand: orderModalLaptop.brand,
                code: orderModalLaptop.code || 'REC-LP',
                price: orderModalLaptop.offerPrice || orderModalLaptop.sellPrice,
                image:
                  orderModalLaptop.images?.[0] ||
                  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700',
                specs: `${orderModalLaptop.processor} • ${orderModalLaptop.ram} • ${orderModalLaptop.storage}`,
              }
            : null
        }
        isOpen={!!orderModalLaptop}
        onClose={() => setOrderModalLaptop(null)}
        sourceZone="Recondition Zone"
      />

      {/* MODAL: Reviews & Ratings */}
      {reviewModalTarget && (
        <ReviewsAndRatingModal
          isOpen={!!reviewModalTarget}
          onClose={() => setReviewModalTarget(null)}
          targetId={reviewModalTarget.id}
          targetName={reviewModalTarget.name}
        />
      )}

    </section>
  );
};
