import React, { useState, useMemo } from 'react';
import { useAdminStore } from '../adminStore';
import { CustomerReview, ToolComment } from '../types';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  EyeOff,
  Trash2,
  Pin,
  CornerDownRight,
  Send,
  Search,
  Filter,
  ShieldCheck,
  Laptop,
  Download,
  Disc,
  Wrench,
  ThumbsUp,
} from 'lucide-react';

export const CustomerReviewsAndCommentsView: React.FC = () => {
  const {
    customerReviews,
    toolComments,
    updateCustomerReviewStatus,
    deleteCustomerReview,
    updateToolCommentStatus,
    deleteToolComment,
    addToolCommentReply,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'reviews' | 'comments'>('reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'hidden'>('all');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return (customerReviews || []).filter((rev) => {
      const q = searchQuery.toLowerCase().trim();
      const target = (rev.targetName || rev.targetTitle || '').toLowerCase();
      const cust = (rev.customerName || '').toLowerCase();
      const text = (rev.comment || rev.reviewText || '').toLowerCase();
      const matchesSearch = !q || target.includes(q) || cust.includes(q) || text.includes(q);
      const matchesStatus = statusFilter === 'all' || rev.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customerReviews, searchQuery, statusFilter]);

  // Filtered comments
  const filteredComments = useMemo(() => {
    return (toolComments || []).filter((comm) => {
      const q = searchQuery.toLowerCase().trim();
      const tool = (comm.toolName || comm.targetTitle || '').toLowerCase();
      const user = (comm.userName || comm.authorName || '').toLowerCase();
      const text = (comm.comment || comm.content || '').toLowerCase();
      const matchesSearch = !q || tool.includes(q) || user.includes(q) || text.includes(q);
      const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [toolComments, searchQuery, statusFilter]);

  const handleSendReply = (commentId: string) => {
    if (!replyText.trim()) return;
    addToolCommentReply(commentId, 'JHF Support Engineer', replyText.trim());
    setReplyingCommentId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <span>Customer Reviews &amp; Comments Moderation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and moderate 1-5 star customer ratings, verify buyer badges, pin verified reviews, and reply to technical inquiries.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl self-start">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Product Reviews ({customerReviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'comments'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Zone Comments &amp; QA ({toolComments.length})</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, product, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Moderation Status</option>
            <option value="approved">Approved &amp; Live</option>
            <option value="pending">Pending Moderation</option>
            <option value="hidden">Hidden / Flagged</option>
          </select>
        </div>
      </div>

      {/* TAB: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              No customer reviews match your active filter.
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                      {(rev.customerName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{rev.customerName || 'Customer'}</span>
                        {(rev.verifiedPurchase ?? rev.isVerifiedPurchase ?? false) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            rev.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : rev.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {rev.status || 'pending'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Reviewed:{' '}
                        <strong className="text-slate-200">{rev.targetName || rev.targetTitle || 'Business Laptop'}</strong> •{' '}
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-1.5">{rev.rating}.0</span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-2">
                  "{rev.comment || rev.reviewText || ''}"
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => updateCustomerReviewStatus(rev.id, 'approved')}
                        className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Review</span>
                      </button>
                    )}

                    {rev.status !== 'hidden' && (
                      <button
                        onClick={() => updateCustomerReviewStatus(rev.id, 'hidden')}
                        className="bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Delete this customer review permanently?')) {
                          deleteCustomerReview(rev.id);
                        }
                      }}
                      className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: COMMENTS */}
      {activeTab === 'comments' && (
        <div className="space-y-3">
          {filteredComments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              No tool or software comments match your active filter.
            </div>
          ) : (
            filteredComments.map((comm) => (
              <div
                key={comm.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {(comm.userName || comm.authorName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{comm.userName || comm.authorName || 'Verified User'}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                          {comm.zone || 'Technical'} Zone
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            comm.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : comm.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {comm.status || 'pending'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tool: <strong className="text-slate-200">{comm.toolName || comm.targetTitle || 'Technical Software'}</strong> •{' '}
                        {comm.createdAt ? new Date(comm.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-2">
                  "{comm.comment || comm.content || ''}"
                </p>

                {/* Existing Replies */}
                {comm.replies && comm.replies.length > 0 && (
                  <div className="pl-6 space-y-2 border-l-2 border-blue-500/40 my-2">
                    {comm.replies.map((reply) => (
                      <div key={reply.id} className="bg-slate-800/60 p-3 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {reply.author}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input Box if active */}
                {replyingCommentId === comm.id && (
                  <div className="p-3 bg-slate-800/70 rounded-2xl border border-slate-700 space-y-2">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-blue-400" />
                      <span>Reply as Official JHF Technical Support</span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Write helpful technical answer or advice..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyingCommentId(null)}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSendReply(comm.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1 rounded-xl transition flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Post Reply</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Moderation Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    {comm.status !== 'approved' && (
                      <button
                        onClick={() => updateToolCommentStatus(comm.id, 'approved')}
                        className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {comm.status !== 'hidden' && (
                      <button
                        onClick={() => updateToolCommentStatus(comm.id, 'hidden')}
                        className="bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </button>
                    )}

                    <button
                      onClick={() => setReplyingCommentId(comm.id)}
                      className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Delete this comment permanently?')) {
                          deleteToolComment(comm.id);
                        }
                      }}
                      className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
