import React, { useState } from 'react';
import { useCustomer, CustomerReview } from '../context/CustomerContext';
import { useTranslation } from '../context/LanguageContext';
import {
  X,
  Star,
  MessageSquare,
  CheckCircle2,
  Send,
  User,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface ReviewsAndRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
}

export const ReviewsAndRatingModal: React.FC<ReviewsAndRatingModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetName,
}) => {
  const { addReview, getProductReviews, getAverageRating } = useCustomer();
  const { language } = useTranslation();
  const [userName, setUserName] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const texts = {
    en: {
      title: 'Customer Reviews & Ratings',
      leaveFeedback: 'Leave Your Feedback & Rating',
      starsLabel: (r: number) => `${r} / 5 Stars`,
      namePlaceholder: 'Your Name *',
      commentPlaceholder: 'Write your honest review (battery, condition, performance, delivery)...',
      errorRequired: 'Please enter both your name and review details.',
      successSaved: 'Thank you! Your verified rating has been saved successfully.',
      submitBtn: 'Submit Review',
      verifiedHeader: (n: number) => `Verified Customer Ratings (${n})`,
      noReviews: 'No reviews yet for this model. Be the first to rate!',
      verifiedBuyer: 'Verified Buyer',
      recent: 'Recent',
    },
    bn: {
      title: 'গ্রাহক রিভিউ ও রেটিং',
      leaveFeedback: 'আপনার অভিজ্ঞতা ও রেটিং দিন',
      starsLabel: (r: number) => `${r} / ৫ স্টার`,
      namePlaceholder: 'আপনার নাম *',
      commentPlaceholder: 'আপনার মতামত লিখুন (ব্যাটারি, বডি কন্ডিশন, পারফরম্যান্স, ডেলিভারি)...',
      errorRequired: 'দয়া করে আপনার নাম এবং রিভিউ বিবরণ লিখুন।',
      successSaved: 'ধন্যবাদ! আপনার রিভিউ সফলভাবে সংরক্ষিত হয়েছে।',
      submitBtn: 'রিভিউ সাবমিট করুন',
      verifiedHeader: (n: number) => `যাচাইকৃত গ্রাহক রেটিং (${n})`,
      noReviews: 'এই মডেলের জন্য এখনও কোনো রিভিউ নেই। প্রথম রেটিং দিন!',
      verifiedBuyer: 'ভেরিফায়েড ক্রেতা',
      recent: 'সম্প্রতি',
    },
    hi: {
      title: 'ग्राहक समीक्षाएं व रेटिंग',
      leaveFeedback: 'अपनी प्रतिक्रिया व रेटिंग दें',
      starsLabel: (r: number) => `${r} / ५ सितारे`,
      namePlaceholder: 'आपका नाम *',
      commentPlaceholder: 'अपनी ईमानदार समीक्षा लिखें (बैटरी, कंडीशन, परफॉर्मेंस, डिलीवरी)...',
      errorRequired: 'कृपया अपना नाम और समीक्षा दोनों दर्ज करें।',
      successSaved: 'धन्यवाद! आपकी समीक्षा सफलतापूर्वक सुरक्षित कर ली गई है।',
      submitBtn: 'समीक्षा भेजें',
      verifiedHeader: (n: number) => `सत्यापित ग्राहक समीक्षाएं (${n})`,
      noReviews: 'इस मॉडल के लिए अभी कोई समीक्षा नहीं है। पहले समीक्षक बनें!',
      verifiedBuyer: 'सत्यापित खरीदार',
      recent: 'हाल ही में',
    },
  }[language] || {
    title: 'Customer Reviews & Ratings',
    leaveFeedback: 'Leave Your Feedback & Rating',
    starsLabel: (r: number) => `${r} / 5 Stars`,
    namePlaceholder: 'Your Name *',
    commentPlaceholder: 'Write your honest review (battery, condition, performance, delivery)...',
    errorRequired: 'Please enter both your name and review details.',
    successSaved: 'Thank you! Your verified rating has been saved successfully.',
    submitBtn: 'Submit Review',
    verifiedHeader: (n: number) => `Verified Customer Ratings (${n})`,
    noReviews: 'No reviews yet for this model. Be the first to rate!',
    verifiedBuyer: 'Verified Buyer',
    recent: 'Recent',
  };

  if (!isOpen) return null;

  const productReviews = getProductReviews(targetId) || [];
  const { rating: avgRating, count: totalReviews } = getAverageRating(targetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!userName.trim() || !userComment.trim()) {
      setFormError(texts.errorRequired);
      return;
    }

    addReview({
      targetId,
      targetName,
      customerName: userName.trim(),
      rating: userRating,
      comment: userComment.trim(),
      verifiedPurchase: true,
    });

    setUserComment('');
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {texts.title}
              </h3>
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" /> {avgRating} ({totalReviews})
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
              {targetName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Write a review section */}
          <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {texts.leaveFeedback}
            </h4>

            {/* Star selector */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 dark:text-slate-600 transition hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || userRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
                {texts.starsLabel(userRating)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder={texts.namePlaceholder}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <textarea
              rows={2}
              placeholder={texts.commentPlaceholder}
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
            />

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{texts.successSaved}</span>
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{texts.submitBtn}</span>
            </button>
          </form>

          {/* Review List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {texts.verifiedHeader(productReviews.length)}
            </h4>

            {productReviews.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                {texts.noReviews}
              </div>
            ) : (
              <div className="space-y-3">
                {productReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {rev.customerName}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" /> {texts.verifiedBuyer}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                      {rev.comment}
                    </p>

                    <div className="text-[10px] text-slate-400 pl-8 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : texts.recent}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
