import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarX,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  Mic,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";

import Header from "../common/Header";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";

const STATUS_MAP = {
  PUBLISHED: { label: "Đã công bố", color: "bg-blue-600 text-white" },
  APPROVED: { label: "Đã duyệt", color: "bg-emerald-600 text-white" },
  DRAFT: { label: "Bản nháp", color: "bg-slate-400 text-white" },
  PLAN_PENDING_APPROVAL: { label: "Chờ duyệt", color: "bg-amber-500 text-white" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-purple-600 text-white" },
};

const FILTER_ROLES = [
  { label: "Tất cả", value: "ALL" },
  { label: "Tham gia", value: "PARTICIPANT" },
  { label: "Tổ chức", value: "ORGANIZER" },
  { label: "Diễn giả", value: "PRESENTER" },
  { label: "Đã tạo", value: "CREATOR" },
  { label: "Chờ duyệt", value: "APPROVER" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa cập nhật";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function MyEventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myEvents, fetchMyEvents, loading } = useEvents();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    if (user) {
      fetchMyEvents(roleFilter);
      setCurrentPage(1);
    }
  }, [user, roleFilter]);

  const getUserRole = (ev) => {
    if (ev.createdByAccountId === user?.id)
      return { label: "Chủ trì", icon: <ShieldCheck size={14} /> };

    if (ev.presenters?.some((p) => p.presenterAccountId === user?.id))
      return { label: "Diễn giả", icon: <Mic size={14} /> };

    if (ev.registrations?.some((r) => r.participantAccountId === user?.id))
      return { label: "Tham gia", icon: <UserCheck size={14} /> };

    return { label: "Liên quan", icon: <Ticket size={14} /> };
  };

  const filtered = useMemo(() => {
    return (myEvents || []).filter((ev) =>
      (ev.title || "").toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [myEvents, searchKeyword]);

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ==================== HERO SECTION - ĐÃ SỬA THEO ẢNH ==================== */}
      <div className="relative h-[260px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center">
        {/* Nền mờ nhẹ */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#ffffff15_0%,transparent_60%)]" />

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          {/* Nút Quay lại */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Quay lại</span>
          </button>

          {/* Tiêu đề */}
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Sự kiện của tôi
          </h1>
          <p className="text-blue-100 mt-2 text-[17px]">
            Quản lý tất cả vai trò tham gia của bạn
          </p>
        </div>
      </div>

      {/* ==================== PHẦN NỘI DUNG CHÍNH ==================== */}
      <div className="-mt-8 relative z-20 max-w-7xl mx-auto px-6 pb-12">
        {/* Search + Filter */}
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-10 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm sự kiện..."
                className="w-full pl-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {FILTER_ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRoleFilter(r.value)}
                  className={`px-6 py-3 text-sm font-medium rounded-2xl transition-all whitespace-nowrap ${
                    roleFilter === r.value
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading & Empty State */}
        {loading.myEvents ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl py-24 text-center border border-dashed border-gray-200">
            <CalendarX size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Không có sự kiện nào</p>
          </div>
        ) : (
          <>
            {/* Event Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map((ev) => {
                const role = getUserRole(ev);
                const status = STATUS_MAP[ev.status] || STATUS_MAP.DRAFT;

                return (
                  <motion.div
                    key={ev.id}
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 group cursor-pointer"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={ev.coverImage || "https://via.placeholder.com/600x400/1e40af/ffffff?text=Event"}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/90 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                          {role.icon} {role.label}
                        </span>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3
                        onClick={() => navigate(`/events/${ev.id}`)}
                        className="font-semibold text-lg leading-tight line-clamp-2 hover:text-blue-600 cursor-pointer mb-4"
                      >
                        {ev.title}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(ev.startTime)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="line-clamp-1">{ev.location}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/events/${ev.id}`)}
                        className="mt-6 w-full py-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-11 h-11 flex items-center justify-center border rounded-2xl hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={20} />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-11 h-11 rounded-2xl text-sm font-medium transition ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-11 h-11 flex items-center justify-center border rounded-2xl hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}