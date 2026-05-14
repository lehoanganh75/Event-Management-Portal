import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import eventService from '../../services/eventService';

// ==================== COMPONENT ====================

export const AIChatWidget = () => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ==================== WEBSOCKET SETUP ====================

  useEffect(() => {
    if (session && isOpen) {
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [session, isOpen]);

  const connectWebSocket = () => {
    // Sử dụng VITE_API_BASE_URL từ môi trường hoặc mặc định localhost:8000
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const socket = new SockJS(`${baseURL}/ws`);
    const client = Stomp.over(socket);

    // Tắt log debug của Stomp nếu cần
    client.debug = () => { };

    client.connect({}, () => {
      console.log('WebSocket connected to chat topic');

      // Subscribe vào đúng session của AI
      client.subscribe(`/topic/chat/${session?.sessionId}`, (message) => {
        const chatMessage = JSON.parse(message.body);
        setMessages(prev => {
          // Tránh duplicate tin nhắn nếu đã có trong UI
          if (prev.find(m => m.id === chatMessage.id)) return prev;
          return [...prev, chatMessage];
        });
        scrollToBottom();
      });
    });

    stompClientRef.current = client;
  };

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.disconnect();
    }
  };

  // ==================== API CALLS ====================

  const createSession = async () => {
    try {
      const response = await eventService.chat.createSession({
        guestName: 'Người dùng',
        contextType: 'GENERAL_INQUIRY'
      });

      const data = response.data;
      if (data.result) {
        setSession(data.result);
        setMessages(data.result.messages || []);
        loadQuickReplies(data.result.sessionId);
      }
    } catch (error) {
      console.error('Không thể tạo phiên chat:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!session || !content.trim()) return;

    setIsLoading(true);

    // Thêm tin nhắn của user vào UI ngay lập tức
    const userMessage = {
      id: Date.now().toString(),
      role: 'USER',
      type: 'TEXT',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    scrollToBottom();

    try {
      const response = await eventService.chat.sendMessage({
        sessionId: session.sessionId,
        content,
        messageType: 'TEXT',
      });

      // Response từ AI sẽ chủ yếu về qua WebSocket, 
      // nhưng nếu REST response trả về trực tiếp thì ta cập nhật luôn
      if (response.data?.result) {
        setMessages(prev => {
          if (prev.find(m => m.id === response.data.result.id)) return prev;
          return [...prev, response.data.result];
        });
      }

      loadQuickReplies(session.sessionId);
    } catch (error) {
      console.error('Gửi tin nhắn thất bại:', error);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const loadQuickReplies = async (sessionId) => {
    try {
      // Chúng ta cần thêm method này vào eventService nếu chưa có, 
      // tạm thời sử dụng axios trực tiếp qua baseApi nếu cần
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseURL}/api/v1/chat/sessions/${sessionId}/quick-replies`);
      const data = await response.json();
      setQuickReplies(data.result || []);
    } catch (error) {
      console.error('Không thể tải gợi ý:', error);
    }
  };

  const generateEventPlan = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseURL}/api/v1/chat/sessions/${session.sessionId}/generate-plan`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.result) {
        alert('Kế hoạch dự thảo đã sẵn sàng!');
      }
    } catch (error) {
      console.error('Lỗi tạo kế hoạch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      await fetch(`${baseURL}/api/v1/chat/sessions/${session.sessionId}/end`, {
        method: 'POST'
      });
      setSession(null);
      setMessages([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Lỗi kết thúc phiên:', error);
    }
  };

  // ==================== UI HELPERS ====================

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!session) {
      createSession();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  // ==================== RENDER ====================

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2"
      >
        <span className="text-xl">✨</span> Chat với AI
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
          <div>
            <h3 className="font-bold text-lg">Trợ lý IUH</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <p className="text-[10px] uppercase tracking-wider font-medium opacity-80">AI Online</p>
            </div>
          </div>
        </div>
        <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${msg.role === 'USER'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <div className={`text-[10px] mt-1.5 opacity-60 ${msg.role === 'USER' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Area */}
      <div className="bg-white border-t border-gray-100 p-4">
        {/* Quick Replies */}
        {quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors border border-indigo-100"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={generateEventPlan}
            disabled={isLoading}
            className="flex-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            📝 LẬP KẾ HOẠCH
          </button>
          <button
            onClick={endSession}
            className="text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-lg transition-colors"
          >
            DỪNG
          </button>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputMessage);
          }}
          className="relative"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Bạn muốn hỏi gì..."
            className="w-full border-gray-200 border rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};
