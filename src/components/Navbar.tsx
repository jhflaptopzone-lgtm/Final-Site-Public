import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useCustomer } from '../context/CustomerContext';
import { useTranslation } from '../context/LanguageContext';
import {
  MessageSquare,
  PhoneCall,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
  Truck,
  Scale,
  Heart,
  Lock,
  Settings,
  Sparkles,
  Bot,
  Globe,
  Coins,
  Star,
} from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeView: 'preview' | 'xml' | 'admin';
  setActiveView: (val: 'preview' | 'xml' | 'admin') => void;
  onCopyXml: () => void;
  copied: boolean;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  activeView,
  setActiveView,
  onOpenAdminLogin,
}) => {
  const { storeInfo, isAuthenticated } = useStore();
  const {
    favorites,
    compareList,
    setIsCompareModalOpen,
    setIsTrackingModalOpen,
    setIsAiAssistantOpen,
  } = useCustomer();
  const { language, setLanguage, currency, setCurrency, t } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  const navTexts = {
    en: {
      dhaka: 'Dhaka',
      trackOrder: 'Track Order',
      compare: 'Compare Laptops',
      wishlist: 'Saved Favorites',
      adminLogin: 'Admin Login',
      exitAdmin: 'Exit Admin',
      adminPanel: 'Admin Panel',
      admin: 'Admin',
      currencyLabel: 'Currency:',
      askAi: 'Ask JHF AI Assistant',
      whatsappSupport: 'WhatsApp Support',
      hotline: 'Hotline: 01731-693071',
      whatsapp: 'WhatsApp: 01935-693071',
    },
    bn: {
      dhaka: 'ঢাকা',
      trackOrder: 'অর্ডার ট্র্যাক',
      compare: 'ল্যাপটপ তুলনা',
      wishlist: 'পছন্দের তালিকা',
      adminLogin: 'অ্যাডমিন লগইন',
      exitAdmin: 'অ্যাডমিন প্রস্থান',
      adminPanel: 'অ্যাডমিন প্যানেল',
      admin: 'অ্যাডমিন',
      currencyLabel: 'কারেন্সি:',
      askAi: 'জেএইচএফ এআই অ্যাসিস্ট্যান্ট',
      whatsappSupport: 'হোয়াটসঅ্যাপ সাপোর্ট',
      hotline: 'হটলাইন: 01731-693071',
      whatsapp: 'হোয়াটসঅ্যাপ: 01935-693071',
    },
    hi: {
      dhaka: 'ढाका',
      trackOrder: 'ऑर्डर ट्रैक करें',
      compare: 'लैपटॉप तुलना',
      wishlist: 'पसंदीदा लैपटॉप',
      adminLogin: 'व्यवस्थापक लॉगिन',
      exitAdmin: 'व्यवस्थापक से बाहर निकलें',
      adminPanel: 'व्यवस्थापक पैनल',
      admin: 'व्यवस्थापक',
      currencyLabel: 'मुद्रा:',
      askAi: 'जेएचएफ एआई सहायक',
      whatsappSupport: 'व्हाट्सएप सहायता',
      hotline: 'हॉटलाइन: 01731-693071',
      whatsapp: 'व्हाट्सएप: 01935-693071',
    },
  }[language] || {
    dhaka: 'Dhaka',
    trackOrder: 'Track Order',
    compare: 'Compare Laptops',
    wishlist: 'Saved Favorites',
    adminLogin: 'Admin Login',
    exitAdmin: 'Exit Admin',
    adminPanel: 'Admin Panel',
    admin: 'Admin',
    currencyLabel: 'Currency:',
    askAi: 'Ask JHF AI Assistant',
    whatsappSupport: 'WhatsApp Support',
    hotline: 'Hotline: 01731-693071',
    whatsapp: 'WhatsApp: 01935-693071',
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Dhaka',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { label: t?.nav?.laptops || 'Laptops', href: '#laptops-catalog' },
    { label: t?.nav?.recondition || 'Recondition Zone', href: '#jhf-recondition-zone' },
    { label: t?.nav?.promo || 'Hot Offers', href: '#promo-zone' },
    { label: t?.nav?.software || 'Software Center', href: '#software-zone' },
    { label: t?.nav?.testing || 'Testing Tools', href: '#testing-zone' },
    { label: t?.nav?.os || 'OS & Drivers', href: '#os-zone' },
    { label: '⭐ ' + (t?.nav?.reviews || 'Reviews'), href: '#customer-reviews-section' },
    { label: t?.nav?.warranty || 'Warranty Policy', href: '#warranty-zone' },
    { label: t?.nav?.payment || 'Offices & Payment', href: '#payment-section' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200 font-sans">
      {/* Top Hotline & Global Selector Bar */}
      <div className="bg-slate-950 text-slate-300 text-[11px] sm:text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Contacts */}
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${storeInfo.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-emerald-400 font-medium transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{navTexts.whatsapp}</span>
            </a>
            <a
              href={`tel:${storeInfo.phones[1] ? storeInfo.phones[1].replace('-', '') : '01731693071'}`}
              className="flex items-center gap-1.5 hover:text-blue-400 font-medium transition hidden sm:flex"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span>{navTexts.hotline}</span>
            </a>
          </div>

          {/* Language, Currency & Dhaka Clock */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
              <Globe className="w-3 h-3 text-slate-400 ml-1" />
              {(['en', 'bn', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-1.5 py-0.5 rounded font-bold transition ${
                    language === lang
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'bn' ? 'বাংলা' : 'हिन्दी'}
                </button>
              ))}
            </div>

            {/* Currency Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
              <Coins className="w-3 h-3 text-slate-400 ml-1" />
              {(['BDT', 'INR', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-1.5 py-0.5 rounded font-bold transition ${
                    currency === curr
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <span className="hidden lg:inline text-slate-400 text-[11px]">
              {navTexts.dhaka}: <strong className="text-slate-200">{timeString}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('preview')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              J
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white block leading-tight">
                {storeInfo.name}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase">
                {storeInfo.domain}
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                if (activeView !== 'preview') setActiveView('preview');
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Tools: Track Order, Compare, Wishlist, Admin, Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Track Order Button */}
          <button
            onClick={() => setIsTrackingModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/70 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
            title={navTexts.trackOrder}
          >
            <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{navTexts.trackOrder}</span>
          </button>

          {/* Compare Button */}
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            title={navTexts.compare}
          >
            <Scale className="w-4 h-4" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {compareList.length}
              </span>
            )}
          </button>

          {/* Wishlist Indicator */}
          {favorites.length > 0 && (
            <a
              href="#laptops-catalog"
              className="relative p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition"
              title={navTexts.wishlist}
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                {favorites.length}
              </span>
            </a>
          )}

          {/* Admin Button */}
          {isAuthenticated ? (
            <button
              onClick={() => setActiveView(activeView === 'admin' ? 'preview' : 'admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeView === 'admin'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{activeView === 'admin' ? navTexts.exitAdmin : navTexts.admin}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{navTexts.adminLogin}</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs font-semibold animate-in slide-in-from-top duration-200">
          {/* Mobile Currency selector */}
          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-2">
            <span className="text-slate-500 dark:text-slate-400 text-xs">{navTexts.currencyLabel}</span>
            <div className="flex items-center gap-1">
              {(['BDT', 'INR', 'USD', 'EUR'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    currency === c ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                setMobileMenuOpen(false);
                if (activeView !== 'preview') setActiveView('preview');
              }}
              className="block p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsTrackingModalOpen(true);
              }}
              className="w-full bg-blue-600 text-white text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>{navTexts.trackOrder}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAiAssistantOpen(true);
              }}
              className="w-full bg-indigo-600 text-white text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>{navTexts.askAi}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isAuthenticated) {
                  setActiveView('admin');
                } else {
                  onOpenAdminLogin();
                }
              }}
              className="w-full bg-amber-600 text-white text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isAuthenticated ? navTexts.adminPanel : navTexts.adminLogin}</span>
            </button>

            <a
              href={`https://wa.me/${storeInfo.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 text-white text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{navTexts.whatsappSupport}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
