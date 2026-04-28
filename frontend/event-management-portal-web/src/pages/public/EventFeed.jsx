import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Zap,           // thay cho ⚡
  Bell,           // cho Thông báo mới
  UserCheck,      // cho Sự kiện của tôi (hoặc CalendarDays)
  Sparkles,       // cho tiêu đề "KHÁM PHÁ HOẠT ĐỘNG"
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useEvents } from "../../context/EventContext";
import Preloader from "../../components/common/Preloader";

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "upcoming", label: "Sắp diễn ra" },
  { id: "ongoing", label: "Đang diễn ra" },
];

function LeftSidebar({ onSearchChange }) {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  return (
    <aside className="w-72 shrink-0 space-y-6 hidden lg:block">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Tìm theo tên sự kiện
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập tên sự kiện..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              onSearchChange(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Truy cập nhanh */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 text-white px-5 py-4 font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5" />
          TRUY CẬP NHANH
        </div>
        <div className="p-4 space-y-1">
          <button
            onClick={() => navigate("/notifications")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition"
          >
            <Bell className="w-5 h-5 text-blue-600" />
            Thông báo mới
          </button>
          <button
            onClick={() => navigate("/my-events")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition"
          >
            <Calendar className="w-5 h-5 text-blue-600" />
            Sự kiện của tôi
          </button>
        </div>
      </div>
    </aside>
  );
}

function EventCard({ item, onClick }) {
  const percent = item.maxParticipants
    ? Math.min(100, (item.registeredCount / item.maxParticipants) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onClick(item.id)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="relative h-52">
        <img
          src={item.coverImage || "https://via.placeholder.com/600x400/1e3a8a/ffffff?text=IUH+Event"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          {item.type || "SEMINAR"}
        </div>

        {/* Status */}
        <div className="absolute top-4 right-4 bg-white/90 text-xs font-medium px-3 py-1 rounded-full text-gray-700">
          {item.status || "PUBLISHED"}
        </div>

        {/* Title on image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }).format(new Date(item.startTime))}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{item.location}</span>
          </div>
        </div>

        {item.registrationDeadline && (
          <div className="text-xs text-red-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Hạn đăng ký: {new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }).format(new Date(item.registrationDeadline))}
          </div>
        )}

        {/* Progress */}
        {item.maxParticipants && (
          <div>
            <div className="flex justify-between text-xs mb-1.5 text-gray-500">
              <span>Tham gia</span>
              <span>{item.registeredCount} / {item.maxParticipants}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function EventListPage() {
  const navigate = useNavigate();
  const { userAll, ongoing, upcoming, fetchAllEvents, fetchOngoing, fetchUpcoming, loading: eventLoading } = useEvents();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAllEvents();
    fetchOngoing();
    fetchUpcoming();
  }, []);

  const filteredEvents = useMemo(() => {
    let list = activeTab === "ongoing" ? ongoing || []
      : activeTab === "upcoming" ? upcoming || []
        : userAll || [];

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      list = list.filter(e =>
        e.title?.toLowerCase().includes(kw) ||
        e.location?.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [activeTab, userAll, ongoing, upcoming, searchKeyword]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const handleSearchChange = useCallback((value) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleEventClick = (id) => navigate(`/events/${id}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Left Sidebar */}
        <LeftSidebar onSearchChange={handleSearchChange} />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="uppercase text-blue-600 font-medium tracking-widest text-sm">
                KHÁM PHÁ HOẠT ĐỘNG
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              HỆ SINH THÁI SỰ KIỆN IUH
            </h1>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center mb-8">
            <div className="flex bg-gray-100 p-1 rounded-xl w-full lg:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm sự kiện..."
                value={searchKeyword}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 text-sm"
              />
            </div>
          </div>

          {/* Event Grid */}
          <div className="relative min-h-[500px]">
            {eventLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-3xl">
                <Preloader />
              </div>
            )}

            <AnimatePresence mode="wait">
              {paginatedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedEvents.map((item) => (
                    <EventCard key={item.id} item={item} onClick={handleEventClick} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                  <p className="text-gray-400 text-lg">Không tìm thấy sự kiện nào</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center border rounded-xl hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center border rounded-xl hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}