import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Shield, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';

const FeedbackModal = ({ isOpen, onClose, eventId, user }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingReason, setRatingReason] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Vui lòng chọn mức độ hài lòng!");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        reviewerAccountId: user?.username || "anonymous",
        rating,
        comment,
        ratingReason,
        isAnonymous
      };
      
      // We'll need to add this method to eventService
      await eventService.submitFeedback(eventId, payload);
      
      toast.success("Cảm ơn đánh giá của bạn!");
      onClose();
      // Reset form
      setRating(0);
      setComment("");
      setRatingReason("");
    } catch (err) {
      toast.error("Lỗi khi gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Đánh giá sự kiện</h2>
              <p className="text-xs text-white/60 font-bold uppercase tracking-widest">Góp ý để chúng tôi tốt hơn</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Rating Section */}
          <div className="text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Bạn thấy sự kiện này thế nào?</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={40}
                    className={`transition-colors ${
                      (hover || rating) >= star ? 'text-amber-400' : 'text-slate-100'
                    }`}
                    fill={(hover || rating) >= star ? 'currentColor' : 'none'}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm font-black text-indigo-600 uppercase tracking-widest"
              >
                {rating === 5 ? "Tuyệt vời!" : rating === 4 ? "Rất tốt" : rating === 3 ? "Bình thường" : rating === 2 ? "Không tốt" : "Rất tệ"}
              </motion.p>
            )}
          </div>

          <AnimatePresence>
            {rating > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-6"
              >
                {/* Rating Reason - The new field requested by user */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lý do cho mức đánh giá này</label>
                  <div className="relative">
                    <textarea
                      value={ratingReason}
                      onChange={(e) => setRatingReason(e.target.value)}
                      placeholder="Tại sao bạn lại đưa ra mức điểm này?"
                      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium min-h-[100px]"
                    />
                    <AlertCircle className="absolute top-5 right-5 text-slate-300" size={18} />
                  </div>
                </div>

                {/* Comment Section */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Góp ý thêm (Tùy chọn)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Bạn có muốn nhắn nhủ gì thêm với Ban tổ chức không?"
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium min-h-[100px]"
                  />
                </div>

                {/* Anonymous Toggle */}
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="flex items-center gap-3 group"
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isAnonymous ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-transparent'
                  }`}>
                    <Shield size={14} fill="currentColor" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Gửi đánh giá ẩn danh</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <button
            disabled={isSubmitting || rating === 0}
            onClick={handleSubmit}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
              rating > 0 
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Gửi đánh giá ngay
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackModal;
