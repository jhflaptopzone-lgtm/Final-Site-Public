import React, { useState } from 'react';
import { useAdminStore } from '../admin/adminStore';
import { useTranslation } from '../context/LanguageContext';
import { OFFICIAL_BANK_ACCOUNTS, BankAccount } from '../data/jhfData';
import {
  dispatchOrderToOwner,
  generateAiWhatsAppOrderMessage,
  getOwnerWhatsAppUrl,
  OWNER_DISPLAY_PHONE,
  OWNER_WHATSAPP,
} from '../utils/aiOrderAutomation';
import {
  X,
  CheckCircle2,
  MessageSquare,
  PhoneCall,
  Truck,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Send,
  Copy,
  Check,
  Landmark,
} from 'lucide-react';

export interface OrderItemData {
  id: string;
  title: string;
  code?: string;
  sku?: string;
  price: number | string;
  image?: string;
  brand?: string;
  specs?: string;
}

interface CustomerOrderModalProps {
  laptop: OrderItemData | null;
  isOpen: boolean;
  onClose: () => void;
  sourceZone?: 'Recondition Zone' | 'Catalog' | 'Quick Order';
  initialPromoCode?: string;
}

export const CustomerOrderModal: React.FC<CustomerOrderModalProps> = ({
  laptop,
  isOpen,
  onClose,
  sourceZone = 'Catalog',
  initialPromoCode = '',
}) => {
  const { createOrder } = useAdminStore();
  const { formatPrice, currency, language } = useTranslation();

  const texts = {
    en: {
      modalTitle: 'Laptop Order Form',
      modalSubtitle: 'JHF Laptop Zone • Cash on Delivery & Courier Service',
      orderSuccessTitle: 'Order Successfully Placed!',
      orderIdLabel: 'Order ID:',
      thankYou: 'Thank you, your order has been received!',
      orderRegistered: 'Your order has been registered in our admin system and an automated AI WhatsApp dispatch message has been prepared.',
      deliveryAddressLabel: 'Delivery Address:',
      ownerWhatsAppNotice: 'Instant Direct Order WhatsApp Dispatch:',
      ownerWhatsAppHint: `If WhatsApp does not launch automatically, tap below to send your order copy directly to MD. Jahid Hasan (${OWNER_DISPLAY_PHONE}).`,
      sendWhatsAppBtn: `Send WhatsApp Message (${OWNER_DISPLAY_PHONE})`,
      copyMessageBtn: 'Copy Message',
      copied: 'Copied',
      closeWindowBtn: 'Close Window',
      discountBadge: 'Discount',
      courierFee: 'Courier',
      freeDelivery: 'Free Delivery',
      fullNameLabel: 'Your Full Name',
      fullNamePlaceholder: 'e.g. MD. Jahid Hasan',
      phoneLabel: 'Active Mobile Number',
      districtLabel: 'Delivery Area / District',
      districts: [
        { value: 'Dhaka', label: 'Dhaka City (Free Home Delivery)' },
        { value: 'Gazipur', label: 'Gazipur' },
        { value: 'Narayanganj', label: 'Narayanganj' },
        { value: 'Chattogram', label: 'Chattogram' },
        { value: 'Sylhet', label: 'Sylhet' },
        { value: 'Rajshahi', label: 'Rajshahi' },
        { value: 'Khulna', label: 'Khulna' },
        { value: 'Barishal', label: 'Barishal' },
        { value: 'Rangpur', label: 'Rangpur' },
        { value: 'Mymensingh', label: 'Mymensingh' },
        { value: 'Outside Dhaka', label: 'Outside Dhaka Other Districts (৳150 Courier)' },
      ],
      addressLabel: 'Detailed Delivery Address',
      addressPlaceholder: 'House / Road / Area / Landmark',
      promoLabel: 'Promo or Discount Coupon Code',
      promoPlaceholder: 'e.g. JHF-COMBO-2026 or FREEDELIVERY64',
      applyBtn: 'Apply',
      popularCodes: 'Popular codes:',
      paymentMethodLabel: 'Payment Method',
      codTitle: 'Cash on Delivery',
      codDesc: 'Inspect laptop upon delivery and pay the remaining balance.',
      bkashTitle: 'bKash / Nagad',
      bkashDesc: 'Courier advance payment via mobile banking.',
      bankTitle: 'Bank Transfer',
      bankDesc: 'Direct deposit or app transfer to official bank accounts.',
      selectBankLabel: '🏦 Please select payment bank account:',
      accNameLabel: '👤 Account Name:',
      accNumberLabel: '🔢 Account Number:',
      branchLabel: '🏢 Branch:',
      routingLabel: '🔁 Routing Number:',
      copyBtn: 'Copy',
      copiedBtn: 'Copied',
      advanceAmountLabel: 'Advance Paid Amount (৳)',
      depositSlipLabel: 'Bank Deposit Slip / TrxID / Ref No',
      bkashHotlineLabel: '📱 bKash / Nagad Merchant & Personal Number:',
      trxIdLabel: 'Transaction ID (TrxID)',
      deliveryNoteLabel: 'Special Requirements / Customer Note (Optional)',
      deliveryNotePlaceholder: 'e.g. Need Windows 11 setup, or deliver in the afternoon',
      aiNotice: `Upon placing your order, an automated notification will be dispatched to owner MD. Jahid Hasan's WhatsApp (${OWNER_DISPLAY_PHONE}).`,
      cancelBtn: 'Cancel',
      confirmOrderBtn: 'Confirm Order',
      processingBtn: 'Processing...',
      alertRequired: 'Please provide your full name, active mobile number, and detailed delivery address.',
      alertError: `Failed to process order. Please call our hotline directly: ${OWNER_DISPLAY_PHONE}`,
      promoActiveInitial: (code: string) => `Promo code ${code} is active!`,
      promoSavedCombo: '✅ ৳1,000 instant discount and 6-gift combo applied!',
      promoSavedDelivery: '✅ Free courier delivery applied across 64 districts!',
      promoSavedStudent: '✅ Student & freelancer ৳1,500 discount applied!',
      promoSavedExchange: '✅ Exchange bonus ৳2,000 discount applied!',
      promoSavedGeneric: (code: string) => `✅ Promo code ${code} successfully applied!`,
      promoInvalid: '❌ This promo code is invalid or expired.',
    },
    bn: {
      modalTitle: 'ল্যাপটপ অর্ডার ফর্ম',
      modalSubtitle: 'জেএইচএফ ল্যাপটপ জোন • সরাসরি ক্যাশ অন ডেলিভারি ও কুরিয়ার',
      orderSuccessTitle: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
      orderIdLabel: 'অর্ডার নং:',
      thankYou: 'ধন্যবাদ, আপনার অর্ডারটি গ্রহণ করা হয়েছে!',
      orderRegistered: 'অর্ডারটি আমাদের অ্যাডমিন প্যানেলে সফলভাবে জমা হয়েছে এবং স্বয়ংক্রিয় AI WhatsApp মেসেজ জেনারেট করা হয়েছে।',
      deliveryAddressLabel: 'ডেলিভারি ঠিকানা:',
      ownerWhatsAppNotice: 'মালিকের হোয়াটসঅ্যাপে তাৎক্ষণিক মেসেজ পাঠানোর ব্যবস্থা:',
      ownerWhatsAppHint: `ব্রাউজার সিকিউরিটির কারণে যদি হোয়াটসঅ্যাপ স্বয়ংক্রিয়ভাবে না খুলে থাকে, তাহলে নিচের বাটনে চাপ দিয়ে সরাসরি মোঃ জাহিদ হাসান (${OWNER_DISPLAY_PHONE})-এর হোয়াটসঅ্যাপে অর্ডারের কপি পাঠিয়ে দিন।`,
      sendWhatsAppBtn: `WhatsApp মেসেজ পাঠান (${OWNER_DISPLAY_PHONE})`,
      copyMessageBtn: 'মেসেজ কপি করুন',
      copied: 'কপি হয়েছে',
      closeWindowBtn: 'উইন্ডো বন্ধ করুন',
      discountBadge: 'ছাড়',
      courierFee: 'কুরিয়ার',
      freeDelivery: 'ফ্রি ডেলিভারি',
      fullNameLabel: 'আপনার পূর্ণ নাম',
      fullNamePlaceholder: 'যেমন: মোঃ কামরুল হাসান',
      phoneLabel: 'সচল মোবাইল নম্বর',
      districtLabel: 'ডেলিভারি এরিয়া / জেলা',
      districts: [
        { value: 'Dhaka', label: 'ঢাকা শহর (ফ্রি হোম ডেলিভারি)' },
        { value: 'Gazipur', label: 'গাজীপুর' },
        { value: 'Narayanganj', label: 'নারায়ণগঞ্জ' },
        { value: 'Chattogram', label: 'চট্টগ্রাম' },
        { value: 'Sylhet', label: 'সিলেট' },
        { value: 'Rajshahi', label: 'রাজশাহী' },
        { value: 'Khulna', label: 'খুলনা' },
        { value: 'Barishal', label: 'বরিশাল' },
        { value: 'Rangpur', label: 'রংপুর' },
        { value: 'Mymensingh', label: 'ময়মনসিংহ' },
        { value: 'Outside Dhaka', label: 'ঢাকার বাইরে অন্যান্য জেলা (৳১৫০ কুরিয়ার)' },
      ],
      addressLabel: 'বিস্তারিত ডেলিভারি ঠিকানা',
      addressPlaceholder: 'বাড়ি/রোড/এলাকা/নিকটস্থ ল্যান্ডমার্ক',
      promoLabel: 'প্রোমো বা ডিসকাউন্ট কুপন কোড (Promo Code)',
      promoPlaceholder: 'যেমন: JHF-COMBO-2026 বা FREEDELIVERY64',
      applyBtn: 'প্রয়োগ করুন',
      popularCodes: 'জনপ্রিয় কোড:',
      paymentMethodLabel: 'পেমেন্ট পদ্ধতি',
      codTitle: 'ক্যাশ অন ডেলিভারি',
      codDesc: 'প্রোডাক্ট দেখে বুঝে পেয়ে বাকি টাকা পরিশোধ করবেন।',
      bkashTitle: 'বিকাশ / নগদ',
      bkashDesc: 'মোবাইল ব্যাংকিংয়ে কুরিয়ার বুকিং অগ্রিম প্রদান।',
      bankTitle: 'ব্যাংক ট্রান্সফার',
      bankDesc: 'NRB, DBBL, BRAC ব্যাংকে সরাসরি ডিপোজিট বা অ্যাপ ট্রান্সফার।',
      selectBankLabel: '🏦 অনুগ্রহ করে পেমেন্টের ব্যাংক নির্বাচন করুন:',
      accNameLabel: '👤 Account Name:',
      accNumberLabel: '🔢 Account Number:',
      branchLabel: '🏢 Branch:',
      routingLabel: '🔁 Routing Number:',
      copyBtn: 'কপি',
      copiedBtn: 'কপি হয়েছে',
      advanceAmountLabel: 'প্রেরিত টাকার পরিমাণ (৳)',
      depositSlipLabel: 'ব্যাংক ডিপোজিট স্লিপ / TrxID / Ref No',
      bkashHotlineLabel: '📱 বিকাশ / নগদ মার্চেন্ট ও পার্সোনাল নম্বর:',
      trxIdLabel: 'ট্রানজেকশন আইডি (TrxID)',
      deliveryNoteLabel: 'বিশেষ কোনো রিকোয়ারমেন্ট / কাস্টমার নোট (ঐচ্ছিক)',
      deliveryNotePlaceholder: 'যেমন: উইন্ডোজ ১১ সেটাপ লাগবে, অথবা বিকেলে ডেলিভারি দিন',
      aiNotice: `অর্ডার প্লেস করার সাথে সাথে মোঃ জাহিদ হাসানের হোয়াটসঅ্যাপে (${OWNER_DISPLAY_PHONE}) আপনার নাম, নম্বর ও অর্ডার বিবরণী স্বয়ংক্রিয় মেসেজ আকারে চলে যাবে।`,
      cancelBtn: 'বাতিল করুন',
      confirmOrderBtn: 'অর্ডার নিশ্চিত করুন',
      processingBtn: 'প্রক্রিয়াধীন...',
      alertRequired: 'অনুগ্রহ করে আপনার নাম, সচল মোবাইল নম্বর এবং ডেলিভারির ঠিকানা লিখুন।',
      alertError: `অর্ডার প্রক্রিয়া করতে কিছুটা সমস্যা হয়েছে। অনুগ্রহ করে হটলাইনে সরাসরি কল করুন: ${OWNER_DISPLAY_PHONE}`,
      promoActiveInitial: (code: string) => `প্রোমো কোড ${code} অ্যাক্টিভ রয়েছে!`,
      promoSavedCombo: '✅ ৳১,০০০ সরাসরি মূল্যছাড় ও ৬টি ফ্রি গিফট কম্বো যুক্ত হয়েছে!',
      promoSavedDelivery: '✅ ৬৪ জেলায় সম্পূর্ণ ফ্রি কুরিয়ার ডেলিভারি প্রযোজ্য হয়েছে!',
      promoSavedStudent: '✅ স্টুডেন্ট ও ফ্রিল্যান্সার স্পেশাল ৳১,৫০০ ছাড় প্রযোজ্য হয়েছে!',
      promoSavedExchange: '✅ এক্সচেঞ্জ বোনাস ৳২,০০০ ছাড় প্রযোজ্য হয়েছে!',
      promoSavedGeneric: (code: string) => `✅ প্রোমো কোড ${code} সফলভাবে প্রয়োগ হয়েছে!`,
      promoInvalid: '❌ এই প্রোমো কোডটি সঠিক নয়।',
    },
    hi: {
      modalTitle: 'लैपटॉप ऑर्डर फॉर्म',
      modalSubtitle: 'जेएचएफ लैपटॉप ज़ोन • कैश ऑन डिलीवरी व कूरियर सेवा',
      orderSuccessTitle: 'ऑर्डर सफलतापूर्वक दर्ज किया गया!',
      orderIdLabel: 'ऑर्डर सं:',
      thankYou: 'धन्यवाद, आपका ऑर्डर प्राप्त हो गया है!',
      orderRegistered: 'ऑर्डर हमारे एडमिन पैनल में सफलतापूर्वक दर्ज कर लिया गया है और स्वचालित AI WhatsApp संदेश तैयार है।',
      deliveryAddressLabel: 'डिलीवरी पता:',
      ownerWhatsAppNotice: 'दुकान मालिक को तत्काल WhatsApp संदेश प्रेषण:',
      ownerWhatsAppHint: `यदि व्हाट्सएप स्वचालित रूप से नहीं खुलता है, तो नीचे दिए गए बटन पर क्लिक करके सीधे मोहम्मद ज़ाहिद हसन (${OWNER_DISPLAY_PHONE}) के व्हाट्सएप पर ऑर्डर की प्रति भेजें।`,
      sendWhatsAppBtn: `WhatsApp संदेश भेजें (${OWNER_DISPLAY_PHONE})`,
      copyMessageBtn: 'संदेश कॉपी करें',
      copied: 'कॉपी किया',
      closeWindowBtn: 'विंडो बंद करें',
      discountBadge: 'छूट',
      courierFee: 'कूरियर',
      freeDelivery: 'मुफ़्त डिलीवरी',
      fullNameLabel: 'आपका पूरा नाम',
      fullNamePlaceholder: 'उदा. राहुल कुमार',
      phoneLabel: 'सक्रिय मोबाइल नंबर',
      districtLabel: 'डिलीवरी क्षेत्र / ज़िला',
      districts: [
        { value: 'Dhaka', label: 'ढाका शहर (मुफ़्त होम डिलीवरी)' },
        { value: 'Gazipur', label: 'गाज़ीपुर' },
        { value: 'Narayanganj', label: 'नारायणगंज' },
        { value: 'Chattogram', label: 'चटगाँव' },
        { value: 'Sylhet', label: 'सिलहट' },
        { value: 'Rajshahi', label: 'राजशाही' },
        { value: 'Khulna', label: 'खुलना' },
        { value: 'Barishal', label: 'बरिशाल' },
        { value: 'Rangpur', label: 'रंगपुर' },
        { value: 'Mymensingh', label: 'मयमनसिंह' },
        { value: 'Outside Dhaka', label: 'ढाका के बाहर अन्य ज़िले (৳150 कूरियर)' },
      ],
      addressLabel: 'विस्तृत डिलीवरी पता',
      addressPlaceholder: 'मकान / सड़क / क्षेत्र / निकटतम लैंडमार्क',
      promoLabel: 'प्रोमो या छूट कूपन कोड (Promo Code)',
      promoPlaceholder: 'उदा. JHF-COMBO-2026 या FREEDELIVERY64',
      applyBtn: 'लागू करें',
      popularCodes: 'लोकप्रिय कोड:',
      paymentMethodLabel: 'भुगतान विधि',
      codTitle: 'कैश ऑन डिलीवरी',
      codDesc: 'उत्पाद देखकर संतुष्ट होने के बाद शेष राशि का भुगतान करें।',
      bkashTitle: 'bKash / Nagad',
      bkashDesc: 'मोबाइल बैंकिंग द्वारा कूरियर बुकिंग अग्रिम भुगतान।',
      bankTitle: 'बैंक ट्रांसफर',
      bankDesc: 'आधिकारिक बैंक खातों में सीधे जमा या ऐप ट्रांसफर।',
      selectBankLabel: '🏦 कृपया भुगतान बैंक खाता चुनें:',
      accNameLabel: '👤 Account Name:',
      accNumberLabel: '🔢 Account Number:',
      branchLabel: '🏢 Branch:',
      routingLabel: '🔁 Routing Number:',
      copyBtn: 'कॉपी',
      copiedBtn: 'कॉपी किया',
      advanceAmountLabel: 'अग्रिम भुगतान राशि (৳)',
      depositSlipLabel: 'बैंक जमा रसीद / TrxID / संदर्भ सं',
      bkashHotlineLabel: '📱 bKash / Nagad मर्चेंट व पर्सनल नंबर:',
      trxIdLabel: 'ट्रांजेक्शन आईडी (TrxID)',
      deliveryNoteLabel: 'विशेष आवश्यकताएं / ग्राहक नोट (वैकल्पिक)',
      deliveryNotePlaceholder: 'उदा. विंडोज़ 11 सेटअप चाहिए, या दोपहर में डिलीवरी करें',
      aiNotice: `ऑर्डर देते ही स्वचालित संदेश मालिक मोहम्मद ज़ाहिद हसन के व्हाट्सएप (${OWNER_DISPLAY_PHONE}) पर भेज दिया जाएगा।`,
      cancelBtn: 'रद्द करें',
      confirmOrderBtn: 'ऑर्डर की पुष्टि करें',
      processingBtn: 'प्रक्रियाधीन...',
      alertRequired: 'कृपया अपना नाम, सक्रिय मोबाइल नंबर और विस्तृत डिलीवरी पता दर्ज करें।',
      alertError: `ऑर्डर प्रोसेस करने में समस्या हुई। कृपया हमारी हॉटलाइन पर सीधे कॉल करें: ${OWNER_DISPLAY_PHONE}`,
      promoActiveInitial: (code: string) => `प्रोमो कोड ${code} सक्रिय है!`,
      promoSavedCombo: '✅ ৳1,000 तत्काल छूट और 6 मुफ़्त उपहार कॉम्बो लागू किए गए!',
      promoSavedDelivery: '✅ 64 जिलों में पूरी तरह मुफ़्त कूरियर डिलीवरी लागू!',
      promoSavedStudent: '✅ विद्यार्थी और फ्रीलांसर विशेष ৳1,500 छूट लागू!',
      promoSavedExchange: '✅ एक्सचेंज बोनस ৳2,000 छूट लागू!',
      promoSavedGeneric: (code: string) => `✅ प्रोमो कोड ${code} सफलतापूर्वक लागू किया गया!`,
      promoInvalid: '❌ यह प्रोमो कोड अमान्य है।',
    },
  }[language] || {
    modalTitle: 'Laptop Order Form',
    modalSubtitle: 'JHF Laptop Zone • Cash on Delivery & Courier Service',
    orderSuccessTitle: 'Order Successfully Placed!',
    orderIdLabel: 'Order ID:',
    thankYou: 'Thank you, your order has been received!',
    orderRegistered: 'Your order has been registered in our admin system and an automated AI WhatsApp dispatch message has been prepared.',
    deliveryAddressLabel: 'Delivery Address:',
    ownerWhatsAppNotice: 'Instant Direct Order WhatsApp Dispatch:',
    ownerWhatsAppHint: `If WhatsApp does not launch automatically, tap below to send your order copy directly to MD. Jahid Hasan (${OWNER_DISPLAY_PHONE}).`,
    sendWhatsAppBtn: `Send WhatsApp Message (${OWNER_DISPLAY_PHONE})`,
    copyMessageBtn: 'Copy Message',
    copied: 'Copied',
    closeWindowBtn: 'Close Window',
    discountBadge: 'Discount',
    courierFee: 'Courier',
    freeDelivery: 'Free Delivery',
    fullNameLabel: 'Your Full Name',
    fullNamePlaceholder: 'e.g. MD. Jahid Hasan',
    phoneLabel: 'Active Mobile Number',
    districtLabel: 'Delivery Area / District',
    districts: [
      { value: 'Dhaka', label: 'Dhaka City (Free Home Delivery)' },
      { value: 'Gazipur', label: 'Gazipur' },
      { value: 'Narayanganj', label: 'Narayanganj' },
      { value: 'Chattogram', label: 'Chattogram' },
      { value: 'Sylhet', label: 'Sylhet' },
      { value: 'Rajshahi', label: 'Rajshahi' },
      { value: 'Khulna', label: 'Khulna' },
      { value: 'Barishal', label: 'Barishal' },
      { value: 'Rangpur', label: 'Rangpur' },
      { value: 'Mymensingh', label: 'Mymensingh' },
      { value: 'Outside Dhaka', label: 'Outside Dhaka Other Districts (৳150 Courier)' },
    ],
    addressLabel: 'Detailed Delivery Address',
    addressPlaceholder: 'House / Road / Area / Landmark',
    promoLabel: 'Promo or Discount Coupon Code',
    promoPlaceholder: 'e.g. JHF-COMBO-2026 or FREEDELIVERY64',
    applyBtn: 'Apply',
    popularCodes: 'Popular codes:',
    paymentMethodLabel: 'Payment Method',
    codTitle: 'Cash on Delivery',
    codDesc: 'Inspect laptop upon delivery and pay the remaining balance.',
    bkashTitle: 'bKash / Nagad',
    bkashDesc: 'Courier advance payment via mobile banking.',
    bankTitle: 'Bank Transfer',
    bankDesc: 'Direct deposit or app transfer to official bank accounts.',
    selectBankLabel: '🏦 Please select payment bank account:',
    accNameLabel: '👤 Account Name:',
    accNumberLabel: '🔢 Account Number:',
    branchLabel: '🏢 Branch:',
    routingLabel: '🔁 Routing Number:',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
    advanceAmountLabel: 'Advance Paid Amount (৳)',
    depositSlipLabel: 'Bank Deposit Slip / TrxID / Ref No',
    bkashHotlineLabel: '📱 bKash / Nagad Merchant & Personal Number:',
    trxIdLabel: 'Transaction ID (TrxID)',
    deliveryNoteLabel: 'Special Requirements / Customer Note (Optional)',
    deliveryNotePlaceholder: 'e.g. Need Windows 11 setup, or deliver in the afternoon',
    aiNotice: `Upon placing your order, an automated notification will be dispatched to owner MD. Jahid Hasan's WhatsApp (${OWNER_DISPLAY_PHONE}).`,
    cancelBtn: 'Cancel',
    confirmOrderBtn: 'Confirm Order',
    processingBtn: 'Processing...',
    alertRequired: 'Please provide your full name, active mobile number, and detailed delivery address.',
    alertError: `Failed to process order. Please call our hotline directly: ${OWNER_DISPLAY_PHONE}`,
    promoActiveInitial: (code: string) => `Promo code ${code} is active!`,
    promoSavedCombo: '✅ ৳1,000 instant discount and 6-gift combo applied!',
    promoSavedDelivery: '✅ Free courier delivery applied across 64 districts!',
    promoSavedStudent: '✅ Student & freelancer ৳1,500 discount applied!',
    promoSavedExchange: '✅ Exchange bonus ৳2,000 discount applied!',
    promoSavedGeneric: (code: string) => `✅ Promo code ${code} successfully applied!`,
    promoInvalid: '❌ This promo code is invalid or expired.',
  };

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [paymentType, setPaymentType] = useState('Cash on Delivery (Courier Condition)');
  const [selectedBankId, setSelectedBankId] = useState<string>(OFFICIAL_BANK_ACCOUNTS[0]?.id || 'nrb-bank');
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [transactionId, setTransactionId] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  const copyBankDetail = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankField(field);
    setTimeout(() => setCopiedBankField(null), 2000);
  };

  // Promo Code State
  const [promoInput, setPromoInput] = useState(initialPromoCode);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(initialPromoCode || null);
  const [promoMessage, setPromoMessage] = useState<string>(
    initialPromoCode ? texts.promoActiveInitial(initialPromoCode) : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleteData, setOrderCompleteData] = useState<{
    orderNumber: string;
    whatsappUrl: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync initialPromoCode if prop changes
  React.useEffect(() => {
    if (initialPromoCode) {
      setPromoInput(initialPromoCode);
      setAppliedPromo(initialPromoCode);
      setPromoMessage(texts.promoSavedGeneric(initialPromoCode));
    }
  }, [initialPromoCode, language]);

  if (!isOpen || !laptop) return null;

  // Extract numerical price
  const numericPrice =
    typeof laptop.price === 'number'
      ? laptop.price
      : parseInt(String(laptop.price).replace(/[^0-9]/g, ''), 10) || 35000;

  // Calculate discount based on promo
  let discountAmount = 0;
  let isFreeDelivery = false;

  if (appliedPromo) {
    const cleanPromo = appliedPromo.trim().toUpperCase();
    if (cleanPromo === 'JHF-COMBO-2026') {
      discountAmount = 1000;
    } else if (cleanPromo === 'FREEDELIVERY64') {
      isFreeDelivery = true;
    } else if (cleanPromo === 'STUDENT-PROMO') {
      discountAmount = 1500;
    } else if (cleanPromo === 'EXCHANGE-BONUS') {
      discountAmount = 2000;
    } else if (cleanPromo === 'JHFPROMO') {
      discountAmount = 500;
    }
  }

  const baseDeliveryFee = district === 'Dhaka' ? 0 : 150;
  const finalDeliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;
  const finalPrice = Math.max(0, numericPrice - discountAmount);
  const totalAmount = finalPrice + finalDeliveryFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (!clean) {
      setAppliedPromo(null);
      setPromoMessage('');
      return;
    }

    if (
      clean === 'JHF-COMBO-2026' ||
      clean === 'FREEDELIVERY64' ||
      clean === 'STUDENT-PROMO' ||
      clean === 'EXCHANGE-BONUS' ||
      clean === 'JHFPROMO'
    ) {
      setAppliedPromo(clean);
      if (clean === 'JHF-COMBO-2026') {
        setPromoMessage(texts.promoSavedCombo);
      } else if (clean === 'FREEDELIVERY64') {
        setPromoMessage(texts.promoSavedDelivery);
      } else if (clean === 'STUDENT-PROMO') {
        setPromoMessage(texts.promoSavedStudent);
      } else if (clean === 'EXCHANGE-BONUS') {
        setPromoMessage(texts.promoSavedExchange);
      } else {
        setPromoMessage(texts.promoSavedGeneric(clean));
      }
    } else {
      setPromoMessage(texts.promoInvalid);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      alert(texts.alertRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedOrderNumber = 'JHF-ORD-' + Math.floor(10000 + Math.random() * 90000);

      const activeBank = OFFICIAL_BANK_ACCOUNTS.find((b) => b.id === selectedBankId) || OFFICIAL_BANK_ACCOUNTS[0];
      const resolvedPaymentMethod = paymentType.includes('Bank')
        ? `Bank Transfer (${activeBank.bankShortName})`
        : paymentType.includes('bKash')
        ? 'bKash'
        : paymentType.includes('Nagad')
        ? 'Nagad'
        : 'Cash on Delivery';

      // 1. Record directly into Enterprise Admin Store so it appears in the Admin Orders panel
      const newOrder = createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || `${customerPhone.replace(/\D/g, '')}@jhfcustomer.com`,
        deliveryAddress: shippingAddress.trim(),
        district: district,
        paymentMethod: resolvedPaymentMethod,
        paymentStatus: advancePaid > 0 ? (advancePaid >= totalAmount ? 'paid' : 'partially_paid') : 'pending',
        orderStatus: 'new',
        items: [
          {
            productId: laptop.id,
            productName: laptop.title,
            sku: laptop.code || laptop.sku || 'JHF-LP',
            price: numericPrice,
            quantity: 1,
            image: laptop.image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
          },
        ],
        subtotal: numericPrice,
        deliveryFee: finalDeliveryFee,
        discount: discountAmount,
        advancePaid: advancePaid,
        totalAmount: totalAmount,
        orderNotes: `${deliveryNote.trim()}${appliedPromo ? ` | Promo: ${appliedPromo}` : ''}${paymentType.includes('Bank') ? ` | Bank: ${activeBank.bankName} (A/C: ${activeBank.accountNumber})` : ''}${transactionId ? ` | TrxID/Ref: ${transactionId}` : ''} | Source: ${sourceZone}`,
        courierService: district === 'Dhaka' ? 'Home Delivery (Dhaka)' : 'Steadfast / SA Paribahan',
      });

      // 2. Prepare AI WhatsApp Automation Message
      const automationPayload = {
        orderNumber: newOrder.orderNumber || generatedOrderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: shippingAddress.trim(),
        district: district,
        productName: laptop.title,
        productCodeOrSku: laptop.code || laptop.sku || '',
        price: totalAmount,
        quantity: 1,
        advancePaid: advancePaid,
        paymentMethod: paymentType.includes('Bank')
          ? `Bank Transfer (${activeBank.bankName}, A/C: ${activeBank.accountNumber})`
          : paymentType,
        deliveryNote: `${deliveryNote.trim()}${appliedPromo ? ` [Promo: ${appliedPromo}]` : ''}${paymentType.includes('Bank') ? ` [Bank: ${activeBank.bankShortName}]` : ''}${transactionId ? ` (TrxID/Ref: ${transactionId})` : ''}`,
        sourceZone: sourceZone,
        language: language,
      };

      // 3. Dispatch to owner's WhatsApp (01935-693071)
      const dispatchResult = dispatchOrderToOwner(automationPayload);

      setOrderCompleteData({
        orderNumber: newOrder.orderNumber || generatedOrderNumber,
        whatsappUrl: dispatchResult.whatsappUrl,
        message: dispatchResult.message,
      });
    } catch (err) {
      console.error('Order creation failed:', err);
      alert(texts.alertError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySummary = () => {
    if (!orderCompleteData) return;
    navigator.clipboard.writeText(orderCompleteData.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetAndClose = () => {
    setOrderCompleteData(null);
    setCustomerName('');
    setCustomerPhone('');
    setShippingAddress('');
    setDeliveryNote('');
    setTransactionId('');
    setAdvancePaid(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">
                {orderCompleteData ? texts.orderSuccessTitle : texts.modalTitle}
              </h2>
              <p className="text-[11px] text-slate-300">
                {texts.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6">
          {orderCompleteData ? (
            /* Order Success & WhatsApp Dispatch Screen */
            <div className="text-center space-y-5 py-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                  {texts.orderIdLabel} #{orderCompleteData.orderNumber}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {texts.thankYou}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-md mx-auto leading-relaxed">
                  {texts.orderRegistered}
                </p>
              </div>

              {/* Product mini recap */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-left border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{laptop.title}</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {texts.deliveryAddressLabel} {shippingAddress}, {district}
                </div>
              </div>

              {/* Instant WhatsApp Action to Owner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  <Send className="w-4 h-4" />
                  <span>{texts.ownerWhatsAppNotice}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {texts.ownerWhatsAppHint}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={orderCompleteData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition uppercase tracking-wide"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>{texts.sendWhatsAppBtn}</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? texts.copied : texts.copyMessageBtn}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition"
                >
                  {texts.closeWindowBtn}
                </button>
              </div>
            </div>
          ) : (
            /* Order Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Product Info Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
                {laptop.image && (
                  <img
                    src={laptop.image}
                    alt={laptop.title}
                    className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                    {laptop.brand || 'JHF Laptop'}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {laptop.title}
                  </h4>
                  <div className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400 flex flex-wrap items-center gap-2">
                    <span>{formatPrice(numericPrice)}</span>
                    {currency !== 'BDT' && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        (৳{numericPrice.toLocaleString()} BDT)
                      </span>
                    )}
                    {discountAmount > 0 && (
                      <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        - {formatPrice(discountAmount)} {texts.discountBadge}
                      </span>
                    )}
                    {finalDeliveryFee > 0 ? (
                      <span className="text-slate-500 text-[10px] font-normal">+ {formatPrice(finalDeliveryFee)} {texts.courierFee}</span>
                    ) : (
                      <span className="text-emerald-600 text-[10px] font-bold">{texts.freeDelivery}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {texts.fullNameLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={texts.fullNamePlaceholder}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {texts.phoneLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* District & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {texts.districtLabel} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    {texts.districts.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {texts.addressLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={texts.addressPlaceholder}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full text-xs rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Promo Code & Discount Input Box */}
              <div className="bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-orange-50/70 dark:from-slate-800 dark:to-slate-850 border border-rose-200 dark:border-slate-700/90 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="text-rose-500">🏷️</span>
                    <span>{texts.promoLabel}</span>
                  </label>
                  {appliedPromo && (
                    <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                      Code: {appliedPromo}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder={texts.promoPlaceholder}
                    className="flex-1 text-xs font-mono font-bold uppercase rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    {texts.applyBtn}
                  </button>
                </div>

                {promoMessage && (
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {promoMessage}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{texts.popularCodes}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoInput('JHF-COMBO-2026');
                      setAppliedPromo('JHF-COMBO-2026');
                      setPromoMessage(texts.promoSavedCombo);
                    }}
                    className="underline hover:text-rose-600 font-mono"
                  >
                    JHF-COMBO-2026
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoInput('FREEDELIVERY64');
                      setAppliedPromo('FREEDELIVERY64');
                      setPromoMessage(texts.promoSavedDelivery);
                    }}
                    className="underline hover:text-rose-600 font-mono"
                  >
                    FREEDELIVERY64
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoInput('STUDENT-PROMO');
                      setAppliedPromo('STUDENT-PROMO');
                      setPromoMessage(texts.promoSavedStudent);
                    }}
                    className="underline hover:text-rose-600 font-mono"
                  >
                    STUDENT-PROMO
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {texts.paymentMethodLabel} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <label
                    className={`border rounded-xl p-2.5 flex items-start gap-2 cursor-pointer transition ${
                      paymentType.includes('Cash')
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType.includes('Cash')}
                      onChange={() => setPaymentType('Cash on Delivery (Courier Condition)')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-xs">
                        <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{texts.codTitle}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                        {texts.codDesc}
                      </p>
                    </div>
                  </label>

                  <label
                    className={`border rounded-xl p-2.5 flex items-start gap-2 cursor-pointer transition ${
                      paymentType.includes('bKash')
                        ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-950/40 text-pink-900 dark:text-pink-100'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType.includes('bKash')}
                      onChange={() => setPaymentType('bKash / Nagad (Advance ৳1000)')}
                      className="mt-0.5 text-pink-600"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-400">
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span>{texts.bkashTitle}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                        {texts.bkashDesc}
                      </p>
                    </div>
                  </label>

                  <label
                    className={`border rounded-xl p-2.5 flex items-start gap-2 cursor-pointer transition ${
                      paymentType.includes('Bank')
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType.includes('Bank')}
                      onChange={() => setPaymentType('Bank Transfer (Official Bank)')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                        <Landmark className="w-3.5 h-3.5 shrink-0" />
                        <span>{texts.bankTitle}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                        {texts.bankDesc}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* If Bank Transfer selected */}
              {paymentType.includes('Bank') && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-3.5 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1.5">
                      {texts.selectBankLabel}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {OFFICIAL_BANK_ACCOUNTS.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBankId(bank.id)}
                          className={`p-2 rounded-xl text-center border font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                            selectedBankId === bank.id
                              ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                              : 'bg-emerald-100/50 dark:bg-emerald-900/20 border-transparent text-slate-700 dark:text-slate-300 hover:bg-emerald-100'
                          }`}
                        >
                          <span className="text-[11px]">{bank.bankShortName}</span>
                          <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400 truncate max-w-full">
                            {bank.branch}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Bank Account Details Box */}
                  {(() => {
                    const activeBank =
                      OFFICIAL_BANK_ACCOUNTS.find((b) => b.id === selectedBankId) ||
                      OFFICIAL_BANK_ACCOUNTS[0];
                    return (
                      <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                          <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                            <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                            {activeBank.bankName}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {activeBank.accountType || 'Official Account'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-500 block">{texts.accNameLabel}</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {activeBank.accountName}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 block">{texts.accNumberLabel}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                {activeBank.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyBankDetail(activeBank.accountNumber, 'order-acc')}
                                className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 rounded text-[9px] font-bold text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
                              >
                                {copiedBankField === 'order-acc' ? texts.copiedBtn : texts.copyBtn}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 block">{texts.branchLabel}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {activeBank.branch}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 block">{texts.routingLabel}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {activeBank.routingNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyBankDetail(activeBank.routingNumber, 'order-routing')}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                              >
                                {copiedBankField === 'order-routing' ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>🌐 <strong>SWIFT:</strong> <span className="font-mono font-bold">{activeBank.swiftCode}</span></span>
                          <span className="text-emerald-600 font-medium">NPSB / BEFTN</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        {texts.advanceAmountLabel}
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1000"
                        value={advancePaid || ''}
                        onChange={(e) => setAdvancePaid(Number(e.target.value))}
                        className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        {texts.depositSlipLabel}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. FT2609..., Slip No, Sender A/C"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* If bKash/Nagad selected */}
              {paymentType.includes('bKash') && (
                <div className="bg-pink-50/80 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-pink-800 dark:text-pink-300">
                    {texts.bkashHotlineLabel} <span className="font-mono">{OWNER_DISPLAY_PHONE}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                        {texts.advanceAmountLabel}
                      </label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={advancePaid || ''}
                        onChange={(e) => setAdvancePaid(Number(e.target.value))}
                        className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-pink-300 dark:border-pink-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                        {texts.trxIdLabel}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9J83K21..."
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full text-xs rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-pink-300 dark:border-pink-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {texts.deliveryNoteLabel}
                </label>
                <input
                  type="text"
                  placeholder={texts.deliveryNotePlaceholder}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full text-xs rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* AI Dispatch Notice */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px]">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-500" />
                <span>{texts.aiNotice}</span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
                >
                  {texts.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition uppercase tracking-wide disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>{texts.processingBtn}</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{texts.confirmOrderBtn} ({formatPrice(totalAmount)})</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerOrderModal;
