import React, { useState } from 'react';
import { useAdminStore } from '../admin/adminStore';
import { useTranslation } from '../context/LanguageContext';
import {
  Star,
  MessageSquare,
  ShieldCheck,
  Send,
  CheckCircle2,
  ThumbsUp,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

export const CustomerReviewsSection: React.FC = () => {
  const { customerReviews, addCustomerReview } = useAdminStore();
  const { language } = useTranslation();

  const texts = {
    en: {
      badge: 'Customer Trust & Verified Reviews',
      title: 'What Customers Say About JHF Laptops',
      subtitle: 'Genuine experiences from software engineers, freelancers, and business professionals across Bangladesh.',
      verifiedBuyersCount: 'Over 150+',
      verifiedBuyersLabel: 'Verified Buyers',
      writeReviewBtn: 'Write a Review',
      formTitle: 'Share Your Purchase Experience',
      cancelBtn: 'Cancel',
      successMsg: 'Thank you! Your verified review has been submitted and published.',
      nameLabel: 'Your Full Name',
      namePlaceholder: 'e.g. Tanvir Ahmed',
      modelLabel: 'Purchased Laptop Model',
      modelPlaceholder: 'e.g. Lenovo ThinkPad T14 Gen 1',
      ratingLabel: 'Overall Rating',
      stars: 'Stars',
      reviewLabel: 'Your Review / Experience',
      reviewPlaceholder: 'Share details regarding condition, battery backup, performance, or courier delivery...',
      submitBtn: 'Submit Review',
      verifiedBuyerTag: 'Verified Buyer',
      recent: 'Recent',
    },
    bn: {
      badge: 'গ্রাহক আস্থা ও ভেরিফাইড রিভিউ',
      title: 'জেএইচএফ ল্যাপটপ সম্পর্কে ক্রেতাদের মতামত',
      subtitle: 'বাংলাদেশ জুড়ে সফটওয়্যার ইঞ্জিনিয়ার, ফ্রিল্যান্সার এবং পেশাজীবীদের বাস্তব অভিজ্ঞতা।',
      verifiedBuyersCount: '১৫০+ এর বেশি',
      verifiedBuyersLabel: 'ভেরিফাইড ক্রেতা',
      writeReviewBtn: 'রিভিউ লিখুন',
      formTitle: 'আপনার ক্রয়ের অভিজ্ঞতা শেয়ার করুন',
      cancelBtn: 'বাতিল',
      successMsg: 'ধন্যবাদ! আপনার ভেরিফাইড রিভিউ সফলভাবে জমা এবং প্রকাশিত হয়েছে।',
      nameLabel: 'আপনার পূর্ণ নাম',
      namePlaceholder: 'যেমন: তানভীর আহমেদ',
      modelLabel: 'ক্রয়কৃত ল্যাপটপের মডেল',
      modelPlaceholder: 'যেমন: লেনোভো থিংকপ্যাড টি১৪',
      ratingLabel: 'সার্বিক রেটিং',
      stars: 'স্টার',
      reviewLabel: 'আপনার রিভিউ / অভিজ্ঞতা',
      reviewPlaceholder: 'কন্ডিশন, ব্যাটারি ব্যাকআপ, পারফরম্যান্স বা ডেলিভারি নিয়ে বিস্তারিত লিখুন...',
      submitBtn: 'রিভিউ সাবমিট করুন',
      verifiedBuyerTag: 'ভেরিফাইড ক্রেতা',
      recent: 'সম্প্রতি',
    },
    hi: {
      badge: 'ग्राहक विश्वास और सत्यापित समीक्षाएं',
      title: 'जेएचएफ लैपटॉप के बारे में ग्राहकों की राय',
      subtitle: 'बांग्लादेश भर के सॉफ्टवेयर इंजीनियरों, फ्रीलांसरों और पेशेवरों के वास्तविक अनुभव।',
      verifiedBuyersCount: '150+ से अधिक',
      verifiedBuyersLabel: 'सत्यापित खरीदार',
      writeReviewBtn: 'समीक्षा लिखें',
      formTitle: 'अपना खरीदारी अनुभव साझा करें',
      cancelBtn: 'रद्द करें',
      successMsg: 'धन्यवाद! आपकी सत्यापित समीक्षा जमा कर दी गई है और प्रकाशित हो गई है।',
      nameLabel: 'आपका पूरा नाम',
      namePlaceholder: 'उदा. तनवीर अहमद',
      modelLabel: 'खरीदा गया लैपटॉप मॉडल',
      modelPlaceholder: 'उदा. लेनोवो थिंकपैड T14',
      ratingLabel: 'समग्र रेटिंग',
      stars: 'स्टार',
      reviewLabel: 'आपकी समीक्षा / अनुभव',
      reviewPlaceholder: 'कंडीशन, बैटरी बैकअप, परफॉर्मेंस या डिलीवरी के बारे में विस्तार से लिखें...',
      submitBtn: 'समीक्षा सबमिट करें',
      verifiedBuyerTag: 'सत्यापित खरीदार',
      recent: 'हाल ही में',
    },
  }[language] || {
    badge: 'Customer Trust & Verified Reviews',
    title: 'What Customers Say About JHF Laptops',
    subtitle: 'Genuine experiences from software engineers, freelancers, and business professionals across Bangladesh.',
    verifiedBuyersCount: 'Over 150+',
    verifiedBuyersLabel: 'Verified Buyers',
    writeReviewBtn: 'Write a Review',
    formTitle: 'Share Your Purchase Experience',
    cancelBtn: 'Cancel',
    successMsg: 'Thank you! Your verified review has been submitted and published.',
    nameLabel: 'Your Full Name',
    namePlaceholder: 'e.g. Tanvir Ahmed',
    modelLabel: 'Purchased Laptop Model',
    modelPlaceholder: 'e.g. Lenovo ThinkPad T14 Gen 1',
    ratingLabel: 'Overall Rating',
    stars: 'Stars',
    reviewLabel: 'Your Review / Experience',
    reviewPlaceholder: 'Share details regarding condition, battery backup, performance, or courier delivery...',
    submitBtn: 'Submit Review',
    verifiedBuyerTag: 'Verified Buyer',
    recent: 'Recent',
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [targetName, setTargetName] = useState('Lenovo ThinkPad T14 / Business Series');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Approved reviews to display to the public
  const approvedReviews = (customerReviews || []).filter((r) => r.status === 'approved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    addCustomerReview({
      targetType: 'laptop',
      targetTitle: targetName.trim(),
      targetName: targetName.trim(),
      customerName: customerName.trim(),
      rating,
      reviewText: comment.trim(),
      comment: comment.trim(),
      isVerifiedPurchase: true,
      verifiedPurchase: true,
      status: 'approved', // Live with verified flag
    });

    setSubmittedSuccess(true);
    setCustomerName('');
    setComment('');
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsFormOpen(false);
    }, 2500);
  };

  return (
    <section id="customer-reviews-section" className="space-y-6 pt-4 font-sans">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span>{texts.badge}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {texts.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {texts.subtitle}
          </p>
        </div>

        {/* Rating Summary & Write Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-2xs">
            <div className="text-xl font-black text-amber-500 flex items-center">
              4.9
              <Star className="w-4 h-4 fill-amber-500 ml-1" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              <div>{texts.verifiedBuyersCount}</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">{texts.verifiedBuyersLabel}</div>
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-3 rounded-2xl transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{texts.writeReviewBtn}</span>
          </button>
        </div>
      </div>

      {/* Review Submission Form Drawer/Accordion */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              {texts.formTitle}
            </span>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
            >
              {texts.cancelBtn}
            </button>
          </div>

          {submittedSuccess ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{texts.successMsg}</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    {texts.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={texts.namePlaceholder}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                    {texts.modelLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={texts.modelPlaceholder}
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {texts.ratingLabel}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-amber-500 ml-2">
                    {rating} {texts.stars}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {texts.reviewLabel}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={texts.reviewPlaceholder}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{texts.submitBtn}</span>
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {approvedReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="space-y-2">
              {/* Rating & Verified Buyer Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {(rev.verifiedPurchase ?? rev.isVerifiedPurchase ?? false) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    {texts.verifiedBuyerTag}
                  </span>
                )}
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{rev.comment || rev.reviewText || ''}"
              </p>
            </div>

            {/* Customer & Product Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white">
                  {rev.customerName || texts.verifiedBuyerTag}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                  {rev.targetName || rev.targetTitle || 'Business Laptop'}
                </div>
              </div>

              <div className="text-[10px] text-slate-400">
                {rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-US')
                  : texts.recent}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

