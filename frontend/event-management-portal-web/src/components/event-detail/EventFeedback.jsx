import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Shield, User } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import eventService from "../../services/eventService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const EventFeedback = ({ eventId, event, role }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);

  const { user } = useAuth();

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newReason, setNewReason] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchFeedbacks();
      fetchFeedbackStatus();
      connectWebSocket();
    }

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [eventId]);

  const fetchFeedbackStatus = async () => {
    try {
      const res = await eventService.getFeedbackStatus(eventId);
      setFeedbackEnabled(res.data);
    } catch (err) {
      console.error("Error fetching feedback status:", err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await eventService.getFeedbacksByEvent(eventId);
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "https://fitiuh-events.io.vn";

    const socket = new SockJS(`${apiBaseUrl}/ws/chat`);

    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/feedback/${eventId}`, (message) => {
          const newFeedback = JSON.parse(message.body);

          if (newFeedback.id === "SYSTEM_FEEDBACK_STATUS") {
            setFeedbackEnabled(newFeedback.comment === "FEEDBACK_STATUS:OPEN");
            return;
          }

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

  // GIỮ NGUYÊN LOGIC THỜI GIAN CỦA BẠN
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Vừa xong";

    let normalizedDate = dateString;

    if (
      typeof dateString === "string" &&
      !dateString.includes("Z") &&
      !dateString.includes("+")
    ) {
      normalizedDate = dateString + "Z";
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
      return `Hôm qua, ${past
        .getHours()
        .toString()
        .padStart(2, "0")}:${past
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
    }

    return past.toLocaleDateString("vi-VN");
  };

  const handleSubmitFeedback = async () => {
    if (newRating === 0) {
      toast.warning("Vui lòng chọn số sao");
      return;
    }

    if (!newReason.trim()) {
      toast.warning("Vui lòng nhập lý do đánh giá");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        reviewerAccountId: user?.id || "anonymous",
        rating: newRating,
        comment: newComment,
        ratingReason: newReason,
        isAnonymous,
      };

      await eventService.submitFeedback(eventId, payload);

      toast.success("Đã gửi đánh giá");

      setNewRating(0);
      setNewComment("");
      setNewReason("");
      setIsAnonymous(false);
    } catch (err) {
      toast.error("Lỗi khi gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating =
    feedbacks.length > 0
      ? (
        feedbacks.reduce((acc, fb) => acc + fb.rating, 0) /
        feedbacks.length
      ).toFixed(1)
      : 0;

  return (
    <section id="feedbacks" className="bg-white border border-slate-200 rounded-2xl mt-6 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Đánh giá sự kiện
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Ý kiến từ người tham gia
          </p>
        </div>

        {feedbacks.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <Star
              size={16}
              className="text-amber-400"
              fill="currentColor"
            />
            <span className="font-semibold text-slate-800">
              {averageRating}
            </span>
            <span className="text-sm text-slate-400">
              ({feedbacks.length})
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Form */}
        {role.registered && role.registration?.checkedIn && (
          (event?.status === "COMPLETED" || feedbackEnabled) ? (
            <div className="mb-8 border border-slate-200 rounded-2xl p-5 bg-slate-50">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-indigo-600" />
                  )}
                </div>

                <div>
                  <p className="font-medium text-slate-800">
                    {user?.fullName || "Bạn"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Chia sẻ cảm nhận của bạn
                  </p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="transition hover:scale-105"
                  >
                    <Star
                      size={28}
                      fill={newRating >= star ? "currentColor" : "none"}
                      className={
                        newRating >= star
                          ? "text-amber-400"
                          : "text-slate-300"
                      }
                    />
                  </button>
                ))}
              </div>

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lý do đánh giá
                </label>

                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Ví dụ: Nội dung hữu ích..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white text-sm"
                />
              </div>

              {/* Comment */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Góp ý thêm
                </label>

                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ thêm cảm nhận của bạn..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white text-sm resize-none"
                />
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${isAnonymous
                      ? "bg-slate-800 border-slate-800 text-white"
                      : "border-slate-300"
                      }`}
                  >
                    <Shield size={10} />
                  </div>

                  Ẩn danh
                </button>

                <button
                  disabled={isSubmitting || newRating === 0}
                  onClick={handleSubmitFeedback}
                  className={`px-5 py-3 rounded-xl text-sm font-medium transition ${newRating > 0
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 border border-slate-200 rounded-2xl p-6 bg-amber-50/40 border-dashed flex flex-col items-center text-center">
              <Shield size={24} className="text-amber-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">
                Tính năng đánh giá sự kiện chưa mở
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                Ý kiến từ người tham gia sẽ tự động mở ra khi sự kiện kết thúc hoặc ban tổ chức có thể kích hoạt mở.
              </p>
            </div>
          )
        )}

        {/* Feedback list */}
        {loading ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            Đang tải đánh giá...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-10 text-center">
            <MessageSquare
              size={28}
              className="mx-auto text-slate-300 mb-3"
            />
            <p className="text-sm text-slate-400">
              Chưa có đánh giá nào
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {feedbacks.map((fb, idx) => (
              <div
                key={fb.id || idx}
                className="border border-slate-200 rounded-2xl p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${fb.isAnonymous
                      ? "bg-slate-100 text-slate-500"
                      : "bg-indigo-100 text-indigo-600"
                      }`}
                  >
                    {fb.isAnonymous ? (
                      <Shield size={16} />
                    ) : fb.user?.avatarUrl ? (
                      <img
                        src={fb.user.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-medium text-slate-800 truncate">
                        {fb.isAnonymous
                          ? "Người dùng ẩn danh"
                          : fb.user?.fullName || "Người tham gia"}
                      </h4>

                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {getRelativeTime(fb.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 mt-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          fill={
                            fb.rating >= star ? "currentColor" : "none"
                          }
                          className={
                            fb.rating >= star
                              ? "text-amber-400"
                              : "text-slate-200"
                          }
                        />
                      ))}
                    </div>

                    {fb.ratingReason && (
                      <p className="text-sm text-slate-700 mb-2">
                        <span className="font-medium">Lý do:</span>{" "}
                        {fb.ratingReason}
                      </p>
                    )}

                    {fb.comment && (
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {fb.comment}
                      </p>
                    )}

                    {fb.organizerReply && (
                      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-xs font-medium text-indigo-600 mb-1">
                          Phản hồi từ ban tổ chức
                        </p>

                        <p className="text-sm text-slate-600">
                          {fb.organizerReply}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventFeedback; 
