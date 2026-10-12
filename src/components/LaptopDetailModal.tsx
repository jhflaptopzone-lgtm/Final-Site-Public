import React from 'react';
import { LaptopItem, STORE_INFO } from '../data/jhfData';
import { getDetailedSpecsForLaptop } from '../data/specsHelper';
import { useTranslation } from '../context/LanguageContext';
import { X, ShieldCheck, MessageSquare, PhoneCall, Check, ExternalLink, Sparkles, Cpu, HardDrive, Battery, Monitor, Shield, Layers } from 'lucide-react';

interface LaptopDetailModalProps {
  laptop: LaptopItem | null;
  onClose: () => void;
  onOrderNow?: (laptop: LaptopItem) => void;
}

export const LaptopDetailModal: React.FC<LaptopDetailModalProps> = ({ laptop, onClose, onOrderNow }) => {
  const { formatPrice, currency, language } = useTranslation();

  if (!laptop) return null;

  const modalTexts = {
    en: {
      orderNow: 'Order Online',
      testedHealth: 'Tested & 100% Health',
      offerPrice: 'Special Offer Price',
      specsHeading: 'Laptop Full Specifications',
      verifiedBy: 'JHF LAPTOP ZONE Verified',
      warranty: 'Product Warranty',
      warranty30d: '30 Days Replacement Guarantee (Parts Included)',
      warranty5y: '05 Years Free Service Warranty',
      warrantyTerms: '1 Year SSD Replacement • 6 Months RAM Replacement • Lifetime Exchange Facility (Terms Apply)',
      highlights: 'Product Highlights & Overview:',
      readyToOrder: 'Ready to Order or Inquire?',
      deliveryAcross: 'Delivery across 64 districts in Bangladesh • 500-1000 Tk booking advance',
      orderOnWhatsApp: 'Order on WhatsApp',
      call: 'Call',
      thBrand: 'Brand',
      thCondition: 'Condition',
      thLaptopType: 'Laptop Type',
      thProcessorType: 'Processor Type',
      thProcessorSpeed: 'Processor Speed',
      thChipset: 'Chipset',
      thScreenSize: 'Screen Size',
      thRam: 'RAM',
      thHardDisk: 'Hard Disk / SSD',
      thDiskType: 'Disk Type',
      thGraphicsCard: 'Graphics Card',
      thAudioSpeaker: 'Audio / Speaker',
      thNetworking: 'Networking',
      thWebcam: 'Webcam',
      thCardReader: 'Card Reader',
      thBatteryBackup: 'Battery Backup',
      thKeyboard: 'Keyboard',
      thPortsSlots: 'Ports & Slots',
      thWeightColor: 'Weight & Color',
      thCharger: 'Charger',
    },
    bn: {
      orderNow: 'অনলাইন অর্ডার করুন',
      testedHealth: 'টেস্টেড ও ১০০% হেলথ',
      offerPrice: 'বিশেষ অফার মূল্য',
      specsHeading: 'ল্যাপটপ সম্পূর্ণ স্পেসিফিকেশন',
      verifiedBy: 'জেএইচএফ ল্যাপটপ জোন ভেরিফাইড',
      warranty: 'পণ্য ওয়ারেন্টি পলিসি',
      warranty30d: '৩০ দিনের রিপ্লেসমেন্ট গ্যারান্টি (পার্টসসহ)',
      warranty5y: '০৫ বছরের ফ্রি সার্ভিস ওয়ারেন্টি',
      warrantyTerms: '১ বছর এসএসডি রিপ্লেসমেন্ট • ৬ মাস র‍্যাম রিপ্লেসমেন্ট • আজীবন এক্সচেঞ্জ সুবিধা (শর্ত প্রযোজ্য)',
      highlights: 'পণ্যের বিশেষ বৈশিষ্ট্য ও সারসংক্ষেপ:',
      readyToOrder: 'অর্ডার বা বিস্তারিত জানতে চান?',
      deliveryAcross: 'সমগ্র বাংলাদেশের ৬৪ জেলায় কুরিয়ার ডেলিভারি • ৫০০-১০০০ টাকা বুকিং অ্যাডভান্স',
      orderOnWhatsApp: 'হোয়াটসঅ্যাপে অর্ডার করুন',
      call: 'কল করুন',
      thBrand: 'ব্র্যান্ড',
      thCondition: 'কন্ডিশন',
      thLaptopType: 'ল্যাপটপের ধরন',
      thProcessorType: 'প্রসেসর মডেল',
      thProcessorSpeed: 'প্রসেসর স্পিড',
      thChipset: 'চিপসেট',
      thScreenSize: 'ডিসপ্লে সাইজ',
      thRam: 'র‍্যাম',
      thHardDisk: 'স্টোরেজ / এসএসডি',
      thDiskType: 'ডিস্ক টাইপ',
      thGraphicsCard: 'গ্রাফিক্স কার্ড',
      thAudioSpeaker: 'অডিও / স্পিকার',
      thNetworking: 'নেটওয়ার্কিং',
      thWebcam: 'ওয়েবক্যাম',
      thCardReader: 'কার্ড রিডার',
      thBatteryBackup: 'ব্যাটারি ব্যাকআপ',
      thKeyboard: 'কীবোর্ড',
      thPortsSlots: 'পোর্টস ও স্লট',
      thWeightColor: 'ওজন ও কালার',
      thCharger: 'চার্জার',
    },
    hi: {
      orderNow: 'ऑनलाइन ऑर्डर करें',
      testedHealth: 'परीक्षित और १००% स्वास्थ्य',
      offerPrice: 'विशेष ऑफ़र मूल्य',
      specsHeading: 'लैपटॉप का पूर्ण विवरण',
      verifiedBy: 'जेएचएफ लैपटॉप ज़ोन सत्यापित',
      warranty: 'उत्पाद वारंटी नीति',
      warranty30d: '३० दिन की रिप्लेसमेंट गारंटी (पार्ट्स शामिल)',
      warranty5y: '०५ वर्ष निःशुल्क सर्विस वारंटी',
      warrantyTerms: '१ वर्ष एसएसडी रिप्लेसमेंट • ६ माह रैम रिप्लेसमेंट • आजीवन एक्सचेंज सुविधा (शर्तें लागू)',
      highlights: 'उत्पाद की मुख्य विशेषताएं और अवलोकन:',
      readyToOrder: 'ऑर्डर करने या पूछताछ के लिए तैयार हैं?',
      deliveryAcross: 'बांग्लादेश के ६४ जिलों में डिलीवरी • ५००-१००० टका बुकिंग अग्रिम',
      orderOnWhatsApp: 'व्हाट्सएप पर ऑर्डर करें',
      call: 'कॉल करें',
      thBrand: 'ब्रांड',
      thCondition: 'स्थिति',
      thLaptopType: 'लैपटॉप प्रकार',
      thProcessorType: 'प्रोसेसर मॉडल',
      thProcessorSpeed: 'प्रोसेसर गति',
      thChipset: 'चिपसेट',
      thScreenSize: 'डिस्प्ले साइज़',
      thRam: 'रैम',
      thHardDisk: 'स्टोरेज / एसएसडी',
      thDiskType: 'डिस्क प्रकार',
      thGraphicsCard: 'ग्राफिक्स कार्ड',
      thAudioSpeaker: 'ऑडियो / स्पीकर',
      thNetworking: 'नेटवर्किंग',
      thWebcam: 'वेबकैम',
      thCardReader: 'कार्ड रीडर',
      thBatteryBackup: 'बैटरी बैकअप',
      thKeyboard: 'कीबोर्ड',
      thPortsSlots: 'पोर्ट्स और स्लॉट',
      thWeightColor: 'वजन और रंग',
      thCharger: 'चार्जर',
    },
  }[language] || {
    orderNow: 'Order Online',
    testedHealth: 'Tested & 100% Health',
    offerPrice: 'Special Offer Price',
    specsHeading: 'Laptop Full Specifications',
    verifiedBy: 'JHF LAPTOP ZONE Verified',
    warranty: 'Product Warranty',
    warranty30d: '30 Days Replacement Guarantee (Parts Included)',
    warranty5y: '05 Years Free Service Warranty',
    warrantyTerms: '1 Year SSD Replacement • 6 Months RAM Replacement • Lifetime Exchange Facility (Terms Apply)',
    highlights: 'Product Highlights & Overview:',
    readyToOrder: 'Ready to Order or Inquire?',
    deliveryAcross: 'Delivery across 64 districts in Bangladesh • 500-1000 Tk booking advance',
    orderOnWhatsApp: 'Order on WhatsApp',
    call: 'Call',
    thBrand: 'Brand',
    thCondition: 'Condition',
    thLaptopType: 'Laptop Type',
    thProcessorType: 'Processor Type',
    thProcessorSpeed: 'Processor Speed',
    thChipset: 'Chipset',
    thScreenSize: 'Screen Size',
    thRam: 'RAM',
    thHardDisk: 'Hard Disk / SSD',
    thDiskType: 'Disk Type',
    thGraphicsCard: 'Graphics Card',
    thAudioSpeaker: 'Audio / Speaker',
    thNetworking: 'Networking',
    thWebcam: 'Webcam',
    thCardReader: 'Card Reader',
    thBatteryBackup: 'Battery Backup',
    thKeyboard: 'Keyboard',
    thPortsSlots: 'Ports & Slots',
    thWeightColor: 'Weight & Color',
    thCharger: 'Charger',
  };

  const specs = getDetailedSpecsForLaptop(laptop);
  const numericVal =
    typeof (laptop as any).numericPrice === 'number'
      ? (laptop as any).numericPrice
      : parseInt(laptop.price.replace(/[^0-9]/g, ''), 10) || 35000;

  const whatsappMessage = encodeURIComponent(
    language === 'bn'
      ? `আসসালামু আলাইকুম JHF LAPTOP ZONE! আমি এই ল্যাপটপটি অর্ডার করতে চাই:\n\n*${laptop.title}*\nমূল্য: ${formatPrice(numericVal)}\nর‍্যাম: ${specs.ram}\nএসএসডি: ${specs.hardDisk}\nস্ক্রিন: ${specs.screenSize}\n\nদয়া করে স্টক ও ক্যাশ অন ডেলিভারি বিস্তারিত জানান।`
      : language === 'hi'
      ? `नमस्ते JHF LAPTOP ZONE! मैं यह लैपटॉप ऑर्डर करना चाहता हूँ:\n\n*${laptop.title}*\nमूल्य: ${formatPrice(numericVal)}\nरैम: ${specs.ram}\nएसएसडी: ${specs.hardDisk}\nस्क्रीन: ${specs.screenSize}\n\nकृपया उपलब्धता और डिलीवरी विवरण बताएं।`
      : `Hello JHF LAPTOP ZONE! I want to ORDER this laptop:\n\n*${laptop.title}*\nPrice: ${formatPrice(numericVal)}\nRAM: ${specs.ram}\nSSD: ${specs.hardDisk}\nScreen: ${specs.screenSize}\n\nPlease confirm availability, payment method (bKash/Nagad), and courier delivery details.`
  );

  const whatsappUrl = `https://wa.me/${STORE_INFO.whatsapp}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {laptop.brand}
            </span>
            <h2 className="font-bold text-base sm:text-lg text-slate-100 line-clamp-1">
              {laptop.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Top Overview Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="md:col-span-4 aspect-[16/11] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 relative flex items-center justify-center">
              <img
                src={laptop.image}
                alt={laptop.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {laptop.tag}
              </span>
            </div>

            <div className="md:col-span-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {specs.series}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {modalTexts.testedHealth}
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                  {laptop.title}
                </h1>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {laptop.specs}
                </p>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                    {modalTexts.offerPrice} {currency !== 'BDT' && `(${currency})`}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                      {formatPrice(numericVal)}
                    </span>
                    {currency !== 'BDT' && (
                      <span className="text-xs text-slate-400 font-mono">
                        (৳{numericVal.toLocaleString()} BDT)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onOrderNow && (
                    <button
                      onClick={() => onOrderNow(laptop)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 uppercase tracking-wide transition transform active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{modalTexts.orderNow}</span>
                    </button>
                  )}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm sm:text-base px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/30 uppercase tracking-wide transition transform active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5 fill-white" />
                    {modalTexts.orderOnWhatsApp}
                  </a>
                  <a
                    href={`tel:${STORE_INFO.phones[0].replace('-', '')}`}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-1.5 transition"
                  >
                    <PhoneCall className="w-4 h-4" />
                    {modalTexts.call}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Full Specification Table (Matching the Screenshot) */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                {modalTexts.specsHeading}
              </h3>
              <span className="text-xs text-slate-500 font-medium">{modalTexts.verifiedBy}</span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 w-1/3 sm:w-1/4 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thBrand}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{specs.brand}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thCondition}</td>
                    <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{specs.condition}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thLaptopType}</td>
                    <td className="py-2.5 px-4 text-slate-900 dark:text-white">{specs.laptopType}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thProcessorType}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{specs.processorType}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thProcessorSpeed}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.processorSpeed}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thChipset}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.chipset}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thScreenSize}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{specs.screenSize}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thRam}</td>
                    <td className="py-2.5 px-4 font-bold text-blue-600 dark:text-blue-400">{specs.ram}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thHardDisk}</td>
                    <td className="py-2.5 px-4 font-bold text-blue-600 dark:text-blue-400">{specs.hardDisk}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thDiskType}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.diskType}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thGraphicsCard}</td>
                    <td className="py-2.5 px-4 text-slate-900 dark:text-white font-semibold">{specs.graphicsCard}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thAudioSpeaker}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.audioSpeaker}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thNetworking}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.networking}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thWebcam}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.webcam}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thCardReader}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.cardReader}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thBatteryBackup}</td>
                    <td className="py-2.5 px-4 text-slate-900 dark:text-white font-medium">{specs.battery}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thKeyboard}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.keyboard}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thPortsSlots}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.portsSlots}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thWeightColor}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.productWeight} • {specs.color}</td>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60">
                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/60">{modalTexts.thCharger}</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{specs.charger}</td>
                  </tr>
                  <tr className="bg-blue-50/70 dark:bg-blue-950/40">
                    <td className="py-3 px-4 font-extrabold text-blue-900 dark:text-blue-300 border-r border-slate-200 dark:border-slate-800/60">
                      {modalTexts.warranty}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="inline-block bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded mr-2">
                          {modalTexts.warranty30d}
                        </div>
                        <div className="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                          {modalTexts.warranty5y}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {modalTexts.warrantyTerms}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Description Points */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              {modalTexts.highlights}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {specs.description.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom WhatsApp Order Bar */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-red-600/20">
            <div>
              <div className="font-bold text-base">{modalTexts.readyToOrder}</div>
              <div className="text-xs text-red-100">
                {modalTexts.deliveryAcross}
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white text-red-600 hover:bg-red-50 font-black text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 shadow transition transform active:scale-95 uppercase"
            >
              <MessageSquare className="w-4 h-4 fill-red-600" />
              {modalTexts.orderOnWhatsApp} (01935-693071)
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
