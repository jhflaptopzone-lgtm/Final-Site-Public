import React from 'react';
import { useStore } from '../context/StoreContext';
import { useAdminStore } from '../admin/adminStore';
import { useTranslation } from '../context/LanguageContext';
import {
  Laptop,
  PhoneCall,
  MessageSquare,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
  Award,
} from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin?: () => void;
  onOpenPrivacyModal?: (tab: 'privacy' | 'cookies' | 'data' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin, onOpenPrivacyModal }) => {
  const { openVisitingCard } = useStore();
  const { showroomConfig } = useAdminStore();
  const { language } = useTranslation();

  const isBn = language === 'bn';
  const isHi = language === 'hi';

  const texts = {
    h1Title: isBn ? '১০০% অরিজিনাল ইমপোর্ট' : isHi ? '100% ओरिजिनल आयात' : '100% Original Import',
    h1Desc: isBn ? 'দুবাই ও সিঙ্গাপুরের সেরা ফ্রেশ ল্যাপটপ' : isHi ? 'दुबई और सिंगापुर के सर्वश्रेष्ठ लैपटॉप' : 'Top fresh laptops from Dubai & Singapore',
    h2Title: isBn ? '১৫ দিন রিপ্লেসমেন্ট গ্যারান্টি' : isHi ? '15 दिन रिप्लेसमेंट गारंटी' : '15 Days Replacement Guarantee',
    h2Desc: isBn ? '২-৩ বছরের ফ্রি সার্ভিস ওয়ারেন্টি' : isHi ? '2-3 साल मुफ़्त सर्विस वारंटी' : '2-3 Years Free Service Warranty',
    h3Title: isBn ? 'সার্টিফাইড ডায়াগনস্টিক' : isHi ? 'प्रमाणित डायग्नोस्टिक्स' : 'Certified Diagnostics',
    h3Desc: isBn ? 'CrystalDisk ও BatteryMon টেস্টেড' : isHi ? 'CrystalDisk और BatteryMon टेस्टेड' : 'CrystalDisk & BatteryMon Tested',
    h4Title: isBn ? 'হটলাইন সহায়তা' : isHi ? 'हॉटলাইন सहायता' : 'Hotline Support',
    h4Desc: isBn ? 'সকাল ১০টা থেকে রাত ৯টা প্রতিদিন' : isHi ? 'प्रतिदिन सुबह 10 बजे से रात 9 बजे तक' : 'Everyday 10:00 AM to 9:00 PM',
    ownerLabel: isBn ? 'স্বত্বাধিকারী:' : isHi ? 'स्वामी / प्रोपराइटर:' : 'Proprietor:',
    ownerName: isBn ? 'মোঃ জাহিদ হাসান' : isHi ? 'एमडी जाहिद हसन' : 'MD. Jahid Hasan',
    aboutDesc: isBn
      ? 'আমরা গ্রাহকদের সবচেয়ে বিশ্বস্ত মূল্যে দুবাই ও সিঙ্গাপুরের গ্রেড এ++ ফ্রেশ ল্যাপটপ সরবরাহ করি।'
      : isHi
      ? 'हम ग्राहकों को सबसे भरोसेमंद कीमतों पर दुबई और सिंगापुर के ग्रेड A++ ओरिजिनल लैपटॉप प्रदान करते हैं।'
      : 'We supply customers with Grade A++ 100% original business laptops directly imported from Dubai and Singapore at the most trusted prices.',
    erpLogin: isBn ? 'ম্যানেজমেন্ট ERP লগইন' : isHi ? 'मैनेजमेंट ERP लॉगिन' : 'Management ERP Login',
    quickNav: isBn ? 'কুইক ন্যাভিগেশন' : isHi ? 'त्वरित नेविगेशन' : 'Quick Navigation',
    navCatalog: isBn ? 'ল্যাপটপ ক্যাটালগ' : isHi ? 'लैपटॉप कैटलॉग' : 'Laptop Catalog',
    navRecondition: isBn ? 'জেএইচএফ রিকন্ডিশন জোন' : isHi ? 'JHF रिकंडीशन ज़ोन' : 'JHF Recondition Zone',
    navSoftware: isBn ? 'সফটওয়্যার সেন্টার' : isHi ? 'सॉफ्टवेयर सेंटर' : 'Software Center',
    navTesting: isBn ? 'টেস্টিং টুলস জোন' : isHi ? 'टेस्टिंग टूल्स ज़ोन' : 'Testing Tools Zone',
    navOs: isBn ? 'অপারেটিং সিস্টেম ও ড্রাইভার' : isHi ? 'ऑपरेटिंग सिस्टम और ड्राइवर' : 'Operating Systems & Drivers',
    navReviews: isBn ? 'কাস্টমার রিভিউ' : isHi ? 'ग्राहक समीक्षाएं' : 'Customer Reviews',
    navWarranty: isBn ? 'ওয়ারেন্টি পলিসি' : isHi ? 'वारंटी नीति' : 'Warranty Policy',
    navCard: isBn ? 'ভিজিটিং কার্ড ও পেমেন্ট কিউআর' : isHi ? 'विजिटिंग कार्ड और भुगतान क्यूआर' : 'Visiting Card & Payment QR',
    privacySection: isBn ? 'গোপনীয়তা ও সুরক্ষানীতি' : isHi ? 'गोपनीयता और शर्तें' : 'Privacy & Governance',
    privacyPolicy: isBn ? 'প্রাইভেসি পলিসি' : isHi ? 'गोपनीयता नीति' : 'Privacy Policy',
    cookieNotice: isBn ? 'কুকি পলিসি' : isHi ? 'कुकी सूचना' : 'Cookie Notice',
    dataRights: isBn ? 'নিরাপত্তা তথ্য' : isHi ? 'सुरक्षा डेटा' : 'Security Data',
    terms: isBn ? 'ব্যবহারের শর্তাবলী' : isHi ? 'सेवा की शर्तें' : 'Terms of Service',
    contactTitle: isBn ? 'জরুরি যোগাযোগ ও হটলাইন' : isHi ? 'आपातकालीन संपर्क और हेल्पलाइन' : 'Emergency Hotline & Contacts',
    hotlineLabel: isBn ? 'হটলাইন:' : isHi ? 'हॉटलाइन:' : 'Hotline:',
    whatsappLabel: isBn ? 'হোয়াটসঅ্যাপ:' : isHi ? 'व्हाट्सएप:' : 'WhatsApp:',
    altLabel: isBn ? 'বিকল্প নম্বর:' : isHi ? 'वैकल्पिक नंबर:' : 'Alternative:',
    locationTitle: isBn ? 'শোরুম লোকেশন' : isHi ? 'शोरूम स्थान' : 'Showroom Location',
    emailSupport: isBn ? 'ইমেইল সাপোর্ট' : isHi ? 'ईमेल सहायता' : 'Email Support',
    getMapWhatsapp: isBn ? 'শোরুম লোকেশন হোয়াটসঅ্যাপে নিন' : isHi ? 'व्हाट्सएप पर शोरूम लोकेशन प्राप्त करें' : 'Get Showroom Map on WhatsApp',
    rights: isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : isHi ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.',
    footerTagline: isBn
      ? 'স্বত্বাধিকারী: মোঃ জাহিদ হাসান • দুবাই ও সিঙ্গাপুর সরাসরি আমদানিকৃত ১০০% অরিজিনাল ল্যাপটপ'
      : isHi
      ? 'मालिक: मोहम्मद जाहिद हसन • दुबई और सिंगापुर से सीधे आयातित 100% ओरिजिनल लैपटॉप'
      : 'Owner: MD. Jahid Hasan • Directly Imported 100% Original Laptops from Dubai & Singapore',
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      {/* Top Highlights Banner */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{texts.h1Title}</h4>
              <p className="text-xs text-slate-400">{texts.h1Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{texts.h2Title}</h4>
              <p className="text-xs text-slate-400">{texts.h2Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{texts.h3Title}</h4>
              <p className="text-xs text-slate-400">{texts.h3Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{texts.h4Title}</h4>
              <p className="text-xs text-slate-400">{texts.h4Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Bio */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white">JHF Laptop Zone</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {texts.ownerLabel} <strong className="text-white">{texts.ownerName}</strong>{isBn || isHi ? '। ' : '. '}{texts.aboutDesc}
            </p>
            <div className="pt-1">
              <button
                onClick={() => onOpenAdminLogin ? onOpenAdminLogin() : undefined}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-semibold"
              >
                <LockKeyhole className="w-3.5 h-3.5" />
                <span>{texts.erpLogin}</span>
              </button>
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">{texts.quickNav}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#laptops-catalog"
                  className="hover:text-amber-400 transition-colors block"
                >
                  {texts.navCatalog}
                </a>
              </li>
              <li>
                <a
                  href="#jhf-recondition-zone"
                  className="hover:text-amber-400 transition-colors block"
                >
                  {texts.navRecondition}
                </a>
              </li>
              <li>
                <a
                  href="#software-zone"
                  className="hover:text-amber-400 transition-colors block"
                >
                  {texts.navSoftware}
                </a>
              </li>
              <li>
                <a
                  href="#testing-zone"
                  className="hover:text-amber-400 transition-colors block"
                >
                  {texts.navTesting}
                </a>
              </li>
              <li>
                <a
                  href="#os-zone"
                  className="hover:text-amber-400 transition-colors block"
                >
                  {texts.navOs}
                </a>
              </li>
              <li>
                <a
                  href="#customer-reviews-section"
                  className="hover:text-amber-400 transition-colors block"
                >
                  {texts.navReviews}
                </a>
              </li>
              <li>
                <a
                  href="#warranty-zone"
                  className="hover:text-amber-400 transition-colors block"
                >
                  {texts.navWarranty}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openVisitingCard}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  {texts.navCard}
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Governance */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">{texts.privacySection}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('privacy')}
                  className="hover:text-blue-400 transition text-left"
                >
                  {texts.privacyPolicy}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('cookies')}
                  className="hover:text-blue-400 transition text-left"
                >
                  {texts.cookieNotice}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('data')}
                  className="hover:text-blue-400 transition text-left"
                >
                  {texts.dataRights}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('terms')}
                  className="hover:text-blue-400 transition text-left"
                >
                  {texts.terms}
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-300 mb-1">{texts.emailSupport}</h5>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-mono text-slate-300">{showroomConfig.email}</span>
              </div>
            </div>
          </div>

          {/* Showroom Address & Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">{texts.contactTitle}</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{texts.hotlineLabel} <strong className="text-white font-mono">{showroomConfig.hotline}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{texts.whatsappLabel} <strong className="text-white font-mono">{showroomConfig.whatsapp}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{texts.altLabel} <strong className="text-white font-mono">{showroomConfig.altMobile}</strong></span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-white pt-2">{texts.locationTitle}</h4>
            <div className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{isBn ? (showroomConfig.addressBn || showroomConfig.address) : isHi ? (showroomConfig.addressHi || showroomConfig.addressEn || showroomConfig.address) : (showroomConfig.addressEn || showroomConfig.address)}</span>
            </div>
            <div className="pt-2">
              <a
                href={`https://wa.me/88${(showroomConfig?.whatsapp || '01935693071').replace(/-/g, '')}?text=${encodeURIComponent(
                  isBn
                    ? 'আসসালামু আলাইকুম জাহিদ ভাই, আপনাদের শোরুম লোকেশনে আসার পথ নির্দেশনা জানতে চাচ্ছি।'
                    : isHi
                    ? 'नमस्ते जाहिद भाई, मैं आपके शोरूम स्थान पर पहुंचने के लिए दिशा-निर्देश जानना चाहता हूं।'
                    : 'Hello Jahid Bhai, I would like directions to your showroom location.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{texts.getMapWhatsapp}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} JHF Laptop Zone. {texts.rights}</p>
          <p className="text-[11px]">
            {texts.footerTagline}
          </p>
        </div>
      </div>
    </footer>
  );
};
