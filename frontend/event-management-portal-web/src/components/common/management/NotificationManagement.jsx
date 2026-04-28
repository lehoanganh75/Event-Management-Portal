import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bell, Search, Filter, MoreVertical, Check, Trash2, Eye, Clock, RefreshCw,
  Inbox, ChevronRight, ChevronLeft, AlertCircle, CheckCircle, XCircle, Info,
  Calendar, User, Mail, Send, X, Loader2, PlayCircle, CheckCircle2, Megaphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const NotificationManagement = ({
  notifications,
  loading,
  refreshing,
  onRefresh,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onBulkDelete,
  onSendNotification,
  isAdmin = false,
  userEvents = [],
  title = "QUẢN LÝ THÔNG BÁO",
  subtitle = "Gửi và điều phối thông báo hệ thống"
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [page, setPage] = useState(1);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const perPage = 8;

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    targetUsers: "all",
    userIds: "",
    eventId: "", // For lecturer
    actionUrl: ""
  });

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterType, activeTab]);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    read: notifications.filter(n => n.read).length,
    system: notifications.filter(n => n.type === 'SYSTEM').length,
  }), [notifications]);

  const filteredNotifications = useMemo(() => {
    return localNotifications.filter(n => {
      const matchesSearch = !searchTerm || 
                            n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            n.message?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === "Chưa đọc") matchesTab = !n.read;
      if (activeTab === "Đã đọc") matchesTab = n.read;
      if (activeTab === "Hệ thống") matchesTab = n.type === "SYSTEM";

      const matchesType = filterType === "all" || n.type === filterType;
      
      return matchesSearch && matchesTab && matchesType;
    });
  }, [localNotifications, searchTerm, activeTab, filterType]);

  const totalPages = Math.ceil(filteredNotifications.length / perPage);
  const currentItems = filteredNotifications.slice((page - 1) * perPage, page * perPage);

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;
    setIsSending(true);
    try {
      await onSendNotification(formData);
      setIsSendModalOpen(false);
      setFormData({ title: "", message: "", type: "SYSTEM", targetUsers: "all", userIds: "", eventId: "", actionUrl: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const formatType = (type) => {
    switch (type) {
      case "SYSTEM": return "Hệ thống";
      case "EVENT_APPROVED": return "Duyệt sự kiện";
      case "EVENT_REJECTED": return "Từ chối sự kiện";
      case "EVENT_UPDATED": return "Cập nhật sự kiện";
      case "REGISTRATION_CONFIRMED": return "Xác nhận đăng ký";
      case "CHECKIN_REMINDER": return "Nhắc nhở";
      case "INVITATION": return "Lời mời tham gia";
      case "QUESTION_CREATED": return "Câu hỏi mới";
      case "POLL_CREATED": return "Khảo sát mới";
      default: return type;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-left">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 transform -rotate-3 transition-all">
            <Bell size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
        </div>

        {onSendNotification && (
          <button
            onClick={() => setIsSendModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <Send size={18} />
            {isAdmin ? "GỬI THÔNG BÁO MỚI" : "GỬI THÔNG BÁO SỰ KIỆN"}
          </button>
        )}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Inbox size={28} />
            <div>
              <p className="text-sm opacity-90">Tổng thông báo</p>
              <p className="text-3xl font-semibold mt-1">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-500 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Eye size={28} />
            <div>
              <p className="text-sm opacity-90">Chưa đọc</p>
              <p className="text-3xl font-semibold mt-1">{stats.unread}</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} />
            <div>
              <p className="text-sm opacity-90">Đã đọc</p>
              <p className="text-3xl font-semibold mt-1">{stats.read}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Mail size={28} />
            <div>
              <p className="text-sm opacity-90">{isAdmin ? "Hệ thống" : "Sự kiện tham gia"}</p>
              <p className="text-3xl font-semibold mt-1">{isAdmin ? stats.system : userEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto pb-1 gap-2">
        {[
          { id: "Tất cả", label: "Tất cả", icon: Bell, count: stats.total },
          { id: "Chưa đọc", label: "Chưa đọc", icon: AlertCircle, count: stats.unread },
          { id: "Đã đọc", label: "Đã đọc", icon: CheckCircle2, count: stats.read },
          ...(isAdmin ? [{ id: "Hệ thống", label: "Hệ thống", icon: Info, count: stats.system }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            className="pl-11 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
            placeholder="Tìm kiếm nội dung thông báo..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 min-w-[180px]"
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
        >
          <option value="all">Tất cả loại</option>
          <option value="SYSTEM">Hệ thống</option>
          <option value="INVITATION">Lời mời</option>
          <option value="EVENT_UPDATED">Cập nhật sự kiện</option>
          <option value="EVENT_APPROVED">Sự kiện duyệt</option>
          <option value="EVENT_REJECTED">Sự kiện từ chối</option>
          <option value="REGISTRATION_CONFIRMED">Xác nhận đăng ký</option>
          <option value="CHECKIN_REMINDER">Nhắc nhở</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => onRefresh(true)}
            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Làm mới"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={onMarkAllAsRead}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-all"
          >
            Đọc tất cả
          </button>
          {onBulkDelete && (
            <button
              onClick={() => {
                const selectedIds = localNotifications.filter(n => n.selected).map(n => n.id);
                onBulkDelete(selectedIds);
              }}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all"
            >
              Xóa chọn
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  checked={currentItems.length > 0 && currentItems.every(n => n.selected)}
                  onChange={(e) => {
                    const currentIds = currentItems.map(n => n.id);
                    setLocalNotifications(prev => prev.map(n => 
                      currentIds.includes(n.id) ? { ...n, selected: e.target.checked } : n
                    ));
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="p-4 text-left font-medium text-gray-600">Thông báo</th>
              <th className="p-4 text-left font-medium text-gray-600">Loại</th>
              <th className="p-4 text-left font-medium text-gray-600">Thời gian</th>
              <th className="p-4 text-center font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.length > 0 ? (
              currentItems.map((n) => (
                <tr key={n.id} className={`hover:bg-slate-50 transition-colors ${!n.read ? "bg-blue-50/30" : ""}`}>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={n.selected || false}
                      onChange={(e) => {
                        setLocalNotifications(prev => prev.map(item => 
                          item.id === n.id ? { ...item, selected: e.target.checked } : item
                        ));
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <div className={`mt-1 shrink-0 ${!n.read ? 'text-blue-600' : 'text-gray-400'}`}>
                        {n.type === 'SYSTEM' ? <Info size={18} /> : <Bell size={18} />}
                      </div>
                      <div className="cursor-pointer" onClick={() => onMarkAsRead(n.id)}>
                        <p className={`font-medium ${!n.read ? "text-slate-900" : "text-gray-500"}`}>{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.message}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {formatType(n.type)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{new Date(n.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="text-[10px] opacity-70">{new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-1">
                      {!n.read && (
                        <button
                          onClick={() => onMarkAsRead(n.id)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                          title="Đã đọc"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(n.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-500">Không có thông báo nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            disabled={page === 1}
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${page === num
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            disabled={page === totalPages}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* SEND MODAL */}
      <AnimatePresence>
        {isSendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSendModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Send size={18} /> Gửi thông báo
                </h2>
                <button onClick={() => setIsSendModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendSubmit} className="p-6 space-y-4">
                {isAdmin ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tiêu đề *</label>
                        <input
                          type="text" value={formData.title} required
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="Tiêu đề..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Loại</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                        >
                          <option value="SYSTEM">Hệ thống</option>
                          <option value="PROMOTION">Khuyến mãi</option>
                          <option value="CHECKIN_REMINDER">Nhắc nhở</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nội dung *</label>
                      <textarea
                        value={formData.message} required rows={3}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                        placeholder="Nhập nội dung..."
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Đối tượng</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={formData.targetUsers === "all"} onChange={() => setFormData({...formData, targetUsers: "all"})} />
                          <span className="text-sm text-gray-600">Tất cả</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={formData.targetUsers === "specific"} onChange={() => setFormData({...formData, targetUsers: "specific"})} />
                          <span className="text-sm text-gray-600">Cụ thể</span>
                        </label>
                      </div>
                      {formData.targetUsers === "specific" && (
                        <input
                          type="text" value={formData.userIds}
                          onChange={(e) => setFormData({ ...formData, userIds: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                          placeholder="Nhập User IDs (cách nhau bởi dấu phẩy)..."
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Chọn sự kiện nhận tin *</label>
                      <select
                        value={formData.eventId} required
                        onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="">Chọn một sự kiện bạn tham gia...</option>
                        {userEvents.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tiêu đề *</label>
                        <input
                          type="text" value={formData.title} required
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="Tiêu đề..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Loại</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                        >
                          <option value="EVENT_UPDATED">Cập nhật sự kiện</option>
                          <option value="GENERAL">Thông báo chung</option>
                          <option value="CHECKIN_REMINDER">Nhắc nhở điểm danh</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nội dung *</label>
                      <textarea
                        value={formData.message} required rows={3}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                        placeholder="Nhập nội dung..."
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsSendModalOpen(false)} className="flex-1 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all border border-gray-200">
                    Hủy bỏ
                  </button>
                  <button type="submit" disabled={isSending} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">
                    {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} GỬI NGAY
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationManagement;
