export type Language = 'en' | 'bn' | 'hi';

export interface TranslationNav {
  laptops: string;
  recondition: string;
  promo: string;
  software: string;
  testing: string;
  os: string;
  reviews: string;
  warranty: string;
  payment: string;
  trackOrder: string;
}

export interface TranslationHero {
  title: string;
  subtitle: string;
  description: string;
  ctaShop: string;
  ctaRecondition: string;
}

export interface TranslationFeatures {
  tested: string;
  testedDesc: string;
  specs: string;
  specsDesc: string;
  warranty: string;
  warrantyDesc: string;
  delivery: string;
  deliveryDesc: string;
}

export interface TranslationDict {
  // Navigation & Hero structured objects
  nav: TranslationNav;
  hero: TranslationHero;
  features: TranslationFeatures;

  // Top Bar & Language
  hotline: string;
  whatsappSupport: string;
  testedLaptopsNotice: string;
  dhakaTime: string;
  languageSelect: string;
  
  // Navigation (flat fallbacks)
  navLaptops: string;
  navRecondition: string;
  navSoftware: string;
  navTestingTools: string;
  navOsIso: string;
  navWarranty: string;
  navPayment: string;
  trackOrder: string;
  compare: string;
  wishlist: string;
  adminLogin: string;
  exitAdmin: string;
  currency: string;

  // Hero
  heroTagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  shopLaptopsBtn: string;
  reconditionZoneBtn: string;
  softwareCenterBtn: string;
  contactUsBtn: string;
  storeOnlineStatus: string;
  testedDubaiBadge: string;
  guaranteeBadge: string;
  deliveryBadge: string;

  // AI Assistant
  aiAssistantTitle: string;
  aiAssistantSubtitle: string;
  aiAssistantBadge: string;
  aiFloatingLabel: string;
  aiInputPlaceholder: string;
  aiVoiceStart: string;
  aiVoiceListening: string;
  aiVoiceStop: string;
  aiVoiceUnsupported: string;
  aiVoiceMute: string;
  aiVoiceUnmute: string;
  aiVoiceReplay: string;
  aiVoiceSpeed: string;
  aiVoiceFemaleLabel: string;

  // Voice Ordering
  voiceOrderTitle: string;
  voiceOrderConfirmHeading: string;
  voiceOrderCustomer: string;
  voiceOrderPhone: string;
  voiceOrderAddress: string;
  voiceOrderCountry: string;
  voiceOrderProduct: string;
  voiceOrderPrice: string;
  voiceOrderPayment: string;
  voiceOrderConfirmBtn: string;
  voiceOrderEditBtn: string;
  voiceOrderCancelBtn: string;
  voiceOrderSuccess: string;
  openWhatsAppBtn: string;

  // Catalog
  catalogTitle: string;
  catalogSubtitle: string;
  searchPlaceholder: string;
  filterAll: string;
  filterPrice: string;
  filterProcessor: string;
  filterRam: string;
  orderNow: string;
  viewSpecs: string;
  addToCompare: string;
  inStock: string;
  outOfStock: string;
  warrantyYears: string;
  batteryBackup: string;

  // Download Center & Zones
  softwareCenterTitle: string;
  softwareCenterSubtitle: string;
  testingToolsTitle: string;
  testingToolsSubtitle: string;
  osCenterTitle: string;
  osCenterSubtitle: string;
  downloadBtn: string;
  downloading: string;
  version: string;
  size: string;
  rating: string;
  reviewsCount: string;

  // Reviews & Comments
  reviewsTitle: string;
  leaveReview: string;
  yourRating: string;
  yourComment: string;
  submitReview: string;
  noReviewsYet: string;

