import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Users, CheckCircle2, QrCode,
  Loader2, Search, X, ChevronLeft, ChevronRight,
  CalendarX, ArrowLeft, Ticket, Bell,
} from "lucide-react";
import Header from "../common/Header";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
// SỬA: Import eventApi từ file gộp trung tâm để dùng axiosClient
import { eventApi } from "../../api/eventApi";

const STATUS_MAP = {
  Registered: {
    label: "Đã đăng ký",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Attended: {
    label: "Đã điểm danh",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  Cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  NoShow: {
    label: "Vắng mặt",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa cập nhật";
  const d = new Date(dateStr);
  if (isNaN(d)) return "Chưa cập nhật";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const ITEMS_PER_PAGE = 6;

const MyEventsPage = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQR, setSelectedQR] = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);

  // 1. Helper lấy User ID từ dữ liệu user đã lưu trong localStorage (không cần decodeJWT)
  const getUserId = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || user.accountId || user.userId;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchMyEvents = async () => {
      setLoading(true);
      try {
        // 2. Fetch danh sách sự kiện đã đăng ký sử dụng eventApi mới
        // axiosClient bên trong sẽ tự đính kèm Token và BaseURL từ .env
        const res = await eventApi.registrations.getByUser(userId);
        const data = res.data || [];
        setRegistrations(data);

        // Logic lọc sự kiện diễn ra trong ngày hôm nay
        const today = new Date().toDateString();
        const todays = data.filter((reg) => {
          if (reg.checkedIn || reg.status !== "Registered" || !reg.eventStartTime) return false;
          const eventDate = new Date(reg.eventStartTime).toDateString();
          return eventDate === today;
        });
        setTodayEvents(todays);
      } catch (err) {
        console.error("Lỗi lấy danh sách sự kiện:", err);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [navigate]);

  const filtered = registrations.filter((reg) => {
    const matchKeyword = reg.eventTitle
      ?.toLowerCase()
      .includes(searchKeyword.toLowerCase());
    const matchStatus = statusFilter === "all" || reg.status === statusFilter;
    return matchKeyword && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const stats = {
    total: registrations.length,
    attended: registrations.filter((r) => r.status === "Attended").length,
    registered: registrations.filter((r) => r.status === "Registered").length,
    cancelled: registrations.filter((r) => r.status === "Cancelled").length,
  };

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
              <h1 className="text-2xl font-black text-white">Sự kiện của tôi</h1>
              <p className="text-blue-200 text-sm mt-0.5">Quản lý các sự kiện bạn đã tham gia</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Tổng đăng ký", value: stats.total, color: "bg-white/10" },
              { label: "Đã điểm danh", value: stats.attended, color: "bg-emerald-500/20" },
              { label: "Chờ tham gia", value: stats.registered, color: "bg-blue-400/20" },
              { label: "Đã hủy", value: stats.cancelled, color: "bg-red-400/20" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} rounded-2xl p-4 border border-white/10`}>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-blue-200 text-xs mt-0.5 uppercase font-bold tracking-wider">{label}</p>
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
            {["all", "Registered", "Attended", "Cancelled", "NoShow"].map((s) => (
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
        {todayEvents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Bell size={20} className="text-amber-600 animate-bounce" />
              </div>
              <div>
                <p className="font-bold text-amber-800 text-sm">Cần điểm danh!</p>
                <p className="text-amber-600 text-xs mt-0.5">Bạn có {todayEvents.length} sự kiện diễn ra trong hôm nay.</p>
              </div>
            </div>
            <button onClick={() => setStatusFilter("Registered")} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer">
              Kiểm tra ngay
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-[#1a3a6b] mb-4" />
            <p className="text-slate-500 font-medium tracking-wide">Đang tải danh sách sự kiện...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-inner">
            <CalendarX size={64} className="text-slate-200 mb-4" />
            <p className="text-slate-600 font-black text-xl">Không tìm thấy sự kiện</p>
            <p className="text-slate-400 text-sm mt-2 mb-8">Hãy thử tìm kiếm với từ khóa khác hoặc đăng ký sự kiện mới.</p>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-[#1a3a6b] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all">
              KHÁM PHÁ SỰ KIỆN
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginated.map((reg) => {
                const statusInfo = STATUS_MAP[reg.status] || {
                  label: reg.status, color: "bg-slate-100 text-slate-700 border-slate-200"
                };
                return (
                  <motion.div layout key={reg.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
                    <div className="p-6 grow">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <QrCode onClick={() => setSelectedQR(reg)} size={20} className="text-slate-300 hover:text-[#1a3a6b] cursor-pointer transition-colors" />
                      </div>
                      
                      <h3 onClick={() => navigate(`/events/${reg.eventId}`)} className="font-black text-slate-800 text-lg leading-tight hover:text-[#1a3a6b] cursor-pointer line-clamp-2 mb-4">
                        {reg.eventTitle || "Sự kiện không tên"}
                      </h3>

                      <div className="space-y-2 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-blue-500" />
                          <span>Đăng ký: {formatDate(reg.registeredAt)}</span>
                        </div>
                        {reg.checkInTime && (
                          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-emerald-700">Check-in: {formatTime(reg.checkInTime)} - {formatDate(reg.checkInTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                      <button onClick={() => navigate(`/events/${reg.eventId}`)} className="text-xs text-[#1a3a6b] font-black uppercase tracking-widest hover:underline">
                        Chi tiết
                      </button>
                      {reg.status === "Registered" && reg.qrToken && (
                        <button onClick={() => setSelectedQR(reg)} className="px-4 py-2 bg-[#1a3a6b] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#15306b] shadow-md shadow-blue-900/10">
                          MÃ VÉ
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
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

      {/* QR Modal Popup */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl relative border-4 border-white">
              <button onClick={() => setSelectedQR(null)} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-full cursor-pointer transition-all">
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-inner">
                <QrCode size={32} className="text-[#1a3a6b]" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Vé Tham Gia</h2>
              <p className="text-sm text-slate-500 mb-8 font-medium line-clamp-2 px-4">{selectedQR.eventTitle}</p>
              
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl border-2 border-slate-50 inline-block mb-8">
                <QRCode value={selectedQR.qrToken} size={200} level="H" />
              </div>
              
              <div className="bg-blue-50 rounded-2xl p-4 text-xs font-bold text-blue-700 flex flex-col gap-1">
                <p>Vui lòng xuất trình mã này tại bàn đăng ký.</p>
                {selectedQR.qrTokenExpiry && <p className="text-blue-400 font-medium uppercase text-[9px]">Hết hạn: {formatDate(selectedQR.qrTokenExpiry)}</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyEventsPage;