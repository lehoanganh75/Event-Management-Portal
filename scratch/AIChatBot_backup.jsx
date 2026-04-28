import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Sparkles, ChevronDown, RotateCcw, Star, ThumbsUp,
         Calendar, MapPin, Users, ChevronRight, Zap, BookOpen, HelpCircle,
         ClipboardList, Lightbulb, Search, âœ¨lertCircle, RefreshCw } from "lucide-react";
import { motion, âœ¨nimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const âœ¨PI_Bâœ¨SE   = import.meta.env.VITE_âœ¨PI_Bâœ¨SE_URL || "http://localhost:8082";

// â”€â”€ Icon: IUH logo + Gemini badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ChatIcon = ({ size = 48 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    {/* IUH logo trÃ²n */}
    <img
      src="https://iuh.edu.vn/assets/images/iuh.png?v=51"
      alt="IUH"
      style={{ width: size, height: size }}
      className="rounded-full object-cover border-2 border-white shadow-md"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
    {/* Gemini badge gÃ³c dÆ°á»›i pháº£i */}
    <div
      className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100"
      style={{ width: size * 0.42, height: size * 0.42 }}
    >
      <GeminiIcon size={size * 0.28} />
    </div>
  </div>
);

// â”€â”€ Gemini icon SVG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GeminiIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2C14 2 14 10.5 6 14C14 17.5 14 26 14 26C14 26 14 17.5 22 14C14 10.5 14 2 14 2Z"
      fill="url(#gemini_grad)"
    />
    <defs>
      <linearGradient id="gemini_grad" x1="6" y1="2" x2="22" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4285F4" />\n        <stop offset="100%" stopColor="#9B72CB" />\n      </linearGradient>\n    </defs>\n  </svg>\n);\n\n// âœ¨âœ¨ PhÃ¢n tÃ­ch Quick Replies âœ¨âœ¨\nfunction parseQuickReplies(text) {\n  const match = text.match(/\\[Gá»¢I Ã:\\s*(.+?)\\]/);\n  if (!match) return [];\n  return match[1].split("|").map((s) => s.trim()).filter(Boolean).slice(0, 3);\n}\n\nfunction cleanContent(text) {\n  return text.replace(/\\[Gá»¢I Ã:.*?\\]/g, "").trim();\n}\n\n// âœ¨âœ¨ PhÃ¢n tÃ­ch lá»—i Gemini âœ¨âœ¨\nfunction parseGeminiError(err) {
  const msg = err?.message || "";
  if (msg.includes("quota") || msg.includes("RESOURCE_EXHâœ¨USTED") || msg.includes("429")) {
    const retryMatch = msg.match(/retry in ([\d.]+)s/i);
    const seconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
    return { type: "quota", seconds };
  }
  if (msg.includes("âœ¨PI_KEY") || msg.includes("403") || msg.includes("400") || msg.includes("INVâœ¨LID")) {
    return { type: "key", seconds: 0 };
  }
  return { type: "network", seconds: 5 };
}

// â”€â”€ MessageContent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MessageContent({ text }) {
  return (
    <div className="space-y-0.5">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i} className="leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

// â”€â”€ Typing indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Retry countdown banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RetryBanner({ seconds, onRetry, pendingMsg }) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) { onRetry(); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 mb-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 text-amber-700 text-xs">
        <âœ¨lertCircle size={14} />
        <span>Tá»± Ä‘á»™ng thá»­ láº¡i sau <strong>{count}s</strong></span>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
      >
        <RefreshCw size={12} /> Thá»­ ngay
      </button>
    </motion.div>
  );
}



