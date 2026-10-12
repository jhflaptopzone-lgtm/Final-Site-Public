import React, { useState } from 'react';
import { useAdminStore } from '../admin/adminStore';
import { useCustomer } from '../context/CustomerContext';
import { useTranslation } from '../context/LanguageContext';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  PhoneCall,
  MessageSquare,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
} from 'lucide-react';
import { OWNER_DISPLAY_PHONE, OWNER_WHATSAPP } from '../utils/aiOrderAutomation';

export const TrackOrderModal: React.FC = () => {
  const { orders } = useAdminStore();
  const { isTrackingModalOpen, setIsTrackingModalOpen, trackingQuery, setTrackingQuery } = useCustomer();
  const { formatPrice, language } = useTranslation();
  const [searched, setSearched] = useState(false);

  const texts = {
    en: {
      modalTitle: 'Live Order Tracking',
      modalSubtitle: 'Track your laptop courier dispatch & delivery status',
      inputPlaceholder: 'Enter Order ID (e.g. JHF-ORD-12345) or Phone Number...',
      trackBtn: 'Track',
      orderRef: 'Order Reference',
      steps: [
        { key: 'new', label: 'Order Placed', desc: 'Customer placed order online' },
        { key: 'confirmed', label: 'Confirmed', desc: 'Verified by JHF sales team' },
        { key: 'processing', label: 'Processing', desc: 'Hardware tested & packed' },
        { key: 'shipped', label: 'Shipped', desc: 'Handed to courier service' },
        { key: 'delivered', label: 'Delivered', desc: 'Received by customer' },
      ],
      productBilling: 'Product & Billing',
      customer: 'Customer:',
      phone: 'Phone:',
      item: 'Item:',
      totalAmount: 'Total Amount:',
      advancePaid: 'Advance Paid:',
      due: 'Due:',
      deliveryDetails: 'Delivery Details',
      district: 'District:',
      address: 'Address:',
      courier: 'Courier:',
      payment: 'Payment:',
      waBtn: 'WhatsApp Owner for Order Update',
      callBtn: 'Call Hotline',
      noOrderFound: (q: string) => `No Order Found Matching "${q}"`,
      noOrderDesc: 'Please double check your Order ID (e.g. #JHF-ORD-XXXXX) or 11-digit phone number. You can also contact our hotline directly.',
      askWaBtn: 'Ask on WhatsApp (01935-693071)',
      initialPrompt: 'Enter your Order Reference ID or customer phone number above to inspect live tracking status.',
      waOrderMsg: (ordNo: string) => `Hello JHF LAPTOP ZONE, I am tracking my Order ${ordNo}. Could you please update me on delivery status?`,
      waMissingMsg: (q: string) => `Hello JHF LAPTOP ZONE, I could not find my order with query "${q}". Please check manually.`,
    },
    bn: {
      modalTitle: 'লাইভ অর্ডার ট্র্যাকিং',
      modalSubtitle: 'আপনার ল্যাপটপের কুরিয়ার প্রেরণ ও ডেলিভারির সর্বশেষ অবস্থা ট্র্যাক করুন',
      inputPlaceholder: 'অর্ডার আইডি (যেমন JHF-ORD-12345) বা মোবাইল নম্বর লিখুন...',
      trackBtn: 'ট্র্যাক করুন',
      orderRef: 'অর্ডার রেফারেন্স',
      steps: [
        { key: 'new', label: 'অর্ডার গ্রহণ', desc: 'অনলাইনে অর্ডার গৃহীত হয়েছে' },
        { key: 'confirmed', label: 'কনফার্মড', desc: 'জেএইচএফ টিম কর্তৃক নিশ্চিত করা হয়েছে' },
        { key: 'processing', label: 'প্রসেসিং', desc: 'হার্ডওয়্যার টেস্ট ও প্যাকিং সম্পন্ন' },
        { key: 'shipped', label: 'শিপড', desc: 'কুরিয়ারে হস্তান্তর করা হয়েছে' },
        { key: 'delivered', label: 'ডেলিভার্ড', desc: 'গ্রাহক পণ্য গ্রহণ করেছেন' },
      ],
      productBilling: 'পণ্য ও বিলিং তথ্য',
      customer: 'কাস্টমার:',
      phone: 'মোবাইল:',
      item: 'পণ্য:',
      totalAmount: 'মোট মূল্য:',
      advancePaid: 'অ্যাডভান্স পেইড:',
      due: 'বাকি বিল:',
      deliveryDetails: 'ডেলিভারি বিবরণ',
      district: 'জেলা:',
      address: 'ঠিকানা:',
      courier: 'কুরিয়ার:',
      payment: 'পেমেন্ট মাধ্যম:',
      waBtn: 'অর্ডার আপডেটের জন্য হোয়াটসঅ্যাপে কথা বলুন',
      callBtn: 'হটলাইনে কল করুন',
      noOrderFound: (q: string) => `"${q}" নম্বরে কোনো অর্ডার পাওয়া যায়নি`,
      noOrderDesc: 'অনুগ্রহ করে আপনার অর্ডার আইডি বা সঠিক ১১ ডিজিটের মোবাইল নম্বর যাচাই করুন। প্রয়োজনে সরাসরি যোগাযোগ করুন।',
      askWaBtn: 'হোয়াটসঅ্যাপে অনুসন্ধান (০১৯৩৫-৬৯৩০৭১)',
      initialPrompt: 'লাইভ ডেলিভারি স্ট্যাটাস দেখতে উপরে আপনার অর্ডার আইডি অথবা ফোন নম্বর প্রবেশ করান।',
      waOrderMsg: (ordNo: string) => `আসসালামু আলাইকুম JHF LAPTOP ZONE, আমি অর্ডার নম্বর ${ordNo} ট্র্যাক করছি। বর্তমান ডেলিভারি অবস্থা জানতে চাই।`,
      waMissingMsg: (q: string) => `আসসালামু আলাইকুম JHF LAPTOP ZONE, "${q}" দিয়ে আমার অর্ডারটি খুঁজে পাওয়া যাচ্ছে না। দয়া করে একটু যাচাই করে জানাবেন কি?`,
    },
    hi: {
      modalTitle: 'लाइव ऑर्डर ट्रैकिंग',
      modalSubtitle: 'अपने लैपटॉप कूरियर डिस्पैच व डिलीवरी स्थिति को ट्रैक करें',
      inputPlaceholder: 'ऑर्डर आईडी (उदा. JHF-ORD-12345) या मोबाइल नंबर दर्ज करें...',
      trackBtn: 'ट्रैक करें',
      orderRef: 'ऑर्डर संदर्भ',
      steps: [
        { key: 'new', label: 'ऑर्डर प्राप्त', desc: 'ऑनलाइन ऑर्डर दर्ज हुआ' },
        { key: 'confirmed', label: 'पुष्टीकृत', desc: 'जेएचएफ टीम द्वारा सत्यापित' },
        { key: 'processing', label: 'प्रसंस्करण', desc: 'हार्डवेयर परीक्षण व पैकिंग' },
        { key: 'shipped', label: 'भेज दिया गया', desc: 'कूरियर सेवा को सौंपा गया' },
        { key: 'delivered', label: 'वितरित', desc: 'ग्राहक द्वारा प्राप्त' },
      ],
      productBilling: 'उत्पाद व बिलिंग',
      customer: 'ग्राहक:',
      phone: 'फ़ोन:',
      item: 'उत्पाद:',
      totalAmount: 'कुल राशि:',
      advancePaid: 'अग्रिम भुगतान:',
      due: 'शेष राशि:',
      deliveryDetails: 'डिलीवरी विवरण',
      district: 'जिला:',
      address: 'पता:',
      courier: 'कूरियर:',
      payment: 'भुगतान विधि:',
      waBtn: 'ऑर्डर अपडेट हेतु व्हाट्सएप करें',
      callBtn: 'हॉटलाइन पर कॉल करें',
      noOrderFound: (q: string) => `"${q}" के साथ कोई ऑर्डर नहीं मिला`,
      noOrderDesc: 'कृपया अपनी ऑर्डर आईडी या ११ अंकों का फ़ोन नंबर दोबारा जांचें। आप सीधे हमारी हेल्पलाइन से भी संपर्क कर सकते हैं।',
      askWaBtn: 'व्हाट्सएप पर पूछें (01935-693071)',
      initialPrompt: 'लाइव ट्रैकिंग स्थिति देखने के लिए ऊपर अपनी ऑर्डर आईडी या फ़ोन नंबर दर्ज करें।',
      waOrderMsg: (ordNo: string) => `नमस्ते JHF LAPTOP ZONE, मैं अपना ऑर्डर ${ordNo} ट्रैक कर रहा हूँ। कृपया वर्तमान डिलीवरी स्थिति बताएं।`,
      waMissingMsg: (q: string) => `नमस्ते JHF LAPTOP ZONE, "${q}" से मेरा ऑर्डर नहीं मिल रहा है। कृपया जांच कर बताएं।`,
    },
  }[language] || {
    modalTitle: 'Live Order Tracking',
    modalSubtitle: 'Track your laptop courier dispatch & delivery status',
    inputPlaceholder: 'Enter Order ID (e.g. JHF-ORD-12345) or Phone Number...',
    trackBtn: 'Track',
    orderRef: 'Order Reference',
    steps: [
      { key: 'new', label: 'Order Placed', desc: 'Customer placed order online' },
      { key: 'confirmed', label: 'Confirmed', desc: 'Verified by JHF sales team' },
      { key: 'processing', label: 'Processing', desc: 'Hardware tested & packed' },
      { key: 'shipped', label: 'Shipped', desc: 'Handed to courier service' },
      { key: 'delivered', label: 'Delivered', desc: 'Received by customer' },
    ],
    productBilling: 'Product & Billing',
    customer: 'Customer:',
    phone: 'Phone:',
    item: 'Item:',
    totalAmount: 'Total Amount:',
    advancePaid: 'Advance Paid:',
    due: 'Due:',
    deliveryDetails: 'Delivery Details',
    district: 'District:',
    address: 'Address:',
    courier: 'Courier:',
    payment: 'Payment:',
    waBtn: 'WhatsApp Owner for Order Update',
    callBtn: 'Call Hotline',
    noOrderFound: (q: string) => `No Order Found Matching "${q}"`,
    noOrderDesc: 'Please double check your Order ID (e.g. #JHF-ORD-XXXXX) or 11-digit phone number. You can also contact our hotline directly.',
    askWaBtn: 'Ask on WhatsApp (01935-693071)',
    initialPrompt: 'Enter your Order Reference ID or customer phone number above to inspect live tracking status.',
    waOrderMsg: (ordNo: string) => `Hello JHF LAPTOP ZONE, I am tracking my Order ${ordNo}. Could you please update me on delivery status?`,
    waMissingMsg: (q: string) => `Hello JHF LAPTOP ZONE, I could not find my order with query "${q}". Please check manually.`,
  };

  if (!isTrackingModalOpen) return null;

  const cleanQuery = trackingQuery.trim().toLowerCase();

  // Search orders by Order Number, Phone, or Customer Name
  const matchedOrder = cleanQuery
    ? orders.find((o) => {
        const ordNo = (o.orderNumber || '').toLowerCase();
        const phone = (o.customerPhone || '').replace(/\D/g, '');
        const queryPhone = cleanQuery.replace(/\D/g, '');
        const name = (o.customerName || '').toLowerCase();
        return (
          ordNo === cleanQuery ||
          ordNo.includes(cleanQuery) ||
          (queryPhone.length >= 7 && phone.includes(queryPhone)) ||
          name.includes(cleanQuery)
        );
      })
    : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const steps = texts.steps;

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
      case 'ready_for_delivery':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const activeStepIdx = matchedOrder ? getStepIndex(matchedOrder.orderStatus) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {texts.modalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {texts.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTrackingModalOpen(false)}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={texts.inputPlaceholder}
                value={trackingQuery}
                onChange={(e) => {
                  setTrackingQuery(e.target.value);
                  setSearched(false);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <span>{texts.trackBtn}</span>
            </button>
          </form>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {matchedOrder ? (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400 font-semibold">{texts.orderRef}</div>
                  <div className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">
                    {matchedOrder.orderNumber}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Clock className="w-3.5 h-3.5" />
                    {matchedOrder.orderStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="py-2">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 w-full z-0" />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 z-0"
                    style={{ width: `${(activeStepIdx / (steps.length - 1)) * 100}%` }}
                  />

                  {steps.map((step, idx) => {
                    const isDone = idx <= activeStepIdx;
                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isDone
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold mt-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span>{texts.productBilling}</span>
                  </div>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div>
                      {texts.customer} <strong>{matchedOrder.customerName}</strong>
                    </div>
                    <div>
                      {texts.phone} <strong>{matchedOrder.customerPhone}</strong>
                    </div>
                    <div>
                      {texts.item} <strong>{matchedOrder.items[0]?.productName || 'Business Laptop'}</strong>
                    </div>
                    <div>
                      {texts.totalAmount}{' '}
                      <strong className="text-blue-600 dark:text-blue-400 font-mono">
                        {formatPrice(matchedOrder.totalAmount)}
                      </strong>
                    </div>
                    <div>
                      {texts.advancePaid} {formatPrice(matchedOrder.advancePaid || 0)} | {texts.due}{' '}
                      {formatPrice(matchedOrder.totalAmount - (matchedOrder.advancePaid || 0))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{texts.deliveryDetails}</span>
                  </div>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div>
                      {texts.district} <strong>{matchedOrder.district || 'Dhaka'}</strong>
                    </div>
                    <div className="line-clamp-2">
                      {texts.address} <strong>{matchedOrder.deliveryAddress}</strong>
                    </div>
                    <div>
                      {texts.courier}:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {matchedOrder.courierService || 'Steadfast Courier'}
                      </strong>
                    </div>
                    <div>
                      {texts.payment} <strong>{matchedOrder.paymentMethod}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Contact Button */}
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(
                    texts.waOrderMsg(matchedOrder.orderNumber)
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{texts.waBtn}</span>
                </a>

                <a
                  href={`tel:${OWNER_DISPLAY_PHONE.replace(/\D/g, '')}`}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                  <span>{texts.callBtn}</span>
                </a>
              </div>
            </div>
          ) : searched ? (
            <div className="py-10 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {texts.noOrderFound(trackingQuery)}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {texts.noOrderDesc}
              </p>
              <div className="pt-3">
                <a
                  href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(
                    texts.waMissingMsg(trackingQuery)
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-500 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{texts.askWaBtn}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {texts.initialPrompt}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