  // Footer & Offices
  mainOfficeLabel: string;
  branchOfficeLabel: string;
  mobileLabel: string;
  emailLabel: string;
  facebookLabel: string;
  webLabel: string;
  allRightsReserved: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    nav: {
      laptops: 'Laptops',
      recondition: 'Recondition Zone',
      promo: 'Hot Offers',
      software: 'Software Center',
      testing: 'Testing Tools',
      os: 'OS & Drivers',
      reviews: 'Reviews',
      warranty: 'Warranty Policy',
      payment: 'Offices & Payment',
      trackOrder: 'Track Order',
    },
    hero: {
      title: 'Premium Laptops.',
      subtitle: 'Tested. Trusted. Ready.',
      description: 'Authentic imported ThinkPad, EliteBook & Latitude enterprise laptops with motherboard stress-testing, honest battery benchmarks, and reliable warranty support.',
      ctaShop: 'SHOP LAPTOPS',
      ctaRecondition: 'RECONDITION ZONE',
    },
    features: {
      tested: 'Motherboard Stress Tested',
      testedDesc: 'Every unit passes multi-hour CPU, GPU, SSD and RAM diagnostics before dispatch.',
      specs: 'Authentic Specifications',
      specsDesc: 'Transparent serial numbers, original displays, and verified hardware configurations.',
      warranty: '30-Day Replacement Guarantee',
      warrantyDesc: 'Complete peace of mind with 2 to 5 years free technical service warranty.',
      delivery: '64 Districts Courier Delivery',
      deliveryDesc: 'Cash-on-delivery available across all Bangladesh districts with secure wooden packing.',
    },

    hotline: 'Hotline: 01731-693071',
    whatsappSupport: 'WhatsApp: 01935-693071',
    testedLaptopsNotice: '100% Tested Business Laptops • 64 Districts Delivery',
    dhakaTime: 'Dhaka Time:',
    languageSelect: 'Language',

    navLaptops: 'Laptops',
    navRecondition: 'Recondition Zone',
    navSoftware: 'Software Center',
    navTestingTools: 'Testing Tools',
    navOsIso: 'Operating Systems',
    navWarranty: 'Warranty Policy',
    navPayment: 'Offices & Payment',
    trackOrder: 'Track Order',
    compare: 'Compare',
    wishlist: 'Saved',
    adminLogin: 'Admin Login',
    exitAdmin: 'Exit Admin',
    currency: 'Currency',

    heroTagline: 'JHF LAPTOP ZONE',
    heroHeadline: 'Premium Laptops. Tested. Trusted. Ready.',
    heroSubheadline: 'Premium imported, used and reconditioned laptops with professional testing, transparent specifications and reliable support.',
    shopLaptopsBtn: 'SHOP LAPTOPS',
    reconditionZoneBtn: 'RECONDITION ZONE',
    softwareCenterBtn: 'SOFTWARE CENTER',
    contactUsBtn: 'CONTACT US',
    storeOnlineStatus: 'STORE ONLINE',
    testedDubaiBadge: 'Direct Dubai & Singapore Imports',
    guaranteeBadge: '30-Day Replacement Guarantee',
    deliveryBadge: 'Safe 64 Districts Courier Delivery',

    aiAssistantTitle: 'JHF AI Voice & Shopping Assistant',
    aiAssistantSubtitle: 'Natural Female Voice • Voice Ordering • Live Recommendations',
    aiAssistantBadge: 'Live Intelligence',
    aiFloatingLabel: 'JHF AI Assistant',
    aiInputPlaceholder: 'Ask specs, budget, testing tools or speak your order...',
    aiVoiceStart: 'Tap to Speak',
    aiVoiceListening: 'Listening to your voice...',
    aiVoiceStop: 'Stop Voice Input',
    aiVoiceUnsupported: 'Voice recognition is not supported in this browser. Please type your request.',
    aiVoiceMute: 'Mute Voice',
    aiVoiceUnmute: 'Unmute Voice',
    aiVoiceReplay: 'Replay Speech',
    aiVoiceSpeed: 'Speech Speed',
    aiVoiceFemaleLabel: 'Natural Female Voice Active',

    voiceOrderTitle: 'JHF Voice Order Confirmation',
    voiceOrderConfirmHeading: 'Please Review Your Order Details',
    voiceOrderCustomer: 'Customer Name',
    voiceOrderPhone: 'Phone Number',
    voiceOrderAddress: 'Delivery Address',
    voiceOrderCountry: 'Country / District',
    voiceOrderProduct: 'Product',
    voiceOrderPrice: 'Total Price',
    voiceOrderPayment: 'Payment Method',
    voiceOrderConfirmBtn: 'CONFIRM ORDER',
    voiceOrderEditBtn: 'EDIT DETAILS',
    voiceOrderCancelBtn: 'Cancel',
    voiceOrderSuccess: 'Order Created Successfully! Your order ID is',
    openWhatsAppBtn: 'OPEN WHATSAPP ORDER',

