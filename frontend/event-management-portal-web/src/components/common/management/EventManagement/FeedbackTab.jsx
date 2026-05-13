import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Star,
  Send,
  User,
  Shield,
  Reply
} from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import eventService from "../../../../services/eventService";
import { toast } from "react-toastify";

const FeedbackTab = ({ eventId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetchFeedbacks();
      connectWebSocket();
    }

    return () => {
      if (stompClient) stompClient.deactivate();
    };
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

  const connectWebSocket = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const socket = new SockJS(`${apiBaseUrl}/ws/chat`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/feedback/${eventId}`, (message) => {
          const newFeedback = JSON.parse(message.body);
          setFeedbacks((prev) => {
            const index = prev.findIndex((f) => f.id === newFeedback.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = newFeedback;
              return updated;
            }
            return [newFeedback, ...prev];
          });
        });
      },
    });

    client.activate();
    setStompClient(client);
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Vừa xong";
    let normalizedDate = dateString;
    if (typeof dateString === 'string' && !dateString.includes('Z') && !dateString.includes('+')) {
      normalizedDate = dateString + 'Z';
    }
    const now = new Date();
    const past = new Date(normalizedDate);
    if (isNaN(past.getTime())) return "Vừa xong";

    const diffInSeconds = Math.floor((now - past) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);

    const isToday = now.toDateString() === past.toDateString();
    if (isToday) {
      if (diffInSeconds < 60) return "Vừa xong";
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      return `${diffInHours} giờ trước`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === past.toDateString()) {
      return `Hôm qua, ${past.getHours().toString().padStart(2, '0')}:${past.getMinutes().toString().padStart(2, '0')}`;
    }

    return past.toLocaleDateString('vi-VN');
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

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Đang tải đánh giá...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-4 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Đánh giá người tham gia
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {feedbacks.length} đánh giá
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
          <MessageSquare size={14} className="text-amber-500" />
          Feedback
        </div>
      </div>

      {/* Empty */}
      {feedbacks.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
            <MessageSquare size={24} />
          </div>

          <h4 className="text-base font-semibold text-slate-700 mb-1">
            Chưa có đánh giá nào
          </h4>

          <p className="text-sm text-slate-500">
            Đánh giá từ người tham gia sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb, index) => (
            <div
              key={fb.id}
              className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-100 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-5">
                {/* Left */}
                <div className="w-full lg:w-60 shrink-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden
                      ${fb.isAnonymous
                          ? "bg-slate-100 text-slate-600"
                          : "bg-indigo-50 text-indigo-700"
                        }
                    `}
                    >
                      {fb.isAnonymous ? (
                        <Shield size={17} />
                      ) : fb.user?.avatarUrl ? (
                        <img src={fb.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={17} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {fb.isAnonymous
                          ? "Người tham gia ẩn danh"
                          : fb.user?.fullName || fb.reviewerAccountId || "Người tham gia"}
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        {getRelativeTime(fb.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-4 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className={
                          fb.rating >= star
                            ? "text-amber-400"
                            : "text-slate-300"
                        }
                        fill={
                          fb.rating >= star
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}

                    <span className="ml-2 text-xs font-medium text-slate-500">
                      {fb.rating}/5
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex-1 space-y-4">
                  {fb.ratingReason && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 mb-2">
                        Lý do đánh giá
                      </p>

                      <p className="text-sm leading-7 text-slate-700">
                        {fb.ratingReason}
                      </p>
                    </div>
                  )}

                  {fb.comment && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
                        Góp ý
                      </p>

                      <p className="text-sm leading-7 text-slate-700 whitespace-pre-line">
                        {fb.comment}
                      </p>
                    </div>
                  )}

                  {/* Reply */}
                  {fb.organizerReply ? (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <Reply size={14} />
                        </div>

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                          Phản hồi từ ban tổ chức
                        </p>
                      </div>

                      <p className="text-sm leading-7 text-slate-700 whitespace-pre-line">
                        {fb.organizerReply}
                      </p>

                      <p className="text-xs text-slate-400 mt-3">
                        {getRelativeTime(fb.repliedAt)}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100">
                      {replyingTo === fb.id ? (
                        <div className="space-y-3">
                          <textarea
                            autoFocus
                            rows={4}
                            value={replyText}
                            onChange={(e) =>
                              setReplyText(e.target.value)
                            }
                            placeholder="Nhập phản hồi..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-300 focus:bg-white transition-all"
                          />

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleReply(fb.id)
                              }
                              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
                            >
                              <Send size={15} />
                              Gửi phản hồi
                            </button>

                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-all"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setReplyingTo(fb.id)
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <Reply size={15} />
                          Phản hồi
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackTab;