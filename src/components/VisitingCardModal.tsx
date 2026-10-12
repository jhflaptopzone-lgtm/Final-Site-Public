import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAdminStore } from '../admin/adminStore';
import { useTranslation } from '../context/LanguageContext';
import { OFFICIAL_BANK_ACCOUNTS } from '../data/jhfData';
import {
  X,
  PhoneCall,
  MessageSquare,
  Mail,
  MapPin,
  QrCode,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  CreditCard,
  Download,
  Share2,
  Landmark,
  Smartphone,
} from 'lucide-react';

export const VisitingCardModal: React.FC = () => {
  const { isVisitingCardOpen, closeVisitingCard } = useStore();
  const { showroomConfig } = useAdminStore();
  const { language } = useTranslation();
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'banks' | 'mobile'>('mobile');

  if (!isVisitingCardOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const texts = {
    title: {
      en: 'Digital Visiting & Payment Card',
      bn: 'ডিজিটাল ভিজিটিং ও পেমেন্ট কার্ড',
      hi: 'डिजिटल विजिटिंग और पेमेंट कार्ड',
    }[language] || 'Digital Visiting & Payment Card',
    badgeSubtitle: {
      en: 'Premium Used & Reconditioned Laptops',
      bn: 'প্রিমিয়াম ব্যবহৃত ও রিকন্ডিশনড ল্যাপটপ',
      hi: 'प्रीमियम प्रयुक्त और नवीनीकृत लैपटॉप',
    }[language] || 'Premium Used & Reconditioned Laptops',
    ownerLabel: {
      en: 'Owner & Proprietor:',
      bn: 'মালিক ও স্বত্বাধিকারী:',
      hi: 'मालिक और प्रोपराइटर:',
    }[language] || 'Owner & Proprietor:',
    managingDirector: {
      en: 'Managing Director',
      bn: 'ব্যবস্থাপনা পরিচালক (Managing Director)',
      hi: 'प्रबंध निदेशक (Managing Director)',
    }[language] || 'Managing Director',
    hotline: {
      en: 'Hotline:',
      bn: 'হটলাইন:',
      hi: 'हॉटलाइन:',
    }[language] || 'Hotline:',
    altMobile: {
      en: 'Alternative:',
      bn: 'বিকল্প:',
      hi: 'वैकल्पिक:',
    }[language] || 'Alternative:',
    callNow: {
      en: 'Call Now',
      bn: 'কল করুন',
      hi: 'कॉल करें',
    }[language] || 'Call Now',
    whatsappChat: {
      en: 'WhatsApp Chat',
      bn: 'WhatsApp চ্যাট',
      hi: 'व्हाट्सएप चैट',
    }[language] || 'WhatsApp Chat',
    sendEmail: {
      en: 'Send Email',
      bn: 'ইমেইল পাঠান',
      hi: 'ईमेल भेजें',
    }[language] || 'Send Email',
    paymentHeading: {
      en: 'Payment Methods & Bank Accounts',
      bn: 'পেমেন্ট পদ্ধতি ও ব্যাংক একাউন্ট (Payment Details)',
      hi: 'भुगतान के तरीके और बैंक खाते',
    }[language] || 'Payment Methods & Bank Accounts',
    tabBanks: {
      en: `Bank Accounts (${OFFICIAL_BANK_ACCOUNTS.length})`,
      bn: `ব্যাংক একাউন্ট (${OFFICIAL_BANK_ACCOUNTS.length})`,
      hi: `बैंक खाते (${OFFICIAL_BANK_ACCOUNTS.length})`,
    }[language] || `Bank Accounts (${OFFICIAL_BANK_ACCOUNTS.length})`,
    tabMobile: {
      en: 'bKash, Nagad & Rocket',
      bn: 'বিকাশ, নগদ ও রকেট',
      hi: 'bKash, Nagad और Rocket',
    }[language] || 'bKash, Nagad & Rocket',
    copied: {
      en: 'Copied',
      bn: 'কপি হয়েছে',
      hi: 'कॉपी हुआ',
    }[language] || 'Copied',
    copy: {
      en: 'Copy',
      bn: 'কপি',
      hi: 'कॉपी',
    }[language] || 'Copy',
    swiftCopied: {
      en: 'SWIFT Copied',
      bn: 'SWIFT কপি হয়েছে',
      hi: 'SWIFT कॉपी हुआ',
    }[language] || 'SWIFT Copied',
    copySwift: {
      en: 'Copy SWIFT',
      bn: 'SWIFT কপি করুন',
      hi: 'SWIFT कॉपी करें',
    }[language] || 'Copy SWIFT',
    bkashHeading: {
      en: 'bKash Payment',
      bn: 'বিকাশ (bKash Payment)',
      hi: 'bKash भुगतान',
    }[language] || 'bKash Payment',
    nagadHeading: {
      en: 'Nagad Payment',
      bn: 'নগদ (Nagad Payment)',
      hi: 'Nagad भुगतान',
    }[language] || 'Nagad Payment',
    rocketHeading: {
      en: 'Rocket Payment',
      bn: 'রকেট (Rocket Payment)',
      hi: 'Rocket भुगतान',
    }[language] || 'Rocket Payment',
    personalOrMerchant: {
      en: 'Personal / Merchant Number:',
      bn: 'পার্সোনাল / মার্চেন্ট নম্বর:',
      hi: 'व्यक्तिगत / मर्चेंट नंबर:',
    }[language] || 'Personal / Merchant Number:',
    copyNumber: (type: 'bKash' | 'Nagad' | 'Rocket') => {
      if (language === 'bn') return `${type === 'bKash' ? 'বিকাশ' : type === 'Nagad' ? 'নগদ' : 'রকেট'} নম্বর কপি করুন`;
      if (language === 'hi') return `${type} नंबर कॉपी करें`;
      return `Copy ${type} Number`;
    },
    numberCopied: {
      en: 'Number Copied!',
      bn: 'নম্বর কপি হয়েছে!',
      hi: 'नंबर कॉपी हुआ!',
    }[language] || 'Number Copied!',
    closeBtn: {
      en: 'Close',
      bn: 'বন্ধ করুন',
      hi: 'बंद करें',
    }[language] || 'Close',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        id="visiting-card-modal-box"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {texts.title}
            </h3>
          </div>

          <button
            onClick={closeVisitingCard}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Visiting Card Design */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 shadow-2xl border border-amber-500/30">
            {/* Background Hologram Effect */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                    DIRECT IMPORTER • DUBAI & SINGAPORE
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-white mt-2">
                    JHF Laptop Zone
                  </h2>
                  <p className="text-xs text-slate-300">
                    {texts.badgeSubtitle}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-lg">
                  JHF
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">{texts.ownerLabel}</span>
                  <h3 className="text-base font-bold text-white">
                    {showroomConfig.ownerName}
                  </h3>
                  <p className="text-xs text-amber-300 font-medium">
                    {texts.managingDirector}
                  </p>
                </div>

                <div className="space-y-1 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{texts.hotline} {showroomConfig.hotline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{texts.altMobile} {showroomConfig.altMobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>{showroomConfig.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/60 flex items-start gap-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{showroomConfig.address}</span>
              </div>
            </div>
          </div>

          {/* Direct Action Buttons for Visiting Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={`tel:${showroomConfig.hotline.replace(/-/g, '')}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              <span>{texts.callNow}</span>
            </a>

            <a
              href={`https://wa.me/88${showroomConfig.whatsapp.replace(/-/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{texts.whatsappChat}</span>
            </a>

            <a
              href={`mailto:${showroomConfig.email}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-sky-500" />
              <span>{texts.sendEmail}</span>
            </a>
          </div>

          {/* Payment Section: Bank Accounts & Mobile Banking */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {texts.paymentHeading}
                </h4>
              </div>

              {/* Tabs Switcher */}
              <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('banks')}
                  className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'banks'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>{texts.tabBanks}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('mobile')}
                  className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'mobile'
                      ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{texts.tabMobile}</span>
                </button>
              </div>
            </div>

            {/* TAB: Bank Accounts */}
            {activeTab === 'banks' && (
              <div className="space-y-3">
                {OFFICIAL_BANK_ACCOUNTS.map((bank) => (
                  <div
                    key={bank.id}
                    className={`p-3.5 rounded-2xl border ${bank.themeColor.bg} ${bank.themeColor.border} text-xs space-y-2`}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-white dark:bg-slate-900 rounded-md">
                          <Landmark className={`w-3.5 h-3.5 ${bank.themeColor.accent}`} />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white sm:text-sm">
                          {bank.bankName}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bank.themeColor.badge}`}>
                        {bank.bankShortName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          👤 Account Name
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                            {bank.accountName}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bank.accountName, `${bank.id}-name`)}
                            className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                          >
                            {copiedType === `${bank.id}-name` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          🔢 Account Number
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xs tracking-wide">
                            {bank.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bank.accountNumber, `${bank.id}-acc`)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-[10px] font-bold text-blue-700 dark:text-blue-300 cursor-pointer"
                          >
                            {copiedType === `${bank.id}-acc` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>{texts.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{texts.copy}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          🏢 Branch
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {bank.branch}
                        </span>
                      </div>

                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          🔁 Routing Number
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                            {bank.routingNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bank.routingNumber, `${bank.id}-routing`)}
                            className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                          >
                            {copiedType === `${bank.id}-routing` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>🌐 <strong>SWIFT Code:</strong> <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{bank.swiftCode}</span></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bank.swiftCode, `${bank.id}-swift`)}
                        className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedType === `${bank.id}-swift` ? texts.swiftCopied : texts.copySwift}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Mobile Banking QRs */}
            {activeTab === 'mobile' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* bKash Card */}
                <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/40 text-center space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-600 text-white text-[11px] font-bold">
                    {texts.bkashHeading}
                  </div>

                  {/* Simulated Stylized QR Code */}
                  <div className="w-28 h-28 bg-white p-2.5 rounded-2xl mx-auto shadow-md border border-pink-100 flex flex-col items-center justify-center">
                    <div className="w-full h-full border-2 border-dashed border-pink-500 rounded-xl flex flex-col items-center justify-center text-pink-600">
                      <QrCode className="w-10 h-10" />
                      <span className="text-[9px] font-bold font-mono mt-0.5">bKash QR</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {texts.personalOrMerchant}
                    </p>
                    <p className="text-xs font-mono font-bold text-pink-700 dark:text-pink-300">
                      {showroomConfig.whatsapp}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(showroomConfig.whatsapp.replace(/-/g, ''), 'bkash')}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {copiedType === 'bkash' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'bkash' ? texts.numberCopied : texts.copyNumber('bKash')}</span>
                  </button>
                </div>

                {/* Nagad Card */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[11px] font-bold">
                    {texts.nagadHeading}
                  </div>

                  {/* Stylized QR */}
                  <div className="w-28 h-28 bg-white p-2.5 rounded-2xl mx-auto shadow-md border border-amber-100 flex flex-col items-center justify-center">
                    <div className="w-full h-full border-2 border-dashed border-amber-500 rounded-xl flex flex-col items-center justify-center text-amber-600">
                      <QrCode className="w-10 h-10" />
                      <span className="text-[9px] font-bold font-mono mt-0.5">Nagad QR</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {texts.personalOrMerchant}
                    </p>
                    <p className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                      {showroomConfig.whatsapp}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(showroomConfig.whatsapp.replace(/-/g, ''), 'nagad')}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {copiedType === 'nagad' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'nagad' ? texts.numberCopied : texts.copyNumber('Nagad')}</span>
                  </button>
                </div>

                {/* Rocket Card */}
                <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-center space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-bold">
                    {texts.rocketHeading}
                  </div>

                  {/* Stylized QR */}
                  <div className="w-28 h-28 bg-white p-2.5 rounded-2xl mx-auto shadow-md border border-purple-100 flex flex-col items-center justify-center">
                    <div className="w-full h-full border-2 border-dashed border-purple-500 rounded-xl flex flex-col items-center justify-center text-purple-600">
                      <QrCode className="w-10 h-10" />
                      <span className="text-[9px] font-bold font-mono mt-0.5">Rocket QR</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {texts.personalOrMerchant}
                    </p>
                    <p className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                      {showroomConfig.whatsapp}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(showroomConfig.whatsapp.replace(/-/g, ''), 'rocket')}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {copiedType === 'rocket' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'rocket' ? texts.numberCopied : texts.copyNumber('Rocket')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={closeVisitingCard}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {texts.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