    catalogTitle: 'Featured Business Class Laptops',
    catalogSubtitle: 'Authentic ThinkPad, EliteBook, Latitude & ProBook tested rigorously on hardware benchmarks.',
    searchPlaceholder: 'Search by model (e.g. ThinkPad L14, Core i7, 16GB RAM)...',
    filterAll: 'All Laptops',
    filterPrice: 'Filter by Budget',
    filterProcessor: 'Processor',
    filterRam: 'RAM Size',
    orderNow: 'Order Now',
    viewSpecs: 'View Specifications',
    addToCompare: 'Add to Compare',
    inStock: 'In Stock',
    outOfStock: 'Sold Out',
    warrantyYears: 'Years Service Warranty',
    batteryBackup: 'Original Battery Backup',

    softwareCenterTitle: 'JHF Software Center',
    softwareCenterSubtitle: 'Verified essential utilities, drivers, and diagnostic tools for Windows laptops.',
    testingToolsTitle: 'JHF Hardware Testing Tools',
    testingToolsSubtitle: 'Pre-delivery testing software: SSD Health, BatteryMon, FurMark & Keyboard Test.',
    osCenterTitle: 'JHF Operating System Center',
    osCenterSubtitle: 'Clean official Windows 11 & Windows 10 ISO images and Intel VMD Rapid Storage drivers.',
    downloadBtn: 'Download',
    downloading: 'Preparing...',
    version: 'Version',
    size: 'File Size',
    rating: 'Rating',
    reviewsCount: 'Reviews',

    reviewsTitle: 'Customer Reviews & Feedback',
    leaveReview: 'Write a Verified Review',
    yourRating: 'Your Rating',
    yourComment: 'Your Feedback',
    submitReview: 'Submit Review',
    noReviewsYet: 'No reviews yet. Be the first to share your experience!',

