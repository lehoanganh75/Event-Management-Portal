import React, { useState, useEffect } from "react";
import { MessageCircle, Play, Square, AlertCircle } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import eventService from "../../../../services/eventService";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext";

const QATab = ({ eventId, event }) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);
  const [qaEnabled, setQaEnabled] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchMessages();
      fetchQAStatus();
      connectWebSocket();
    }

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [eventId]);

  const fetchQAStatus = async () => {
    try {
      const res = await eventService.getQAStatus(eventId);
      setQaEnabled(res.data);
    } catch (err) {
      console.error("Error fetching QA status:", err);
    }
  };

  const handleToggleQA = async () => {
    try {
      const nextState = !qaEnabled;
      const res = await eventService.toggleQAStatus(eventId, nextState);
      setQaEnabled(res.data);
      toast.success(res.data ? "Đã mở đặt câu hỏi Q&A" : "Đã đóng đặt câu hỏi Q&A");
    } catch (err) {
      toast.error("Không thể thay đổi trạng thái Q&A");
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await eventService.getQAMessages(eventId);

      setMessages(res.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://fitiuh-events.io.vn";
    const socket = new SockJS(`${apiBaseUrl}/ws/chat`);

    const client = new Client({
      webSocketFactory: () => socket,

      onConnect: () => {
        client.subscribe(`/topic/qa/${eventId}`, (message) => {
          const receivedMsg = JSON.parse(message.body);

          if (receivedMsg.senderAccountId === "SYSTEM" && receivedMsg.id === "SYSTEM_QA_STATUS") {
            setQaEnabled(receivedMsg.content === "QA_STATUS:OPEN");
            return;
          }

          setMessages((prev) => {
            const index = prev.findIndex(
              (m) => m.id === receivedMsg.id
            );

            if (index !== -1) {
              const newList = [...prev];
              newList[index] = receivedMsg;
              return newList;
            }

            return [receivedMsg, ...prev];
          });
        });
      }
    });

    client.activate();
    setStompClient(client);
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Vừa xong";

    // Xử lý lệch múi giờ: Nếu server trả về UTC không có 'Z', thêm 'Z' để browser hiểu là UTC
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

    // Kiểm tra cùng ngày
    const isToday = now.toDateString() === past.toDateString();

    if (isToday) {
      if (diffInSeconds < 60) return "Vừa xong";
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      return `${diffInHours} giờ trước`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === past.toDateString();
    if (isYesterday) {
      return `Hôm qua, ${past.getHours().toString().padStart(2, '0')}:${past.getMinutes().toString().padStart(2, '0')}`;
    }

    return past.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Đang tải tin nhắn...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 px-5 py-4 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Trao đổi trực tuyến
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {messages.length} tin nhắn
          </p>
        </div>

        <div className="flex items-center gap-3">
          {event?.status !== "ONGOING" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
              <AlertCircle size={14} />
              Sự kiện chưa diễn ra (Khóa Q&A)
            </div>
          ) : (
            <button
              onClick={handleToggleQA}
              className={`
                inline-flex items-center gap-2
                px-4 py-2
                rounded-xl
                text-xs font-bold uppercase tracking-wider
                transition-all active:scale-95 shadow-sm
                ${qaEnabled
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100"
                  : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-100"
                }
              `}
            >
              {qaEnabled ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
              {qaEnabled ? "Đóng Q&A" : "Mở Q&A"}
            </button>
          )}

          <button
            onClick={fetchMessages}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Empty */}
      {messages.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
            <MessageCircle size={24} />
          </div>

          <h4 className="text-base font-semibold text-slate-700 mb-1">
            Chưa có tin nhắn nào
          </h4>

          <p className="text-sm text-slate-500">
            Hãy bắt đầu cuộc trò chuyện đầu tiên.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className="group bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {msg.senderAvatar ? (
                  <img
                    src={msg.senderAvatar}
                    alt=""
                    className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-sm"
                  />
                ) : (
                  <div
                    className={`
                    w-10 h-10 rounded-2xl flex items-center justify-center
                    text-sm font-semibold shrink-0 shadow-sm
                    ${index % 3 === 0
                        ? "bg-indigo-100 text-indigo-700"
                        : index % 3 === 1
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }
                  `}
                  >
                    {(msg.senderName || msg.senderId || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Top */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {msg.senderName || msg.senderId}
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        {getRelativeTime(msg.createdAt)}
                      </p>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Live
                    </div>
                  </div>

                  {/* Message */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 group-hover:bg-indigo-50/40 transition-colors">
                    <p className="text-sm leading-7 text-slate-700 whitespace-pre-line">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QATab;
