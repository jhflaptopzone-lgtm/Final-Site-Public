import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../context/LanguageContext';
import { Wrench, Download, Search, Activity, ShieldCheck, Cpu, Battery, Monitor, Keyboard, CheckCircle2 } from 'lucide-react';

export const TestingToolsZone: React.FC = () => {
  const { testingTools } = useStore();
  const { language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const texts = {
    en: {
      badge: '100% Quality Assurance Diagnostic Toolkit',
      title: '🛠️ JHF Laptop Testing Software Zone',
      subtitle: 'Download professional diagnostic software to test laptop battery health, SSD read/write speeds, screen dead pixels, keyboard keys & GPU thermal stability.',
      searchPlaceholder: 'Search Battery, HD Sentinel, FurMark...',
      howTitle: 'How JHF Laptop Zone Tests Every Device:',
      howDesc: 'Battery health report > 80% • SSD health 100% (No bad sectors) • 0 dead pixels on IPS panel • Stress tested under FurMark & HWMonitor',
      all: 'All Tools',
      freeDiagnostic: 'Free Diagnostic',
      downloadTool: 'Download Tool',
      noTools: 'No testing tools found matching your query.',
    },
    bn: {
      badge: '১০০% কোয়ালিটি অ্যাসিওরেন্স ডায়াগনস্টিক টুলকিট',
      title: '🛠️ জেএইচএফ ল্যাপটপ টেস্টিং সফটওয়্যার জোন',
      subtitle: 'ল্যাপটপের ব্যাটারি হেলথ, এসএসডি রিড/রাইট স্পিড, স্ক্রিনের ডেড পিক্সেল, কীবোর্ড এবং জিপিইউ থার্মাল স্থায়িত্ব পরীক্ষার সফটওয়্যার ডাউনলোড করুন।',
      searchPlaceholder: 'ব্যাটারি, এইচডি সেন্টিনেল, ফারমার্ক খুঁজুন...',
      howTitle: 'জেএইচএফ প্রতিটি ল্যাপটপ যেভাবে টেস্ট করে:',
      howDesc: 'ব্যাটারি হেলথ ৮০%+ নিশ্চিত • এসএসডি হেলথ ১০০% (জিরো ব্যাড সেক্টর) • আইপিএস প্যানেলে কোনো ডেড পিক্সেল নেই • ফারমার্ক ও এইচডব্লিউমনিটরে স্ট্রেস টেস্টেড',
      all: 'সকল টুলস',
      freeDiagnostic: 'ফ্রি ডায়াগনস্টিক',
      downloadTool: 'টুল ডাউনলোড',
      noTools: 'অনুসন্ধানের সাথে কোনো টেস্টিং টুল মেলেনি।',
    },
    hi: {
      badge: '१००% गुणवत्ता आश्वासन डायग्नोस्टिक टूलकिट',
      title: '🛠️ जेएचएफ लैपटॉप टेस्टिंग सॉफ्टवेयर ज़ोन',
      subtitle: 'लैपटॉप की बैटरी हेल्थ, एसएसडी स्पीड, स्क्रीन के डेड पिक्सल, कीबोर्ड और जीपीयू स्थिरता जांचने हेतु पेशेवर सॉफ्टवेयर डाउनलोड करें।',
      searchPlaceholder: 'बैटरी, एचडी सेंटिनल, फरमार्क खोजें...',
      howTitle: 'जेएचएफ प्रत्येक लैपटॉप का परीक्षण कैसे करता है:',
      howDesc: 'बैटरी हेल्थ रिपोर्ट > ८०% • एसएसडी हेल्थ १००% (शून्य बैड सेक्टर) • आईपीएस पैनल पर ० डेड पिक्सल • फरमार्क व एचडब्ल्यूमॉनिटर पर तनाव परीक्षित',
      all: 'सभी उपकरण',
      freeDiagnostic: 'निःशुल्क डायग्नोस्टिक',
      downloadTool: 'टूल डाउनलोड करें',
      noTools: 'आपकी खोज से मेल खाता कोई परीक्षण उपकरण नहीं मिला।',
    },
  }[language] || {
    badge: '100% Quality Assurance Diagnostic Toolkit',
    title: '🛠️ JHF Laptop Testing Software Zone',
    subtitle: 'Download professional diagnostic software to test laptop battery health, SSD read/write speeds, screen dead pixels, keyboard keys & GPU thermal stability.',
    searchPlaceholder: 'Search Battery, HD Sentinel, FurMark...',
    howTitle: 'How JHF Laptop Zone Tests Every Device:',
    howDesc: 'Battery health report > 80% • SSD health 100% (No bad sectors) • 0 dead pixels on IPS panel • Stress tested under FurMark & HWMonitor',
    all: 'All Tools',
    freeDiagnostic: 'Free Diagnostic',
    downloadTool: 'Download Tool',
    noTools: 'No testing tools found matching your query.',
  };

  const categoryMap: Record<string, { en: string; bn: string; hi: string }> = {
    'Battery Diagnostic': { en: 'Battery Diagnostic', bn: 'ব্যাটারি টেস্ট', hi: 'बैटरी डायग्नोस्टिक' },
    'SSD / HDD Health': { en: 'SSD / HDD Health', bn: 'এসএসডি / হার্ডডিস্ক হেলথ', hi: 'एसएसडी / हार्ड डिस्क हेल्थ' },
    'Disk Benchmark': { en: 'Disk Benchmark', bn: 'ডিস্ক বেঞ্চমার্ক', hi: 'डिस्क बेंचमार्क' },
    'Display / Screen': { en: 'Display / Screen', bn: 'ডিসপ্লে / স্ক্রিন টেস্ট', hi: 'डिस्प्ले / स्क्रीन टेस्ट' },
    'Keyboard / Input': { en: 'Keyboard / Input', bn: 'কীবোর্ড / ইনপুট টেস্ট', hi: 'कीबोर्ड / इनपुट टेस्ट' },
    'GPU / Graphics': { en: 'GPU / Graphics', bn: 'গ্রাফিক্স / জিপিইউ টেস্ট', hi: 'जीपीयू / ग्राफिक्स' },
  };

  const getCatLabel = (cat: string) => {
    if (categoryMap[cat] && categoryMap[cat][language as 'en' | 'bn' | 'hi']) {
      return categoryMap[cat][language as 'en' | 'bn' | 'hi'];
    }
    return cat;
  };

  const rawCategories = Array.from(new Set(testingTools.map((item) => item.category)));

  const filteredTools = testingTools.filter((tool) => {
    const matchesCat = selectedCategory === 'All' || tool.category === selectedCategory;
    const search = (searchQuery || '').toLowerCase();
    const title = (tool.title || '').toLowerCase();
    const category = (tool.category || '').toLowerCase();
    const description = (tool.description || '').toLowerCase();
    const matchesSearch =
      title.includes(search) ||
      category.includes(search) ||
      description.includes(search);
    return matchesCat && matchesSearch;
  });

  return (
    <section className="py-8" id="testing-zone">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>{texts.badge}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {texts.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {texts.subtitle}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={texts.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Why Test Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {texts.howTitle}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                {texts.howDesc}
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'All'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
            }`}
          >
            {texts.all}
          </button>
          {rawCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
              }`}
            >
              {getCatLabel(cat)}
            </button>
          ))}
        </div>

        {/* Grid of Diagnostic Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                    {getCatLabel(tool.category)}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {tool.source}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition mb-1">
                  {tool.title}
                </h3>

                {tool.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {texts.freeDiagnostic}
                </span>

                <a
                  href={tool.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition transform active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{texts.downloadTool}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs">
            {texts.noTools}
          </div>
        )}

      </div>
    </section>
  );
};
