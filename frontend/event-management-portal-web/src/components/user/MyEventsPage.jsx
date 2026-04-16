import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, MapPin, Search,
  ChevronLeft, ChevronRight, CalendarX, ArrowLeft,
  Ticket, ShieldCheck, Mic, UserCheck
} from "lucide-react";
import Header from "../common/Header";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";

const STATUS_MAP = {
  PUBLISHED: { label: "Đã công bố", color: "bg-blue-500 text-white" },
  APPROVED: { label: "Đã duyệt", color: "bg-emerald-500 text-white" },
  DRAFT: { label: "Bản nháp", color: "bg-slate-400 text-white" },
  PLAN_PENDING_APPROVAL: { label: "Chờ duyệt", color: "bg-orange-500 text-white" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-purple-500 text-white" },
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
  return new Date(dateStr).toLocaleDateString("vi-VN");
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
      return { label: "Chủ trì", icon: <ShieldCheck size={10}/> };

    if (ev.presenters?.some(p => p.presenterAccountId === user?.id))
      return { label: "Diễn giả", icon: <Mic size={10}/> };

    if (ev.registrations?.some(r => r.participantAccountId === user?.id))
      return { label: "Tham gia", icon: <UserCheck size={10}/> };

    return { label: "Liên quan", icon: <Ticket size={10}/> };
  };

  const filtered = useMemo(() => {
    return (myEvents || []).filter(ev =>
      (ev.title || "").toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [myEvents, searchKeyword]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      {/* HERO */}
      <div className="relative py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a6b] to-indigo-800"></div>
        <div className="absolute w-[300px] h-[300px] bg-blue-500/30 blur-[100px] -top-20 -left-20"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-white">
          <button onClick={() => navigate(-1)} className="flex gap-2 mb-4 text-white/70 hover:text-white">
            <ArrowLeft size={16}/> Quay lại
          </button>

          <h1 className="text-4xl font-black mb-1">Sự kiện của tôi</h1>
          <p className="text-blue-200 text-sm">Quản lý tất cả vai trò của bạn</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">

        {/* SEARCH + FILTER */}
        <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-5 shadow-lg mb-8 border border-white/40">
          <div className="flex flex-col lg:flex-row gap-3">

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm sự kiện..."
                className="w-full pl-12 py-2.5 text-sm rounded-xl bg-white/80 border border-white/50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {FILTER_ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRoleFilter(r.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-bold transition
                    ${roleFilter === r.value
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                      : "bg-white/60 text-slate-500 hover:bg-white"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* LOADING */}
        {loading.myEvents ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl py-24 text-center border-dashed border">
            <CalendarX size={50} className="mx-auto text-slate-200 mb-3"/>
            <p className="text-slate-400 font-semibold">Không có dữ liệu</p>
          </div>
        ) : (
          <>
            {/* GRID */}
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {paginated.map(ev => {
                const role = getUserRole(ev);
                const status = STATUS_MAP[ev.status] || STATUS_MAP.DRAFT;

                return (
                  <motion.div
                    key={ev.id}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="group bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
                  >
                    {/* IMAGE */}
                    <div className="relative h-40 overflow-hidden">
                      <img src={ev.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        <span className="px-2 py-1 text-[9px] bg-white/80 rounded-full flex items-center gap-1">
                          {role.icon} {role.label}
                        </span>

                        <span className={`px-2 py-1 text-[9px] rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-4 flex flex-col">
                      <h3
                        onClick={() => navigate(`/events/${ev.id}`)}
                        className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-blue-600 cursor-pointer mb-3"
                      >
                        {ev.title}
                      </h3>

                      <div className="space-y-2 text-xs text-slate-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={12}/> {formatDate(ev.startTime)}
                        </div>
                        <div className="flex items-center gap-2 truncate">
                          <MapPin size={12}/> {ev.location}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => navigate(`/events/${ev.id}`)}
                          className="flex-1 py-2 text-xs bg-white/80 rounded-xl border hover:shadow"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft/>
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 text-xs rounded-lg
                      ${currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                  <ChevronRight/>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}