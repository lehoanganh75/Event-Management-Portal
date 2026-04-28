/**
 * AI CHAT WIDGET - REACT COMPONENT EXAMPLE
 * 
 * Tích hợp vào frontend React để sử dụng AI Chat Service
 */

import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp, Client } from '@stomp/stompjs';

// ==================== TYPES ====================

interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  type: 'TEXT' | 'SUGGESTION' | 'EVENT_PLAN_DRAFT';
  content: string;
  createdAt: string;
}

interface ChatSession {
  sessionId: string;
  status: 'ACTIVE' | 'ENDED';
  messages: ChatMessage[];
}

// ==================== COMPONENT ====================

export const AIChatWidget: React.FC = () => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  
  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const socket = new SockJS('http://localhost:8080/ws/chat');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log('WebSocket connected');
      
      // Subscribe to chat session
      client.subscribe(`/topic/chat/${session?.sessionId}`, (message) => {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        setMessages(prev => [...prev, chatMessage]);
        scrollToBottom();
      });
    });

    stompClientRef.current = client;
  };

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
  };

  // ==================== API CALLS ====================

  const createSession = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: 'Guest User',
          contextType: 'GENERAL_INQUIRY'
        }),
      });

      const data = await response.json();
      setSession(data.result);
      setMessages(data.result.messages || []);
      loadQuickReplies(data.result.sessionId);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!session || !content.trim()) return;

    setIsLoading(true);

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'USER',
      type: 'TEXT',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/v1/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          content,
          messageType: 'TEXT',
        }),
      });

      const data = await response.json();
      
      // AI response will come via WebSocket, but also add from REST response
      if (data.result) {
        setMessages(prev => [...prev, data.result]);
      }

      loadQuickReplies(session.sessionId);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuickReplies = async (sessionId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/chat/sessions/${sessionId}/quick-replies`
      );
      const data = await response.json();
      setQuickReplies(data.result || []);
    } catch (error) {
      console.error('Failed to load quick replies:', error);
    }
  };

  const generateEventPlan = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/chat/sessions/${session.sessionId}/generate-plan`,
        { method: 'POST' }
      );

      const data = await response.json();
      
      if (data.result) {
        alert('Kế hoạch sự kiện đã được tạo! Bạn có thể xem chi tiết.');
        console.log('Event Plan:', data.result);
        // TODO: Navigate to event planner with pre-filled data
      }
    } catch (error) {
      console.error('Failed to generate event plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;

    try {
      await fetch(
        `http://localhost:8080/api/v1/chat/sessions/${session.sessionId}/end`,
        { method: 'POST' }
      );
      
      setSession(null);
      setMessages([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  // ==================== UI HELPERS ====================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  // ==================== RENDER ====================

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        💬 Chat với AI
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-bold">Trợ lý AI IUH</h3>
          <p className="text-xs">Hỗ trợ 24/7</p>
        </div>
        <button onClick={handleClose} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'USER'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="px-4 py-2 border-t flex flex-wrap gap-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t flex gap-2">
        <button
          onClick={generateEventPlan}
          disabled={isLoading}
          className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        >
          📝 Tạo kế hoạch
        </button>
        <button
          onClick={endSession}
          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Kết thúc
        </button>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputMessage);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};