    mainOfficeLabel: 'Main Office (Dhaka)',
    branchOfficeLabel: 'Branch Office (Gazipur)',
    mobileLabel: 'Mobile',
    emailLabel: 'Email',
    facebookLabel: 'Facebook',
    webLabel: 'Web',
    allRightsReserved: 'All rights reserved. Global Premium Technology Platform.',
  },

  bn: {
    nav: {
      laptops: 'ল্যাপটপ',
      recondition: 'রিকন্ডিশন জোন',
      promo: 'অফার জোন',
      software: 'সফটওয়্যার সেন্টার',
      testing: 'টেস্টিং টুলস',
      os: 'অপারেটিং সিস্টেম',
      reviews: 'রিভিউ',
      warranty: 'ওয়ারেন্টি পলিসি',
      payment: 'অফিস ও পেমেন্ট',
      trackOrder: 'অর্ডার ট্র্যাক',
    },
    hero: {
      title: 'প্রিমিয়াম ল্যাপটপ।',
      subtitle: 'টেস্টেড। বিশ্বস্ত। প্রস্তুত।',
      description: 'দুবাই ও সিঙ্গাপুর থেকে আমদানিকৃত অরিজিনাল ThinkPad, EliteBook ও Latitude ল্যাপটপ। ১০০% হার্ডওয়্যার ও মাদারবোর্ড টেস্টেড, স্বচ্ছ স্পেক্স ও দীর্ঘমেয়াদী সাপোর্ট।',
      ctaShop: 'ল্যাপটপ দেখুন',
      ctaRecondition: 'রিকন্ডিশন জোন',
    },
    features: {
      tested: 'মাদারবোর্ড স্ট্রেস টেস্টেড',
      testedDesc: 'প্রতিটি ল্যাপটপ ডেলিভারির পূর্বে দীর্ঘসময় CPU, GPU, SSD ও RAM ডায়াগনস্টিক সম্পন্ন করা হয়।',
      specs: 'জেনুইন স্পেসিফিকেশন',
      specsDesc: 'স্বচ্ছ সিরিয়াল নম্বর, অরিজিনাল ডিসপ্লে এবং সঠিক হার্ডওয়্যার কনফিগারেশন।',
      warranty: '৩০ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
      warrantyDesc: 'সম্পূর্ণ নিশ্চিন্তে কেনাকাটার জন্য সাথে থাকছে ২ থেকে ৫ বছরের ফ্রি সার্ভিস ওয়ারেন্টি।',
      delivery: '৬৪ জেলায় নিরাপদ ডেলিভারি',
      deliveryDesc: 'বাংলাদেশের সকল জেলায় ক্যাশ অন ডেলিভারি এবং কাঠের বাক্সে নিরাপদ প্যাকিং সুবিধা।',
    },

    hotline: 'হটলাইন: 01731-693071',
    whatsappSupport: 'হোয়াটসঅ্যাপ: 01935-693071',
    testedLaptopsNotice: '১০০% টেস্টেড বিজনেস ল্যাপটপ • ৬৪ জেলায় কুরিয়ার ডেলিভারি',
    dhakaTime: 'ঢাকা সময়:',
    languageSelect: 'ভাষা',

    navLaptops: 'ল্যাপটপ',
    navRecondition: 'রিকন্ডিশন জোন',
    navSoftware: 'সফটওয়্যার সেন্টার',
    navTestingTools: 'টেস্টিং টুলস',
    navOsIso: 'অপারেটিং সিস্টেম',
    navWarranty: 'ওয়ারেন্টি পলিসি',
    navPayment: 'অফিস ও পেমেন্ট',
    trackOrder: 'অর্ডার ট্র্যাক',
    compare: 'তুলনা',
    wishlist: 'সংরক্ষিত',
    adminLogin: 'অ্যাডমিন লগইন',
    exitAdmin: 'অ্যাডমিন প্রস্থান',
    currency: 'মুদ্রা',

    heroTagline: 'জেএইচএফ ল্যাপটপ জোন (JHF LAPTOP ZONE)',
    heroHeadline: 'প্রিমিয়াম ল্যাপটপ। টেস্টেড। বিশ্বস্ত। প্রস্তুত।',
    heroSubheadline: 'পেশাদার হার্ডওয়্যার টেস্টিং, স্বচ্ছ স্পেসিফিকেশন এবং নির্ভরযোগ্য সাপোর্টসহ প্রিমিয়াম আমদানিকৃত ও রিকন্ডিশনড ল্যাপটপ।',
    shopLaptopsBtn: 'ল্যাপটপ দেখুন',
    reconditionZoneBtn: 'রিকন্ডিশন জোন',
    softwareCenterBtn: 'সফটওয়্যার সেন্টার',
    contactUsBtn: 'যোগাযোগ করুন',
    storeOnlineStatus: 'স্টোর অনলাইন',
    testedDubaiBadge: 'দুবাই ও সিঙ্গাপুর সরাসরি আমদানিকৃত',
    guaranteeBadge: '৩০ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
    deliveryBadge: '৬৪ জেলায় নিরাপদ কন্ডিশনে কুরিয়ার',

    aiAssistantTitle: 'JHF এআই ভয়েস ও শপিং অ্যাসিস্ট্যান্ট',
    aiAssistantSubtitle: 'ন্যাচারাল ফিমেল ভয়েস • ভয়েস অর্ডার • লাইভ রিকমেন্ডেশন',
    aiAssistantBadge: 'লাইভ ইন্টেলিজেন্স',
    aiFloatingLabel: 'JHF এআই অ্যাসিস্ট্যান্ট',
    aiInputPlaceholder: 'স্পেক্স, বাজেট, সফটওয়্যার জানতে লিখুন বা ভয়েসে বলুন...',
    aiVoiceStart: 'মুখে বলতে ট্যাপ করুন',
    aiVoiceListening: 'আপনার কথা শুনছি...',
    aiVoiceStop: 'ভয়েস থামান',
    aiVoiceUnsupported: 'এই ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট করে না। অনুগ্রহ করে লিখে পাঠান।',
    aiVoiceMute: 'ভয়েস মিউট',
    aiVoiceUnmute: 'ভয়েস চালু',
    aiVoiceReplay: 'পুনরায় শুনুন',
    aiVoiceSpeed: 'ভয়েস স্পিড',
    aiVoiceFemaleLabel: 'ন্যাচারাল ফিমেল ভয়েস সক্রিয়',

    voiceOrderTitle: 'JHF ভয়েস অর্ডার নিশ্চিতকরণ',
    voiceOrderConfirmHeading: 'আপনার অর্ডারের তথ্যগুলো দেখে নিন',
    voiceOrderCustomer: 'গ্রাহকের নাম',
    voiceOrderPhone: 'মোবাইল নম্বর',
    voiceOrderAddress: 'ডেলিভারি ঠিকানা',
    voiceOrderCountry: 'দেশ / জেলা',
    voiceOrderProduct: 'পণ্য',
    voiceOrderPrice: 'মোট মূল্য',
    voiceOrderPayment: 'পেমেন্ট পদ্ধতি',
    voiceOrderConfirmBtn: 'অর্ডার নিশ্চিত করুন',
    voiceOrderEditBtn: 'তথ্য পরিবর্তন করুন',
    voiceOrderCancelBtn: 'বাতিল',
    voiceOrderSuccess: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে! অর্ডার নম্বর:',
    openWhatsAppBtn: 'হোয়াটসঅ্যাপে অর্ডার পাঠান',

    catalogTitle: 'জনপ্রিয় বিজনেস ক্লাস ল্যাপটপসমূহ',
    catalogSubtitle: 'ThinkPad, EliteBook, Latitude ও ProBook — অরিজিনাল মাদারবোর্ড ও ডিসপ্লে টেস্টেড।',
    searchPlaceholder: 'মডেল দিয়ে খুঁজুন (যেমন: ThinkPad L14, Core i7, 16GB RAM)...',
    filterAll: 'সকল ল্যাপটপ',
    filterPrice: 'বাজেট নির্বাচন',
    filterProcessor: 'প্রসেসর',
    filterRam: 'র‍্যামের আকার',
    orderNow: 'অর্ডার করুন',
    viewSpecs: 'পূর্ণ বিবরণ দেখুন',
    addToCompare: 'তুলনায় যোগ করুন',
    inStock: 'স্টকে আছে',
    outOfStock: 'স্টক শেষ',
    warrantyYears: 'বছরের ফ্রি সার্ভিস ওয়ারেন্টি',
    batteryBackup: 'অরিজিনাল ব্যাটারি ব্যাকআপ',

    softwareCenterTitle: 'জেএইচএফ সফটওয়্যার সেন্টার',
    softwareCenterSubtitle: 'উইন্ডোজ ল্যাপটপের জন্য দরকারি সিস্টেম সফটওয়্যার ও ড্রাইভারস।',
    testingToolsTitle: 'হার্ডওয়্যার টেস্টিং টুলস জোন',
    testingToolsSubtitle: 'ল্যাপটপ কেনার পূর্বে টেস্ট করার সফটওয়্যার: SSD Health, BatteryMon, FurMark ও Keyboard Test।',
    osCenterTitle: 'অপারেটিং সিস্টেম জোন',
    osCenterSubtitle: 'জেনুইন ক্লিন Windows 11 ও 10 ISO এবং 11th Gen ল্যাপটপের Intel VMD বুট ড্রাইভার।',
    downloadBtn: 'ডাউনলোড',
    downloading: 'প্রস্তুত হচ্ছে...',
    version: 'ভার্সন',
    size: 'ফাইলের আকার',
    rating: 'রেটিং',
    reviewsCount: 'মতামত',

    reviewsTitle: 'গ্রাহক রিভিউ ও মতামত',
    leaveReview: 'একটি রিভিউ লিখুন',
    yourRating: 'আপনার রেটিং',
    yourComment: 'আপনার মন্তব্য',
    submitReview: 'রিভিউ জমা দিন',
    noReviewsYet: 'এখনও কোনো রিভিউ নেই। প্রথম রিভিউটি আপনি দিন!',

    mainOfficeLabel: 'মূল কার্যালয় (ঢাকা)',
    branchOfficeLabel: 'শাখা কার্যালয় (গাজীপুর)',
    mobileLabel: 'মোবাইল',
    emailLabel: 'ইমেইল',
    facebookLabel: 'ফেসবুক',
    webLabel: 'ওয়েবসাইট',
    allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত। গ্লোবাল প্রিমিয়াম টেকনোলজি প্ল্যাটফর্ম।',
  },

  hi: {
    nav: {
      laptops: 'लैपटॉप',
      recondition: 'रिकंडीशन ज़ोन',
      promo: 'ऑफ़र ज़ोन',
      software: 'सॉफ्टवेयर सेंटर',
      testing: 'टेस्टिंग टूल्स',
      os: 'ऑपरेटिंग सिस्टम',
      reviews: 'समीक्षाएं',
      warranty: 'वारंटी नीति',
      payment: 'कार्यालय व भुगतान',
      trackOrder: 'ऑर्डर ट्रैक करें',
    },
    hero: {
      title: 'प्रीमियम लैपटॉप।',
      subtitle: 'टेस्टेड। भरोसेमंद। तैयार।',
      description: 'दुबई और सिंगापुर से सीधे आयातित ओरिजिनल ThinkPad, EliteBook और Latitude बिजनेस लैपटॉप। १००% हार्डवेयर व मदरबोर्ड परीक्षित, पारदर्शी विवरण और विश्वसनीय समर्थन।',
      ctaShop: 'लैपटॉप देखें',
      ctaRecondition: 'रिकंडीशन ज़ोन',
    },
    features: {
      tested: 'मदरबोर्ड स्ट्रेस टेस्टेड',
      testedDesc: 'प्रत्येक लैपटॉप की डिलीवरी से पहले CPU, GPU, SSD और RAM की गहन जांच की जाती है।',
      specs: 'प्रामाणिक विनिर्देश',
      specsDesc: 'पारदर्शी सीरियल नंबर, मूल डिस्प्ले और सत्यापित हार्डवेयर कॉन्फ़िगरेशन।',
      warranty: '३० दिनों की रिप्लेसमेंट गारंटी',
      warrantyDesc: '२ से ५ वर्ष की निःशुल्क तकनीकी सेवा वारंटी के साथ पूर्ण मानसिक शांति।',
      delivery: 'सुरक्षित कूरियर डिलीवरी',
      deliveryDesc: 'कैश ऑन डिलीवरी सुविधा और सुरक्षित लकड़ी की पैकिंग के साथ डिलीवरी।',
    },

    hotline: 'हॉटलाइन: 01731-693071',
    whatsappSupport: 'व्हाट्सएप: 01935-693071',
    testedLaptopsNotice: '१००% टेस्टेड बिजनेस लैपटॉप • ६४ जिलों में डिलीवरी',
    dhakaTime: 'ढाका समय:',
    languageSelect: 'भाषा',

    navLaptops: 'लैपटॉप',
    navRecondition: 'रिकंडीशन ज़ोन',
    navSoftware: 'सॉफ्टवेयर सेंटर',
    navTestingTools: 'टेस्टिंग टूल्स',
    navOsIso: 'ऑपरेटिंग सिस्टम',
    navWarranty: 'वारंटी नीति',
    navPayment: 'कार्यालय व भुगतान',
    trackOrder: 'ऑर्डर ट्रैक करें',
    compare: 'तुलना करें',
    wishlist: 'सहेजे गए',
    adminLogin: 'एडमिन लॉगिन',
    exitAdmin: 'एडमिन से बाहर',
    currency: 'मुद्रा',

    heroTagline: 'जेएचएफ लैपटॉप ज़ोन (JHF LAPTOP ZONE)',
    heroHeadline: 'प्रीमियम लैपटॉप। टेस्टेड। भरोसेमंद। तैयार।',
    heroSubheadline: 'पेशेवर हार्डवेयर परीक्षण, पारदर्शी विनिर्देशों और विश्वसनीय समर्थन के साथ प्रीमियम आयातित और रीकंडीशन्ड लैपटॉप।',
    shopLaptopsBtn: 'लैपटॉप देखें',
    reconditionZoneBtn: 'रिकंडीशन ज़ोन',
    softwareCenterBtn: 'सॉफ्टवेयर सेंटर',
    contactUsBtn: 'संपर्क करें',
    storeOnlineStatus: 'स्टोर ऑनलाइन',
    testedDubaiBadge: 'दुबई और सिंगापुर से सीधे आयातित',
    guaranteeBadge: '३० दिनों की रिप्लेसमेंट गारंटी',
    deliveryBadge: 'सुरक्षित कूरियर डिलीवरी',

    aiAssistantTitle: 'JHF एआई वॉयस व शॉपिंग सहायक',
    aiAssistantSubtitle: 'प्राकृतिक महिला आवाज़ • वॉयस ऑर्डर • लाइव सिफारिशें',
    aiAssistantBadge: 'लाइव इंटेलिजेंस',
    aiFloatingLabel: 'JHF एआई सहायक',
    aiInputPlaceholder: 'स्पेक्स, बजट, टेस्टिंग टूल्स के बारे में पूछें या बोलें...',
    aiVoiceStart: 'बोलने के लिए टैप करें',
    aiVoiceListening: 'आपकी आवाज़ सुन रहे हैं...',
    aiVoiceStop: 'वॉयस इनपुट रोकें',
    aiVoiceUnsupported: 'इस ब्राउज़र में वॉयस पहचान समर्थित नहीं है। कृपया टाइप करें।',
    aiVoiceMute: 'आवाज़ म्यूट करें',
    aiVoiceUnmute: 'आवाज़ चालू करें',
    aiVoiceReplay: 'फिर से सुनें',
    aiVoiceSpeed: 'आवाज़ की गति',
    aiVoiceFemaleLabel: 'प्राकृतिक महिला आवाज़ सक्रिय',

    voiceOrderTitle: 'JHF वॉयस ऑर्डर पुष्टिकरण',
    voiceOrderConfirmHeading: 'कृपया अपने ऑर्डर के विवरण की समीक्षा करें',
    voiceOrderCustomer: 'ग्राहक का नाम',
    voiceOrderPhone: 'मोबाइल नंबर',
    voiceOrderAddress: 'डिलीवरी का पता',
    voiceOrderCountry: 'देश / जिला',
    voiceOrderProduct: 'उत्पाद',
    voiceOrderPrice: 'कुल मूल्य',
    voiceOrderPayment: 'भुगतान का तरीका',
    voiceOrderConfirmBtn: 'ऑर्डर की पुष्टि करें',
    voiceOrderEditBtn: 'विवरण संपादित करें',
    voiceOrderCancelBtn: 'रद्द करें',
    voiceOrderSuccess: 'ऑर्डर सफलतापूर्वक बनाया गया! आपका ऑर्डर आईडी है',
    openWhatsAppBtn: 'व्हाट्सएप ऑर्डर खोलें',

    catalogTitle: 'प्रीमियम बिजनेस क्लास लैपटॉप',
    catalogSubtitle: 'ThinkPad, EliteBook, Latitude और ProBook — १००% परीक्षण किए गए।',
    searchPlaceholder: 'मॉडल खोजें (उदा: ThinkPad L14, Core i7, 16GB RAM)...',
    filterAll: 'सभी लैपटॉप',
    filterPrice: 'बजट के अनुसार',
    filterProcessor: 'प्रोसेसर',
    filterRam: 'रैम का आकार',
    orderNow: 'अभी ऑर्डर करें',
    viewSpecs: 'विनिर्देश देखें',
    addToCompare: 'तुलना में जोड़ें',
    inStock: 'स्टॉक में उपलब्ध',
    outOfStock: 'बिक चुका है',
    warrantyYears: 'वर्षों की सर्विस वारंटी',
    batteryBackup: 'मूल बैटरी बैकअप',

    softwareCenterTitle: 'JHF सॉफ्टवेयर सेंटर',
    softwareCenterSubtitle: 'विंडोज लैपटॉप के लिए सत्यापित आवश्यक उपयोगिताएं और ड्राइवर।',
    testingToolsTitle: 'हार्डवेयर टेस्टिंग टूल्स ज़ोन',
    testingToolsSubtitle: 'लैपटॉप परीक्षण सॉफ्टवेयर: SSD Health, BatteryMon, FurMark व Keyboard Test।',
    osCenterTitle: 'ऑपरेटिंग सिस्टम ज़ोन',
    osCenterSubtitle: 'क्लीन आधिकारिक Windows 11 व 10 ISO और 11th Gen Intel VMD ड्राइवर।',
    downloadBtn: 'डाउनलोड करें',
    downloading: 'तैयारी जारी...',
    version: 'संस्करण',
    size: 'फ़ाइल का आकार',
    rating: 'रेटिंग',
    reviewsCount: 'समीक्षाएं',

    reviewsTitle: 'ग्राहक समीक्षा और प्रतिक्रिया',
    leaveReview: 'सत्यापित समीक्षा लिखें',
    yourRating: 'आपकी रेटिंग',
    yourComment: 'आपकी प्रतिक्रिया',
    submitReview: 'समीक्षा भेजें',
    noReviewsYet: 'अभी कोई समीक्षा नहीं है। अपना अनुभव साझा करने वाले पहले व्यक्ति बनें!',

    mainOfficeLabel: 'मुख्य कार्यालय (ढाका)',
    branchOfficeLabel: 'शाखा कार्यालय (गाज़ीपुर)',
    mobileLabel: 'मोबाइल',
    emailLabel: 'ईमेल',
    facebookLabel: 'फेसबुक',
    webLabel: 'वेबसाइट',
    allRightsReserved: 'सर्वाधिकार सुरक्षित। ग्लोबल प्रीमियम टेक्नोलॉजी प्लेटफॉर्म।',
  },
};
