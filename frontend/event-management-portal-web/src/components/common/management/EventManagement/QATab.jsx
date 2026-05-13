import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import eventService from "../../../../services/eventService";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext";

const QATab = ({ eventId }) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetchMessages();
      connectWebSocket();
    }

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, [eventId]);

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
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const socket = new SockJS(`${apiBaseUrl}/ws/chat`);

    const client = new Client({
      webSocketFactory: () => socket,

      onConnect: () => {
        client.subscribe(`/topic/qa/${eventId}`, (message) => {
          const receivedMsg = JSON.parse(message.body);

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

        <button
          onClick={fetchMessages}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
        >
          Làm mới
        </button>
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