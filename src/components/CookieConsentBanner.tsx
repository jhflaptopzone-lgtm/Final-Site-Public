import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
  securityMonitoring: boolean;
}

export const CookieConsentBanner: React.FC = () => {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const texts = {
    en: {
      title: 'Privacy & Download Security',
      badge: 'GDPR & Privacy First',
      desc: 'We use necessary cookies for store performance, language preferences, and security monitoring for genuine software & ISO downloads.',
      strictlyNecessary: 'Strictly Necessary',
      strictlyNecessaryDesc: 'Cart, language session, order checkout',
      alwaysOn: 'Always On',
      telemetry: 'Download Telemetry & Analytics',
      telemetryDesc: 'Anonymous bandwidth & download speed verification',
      security: 'Security & Anti-Abuse Monitoring',
      securityDesc: 'Protects download servers against scraping and attacks',
      savePref: 'Save Preferences',
      hideOptions: 'Hide Options',
      customize: 'Customize',
      essentialOnly: 'Essential Only',
      acceptAll: 'Accept All',
    },
    bn: {
      title: 'গোপনীয়তা ও ডাউনলোড নিরাপত্তা',
      badge: 'প্রাইভেসি ও জিডিপিআর ফার্স্ট',
      desc: 'স্টোর পারফরম্যান্স, ভাষা নির্ধারণ এবং সফটওয়্যার ও আইএসও ডাউনলোডের নিরাপত্তার জন্য প্রয়োজনীয় কুকি ব্যবহৃত হয়।',
      strictlyNecessary: 'অত্যাবশ্যকীয় কুকিজ',
      strictlyNecessaryDesc: 'কার্ট, ভাষা পছন্দ ও অর্ডার চেকআউট',
      alwaysOn: 'সর্বদা সক্রিয়',
      telemetry: 'ডাউনলোড টেলিমেট্রি ও অ্যানালিটিক্স',
      telemetryDesc: 'বেনামী ব্যান্ডউইথ ও ডাউনলোড স্পিড যাচাইকরণ',
      security: 'নিরাপত্তা ও অপব্যবহার প্রতিরোধ',
      securityDesc: 'সার্ভারকে স্ক্র্যাপিং ও ক্ষতিকর আক্রমণ থেকে সুরক্ষা',
      savePref: 'পছন্দ সংরক্ষণ করুন',
      hideOptions: 'অপশন লুকান',
      customize: 'কাস্টমাইজ',
      essentialOnly: 'শুধুমাত্র প্রয়োজনীয়',
      acceptAll: 'সব গ্রহণ করুন',
    },
    hi: {
      title: 'गोपनीयता और डाउनलोड सुरक्षा',
      badge: 'गोपनीयता व सुरक्षा प्रथम',
      desc: 'हम स्टोर प्रदर्शन, भाषा प्राथमिकताओं और वास्तविक सॉफ़्टवेयर डाउनलोड सुरक्षा हेतु आवश्यक कुकीज़ का उपयोग करते हैं।',
      strictlyNecessary: 'अनिवार्य कुकीज़',
      strictlyNecessaryDesc: 'कार्ट, भाषा सत्र, ऑर्डर चेकआउट',
      alwaysOn: 'सदा सक्रिय',
      telemetry: 'डाउनलोड टेलीमेट्री व एनालिटिक्स',
      telemetryDesc: 'अनाम बैंडविड्थ और डाउनलोड गति सत्यापन',
      security: 'सुरक्षा और दुरुपयोग निगरानी',
      securityDesc: 'डाउनलोड सर्वर को हमलों से सुरक्षित रखता है',
      savePref: 'प्राथमिकताएं सहेजें',
      hideOptions: 'विकल्प छुपाएं',
      customize: 'अनुकूलित करें',
      essentialOnly: 'केवल आवश्यक',
      acceptAll: 'सभी स्वीकार करें',
    },
  }[language] || {
    title: 'Privacy & Download Security',
    badge: 'GDPR & Privacy First',
    desc: 'We use necessary cookies for store performance, language preferences, and security monitoring for genuine software & ISO downloads.',
    strictlyNecessary: 'Strictly Necessary',
    strictlyNecessaryDesc: 'Cart, language session, order checkout',
    alwaysOn: 'Always On',
    telemetry: 'Download Telemetry & Analytics',
    telemetryDesc: 'Anonymous bandwidth & download speed verification',
    security: 'Security & Anti-Abuse Monitoring',
    securityDesc: 'Protects download servers against scraping and attacks',
    savePref: 'Save Preferences',
    hideOptions: 'Hide Options',
    customize: 'Customize',
    essentialOnly: 'Essential Only',
    acceptAll: 'Accept All',
  };

  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true
    analytics: true,
    preferences: true,
    securityMonitoring: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('jhf_cookie_consent');
    if (!saved) {
      // Delay display slightly for smoother entrance
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      preferences: true,
      securityMonitoring: true,
    };
    localStorage.setItem('jhf_cookie_consent', JSON.stringify(allAccepted));
    setIsOpen(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem('jhf_cookie_consent', JSON.stringify(preferences));
    setIsOpen(false);
  };

  const handleRejectNonEssential = () => {
    const minimal: CookiePreferences = {
      necessary: true,
      analytics: false,
      preferences: true,
      securityMonitoring: false,
    };
    localStorage.setItem('jhf_cookie_consent', JSON.stringify(minimal));
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-slate-200">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{texts.title}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-medium">
                {texts.badge}
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {texts.desc}
            </p>
          </div>
        </div>

        {showPreferences ? (
          <div className="space-y-2.5 my-4 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">{texts.strictlyNecessary}</span>
                <p className="text-[11px] text-slate-400">{texts.strictlyNecessaryDesc}</p>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">{texts.alwaysOn}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div>
                <span className="font-semibold text-white">{texts.telemetry}</span>
                <p className="text-[11px] text-slate-400">{texts.telemetryDesc}</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div>
                <span className="font-semibold text-white">{texts.security}</span>
                <p className="text-[11px] text-slate-400">{texts.securityDesc}</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.securityMonitoring}
                onChange={(e) => setPreferences({ ...preferences, securityMonitoring: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={handleSaveCustom}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
              >
                {texts.savePref}
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showPreferences ? texts.hideOptions : texts.customize}</span>
          </button>

          <button
            onClick={handleRejectNonEssential}
            className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-medium px-3 py-1.5 rounded-lg transition"
          >
            {texts.essentialOnly}
          </button>

          <button
            onClick={handleAcceptAll}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-lg shadow transition"
          >
            {texts.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
};
