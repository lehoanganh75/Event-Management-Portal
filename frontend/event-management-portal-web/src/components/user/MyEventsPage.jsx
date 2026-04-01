import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  QrCode,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarX,
  ArrowLeft,
  Ticket,
  Bell,
} from "lucide-react";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { getAttendedEvents } from "../../api/eventApi";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";

const getCurrentAccountId = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.accountId || payload.userId || payload.sub || null;
    }
    return null;
  } catch (e) {
    return null;
  }
};

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

  useEffect(() => {
    const userId = getCurrentAccountId();
    if (!userId) {
      navigate("/login");
      return;
    }

    getAttendedEvents(userId)
      .then((res) => {
        const data = res.data || [];
        setRegistrations(data);

        const today = new Date().toDateString();
        const todays = data.filter((reg) => {
          if (reg.checkedIn) return false;
          if (reg.status !== "Registered") return false;
          if (!reg.eventStartTime) return false;
          const eventDate = new Date(reg.eventStartTime).toDateString();
          return eventDate === today;
        });
        setTodayEvents(todays);
      })
      .catch((err) => {
        console.error(err);
        setRegistrations([]);
      })
      .finally(() => setLoading(false));
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
              <h1 className="text-2xl font-black text-white">
                Sự kiện của tôi
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Danh sách sự kiện bạn đã đăng ký và tham gia
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Tổng đăng ký",
                value: stats.total,
                color: "bg-white/10",
              },
              {
                label: "Đã điểm danh",
                value: stats.attended,
                color: "bg-emerald-500/20",
              },
              {
                label: "Chờ tham gia",
                value: stats.registered,
                color: "bg-blue-400/20",
              },
              {
                label: "Đã hủy",
                value: stats.cancelled,
                color: "bg-red-400/20",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className={`${color} rounded-2xl p-4 border border-white/10`}
              >
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-blue-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-gray-50 focus:bg-white focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10 transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["all", "Registered", "Attended", "Cancelled", "NoShow"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    statusFilter === s
                      ? "bg-[#1a3a6b] text-white border-[#1a3a6b]"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1a3a6b] hover:text-[#1a3a6b]"
                  }`}
                >
                  {s === "all" ? "Tất cả" : STATUS_MAP[s]?.label || s}
                </button>
              ),
            )}
          </div>
        </div>

        {todayEvents.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Bell size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-800 text-sm">
                  Bạn có {todayEvents.length} sự kiện cần điểm danh hôm nay!
                </p>
                <p className="text-amber-600 text-xs mt-0.5">
                  {todayEvents.map(e => e.eventTitle).join(", ")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter("Registered")}
              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-all cursor-pointer shrink-0"
            >
              Xem ngay
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-[#1a3a6b] mb-3" />
            <p className="text-sm text-slate-500">Đang tải danh sách...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
            <CalendarX size={56} className="text-slate-200 mb-4" />
            <p className="text-slate-600 font-bold text-lg">
              Không tìm thấy sự kiện nào
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Bạn chưa đăng ký sự kiện nào hoặc không khớp bộ lọc
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2.5 bg-[#1a3a6b] text-white rounded-xl font-semibold text-sm hover:bg-[#15306b] transition-all cursor-pointer"
            >
              Khám phá sự kiện
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {paginated.map((reg) => {
                const statusInfo = STATUS_MAP[reg.status] || {
                  label: reg.status,
                  color: "bg-slate-100 text-slate-700 border-slate-200",
                };
                return (
                  <div
                    key={reg.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3
                          onClick={() => navigate(`/events/${reg.eventId}`)}
                          className="font-bold text-slate-800 text-sm leading-snug hover:text-[#1a3a6b] cursor-pointer line-clamp-2 flex-1"
                        >
                          {reg.eventTitle || "Sự kiện không tên"}
                        </h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shrink-0 ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar
                            size={13}
                            className="text-slate-400 shrink-0"
                          />
                          <span>Đăng ký: {formatDate(reg.registeredAt)}</span>
                        </div>
                        {reg.checkInTime && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={13}
                              className="text-emerald-500 shrink-0"
                            />
                            <span className="text-emerald-600 font-semibold">
                              Điểm danh: {formatDate(reg.checkInTime)} lúc{" "}
                              {formatTime(reg.checkInTime)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
                      <button
                        onClick={() => navigate(`/events/${reg.eventId}`)}
                        className="text-xs text-[#1a3a6b] font-semibold hover:underline cursor-pointer flex items-center gap-1 px-3 py-1.5 border border-[#1a3a6b]/20 rounded-lg hover:bg-[#1a3a6b]/5 transition-all"
                      >
                        Xem chi tiết
                      </button>
                      {reg.status === "Registered" && reg.qrToken && (
                        <button
                          onClick={() => setSelectedQR(reg)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a3a6b] text-white rounded-lg text-xs font-semibold hover:bg-[#15306b] transition-all cursor-pointer"
                        >
                          <QrCode size={13} /> Xem QR
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      currentPage === i + 1
                        ? "bg-[#1a3a6b] text-white shadow-lg"
                        : "border border-slate-200 text-slate-500 hover:border-[#1a3a6b] hover:text-[#1a3a6b]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedQR(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition-all"
              >
                <X size={18} />
              </button>
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode size={28} className="text-[#1a3a6b]" />
              </div>
              <h2 className="text-lg font-black text-slate-800 mb-1">
                Mã QR Check-in
              </h2>
              <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                {selectedQR.eventTitle}
              </p>
              {selectedQR.qrTokenExpiry && (
                <p className="text-xs text-orange-500 font-semibold mb-5">
                  Hết hạn: {formatDate(selectedQR.qrTokenExpiry)}
                </p>
              )}
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 inline-block">
                <QRCode value={selectedQR.qrToken} size={200} level="H" />
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Xuất trình mã này khi check-in sự kiện
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyEventsPage;
