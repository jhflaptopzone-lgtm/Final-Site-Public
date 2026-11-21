import React, { useState, useEffect } from 'react';
import { DownloadItem } from '../data/jhfData';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../context/LanguageContext';
import { ResourceShareModal } from './ResourceShareModal';
import {
  buildShareUrl,
  handleShareAnchorClick,
  matchesShareSlug,
  syncClientDocumentMeta,
} from '../utils/shareLinks';
import { Download, Search, HardDrive, ExternalLink, Sparkles, Filter, Eye } from 'lucide-react';

interface SoftwareZoneProps {
  deepLinkSlug?: string | null;
  onClearDeepLink?: () => void;
}

export const SoftwareZone: React.FC<SoftwareZoneProps> = ({ deepLinkSlug, onClearDeepLink }) => {
  const { softwareList } = useStore();
  const { language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeShareItem, setActiveShareItem] = useState<DownloadItem | null>(null);

  useEffect(() => {
    if (!deepLinkSlug || softwareList.length === 0) return;
    const matched = softwareList.find((item) => matchesShareSlug(item, deepLinkSlug));
    if (matched) {
      setSelectedCategory('All');
      setSearchQuery('');
      setActiveShareItem(matched);
      syncClientDocumentMeta({
        title: `${matched.title} | JHF Software Zone`,
        description: `${matched.category} • ${matched.source}${matched.size ? ` • ${matched.size}` : ''}${matched.description ? ` — ${matched.description}` : ''}`,
        image: matched.image,
        url: buildShareUrl('software', matched),
      });
    }
  }, [deepLinkSlug, softwareList]);

  const texts = {
    en: {
      badge: 'Full Free Essential Software Library',
      title: '💾 JHF Software Zone',
      subtitle: 'Verified software packages, graphics editors, CAD software, typing tools, and utilities hosted on Google Drive & Mega',
      searchPlaceholder: 'Search Photoshop, AutoCAD, Office...',
      all: 'All',
      verified: '✓ Verified Link',
      download: 'Download',
      noSoftware: 'No software found matching your search. Try a different keyword.',
    },
    bn: {
      badge: 'সম্পূর্ণ ফ্রি প্রয়োজনীয় সফটওয়্যার লাইব্রেরি',
      title: '💾 জেএইচএফ সফটওয়্যার জোন',
      subtitle: 'ভেরিফাইড সফটওয়্যার প্যাকেজ, গ্রাফিক্স এডিটর, ক্যাড সফটওয়্যার, টাইপিং টুলস ও গুগল ড্রাইভ এবং মেগাতে সংরক্ষিত ইউটিলিটি',
      searchPlaceholder: 'ফটোশপ, অটোক্যাড, অফিস খুঁজুন...',
      all: 'সকল সফটওয়্যার',
      verified: '✓ ভেরিফাইড লিংক',
      download: 'ডাউনলোড',
      noSoftware: 'অনুসন্ধানের সাথে মিলে এমন কোনো সফটওয়্যার পাওয়া যায়নি। অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।',
    },
    hi: {
      badge: 'पूर्ण निःशुल्क आवश्यक सॉफ्टवेयर लाइब्रेरी',
      title: '💾 जेएचएफ सॉफ्टवेयर ज़ोन',
      subtitle: 'सत्यापित सॉफ्टवेयर पैकेज, ग्राफिक्स संपादक, सीएडी सॉफ्टवेयर, टाइपिंग उपकरण और गूगल ड्राइव व मेगा पर होस्ट की गई उपयोगिताएं',
      searchPlaceholder: 'फोटोशॉप, ऑटोकैड, ऑफिस खोजें...',
      all: 'सभी सॉफ्टवेयर',
      verified: '✓ सत्यापित लिंक',
      download: 'डाउनलोड करें',
      noSoftware: 'आपके खोज से मेल खाता कोई सॉफ्टवेयर नहीं मिला। कृपया दूसरा शब्द खोजें।',
    },
  }[language] || {
    badge: 'Full Free Essential Software Library',
    title: '💾 JHF Software Zone',
    subtitle: 'Verified software packages, graphics editors, CAD software, typing tools, and utilities hosted on Google Drive & Mega',
    searchPlaceholder: 'Search Photoshop, AutoCAD, Office...',
    all: 'All',
    verified: '✓ Verified Link',
    download: 'Download',
    noSoftware: 'No software found matching your search. Try a different keyword.',
  };

  const rawCategories = Array.from(new Set(softwareList.map((item) => item.category)));

  const filteredItems = softwareList.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const search = (searchQuery || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const matchesSearch =
      title.includes(search) ||
      category.includes(search);
    return matchesCat && matchesSearch;
  });

  return (
    <section className="py-8" id="software-zone">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{texts.badge}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
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
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
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
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Software Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const shareHref = buildShareUrl('software', item);
            return (
              <div
                key={item.id}
                className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.source}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    <a
                      href={shareHref}
                      onClick={(e) => handleShareAnchorClick(e, 'software', item)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition cursor-pointer"
                    >
                      {item.title}
                    </a>
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    {texts.verified}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={shareHref}
                      onClick={(e) => handleShareAnchorClick(e, 'software', item)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:border-blue-500 transition cursor-pointer"
                      title={shareHref}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </a>

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition transform active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{texts.download}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs">
            {texts.noSoftware}
          </div>
        )}

      </div>

      <ResourceShareModal
        item={activeShareItem}
        type="software"
        onClose={() => {
          setActiveShareItem(null);
          onClearDeepLink?.();
        }}
      />
    </section>
  );
};
