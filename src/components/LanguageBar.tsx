import React, { useState } from 'react';
import { useTranslation, Language } from '../context/LanguageContext';
import { Globe, Check, ChevronDown, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';

export const LanguageBar: React.FC = () => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    usdRate,
    setUsdRate,
    currencies,
  } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(String(usdRate));

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'ENGLISH', native: 'English' },
    { code: 'bn', label: 'বাংলা', native: 'বাংলা' },
    { code: 'hi', label: 'हिन्दी', native: 'हिन्दी' },
  ];

  const barTexts = {
    en: {
      storeOnline: 'STORE ONLINE',
      runningUsdRate: 'Running USD Rate',
      rateCalc: '(Rate Calc)',
      selectCurrencyTitle: 'Select Display Currency',
      exchangeRateTitle: 'Running USD Exchange Rate',
      cancel: 'Cancel',
      changeRate: 'Change Rate',
      set: 'Set',
      conversionNotice: 'All laptop prices dynamically convert based on this USD exchange rate calculation.',
      chooseCurrency: 'Choose Display Currency:',
      baseStoreCurrency: 'Base Store Currency',
      selectLang: 'Select Language',
    },
    bn: {
      storeOnline: 'স্টোর অনলাইন',
      runningUsdRate: 'চলতি ডলার রেট',
      rateCalc: '(রেট হিসাব)',
      selectCurrencyTitle: 'ডিসপ্লে কারেন্সি নির্বাচন করুন',
      exchangeRateTitle: 'চলতি ইউএসডি রেট পরিবর্তন',
      cancel: 'বাতিল',
      changeRate: 'রেট পরিবর্তন',
      set: 'নির্ধারণ',
      conversionNotice: 'সকল ল্যাপটপের দাম এই ডলার এক্সচেঞ্জ রেট অনুযায়ী স্বয়ংক্রিয়ভাবে পরিবর্তিত হয়।',
      chooseCurrency: 'ডিসপ্লে কারেন্সি বেছে নিন:',
      baseStoreCurrency: 'মূল শোরুম কারেন্সি',
      selectLang: 'ভাষা নির্বাচন',
    },
    hi: {
      storeOnline: 'स्टोर ऑनलाइन',
      runningUsdRate: 'वर्तमान डॉलर दर',
      rateCalc: '(दर गणना)',
      selectCurrencyTitle: 'मुद्रा चुनें',
      exchangeRateTitle: 'वर्तमान यूएसडी विनिमय दर',
      cancel: 'रद्द करें',
      changeRate: 'दर बदलें',
      set: 'सेट करें',
      conversionNotice: 'सभी लैपटॉप की कीमतें इस यूएसडी विनिमय दर के आधार पर स्वचालित रूप से परिवर्तित होती हैं।',
      chooseCurrency: 'मुद्रा चुनें:',
      baseStoreCurrency: 'मूल शोरूम मुद्रा',
      selectLang: 'भाषा चुनें',
    },
  }[language] || {
    storeOnline: 'STORE ONLINE',
    runningUsdRate: 'Running USD Rate',
    rateCalc: '(Rate Calc)',
    selectCurrencyTitle: 'Select Display Currency',
    exchangeRateTitle: 'Running USD Exchange Rate',
    cancel: 'Cancel',
    changeRate: 'Change Rate',
    set: 'Set',
    conversionNotice: 'All laptop prices dynamically convert based on this USD exchange rate calculation.',
    chooseCurrency: 'Choose Display Currency:',
    baseStoreCurrency: 'Base Store Currency',
    selectLang: 'Select Language',
  };

  const currentConfig = currencies.find((c) => c.code === currency) || currencies[0];

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 50 && val < 300) {
      setUsdRate(val);
      setEditingRate(false);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-1.5 px-4 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Global Platform Badge & Live USD Rate Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.2 rounded-full">
              {barTexts.storeOnline}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] text-amber-300/90 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md font-mono">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>{barTexts.runningUsdRate}: 1 USD = ৳{usdRate.toFixed(2)} BDT</span>
          </div>
        </div>

        {/* Right: Language Switcher & Currency */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setCurrencyDropdownOpen(!currencyDropdownOpen);
                setTempRate(String(usdRate));
              }}
              className="flex items-center gap-1.5 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 px-2.5 py-1 rounded-md border border-slate-700 transition shadow-xs"
              title={barTexts.selectCurrencyTitle}
              aria-label={barTexts.selectCurrencyTitle}
            >
              <span className="text-amber-400 font-bold">{currentConfig.symbol}</span>
              <span className="font-bold">{currency}</span>
              {currency !== 'BDT' && (
                <span className="text-[9px] text-emerald-400 font-mono hidden md:inline">
                  {barTexts.rateCalc}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-[11px] space-y-2">
                {/* Running USD Rate Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                    <span className="flex items-center gap-1 text-amber-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>{barTexts.exchangeRateTitle}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingRate(!editingRate)}
                      className="text-blue-400 hover:underline"
                    >
                      {editingRate ? barTexts.cancel : barTexts.changeRate}
                    </button>
                  </div>

                  {editingRate ? (
                    <form onSubmit={handleSaveRate} className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-slate-400">1 USD = ৳</span>
                      <input
                        type="number"
                        step="0.1"
                        min="50"
                        max="300"
                        value={tempRate}
                        onChange={(e) => setTempRate(e.target.value)}
                        className="w-16 px-1.5 py-0.5 bg-slate-800 text-white rounded border border-slate-700 text-xs font-mono"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold hover:bg-blue-500"
                      >
                        {barTexts.set}
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-xs">
                        $1.00 USD = ৳{usdRate.toFixed(2)} BDT
                      </span>
                      <div className="flex gap-1 text-[9px]">
                        <button
                          type="button"
                          onClick={() => setUsdRate(121.5)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                          title="Reset to 121.50"
                        >
                          121.50
                        </button>
                        <button
                          type="button"
                          onClick={() => setUsdRate(122.0)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                          title="Set to 122.00"
                        >
                          122.00
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight">
                    {barTexts.conversionNotice}
                  </p>
                </div>

                <div className="px-1 font-bold text-[10px] text-slate-400">
                  {barTexts.chooseCurrency}
                </div>

                {/* Currency List */}
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {currencies.map((c) => {
                    const isSelected = currency === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{c.flag}</span>
                          <div>
                            <div className="font-semibold leading-tight text-[11px] flex items-center gap-1">
                              <span>{c.name}</span>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-[9px] opacity-75 font-mono">
                              {c.code === 'BDT'
                                ? barTexts.baseStoreCurrency
                                : `1 ${c.code} ≈ ৳${c.ratePerUnitBdt?.toFixed(2)} BDT`}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-extrabold opacity-90">
                          {c.symbol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Language Selector: [ ENGLISH ] [ বাংলা ] [ हिन्दी ] */}
          <div className="hidden md:flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            {languages.map((lang) => {
              const active = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  aria-pressed={active}
                >
                  {active && <Check className="w-3 h-3" />}
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Language Button: 🌐 EN */}
          <div className="relative md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-2.5 py-1 rounded-lg border border-slate-700 text-[11px]"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{language.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {mobileOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 text-xs">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setMobileOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                      language === lang.code
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang.native}</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