// â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function âœ¨IChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [sessionId, setSessionId] = useState(localStorage.getItem("ai_chat_session_id"));
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);


  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (isOpen && !minimized) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen, minimized]);
  useEffect(() => {
    if (!isOpen || minimized) {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant") setUnread((n) => n + 1);
    }
  }, [messages]);

  const initChat = useCallback(async () => {
    try {
      const stored = localStorage.getItem("ai_chat_session_id");
      const res = await axios.post(`${âœ¨PI_Bâœ¨SE}/api/v1/chat/sessions`, {
        sessionId: stored,
        contextType: "GENERâœ¨L_INQUIRY"
      });
      
      if (res.data?.result) {
        const session = res.data.result;
        setSessionId(session.sessionId);
        localStorage.setItem("ai_chat_session_id", session.sessionId);
        
        // If resuming, show previous messages
        if (session.messages?.length > 0) {
          const mapped = session.messages.map(m => ({
            id: m.id,
            role: m.role.toLowerCase(),
            content: m.content,
            quickReplies: m.quickReplies,
            ts: m.createdâœ¨t
          }));
          setMessages(mapped);
        } else {
          setMessages([{
            id: "welcome", role: "assistant",
            content: "Xin chÃ o! ðŸ‘‹ TÃ´i lÃ  trá»£ lÃ½ âœ¨I cá»§a há»‡ thá»‘ng sá»± kiá»‡n IUH.\n\nTÃ´i cÃ³ thá»ƒ giÃºp báº¡n tÃ¬m kiáº¿m sá»± kiá»‡n, Ä‘Äƒng kÃ½ tham gia, hoáº·c láº­p káº¿ hoáº¡ch tá»• chá»©c sá»± kiá»‡n.\n\nBáº¡n cáº§n há»— trá»£ gÃ¬?",
            quickReplies: ["Sá»± kiá»‡n Ä‘ang diá»…n ra", "CÃ¡ch Ä‘Äƒng kÃ½", "Tá»• chá»©c sá»± kiá»‡n"],
            ts: new Date().toISOString(),
          }]);
        }
      }
    } catch (err) {
      console.error("Init session failed:", err);
      // Fallback message
      setMessages([{
        id: "error", role: "assistant",
        content: "Há»‡ thá»‘ng âœ¨I Ä‘ang táº¡m thá»i giÃ¡n Ä‘oáº¡n. Vui lÃ²ng thá»­ láº¡i sau.",
        ts: new Date().toISOString(),
      }]);
    }
    setRetryInfo(null);
  }, []);

  const handleOpen = () => {
    setIsOpen(true); setMinimized(false); setUnread(0);
    if (messages.length === 0) initChat();
  };



  const send = useCallback(async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    // Ensure session exists
    let currentSessionId = sessionId;
    if (!currentSessionId) {
       // Silent session creation if needed
       try {
         const res = await axios.post(`${âœ¨PI_Bâœ¨SE}/api/v1/chat/sessions`, { contextType: "GENERâœ¨L_INQUIRY" });
         currentSessionId = res.data.result.sessionId;
         setSessionId(currentSessionId);
         localStorage.setItem("ai_chat_session_id", currentSessionId);
       } catch (err) {
         setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: "Lá»—i káº¿t ná»‘i Server. Vui lÃ²ng thá»­ láº¡i.", ts: new Date().toISOString(), isError: true }]);
         return;
       }
    }

    setInput("");
    setRetryInfo(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content, ts: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await axios.post(`${âœ¨PI_Bâœ¨SE}/api/v1/chat/messages`, {
        sessionId: currentSessionId,
        content: content,
        messageType: "TEXT"
      });

      if (res.data?.result) {
        const msg = res.data.result;
        setMessages((prev) => [...prev, {
          id: msg.id || Date.now() + 1,
          role: "assistant",
          content: msg.content,
          quickReplies: msg.quickReplies,
          ts: msg.createdâœ¨t || new Date().toISOString(),
        }]);
      } else {
         throw new Error("No data from server");
      }
    } catch (err) {
      console.error("Backend âœ¨I error:", err);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, role: "assistant",
        content: "ðŸŒ Há»‡ thá»‘ng Ä‘ang báº­n hoáº·c cÃ³ lá»—i káº¿t ná»‘i. Vui lÃ²ng thá»­ láº¡i sau.",
        ts: new Date().toISOString(), isError: true,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, sessionId]);

  const handleRetry = () => {
    if (retryInfo?.pendingMsg) {
      setRetryInfo(null);
      // Remove last error message before retry
      setMessages((prev) => prev.filter((m) => !m.isError));
      send(retryInfo.pendingMsg);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const time = (ts) => new Date(ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <>
      {/* Floating button */}
      <âœ¨nimatePresence>
        {(!isOpen || minimized) && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl overflow-hidden"
            title="Chat vá»›i âœ¨I IUH"
          >
            <ChatIcon size={56} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </motion.button>
        )}
      </âœ¨nimatePresence>

      {/* Chat window */}
      <âœ¨nimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 50, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.94 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[390px] flex flex-col rounded-3xl shadow-2xl border border-gray-200 bg-white overflow-hidden"
            style={{ height: minimized ? "auto" : "570px" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 select-none cursor-pointer"
              style={{ background: "linear-gradient(135deg, #1a479a 0%, #2563eb 100%)" }}
              onClick={() => setMinimized((v) => !v)}
            >
              <div className="flex items-center gap-2.5">
                {/* Icon trong header */}
                <div className="shrink-0">
                  <ChatIcon size={38} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">âœ¨I Trá»£ LÃ½ IUH</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-blue-100 text-[11px]">Gemini 2.0 Flash âœ¨ Â· Miá»…n phÃ­</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { localStorage.removeItem("ai_chat_session_id"); setSessionId(null); initChat(); }} title="Cuá»™c trÃ² chuyá»‡n má»›i" className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors">

                  <RotateCcw size={13} />
                </button>
                <button onClick={() => setMinimized((v) => !v)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <ChevronDown size={15} className={`transition-transform duration-200 ${minimized ? "rotate-180" : ""}`} />
                </button>
                <button onClick={handleClose} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 relative">


                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {!isUser && (
                          <div className="shrink-0 mt-1">
                            <ChatIcon size={28} />
                          </div>
                        )}
                        <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                            isUser
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : msg.isError
                              ? "bg-amber-50 text-amber-800 border border-amber-200 rounded-tl-sm"
                              : msg.isOffline
                              ? "bg-gray-50 text-gray-700 border border-gray-200 rounded-tl-sm"
                              : "bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100"
                          }`}>
                            <MessageContent text={msg.content} />
                          </div>
                          <span className="text-[10px] text-gray-400 px-1">{time(msg.ts)}</span>
                          {!isUser && !msg.isError && msg.quickReplies?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {msg.quickReplies.map((r, i) => (
                                <button key={i} onClick={() => send(r)}
                                  className="px-3 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors">
                                  {r}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {loading && <TypingDots />}
                  <div ref={bottomRef} />
                </div>

                {/* Retry banner */}
                {retryInfo && !loading && (
                  <RetryBanner seconds={retryInfo.seconds} onRetry={handleRetry} pendingMsg={retryInfo.pendingMsg} />
                )}

                {/* Suggested questions */}
                {messages.filter((m) => m.role === "user").length === 0 && !loading && (
                  <div className="px-3 pb-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 mb-1.5 font-semibold uppercase tracking-wide pt-2">Gá»£i Ã½ cÃ¢u há»i</p>
                    <div className="flex flex-col gap-1">
                      {SUGGESTED.map((q, i) => (
                        <button key={i} onClick={() => send(q)}
                          className="text-left text-xs text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="px-3 py-2.5 bg-white border-t border-gray-100">
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
                      rows={1}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 88) + "px";
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      placeholder="Nháº­p cÃ¢u há»i... (Enter gá»­i)"
                      disabled={loading}
                      className="flex-1 resize-none px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 overflow-y-auto"
                      style={{ lineHeight: "1.5", maxHeight: "88px" }}
                    />
                    <button
                      onClick={() => send()}
                      disabled={!input.trim() || loading}
                      className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 text-center flex items-center justify-center gap-1">
                    <Sparkles size={9} />
                    Gemini 2.0 Flash âœ¨ Â· IUH Event System
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </âœ¨nimatePresence>
    </>
  );
}

