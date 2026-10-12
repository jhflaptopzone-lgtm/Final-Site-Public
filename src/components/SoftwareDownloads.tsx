import React, { useState } from 'react';
import { useAdminStore } from '../admin/adminStore';
import { useTranslation } from '../context/LanguageContext';
import {
  Download,
  Terminal,
  HardDrive,
  BatteryCharging,
  Keyboard,
  Monitor,
  Flame,
  Cpu,
  FileCode,
  ExternalLink,
  ShieldCheck,
  Disc,
  Usb,
  FolderDown,
  Sparkles,
} from 'lucide-react';

export const SoftwareDownloads: React.FC<{ initialTab?: 'tools' | 'os' }> = ({ initialTab = 'tools' }) => {
  const { testingTools, osDownloads } = useAdminStore();
  const { language } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'tools' | 'os'>(initialTab);

  const texts = {
    en: {
      hubBadge: 'JHF Tech & Software Hub',
      heroTitle: 'Laptop Diagnostic Tools & Operating System Zone',
      heroDesc: 'Download all official diagnostic tools and clean Windows 11/10 ISOs in one click directly from Google Drive and Mega Cloud to test your laptop thoroughly.',
      toolsTab: 'JHF Testing Tools Zone',
      osTab: 'JHF Operating System Zone',
      toolsHeading: 'Essential Laptop Testing & Diagnostic Software',
      toolsSub: 'Test thoroughly in 5 minutes when buying a laptop for 100% confidence',
      portableBadge: '100% Virus-Free & Portable',
      version: 'Version',
      size: 'Size',
      driveDownload: 'Google Drive Download',
      megaDownload: 'Mega Download',
      guideHeading: 'Quick Laptop Testing Guide:',
      guide1Title: 'BatteryMon:',
      guide1Desc: 'Open software and unplug charger. If battery discharge rate is stable on green graph, battery health is pristine.',
      guide2Title: 'CrystalDiskInfo:',
      guide2Desc: 'SSD is perfect if Health Status shows "Good 100%" or "Good 98%" and temperature is blue.',
      guide3Title: 'Keyboard Test Utility:',
      guide3Desc: 'Press every key in sequence. If all keys turn green, there are no shorts or unresponsive keys.',
      guide4Title: 'Display Tester:',
      guide4Desc: 'Inspect full screen in solid colors (white, black, red, blue) to verify absence of dead pixels or spots.',
      osHeading: 'Official & Clean Windows ISO & Drivers',
      osSub: '100% original untouched operating systems for Dubai & Singapore laptops',
      edition: 'Edition:',
      arch: 'Architecture:',
      directIso: 'Direct ISO Download',
      torrent: 'Torrent',
      vmdTitle: 'Easy Solution for "Drive Not Found" during Windows Setup:',
      vmdDesc: 'On 11th, 12th, and 13th Gen laptops, Intel VMD technology may prevent the SSD drive from showing on the Windows setup screen. Download the "Intel VMD Storage Driver" zip file from the list above to a USB drive, click "Load Driver" during setup, and select the folder to instantly detect your SSD.',
    },
    bn: {
      hubBadge: 'জেএইচএফ টেক ও সফটওয়্যার হাব',
      heroTitle: 'ল্যাপটপ ডায়াগনস্টিক টুলস ও অপারেটিং সিস্টেম জোন',
      heroDesc: 'আপনার ল্যাপটপ নিখুঁতভাবে পরীক্ষা করার জন্য প্রয়োজনীয় সকল অফিশিয়াল ডায়াগনস্টিক টুলস এবং উইন্ডোজ ১১/১০ ক্লিন আইএসও এক ক্লিকে গুগল ড্রাইভ ও মেগা ক্লাউড থেকে সরাসরি ডাউনলোড করুন।',
      toolsTab: 'জেএইচএফ টেস্টিং টুলস জোন',
      osTab: 'জেএইচএফ অপারেটিং সিস্টেম জোন',
      toolsHeading: 'জরুরি ল্যাপটপ টেস্টিং ও ডায়াগনস্টিক সফটওয়্যার',
      toolsSub: 'ল্যাপটপ কেনার সময় ৫ মিনিটে নিজে নিজে টেস্ট করে শতভাগ নিশ্চিত হোন',
      portableBadge: '১০০% ভাইরাস-মুক্ত ও পোর্টেবল',
      version: 'ভার্সন',
      size: 'সাইজ',
      driveDownload: 'Google Drive ডাউনলোড',
      megaDownload: 'Mega ডাউনলোড',
      guideHeading: 'ল্যাপটপ টেস্ট করার নির্দেশিকা (Quick Testing Guide):',
      guide1Title: 'BatteryMon:',
      guide1Desc: 'সফটওয়্যারটি ওপেন করে চার্জার আনপ্লাগ করুন। ব্যাটারি ড্রপ রেট সবুজ গ্রাফে স্ট্যাবল থাকলে ব্যাটারি হেলথ নিখুঁত।',
      guide2Title: 'CrystalDiskInfo:',
      guide2Desc: 'Health Status "Good 100%" বা "Good 98%" এবং তাপমাত্রা নীল রঙে থাকলে এসএসডি নিখুঁত।',
      guide3Title: 'Keyboard Test Utility:',
      guide3Desc: 'কিবোর্ডের প্রতিটি কি পরপর চাপুন। প্রতিটি কি সবুজ হয়ে গেলে বুঝবেন কোনো শর্ট নেই।',
      guide4Title: 'Display Tester:',
      guide4Desc: 'সম্পূর্ণ স্ক্রিন এক রঙে (সাদা, কালো, লাল, নীল) দেখে ডেড পিক্সেল বা স্পট আছে কিনা চেক করুন।',
      osHeading: 'অফিসিয়াল ও ক্লিন উইন্ডোজ আইএসও এবং ড্রাইভার',
      osSub: 'দুবাই ও সিঙ্গাপুরের ল্যাপটপের জন্য ১০০% অরিজিনাল আন-টচড অপারেটিং সিস্টেম',
      edition: 'এডিশন:',
      arch: 'আর্কিটেকচার:',
      directIso: 'ডাইরেক্ট আইএসও ডাউনলোড',
      torrent: 'টরেন্ট',
      vmdTitle: 'উইন্ডোজ সেটআপে "Drive Not Found" সমস্যার সহজ সমাধান:',
      vmdDesc: '১১তম, ১২তম ও ১৩তম জেনারেশন ল্যাপটপে ইন্টেল VMD টেকনোলজির কারণে উইন্ডোজ সেটআপ স্ক্রিনে এসএসডি ড্রাইভ নাও দেখাতে পারে। উপরের তালিকা থেকে "Intel VMD Storage Driver" জিপ ফাইলটি ডাউনলোড করে পেনড্রাইভে রাখুন এবং সেটআপের সময় "Load Driver" এ ক্লিক করে ফোল্ডারটি সিলেক্ট করলেই ড্রাইভ তাৎক্ষণিক শো করবে।',
    },
    hi: {
      hubBadge: 'जेएचएफ टेक और सॉफ्टवेयर हब',
      heroTitle: 'लैपटॉप डायग्नोस्टिक टूल्स एवं ऑपरेटिंग सिस्टम ज़ोन',
      heroDesc: 'अपने लैपटॉप की गहन जांच के लिए सभी आधिकारिक डायग्नोस्टिक टूल्स और स्वच्छ विंडोज 11/10 आईएसओ एक क्लिक में गूगल ड्राइव और मेगा क्लाउड से सीधे डाउनलोड करें।',
      toolsTab: 'जेएचएफ टेस्टिंग टूल्स ज़ोन',
      osTab: 'जेएचएफ ऑपरेटिंग सिस्टम ज़ोन',
      toolsHeading: 'आवश्यक लैपटॉप परीक्षण एवं डायग्नोस्टिक सॉफ्टवेयर',
      toolsSub: 'लैपटॉप खरीदते समय 5 मिनट में स्वयं जांचें और 100% आश्वस्त हों',
      portableBadge: '100% वायरस-मुक्त और पोर्टेबल',
      version: 'संस्करण',
      size: 'आकार',
      driveDownload: 'गूगल ड्राइव डाउनलोड',
      megaDownload: 'मेगा डाउनलोड',
      guideHeading: 'त्वरित लैपटॉप परीक्षण गाइड:',
      guide1Title: 'BatteryMon:',
      guide1Desc: 'सॉफ्टवेयर खोलें और चार्जर अनप्लग करें। यदि बैटरी डिस्चार्ज दर हरे ग्राफ पर स्थिर है, तो बैटरी का स्वास्थ्य उत्तम है।',
      guide2Title: 'CrystalDiskInfo:',
      guide2Desc: 'यदि स्वास्थ्य स्थिति "Good 100%" या "Good 98%" दर्शाती है और तापमान नीला है तो एसएसडी एकदम सही है।',
      guide3Title: 'Keyboard Test Utility:',
      guide3Desc: 'कीबोर्ड की प्रत्येक कुंजी को क्रम से दबाएं। यदि सभी कुंजियां हरी हो जाती हैं, तो कोई शॉर्ट नहीं है।',
      guide4Title: 'Display Tester:',
      guide4Desc: 'डेड पिक्सल या स्पॉट की जांच के लिए ठोस रंगों (सफेद, काला, लाल, नीला) में पूरी स्क्रीन का निरीक्षण करें।',
      osHeading: 'आधिकारिक और स्वच्छ विंडोज आईएसओ एवं ड्राइवर्स',
      osSub: 'दुबई और सिंगापुर के लैपटॉप के लिए 100% मूल अनछुए ऑपरेटिंग सिस्टम',
      edition: 'संस्करण:',
      arch: 'आर्किटेक्चर:',
      directIso: 'सीधा आईएसओ डाउनलोड',
      torrent: 'टोरेंट',
      vmdTitle: 'विंडोज सेटअप में "Drive Not Found" समस्या का आसान समाधान:',
      vmdDesc: '11वीं, 12वीं और 13वीं पीढ़ी के लैपटॉप पर इंटेल वीएमडी तकनीक के कारण विंडोज सेटअप स्क्रीन पर एसएसडी ड्राइव नहीं दिख सकती है। उपरोक्त सूची से "Intel VMD Storage Driver" ज़िप फ़ाइल को यूएसबी ड्राइव में डाउनलोड करें, सेटअप के दौरान "Load Driver" पर क्लिक करें और तुरंत ड्राइव देखने के लिए फ़ोल्डर चुनें।',
    },
  }[language] || {
    hubBadge: 'JHF Tech & Software Hub',
    heroTitle: 'Laptop Diagnostic Tools & Operating System Zone',
    heroDesc: 'Download all official diagnostic tools and clean Windows 11/10 ISOs in one click directly from Google Drive and Mega Cloud to test your laptop thoroughly.',
    toolsTab: 'JHF Testing Tools Zone',
    osTab: 'JHF Operating System Zone',
    toolsHeading: 'Essential Laptop Testing & Diagnostic Software',
    toolsSub: 'Test thoroughly in 5 minutes when buying a laptop for 100% confidence',
    portableBadge: '100% Virus-Free & Portable',
    version: 'Version',
    size: 'Size',
    driveDownload: 'Google Drive Download',
    megaDownload: 'Mega Download',
    guideHeading: 'Quick Laptop Testing Guide:',
    guide1Title: 'BatteryMon:',
    guide1Desc: 'Open software and unplug charger. If battery discharge rate is stable on green graph, battery health is pristine.',
    guide2Title: 'CrystalDiskInfo:',
    guide2Desc: 'SSD is perfect if Health Status shows "Good 100%" or "Good 98%" and temperature is blue.',
    guide3Title: 'Keyboard Test Utility:',
    guide3Desc: 'Press every key in sequence. If all keys turn green, there are no shorts or unresponsive keys.',
    guide4Title: 'Display Tester:',
    guide4Desc: 'Inspect full screen in solid colors (white, black, red, blue) to verify absence of dead pixels or spots.',
    osHeading: 'Official & Clean Windows ISO & Drivers',
    osSub: '100% original untouched operating systems for Dubai & Singapore laptops',
    edition: 'Edition:',
    arch: 'Architecture:',
    directIso: 'Direct ISO Download',
    torrent: 'Torrent',
    vmdTitle: 'Easy Solution for "Drive Not Found" during Windows Setup:',
    vmdDesc: 'On 11th, 12th, and 13th Gen laptops, Intel VMD technology may prevent the SSD drive from showing on the Windows setup screen. Download the "Intel VMD Storage Driver" zip file from the list above to a USB drive, click "Load Driver" during setup, and select the folder to instantly detect your SSD.',
  };

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'BatteryCharging':
        return <BatteryCharging className="w-5 h-5 text-emerald-500" />;
      case 'HardDrive':
        return <HardDrive className="w-5 h-5 text-sky-500" />;
      case 'Keyboard':
        return <Keyboard className="w-5 h-5 text-amber-500" />;
      case 'Monitor':
        return <Monitor className="w-5 h-5 text-indigo-500" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      default:
        return <Cpu className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 border border-slate-700/50 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{texts.hubBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {texts.heroTitle}
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            {texts.heroDesc}
          </p>

          {/* Sub-tab switcher */}
          <div className="flex items-center gap-3 pt-3">
            <button
              id="subtab-testing-tools-btn"
              onClick={() => setActiveSubTab('tools')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                activeSubTab === 'tools'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>{texts.toolsTab} ({testingTools.length})</span>
            </button>

            <button
              id="subtab-os-downloads-btn"
              onClick={() => setActiveSubTab('os')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                activeSubTab === 'os'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Disc className="w-4 h-4" />
              <span>{texts.osTab} ({osDownloads.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Testing Tools Zone */}
      {activeSubTab === 'tools' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-500" />
                {texts.toolsHeading}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {texts.toolsSub}
              </p>
            </div>

            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
              {texts.portableBadge}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testingTools.map(tool => (
              <div
                key={tool.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {getToolIcon(tool.iconName)}
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {tool.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                    <span>{texts.version}: {tool.version}</span>
                    <span>•</span>
                    <span>{texts.size}: {tool.fileSize}</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={tool.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>{texts.driveDownload}</span>
                  </a>

                  <a
                    href={tool.megaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mega Cloud Download Link"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <FolderDown className="w-4 h-4" />
                    <span>{texts.megaDownload}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Guide Card */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              {texts.guideHeading}
            </h3>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
              <li><strong>{texts.guide1Title}</strong> {texts.guide1Desc}</li>
              <li><strong>{texts.guide2Title}</strong> {texts.guide2Desc}</li>
              <li><strong>{texts.guide3Title}</strong> {texts.guide3Desc}</li>
              <li><strong>{texts.guide4Title}</strong> {texts.guide4Desc}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Operating System Zone */}
      {activeSubTab === 'os' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Disc className="w-5 h-5 text-indigo-500" />
                {texts.osHeading}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {texts.osSub}
              </p>
            </div>

            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-500/20 w-fit">
              MSDN Clean Untouched ISO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {osDownloads.map(os => (
              <div
                key={os.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-500/20">
                      {os.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {texts.size}: {os.fileSize}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {os.title}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p><strong>{texts.edition}</strong> {os.edition}</p>
                    <p><strong>{texts.arch}</strong> {os.arch}</p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                    💡 {os.guideNote}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={os.isoDirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>{texts.directIso}</span>
                  </a>

                  {os.torrentLink && (
                    <a
                      href={os.torrentLink}
                      className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                    >
                      {texts.torrent}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* VMD Driver Help Box */}
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-3xl p-6 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <h4 className="font-bold text-sky-900 dark:text-sky-300 text-sm flex items-center gap-2">
              <Usb className="w-4 h-4 text-sky-600" />
              {texts.vmdTitle}
            </h4>
            <p>
              {texts.vmdDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

