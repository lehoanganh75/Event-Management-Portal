import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Sparkles, ChevronDown, RotateCcw, Star, ThumbsUp,
         Calendar, MapPin, Users, ChevronRight, Zap, BookOpen, HelpCircle,
         ClipboardList, Lightbulb, Search, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import eventService from "../../services/eventService";
import EventCardMini from "./EventCardMini";

// ✨ Icon: IUH logo + Gemini badge
const ChatIcon = ({ size = 48 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <img
      src="https://iuh.edu.vn/assets/images/iuh.png?v=51"
      alt="IUH"
      style={{ width: size, height: size }}
      className="rounded-full object-cover border-2 border-white shadow-md"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
    <div
      className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100"
      style={{ width: size * 0.42, height: size * 0.42 }}
    >
      <GeminiIcon size={size * 0.28} />
    </div>
  </div>
);

// ✨ Gemini icon SVG
const GeminiIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2C14 2 14 10.5 6 14C14 17.5 14 26 14 26C14 26 14 17.5 22 14C14 10.5 14 2 14 2Z"
      fill="url(#gemini_grad)"
    />
    <defs>
      <linearGradient id="gemini_grad" x1="6" y1="2" x2="22" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="100%" stopColor="#9B72CB" />
      </linearGradient>
    </defs>
  </svg>
);

// ✨ Phân tích gợi ý từ tin nhắn
function parseQuickReplies(text) {
  const match = text.match(/\[GỢI Ý:\s*(.+?)\]/);
  if (!match) return [];
  return match[1].split("|").map((s) => s.trim()).filter(Boolean).slice(0, 3);
}

function cleanContent(text) {
  return text.replace(/\[GỢI Ý:.*?\]/g, "").trim();
}

// ✨ Phân tích lỗi API
function parseGeminiError(err) {
  const msg = err?.message || "";
  if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
    const retryMatch = msg.match(/retry in ([\d.]+)s/i);
    const seconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
    return { type: "quota", seconds };
  }
  if (msg.includes("API_KEY") || msg.includes("403") || msg.includes("400") || msg.includes("INVALID")) {
    return { type: "key", seconds: 0 };
  }
  return { type: "network", seconds: 5 };
}

function MessageContent({ text }) {
  const cardMatch = text.match(/\[EVENT_CARDS_START\]([\s\S]*?)\[EVENT_CARDS_END\]/);
  const cleanText = text.replace(/\[EVENT_CARDS_START\][\s\S]*?\[EVENT_CARDS_END\]/, "").trim();
  
  let eventCards = [];
  if (cardMatch) {
    try {
      eventCards = JSON.parse(cardMatch[1]);
    } catch (e) {
      console.error("Failed to parse event cards JSON", e);
    }
  }

  // ✨ Hàm render văn bản có hỗ trợ **bold** và bullet points
  const renderText = (rawText) => {
    return rawText.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />;
      
      // Xử lý Bold: **text** -> <strong>text</strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={idx} className="font-bold text-blue-700">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Xử lý Bullet point: * text -> bullet
      if (line.trim().startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 ml-1 my-0.5">
            <span className="text-blue-500">•</span>
            <span className="flex-1 leading-relaxed">{formattedLine.slice(1)}</span>
          </div>
        );
      }

      return <p key={i} className="leading-relaxed mb-1">{formattedLine}</p>;
    });
  };

  return (
    <div className="space-y-3">
      <div className="text-[13px] md:text-sm">
        {renderText(cleanText)}
      </div>
      
      {eventCards.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-200">
          {eventCards.map((event, idx) => (
            <EventCardMini key={idx} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-2 items-end">
      <div className="shrink-0 mt-1">
        <ChatIcon size={28} />
      </div>
      <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RetryBanner({ seconds, onRetry }) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) { onRetry(); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onRetry]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 mb-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 text-amber-700 text-xs">
        <AlertCircle size={14} />
        <span>Tự động thử lại sau <strong>{count}s</strong></span>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
      >
        <RefreshCw size={12} /> Thử ngay
      </button>
    </motion.div>
  );
}

export default function AIChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [sessionId, setSessionId] = useState(localStorage.getItem("ai_chat_session_id"));
  const [retryInfo, setRetryInfo] = useState(null);
  
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const SUGGESTED = [
    "Có sự kiện nào nổi bật sắp diễn ra không?",
    "Phân tích chi tiết sự kiện gần nhất",
    "So sánh các sự kiện đang mở đăng ký",
    "Hướng dẫn tôi đăng ký sự kiện",
  ];

  useEffect(() => { 
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
      }, 100);
    }
  }, [messages, loading, isOpen]);

  const initChat = useCallback(async () => {
    try {
      const stored = localStorage.getItem("ai_chat_session_id");
      const res = await eventService.createChatSession({
        sessionId: stored,
        contextType: "GENERAL_INQUIRY"
      });
      
      if (res.data?.result) {
        const session = res.data.result;
        setSessionId(session.sessionId);
        localStorage.setItem("ai_chat_session_id", session.sessionId);
        
        if (session.messages?.length > 0) {
          const mapped = session.messages.map(m => ({
            id: m.id,
            role: m.role.toLowerCase(),
            content: m.content,
            quickReplies: m.quickReplies,
            ts: m.createdAt
          }));
          setMessages(mapped);
        } else {
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Xin chào! 👋 Tôi là trợ lý AI của hệ thống sự kiện IUH.\n\nTôi có thể giúp bạn tìm kiếm sự kiện, đăng ký tham gia, hoặc phân tích thông tin sự kiện.\n\nBạn cần hỗ trợ gì?",
            quickReplies: ["Phân tích sự kiện gần nhất", "Cách đăng ký sự kiện", "Tổ chức sự kiện"],
            ts: new Date().toISOString(),
          }]);
        }
      }
    } catch (err) {
      console.error("Init session failed:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !sessionId) initChat();
  }, [isOpen, sessionId, initChat]);

  const handleOpen = () => {
    setIsOpen(true);
    setMinimized(false);
    setUnread(0);
  };

  const send = async (content = input) => {
    const text = content.trim();
    if (!text || loading) return;

    setInput("");
    setRetryInfo(null);
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: text, ts: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await eventService.sendChatMessage({
        sessionId: sessionId,
        content: text,
        messageType: "TEXT"
      });

      if (res.data?.result) {
        const msg = res.data.result;
        
        // ✨ Cập nhật sessionId mới nếu backend vừa tự tạo lại (do reset DB chẳng hạn)
        if (msg.sessionId && msg.sessionId !== sessionId) {
          console.log("Session ID shifted from", sessionId, "to", msg.sessionId);
          setSessionId(msg.sessionId);
          localStorage.setItem("ai_chat_session_id", msg.sessionId);
        }

        setMessages(prev => [...prev, {
          id: msg.id || Date.now() + 1,
          role: "assistant",
          content: msg.content,
          quickReplies: msg.quickReplies,
          ts: msg.createdAt || new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error("Send message failed:", err);
      
      // Handle special 500 session missing case
      if (err.response?.status === 500) {
        setSessionId(null);
        localStorage.removeItem("ai_chat_session_id");
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "Hệ thống AI đang tạm thời gián đoạn. Vui lòng thử lại sau giây lát.",
        ts: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {(!isOpen || minimized) && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl bg-white flex items-center justify-center overflow-hidden"
          >
            <ChatIcon size={56} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChatIcon size={36} />
                <div>
                  <h3 className="font-bold text-sm leading-tight">Trợ lý AI IUH</h3>
                  <div className="flex items-center gap-1.2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-blue-100">Đang hoạt động</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronDown size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                  {msg.role !== "user" && <ChatIcon size={28} />}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}>
                    <MessageContent text={msg.content} />
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {msg.quickReplies.map((qr, i) => (
                          <button key={i} onClick={() => send(qr)} className="bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2.5 py-1 text-[11px] font-medium hover:bg-blue-100 transition-colors">
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && <TypingDots />}
              <div ref={bottomRef} />
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-white">
              {retryInfo && <RetryBanner seconds={retryInfo.seconds} onRetry={() => send(retryInfo.pendingMsg)} />}
              
              {messages.length < 2 && !loading && (
                <div className="mb-3 flex flex-col gap-1.5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1">Gợi ý chủ đề</p>
                  {SUGGESTED.map((q, i) => (
                    <button key={i} onClick={() => send(q)} className="text-left text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-600 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-gray-100 border-none rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
                  rows={1}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
                <Sparkles size={10} /> Powered by Gemini 2.5 Flash
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
