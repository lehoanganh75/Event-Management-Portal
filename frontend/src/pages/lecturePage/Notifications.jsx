import React, { useState } from "react";
import { Bell, CheckCircle2, AlertCircle, Clock, Check, Trash2, MoreVertical } from "lucide-react";

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const notifications = [
    { id: 1, type: 'success', unread: true, title: "Phê duyệt sự kiện", content: "Sự kiện 'Hội thảo AI' đã được phê duyệt thành công.", time: "10 phút trước" },
    { id: 2, type: 'alert', unread: true, title: "Nhắc nhở điểm danh", content: "Sự kiện đang diễn ra yêu cầu kích hoạt mã QR.", time: "1 giờ trước" },
    { id: 3, type: 'info', unread: false, title: "Cập nhật hệ thống", content: "Bảo trì định kỳ vào 23:00 tối nay.", time: "5 giờ trước" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans antialiased text-slate-900">
      {/* Header: Đẳng cấp và thoáng */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Thông báo</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý các hoạt động và cập nhật hệ thống.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">
          <Check size={14} /> Đánh dấu đã đọc
        </button>
      </div>

      {/* Điều hướng Tab đơn giản */}
      <div className="flex gap-6 border-b border-slate-100 mb-2">
        {['all', 'unread'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === t ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t === 'all' ? 'Tất cả' : 'Chưa đọc'}
            {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      {/* Danh sách thông báo: Sạch và thoáng */}
      <div className="divide-y divide-slate-50">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className="group flex items-start gap-4 py-6 hover:bg-slate-50/50 transition-all rounded-xl px-4 -mx-4"
          >
            {/* Dot trạng thái tinh tế */}
            <div className="mt-1.5 flex-shrink-0">
              {n.unread ? (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              ) : (
                <div className="w-2 h-2 bg-slate-200 rounded-full" />
              )}
            </div>

            {/* Nội dung */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-sm ${n.unread ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}>
                    {n.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {n.content}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} /> {n.time}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-900 transition-all">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Load more */}
      <div className="mt-8 pt-8 border-t border-slate-50 text-center">
        <button className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
          Xem thông báo cũ hơn
        </button>
      </div>
    </div>
  );
};

export default NotificationPage;