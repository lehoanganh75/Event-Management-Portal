import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import { Clock, Check, MoreVertical, Loader2 } from "lucide-react";
import notificationApi from "../../api/notificationApi";

const NotificationPage = () => {
  const { userId: urlUserId } = useParams();

  const currentUserId =
    urlUserId || localStorage.getItem("userId") || "user-iuh-001";

  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData(currentUserId);
  }, [currentUserId]);

  const fetchData = () => {
    notificationApi
      .getNotificationsByUser("user-iuh-001")
      .then((res) => {
        console.log("Dữ liệu nhận được:", res.data);
        setNotifications(res.data);
      })
      .catch((err) => console.error("Lỗi:", err))
      .finally(() => setIsLoading(false));
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;

    if (diffInMs < 0) {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${diffInDays} ngày trước`;
  };
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return n.read === false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-100 flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans antialiased text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Thông báo
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Đang xem dữ liệu của:{" "}
            <span className="font-bold text-blue-600">{currentUserId}</span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">
          <Check size={14} /> Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* Điều hướng Tab */}
      <div className="flex gap-6 border-b border-slate-100 mb-2">
        {["all", "unread"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === t
                ? "text-blue-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t === "all" ? "Tất cả" : "Chưa đọc"}
            {activeTab === t && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Danh sách thông báo */}
      <div className="divide-y divide-slate-50">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkAsRead(n.id)}
              className="group flex items-start gap-4 py-6 hover:bg-slate-50/50 transition-all rounded-xl px-4 -mx-4 cursor-pointer"
            >
              <div className="mt-1.5 shrink-0">
                {n.read === false ? ( 
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                ) : (
                  <div className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className={`text-sm ${!n.read ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}
                    >
                      {n.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase">
                      {n.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                      <Clock size={12} /> {formatTime(n.createdAt)}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-900 transition-all">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 text-sm">
            Không có thông báo nào cho {currentUserId}.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
