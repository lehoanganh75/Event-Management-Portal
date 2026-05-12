import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import eventService from '../../../../services/eventService';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../context/AuthContext';

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

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải tin nhắn...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Trao đổi trực tuyến (Live Chat)</h3>
          <p className="text-sm text-gray-500 mt-1">
            {messages.length} tin nhắn
          </p>
        </div>
        <button 
          onClick={fetchMessages}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
        >
          Làm mới
        </button>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <MessageCircle size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Chưa có tin nhắn nào từ người tham dự.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="p-5 rounded-xl border transition-all bg-white border-blue-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">{msg.senderName || msg.senderId}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500">{getRelativeTime(msg.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-base text-gray-800">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QATab;

