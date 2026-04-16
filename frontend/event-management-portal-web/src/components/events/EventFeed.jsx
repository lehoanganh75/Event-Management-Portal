import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Newspaper, Calendar, Clock, MapPin, Users, Search,
  ChevronLeft, ChevronRight, Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useEvents } from "../../context/EventContext";
import Preloader from "./Preloader";

const tabs = [
  { id: "all", label: "Tất cả", icon: <Newspaper className="w-4 h-4" /> },
  { id: "upcoming", label: "Sắp diễn ra", icon: <Calendar className="w-4 h-4" /> },
  { id: "ongoing", label: "Đang diễn ra", icon: <Clock className="w-4 h-4" /> },
];

function LeftSidebar({ onSearchChange }) {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  return (
    <aside className="w-72 shrink-0 space-y-6 hidden lg:block">
      <div>
        <label className="text-base font-medium text-gray-700 mb-2 block">
          Tìm theo tên sự kiện
        </label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập tên sự kiện..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              onSearchChange(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-[#245bb5] text-white px-4 py-3 font-semibold">⚡ TRUY CẬP NHANH</div>
        <div className="p-4 space-y-3">
          {[
            { icon: <Clock className="w-4 h-4" />, label: "Thông báo mới", link: "/notifications" },
            { icon: <Calendar className="w-4 h-4" />, label: "Sự kiện của tôi", link: "/my-events" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.link)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition text-left cursor-pointer"
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function MobileSearchBar({ onSearchChange }) {
  const [keyword, setKeyword] = useState("");
  return (
    <div className="lg:hidden px-4 pt-4 pb-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            onSearchChange(e.target.value);
          }}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>
    </div>
  );
}

function EventCard({ item, onClick }) {
  const percent =
    item.maxParticipants
      ? Math.min(100, (item.registeredCount / item.maxParticipants) * 100)
      : 0;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => onClick(item.id)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all cursor-pointer"
    >
      {/* IMAGE */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.coverImage || "https://via.placeholder.com/600x400"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />

        {/* overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* TYPE */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
          {item.type}
        </div>

        {/* STATUS */}
        <div className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
          {item.status}
        </div>

        {/* TITLE over image */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h3 className="font-bold text-lg line-clamp-2">
            {item.title}
          </h3>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3">
        {/* DATE + LOCATION */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            📅 {formatDate(item.startTime)}
          </div>
          <div className="truncate max-w-[120px]">
            📍 {item.location}
          </div>
        </div>

        {/* DEADLINE */}
        <div className="text-xs text-red-500">
          ⏳ Hạn đăng ký: {formatDate(item.registrationDeadline)}
        </div>

        {/* PROGRESS BAR */}
        {item.maxParticipants && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Đã đăng ký</span>
              <span>
                {item.registeredCount}/{item.maxParticipants}
              </span>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {/* TAGS */}
        <div className="flex flex-wrap gap-2 pt-2">
          {item.hasLuckyDraw && (
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
              🎁 Lucky Draw
            </span>
          )}

          {item.eventMode === "OFFLINE" && (
            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
              Offline
            </span>
          )}

          {item.eventTopic && (
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              {item.eventTopic}
            </span>
          )}
        </div>
      </div>

      {/* HOVER DETAIL (Netflix style) */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition p-5 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">
            {item.description}
          </p>
        </div>

        <div className="text-xs text-gray-500 mt-3 space-y-1">
          <div>👥 {item.registeredCount} người tham gia</div>
          <div>📍 {item.location}</div>
          <div>📅 {formatDate(item.startTime)}</div>
        </div>

        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl text-sm hover:bg-blue-700 transition">
          Xem chi tiết
        </button>
      </div>
    </motion.div>
  );
}

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
};

export default function EventListPage() {
  const navigate = useNavigate();
  const { 
    userAll,      // Tất cả sự kiện
    ongoing,      // Đang diễn ra
    upcoming,     // Sắp diễn ra
    fetchAllEvents,
    fetchOngoing,
    fetchUpcoming,
    loading: eventLoading 
  } = useEvents();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    // Gọi tất cả các API cần thiết một lần
    fetchAllEvents();
    fetchOngoing();
    fetchUpcoming();
  }, [fetchAllEvents, fetchOngoing, fetchUpcoming]);

  // Lọc sự kiện theo Tab + Search
  const filteredEvents = useMemo(() => {
    let list = [];

    switch (activeTab) {
      case "ongoing":
        list = ongoing || [];
        break;
      case "upcoming":
        list = upcoming || [];
        break;
      case "all":
      default:
        list = userAll || [];
        break;
    }

    // Áp dụng tìm kiếm
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      list = list.filter(event =>
        event.title?.toLowerCase().includes(keyword) ||
        event.location?.toLowerCase().includes(keyword)
      );
    }

    return list;
  }, [activeTab, userAll, ongoing, upcoming, searchKeyword]);

  // Phân trang
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const handleSearchChange = useCallback((value) => {
    setSearchKeyword(value);
    setCurrentPage(1); // Reset về trang 1 khi search
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleEventClick = (id) => {
    navigate(`/events/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex gap-8 py-8 px-4">
        
        {/* Left Sidebar */}
        <LeftSidebar onSearchChange={handleSearchChange} />

        {/* Main Content */}
        <div className="flex-1">
          <MobileSearchBar onSearchChange={handleSearchChange} />

          {/* Header */}
          <div className="px-4 md:px-6 pt-6 pb-4">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Sự kiện IUH
            </h1>
            <p className="text-slate-500 mt-1">Khám phá các sự kiện mới nhất</p>
          </div>

          {/* Toolbar */}
          <div className="px-4 md:px-6">
            <div className="bg-white rounded-2xl p-4 flex flex-col xl:flex-row gap-4 items-center justify-between shadow-sm border">
              {/* Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-full xl:w-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full xl:w-80 hidden lg:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm sự kiện..."
                  value={searchKeyword}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Event List */}
          <div className="px-4 md:px-6 mt-8 space-y-6 relative min-h-[400px]">
            {eventLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                <Preloader />
              </div>
            )}

            <AnimatePresence mode="wait">
              {paginatedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedPosts.map((item) => (
                    <EventCard
                      key={item.id}
                      item={item}
                      onClick={handleEventClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl py-20 text-center border border-dashed border-gray-200">
                  <p className="text-slate-400 font-semibold text-lg">
                    Không tìm thấy sự kiện nào
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 pb-12">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="w-11 h-11 rounded-2xl border flex items-center justify-center bg-white hover:bg-gray-50 disabled:opacity-50 transition"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="px-5 py-2 text-sm font-medium text-slate-600">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="w-11 h-11 rounded-2xl border flex items-center justify-center bg-white hover:bg-gray-50 disabled:opacity-50 transition"
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