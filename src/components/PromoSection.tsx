import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useCustomer } from '../context/CustomerContext';
import { useTranslation } from '../context/LanguageContext';
import { LaptopItem } from '../data/jhfData';
import {
  Tag,
  Copy,
  Check,
  Share2,
  Sparkles,
  Gift,
  Percent,
  MessageSquare,
  Send,
  Laptop,
  CheckCircle2,
  Truck,
  ShieldCheck,
  FileText,
  Sliders,
  ExternalLink,
  Flame,
  Zap,
} from 'lucide-react';

interface PromoCoupon {
  code: string;
  titleEn: string;
  titleBn: string;
  titleHi: string;
  discountDescriptionEn: string;
  discountDescriptionBn: string;
  discountDescriptionHi: string;
  benefitEn: string;
  benefitBn: string;
  benefitHi: string;
  conditionEn: string;
  conditionBn: string;
  conditionHi: string;
  badgeEn: string;
  badgeBn: string;
  badgeHi: string;
  badgeColor: string;
  discountAmount?: number;
  freeDelivery?: boolean;
}

const PROMO_COUPONS: PromoCoupon[] = [
  {
    code: 'JHF-COMBO-2026',
    titleEn: 'Mega Combo & Discount',
    titleBn: 'মেগা কম্বো ও মূল্যছাড়',
    titleHi: 'मेगा कॉम्बो और छूट',
    discountDescriptionEn: '৳1,000 Instant Cash Discount',
    discountDescriptionBn: '৳১,০০০ সরাসরি মূল্যছাড়',
    discountDescriptionHi: '৳1,000 तत्काल नकद छूट',
    benefitEn: '৳1,000 instant discount on any ThinkPad or EliteBook laptop + 6 free gift combo pack!',
    benefitBn: 'যেকোনো ThinkPad বা EliteBook ল্যাপটপে ৳১,০০০ ইনস্ট্যান্ট ছাড় + ৬টি ফ্রি গিফট কম্বো প্যাক!',
    benefitHi: 'किसी भी ThinkPad या EliteBook लैपटॉप पर ৳1,000 की तत्काल छूट + 6 मुफ़्त उपहार कॉम्बो पैक!',
    conditionEn: 'Applicable on laptops with minimum price of ৳25,000',
    conditionBn: 'মিনিমাম ৳২৫,০০০ মূল্যের ল্যাপটপে প্রযোজ্য',
    conditionHi: 'न्यूनतम ৳25,000 मूल्य के लैपटॉप पर लागू',
    badgeEn: 'Most Popular',
    badgeBn: 'সবচেয়ে জনপ্রিয়',
    badgeHi: 'सबसे लोकप्रिय',
    badgeColor: 'bg-rose-600 text-white',
    discountAmount: 1000,
  },
  {
    code: 'FREEDELIVERY64',
    titleEn: 'Free Courier Delivery',
    titleBn: 'ফ্রি কুরিয়ার ডেলিভারি',
    titleHi: 'मुफ़्त कूरियर डिलीवरी',
    discountDescriptionEn: '100% Free Courier Delivery',
    discountDescriptionBn: 'সম্পূর্ণ ফ্রি কুরিয়ার ডেলিভারি',
    discountDescriptionHi: '100% मुफ़्त कूरियर डिलीवरी',
    benefitEn: 'Free home delivery & courier condition service across all 64 districts of Bangladesh (Save ৳150).',
    benefitBn: 'বাংলাদেশের ৬৪ জেলায় সম্পূর্ণ ফ্রি হোম ডেলিভারি ও কুরিয়ার কন্ডিশন সুবিধা (৳১৫০ সেভ)।',
    benefitHi: 'बांग्लादेश के सभी 64 जिलों में पूरी तरह से मुफ़्त होम डिलीवरी व कूरियर कंडीशन सुविधा (৳150 बचत)।',
    conditionEn: 'Applicable nationwide on any laptop order',
    conditionBn: 'যেকোনো ল্যাপটপ অর্ডারে দেশব্যাপী প্রযোজ্য',
    conditionHi: 'किसी भी लैपटॉप ऑर्डर पर देश भर में लागू',
    badgeEn: '64 Districts Special',
    badgeBn: '৬৪ জেলা স্পেশাল',
    badgeHi: '64 जिले विशेष',
    badgeColor: 'bg-emerald-600 text-white',
    freeDelivery: true,
  },
  {
    code: 'STUDENT-PROMO',
    titleEn: 'Student & Freelancer Pass',
    titleBn: 'স্টুডেন্ট ও ফ্রিল্যান্সার পাস',
    titleHi: 'विद्यार्थी और फ्रीलांसर पास',
    discountDescriptionEn: '৳1,500 Special Student Discount',
    discountDescriptionBn: '৳১,৫০০ বিশেষ ছাড়',
    discountDescriptionHi: '৳1,500 विशेष विद्यार्थी छूट',
    benefitEn: 'Special ৳1,500 discount for IT students, university scholars, and freelancers.',
    benefitBn: 'আইটি শিক্ষার্থী, বিশ্ববিদ্যালয় ছাত্রছাত্রী ও ফ্রিল্যান্সারদের জন্য স্পেশাল ৳১,৫০০ ছাড়।',
    benefitHi: 'आईटी छात्रों, विश्वविद्यालय के विद्यार्थियों और फ्रीलांसरों के लिए विशेष ৳1,500 की छूट।',
    conditionEn: 'Valid student ID or active freelancing profile required',
    conditionBn: 'স্টুডেন্ট আইডি বা ফ্রিল্যান্সিং প্রোফাইল লিংক প্রদর্শনযোগ্য',
    conditionHi: 'मान्य छात्र आईडी या सक्रिय फ्रीलांसिंग प्रोफाइल आवश्यक',
    badgeEn: 'Student Special',
    badgeBn: 'স্টুডেন্ট স্পেশাল',
    badgeHi: 'विद्यार्थी विशेष',
    badgeColor: 'bg-indigo-600 text-white',
    discountAmount: 1500,
  },
  {
    code: 'EXCHANGE-BONUS',
    titleEn: 'Trade-In Laptop Bonus',
    titleBn: 'ট্রেড-ইন ল্যাপটপ বোনাস',
    titleHi: 'ट्रेड-इन लैपटॉप बोनस',
    discountDescriptionEn: 'Up to ৳3,000 Extra Trade-In Bonus',
    discountDescriptionBn: '৳৩,০০০ পর্যন্ত অতিরিক্ত বোনাস',
    discountDescriptionHi: '৳3,000 तक अतिरिक्त ट्रेड-इन बोनस',
    benefitEn: 'Exchange any old working laptop to purchase a Dubai original laptop and receive an extra trade-in bonus.',
    benefitBn: 'আপনার যেকোনো পুরাতন রানিং ল্যাপটপ এক্সচেঞ্জ করে দুবাই অরিজিনাল ল্যাপটপ কিনলে অতিরিক্ত বোনাস।',
    benefitHi: 'अपने किसी भी पुराने लैपटॉप को एक्सचेंज करके दुबई ओरिजिनल लैपटॉप खरीदने पर अतिरिक्त बोनस पाएं।',
    conditionEn: 'Subject to in-store laptop physical and functional verification',
    conditionBn: 'শোরুমে ল্যাপটপ ভেরিফিকেশন সাপেক্ষে প্রযোজ্য',
    conditionHi: 'दुकान में लैपटॉप सत्यापन के अधीन लागू',
    badgeEn: 'Exchange Offer',
    badgeBn: 'এক্সচেঞ্জ অফার',
    badgeHi: 'एक्सचेंज ऑफर',
    badgeColor: 'bg-amber-600 text-white',
    discountAmount: 2000,
  },
];

const FREE_GIFTS = [
  {
    id: 'bag',
    titleEn: 'Premium Laptop Backpack',
    titleBn: 'প্রিমিয়াম ওয়াটার-প্রুফ ল্যাপটপ ব্যাকপ্যাক',
    titleHi: 'प्रीमियम वाटरप्रूफ लैपटॉप बैकपैक',
    icon: '🎒',
    worthEn: 'Worth ৳1,200',
    worthBn: '৳১,২০০ সমমূল্য',
    worthHi: 'मूल्य ৳1,200',
  },
  {
    id: 'mouse',
    titleEn: 'Optical Wireless / USB Mouse',
    titleBn: 'অপটিক্যাল সাইলেন্ট ক্লিক মাউস',
    titleHi: 'ऑप्टिकल साइलेंट माउस',
    icon: '🖱️',
    worthEn: 'Worth ৳450',
    worthBn: '৳৪৫০ সমমূল্য',
    worthHi: 'मूल्य ৳450',
  },
  {
    id: 'mousepad',
    titleEn: 'Ergonomic Gaming Mousepad',
    titleBn: 'অ্যান্টি-স্লিপ স্মুথ মাউসপ্যাড',
    titleHi: 'एंटी-स्लिप स्मूथ माउसपैड',
    icon: '📐',
    worthEn: 'Worth ৳200',
    worthBn: '৳২০০ সমমূল্য',
    worthHi: 'मूल्य ৳200',
  },
  {
    id: 'charger',
    titleEn: 'Original Fast Power Adapter',
    titleBn: 'অরিজিনাল হেভি পাওয়ার এডাপ্টার ও ক্যাবল',
    titleHi: 'ओरिजिनल फास्ट पावर एडॉप्टर',
    icon: '🔌',
    worthEn: 'Worth ৳1,800',
    worthBn: '৳১,৮০০ সমমূল্য',
    worthHi: 'मूल्य ৳1,800',
  },
  {
    id: 'cleaner',
    titleEn: 'Screen Cleaner & Microfiber',
    titleBn: 'ডিসপ্লে ক্লিনিং কিট ও মাইক্রোফাইবার ক্লোথ',
    titleHi: 'स्क्रीन क्लीनर और माइक्रोफाइबर कपड़ा',
    icon: '🧼',
    worthEn: 'Worth ৳150',
    worthBn: '৳১৫০ সমমূল্য',
    worthHi: 'मूल्य ৳150',
  },
  {
    id: 'warranty-card',
    titleEn: '5 Years Official Warranty Card',
    titleBn: '৫ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি কার্ড ও মেমো',
    titleHi: '5 वर्ष आधिकारिक वारंटी कार्ड व मेमो',
    icon: '📜',
    worthEn: 'Priceless Security',
    worthBn: 'অমূল্য নিরাপত্তা',
    worthHi: 'अमूल्य सुरक्षा',
  },
];

interface PromoSectionProps {
  onOrderWithPromo?: (laptop: LaptopItem, promoCode: string) => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ onOrderWithPromo }) => {
  const { laptops, storeInfo } = useStore();
  const { addToast } = useCustomer();
  const { language } = useTranslation();

  const isBn = language === 'bn';
  const isHi = language === 'hi';

  const texts = {
    badge: isBn
      ? 'মেগা প্রোমো ও মার্কেটিং পোস্ট জেনারেটর • স্পেশাল অফার ও প্রোমো টেক্সট'
      : isHi
      ? 'मेगा प्रोमो और मार्केटिंग पोस्ट जनरेटर • विशेष ऑफ़र और प्रोमो टेक्स्ट'
      : 'Mega Promo & Marketing Post Generator • Special Offers & Promo Text',
    title: isBn
      ? 'জেএইচএফ ল্যাপটপ জোন প্রোমো টেক্সট ও অফার হাব'
      : isHi
      ? 'जेएचएफ लैपटॉप ज़ोन प्रोमो टेक्स्ट और ऑफ़र हब'
      : 'JHF LAPTOP ZONE Promo Text & Offers Hub',
    readyPost: isBn ? '১০০% রেডি পোস্ট' : isHi ? '100% तैयार पोस्ट' : '100% Ready Post',
    subtitle: isBn
      ? 'ফেসবুক পেজ পোস্ট, হোয়াটসঅ্যাপ শেয়ারিং এবং স্পেশাল ডিসকাউন্ট কুপনের জন্য প্রস্তুতকৃত প্রমোশনাল টেক্সট সংগ্রহ করুন। সরাসরি কোড ও টেক্সট কপি করে অর্ডার বা ক্যাম্পেইনে ব্যবহার করতে পারেন।'
      : isHi
      ? 'फेसबुक पेज पोस्ट, व्हाट्सएप शेयरिंग और विशेष डिस्काउंट कूपन के लिए तैयार प्रचार टेक्स्ट प्राप्त करें। सीधे कोड और टेक्स्ट कॉपी करके उपयोग करें।'
      : 'Collect pre-crafted promotional texts for Facebook page posts, WhatsApp sharing, and special discount coupons. Copy promo codes and texts directly to use in your orders or marketing campaigns.',
    activeCoupons: isBn
      ? 'সচল ডিসকাউন্ট কুপন ও স্পেশাল অফার কোড'
      : isHi
      ? 'सक्रिय डिस्काउंट कूपन और विशेष प्रोमो कोड'
      : 'Active Discount Coupons & Special Promo Codes',
    clickToCopy: isBn
      ? 'ক্লিক করে কোড কপি করুন এবং অর্ডারে ছাড় পান'
      : isHi
      ? 'कोड कॉपी करने के लिए क्लिक करें और ऑर्डर पर छूट पाएं'
      : 'Click to copy code and get instant discount on order',
    copiedCheck: isBn ? 'কপিকৃত ✓' : isHi ? 'कॉपी हुआ ✓' : 'Copied ✓',
    copyCode: isBn ? 'কোড কপি করুন' : isHi ? 'कोड कॉपी करें' : 'Copy Code',
    freeGiftsPackage: isBn
      ? 'ল্যাপটপের সাথে ৬টি ফ্রি গিফট প্যাকেজ (৳৩,৮০০ সমমূল্যের কম্বো)'
      : isHi
      ? 'लैपटॉप के साथ 6 मुफ़्त उपहार पैकेज (৳3,800 मूल्य कॉम्बो)'
      : '6 Free Gifts Package with Every Laptop (৳3,800 Value Combo)',
    freeOffer: isBn ? '১০০% ফ্রি অফার' : isHi ? '100% मुफ़्त ऑफ़র' : '100% Free Offer',
    tabCurated: isBn
      ? 'জনপ্রিয় প্রোমো পোস্ট ফরম্যাট'
      : isHi
      ? 'लोकप्रिय प्रोमो पोस्ट प्रारूप'
      : 'Popular Promo Post Formats',
    tabGenerator: isBn
      ? 'কাস্টম প্রোমো জেনারেটর'
      : isHi
      ? 'कस्टम प्रोमो जनरेटर'
      : 'Custom Promo Generator',
    selectLaptop: isBn ? 'ল্যাপটপ নির্বাচন:' : isHi ? 'लैपटॉप चुनें:' : 'Select Laptop:',
    catFacebook: isBn
      ? '📌 ফেসবুক পেজ পোস্ট ফরম্যাট (Full Post)'
      : isHi
      ? '📌 फेसबुक पेज पोस्ट प्रारूप (Full Post)'
      : '📌 Facebook Page Post Format (Full Post)',
    catWhatsapp: isBn
      ? '💬 হোয়াটসঅ্যাপ ও এসএমএস শর্ট ফরম্যাট'
      : isHi
      ? '💬 व्हाट्सएप व एसएमएस संक्षिप्त प्रारूप'
      : '💬 WhatsApp & SMS Short Format',
    catCombo: isBn
      ? '🎁 মেগা গিফট কম্বো হাইলাইট টেক্সট'
      : isHi
      ? '🎁 मेगा उपहार कॉम्बो हाइलाइट टेक्स्ट'
      : '🎁 Mega Gift Combo Highlight Text',
    catDelivery: isBn
      ? '🚚 ৬৪ জেলায় ক্যাশ অন ডেলিভারি টেক্সট'
      : isHi
      ? '🚚 64 जिलों में कैश ऑन डिलीवरी नियम'
      : '🚚 64 Districts Cash on Delivery Terms',
    copyPromoText: isBn ? 'প্রোমো টেক্সট কপি করুন' : isHi ? 'प्रोमो टेक्स्ट कॉपी करें' : 'Copy Promo Text',
    copiedSuccess: isBn ? 'কপি হয়েছে!' : isHi ? 'कॉपी हुआ!' : 'Copied!',
    shareWhatsapp: isBn ? 'WhatsApp এ শেয়ার' : isHi ? 'WhatsApp पर साझा करें' : 'Share on WhatsApp',
    selectedLaptopLabel: isBn ? 'নির্বাচিত ল্যাপটপ:' : isHi ? 'चयनित लैपटॉप:' : 'Selected Laptop:',
    orderWithPromo: isBn
      ? 'প্রোমো অফারে এখনই অর্ডার করুন'
      : isHi
      ? 'प्रोमो ऑफ़र के साथ अभी ऑर्डर करें'
      : 'Order Now with Promo Offer',
    configTitle: isBn
      ? 'ল্যাপটপ ও অফার কনফিগারেশন'
      : isHi
      ? 'लैपटॉप और ऑफ़र कॉन्फ़िगरेशन'
      : 'Laptop & Offer Configuration',
    autoFillLabel: isBn ? 'ক্যাটালগ থেকে অটো-ফিল করুন:' : isHi ? 'कैटलॉग से ऑटो-फिल करें:' : 'Auto-fill from Catalog:',
    modelNameLabel: isBn ? 'মডেলের নাম / শিরোনাম:' : isHi ? 'मॉडल का नाम / शीर्षक:' : 'Model Name / Headline:',
    modelPlaceholder: isBn
      ? 'যেমন: HP EliteBook 840 G8 Core i5 11th Gen'
      : isHi
      ? 'जैसे: HP EliteBook 840 G8 Core i5 11th Gen'
      : 'e.g. HP EliteBook 840 G8 Core i5 11th Gen',
    specsLabel: isBn ? 'স্পেসিফিকেশন ও ফিচারস:' : isHi ? 'विनिर्देश और विशेषताएं:' : 'Specifications & Features:',
    priceLabel: isBn ? 'অফার প্রাইস:' : isHi ? 'ऑफ़र मूल्य:' : 'Offer Price:',
    appliedCouponLabel: isBn ? 'যুক্ত কুপন কোড:' : isHi ? 'लागू कूपन कोड:' : 'Attached Coupon Code:',
    freeGiftsSelectLabel: isBn
      ? 'ফ্রি গিফট আইটেম নির্বাচন করুন:'
      : isHi
      ? 'मुफ़्त उपहार आइटम चुनें:'
      : 'Select Free Gift Items:',
    livePreviewTitle: isBn
      ? 'রিয়েল-টাইম জেনারেটেড প্রোমো টেক্সট (Live Preview)'
      : isHi
      ? 'रीयल-टाइम जेनरेटेड प्रोमो टेक्स्ट (Live Preview)'
      : 'Real-Time Generated Promo Text (Live Preview)',
    copyTextBtn: isBn ? 'টেক্সট কপি করুন' : isHi ? 'टेक्स्ट कॉपी करें' : 'Copy Text',
    sendWhatsappBtn: isBn ? 'WhatsApp পাঠান' : isHi ? 'WhatsApp भेजें' : 'Send via WhatsApp',
    footerHint: isBn
      ? '💡 এই টেক্সট সরাসরি ফেসবুক গ্রুপ, মার্কেটপ্লেস বা ইনস্টাগ্রামে পোস্ট করতে পারবেন।'
      : isHi
      ? '💡 इस टेक्स्ट को सीधे फेसबुक ग्रुप, मार्केटप्लेस या इंस्टाग्राम पर पोस्ट कर सकते हैं।'
      : '💡 You can paste and post this text directly to Facebook groups, marketplace, or Instagram.',
    sendToShopBtn: isBn
      ? 'অফিসিয়াল শপ নম্বরে পাঠান'
      : isHi
      ? 'आधिकारिक दुकान नंबर पर भेजें'
      : 'Send to Official Shop Number',
  };

  // State for tabs
  const [activeTab, setActiveTab] = useState<'curated' | 'generator' | 'coupons'>('curated');
  const [curatedCategory, setCuratedCategory] = useState<'facebook' | 'whatsapp' | 'combo' | 'delivery'>('facebook');

  // Generator State
  const [selectedLaptopId, setSelectedLaptopId] = useState<string>(laptops[0]?.id || '');
  const [customTitle, setCustomTitle] = useState('');
  const [customSpecs, setCustomSpecs] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [selectedPromoCode, setSelectedPromoCode] = useState('JHF-COMBO-2026');
  const [selectedGifts, setSelectedGifts] = useState<string[]>([
    'bag',
    'mouse',
    'mousepad',
    'charger',
    'cleaner',
    'warranty-card',
  ]);

  // Copy tracker
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedLaptop = useMemo(() => {
    return laptops.find((l) => l.id === selectedLaptopId) || laptops[0];
  }, [laptops, selectedLaptopId]);

  const handleCopyText = (text: string, key: string, label = 'Promo text') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    const toastMsg = isBn
      ? `${label} সফলভাবে কপি হয়েছে! যেকোনো জায়গায় পেস্ট করুন।`
      : isHi
      ? `${label} सफलतापूर्वक कॉपी हो गया! कहीं भी पेस्ट करें।`
      : `${label} copied successfully! Paste anywhere.`;
    addToast(toastMsg, 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(`code-${code}`);
    const toastMsg = isBn
      ? `কুপন কোড "${code}" কপি হয়েছে! অর্ডারের সময় ব্যবহার করুন।`
      : isHi
      ? `कूपन कोड "${code}" कॉपी हुआ! ऑर्डर करते समय उपयोग करें।`
      : `Coupon code "${code}" copied! Use it during ordering.`;
    addToast(toastMsg, 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const toggleGift = (giftId: string) => {
    setSelectedGifts((prev) =>
      prev.includes(giftId) ? prev.filter((id) => id !== giftId) : [...prev, giftId]
    );
  };

  // Pre-crafted Curated Promo Texts in active language
  const curatedTexts = useMemo(() => {
    const featuredLaptop = selectedLaptop || laptops[0] || {
      title: 'Lenovo ThinkPad L14 Gen-2 (Core i5 11th Gen)',
      specs: 'Core i5 11th Gen • 16GB RAM • 512GB SSD • 14" FHD IPS • Iris Xe',
      price: '৳ 46,500',
      brand: 'Lenovo',
    };

    if (isBn) {
      const facebookPost = `🔥 ধামাকা মেগা অফার! দুবাই থেকে সরাসরি আমদানিকৃত ১০০% অরিজিনাল বিজনেস ল্যাপটপ!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ মডেল: ${featuredLaptop.title}
⚡ কনফিগারেশন / স্পেসিফিকেশন:
${featuredLaptop.specs.split('•').map((s) => `  ✔ ${s.trim()}`).join('\n')}

💰 রেগুলার প্রাইস: ৳ 49,500
🔥 অফার প্রাইস: ${featuredLaptop.price} (সীমিত সময়ের জন্য!)
🎁 প্রমোশন কোড: JHF-COMBO-2026 (৳১,০০০ ইনস্ট্যান্ট ছাড়)

🎁 ল্যাপটপের সাথে সম্পূর্ণ ফ্রিতে পাচ্ছেন ৬টি আকর্ষণীয় উপহার:
  1. 🎒 প্রিমিয়াম ওয়াটারপ্রুফ ল্যাপটপ ব্যাগ
  2. 🖱️ অপটিক্যাল মাউস
  3. 📐 গেমিং মাউসপ্যাড
  4. 🔌 অরিজিনাল পাওয়ার এডাপ্টার ও ক্যাবল
  5. 🧼 ডিসপ্লে ক্লিনার কিট
  6. 📜 ৫ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি কার্ড

🛡️ ওয়ারেন্টি পলিসি:
  ✅ ১ মাস ফুল ল্যাপটপ রিপ্লেসমেন্ট গ্যারান্টি (পার্টস সহ)
  ✅ ১ বছর SSD রিপ্লেসমেন্ট ও ৬ মাস RAM রিপ্লেসমেন্ট
  ✅ ৫ বছর সম্পূর্ণ ফ্রি সার্ভিস ওয়ারেন্টি
  ✅ লাইফ-টাইম এক্সচেঞ্জ সুবিধা

🚚 ডেলিভারি সুবিধা:
  দেশজুড়ে ৬৪ জেলায় ২৪ থেকে ৪৮ ঘণ্টার মধ্যে নিরাপদ ক্যাশ অন ডেলিভারি!
  কুরিয়ারে প্রোডাক্ট দেখে বুঝে নেওয়ার শতভাগ নিশ্চয়তা।

🏢 শোরুম ও যোগাযোগ:
  📍 মেইন অফিস: ${storeInfo.mainOffice || 'Shop 1001 & 1040, Multiplan Center, New Elephant Road, Dhaka'}
  📍 ব্রাঞ্চ অফিস: ${storeInfo.branchOffice || 'Baroipara Bazar, Chandra, Gazipur'}
  📞 হটলাইন: ${storeInfo.phones.join(' , ')}
  💬 সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন: https://wa.me/${storeInfo.whatsapp}
  🌐 ভিজিট করুন: https://${storeInfo.domain || 'www.jhflaptopzone.com'}`;

      const whatsappText = `*🔥 JHF LAPTOP ZONE • স্পেশাল প্রোমো অফার 🔥*
---------------------------------------
💻 *মডেল:* ${featuredLaptop.title}
⚙️ *স্পেক্স:* ${featuredLaptop.specs}
💵 *স্পেশাল অফার প্রাইস:* ${featuredLaptop.price}
🏷️ *কুপন কোড:* JHF-COMBO-2026

🎁 *৬টি ফ্রি গিফট আইটেম:*
ব্যাগ + মাউস + মাউসপ্যাড + অরিজিনাল চার্জার + স্ক্রিন ক্লিনার + ৫ বছরের ওয়ারেন্টি কার্ড!

🛡️ *ওয়ারেন্টি:* ১ মাস রিপ্লেসমেন্ট + ১ বছর SSD + ৫ বছর সার্ভিস ওয়ারেন্টি।
🚚 *ডেলিভারি:* ৬৪ জেলায় হোম ডেলিভারি ও কন্ডিশন সুবিধা।

📞 অর্ডার করতে কল বা হোয়াটসঅ্যাপ করুন: *${storeInfo.whatsappDisplay || '01935-693071'}*
🌐 ভিজিট করুন: https://${storeInfo.domain || 'www.jhflaptopzone.com'}`;

      const comboGiftsText = `🎁 JHF LAPTOP ZONE - মেগা গিফট কম্বো অফার 🎁
---------------------------------------------
আমাদের শোরুম থেকে যেকোনো দুবাই অরিজিনাল ল্যাপটপ কিনলেই পাচ্ছেন ৬টি প্রয়োজনীয় এক্সেসরিজ সম্পূর্ণ বিনামূল্যে:

1. 🎒 প্রিমিয়াম ল্যাপটপ ব্যাকপ্যাক (Worth ৳1,200)
2. 🖱️ হাই-স্পিড অপটিক্যাল মাউস (Worth ৳450)
3. 📐 অ্যান্টি-স্লিপ মাউসপ্যাড (Worth ৳200)
4. 🔌 অরিজিনাল ফাস্ট পাওয়ার এডাপ্টার (Worth ৳1,800)
5. 🧼 ডিসপ্লে ক্লিনার কিট ও মাইক্রোফাইবার ক্লোথ (Worth ৳150)
6. 📜 ৫ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি কার্ড ও ক্যাশ মেমো

✨ মোট ৳৩,৮০০ সমমূল্যের গিফট আইটেম প্রতিটি ল্যাপটপের সাথে পাচ্ছেন সম্পূর্ণ ফ্রি!
📲 দ্রুত অফার বুকিং করতে যোগাযোগ করুন: ${storeInfo.phones[0]} (WhatsApp: ${storeInfo.whatsappDisplay})`;

      const deliveryPolicyText = `🚚 ৬৪ জেলায় ক্যাশ অন ডেলিভারি ও কুরিয়ার বুকিং নিয়মাবলী
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JHF LAPTOP ZONE থেকে সারা বাংলাদেশে নিরাপদ কুরিয়ার সার্ভিসে ল্যাপটপ পাঠানোর নিয়ম:

১. কুরিয়ার বুকিং এর জন্য শুধুমাত্র কুরিয়ার চার্জ অগ্রিম বিকাশ/নগদে প্রদান করতে হবে।
২. অবশিষ্ট সম্পূর্ণ মূল্য ল্যাপটপ হাতে পেয়ে কুরিয়ার শাখায় চেক করে পরিশোধ করবেন।
৩. প্রতিটি ল্যাপটপ কাঠের ফ্রেম বা শক্ত বাবল-র‌্যাপ বক্সে ১০০% ইনস্যুরড হয়ে যায়, তাই পরিবহনে কোনো ক্ষতির ঝুঁকি নেই।
৪. কুরিয়ার রিসিট ও ট্র্যাকিং নম্বর পার্সেল পাঠানোর সাথে সাথেই কাস্টমারকে এসএমএস ও হোয়াটসঅ্যাপে পাঠিয়ে দেওয়া হয়।

হটলাইন: ${storeInfo.phones.join(' / ')}
ঠিকানা: মাল্টিপ্ল্যান সেন্টার, ঢাকা ও বাড়ইপাড়া বাজার, গাজীপুর।`;

      return { facebook: facebookPost, whatsapp: whatsappText, combo: comboGiftsText, delivery: deliveryPolicyText };
    }

    if (isHi) {
      const facebookPost = `🔥 महा मेगा ऑफ़र! दुबई से सीधे आयातित 100% मूल बिज़नेस लैपटॉप!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ मॉडल: ${featuredLaptop.title}
⚡ कॉन्फ़िगरेशन / स्पेसिफिकेशन:
${featuredLaptop.specs.split('•').map((s) => `  ✔ ${s.trim()}`).join('\n')}

💰 नियमित मूल्य: ৳ 49,500
🔥 ऑफ़र मूल्य: ${featuredLaptop.price} (सीमित समय के लिए!)
🎁 प्रोमो कोड: JHF-COMBO-2026 (৳1,000 तत्काल छूट)

🎁 हर लैपटॉप के साथ 6 उपयोगी मुफ़्त उपहार:
  1. 🎒 प्रीमियम वाटरप्रूफ लैपटॉप बैग
  2. 🖱️ ऑप्टिकल साइलेंट माउस
  3. 📐 एंटी-स्लिप गेमिंग माउसपैड
  4. 🔌 ओरिजिनल पावर एडॉप्टर और केबल
  5. 🧼 स्क्रीन क्लीनर किट
  6. 📜 5 साल का आधिकारिक सर्विस वारंटी कार्ड

🛡️ वारंटी नीति:
  ✅ 1 महीने की फुल लैपटॉप रिप्लेसमेंट गारंटी
  ✅ 1 साल एसएसडी और 6 महीने रैम रिप्लेसमेंट
  ✅ 5 साल पूरी तरह मुफ़्त सर्विस वारंटी
  ✅ लाइफटाइम एक्सचेंज सुविधा

🚚 डिलीवरी सेवा:
  देश भर के 64 जिलों में 24 से 48 घंटे के भीतर सुरक्षित कैश ऑन डिलीवरी!
  कूरियर पर लैपटॉप की जांच करने की 100% गारंटी।

🏢 शोरूम और संपर्क:
  📍 मुख्य कार्यालय: ${storeInfo.mainOffice || 'Shop 1001 & 1040, Multiplan Center, New Elephant Road, Dhaka'}
  📍 शाखा कार्यालय: ${storeInfo.branchOffice || 'Baroipara Bazar, Chandra, Gazipur'}
  📞 हॉटलाइन: ${storeInfo.phones.join(' , ')}
  💬 व्हाट्सएप पर ऑर्डर करें: https://wa.me/${storeInfo.whatsapp}
  🌐 विज़िट करें: https://${storeInfo.domain || 'www.jhflaptopzone.com'}`;

      const whatsappText = `*🔥 JHF LAPTOP ZONE • विशेष प्रोमो ऑफ़र 🔥*
---------------------------------------
💻 *मॉडल:* ${featuredLaptop.title}
⚙️ *स्पेक्स:* ${featuredLaptop.specs}
💵 *विशेष ऑफ़र मूल्य:* ${featuredLaptop.price}
🏷️ *कूपन कोड:* JHF-COMBO-2026

🎁 *6 मुफ़्त उपहार:*
बैकपैक + माउस + माउसपैड + ओरिजिनल चार्जर + स्क्रीन क्लीनर + 5 वर्ष वारंटी कार्ड!

🛡️ *वारंटी:* 1 माह रिप्लेसमेंट + 1 वर्ष SSD + 5 वर्ष सर्विस वारंटी।
🚚 *डिलीवरी:* 64 जिलों में कैश ऑन डिलीवरी व कूरियर सुविधा।

📞 ऑर्डर करने के लिए कॉल या व्हाट्सएप करें: *${storeInfo.whatsappDisplay || '01935-693071'}*
🌐 विज़िट करें: https://${storeInfo.domain || 'www.jhflaptopzone.com'}`;

      const comboGiftsText = `🎁 JHF LAPTOP ZONE - मेगा उपहार कॉम्बो ऑफ़र 🎁
---------------------------------------------
हमारे शोरूम से किसी भी दुबई ओरिजिनल लैपटॉप की खरीद पर 6 आवश्यक एक्सेसरीज़ पूरी तरह मुफ़्त:

1. 🎒 प्रीमियम लैपटॉप बैकपैक (मूल्य ৳1,200)
2. 🖱️ हाई-स्पीड ऑप्टिकल माउस (मूल्य ৳450)
3. 📐 एंटी-स्लिप माउसपैड (मूल्य ৳200)
4. 🔌 ओरिजिनल फास्ट पावर एडॉप्टर (मूल्य ৳1,800)
5. 🧼 डिस्प्ले क्लीनर किट व माइक्रोफाइबर कपड़ा (मूल्य ৳150)
6. 📜 5 साल का आधिकारिक सर्विस वारंटी कार्ड

✨ कुल ৳3,800 मूल्य के उपहार हर लैपटॉप के साथ बिल्कुल मुफ़्त!
📲 ऑफ़र बुक करने के लिए संपर्क करें: ${storeInfo.phones[0]} (WhatsApp: ${storeInfo.whatsappDisplay})`;

      const deliveryPolicyText = `🚚 64 जिलों में कैश ऑन डिलीवरी और कूरियर बुकिंग के नियम
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JHF LAPTOP ZONE से पूरे बांग्लादेश में सुरक्षित कूरियर से लैपटॉप भेजने की प्रक्रिया:

1. कूरियर बुकिंग के लिए केवल कूरियर चार्ज अग्रिम भुगतान करना होगा।
2. बाकी पूरी राशि लैपटॉप प्राप्त करके कूरियर शाखा में जांचने के बाद अदा करें।
3. प्रत्येक लैपटॉप लकड़ी के फ्रेम या मजबूत बबल रैप में 100% सुरक्षित पैक होता है।
4. पार्सल भेजने के तुरंत बाद ट्रैकिंग नंबर एसएमएस और व्हाट्सएप पर भेजा जाता है।

हॉटलाइन: ${storeInfo.phones.join(' / ')}
पता: मल्टीप्लान सेंटर, ढाका एवं बारोईपारा बाजार, गाजीपुर।`;

      return { facebook: facebookPost, whatsapp: whatsappText, combo: comboGiftsText, delivery: deliveryPolicyText };
    }

    // Default: Strict English
    const facebookPost = `🔥 MEGA PROMO OFFER! 100% Original Business Laptop Directly Imported from Dubai!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Model: ${featuredLaptop.title}
⚡ Configuration / Specifications:
${featuredLaptop.specs.split('•').map((s) => `  ✔ ${s.trim()}`).join('\n')}

💰 Regular Price: ৳ 49,500
🔥 Special Offer Price: ${featuredLaptop.price} (Limited Time Offer!)
🎁 Promotion Coupon Code: JHF-COMBO-2026 (৳1,000 Instant Discount)

🎁 Get 6 Essential Gift Items Completely Free with Every Laptop:
  1. 🎒 Premium Waterproof Laptop Backpack
  2. 🖱️ Optical Silent Click Mouse
  3. 📐 Anti-Slip Gaming Mousepad
  4. 🔌 Original Fast Power Adapter & Heavy Cable
  5. 🧼 Display Cleaning Kit & Microfiber Cloth
  6. 📜 5-Year Official Service Warranty Card & Memo

🛡️ Official Warranty Policy:
  ✅ 1 Month Full Laptop Replacement Guarantee (Including Hardware)
  ✅ 1 Year SSD Replacement & 6 Months RAM Replacement
  ✅ 5 Years 100% Free Lifetime Service Warranty
  ✅ Lifetime Exchange Privilege

🚚 Nationwide Courier Delivery:
  Safe Cash on Delivery across all 64 districts within 24 to 48 hours!
  100% assurance to inspect and verify product at courier before final payment.

🏢 Showroom & Contacts:
  📍 Main Office: ${storeInfo.mainOffice || 'Shop 1001 & 1040, Multiplan Center, New Elephant Road, Dhaka'}
  📍 Branch Office: ${storeInfo.branchOffice || 'Baroipara Bazar, Chandra, Gazipur'}
  📞 Hotline: ${storeInfo.phones.join(' , ')}
  💬 Direct WhatsApp Order: https://wa.me/${storeInfo.whatsapp}
  🌐 Visit: https://${storeInfo.domain || 'www.jhflaptopzone.com'}`;

    const whatsappText = `*🔥 JHF LAPTOP ZONE • Special Promo Offer 🔥*
---------------------------------------
💻 *Model:* ${featuredLaptop.title}
⚙️ *Specs:* ${featuredLaptop.specs}
💵 *Special Offer Price:* ${featuredLaptop.price}
🏷️ *Coupon Code:* JHF-COMBO-2026

🎁 *6 Free Gift Items:*
Backpack + Mouse + Mousepad + Original Adapter + Screen Cleaner + 5 Years Warranty Card!

🛡️ *Warranty:* 1 Month Replacement + 1 Year SSD + 5 Years Free Service Warranty.
🚚 *Delivery:* Cash on Delivery across 64 districts with inspection privilege.

📞 Call or WhatsApp to order: *${storeInfo.whatsappDisplay || '01935-693071'}*
🌐 Visit: https://${storeInfo.domain || 'www.jhflaptopzone.com'}`;

    const comboGiftsText = `🎁 JHF LAPTOP ZONE - Mega Gift Combo Offer 🎁
---------------------------------------------
Purchase any Dubai original laptop from our showroom and receive 6 essential accessories completely free:

1. 🎒 Premium Waterproof Laptop Backpack (Worth ৳1,200)
2. 🖱️ High-Speed Optical Mouse (Worth ৳450)
3. 📐 Anti-Slip Smooth Mousepad (Worth ৳200)
4. 🔌 Original Fast Power Adapter & Heavy Cable (Worth ৳1,800)
5. 🧼 Screen Cleaner Kit & Microfiber Cloth (Worth ৳150)
6. 📜 5 Years Official Service Warranty Card & Memo

✨ Total ৳3,800 worth of premium gift items included free with every single laptop!
📲 Fast Booking Hotline: ${storeInfo.phones[0]} (WhatsApp: ${storeInfo.whatsappDisplay})`;

    const deliveryPolicyText = `🚚 64 Districts Cash on Delivery & Courier Booking Guidelines
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Guidelines for nationwide safe courier laptop shipment from JHF LAPTOP ZONE:

1. For courier booking, only the delivery courier charge is paid in advance via bKash/Nagad.
2. The remaining full amount is paid at the courier branch upon receiving and inspecting the laptop.
3. Every laptop is safely packed in customized wooden frames or heavy bubble-wrapped boxes with 100% shipping insurance.
4. Courier parcel receipts and consignment tracking numbers are messaged via SMS & WhatsApp immediately upon shipment dispatch.

Hotlines: ${storeInfo.phones.join(' / ')}
Showrooms: Multiplan Center, Dhaka & Baroipara Bazar, Gazipur.`;

    return { facebook: facebookPost, whatsapp: whatsappText, combo: comboGiftsText, delivery: deliveryPolicyText };
  }, [selectedLaptop, laptops, storeInfo, isBn, isHi]);

  // Real-time generated text in active language
  const dynamicGeneratedText = useMemo(() => {
    const title = customTitle.trim() || selectedLaptop?.title || 'Lenovo ThinkPad Laptop';
    const specs = customSpecs.trim() || selectedLaptop?.specs || 'Core i5 • 16GB RAM • 512GB SSD';
    const price = customPrice.trim() || selectedLaptop?.price || '৳ 42,000';
    const coupon = PROMO_COUPONS.find((c) => c.code === selectedPromoCode) || PROMO_COUPONS[0];

    if (isBn) {
      const giftItemsList = FREE_GIFTS.filter((g) => selectedGifts.includes(g.id))
        .map((g, idx) => `  ${idx + 1}. ${g.icon} ${g.titleBn} (${g.worthBn})`)
        .join('\n');

      return `🔥 JHF LAPTOP ZONE এক্সক্লুসিভ প্রোমো পোস্ট 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 মডেল: ${title}
⚙️ স্পেসিফিকেশন: ${specs}
💵 অফার মূল্য: ${price}
🏷️ প্রোমো কোড: ${coupon.code} (${coupon.discountDescriptionBn})

🎁 ফ্রি গিফট আইটেমস:
${giftItemsList || '  ✔ স্ট্যান্ডার্ড পাওয়ার এডাপ্টার ও ক্যাবল'}

🛡️ ওয়ারেন্টি সুবিধা:
  • ১ মাস সম্পূর্ণ রিপ্লেসমেন্ট গ্যারান্টি
  • ১ বছর SSD রিপ্লেসমেন্ট ও ৬ মাস RAM রিপ্লেসমেন্ট
  • ৫ বছর লাইফটাইম ফ্রি সার্ভিসিং নিশ্চয়তা

🚚 কুরিয়ার ডেলিভারি:
  • ৬৪ জেলায় ক্যাশ অন ডেলিভারি সুবিধা
  • কাঠের বক্সে নিরাপদে পার্সেল হ্যান্ডওভার

📞 যোগাযোগ ও অর্ডার:
  • শোরুম: ${storeInfo.mainOffice || 'Shop 1001 & 1040, Multiplan, Dhaka'}
  • ব্রাঞ্চ: ${storeInfo.branchOffice || 'Baroipara Bazar, Chandra, Gazipur'}
  • মোবাইল: ${storeInfo.phones.join(' , ')}
  • হোয়াটসঅ্যাপ: https://wa.me/${storeInfo.whatsapp}
  • ওয়েবসাইট: https://${storeInfo.domain || 'www.jhflaptopzone.com'}`;
    }

    if (isHi) {
      const giftItemsList = FREE_GIFTS.filter((g) => selectedGifts.includes(g.id))
        .map((g, idx) => `  ${idx + 1}. ${g.icon} ${g.titleHi} (${g.worthHi})`)
        .join('\n');

      return `🔥 JHF LAPTOP ZONE एक्सक्लूसिव प्रोमो पोस्ट 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 मॉडल: ${title}
⚙️ स्पेसिफिकेशन: ${specs}
💵 ऑफ़र मूल्य: ${price}
🏷️ प्रोमो कोड: ${coupon.code} (${coupon.discountDescriptionHi})

🎁 मुफ़्त उपहार आइटम:
${giftItemsList || '  ✔ स्टैंडर्ड पावर एडॉप्टर और केबल'}

🛡️ वारंटी लाभ:
  • 1 महीना संपूर्ण रिप्लेसमेंट गारंटी
  • 1 वर्ष SSD रिप्लेसमेंट व 6 माह RAM रिप्लेसमेंट
  • 5 वर्ष लाइफटाइम फ्री सर्विस वारंटी

🚚 कूरियर डिलीवरी:
  • 64 जिलों में कैश ऑन डिलीवरी सुविधा
  • लकड़ी के बक्से में सुरक्षित पार्सल डिलीवरी

📞 संपर्क एवं ऑर्डर:
  • शोरूम: ${storeInfo.mainOffice || 'Shop 1001 & 1040, Multiplan, Dhaka'}
  • शाखा: ${storeInfo.branchOffice || 'Baroipara Bazar, Chandra, Gazipur'}
  • मोबाइल: ${storeInfo.phones.join(' , ')}
  • व्हाट्सएप: https://wa.me/${storeInfo.whatsapp}
  • वेबसाइट: https://${storeInfo.domain || 'www.jhflaptopzone.com'}`;
    }

    // Default: Strict English
    const giftItemsList = FREE_GIFTS.filter((g) => selectedGifts.includes(g.id))
      .map((g, idx) => `  ${idx + 1}. ${g.icon} ${g.titleEn} (${g.worthEn})`)
      .join('\n');

    return `🔥 JHF LAPTOP ZONE EXCLUSIVE PROMO POST 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 Model: ${title}
⚙️ Specifications: ${specs}
💵 Special Offer Price: ${price}
🏷️ Promo Coupon Code: ${coupon.code} (${coupon.discountDescriptionEn})

🎁 Free Gift Items Included:
${giftItemsList || '  ✔ Standard Power Adapter & Cable'}

🛡️ Official Warranty Protection:
  • 1 Month Full Laptop Replacement Guarantee
  • 1 Year SSD Replacement & 6 Months RAM Replacement
  • 5 Years Lifetime Free Service Warranty

🚚 Courier Delivery:
  • Cash on Delivery across all 64 districts
  • 100% safe wooden/bubble protective packaging

📞 Contact & Ordering:
  • Showroom: ${storeInfo.mainOffice || 'Shop 1001 & 1040, Multiplan, Dhaka'}
  • Branch: ${storeInfo.branchOffice || 'Baroipara Bazar, Chandra, Gazipur'}
  • Mobile: ${storeInfo.phones.join(' , ')}
  • WhatsApp: https://wa.me/${storeInfo.whatsapp}
  • Website: https://${storeInfo.domain || 'www.jhflaptopzone.com'}`;
  }, [customTitle, customSpecs, customPrice, selectedLaptop, selectedPromoCode, selectedGifts, storeInfo, isBn, isHi]);

  return (
    <section id="promo-zone" className="py-8 scroll-mt-20 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header */}
        <div className="relative z-10 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-orange-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black px-3 py-1.5 rounded-full mb-3 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>{texts.badge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-3">
            <span>{texts.title}</span>
            <span className="text-xs sm:text-sm font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
              {texts.readyPost}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
            {texts.subtitle}
          </p>
        </div>

        {/* Active Discount Promo Coupons Strip */}
        <div className="mb-10">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-rose-500" />
              <span>{texts.activeCoupons}</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              {texts.clickToCopy}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROMO_COUPONS.map((coupon) => {
              const isCopied = copiedKey === `code-${coupon.code}`;
              const couponBadge = isBn ? coupon.badgeBn : isHi ? coupon.badgeHi : coupon.badgeEn;
              const couponDiscount = isBn ? coupon.discountDescriptionBn : isHi ? coupon.discountDescriptionHi : coupon.discountDescriptionEn;
              const couponBenefit = isBn ? coupon.benefitBn : isHi ? coupon.benefitHi : coupon.benefitEn;
              const couponCondition = isBn ? coupon.conditionBn : isHi ? coupon.conditionHi : coupon.conditionEn;

              return (
                <div
                  key={coupon.code}
                  className="group relative border border-dashed border-rose-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 rounded-2xl p-4 bg-gradient-to-b from-rose-50/40 via-white to-white dark:from-slate-800/60 dark:via-slate-900 dark:to-slate-900 transition shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="mb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${coupon.badgeColor}`}>
                        {couponBadge}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        {isBn ? 'সক্রিয়' : isHi ? 'सक्रिय' : 'Active'}
                      </span>
                    </div>

                    <div className="font-mono text-base font-black text-rose-600 dark:text-rose-400 tracking-wider bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between mb-2">
                      <span>{coupon.code}</span>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        title={isBn ? 'কোড কপি করুন' : isHi ? 'कोड कॉपी करें' : 'Copy Code'}
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="font-extrabold text-xs text-slate-900 dark:text-white mb-1">
                      {couponDiscount}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      {couponBenefit}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      {couponCondition}
                    </span>
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
                    >
                      {isCopied ? texts.copiedCheck : texts.copyCode}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Free Gifts Showcase Bar */}
        <div className="mb-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {texts.freeGiftsPackage}
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              {texts.freeOffer}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FREE_GIFTS.map((gift) => {
              const giftTitle = isBn ? gift.titleBn : isHi ? gift.titleHi : gift.titleEn;
              const giftWorth = isBn ? gift.worthBn : isHi ? gift.worthHi : gift.worthEn;

              return (
                <div
                  key={gift.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center flex flex-col items-center justify-center shadow-xs"
                >
                  <span className="text-2xl mb-1.5">{gift.icon}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {giftTitle}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {giftWorth}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setActiveTab('curated')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'curated'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" />
              <span>{texts.tabCurated}</span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>{texts.tabGenerator}</span>
            </button>
          </div>

          {/* Quick Model Selector for Curated view */}
          {activeTab === 'curated' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">{texts.selectLaptop}</span>
              <select
                value={selectedLaptopId}
                onChange={(e) => setSelectedLaptopId(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {laptops.map((lp) => (
                  <option key={lp.id} value={lp.id}>
                    {lp.brand} • {lp.title} ({lp.price})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Curated Ready-to-Copy Promo Post Texts */}
        {activeTab === 'curated' && (
          <div className="space-y-6">
            {/* Category sub-navigation */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCuratedCategory('facebook')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  curatedCategory === 'facebook'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {texts.catFacebook}
              </button>

              <button
                onClick={() => setCuratedCategory('whatsapp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  curatedCategory === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {texts.catWhatsapp}
              </button>

              <button
                onClick={() => setCuratedCategory('combo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  curatedCategory === 'combo'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {texts.catCombo}
              </button>

              <button
                onClick={() => setCuratedCategory('delivery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  curatedCategory === 'delivery'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {texts.catDelivery}
              </button>
            </div>

            {/* Active text card */}
            <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">
                    {curatedCategory === 'facebook'
                      ? (isBn ? 'ফেসবুক পেজ প্রস্তুত প্রোমো টেক্সট' : isHi ? 'फेसबुक पेज तैयार प्रोमो टेक्स्ट' : 'Facebook Page Ready Promo Text')
                      : curatedCategory === 'whatsapp'
                      ? (isBn ? 'হোয়াটসঅ্যাপ ও মেসেঞ্জার দ্রুত শেয়ার টেক্সট' : isHi ? 'व्हाट्सएप और मैसेंजर फास्ट शेयर टेक्स्ट' : 'WhatsApp & Messenger Fast Share Text')
                      : curatedCategory === 'combo'
                      ? (isBn ? 'উপহার প্যাকেজ প্রোমোশনাল টেক্সট' : isHi ? 'उपहार पैकेज प्रचार टेक्स्ट' : 'Gift Package Promotional Text')
                      : (isBn ? 'ডেলিভারি ও কন্ডিশন শর্তাবলী টেক্সট' : isHi ? 'डिलीवरी और कंडीशन नियम टेक्स्ट' : 'Delivery Condition Terms Text')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Button */}
                  <button
                    onClick={() =>
                      handleCopyText(
                        curatedTexts[curatedCategory],
                        `curated-${curatedCategory}`,
                        isBn ? 'প্রোমো টেক্সট' : isHi ? 'प्रोमो टेक्स्ट' : 'Promo text'
                      )
                    }
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
                  >
                    {copiedKey === `curated-${curatedCategory}` ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{texts.copiedSuccess}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{texts.copyPromoText}</span>
                      </>
                    )}
                  </button>

                  {/* WhatsApp Forward Button */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(curatedTexts[curatedCategory])}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{texts.shareWhatsapp}</span>
                  </a>
                </div>
              </div>

              {/* Text Area / Monospace Pre */}
              <pre className="font-mono text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap text-slate-300 max-h-96 overflow-y-auto pr-2 select-all bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                {curatedTexts[curatedCategory]}
              </pre>

              {/* Quick Specs summary & Order CTA */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="text-slate-400">
                  {texts.selectedLaptopLabel} <strong className="text-white">{selectedLaptop?.title}</strong> ({selectedLaptop?.price})
                </div>

                {onOrderWithPromo && selectedLaptop && (
                  <button
                    onClick={() => onOrderWithPromo(selectedLaptop, 'JHF-COMBO-2026')}
                    className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5 transition"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{texts.orderWithPromo}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dynamic Custom Promo Builder */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <Sliders className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {texts.configTitle}
                  </span>
                </div>

                {/* Pre-fill from catalog dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {texts.autoFillLabel}
                  </label>
                  <select
                    value={selectedLaptopId}
                    onChange={(e) => {
                      setSelectedLaptopId(e.target.value);
                      const target = laptops.find((l) => l.id === e.target.value);
                      if (target) {
                        setCustomTitle(target.title);
                        setCustomSpecs(target.specs);
                        setCustomPrice(target.price);
                      }
                    }}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-medium text-slate-900 dark:text-white"
                  >
                    {laptops.map((lp) => (
                      <option key={lp.id} value={lp.id}>
                        {lp.brand} • {lp.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {texts.modelNameLabel}
                  </label>
                  <input
                    type="text"
                    value={customTitle || selectedLaptop?.title || ''}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={texts.modelPlaceholder}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Specs */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {texts.specsLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={customSpecs || selectedLaptop?.specs || ''}
                    onChange={(e) => setCustomSpecs(e.target.value)}
                    placeholder="Intel Core i5 • 16GB RAM • 512GB NVMe SSD • 14 FHD Display"
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Price & Promo Coupon */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {texts.priceLabel}
                    </label>
                    <input
                      type="text"
                      value={customPrice || selectedLaptop?.price || ''}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="৳ 42,500"
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {texts.appliedCouponLabel}
                    </label>
                    <select
                      value={selectedPromoCode}
                      onChange={(e) => setSelectedPromoCode(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                    >
                      {PROMO_COUPONS.map((cp) => {
                        const desc = isBn ? cp.discountDescriptionBn : isHi ? cp.discountDescriptionHi : cp.discountDescriptionEn;
                        return (
                          <option key={cp.code} value={cp.code}>
                            {cp.code} ({desc})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Free Gifts selector checkboxes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
                    {texts.freeGiftsSelectLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {FREE_GIFTS.map((g) => {
                      const isChecked = selectedGifts.includes(g.id);
                      const gTitle = isBn ? g.titleBn : isHi ? g.titleHi : g.titleEn;
                      return (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => toggleGift(g.id)}
                          className={`text-left p-2 rounded-lg border text-[11px] font-medium transition flex items-center gap-1.5 ${
                            isChecked
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="text-sm">{g.icon}</span>
                          <span className="truncate">{gTitle}</span>
                          {isChecked && <Check className="w-3 h-3 text-rose-600 ml-auto flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Live Preview Box (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {texts.livePreviewTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleCopyText(
                          dynamicGeneratedText,
                          'generator-text',
                          isBn ? 'কাস্টম প্রোমো টেক্সট' : isHi ? 'कस्टम प्रोमो टेक्स्ट' : 'Custom promo text'
                        )
                      }
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition"
                    >
                      {copiedKey === 'generator-text' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{texts.copiedCheck}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{texts.copyTextBtn}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(dynamicGeneratedText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{texts.sendWhatsappBtn}</span>
                    </a>
                  </div>
                </div>

                <pre className="font-mono text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap text-slate-300 max-h-[420px] overflow-y-auto pr-2 select-all bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  {dynamicGeneratedText}
                </pre>
              </div>

              {/* Action row */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 text-[11px]">
                  {texts.footerHint}
                </span>

                <a
                  href={`https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(
                    isBn
                      ? `আসসালামু আলাইকুম JHF Laptop Zone! আমি প্রোমো কোড ${selectedPromoCode} সহ এই কনফিগারেশনের ল্যাপটপটি অর্ডার করতে চাই:\n\n${dynamicGeneratedText}`
                      : isHi
                      ? `नमस्ते JHF Laptop Zone! मैं प्रोमो कोड ${selectedPromoCode} के साथ यह लैपटॉप ऑर्डर करना चाहता हूँ:\n\n${dynamicGeneratedText}`
                      : `Hello JHF Laptop Zone! I want to order this configured laptop with promo ${selectedPromoCode}:\n\n${dynamicGeneratedText}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{texts.sendToShopBtn}</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
