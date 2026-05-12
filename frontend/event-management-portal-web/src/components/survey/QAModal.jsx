import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, User, CheckCircle2, ThumbsUp, Loader2, Sparkles } from 'lucide-react';
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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await eventService.getQAMessages(eventId);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching Q&A messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const socket = new SockJS('http://localhost:8000/ws/chat');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/qa/${eventId}`, (message) => {
          const receivedMsg = JSON.parse(message.body);
          setMessages((prev) => {
            const index = prev.findIndex(m => m.id === receivedMsg.id);
            if (index !== -1) {
              const newList = [...prev];
              newList[index] = receivedMsg;
              return newList;
            }
            return [receivedMsg, ...prev];
          });
        });
      },
    });
    client.activate();
    setStompClient(client);
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "vừa xong";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    return past.toLocaleDateString();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !stompClient) return;

    const messageToSend = newMessage;
    setNewMessage(""); // Clear input immediately for better UX
    
    // AI Moderation check
    try {
      toast.info("AI đang kiểm tra nội dung...");
      const prompt = `Bạn là một trợ lý kiểm duyệt nội dung. Hãy kiểm tra xem tin nhắn sau đây có chứa ngôn từ khiếm nhã, thô tục, chửi thề hay xúc phạm không. Nếu có, hãy trả lời chính xác một từ "REJECT". Nếu tin nhắn bình thường và lịch sự, hãy trả lời chính xác một từ "APPROVE". Tin nhắn: "${messageToSend}"`;
      
      const aiResponse = await eventService.localAi.chat(prompt);
      const result = aiResponse.data.response;
      
      if (result && result.includes("REJECT")) {
        toast.error("Tin nhắn của bạn chứa ngôn từ không phù hợp và đã bị AI chặn.");
        return;
      }
    } catch (err) {
      console.error("AI Moderation failed:", err);
      // If AI is offline, we let it pass or block? Let's let it pass if AI is down.
    }

    const msgDto = {
      senderAccountId: user.id,
      senderName: user.fullName || user.username,
      senderAvatar: user.avatar,
      content: messageToSend,
    };

    stompClient.publish({
      destination: `/app/qa/${eventId}/send`,
      body: JSON.stringify(msgDto),
    });
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
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-slate-50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-white"
      >
        {/* Header */}
        <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hỏi đáp trực tiếp</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time Q&A Active</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Message Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-sm font-bold text-slate-400">Đang kết nối...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2.5rem] flex items-center justify-center mb-6">
                <Sparkles size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Chưa có câu hỏi nào</h3>
              <p className="text-sm text-slate-400 mt-2 font-medium">Hãy là người đầu tiên đặt câu hỏi cho ban tổ chức!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col gap-3 ${msg.senderAccountId === user.id ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm border ${
                  msg.senderAccountId === user.id 
                    ? 'bg-amber-500 text-white border-amber-400 rounded-tr-none' 
                    : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {msg.senderAvatar ? (
                      <img src={msg.senderAvatar} className="w-5 h-5 rounded-full border border-white/20" alt="" />
                    ) : (
                      <User size={12} className="opacity-60" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{msg.senderName}</span>
                  </div>
                  <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                  
                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-white/10">
                    <span className="text-[9px] font-medium opacity-60">
                      {getRelativeTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-3xl border border-slate-100 focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-50 transition-all">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Nhập tin nhắn của bạn tại đây..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center hover:bg-amber-600 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-amber-100"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[9px] text-slate-400 text-center mt-3 font-medium uppercase tracking-widest italic">Tin nhắn sẽ được AI tự động kiểm duyệt trước khi gửi</p>
        </div>
      </motion.div>
    </div>
  );
};

export default QAModal;
