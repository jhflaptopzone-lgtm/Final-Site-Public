import React from 'react';
import { useStore } from '../context/StoreContext';
import { useTranslation } from '../context/LanguageContext';
import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';

export const WarrantyZone: React.FC = () => {
  const { warrantyTiers } = useStore();
  const { language } = useTranslation();

  const isBn = language === 'bn';
  const isHi = language === 'hi';

  const texts = {
    badge: isBn
      ? 'সততা ও স্বচ্ছতার সাথে কাস্টমার প্রটেকশন'
      : isHi
      ? 'ईमानदारी और पारदर्शिता के साथ ग्राहक सुरक्षा'
      : 'Honest & Transparent Customer Protection',
    title: isBn
      ? '🛡️ জেএইচএফ ল্যাপটপ জোন ওয়ারেন্টি নীতিমালা'
      : isHi
      ? '🛡️ JHF लैपटॉप ज़ोन वारंटी नीति'
      : '🛡️ JHF LAPTOP ZONE Official Warranty Policy',
    subtitle: isBn
      ? 'গ্রাহকের শতভাগ সন্তুষ্টি ও স্বচ্ছতার জন্য আমাদের সকল প্রোডাক্টের ওয়ারেন্টি পলিসি নিচে বিস্তারিত তুলে ধরা হলো:'
      : isHi
      ? '100% ग्राहक संतुष्टि और पारदर्शिता के लिए हमारी विस्तृत वारंटी नीतियां नीचे दी गई हैं:'
      : 'For 100% customer satisfaction and complete transparency, our clear warranty policies are detailed below:',
    keyHighlights: isBn ? 'মূল সুবিধাসমূহ:' : isHi ? 'प्रमुख विशेषताएं:' : 'Key Highlights:',
    claimTitle: isBn
      ? 'ওয়ারেন্টি ক্লেইম বা হার্ডওয়্যার সাপোর্ট'
      : isHi
      ? 'वारंटी दावा या हार्डवेयर सपोर्ट'
      : 'Warranty Claim or Hardware Support',
    claimDesc: isBn
      ? 'যেকোনো সমস্যায় আমাদের হোয়াটসঅ্যাপে ইনভয়েস বা প্রোডাক্টের ছবি পাঠিয়ে দ্রুত সাপোর্ট গ্রহণ করুন।'
      : isHi
      ? 'किसी भी समस्या के लिए त्वरित सहायता हेतु इनवॉइस या उत्पाद का फोटो हमारे व्हाट्सएप पर भेजें।'
      : 'For any technical issue, send your invoice or product photo to our WhatsApp for expedited support.',
    contactBtn: isBn
      ? 'ওয়ারেন্টি টিমের সাথে যোগাযোগ'
      : isHi
      ? 'वारंटी टीम से संपर्क करें'
      : 'Contact Warranty Team',
    waMsg: isBn
      ? 'আসসালামু আলাইকুম JHF Laptop Zone, আমার একটি ওয়ারেন্টি সংক্রান্ত অনুসন্ধান আছে'
      : isHi
      ? 'नमस्ते JHF Laptop Zone, मुझे वारंटी के संबंध में पूछताछ करनी है'
      : 'Hello JHF Laptop Zone, I have a warranty inquiry',
  };

  return (
    <section className="py-8" id="warranty-zone">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>{texts.badge}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {texts.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {texts.subtitle}
          </p>
        </div>

        {/* 3 Tier Cards */}
        <div className="space-y-6">
          {warrantyTiers.map((tier) => {
            const isDubai = tier.id === 'dubai-original';
            const isChina = tier.id === 'china-product';

            const tierTitle = isBn
              ? tier.titleBn || tier.title
              : isHi
              ? tier.titleHi || tier.title
              : tier.title;

            const tierBadge = isBn
              ? tier.badgeBn || tier.badge
              : isHi
              ? tier.badgeHi || tier.badge
              : tier.badge;

            const tierDescription = isBn
              ? tier.descriptionBn
              : isHi
              ? tier.descriptionHi || tier.descriptionEn || tier.descriptionBn
              : tier.descriptionEn || tier.descriptionBn;

            const tierHighlights = isBn
              ? tier.highlights
              : isHi
              ? tier.highlightsHi || tier.highlightsEn || tier.highlights
              : tier.highlightsEn || tier.highlights;

            return (
              <div
                key={tier.id}
                className={`border rounded-2xl p-6 transition ${
                  isDubai
                    ? 'bg-gradient-to-br from-emerald-50/50 via-slate-50 to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-300 dark:border-emerald-800 shadow-md ring-1 ring-emerald-500/20'
                    : isChina
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-amber-300 dark:border-amber-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tier.emoji}</span>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                      {tierTitle}
                    </h3>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${tier.badgeColor}`}>
                    {tierBadge}
                  </span>
                </div>

                {/* Description */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 mb-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {tierDescription}
                </div>

                {/* Highlights */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {texts.keyHighlights}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tierHighlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDubai ? 'text-emerald-500' : isChina ? 'text-amber-500' : 'text-slate-500'}`} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note / Support Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {texts.claimTitle}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                {texts.claimDesc}
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/8801935693071?text=${encodeURIComponent(texts.waMsg)}`}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition"
          >
            {texts.contactBtn}
          </a>
        </div>

      </div>
    </section>
  );
};
