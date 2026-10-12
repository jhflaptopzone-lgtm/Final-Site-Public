import React from 'react';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../context/LanguageContext';
import { Disc, Download, ShieldCheck, Sparkles, ExternalLink, HardDrive, Key, AlertCircle } from 'lucide-react';

export const OperatingSystemZone: React.FC = () => {
  const { osList } = useStore();
  const { language } = useTranslation();

  const texts = {
    en: {
      badge: 'Clean Windows Images & Installation Utilities',
      title: '💿 JHF Operating System Zone',
      subtitle: 'Pre-activated clean Windows 11 & 10 ISOs, USB multi-boot Ventoy utilities, 11th Gen VMD drivers, and portable Live OS tools.',
      proTipTitle: 'Pro Tip for 11th Gen Laptops:',
      proTipDesc: 'When installing Windows on 11th Gen Intel laptops (ThinkPad L14 Gen-2 / HP 840 G8), if SSD is not detected during Windows setup, download the 11th Gen Boot VMD Driver File below and load driver during partition selection.',
      highSpeed: '✓ High Speed Link',
      downloadBtn: 'Download ISO / Tool',
    },
    bn: {
      badge: 'ক্লিন উইন্ডোজ ইমেজ ও ইনস্টলেশন ইউটিলিটি',
      title: '💿 জেএইচএফ অপারেটিং সিস্টেম জোন',
      subtitle: 'প্রি-অ্যাক্টিভেটেড ক্লিন উইন্ডোজ ১১ ও ১০ আইএসও, ইউএসবি মাল্টি-বুট ভেন্টয় ইউটিলিটি, ১১তম জেন ভিএমডি ড্রাইভার এবং পোর্টেবল লাইভ ওএস টুলস।',
      proTipTitle: '১১তম প্রজন্মের ল্যাপটপের জন্য দরকারি টিপস:',
      proTipDesc: '১১তম প্রজন্মের ইন্টেল ল্যাপটপে (যেমন ThinkPad L14 Gen-2 / HP 840 G8) উইন্ডোজ দেওয়ার সময় যদি এসএসডি পার্টিশন না পায়, তবে নিচের 11th Gen Boot VMD Driver ফাইলটি ডাউনলোড করে ইউএসবিতে নিয়ে ইনস্টলের সময় লোড ড্রাইভার দিন।',
      highSpeed: '✓ হাই স্পিড লিংক',
      downloadBtn: 'আইএসও / টুল ডাউনলোড',
    },
    hi: {
      badge: 'क्लीन विंडोज इमेज और इंस्टॉलेशन यूटिलिटीज',
      title: '💿 जेएचएफ ऑपरेटिंग सिस्टम ज़ोन',
      subtitle: 'पूर्व-सक्रिय क्लीन विंडोज ११ व १० आईएसओ, यूएसबी मल्टी-बूट वेंटॉय, ११वीं पीढ़ी के वीएमडी ड्राइवर और पोर्टेबल लाइव ओएस उपकरण।',
      proTipTitle: '११वीं पीढ़ी के लैपटॉप के लिए महत्वपूर्ण सुझाव:',
      proTipDesc: '११वीं पीढ़ी के इंटेल लैपटॉप (ThinkPad L14 Gen-2 / HP 840 G8) पर विंडोज इंस्टॉल करते समय यदि एसएसडी न दिखे, तो नीचे दिए गए 11th Gen Boot VMD Driver फ़ाइल को डाउनलोड करें और इंस्टॉलेशन के समय लोड ड्राइवर करें।',
      highSpeed: '✓ उच्च गति लिंक',
      downloadBtn: 'आईएसओ / टूल डाउनलोड करें',
    },
  }[language] || {
    badge: 'Clean Windows Images & Installation Utilities',
    title: '💿 JHF Operating System Zone',
    subtitle: 'Pre-activated clean Windows 11 & 10 ISOs, USB multi-boot Ventoy utilities, 11th Gen VMD drivers, and portable Live OS tools.',
    proTipTitle: 'Pro Tip for 11th Gen Laptops:',
    proTipDesc: 'When installing Windows on 11th Gen Intel laptops (ThinkPad L14 Gen-2 / HP 840 G8), if SSD is not detected during Windows setup, download the 11th Gen Boot VMD Driver File below and load driver during partition selection.',
    highSpeed: '✓ High Speed Link',
    downloadBtn: 'Download ISO / Tool',
  };

  return (
    <section className="py-8" id="os-zone">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Section Header */}
        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
            <Disc className="w-3.5 h-3.5" />
            <span>{texts.badge}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {texts.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {texts.subtitle}
          </p>
        </div>

        {/* Notice Box */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="font-bold text-slate-900 dark:text-white">{texts.proTipTitle} </strong>
            {texts.proTipDesc}
          </div>
        </div>

        {/* Grid of OS Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {osList.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 rounded-xl p-5 flex flex-col justify-between hover:border-purple-500 hover:shadow-md transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {item.source}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition mb-2">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  {texts.highSpeed}
                </span>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition transform active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{texts.downloadBtn}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
