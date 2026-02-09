import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, CheckCircle2, AlertCircle, Clock, 
  Search, Check, Trash2, Filter, MoreHorizontal 
} from "lucide-react";

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // Giả lập loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const notifications = [
    { id: 1, type: 'success', unread: true, title: "Phê duyệt sự kiện", content: "Sự kiện 'Hội thảo AI' của bạn đã được quản trị viên phê duyệt.", time: "10 phút trước" },
    { id: 2, type: 'alert', unread: true, title: "Nhắc nhở điểm danh", content: "Bạn có một sự kiện đang diễn ra nhưng chưa kích hoạt mã QR điểm danh.", time: "1 giờ trước" },
    { id: 3, type: 'info', unread: false, title: "Cập nhật hệ thống", content: "Hệ thống quản lý sẽ bảo trì vào lúc 23:00 tối nay.", time: "5 giờ trước" },
    { id: 4, type: 'info', unread: false, title: "Báo cáo tuần", content: "Báo cáo tổng kết tuần 05 đã sẵn sàng để tải về trong mục Quản lý sự kiện.", time: "1 ngày trước" },
  ];

  const filteredNotifications = activeTab === "unread" 
    ? notifications.filter(n => n.unread) 
    : notifications;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Thông báo</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Bạn có <span className="text-blue-600 font-bold">{notifications.filter(n => n.unread).length} thông báo mới</span> chưa đọc
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Check size={14} /> Đánh dấu tất cả đã đọc
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* TABS & FILTER AREA */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex gap-8">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'unread', label: 'Chưa đọc' },
            { id: 'system', label: 'Hệ thống' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-slate-400">
          <Filter size={16} />
          <span className="text-xs font-bold">Lọc theo ngày</span>
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            // SKELETON LOADING UI
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-4xlborder border-slate-100 flex gap-5 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-100 rounded-full w-1/4" />
                  <div className="h-3 bg-slate-50 rounded-full w-3/4" />
                </div>
              </div>
            ))
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <motion.div 
                key={n.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative bg-white p-6 rounded-4xlborder transition-all cursor-pointer flex gap-5 hover:shadow-xl hover:shadow-slate-200/50 ${
                  n.unread ? "border-blue-100 shadow-sm" : "border-slate-100 opacity-80"
                }`}
              >
                {/* Unread Indicator */}
                {n.unread && (
                  <div className="absolute top-8 right-8 w-2 h-2 bg-blue-600 rounded-full" />
                )}

                {/* Icon Box */}
                <div className={`mt-1 p-3 rounded-2xl h-fit transition-transform group-hover:scale-110 duration-300 ${
                  n.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 
                  n.type === 'alert' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                }`}>
                  {n.type === 'success' ? <CheckCircle2 size={24}/> : n.type === 'alert' ? <AlertCircle size={24}/> : <Bell size={24}/>}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-extrabold transition-colors group-hover:text-blue-600 ${
                      n.unread ? "text-slate-800" : "text-slate-600"
                    }`}>
                      {n.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                      <Clock size={12}/> {n.time}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{n.content}</p>
                  
                  <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Xem chi tiết</button>
                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Xóa thông báo</button>
                  </div>
                </div>

                {/* Action Hover Button */}
                <button className="absolute bottom-6 right-6 p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </motion.div>
            ))
          ) : (
            // EMPTY STATE
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell size={32} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-400">Không có thông báo nào</h3>
              <p className="text-slate-300 text-sm">Mọi thông báo quan trọng sẽ hiển thị ở đây</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationPage;