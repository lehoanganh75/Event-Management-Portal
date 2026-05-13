import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Send,
  MessageCircle,
  User,
  Loader2
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import eventService from '../../services/eventService';
import { toast } from 'react-toastify';

const QAModal = ({ isOpen, onClose, eventId }) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      connectWebSocket();
    } else {
      if (stompClient) {
        stompClient.deactivate();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);

    try {
      const res = await eventService.getQAMessages(eventId);

      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
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
        client.subscribe(
          `/topic/qa/${eventId}`,
          (message) => {
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

              return [...prev, receivedMsg];
            });
          }
        );
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !stompClient) return;

    const messageToSend = newMessage;

    setNewMessage("");

    try {
      const prompt = `
      Kiểm tra nội dung sau có tục tĩu, xúc phạm hay không.
      Nếu có trả lời REJECT.
      Nếu bình thường trả lời APPROVE.
      Nội dung: "${messageToSend}"
      `;

      const aiResponse =
        await eventService.localAi.chat(prompt);

      const result = aiResponse.data.response;

      if (result?.includes("REJECT")) {
        toast.error(
          "Tin nhắn chứa nội dung không phù hợp"
        );

        return;
      }
    } catch (err) {
      console.error(err);
    }

    const msgDto = {
      senderAccountId: user.id,
      senderName:
        user.fullName || user.username,
      senderAvatar: user.avatar,
      content: messageToSend
    };

    stompClient.publish({
      destination: `/app/qa/${eventId}/send`,
      body: JSON.stringify(msgDto)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Hỏi đáp trực tuyến
              </h2>

              <p className="text-xs text-indigo-100">
                {messages.length} tin nhắn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4"
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Loader2
                size={28}
                className="animate-spin mb-3"
              />

              <p className="text-sm">
                Đang tải tin nhắn...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <MessageCircle size={24} />
              </div>

              <p className="text-sm font-medium text-slate-500">
                Chưa có câu hỏi nào
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Hãy bắt đầu cuộc trò chuyện
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine =
                msg.senderAccountId === user.id;

              return (
                <div
                  key={msg.id || idx}
                  className={`flex ${isMine
                    ? "justify-end"
                    : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isMine
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-md"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${isMine
                            ? "bg-white/20"
                            : "bg-slate-100"
                            }`}
                        >
                          <User size={12} />
                        </div>
                      )}

                      <span className="text-xs font-semibold">
                        {msg.senderName}
                      </span>
                    </div>

                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </p>

                    <div
                      className={`text-[11px] mt-2 ${isMine
                        ? "text-indigo-100"
                        : "text-slate-400"
                        }`}
                    >
                      {getRelativeTime(
                        msg.createdAt
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4 bg-white">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) =>
                setNewMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder="Nhập câu hỏi..."
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Send size={18} />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            Nội dung sẽ được kiểm duyệt tự động
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default QAModal;