import React, { useState, useMemo } from 'react';
import { LaptopItem } from '../data/jhfData';
import { useStore } from '../context/StoreContext';
import { useAdminStore } from '../admin/adminStore';
import { useCustomer } from '../context/CustomerContext';
import { useTranslation } from '../context/LanguageContext';
import { LaptopDetailModal } from './LaptopDetailModal';
import { CustomerOrderModal, OrderItemData } from './CustomerOrderModal';
import { CompareModal } from './CompareModal';
import { ReviewsAndRatingModal } from './ReviewsAndRatingModal';
import {
  Search,
  MessageSquare,
  ShieldCheck,
  Eye,
  Sparkles,
  ShoppingBag,
  PackageCheck,
  Heart,
  Scale,
  Star,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { OWNER_WHATSAPP } from '../utils/aiOrderAutomation';

export const LaptopCatalog: React.FC = () => {
  const { laptops: storeLaptops } = useStore();
  const { products } = useAdminStore();
  const { language, formatPrice, currency, usdRate } = useTranslation();
  const {
    favorites,
    toggleFavorite,
    isFavorite,
    addToCompare,
    isComparing,
    getAverageRating,
  } = useCustomer();

  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high'>('featured');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Modals
  const [activeModalLaptop, setActiveModalLaptop] = useState<LaptopItem | null>(null);
  const [orderingLaptop, setOrderingLaptop] = useState<OrderItemData | null>(null);
  const [reviewModalTarget, setReviewModalTarget] = useState<{ id: string; name: string } | null>(null);

  const texts = {
    en: {
      badge: 'Verified Used & Reconditioned Business Laptops',
      title: 'Featured Laptop Catalog',
      subtitle: (count: number) => `Showing ${count} available Dubai & Singapore tested laptops with 100% motherboard health and warranty.`,
      searchPlaceholder: 'Search ThinkPad, 840 G8, 16GB, i5 11th...',
      sortFeatured: 'Sort: Featured',
      sortLow: 'Price: Low to High',
      sortHigh: 'Price: High to Low',
      saved: 'Saved',
      offerPrice: 'Offer Price',
      tested: '100% Tested',
      fullSpecs: 'Full Specs',
      orderNow: 'Order Now',
      quickInquiry: 'WhatsApp Quick Inquiry',
      stockLabel: (n: number) => `Stock: ${n} units`,
      emptyTitle: 'No laptops currently found in stock matching your filter.',
      emptyDesc: 'Items removed from admin inventory or not matching filter will not appear here.',
      inCompare: 'Already in Compare',
      addCompare: 'Add to Compare',
      removeSaved: 'Remove from Saved',
      saveFavorite: 'Save to Favorites',
      viewReview: 'View or Add Review',
      whatsappInquiryText: (title: string, price: string) =>
        `Hello JHF LAPTOP ZONE, I want to inquire about: ${title} (Price: ${price}). Is this model in stock?`,
      filters: [
        { id: 'All', label: 'All Laptops', sub: 'In-Stock Ready' },
        { id: 'Lenovo', label: 'Lenovo', sub: 'ThinkPad Series' },
        { id: 'HP', label: 'HP', sub: 'EliteBook Series' },
        { id: 'Dell', label: 'Dell', sub: 'Latitude Series' },
        { id: 'Core i5', label: 'Core i5', sub: '8th / 10th / 11th' },
        { id: 'Core i7', label: 'Core i7', sub: 'High Power' },
        { id: '16GB', label: '16GB / 32GB', sub: 'Heavy Work' },
      ],
    },
    bn: {
      badge: 'ভেরিফাইড ব্যবহৃত ও রিকন্ডিশনড বিজনেস ল্যাপটপ',
      title: 'ল্যাপটপ ক্যাটালগ ও স্টক',
      subtitle: (count: number) => `দুবাই ও সিঙ্গাপুর থেকে আমদানিকৃত ১০০% মাদারবোর্ড হেলথ ও ওয়ারেন্টিসহ মোট ${count} টি ল্যাপটপ স্টকে প্রস্তুত রয়েছে।`,
      searchPlaceholder: 'থিংকপ্যাড, ৮৪০ জি৮, ১৬জিবি, আই৫ ১১তম খুঁজুন...',
      sortFeatured: 'সর্ট: ফিচারড',
      sortLow: 'দাম: কম থেকে বেশি',
      sortHigh: 'দাম: বেশি থেকে কম',
      saved: 'সংরক্ষিত',
      offerPrice: 'অফার মূল্য',
      tested: '১০০% টেস্টেড',
      fullSpecs: 'ফুল স্পেসিফিকেশন',
      orderNow: 'অর্ডার করুন',
      quickInquiry: 'হোয়াটসঅ্যাপে দ্রুত তথ্য জানুন',
      stockLabel: (n: number) => `স্টক: ${n} টি`,
      emptyTitle: 'কোনো ল্যাপটপ এই মুহূর্তে স্টকে পাওয়া যায়নি।',
      emptyDesc: 'অ্যাডমিন প্যানেল থেকে স্টক রিমুভ করা হলে বা ফিল্টারের সাথে না মিললে এখানে প্রদর্শিত হবে না।',
      inCompare: 'তুলনায় যুক্ত আছে',
      addCompare: 'তুলনায় যোগ করুন',
      removeSaved: 'সংরক্ষণ তালিকা থেকে সরান',
      saveFavorite: 'সংরক্ষণ করুন',
      viewReview: 'রিভিউ দেখুন বা দিন',
      whatsappInquiryText: (title: string, price: string) =>
        `আসসালামু আলাইকুম JHF LAPTOP ZONE, আমি এই ল্যাপটপ সম্পর্কে জানতে চাচ্ছি: ${title} (মূল্য: ${price})। এটি কি স্টকে এভেইলেবল আছে?`,
      filters: [
        { id: 'All', label: 'সকল ল্যাপটপ', sub: 'রেডি স্টক' },
        { id: 'Lenovo', label: 'লেনোভো', sub: 'থিংকপ্যাড সিরিজ' },
        { id: 'HP', label: 'এইচপি', sub: 'এলিটবুক সিরিজ' },
        { id: 'Dell', label: 'ডেল', sub: 'ল্যাটিটিউড সিরিজ' },
        { id: 'Core i5', label: 'কোর আই৫', sub: '৮ম / ১০ম / ১১তম' },
        { id: 'Core i7', label: 'কোর আই৭', sub: 'হাই পাওয়ার' },
        { id: '16GB', label: '১৬জিবি / ৩২জিবি', sub: 'হেভি ওয়ার্ক' },
      ],
    },
    hi: {
      badge: 'सत्यापित प्रयुक्त और रिकंडीशन बिजनेस लैपटॉप',
      title: 'विशेष रुप से प्रदर्शित लैपटॉप कैटलॉग',
      subtitle: (count: number) => `दुबई और सिंगापुर से आयातित १००% मदरबोर्ड हेल्थ व वारंटी के साथ कुल ${count} लैपटॉप स्टॉक में उपलब्ध हैं।`,
      searchPlaceholder: 'थिंकपैड, ८४० जी८, १६जीबी, कोर i5 खोजें...',
      sortFeatured: 'क्रमबद्ध: चुनिंदा',
      sortLow: 'कीमत: कम से अधिक',
      sortHigh: 'कीमत: अधिक से कम',
      saved: 'सहेजे गए',
      offerPrice: 'विशेष मूल्य',
      tested: '१००% परीक्षित',
      fullSpecs: 'पूर्ण विवरण',
      orderNow: 'ऑर्डर करें',
      quickInquiry: 'व्हाट्सएप पर त्वरित पूछताछ',
      stockLabel: (n: number) => `स्टॉक: ${n} यूनिट`,
      emptyTitle: 'वर्तमान में आपके फिल्टर से मेल खाता कोई लैपटॉप नहीं मिला।',
      emptyDesc: 'व्यवस्थापक द्वारा स्टॉक हटाए जाने या फिल्टर से मेल न खाने पर यहाँ प्रदर्शित नहीं होंगे।',
      inCompare: 'तुलना में शामिल है',
      addCompare: 'तुलना में जोड़ें',
      removeSaved: 'सहेजे गए से हटाएं',
      saveFavorite: 'पसंदीदा में जोड़ें',
      viewReview: 'समीक्षा देखें या जोड़ें',
      whatsappInquiryText: (title: string, price: string) =>
        `नमस्ते JHF LAPTOP ZONE, मैं इस लैपटॉप के बारे में पूछताछ करना चाहता हूँ: ${title} (कीमत: ${price})। क्या यह स्टॉक में उपलब्ध है?`,
      filters: [
        { id: 'All', label: 'सभी लैपटॉप', sub: 'तैयार स्टॉक' },
        { id: 'Lenovo', label: 'लेनोवो', sub: 'थिंकपैड श्रृंखला' },
        { id: 'HP', label: 'एचपी', sub: 'एलीटबुक श्रृंखला' },
        { id: 'Dell', label: 'डेल', sub: 'लैटीट्यूड श्रृंखला' },
        { id: 'Core i5', label: 'कोर i5', sub: '८वीं / १०वीं / ११वीं' },
        { id: 'Core i7', label: 'कोर i7', sub: 'उच्च शक्ति' },
        { id: '16GB', label: '१६जीबी / ३२जीबी', sub: 'भारी कार्य' },
      ],
    },
  }[language] || {
    badge: 'Verified Used & Reconditioned Business Laptops',
    title: 'Featured Laptop Catalog',
    subtitle: (count: number) => `Showing ${count} available Dubai & Singapore tested laptops with 100% motherboard health and warranty.`,
    searchPlaceholder: 'Search ThinkPad, 840 G8, 16GB, i5 11th...',
    sortFeatured: 'Sort: Featured',
    sortLow: 'Price: Low to High',
    sortHigh: 'Price: High to Low',
    saved: 'Saved',
    offerPrice: 'Offer Price',
    tested: '100% Tested',
    fullSpecs: 'Full Specs',
    orderNow: 'Order Now',
    quickInquiry: 'WhatsApp Quick Inquiry',
    stockLabel: (n: number) => `Stock: ${n} units`,
    emptyTitle: 'No laptops currently found in stock matching your filter.',
    emptyDesc: 'Items removed from admin inventory or not matching filter will not appear here.',
    inCompare: 'Already in Compare',
    addCompare: 'Add to Compare',
    removeSaved: 'Remove from Saved',
    saveFavorite: 'Save to Favorites',
    viewReview: 'View or Add Review',
    whatsappInquiryText: (title: string, price: string) =>
      `Hello JHF LAPTOP ZONE, I want to inquire about: ${title} (Price: ${price}). Is this model in stock?`,
    filters: [
      { id: 'All', label: 'All Laptops', sub: 'In-Stock Ready' },
      { id: 'Lenovo', label: 'Lenovo', sub: 'ThinkPad Series' },
      { id: 'HP', label: 'HP', sub: 'EliteBook Series' },
      { id: 'Dell', label: 'Dell', sub: 'Latitude Series' },
      { id: 'Core i5', label: 'Core i5', sub: '8th / 10th / 11th' },
      { id: 'Core i7', label: 'Core i7', sub: 'High Power' },
      { id: '16GB', label: '16GB / 32GB', sub: 'Heavy Work' },
    ],
  };

  const filterOptions = texts.filters;

  // Synchronize with AdminStore:
  const liveLaptops = useMemo(() => {
    if (products && products.length > 0) {
      return products
        .filter((prod) => {
          if (prod.isDeleted) return false;
          if (prod.status === 'draft' || prod.status === 'archived') return false;
          if (typeof prod.stockQuantity === 'number' && prod.stockQuantity <= 0) return false;
          return true;
        })
        .map((p) => ({
          id: p.id,
          sku: p.sku || 'JHF-LP',
          title: p.name,
          brand: p.brand || 'Laptop',
          series: p.model || p.category || 'Business Series',
          specs: `${p.processor || ''} • ${p.ram || ''} • ${p.storage || ''} • ${p.display || ''} • ${p.graphics || ''}`,
          price: `৳ ${(p.discountPrice || p.sellingPrice).toLocaleString()}`,
          numericPrice: p.discountPrice || p.sellingPrice,
          tag: p.condition || 'Dubai Grade A++',
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700',
          stock: p.stockQuantity,
          warranty: p.warranty || '30 Days Replacement + 5 Years Free Service',
        }));
    }

    return storeLaptops
      .filter((item) => (item as any).stock !== 0 && !(item as any).isDeleted)
      .map((l) => ({
        ...l,
        sku: (l as any).sku || 'JHF-LP',
        numericPrice: parseInt(l.price.replace(/[^0-9]/g, ''), 10) || 35000,
        stock: (l as any).stock || 5,
        warranty: '30 Days Replacement + 5 Years Free Service',
      }));
  }, [products, storeLaptops]);

  const filteredLaptops = useMemo(() => {
    return liveLaptops
      .filter((laptop) => {
        if (showOnlyFavorites && !favorites.includes(laptop.id)) return false;

        let matchesFilter = true;
        const title = (laptop.title || '').toLowerCase();
        const specs = (laptop.specs || '').toLowerCase();
        const brand = (laptop.brand || '').toLowerCase();
        const series = (laptop.series || '').toLowerCase();
        const search = (searchQuery || '').toLowerCase();

        if (selectedBrand === 'Lenovo') matchesFilter = laptop.brand.toLowerCase() === 'lenovo';
        else if (selectedBrand === 'HP') matchesFilter = laptop.brand.toLowerCase() === 'hp';
        else if (selectedBrand === 'Dell') matchesFilter = laptop.brand.toLowerCase() === 'dell';
        else if (selectedBrand === 'Core i5') matchesFilter = title.includes('i5');
        else if (selectedBrand === 'Core i7') matchesFilter = title.includes('i7');
        else if (selectedBrand === '16GB') matchesFilter = title.includes('16gb') || title.includes('32gb');

        const matchesSearch =
          title.includes(search) ||
          specs.includes(search) ||
          brand.includes(search) ||
          series.includes(search);

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.numericPrice - b.numericPrice;
        if (sortBy === 'price_high') return b.numericPrice - a.numericPrice;
        return 0;
      });
  }, [liveLaptops, selectedBrand, searchQuery, sortBy, showOnlyFavorites, favorites]);

  const handleOpenOrder = (laptop: any) => {
    setOrderingLaptop({
      id: laptop.id,
      title: laptop.title,
      brand: laptop.brand,
      code: laptop.sku || 'JHF-LP',
      price: laptop.numericPrice || laptop.price,
      image: laptop.image,
      specs: laptop.specs,
    });
  };

  return (
    <section className="py-8 font-sans scroll-mt-20" id="laptops-catalog">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{texts.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {texts.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {texts.subtitle(filteredLaptops.length)}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={texts.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="featured">{texts.sortFeatured}</option>
                <option value="price_low">{texts.sortLow}</option>
                <option value="price_high">{texts.sortHigh}</option>
              </select>
            </div>

            {/* Wishlist filter toggle */}
            {favorites.length > 0 && (
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition ${
                  showOnlyFavorites
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-white' : 'fill-rose-500 text-rose-500'}`} />
                <span>{texts.saved} ({favorites.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Brand Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 mb-8">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setSelectedBrand(opt.id);
                setShowOnlyFavorites(false);
              }}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                selectedBrand === opt.id && !showOnlyFavorites
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500'
              }`}
            >
              <span className="font-bold text-xs sm:text-sm">{opt.label}</span>
              <span className="text-[10px] opacity-75 mt-0.5">{opt.sub}</span>
            </button>
          ))}
        </div>

        {/* Laptop Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLaptops.map((laptop) => {
            const { rating, count } = getAverageRating(laptop.id);
            const inCompare = isComparing(laptop.id);
            const inWishlist = isFavorite(laptop.id);

            return (
              <div
                key={laptop.id}
                className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col group relative"
              >
                {/* Image & Quick Action Badges */}
                <div className="relative aspect-[16/10] bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={laptop.image}
                    alt={laptop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Top Left Tag */}
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
                    {laptop.tag}
                  </span>

                  {/* Top Right Buttons: Favorite + Compare */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    {/* Compare Button */}
                    <button
                      onClick={() => addToCompare(laptop)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow transition ${
                        inCompare
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900/70 text-slate-200 hover:text-white hover:bg-slate-900'
                      }`}
                      title={inCompare ? texts.inCompare : texts.addCompare}
                    >
                      {inCompare ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
                    </button>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleFavorite(laptop.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow transition ${
                        inWishlist
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-900/70 text-slate-200 hover:text-white hover:bg-slate-900'
                      }`}
                      title={inWishlist ? texts.removeSaved : texts.saveFavorite}
                    >
                      <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Stock Pill */}
                  {typeof laptop.stock === 'number' && (
                    <span className="absolute bottom-3 right-3 bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {texts.stockLabel(laptop.stock)}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {laptop.brand} &bull; {laptop.series}
                    </span>

                    {/* Star Rating Trigger */}
                    <button
                      onClick={() => setReviewModalTarget({ id: laptop.id, name: laptop.title })}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-600 transition"
                      title={texts.viewReview}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{rating}</span>
                      <span className="text-slate-400 font-normal text-[10px]">({count})</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {laptop.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {laptop.specs}
                  </p>

                  {/* Price & Action Buttons */}
                  <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700/70">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          {texts.offerPrice} {currency !== 'BDT' && <span className="text-amber-500 font-mono">({currency})</span>}
                        </span>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                            {formatPrice(laptop.numericPrice)}
                          </span>
                          {currency !== 'BDT' && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              (৳{laptop.numericPrice.toLocaleString()} BDT)
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded">
                        <ShieldCheck className="w-3.5 h-3.5" /> {texts.tested}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActiveModalLaptop(laptop as any)}
                        className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{texts.fullSpecs}</span>
                      </button>

                      <button
                        onClick={() => handleOpenOrder(laptop)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition uppercase tracking-wide"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{texts.orderNow}</span>
                      </button>
                    </div>

                    {/* Quick WhatsApp direct query */}
                    <div className="mt-2 text-center">
                      <a
                        href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(
                          texts.whatsappInquiryText(laptop.title, formatPrice(laptop.numericPrice))
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-500" />
                        <span>{texts.quickInquiry}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLaptops.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm space-y-2">
            <PackageCheck className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
            <p className="font-semibold text-slate-300">{texts.emptyTitle}</p>
            <p className="text-xs text-slate-500">
              {texts.emptyDesc}
            </p>
          </div>
        )}

      </div>

      {/* Full Specs Modal */}
      <LaptopDetailModal
        laptop={activeModalLaptop}
        onClose={() => setActiveModalLaptop(null)}
        onOrderNow={(lp) => {
          setActiveModalLaptop(null);
          handleOpenOrder(lp);
        }}
      />

      {/* Customer Quick Order Modal with WhatsApp AI Automation */}
      <CustomerOrderModal
        laptop={orderingLaptop}
        isOpen={!!orderingLaptop}
        onClose={() => setOrderingLaptop(null)}
        sourceZone="Catalog"
      />

      {/* Comparison Modal */}
      <CompareModal
        onOpenOrder={(lp) => handleOpenOrder(lp)}
        onOpenSpecs={(lp) => setActiveModalLaptop(lp)}
      />

      {/* Reviews & Ratings Modal */}
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
