import React from 'react';
import { STORE_INFO } from '../data/jhfData';
import { LiveStoreStatus } from './LiveStoreStatus';
import { useTranslation } from '../context/LanguageContext';
import { motion } from 'motion/react';
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Truck,
  FolderGit2,
  Laptop,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { t, language } = useTranslation();

  const heroTexts = {
    en: {
      mbTested: '100% Motherboard Tested',
      origin: 'Dubai & Singapore Grade A+',
      courier: '64 Districts Courier',
      whatsappBtn: 'WhatsApp Us',
      driveGallery: 'Drive Photo Gallery',
      hardwareCertified: 'Hardware Certified',
      enterpriseGrade: 'Enterprise Grade A+',
      modelsList: 'Lenovo ThinkPad • HP EliteBook • Dell Latitude',
      modelsSub: '100% Tested NVMe SSD • Original Charger • Clean Battery',
      replacementLabel: 'Replacement',
      replacementVal: '30 Days',
      serviceLabel: 'Free Service',
      serviceVal: '5 Years',
      courierLabel: 'Courier Delivery',
      courierVal: '64 Districts',
      whatsappMsg: 'Hello JHF LAPTOP ZONE, I am interested in your tested business laptops. Please guide me with current available stock and prices.',
    },
    bn: {
      mbTested: '১০০% মাদারবোর্ড টেস্টেড',
      origin: 'দুবাই ও সিঙ্গাপুর গ্রেড এ+',
      courier: '৬৪ জেলায় কুরিয়ার ডেলিভারি',
      whatsappBtn: 'হোয়াটসঅ্যাপে যোগাযোগ',
      driveGallery: 'ড্রাইভ ফটো গ্যালারি',
      hardwareCertified: 'হার্ডওয়্যার সার্টিফাইড',
      enterpriseGrade: 'এন্টারপ্রাইজ গ্রেড এ+',
      modelsList: 'লেনোভো থিংকপ্যাড • এইচপি এলিটবুক • ডেল ল্যাটিচিউড',
      modelsSub: '১০০% টেস্টেড এনভিএমই এসএসডি • অরিজিনাল চার্জার • হেলদি ব্যাটারি',
      replacementLabel: 'রিপ্লেসমেন্ট',
      replacementVal: '৩০ দিন',
      serviceLabel: 'ফ্রি সার্ভিস',
      serviceVal: '৫ বছর',
      courierLabel: 'কুরিয়ার ডেলিভারি',
      courierVal: '৬৪ জেলা',
      whatsappMsg: 'আসসালামু আলাইকুম JHF LAPTOP ZONE, আপনাদের ল্যাপটপ স্টক এবং প্রাইস সম্পর্কে জানতে চাচ্ছি।',
    },
    hi: {
      mbTested: '१००% मदरबोर्ड टेस्टेड',
      origin: 'दुबई और सिंगापुर ग्रेड A+',
      courier: '६४ जिलों में कूरियर डिलीवरी',
      whatsappBtn: 'व्हाट्सएप पर संपर्क करें',
      driveGallery: 'ड्राइव फोटो गैलरी',
      hardwareCertified: 'हार्डवेयर प्रमाणित',
      enterpriseGrade: 'एंटरप्राइज ग्रेड A+',
      modelsList: 'लेनोवो थिंकपैड • एचपी एलीटबुक • डेल लैटीट्यूड',
      modelsSub: '१००% टेस्टेड NVMe SSD • ओरिजिनल चार्जर • क्लीन बैटरी',
      replacementLabel: 'रिप्लेसमेंट',
      replacementVal: '३० दिन',
      serviceLabel: 'मुफ़्त सर्विस',
      serviceVal: '५ वर्ष',
      courierLabel: 'कूरियर डिलीवरी',
      courierVal: '६४ जिले',
      whatsappMsg: 'नमस्ते JHF LAPTOP ZONE, मुझे उपलब्ध लैपटॉप स्टॉक और कीमतों के बारे में जानकारी चाहिए।',
    },
  }[language] || {
    mbTested: '100% Motherboard Tested',
    origin: 'Dubai & Singapore Grade A+',
    courier: '64 Districts Courier',
    whatsappBtn: 'WhatsApp Us',
    driveGallery: 'Drive Photo Gallery',
    hardwareCertified: 'Hardware Certified',
    enterpriseGrade: 'Enterprise Grade A+',
    modelsList: 'Lenovo ThinkPad • HP EliteBook • Dell Latitude',
    modelsSub: '100% Tested NVMe SSD • Original Charger • Clean Battery',
    replacementLabel: 'Replacement',
    replacementVal: '30 Days',
    serviceLabel: 'Free Service',
    serviceVal: '5 Years',
    courierLabel: 'Courier Delivery',
    courierVal: '64 Districts',
    whatsappMsg: 'Hello JHF LAPTOP ZONE, I am interested in your tested business laptops. Please guide me with current available stock and prices.',
  };

  return (
    <div className="space-y-6">
      {/* Main Hero Showcase */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800/80 relative overflow-hidden shadow-2xl"
      >
        {/* Subtle Luxury Tech Depth (No tacky neon glow) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pill & Live Availability */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-black tracking-wider uppercase px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{STORE_INFO.name}</span>
              </div>
              <LiveStoreStatus compact={true} />
            </div>

            {/* Headline with i18n */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {t?.hero?.title || 'Premium Laptops.'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                {t?.hero?.subtitle || 'Tested. Trusted. Ready.'}
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              {t?.hero?.description || 'Authentic imported ThinkPad, EliteBook & Latitude enterprise laptops with motherboard stress-testing, honest battery benchmarks, and reliable warranty support.'}
            </p>

            {/* Quality & Origin Highlights */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <strong className="text-slate-200">{heroTexts.mbTested}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <strong className="text-slate-200">{heroTexts.origin}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-400" />
                <strong className="text-slate-200">{heroTexts.courier}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#laptops-catalog"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-2 group"
              >
                <span>{t?.hero?.ctaShop || 'SHOP LAPTOPS'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#jhf-recondition-zone"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/25 flex items-center gap-2"
              >
                <Laptop className="w-4 h-4" />
                <span>{t?.hero?.ctaRecondition || 'RECONDITION ZONE'}</span>
              </a>

              <a
                href={`https://wa.me/${STORE_INFO.whatsapp}?text=${encodeURIComponent(
                  heroTexts.whatsappMsg
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs sm:text-sm px-4 py-3.5 rounded-xl flex items-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>{heroTexts.whatsappBtn}</span>
              </a>

              <a
                href={STORE_INFO.galleryFolder}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white font-semibold text-xs px-3 py-3 flex items-center gap-1.5 transition"
              >
                <FolderGit2 className="w-4 h-4 text-blue-400" />
                <span>{heroTexts.driveGallery}</span>
              </a>
            </div>
          </div>

          {/* Right Product Spotlight Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {heroTexts.hardwareCertified}
                </span>
                <span className="text-slate-400 font-medium">{heroTexts.enterpriseGrade}</span>
              </div>

              <div className="relative rounded-xl overflow-hidden mb-4 group">
                <img
                  src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"
                  alt="ThinkPad & EliteBook Showcase"
                  className="w-full h-52 sm:h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-xs">
                  <div className="text-white font-black text-sm">
                    {heroTexts.modelsList}
                  </div>
                  <div className="text-emerald-400 text-[11px] font-semibold">
                    {heroTexts.modelsSub}
                  </div>
                </div>
              </div>

              {/* Quick Spec Matrix */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2">
                  <div className="text-slate-400 text-[10px]">{heroTexts.replacementLabel}</div>
                  <div className="font-extrabold text-white">{heroTexts.replacementVal}</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2">
                  <div className="text-slate-400 text-[10px]">{heroTexts.serviceLabel}</div>
                  <div className="font-extrabold text-blue-400">{heroTexts.serviceVal}</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2">
                  <div className="text-slate-400 text-[10px]">{heroTexts.courierLabel}</div>
                  <div className="font-extrabold text-emerald-400">{heroTexts.courierVal}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4 Trust Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-blue-500 transition">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t?.features?.tested || 'Motherboard Stress Tested'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t?.features?.testedDesc || 'Every unit passes multi-hour CPU, GPU, SSD and RAM diagnostics before dispatch.'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-blue-500 transition">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t?.features?.specs || 'Authentic Specifications'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t?.features?.specsDesc || 'Transparent serial numbers, original displays, and verified hardware configurations.'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-blue-500 transition">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t?.features?.warranty || '30-Day Replacement Guarantee'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t?.features?.warrantyDesc || 'Complete peace of mind with 2 to 5 years free technical service warranty.'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-blue-500 transition">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t?.features?.delivery || '64 Districts Courier Delivery'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t?.features?.deliveryDesc || 'Cash-on-delivery available across all Bangladesh districts with secure wooden packing.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
