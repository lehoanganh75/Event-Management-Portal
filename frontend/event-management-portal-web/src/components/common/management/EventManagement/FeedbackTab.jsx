import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, User, Shield, Reply } from 'lucide-react';
import eventService from '../../../../services/eventService';
import { toast } from 'react-toastify';

const FeedbackTab = ({ eventId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (eventId) fetchFeedbacks();
  }, [eventId]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await eventService.getFeedbacksByEvent(eventId);
      setFeedbacks(res.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (feedbackId) => {
    if (!replyText.trim()) return;
    try {
      await eventService.replyToFeedback(feedbackId, replyText);
      toast.success("Đã gửi phản hồi");
      setReplyingTo(null);
      setReplyText("");
      fetchFeedbacks();
    } catch (err) {
      toast.error("Lỗi khi gửi phản hồi");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải đánh giá...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Đánh giá từ người tham gia</h3>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {feedbacks.length} lượt đánh giá</p>
        </div>
      </div>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Chưa có đánh giá nào cho sự kiện này.</p>
          </div>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6">
                
                {/* User Info & Rating */}
                <div className="w-full sm:w-48 shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      {fb.isAnonymous ? <Shield size={16} /> : <User size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {fb.isAnonymous ? "Ẩn danh" : fb.reviewerAccountId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={16}
                        className={fb.rating >= star ? 'text-amber-400' : 'text-gray-200'}
                        fill={fb.rating >= star ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="flex-1 space-y-3">
                  {fb.ratingReason && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100/50">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Lý do đánh giá:</p>
                      <p className="text-sm text-gray-700">{fb.ratingReason}</p>
                    </div>
                  )}
                  
                  {fb.comment && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Góp ý thêm:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{fb.comment}</p>
                    </div>
                  )}

                  {/* Organizer Reply Section */}
                  {fb.organizerReply ? (
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Ban tổ chức đã phản hồi:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{fb.organizerReply}</p>
                      <p className="text-xs text-blue-400 mt-2">
                        {new Date(fb.repliedAt).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 border-t mt-4">
                      {replyingTo === fb.id ? (
                        <div className="space-y-3">
                          <textarea
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Nhập phản hồi của bạn..."
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReply(fb.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                            >
                              <Send size={16} /> Gửi phản hồi
                            </button>
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(""); }}
                              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(fb.id)}
                          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          <Reply size={16} /> Phản hồi đánh giá này
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackTab;
