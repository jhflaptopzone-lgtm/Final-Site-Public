import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationDict, translations } from '../i18n/translations';

export type { Language };
export type Currency = 'BDT' | 'USD' | 'EUR' | 'INR' | 'GBP' | 'AED' | 'SAR' | 'SGD' | 'MYR';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rateAgainstBdt: number; // Multiplier: amountBdt * rateAgainstBdt
  name: string;
  ratePerUnitBdt?: number; // How many BDT is 1 unit of this currency (e.g. 1 USD = 121.50 BDT)
  flag?: string;
}

// Running USD to BDT market exchange rate in Bangladesh
export const DEFAULT_USD_TO_BDT = 121.50;

export const getCurrencyList = (usdRate: number = DEFAULT_USD_TO_BDT): CurrencyConfig[] => {
  const safeUsdRate = usdRate > 0 ? usdRate : DEFAULT_USD_TO_BDT;
  return [
    {
      code: 'BDT',
      symbol: '৳',
      rateAgainstBdt: 1,
      name: 'Bangladeshi Taka (BDT)',
      ratePerUnitBdt: 1,
      flag: '🇧🇩',
    },
    {
      code: 'USD',
      symbol: '$',
      rateAgainstBdt: 1 / safeUsdRate,
      name: 'US Dollar (USD)',
      ratePerUnitBdt: safeUsdRate,
      flag: '🇺🇸',
    },
    {
      code: 'EUR',
      symbol: '€',
      rateAgainstBdt: (1 / 1.08) / safeUsdRate,
      name: 'Euro (EUR)',
      ratePerUnitBdt: Math.round(safeUsdRate * 1.08 * 100) / 100,
      flag: '🇪🇺',
    },
    {
      code: 'INR',
      symbol: '₹',
      rateAgainstBdt: 86.8 / safeUsdRate,
      name: 'Indian Rupee (INR)',
      ratePerUnitBdt: Math.round((safeUsdRate / 86.8) * 100) / 100,
      flag: '🇮🇳',
    },
    {
      code: 'GBP',
      symbol: '£',
      rateAgainstBdt: (1 / 1.28) / safeUsdRate,
      name: 'British Pound (GBP)',
      ratePerUnitBdt: Math.round(safeUsdRate * 1.28 * 100) / 100,
      flag: '🇬🇧',
    },
    {
      code: 'AED',
      symbol: 'AED ',
      rateAgainstBdt: 3.6725 / safeUsdRate,
      name: 'UAE Dirham (AED)',
      ratePerUnitBdt: Math.round((safeUsdRate / 3.6725) * 100) / 100,
      flag: '🇦🇪',
    },
    {
      code: 'SAR',
      symbol: 'SAR ',
      rateAgainstBdt: 3.75 / safeUsdRate,
      name: 'Saudi Riyal (SAR)',
      ratePerUnitBdt: Math.round((safeUsdRate / 3.75) * 100) / 100,
      flag: '🇸🇦',
    },
    {
      code: 'SGD',
      symbol: 'S$',
      rateAgainstBdt: 1.34 / safeUsdRate,
      name: 'Singapore Dollar (SGD)',
      ratePerUnitBdt: Math.round((safeUsdRate / 1.34) * 100) / 100,
      flag: '🇸🇬',
    },
    {
      code: 'MYR',
      symbol: 'RM ',
      rateAgainstBdt: 4.45 / safeUsdRate,
      name: 'Malaysian Ringgit (MYR)',
      ratePerUnitBdt: Math.round((safeUsdRate / 4.45) * 100) / 100,
      flag: '🇲🇾',
    },
  ];
};

export const CURRENCY_LIST: CurrencyConfig[] = getCurrencyList(DEFAULT_USD_TO_BDT);

export interface ConvertedPriceResult {
  originalBdt: number;
  convertedAmount: number;
  currency: Currency;
  symbol: string;
  formatted: string;
  usdRate: number;
  rateAgainstBdt: number;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  usdRate: number;
  setUsdRate: (rate: number) => void;
  currencies: CurrencyConfig[];
  formatPrice: (amountBdt: number | string, options?: { showCode?: boolean }) => string;
  convertPrice: (amountBdt: number | string) => ConvertedPriceResult;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('jhf_selected_language');
    if (saved === 'en' || saved === 'bn' || saved === 'hi') {
      return saved;
    }
    return 'en'; // Default English
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('jhf_selected_currency');
    const validCodes: Currency[] = ['BDT', 'USD', 'EUR', 'INR', 'GBP', 'AED', 'SAR', 'SGD', 'MYR'];
    if (validCodes.includes(saved as Currency)) {
      return saved as Currency;
    }
    return 'BDT';
  });

  // Running USD to BDT exchange rate
  const [usdRate, setUsdRateState] = useState<number>(() => {
    const saved = localStorage.getItem('jhf_running_usd_rate');
    const parsed = saved ? parseFloat(saved) : NaN;
    return !isNaN(parsed) && parsed > 50 && parsed < 300 ? parsed : DEFAULT_USD_TO_BDT;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('jhf_selected_language', lang);
    document.documentElement.lang = lang;
  };

  const setCurrency = (cur: Currency) => {
    setCurrencyState(cur);
    localStorage.setItem('jhf_selected_currency', cur);
  };

  const setUsdRate = (rate: number) => {
    if (rate > 0 && !isNaN(rate)) {
      setUsdRateState(rate);
      localStorage.setItem('jhf_running_usd_rate', String(rate));
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || translations.en;
  const currencies = getCurrencyList(usdRate);

  const convertPrice = (amountBdt: number | string): ConvertedPriceResult => {
    const num = typeof amountBdt === 'number'
      ? Math.round(amountBdt)
      : parseInt(String(amountBdt).replace(/[^0-9]/g, ''), 10) || 0;

    const currentConfig = currencies.find((c) => c.code === currency) || currencies[0];

    if (currency === 'BDT') {
      return {
        originalBdt: num,
        convertedAmount: num,
        currency: 'BDT',
        symbol: '৳',
        formatted: `৳ ${num.toLocaleString('en-US')}`,
        usdRate,
        rateAgainstBdt: 1,
      };
    }

    const converted = Math.round(num * currentConfig.rateAgainstBdt);
    const formatted = `${currentConfig.symbol}${converted.toLocaleString('en-US')}`;

    return {
      originalBdt: num,
      convertedAmount: converted,
      currency,
      symbol: currentConfig.symbol,
      formatted,
      usdRate,
      rateAgainstBdt: currentConfig.rateAgainstBdt,
    };
  };

  const formatPrice = (amountBdt: number | string, options?: { showCode?: boolean }): string => {
    const res = convertPrice(amountBdt);
    if (res.currency === 'BDT') {
      return res.formatted;
    }
    if (options?.showCode) {
      return `${res.formatted} ${res.currency}`;
    }
    return res.formatted;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currency,
        setCurrency,
        usdRate,
        setUsdRate,
        currencies,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
