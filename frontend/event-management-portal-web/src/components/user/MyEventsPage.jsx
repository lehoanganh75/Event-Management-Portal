import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Users, CheckCircle2, QrCode,
  Loader2, Search, X, ChevronLeft, ChevronRight,
  CalendarX, ArrowLeft, Ticket, Bell, Settings
} from "lucide-react";
import Header from "../common/Header";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";

// IMPORT CONTEXT
import { useAuth } from "../../context/AuthContext";
import { useEvent } from "../../context/EventContext";

const STATUS_MAP = {
  PUBLISHED: { label: "Đã công bố", color: "bg-blue-100 text-blue-700 border-blue-200" },
  APPROVED: { label: "Đã duyệt", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  DRAFT: { label: "Bản nháp", color: "bg-slate-100 text-slate-700 border-slate-200" },
  PLAN_PENDING_APPROVAL: { label: "Chờ duyệt", color: "bg-orange-100 text-orange-700 border-orange-200" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa cập nhật";
  const d = new Date(dateStr);
  return isNaN(d) ? "Chưa cập nhật" : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const ITEMS_PER_PAGE = 6;

const MyEventsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Lấy dữ liệu và trạng thái loading từ Context
  const { myEvents, todayEvents, fetchMyData, loading } = useEvent();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQR, setSelectedQR] = useState(null);

  // 1. GỌI API KHI USER ĐÃ ĐĂNG NHẬP
  useEffect(() => {
    if (user) fetchMyData();
  }, [user, fetchMyData]);

  // 2. LOGIC LỌC DỮ LIỆU (Dựa trên mảng myEvents từ Context)
  const filtered = useMemo(() => {
    return (myEvents || []).filter((ev) => {
      const matchKeyword = (ev.title || "").toLowerCase().includes(searchKeyword.toLowerCase());
      const matchStatus = statusFilter === "all" || ev.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [myEvents, searchKeyword, statusFilter]);

  // 3. TÍNH TOÁN STATS (Dành cho Quản lý sự kiện)
  const stats = useMemo(() => ({
    total: (myEvents || []).length,
    active: (myEvents || []).filter((e) => e.status === "PUBLISHED" || e.status === "APPROVED").length,
    pending: (myEvents || []).filter((e) => e.status === "PLAN_PENDING_APPROVAL").length,
    completed: (myEvents || []).filter((e) => e.status === "COMPLETED").length,
  }), [myEvents]);

  // 4. PHÂN TRANG
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-[#eef2f7] font-sans">
      <Header />

      {/* Hero Section with Stats */}
      <div className="bg-[#1a3a6b] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-all mb-6 cursor-pointer"
          >
            <span className="w-8 h-8 bg-white/10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all">
              <ArrowLeft size={15} />
            </span>
            Quay lại
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Ticket size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Quản lý sự kiện</h1>
              <p className="text-blue-200 text-sm mt-0.5">Danh sách các sự kiện do bạn tổ chức & quản lý</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Tổng sự kiện", value: stats.total, color: "bg-white/10" },
              { label: "Đang hoạt động", value: stats.active, color: "bg-emerald-500/20" },
              { label: "Chờ phê duyệt", value: stats.pending, color: "bg-blue-400/20" },
              { label: "Đã kết thúc", value: stats.completed, color: "bg-red-400/20" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} rounded-2xl p-4 border border-white/10`}>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-blue-200 text-[10px] mt-0.5 uppercase font-bold tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện theo tên..."
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50 focus:bg-white focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10 transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["all", "PUBLISHED", "PLAN_PENDING_APPROVAL", "COMPLETED"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  statusFilter === s
                    ? "bg-[#1a3a6b] text-white border-[#1a3a6b] shadow-md shadow-blue-900/20"
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#1a3a6b] hover:text-[#1a3a6b]"
                }`}
              >
                {s === "all" ? "Tất cả" : STATUS_MAP[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Urgent Notification */}
        {todayEvents && todayEvents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Bell size={20} className="text-amber-600 animate-bounce" />
              </div>
              <div>
                <p className="font-bold text-amber-800 text-sm">Cần vận hành!</p>
                <p className="text-amber-600 text-xs mt-0.5">Bạn có {todayEvents.length} sự kiện diễn ra trong hôm nay.</p>
              </div>
            </div>
            <button onClick={() => navigate("/lecturer/attendance")} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer shadow-md">
              Đến trang điểm danh
            </button>
          </motion.div>
        )}

        {loading.myEvents ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-[#1a3a6b] mb-4" />
            <p className="text-slate-500 font-medium tracking-wide italic">Đang đồng bộ dữ liệu hệ thống...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-inner">
            <CalendarX size={64} className="text-slate-200 mb-4" />
            <p className="text-slate-600 font-black text-xl italic uppercase tracking-tighter">Không tìm thấy sự kiện nào</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginated.map((ev) => {
                const statusInfo = STATUS_MAP[ev.status] || {
                  label: ev.status, color: "bg-slate-100 text-slate-700 border-slate-200"
                };
                return (
                  <motion.div layout key={ev.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col group">
                    <div className="p-6 grow">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <Settings onClick={() => navigate(`/lecturer/edit-event/${ev.id}`)} size={18} className="text-slate-300 hover:text-[#1a3a6b] cursor-pointer transition-colors" />
                      </div>
                      
                      <h3 onClick={() => navigate(`/events/${ev.id}`)} className="font-black text-slate-800 text-lg leading-tight hover:text-[#1a3a6b] cursor-pointer line-clamp-2 mb-4 uppercase">
                        {ev.title || "Sự kiện không tên"}
                      </h3>

                      <div className="space-y-2 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-blue-500" />
                          <span>Bắt đầu: {formatDate(ev.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-rose-500" />
                          <span className="truncate">{ev.location || "Chưa xác định địa điểm"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-indigo-500" />
                          <span>{ev.maxParticipants || 0} người tham gia tối đa</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button onClick={() => navigate(`/events/${ev.id}`)} className="flex-1 py-2.5 bg-white border border-slate-200 text-[10px] text-slate-600 font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
                        Chi tiết
                      </button>
                      <button onClick={() => navigate("/lecturer/attendance")} className="flex-1 py-2.5 bg-[#1a3a6b] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#15306b] shadow-md shadow-blue-900/10 transition-all">
                        Điểm danh
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pb-10">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 border border-slate-200 rounded-2xl flex items-center justify-center bg-white hover:bg-slate-50 disabled:opacity-30 cursor-pointer">
                  <ChevronLeft size={20} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-2xl text-sm font-black transition-all ${currentPage === i + 1 ? "bg-[#1a3a6b] text-white shadow-lg shadow-blue-900/20 scale-110" : "bg-white text-slate-400 border border-slate-200 hover:border-[#1a3a6b]"}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 border border-slate-200 rounded-2xl flex items-center justify-center bg-white hover:bg-slate-50 disabled:opacity-30 cursor-pointer">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Modal (Z-Index 100) */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl relative border-4 border-white">
              <button onClick={() => setSelectedQR(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-500 cursor-pointer transition-all">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black text-slate-800 mb-6 italic tracking-tight uppercase">Mã Sự Kiện</h2>
              <div className="bg-white p-6 rounded-[2rem] shadow-inner border-2 border-slate-50 inline-block mb-4">
                <QRCode value={selectedQR.id} size={200} level="H" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedQR.title}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyEventsPage;