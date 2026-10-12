import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useStore } from '../context/StoreContext';
import { useAdminStore } from '../admin/adminStore';
import { useTranslation } from '../context/LanguageContext';
import { TESTING_TOOLS, SOFTWARE_LIBRARY, DownloadItem } from '../data/jhfData';
import { OWNER_DISPLAY_PHONE, OWNER_WHATSAPP } from '../utils/aiOrderAutomation';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Cpu,
  HardDrive,
  Download,
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  MessageSquare,
  ChevronRight,
  Truck,
  Check,
  Edit3,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  recommendations?: any[];
  downloadCard?: {
    tool: DownloadItem;
    category: string;
  };
  orderConfirmation?: {
    customerName: string;
    phone: string;
    address: string;
    district: string;
    productTitle: string;
    productSku: string;
    price: number | string;
    paymentMethod: string;
  };
  completedOrder?: {
    orderNumber: string;
    whatsappUrl: string;
    summary: string;
  };
  quickActions?: { label: string; action: () => void }[];
  timestamp: string;
}

interface VoiceOrderState {
  step: 'idle' | 'name' | 'phone' | 'address' | 'confirmation';
  laptop: any | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerDistrict: string;
  paymentMethod: string;
}

interface AiAssistantModalProps {
  onOpenOrderModal: (laptop: any) => void;
  onOpenSpecsModal: (laptop: any) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  onOpenOrderModal,
  onOpenSpecsModal,
}) => {
  const { isAiAssistantOpen, setIsAiAssistantOpen, setIsTrackingModalOpen } = useCustomer();
  const { laptops, softwareList } = useStore();
  const { reconditionLaptops, createOrder, recordDownloadEvent } = useAdminStore();
  const { language, formatPrice, currency } = useTranslation();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Conversational Voice Order state
  const [voiceOrder, setVoiceOrder] = useState<VoiceOrderState>({
    step: 'idle',
    laptop: null,
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerDistrict: 'Dhaka',
    paymentMethod: 'Cash on Delivery (Courier Condition)',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Combined catalog
  const allLaptops = [
    ...laptops,
    ...reconditionLaptops.map((r) => ({
      id: r.id,
      title: r.title,
      name: r.title,
      brand: r.brand,
      model: r.model,
      series: r.model,
      price: typeof r.sellPrice === 'number' ? `৳ ${r.sellPrice.toLocaleString()}` : String(r.sellPrice),
      rawPrice: r.sellPrice,
      specs: `${r.processor} | ${r.ram} | ${r.storage}`,
      image: r.images[0] || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
      warranty: r.warranty,
      batteryCondition: r.batteryBackup,
      tag: r.physicalCondition,
    })),
  ];

  // Welcome message based on language
  const getWelcomeText = useCallback(() => {
    if (language === 'bn') {
      return 'আসসালামু আলাইকুম! আমি JHF AI ভয়েস অ্যাসিস্ট্যান্ট। আমাকে মুখে বলতে পারেন বা লিখে জিজ্ঞেস করতে পারেন: ল্যাপটপ অনুসন্ধান, সফটওয়্যার বা টেস্টিং টুল ডাউনলোড এবং সরাসরি ভয়েস অর্ডার!';
    }
    if (language === 'hi') {
      return 'नमस्ते! मैं JHF AI वॉइस असिस्टेंट हूँ। आप बोलकर या लिखकर लैपटॉप ढूंढ सकते हैं, टेस्टिंग टूल डाउनलोड कर सकते हैं, या सीधे वॉइस ऑर्डर कर सकते हैं!';
    }
    return 'Hello! I am JHF AI Voice Assistant. Speak or type your request: discover tested business laptops, download testing tools, or place a voice order directly!';
  }, [language]);

  const getInitialQuickActions = useCallback(
    (lang: string) => {
      if (lang === 'bn') {
        return [
          { label: '🔥 ১৬ জিবি র‍্যাম ল্যাপটপ', action: () => handleSendPrompt('Show 16GB RAM laptops') },
          { label: '🧪 এসএসডি ও ব্যাটারি টুলস', action: () => handleSendPrompt('Download CrystalDiskInfo') },
          { label: '🎙️ ভয়েস অর্ডার গাইড', action: () => handleSendPrompt('How does voice ordering work?') },
          { label: '✨ রিকন্ডিশন জোন', action: () => handleSendPrompt('Open recondition zone') },
          { label: '🚚 কুরিয়ার ট্র্যাকিং', action: () => handleSendPrompt('Track my courier order') },
        ];
      }
      if (lang === 'hi') {
        return [
          { label: '🔥 १६ जीबी रैम लैपटॉप', action: () => handleSendPrompt('Show 16GB RAM laptops') },
          { label: '🧪 एसएसडी व बैटरी टूल्स', action: () => handleSendPrompt('Download CrystalDiskInfo') },
          { label: '🎙️ वॉइस ऑर्डर गाइड', action: () => handleSendPrompt('How does voice ordering work?') },
          { label: '✨ रिकंडीशन ज़ोन', action: () => handleSendPrompt('Open recondition zone') },
          { label: '🚚 कूरियर ट्रैकिंग', action: () => handleSendPrompt('Track my courier order') },
        ];
      }
      return [
        { label: '🔥 16GB RAM Laptops', action: () => handleSendPrompt('Show 16GB RAM laptops') },
        { label: '🧪 SSD & Battery Tools', action: () => handleSendPrompt('Download CrystalDiskInfo') },
        { label: '🎙️ Voice Order Guide', action: () => handleSendPrompt('How does voice ordering work?') },
        { label: '✨ Recondition Zone', action: () => handleSendPrompt('Open recondition zone') },
        { label: '🚚 Track Delivery', action: () => handleSendPrompt('Track my courier order') },
      ];
    },
    []
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'ai',
      text: getWelcomeText(),
      quickActions: getInitialQuickActions(language),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Update initial message when language changes if conversation hasn't expanded
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'welcome-1',
            sender: 'ai',
            text: getWelcomeText(),
            quickActions: getInitialQuickActions(language),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [language, getWelcomeText, getInitialQuickActions]);

  const aiTexts = {
    en: {
      headerTitle: 'JHF AI Assistant',
      femaleVoice: 'Female Voice',
      headerSub: 'Voice Ordering • Software • Search',
      floatingLabel: 'JHF AI Assistant',
      replay: 'Replay',
      orderScreenTitle: 'ORDER CONFIRMATION SCREEN',
      pendingApproval: 'Pending Approval',
      customerLabel: 'Customer:',
      phoneLabel: 'Phone:',
      addressLabel: 'Address:',
      productLabel: 'Product:',
      priceLabel: 'Price:',
      paymentLabel: 'Payment:',
      confirmOrderBtn: 'CONFIRM ORDER',
      editBtn: 'EDIT',
      cancelBtn: 'Cancel',
      orderRegPrefix: 'Order #',
      orderRegSuffix: ' Registered!',
      dispatchNotice: "Dispatch your order directly to our shop owner's WhatsApp to fast-track courier packing.",
      openWhatsapp: 'OPEN WHATSAPP',
      verifiedPackage: '✓ Verified Package',
      downloadNow: 'Download Now',
      voiceOrderBtn: 'Voice Order',
      checkoutBtn: 'Checkout',
      listeningText: 'Listening... speak clearly (e.g. "I want to order Lenovo L14")',
      stopBtn: 'Stop',
      inputPlaceholder: 'Speak or type (e.g., "Order ThinkPad", "Download CrystalDiskInfo")...',
      muteVoice: 'Mute Voice',
      unmuteVoice: 'Unmute Voice',
      voiceSpeed: 'Voice Speed',
      orderCancelled: 'Order draft has been cancelled. Let me know if you need any other assistance.',
      micDenied: 'Microphone permission was denied. Please allow microphone access or type your message.',
      voiceUnrecognized: 'Could not recognize voice. Please try speaking again or type.',
      speechUnsupported: 'Speech recognition is not supported in this browser. Please type your request.',
    },
    bn: {
      headerTitle: 'জেএইচএফ এআই অ্যাসিস্ট্যান্ট',
      femaleVoice: 'নারী কণ্ঠ',
      headerSub: 'ভয়েস অর্ডার • সফটওয়্যার • সার্চ',
      floatingLabel: 'জেএইচএফ এআই অ্যাসিস্ট্যান্ট',
      replay: 'পুনরায় শুনুন',
      orderScreenTitle: 'অর্ডার নিশ্চিতকরণ স্ক্রিন',
      pendingApproval: 'অনুমোদন অপেক্ষায়',
      customerLabel: 'ক্রেতা:',
      phoneLabel: 'ফোন:',
      addressLabel: 'ঠিকানা:',
      productLabel: 'পণ্য:',
      priceLabel: 'মূল্য:',
      paymentLabel: 'পেমেন্ট:',
      confirmOrderBtn: 'অর্ডার নিশ্চিত করুন',
      editBtn: 'সংশোধন',
      cancelBtn: 'বাতিল',
      orderRegPrefix: 'অর্ডার #',
      orderRegSuffix: ' নিবন্ধিত হয়েছে!',
      dispatchNotice: 'কুরিয়ার প্যাকিং ও ডেলিভারি দ্রুত করতে সরাসরি আমাদের শপ ওনারের হোয়াটসঅ্যাপে অর্ডারটি পাঠান।',
      openWhatsapp: 'হোয়াটসঅ্যাপে পাঠান',
      verifiedPackage: '✓ ভেরিফাইড প্যাকেজ',
      downloadNow: 'এখনই ডাউনলোড করুন',
      voiceOrderBtn: 'ভয়েস অর্ডার',
      checkoutBtn: 'চেকআউট',
      listeningText: 'শুনছি... স্পষ্ট করে বলুন (যেমন: "লেনোভো L14 অর্ডার করতে চাই")',
      stopBtn: 'থামুন',
      inputPlaceholder: 'মুখে বলুন অথবা লিখুন (যেমন: "১৬ জিবি র‍্যাম ল্যাপটপ", "ক্রিস্টালডিস্ক ডাউনলোড")...',
      muteVoice: 'ভয়েস মিউট করুন',
      unmuteVoice: 'ভয়েস আনমিউট করুন',
      voiceSpeed: 'ভয়েস স্পিড',
      orderCancelled: 'অর্ডার খসড়া বাতিল করা হয়েছে। অন্য কোনো সহযোগিতার প্রয়োজন হলে জানান।',
      micDenied: 'মাইক্রোফোন অ্যাক্সেস বন্ধ রয়েছে। দয়া করে মাইক্রোফোন অন করুন বা লিখে জানান।',
      voiceUnrecognized: 'কথা স্পষ্ট বোঝা যায়নি। দয়া করে আবার বলুন বা লিখুন।',
      speechUnsupported: 'এই ব্রাউজারে স্পিচ রিকগনিশন কাজ করছে না। অনুগ্রহ করে লিখে জানান।',
    },
    hi: {
      headerTitle: 'जेएचएफ एआई असिस्टेंट',
      femaleVoice: 'महिला आवाज़',
      headerSub: 'वॉइस ऑर्डर • सॉफ्टवेयर • सर्च',
      floatingLabel: 'जेएचएफ एआई असिस्टेंट',
      replay: 'पुनः सुनें',
      orderScreenTitle: 'ऑर्डर पुष्टिकरण स्क्रीन',
      pendingApproval: 'स्वीकृति लंबित',
      customerLabel: 'ग्राहक:',
      phoneLabel: 'फ़ोन:',
      addressLabel: 'पता:',
      productLabel: 'उत्पाद:',
      priceLabel: 'मूल्य:',
      paymentLabel: 'भुगतान:',
      confirmOrderBtn: 'ऑर्डर कन्फर्म करें',
      editBtn: 'संशोधित करें',
      cancelBtn: 'रद्द करें',
      orderRegPrefix: 'ऑर्डर #',
      orderRegSuffix: ' दर्ज किया गया!',
      dispatchNotice: 'कूरियर पैकिंग और डिलीवरी में तेजी लाने के लिए सीधे हमारे शॉप ओनर के व्हाट्सएप पर विवरण भेजें।',
      openWhatsapp: 'व्हाट्सएप खोलें',
      verifiedPackage: '✓ सत्यापित पैकेज',
      downloadNow: 'अब डाउनलोड करें',
      voiceOrderBtn: 'वॉइस ऑर्डर',
      checkoutBtn: 'चेकआउट',
      listeningText: 'सुन रहा हूँ... स्पष्ट रूप से बोलें (उदा: "लेनोवो L14 ऑर्डर करना है")',
      stopBtn: 'रोकें',
      inputPlaceholder: 'बोलें या लिखें (उदा: "16GB RAM लैपटॉप", "क्रिस्टलडिस्क डाउनलोड")...',
      muteVoice: 'वॉइस म्यूट करें',
      unmuteVoice: 'वॉइस अनम्यूट करें',
      voiceSpeed: 'वॉइस स्पीड',
      orderCancelled: 'ऑर्डर ड्राफ्ट रद्द कर दिया गया है। अन्य किसी सहायता के लिए बताएं।',
      micDenied: 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया अनुमति दें या लिखकर संदेश भेजें।',
      voiceUnrecognized: 'आवाज़ पहचान नहीं सके। कृपया पुनः बोलें या लिखें।',
      speechUnsupported: 'इस ब्राउज़र में वॉइस पहचान समर्थित नहीं है। कृपया लिखकर भेजें।',
    },
  }[language as 'en' | 'bn' | 'hi'] || {
    headerTitle: 'JHF AI Assistant',
    femaleVoice: 'Female Voice',
    headerSub: 'Voice Ordering • Software • Search',
    floatingLabel: 'JHF AI Assistant',
    replay: 'Replay',
    orderScreenTitle: 'ORDER CONFIRMATION SCREEN',
    pendingApproval: 'Pending Approval',
    customerLabel: 'Customer:',
    phoneLabel: 'Phone:',
    addressLabel: 'Address:',
    productLabel: 'Product:',
    priceLabel: 'Price:',
    paymentLabel: 'Payment:',
    confirmOrderBtn: 'CONFIRM ORDER',
    editBtn: 'EDIT',
    cancelBtn: 'Cancel',
    orderRegPrefix: 'Order #',
    orderRegSuffix: ' Registered!',
    dispatchNotice: "Dispatch your order directly to our shop owner's WhatsApp to fast-track courier packing.",
    openWhatsapp: 'OPEN WHATSAPP',
    verifiedPackage: '✓ Verified Package',
    downloadNow: 'Download Now',
    voiceOrderBtn: 'Voice Order',
    checkoutBtn: 'Checkout',
    listeningText: 'Listening... speak clearly (e.g. "I want to order Lenovo L14")',
    stopBtn: 'Stop',
    inputPlaceholder: 'Speak or type (e.g., "Order ThinkPad", "Download CrystalDiskInfo")...',
    muteVoice: 'Mute Voice',
    unmuteVoice: 'Unmute Voice',
    voiceSpeed: 'Voice Speed',
    orderCancelled: 'Order draft has been cancelled. Let me know if you need any other assistance.',
    micDenied: 'Microphone permission was denied. Please allow microphone access or type your message.',
    voiceUnrecognized: 'Could not recognize voice. Please try speaking again or type.',
    speechUnsupported: 'Speech recognition is not supported in this browser. Please type your request.',
  };

  // Natural Female Voice TTS Helper
  const speakText = useCallback(
    (textToSpeak: string) => {
      if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

      try {
        window.speechSynthesis.cancel(); // cancel pending speech

        // Strip markdown and emojis for clean voice synthesis
        const cleaned = textToSpeak
          .replace(/[#*`_~]/g, '')
          .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.rate = speechRate;

        // Choose best female voice for current language
        const voices = window.speechSynthesis.getVoices();
        let targetVoice: SpeechSynthesisVoice | null = null;

        const langPrefix = language === 'bn' ? 'bn' : language === 'hi' ? 'hi' : 'en';

        // Filter for female voices matching language
        const matchingVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

        // Look for voices with female keywords
        targetVoice =
          matchingVoices.find((v) =>
            /female|woman|samantha|victoria|zira|jenny|swara|kalpana|kavya|google us english/i.test(v.name)
          ) ||
          matchingVoices[0] ||
          voices.find((v) => /female|samantha|zira/i.test(v.name)) ||
          voices[0] ||
          null;

        if (targetVoice) {
          utterance.voice = targetVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
      }
    },
    [isMuted, speechRate, language]
  );

  // Auto-scroll chat
  useEffect(() => {
    if (isAiAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiAssistantOpen]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleSendPrompt(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(aiTexts.micDenied);
        } else if (event.error !== 'no-speech') {
          setSpeechError(aiTexts.voiceUnrecognized);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      recognitionRef.current = null;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language, aiTexts.micDenied, aiTexts.voiceUnrecognized]);

  const toggleSpeechRecognition = () => {
    setSpeechError(null);
    if (!recognitionRef.current) {
      setSpeechError(aiTexts.speechUnsupported);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.lang =
          language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-US';
        recognitionRef.current.start();
      } catch (err) {
        console.error('Recognition start error:', err);
      }
    }
  };

  const handleSendPrompt = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Process intelligence
    setTimeout(() => {
      processAiInput(textToSend.trim());
    }, 300);
  };

  // Main intelligence parser
  const processAiInput = (input: string) => {
    const q = input.toLowerCase();

    // 1. Check if user is currently inside a Voice Order step-by-step dialog
    if (voiceOrder.step !== 'idle' && voiceOrder.step !== 'confirmation') {
      handleVoiceOrderStep(input);
      return;
    }

    // 2. Voice Order Trigger Check
    if (
      q.includes('order this') ||
      q.includes('buy this') ||
      q.includes('অর্ডার করতে চাই') ||
      q.includes('ল্যাপটপ অর্ডার') ||
      q.includes('खरीदना है') ||
      q.includes('order laptop') ||
      q.includes('voice order')
    ) {
      startVoiceOrder(allLaptops[0]);
      return;
    }

    // 3. Voice Navigation Commands
    if (q.includes('show laptops') || q.includes('ল্যাপটপ দেখাও') || q.includes('लैपटॉप दिखाओ')) {
      const msg =
        language === 'bn'
          ? 'ল্যাপটপ ক্যাটালগে নিয়ে যাচ্ছি। এখানে আমাদের শতভাগ টেস্টেড বিজনেস ল্যাপটপসমূহ দেখতে পারেন।'
          : language === 'hi'
          ? 'लैपटॉप कैटलॉग खोला जा रहा है। यहाँ हमारे पूरी तरह से परीक्षित बिजनेस लैपटॉप उपलब्ध हैं।'
          : 'Navigating to Laptops Catalog. Here are our fully tested enterprise laptops.';
      navigateAndRespond('#laptops-catalog', msg);
      return;
    }
    if (q.includes('recondition') || q.includes('রিকন্ডিশন') || q.includes('used laptop')) {
      const msg =
        language === 'bn'
          ? 'জেএইচএফ রিকন্ডিশন জোন ওপেন করা হচ্ছে। সার্টিফায়েড প্রি-ওউনড বিজনেস ল্যাপটপসমূহ দেখুন।'
          : language === 'hi'
          ? 'जेएचएफ रिकंडीशन ज़ोन खोला जा रहा है। प्रमाणित बिजनेस लैपटॉप का स्टॉक देखें।'
          : 'Opening JHF Recondition Zone. Explore certified pre-owned business laptops.';
      navigateAndRespond('#jhf-recondition-zone', msg);
      return;
    }
    if (q.includes('software center') || q.includes('software zone') || q.includes('সফটওয়্যার')) {
      const msg =
        language === 'bn'
          ? 'সফটওয়্যার সেন্টার ওপেন করা হচ্ছে। এখান থেকে ক্যাটালগ ও সফটওয়্যার প্যাকেজ ডাউনলোড করতে পারেন।'
          : language === 'hi'
          ? 'सॉफ्टवेयर सेंटर खोला जा रहा है। यहाँ से आवश्यक सॉफ्टवेयर पैकेज डाउनलोड कर सकते हैं।'
          : 'Opening Software Center. You can download CAD, Adobe, and office packages here.';
      navigateAndRespond('#software-zone', msg);
      return;
    }
    if (q.includes('testing tool') || q.includes('টেস্টিং') || q.includes('টুলস') || q.includes('windows tools')) {
      const msg =
        language === 'bn'
          ? 'টেস্টিং টুলস জোন ওপেন করা হচ্ছে। ক্রিস্টালডিস্কইনফো, ব্যাটারি ও ফারমার্ক টুল ডাউনলোড করতে পারেন।'
          : language === 'hi'
          ? 'टेस्टिंग टूल्स ज़ोन खोला जा रहा है। आप हार्डवेयर परीक्षण उपकरण डाउनलोड कर सकते हैं।'
          : 'Opening Testing Tools Zone. Download CrystalDiskInfo, BatteryInfoView, and FurMark.';
      navigateAndRespond('#testing-zone', msg);
      return;
    }
    if (q.includes('track order') || q.includes('my order') || q.includes('ট্র্যাক')) {
      setIsAiAssistantOpen(false);
      setIsTrackingModalOpen(true);
      return;
    }
    if (q.includes('contact') || q.includes('support') || q.includes('যোগাযোগ')) {
      const msg =
        language === 'bn'
          ? 'আমাদের মাল্টিপ্ল্যান সেন্টার হেল্পলাইনে যোগাযোগ করুন: ০১৯৩৫-৬৯৩০৭১ অথবা ০১৭৩১-৬৯৩০৭১।'
          : language === 'hi'
          ? 'हमारे मल्टीप्लान सेंटर हेल्पलाइन से संपर्क करें: 01935-693071 या 01731-693071।'
          : 'You can contact our Multiplan center hotline at 01935-693071 or 01731-693071.';
      navigateAndRespond('#payment-section', msg);
      return;
    }

    // 4. Voice Software & Tool Download Matching
    const allDownloads = [...TESTING_TOOLS, ...SOFTWARE_LIBRARY, ...softwareList];
    const matchedTool = allDownloads.find((t) => {
      const title = t.title.toLowerCase();
      const cat = t.category.toLowerCase();
      return (
        (q.includes('crystaldisk') && (title.includes('crystal') || title.includes('hard disk'))) ||
        (q.includes('battery') && (title.includes('battery') || cat.includes('battery'))) ||
        (q.includes('furmark') && title.includes('furmark')) ||
        (q.includes('sentinel') && title.includes('sentinel')) ||
        (q.includes('gpu-z') && title.includes('gpu')) ||
        (q.includes('keyboard') && title.includes('keyboard')) ||
        (q.includes('photoshop') && title.includes('photoshop')) ||
        (q.includes('autocad') && title.includes('autocad')) ||
        (q.includes('office') && (title.includes('office') || title.includes('activator'))) ||
        (q.includes('windows 11') && title.includes('windows 11')) ||
        (q.includes('windows 10') && title.includes('windows 10')) ||
        title.includes(q)
      );
    });

    if (matchedTool) {
      const responseText =
        language === 'bn'
          ? `আমি ${matchedTool.category} ক্যাটাগরিতে "${matchedTool.title}" পেয়েছি। আপনি কি এখনই ডাউনলোড করতে চান?`
          : language === 'hi'
          ? `मुझे ${matchedTool.category} श्रेणी में "${matchedTool.title}" मिला। क्या आप इसे अभी डाउनलोड करना चाहते हैं?`
          : `I found "${matchedTool.title}" in the ${matchedTool.category} category. Would you like to start the download now?`;
      speakText(responseText);

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: responseText,
        downloadCard: {
          tool: matchedTool,
          category: matchedTool.category,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    // 5. Smart Product Recommendations by Budget / Processor / RAM
    let responseText = '';
    let recommendations: any[] = [];
    let quickActions: { label: string; action: () => void }[] = [];

    const budgetMatch = q.match(/(\d+)\s*(হাজার|k|thousand|000)/i);
    if (budgetMatch || q.includes('budget') || q.includes('বাজেট') || q.includes('দাম')) {
      const budgetNum = budgetMatch ? parseInt(budgetMatch[1], 10) * 1000 : 45000;
      const matched = allLaptops.filter((l) => {
        const num =
          typeof l.rawPrice === 'number'
            ? l.rawPrice
            : parseInt(String(l.price).replace(/\D/g, ''), 10) || 40000;
        return num <= budgetNum + 6000;
      });
      recommendations = matched.slice(0, 3);
      responseText =
        language === 'bn'
          ? `আপনার বাজেট ${formatPrice(budgetNum)}-এর মধ্যে আমাদের সেরা টেস্টেড বিজনেস ল্যাপটপসমূহ:`
          : language === 'hi'
          ? `आपके बजट ${formatPrice(budgetNum)} के भीतर हमारे सर्वश्रेष्ठ परीक्षित बिजनेस लैपटॉप:`
          : `Here are our best tested business laptops within your budget of ${formatPrice(budgetNum)}:`;
    } else if (q.includes('16gb') || q.includes('ram')) {
      recommendations = allLaptops
        .filter((l) => (l.specs || '').toLowerCase().includes('16gb') || (l.title || '').toLowerCase().includes('16gb'))
        .slice(0, 3);
      responseText =
        language === 'bn'
          ? 'মাল্টিটাস্কিং ও প্রোগ্রামিং কাজের উপযোগী সেরা ১৬ জিবি র‍্যাম বিজনেস ল্যাপটপসমূহ:'
          : language === 'hi'
          ? 'मल्टीटास्किंग और प्रोग्रामिंग के लिए उच्च प्रदर्शन वाले 16GB रैम बिजनेस लैपटॉप:'
          : 'Here are our high-performance 16GB RAM business laptops, ideal for multitasking, programming, and office workloads:';
    } else if (q.includes('i7') || q.includes('i5') || q.includes('core')) {
      const term = q.includes('i7') ? 'i7' : 'i5';
      recommendations = allLaptops
        .filter((l) => (l.specs || '').toLowerCase().includes(term) || (l.title || '').toLowerCase().includes(term))
        .slice(0, 3);
      responseText =
        language === 'bn'
          ? `গ্রেড-এ কন্ডিশনে আমাদের ইন্টেল কোর ${term.toUpperCase()} বিজনেস ল্যাপটপসমূহ:`
          : language === 'hi'
          ? `ग्रेड-ए स्थिति में हमारे इंटेल कोर ${term.toUpperCase()} बिजनेस लैपटॉप:`
          : `Here are our Intel Core ${term.toUpperCase()} business laptops in grade-A condition:`;
    } else {
      recommendations = allLaptops.slice(0, 2);
      responseText =
        language === 'bn'
          ? 'জেএইচএফ ল্যাপটপ জোনে স্বাগতম! থিংকপ্যাড, এলিটবুক বা ল্যাটিচিউড মডেল সম্পর্কে জানতে পারেন, টুলস ডাউনলোড করতে পারেন অথবা সরাসরি ভয়েস অর্ডার করতে পারেন।'
          : language === 'hi'
          ? 'जेएचएफ लैपटॉप ज़ोन में आपका स्वागत है! थिंकपैड, एलीटबुक, लैटीट्यूड मॉडल के बारे में पूछें, टेस्टिंग टूल डाउनलोड करें, या सीधे वॉइस ऑर्डर करें।'
          : 'Welcome to JHF Laptop Zone! You can ask about ThinkPad, EliteBook, Latitude models, ask for testing tools, or place a voice order.';
      quickActions =
        language === 'bn'
          ? [
              { label: 'লেনোভো থিংকপ্যাড', action: () => handleSendPrompt('Show Lenovo ThinkPad laptops') },
              { label: 'এইচপি এলিটবুক', action: () => handleSendPrompt('Show HP EliteBook laptops') },
              { label: 'অর্ডার সহায়তা', action: () => handleSendPrompt('I want to order a laptop') },
            ]
          : language === 'hi'
          ? [
              { label: 'लेनोवो थिंकपैड', action: () => handleSendPrompt('Show Lenovo ThinkPad laptops') },
              { label: 'एचपी एलीटबुक', action: () => handleSendPrompt('Show HP EliteBook laptops') },
              { label: 'ऑर्डर सहायता', action: () => handleSendPrompt('I want to order a laptop') },
            ]
          : [
              { label: 'Lenovo ThinkPad', action: () => handleSendPrompt('Show Lenovo ThinkPad laptops') },
              { label: 'HP EliteBook', action: () => handleSendPrompt('Show HP EliteBook laptops') },
              { label: 'Order Assistance', action: () => handleSendPrompt('I want to order a laptop') },
            ];
    }

    speakText(responseText);

    const aiMsg: ChatMessage = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: responseText,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      quickActions: quickActions.length > 0 ? quickActions : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  const navigateAndRespond = (hash: string, speech: string) => {
    speakText(speech);
    const aiMsg: ChatMessage = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: speech,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setTimeout(() => {
      window.location.hash = hash;
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  // Voice Order Multi-Step Dialog Flow
  const startVoiceOrder = (targetLaptop: any) => {
    setVoiceOrder({
      step: 'name',
      laptop: targetLaptop,
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerDistrict: 'Dhaka',
      paymentMethod: 'Cash on Delivery (Courier Condition)',
    });

    const promptText =
      language === 'bn'
        ? `"${targetLaptop.title}" অর্ডার করার প্রক্রিয়ায় আপনাকে সাহায্য করছি। প্রথমে আপনার সম্পূর্ণ নাম বলুন বা লিখুন:`
        : language === 'hi'
        ? `"${targetLaptop.title}" ऑर्डर करने में मैं आपकी सहायता करूँगा। कृपया अपना पूरा नाम बताएं:`
        : `I will guide you through ordering "${targetLaptop.title}". First, please state your full name:`;
    speakText(promptText);

    const aiMsg: ChatMessage = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleVoiceOrderStep = (userInput: string) => {
    if (voiceOrder.step === 'name') {
      const name = userInput.replace(/my name is|i am|নাম|হলো/gi, '').trim();
      setVoiceOrder((prev) => ({ ...prev, customerName: name, step: 'phone' }));

      const nextText =
        language === 'bn'
          ? `ধন্যবাদ, ${name}। কুরিয়ার ডেলিভারি ভেরিফিকেশনের জন্য আপনার সচল মোবাইল নম্বরটি বলুন বা লিখুন:`
          : language === 'hi'
          ? `धन्यवाद, ${name}। कूरियर डिलीवरी सत्यापन के लिए कृपया अपना मोबाइल नंबर बताएं:`
          : `Thank you, ${name}. Next, please provide your mobile phone number for courier delivery verification:`;
      speakText(nextText);

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: nextText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else if (voiceOrder.step === 'phone') {
      const phone = userInput.replace(/phone is|my number is|নম্বর|নাম্বার/gi, '').trim();
      setVoiceOrder((prev) => ({ ...prev, customerPhone: phone, step: 'address' }));

      const nextText =
        language === 'bn'
          ? 'ধন্যবাদ। এবার আপনার ডেলিভারির পূর্ণ ঠিকানা ও জেলার নাম দিন (যেমন: মিরপুর ১০, ঢাকা):'
          : language === 'hi'
          ? 'धन्यवाद। अब कृपया अपना पूरा डिलीवरी पता और जिला बताएं (उदा: मीरपुर 10, ढाका):'
          : 'Got it. Now please provide your shipping address and district (e.g. Mirpur 10, Dhaka or Baroipara, Gazipur):';
      speakText(nextText);

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: nextText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else if (voiceOrder.step === 'address') {
      const address = userInput.trim();
      const updatedOrder = {
        ...voiceOrder,
        customerAddress: address,
        step: 'confirmation' as const,
      };
      setVoiceOrder(updatedOrder);

      const confirmNotice =
        language === 'bn'
          ? 'চূড়ান্ত জমা দেওয়ার পূর্বে নিচের স্ক্রিনে আপনার অর্ডারের তথ্যগুলো যাচাই করুন।'
          : language === 'hi'
          ? 'अंतिम पुष्टि से पहले कृपया नीचे दिए गए स्क्रीन पर अपने ऑर्डर की जानकारी की समीक्षा करें।'
          : 'Please review your order details on the confirmation screen below before final submission.';
      speakText(confirmNotice);

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: confirmNotice,
        orderConfirmation: {
          customerName: updatedOrder.customerName,
          phone: updatedOrder.customerPhone,
          address: updatedOrder.customerAddress,
          district: updatedOrder.customerDistrict,
          productTitle: updatedOrder.laptop.title,
          productSku: updatedOrder.laptop.id || updatedOrder.laptop.sku || 'JHF-LP',
          price: updatedOrder.laptop.price,
          paymentMethod: updatedOrder.paymentMethod,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }
  };

  // Final Order Confirmation Submission
  const handleConfirmVoiceOrder = (details: NonNullable<ChatMessage['orderConfirmation']>) => {
    const rawNum =
      typeof details.price === 'number'
        ? details.price
        : parseInt(String(details.price).replace(/\D/g, ''), 10) || 38000;

    const generatedId = `JHF-VOICE-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = createOrder({
      customerName: details.customerName,
      customerPhone: details.phone,
      deliveryAddress: details.address,
      district: details.district,
      items: [
        {
          id: `item-${Date.now()}`,
          productId: details.productSku,
          productName: details.productTitle,
          quantity: 1,
          unitPrice: rawNum,
          totalPrice: rawNum,
          warranty: '30 Days Replacement + 2 Years Free Service',
        },
      ],
      totalAmount: rawNum,
      paidAmount: 0,
      dueAmount: rawNum,
      status: 'pending',
      paymentMethod: 'cod',
      source: 'Voice AI Assistant',
      notes: `Voice Order #${generatedId} confirmed via AI Assistant`,
    });

    const orderNumber = newOrder.orderNumber || generatedId;

    const whatsappMessage = `*NEW JHF VOICE ORDER #${orderNumber}*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${details.customerName}
📞 *Phone:* ${details.phone}
📍 *Address:* ${details.address} (${details.district})
💻 *Laptop:* ${details.productTitle}
💰 *Price:* ${formatPrice(rawNum)}
🚚 *Payment:* Cash on Delivery (Courier Condition)
🛡️ *Channel:* JHF AI Voice Assistant
━━━━━━━━━━━━━━━━━━━━
Please confirm stock availability and courier dispatch!`;

    const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`;

    const successSpeech =
      language === 'bn'
        ? `ধন্যবাদ ${details.customerName}! আপনার অর্ডার #${orderNumber} নিশ্চিত করা হয়েছে। দ্রুত প্রসেসিংয়ের জন্য হোয়াটসঅ্যাপ বাটনে চাপ দিন।`
        : language === 'hi'
        ? `धन्यवाद ${details.customerName}! आपका ऑर्डर #${orderNumber} कन्फर्म हो गया है। तेज़ प्रोसेसिंग के लिए व्हाट्सएप बटन दबाएं।`
        : `Thank you ${details.customerName}! Your order #${orderNumber} is confirmed. Tap Open WhatsApp to dispatch it directly to our manager.`;
    speakText(successSpeech);

    setMessages((prev) => [
      ...prev,
      {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: successSpeech,
        completedOrder: {
          orderNumber,
          whatsappUrl,
          summary: whatsappMessage,
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setVoiceOrder({
      step: 'idle',
      laptop: null,
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerDistrict: 'Dhaka',
      paymentMethod: 'Cash on Delivery (Courier Condition)',
    });
  };

  const handleCancelVoiceOrder = () => {
    setVoiceOrder({
      step: 'idle',
      laptop: null,
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerDistrict: 'Dhaka',
      paymentMethod: 'Cash on Delivery (Courier Condition)',
    });
    const cancelMsg = aiTexts.orderCancelled;
    speakText(cancelMsg);
    setMessages((prev) => [
      ...prev,
      {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: cancelMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleExecuteDownload = (tool: DownloadItem, category: string) => {
    recordDownloadEvent({
      softwareId: tool.id,
      softwareName: tool.title,
      category: category,
      version: tool.version || '1.0',
      fileSize: tool.size || '45 MB',
      ip: '203.188.245.12',
      country: 'Bangladesh',
      region: 'Dhaka',
      deviceType: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: 'Chrome',
      os: 'Windows 11',
      sessionId: `sess-${Date.now()}`,
      status: 'completed',
    });

    window.open(tool.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center">
        <button
          id="jhf-ai-assistant-trigger"
          onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-3 rounded-full shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
          aria-label={aiTexts.floatingLabel}
        >
          <span className="absolute -inset-1 rounded-full bg-blue-500/30 blur-sm group-hover:bg-blue-500/50 animate-pulse pointer-events-none" />

          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
          </div>

          <span className="relative font-bold text-xs tracking-wide hidden sm:inline">
            {aiTexts.floatingLabel}
          </span>

          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </button>
      </div>

      {/* Floating Chat Modal Panel */}
      {isAiAssistantOpen && (
        <div className="fixed bottom-20 right-3 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[600px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 font-sans">
          {/* Top Voice Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-black">
                <Bot className="w-5 h-5 text-amber-300" />
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight">{aiTexts.headerTitle}</h3>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                    {aiTexts.femaleVoice}
                  </span>
                </div>
                <p className="text-[10px] text-blue-200">{aiTexts.headerSub}</p>
              </div>
            </div>

            {/* Voice Controls: Mute, Speed, Close */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 rounded-xl transition ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isMuted ? aiTexts.unmuteVoice : aiTexts.muteVoice}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setSpeechRate((r) => (r === 1.0 ? 1.2 : r === 1.2 ? 0.8 : 1.0))}
                className="text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-xl transition"
                title={aiTexts.voiceSpeed}
              >
                {speechRate}x
              </button>

              <button
                onClick={() => setIsAiAssistantOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition ml-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Speech Error Banner */}
          {speechError && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[11px] text-amber-700 dark:text-amber-300 flex items-center justify-between">
              <span>{speechError}</span>
              <button onClick={() => setSpeechError(null)} className="font-bold text-xs ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message bubble */}
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/80 shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line text-xs sm:text-[13px]">{msg.text}</div>

                    {msg.sender === 'ai' && (
                      <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-700/50 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => speakText(msg.text)}
                          className="hover:text-blue-500 flex items-center gap-1 font-semibold"
                          title={aiTexts.replay}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{aiTexts.replay}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Voice Order Confirmation Screen */}
                  {msg.orderConfirmation && (
                    <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                        <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{aiTexts.orderScreenTitle}</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">
                          {aiTexts.pendingApproval}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">{aiTexts.customerLabel}</span>
                          <strong className="text-slate-900 dark:text-white">{msg.orderConfirmation.customerName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{aiTexts.phoneLabel}</span>
                          <strong className="text-slate-900 dark:text-white font-mono">{msg.orderConfirmation.phone}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{aiTexts.addressLabel}</span>
                          <span className="text-right max-w-[200px] truncate">{msg.orderConfirmation.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{aiTexts.productLabel}</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 text-right max-w-[200px] truncate">
                            {msg.orderConfirmation.productTitle}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{aiTexts.priceLabel}</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-black">
                            {typeof msg.orderConfirmation.price === 'number'
                              ? formatPrice(msg.orderConfirmation.price)
                              : msg.orderConfirmation.price}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{aiTexts.paymentLabel}</span>
                          <span className="text-slate-300 text-[11px]">{msg.orderConfirmation.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Confirmation Action Buttons: CONFIRM ORDER, EDIT, Cancel */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handleConfirmVoiceOrder(msg.orderConfirmation!)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{aiTexts.confirmOrderBtn}</span>
                        </button>

                        <button
                          onClick={() => startVoiceOrder(voiceOrder.laptop || allLaptops[0])}
                          className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs py-2 px-3 rounded-xl transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{aiTexts.editBtn}</span>
                        </button>

                        <button
                          onClick={handleCancelVoiceOrder}
                          className="text-rose-500 hover:text-rose-400 font-bold text-xs px-2 py-2"
                        >
                          {aiTexts.cancelBtn}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Completed Order Screen with OPEN WHATSAPP button */}
                  {msg.completedOrder && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-500 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {aiTexts.orderRegPrefix}
                          {msg.completedOrder.orderNumber}
                          {aiTexts.orderRegSuffix}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{aiTexts.dispatchNotice}</p>
                      <a
                        href={msg.completedOrder.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{aiTexts.openWhatsapp}</span>
                      </a>
                    </div>
                  )}

                  {/* Voice Download Confirmation Card */}
                  {msg.downloadCard && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                          {msg.downloadCard.category}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold">{aiTexts.verifiedPackage}</span>
                      </div>

                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {msg.downloadCard.tool.title}
                      </div>

                      <button
                        onClick={() =>
                          handleExecuteDownload(msg.downloadCard!.tool, msg.downloadCard!.category)
                        }
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{aiTexts.downloadNow}</span>
                      </button>
                    </div>
                  )}

                  {/* Product Recommendations Carousel */}
                  {msg.recommendations && (
                    <div className="space-y-2 pt-1">
                      {msg.recommendations.map((laptop) => (
                        <div
                          key={laptop.id}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3 hover:border-blue-500 transition"
                        >
                          <img
                            src={laptop.image}
                            alt={laptop.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                              {laptop.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {laptop.specs}
                            </p>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                              {typeof laptop.price === 'number' ? formatPrice(laptop.price) : laptop.price}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              onClick={() => startVoiceOrder(laptop)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition"
                            >
                              {aiTexts.voiceOrderBtn}
                            </button>
                            <button
                              onClick={() => {
                                setIsAiAssistantOpen(false);
                                onOpenOrderModal(laptop);
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition"
                            >
                              {aiTexts.checkoutBtn}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Chips */}
                  {msg.quickActions && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={qa.action}
                          className="text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-full transition shadow-2xs"
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Input & Text Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            {isListening && (
              <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 animate-pulse">
                <span className="flex items-center gap-2 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  {aiTexts.listeningText}
                </span>
                <button
                  onClick={() => recognitionRef.current?.stop()}
                  className="text-[11px] font-bold text-rose-500"
                >
                  {aiTexts.stopBtn}
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(inputQuery);
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Speech Recognition Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2.5 rounded-2xl transition shadow-sm ${
                  isListening
                    ? 'bg-rose-600 text-white animate-bounce'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                title={aiTexts.femaleVoice}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-500" />}
              </button>

              <input
                type="text"
                placeholder={aiTexts.inputPlaceholder}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition shadow-md shadow-blue-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
