import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../context/LanguageContext';
import { OFFICIAL_BANK_ACCOUNTS, BankAccount } from '../data/jhfData';
import {
  CreditCard,
  QrCode,
  PhoneCall,
  MessageSquare,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
  FolderGit2,
  BookOpen,
  Bot,
  Building2,
  Mail,
  Globe,
  Landmark,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ArrowRight,
} from 'lucide-react';

export const PaymentAndVisitingCardZone: React.FC = () => {
  const { storeInfo } = useStore();
  const { language } = useTranslation();
  const [timeString, setTimeString] = useState('');
  const [paymentTab, setPaymentTab] = useState<'bank' | 'mobile'>('mobile');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isBn = language === 'bn';
  const isHi = language === 'hi';

  const texts = {
    safeBadge: isBn
      ? 'সুরক্ষিত ও যাচাইকৃত লেনদেন'
      : isHi
      ? 'सुरक्षित और सत्यापित लेन-देन'
      : 'Safe & Verified Transactions',
    verifiedPill: isBn
      ? '১০০% নিরাপদ অফিশিয়াল লেনদেন'
      : isHi
      ? '100% सुरक्षित आधिकारिक लेन-देन'
      : '100% Secure Official Transactions',
    paymentTitle: isBn
      ? '💳 পেমেন্ট পদ্ধতি সমূহ'
      : isHi
      ? '💳 भुगतान के तरीके'
      : '💳 Official Payment Methods',
    paymentSubtitle: isBn
      ? 'সরাসরি ব্যাংক একাউন্টে ট্রান্সফার (NPSB / BEFTN / RTGS) অথবা মোবাইল ব্যাংকিংয়ের (bKash / Nagad / Rocket) মাধ্যমে পেমেন্ট করতে পারবেন।'
      : isHi
      ? 'आधिकारिक बैंक खातों (NPSB / BEFTN / RTGS) या मोबाइल बैंकिंग (bKash / Nagad / Rocket) में सीधे सुरक्षित ट्रांसफर कर सकते हैं।'
      : 'Direct transfer to official verified bank accounts (NPSB / BEFTN / RTGS) or mobile banking (bKash / Nagad / Rocket).',
    bankTab: isBn
      ? `🏦 অফিশিয়াল ব্যাংক একাউন্ট (${OFFICIAL_BANK_ACCOUNTS.length})`
      : isHi
      ? `🏦 आधिकारिक बैंक खाते (${OFFICIAL_BANK_ACCOUNTS.length})`
      : `🏦 Official Bank Accounts (${OFFICIAL_BANK_ACCOUNTS.length})`,
    mobileTab: isBn ? '📱 বিকাশ / নগদ / রকেট' : isHi ? '📱 bKash / Nagad / Rocket' : '📱 bKash / Nagad / Rocket',
    bankIntro: isBn
      ? 'নির্ধারিত ব্যাংক একাউন্ট সমূহে যেকোনো ব্যাংকের অ্যাপ বা ব্রাঞ্চ থেকে টাকা পাঠানো যাবে:'
      : isHi
      ? 'निर्दिष्ट बैंक खातों में किसी भी बैंक ऐप या शाखा से राशि भेजी जा सकती है:'
      : 'Send funds to any of our verified bank accounts from any bank app or branch:',
    copy: isBn ? 'কপি' : isHi ? 'कॉपी' : 'Copy',
    copied: isBn ? 'কপি হয়েছে' : isHi ? 'कॉपी किया' : 'Copied',
    branchLabel: isBn ? '🏢 শাখা' : isHi ? '🏢 शाखा' : '🏢 Branch',
    bankTip: isBn
      ? '💡 টিপস: আপনার ব্যাংকের অ্যাপ (যেমন: Astha, NexusPay, NRB Planet, Citytouch) বা বিকাশ/নগদের "Bank Transfer" অপশন থেকে NPSB নির্বাচন করলে সাথে সাথে টাকা ট্রান্সফার হয়ে যায়।'
      : isHi
      ? '💡 सुझाव: अपने बैंक ऐप (जैसे Astha, NexusPay, NRB Planet) या bKash/Nagad से "Bank Transfer" (NPSB) चुनने पर तुरंत भुगतान हो जाता है।'
      : '💡 Tip: Selecting NPSB in your banking app (e.g. Astha, NexusPay, NRB Planet, Citytouch) or via bKash/Nagad "Bank Transfer" sends funds instantly.',
    courierProcess: isBn ? 'কুরিয়ার বুকিং প্রক্রিয়া:' : isHi ? 'कूरियर बुकिंग प्रक्रिया:' : 'Courier Booking Process:',
    step1Advance: isBn
      ? 'কুরিয়ার বুকিং এর জন্য ৫০০ থেকে ১০০০ টাকা অগ্রিম পেমেন্ট করতে হবে।'
      : isHi
      ? 'कूरियर बुकिंग के लिए 500 से 1000 रुपये अग्रिम भुगतान करना होगा।'
      : '500 to 1,000 BDT advance payment required for courier booking.',
    step2Cod: isBn
      ? 'বাকি টাকা প্রোডাক্ট হাতে পেয়ে কুরিয়ার অফিসে পরিশোধ করবেন।'
      : isHi
      ? 'शेष राशि उत्पाद प्राप्त होने पर कूरियर कार्यालय में अदा करें।'
      : 'Pay remaining balance upon receiving product at courier branch (Cash on Delivery).',
    step3Verify: isBn
      ? 'পেমেন্ট করার পর ট্রানজেকশন আইডি বা স্ক্রিনশট হোয়াটসঅ্যাপে পাঠান।'
      : isHi
      ? 'भुगतान के बाद ट्रांजैक्शन आईडी या स्क्रीनशॉट व्हाट्सएप पर भेजें।'
      : 'Send transaction ID or payment slip on WhatsApp after transfer.',
    sendSlipBtn: isBn
      ? 'হোয়াটসঅ্যাপে পেমেন্ট স্লিপ / স্ক্রিনশট পাঠান'
      : isHi
      ? 'व्हाट्सएप पर भुगतान रसीद / स्क्रीनशॉट भेजें'
      : 'Send Payment Screenshot / Slip on WhatsApp',
    visitingBadge: isBn
      ? 'অফিশিয়াল ভিজিটিং কার্ড ও যোগাযোগের বিবরণ'
      : isHi
      ? 'आधिकारिक विजिटिंग कार्ड और संपर्क विवरण'
      : 'Official Visiting Card & Contact Details',
    mainOfficeLabel: isBn ? 'প্রধান কার্যালয়:' : isHi ? 'मुख्य कार्यालय:' : 'Main Office:',
    branchOfficeLabel: isBn ? 'শাখা কার্যালয়:' : isHi ? 'शाखा कार्यालय:' : 'Branch Office:',
    dhakaTime: isBn ? 'ঢাকা সময়:' : isHi ? 'ढाका समय:' : 'Dhaka Time:',
    districts64: isBn ? '৬৪ জেলায় কুরিয়ার সার্ভিস' : isHi ? '64 जिलों में कूरियर सेवा' : '64 Districts Courier Service',
    resourcesHeader: isBn
      ? 'জেএইচএফ স্পেশাল ফ্রি রিসোর্স:'
      : isHi
      ? 'JHF विशेष मुफ़्त संसाधन:'
      : 'Special Free Resources from JHF:',
    photoGallery: isBn ? 'ফটো গ্যালারি' : isHi ? 'फोटो गैलरी' : 'Photo Gallery',
    marketingCourse: isBn ? 'মার্কেটিং কোর্স' : isHi ? 'मार्केटिंग कोर्स' : 'Marketing Course',
    callBtn: isBn ? 'কল করুন' : isHi ? 'कॉल करें' : 'Call',
    accountNameLabel: isBn ? '👤 হিসাবের নাম' : isHi ? '👤 खाता धारक' : '👤 Account Name',
    accountNumberLabel: isBn ? '🔢 হিসাব নম্বর' : isHi ? '🔢 खाता संख्या' : '🔢 Account Number',
    routingNumberLabel: isBn ? '🔁 রাউটিং নম্বর' : isHi ? '🔁 रूटिंग संख्या' : '🔁 Routing Number',
    swiftCodeLabel: isBn ? '🌐 সুইফট কোড:' : isHi ? '🌐 स्विफ्ट कोड:' : '🌐 SWIFT Code:',
    personalWallet: isBn
      ? 'বিকাশ / নগদ / রকেট (পার্সোনাল)'
      : isHi
      ? 'bKash / Nagad / Rocket (व्यक्तिगत)'
      : 'bKash / Nagad / Rocket (Personal)',
    alternativeHotline: isBn ? 'বিকল্প হটলাইন' : isHi ? 'वैकल्पिक हेल्पलाइन' : 'Alternative Hotline',
    shopTagline: isBn
      ? 'সেরা ল্যাপটপ ক্রয়, বিক্রয় এবং এক্সেসরিজ আমদানিকারক ও সরবরাহকারী'
      : isHi
      ? 'सर्वश्रेष्ठ लैपटॉप खरीद, बिक्री व एक्सेसरीज आयातक और आपूर्तिकर्ता'
      : 'Best Laptop Buy, Sell & Accessories Importer, Traders & Suppliers',
    mainOfficeAddress: isBn
      ? 'সোনালী ট্রেড, শপ নং: ১০০১ ও ১০৪০, ইসিএস কম্পিউটার সিটি সেন্টার, মাল্টিপ্ল্যান, নিউ এলিফ্যান্ট রোড, ঢাকা'
      : isHi
      ? 'सोनाली ट्रेड, दुकान नं: १००१ व १०४০, ईसीएस कंप्यूटर सिटी सेंटर, मल्टीप्लान, न्यू एलीफेंट रोड, ढाका'
      : 'Sonali Trade, Shop No : 1001 & 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka',
    branchOfficeAddress: isBn
      ? 'বারইপাড়া বাজার, চন্দ্রা, গাজীপুর'
      : isHi
      ? 'बारोईपारा बाज़ार, चंद्रा, गाज़ीपुर'
      : 'Baroipara Bazar, Chandra, Gazipur',
    mobileLabel: isBn ? 'মোবাইল:' : isHi ? 'मोबाइल:' : 'Mobile:',
    whatsappPaymentMsg: isBn
      ? 'আসসালামু আলাইকুম JHF Laptop Zone, আমি ব্যাংক অথবা মোবাইল পেমেন্ট স্লিপ কনফার্ম করতে চাই'
      : isHi
      ? 'नमस्ते JHF Laptop Zone, मैं बैंक अथवा मोबाइल भुगतान रसीद की पुष्टि करना चाहता हूँ'
      : 'Hello JHF Laptop Zone, I want to confirm bank / mobile payment details',
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
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
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8" id="payment-visiting-zone">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Payment Methods Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between" id="payment-section">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-md">
                <CreditCard className="w-3.5 h-3.5" />
                <span>{texts.safeBadge}</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {texts.verifiedPill}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-2">
              {texts.paymentTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              {texts.paymentSubtitle}
            </p>

            {/* Payment Method Switcher Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 gap-1">
              <button
                type="button"
                onClick={() => setPaymentTab('bank')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  paymentTab === 'bank'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>{texts.bankTab}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentTab('mobile')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  paymentTab === 'mobile'
                    ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{texts.mobileTab}</span>
              </button>
            </div>

            {/* TAB CONTENT: Bank Accounts */}
            {paymentTab === 'bank' && (
              <div className="space-y-3.5 mb-5">
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {texts.bankIntro}
                  </span>
                </div>

                {OFFICIAL_BANK_ACCOUNTS.map((bank) => (
                  <div
                    key={bank.id}
                    className={`p-4 rounded-2xl border transition hover:shadow-md ${bank.themeColor.bg} ${bank.themeColor.border}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-200/70 dark:border-slate-800/70">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-xs">
                          <Landmark className={`w-4 h-4 ${bank.themeColor.accent}`} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                            {bank.bankName}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {bank.accountType || 'Official Bank Account'}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bank.themeColor.badge}`}>
                        {bank.bankShortName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Account Name */}
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                          {texts.accountNameLabel}
                        </span>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px] truncate">
                            {bank.accountName}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(bank.accountName, `${bank.id}-name`)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600 transition"
                            title="Copy Account Name"
                          >
                            {copiedKey === `${bank.id}-name` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Account Number */}
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                          {texts.accountNumberLabel}
                        </span>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xs sm:text-[13px] tracking-wide">
                            {bank.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(bank.accountNumber, `${bank.id}-acc`)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[10px] font-bold text-blue-700 dark:text-blue-300 transition"
                          >
                            {copiedKey === `${bank.id}-acc` ? (
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

                      {/* Branch & Routing */}
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                          {texts.branchLabel}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {bank.branch}
                        </span>
                      </div>

                      <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                          {texts.routingNumberLabel}
                        </span>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                            {bank.routingNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(bank.routingNumber, `${bank.id}-routing`)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600 transition"
                            title="Copy Routing Number"
                          >
                            {copiedKey === `${bank.id}-routing` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SWIFT Code & Instant Methods */}
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2 text-[11px] flex-wrap">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span><strong>{texts.swiftCodeLabel}</strong></span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{bank.swiftCode}</span>
                        <button
                          type="button"
                          onClick={() => copyText(bank.swiftCode, `${bank.id}-swift`)}
                          className="ml-1 p-0.5 text-slate-400 hover:text-blue-600 transition"
                          title="Copy SWIFT Code"
                        >
                          {copiedKey === `${bank.id}-swift` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        {bank.recommendedMethods?.slice(0, 3).map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
                  {texts.bankTip}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Mobile Banking (bKash/Nagad) */}
            {paymentTab === 'mobile' && (
              <div className="space-y-4 mb-5">
                {/* Payment Banner / QR Card */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-5">
                  <img
                    src={storeInfo.paymentCardImg}
                    alt="Payment QR Card - bKash Nagad Rocket"
                    className="w-48 h-auto rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                  />
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {texts.courierProcess}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">1. Advance:</span> {texts.step1Advance}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">2. Cash on Delivery:</span> {texts.step2Cod}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">3. Verification:</span> {texts.step3Verify}
                    </div>
                  </div>
                </div>

                {/* Numbers List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40 rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-pink-600 dark:text-pink-400 flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-pink-600 text-white text-[9px] font-black tracking-wide">bKash</span>
                        <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white text-[9px] font-black tracking-wide">Nagad</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white text-[9px] font-black tracking-wide">Rocket</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Personal</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        01935-693071
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText('01935693071', 'mobile-bkash')}
                        className="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/50 text-[10px] font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'mobile-bkash' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'mobile-bkash' ? texts.copied : texts.copy}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center justify-between">
                      <span>{texts.alternativeHotline}</span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Call / Support</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        01731-693071
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText('01731693071', 'mobile-hotline')}
                        className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'mobile-hotline' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'mobile-hotline' ? texts.copied : texts.copy}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <a
            href={`https://wa.me/8801935693071?text=${encodeURIComponent(texts.whatsappPaymentMsg)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition mt-2"
          >
            <MessageSquare className="w-4 h-4" />
            {texts.sendSlipBtn}
          </a>
        </div>

        {/* Visiting Card & Store Info Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between" id="visiting-card">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
              <QrCode className="w-3.5 h-3.5" />
              <span>{texts.visitingBadge}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1 flex items-center gap-2">
              📇 JHF Laptop Zone
            </h2>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4 leading-relaxed">
              {texts.shopTagline}
            </p>

            {/* Visiting card image and structured offices */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 mb-5 flex flex-col sm:flex-row items-center gap-5">
              <img
                src={storeInfo.visitingCardImg}
                alt="JHF Laptop Zone Official Visiting Card"
                className="w-48 h-auto rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex-shrink-0"
              />
              <div className="space-y-2 text-xs w-full">
                <div className="p-2 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-0.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{texts.mainOfficeLabel}</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {texts.mainOfficeAddress}
                  </div>
                </div>

                <div className="p-2 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{texts.branchOfficeLabel}</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {texts.branchOfficeAddress}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <PhoneCall className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span><strong>{texts.mobileLabel}</strong> 01935-693071 , 01731-693071</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span><a href="mailto:jhflaptopzone@gmail.com" className="hover:underline">jhflaptopzone@gmail.com</a></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <a href="https://www.facebook.com/jhflaptopzone" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">fb.com/jhflaptopzone</a>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <a href="https://www.jhflaptopzone.com" target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">www.jhflaptopzone.com</a>
                  </div>
                </div>

                {/* Live Dhaka Clock */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] text-slate-500">{texts.dhakaTime}</span>
                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      {timeString || 'Loading...'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{texts.districts64}</span>
                </div>
              </div>
            </div>

            {/* Extra Free Resources & Links */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {texts.resourcesHeader}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <a
                  href={storeInfo.galleryFolder}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition"
                >
                  <FolderGit2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate font-semibold">{texts.photoGallery}</span>
                </a>

                <a
                  href={storeInfo.sharaAiLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-500 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition"
                >
                  <Bot className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="truncate font-semibold">Shara The AI</span>
                </a>

                <a
                  href={storeInfo.marketingCourseLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition"
                >
                  <BookOpen className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="truncate font-semibold">{texts.marketingCourse}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <a
              href={`tel:${storeInfo.phones[0] ? storeInfo.phones[0].replace('-', '') : '01935693071'}`}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4" />
              {texts.callBtn} {storeInfo.phones[0] || '01935-693071'}
            </a>
            <a
              href={`tel:${storeInfo.phones[1] ? storeInfo.phones[1].replace('-', '') : '01731693071'}`}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4" />
              {texts.callBtn} {storeInfo.phones[1] || '01731-693071'}
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
