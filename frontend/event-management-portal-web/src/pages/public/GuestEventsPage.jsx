import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar, MapPin, Clock, Search, Filter, ChevronRight,
  Ticket, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import eventService from "../../services/eventService";
import Layout from "../../components/layout/Layout";
import { showToast } from "../../utils/toast.jsx";

const STATUS_CONFIG = {
  PUBLISHED: { label: "Sắp diễn ra", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  ONGOING: { label: "Đang diễn ra", color: "text-emerald-600", bg: "bg-emerald-50", icon: Sparkles },
  COMPLETED: { label: "Đã kết thúc", color: "text-slate-600", bg: "bg-slate-50", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", color: "text-rose-600", bg: "bg-rose-50", icon: XCircle },
};

const GuestEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getMyEvents();
      setEvents(res.data || []);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách sự kiện", "error");
    } finally {
      setLoading(false);
    }
  };

  console.log(events);


  const filteredEvents = useMemo(() => {
    return events
      .filter(e => e.title?.toLowerCase().includes(search.toLowerCase()))
      .filter(e => activeFilter === "ALL" || e.status === activeFilter);
  }, [events, search, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: events.length,
      upcoming: events.filter(e => e.status === "PUBLISHED").length,
      ongoing: events.filter(e => e.status === "ONGOING").length,
      completed: events.filter(e => e.status === "COMPLETED").length,
    };
  }, [events]);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        {/* HERO SECTION */}
        <div className="bg-white border-b border-slate-200 pt-10 pb-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Ticket size={14} />
                  Cổng thông tin người tham gia
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sự kiện của tôi</h1>
                <p className="text-slate-500 max-w-md">Theo dõi và quản lý các sự kiện bạn đã đăng ký tham gia tại IUH.</p>
              </div>

              <div className="flex gap-4">
                <StatCard label="Tổng sự kiện" value={stats.total} color="blue" />
                <StatCard label="Đang diễn ra" value={stats.ongoing} color="emerald" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-8">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 mb-10">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện theo tên..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                <FilterButton
                  active={activeFilter === "ALL"}
                  onClick={() => setActiveFilter("ALL")}
                  label="Tất cả"
                />
                <FilterButton
                  active={activeFilter === "ONGOING"}
                  onClick={() => setActiveFilter("ONGOING")}
                  label="Đang diễn ra"
                />
                <FilterButton
                  active={activeFilter === "PUBLISHED"}
                  onClick={() => setActiveFilter("PUBLISHED")}
                  label="Sắp diễn ra"
                />
                <FilterButton
                  active={activeFilter === "COMPLETED"}
                  onClick={() => setActiveFilter("COMPLETED")}
                  label="Đã kết thúc"
                />
              </div>
            </div>
          </div>

          {/* EVENTS GRID */}
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Ticket className="text-indigo-500 animate-pulse" size={24} />
                </div>
              </div>
              <p className="text-slate-500 font-medium animate-pulse">Đang tải danh sách vé của bạn...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, index) => (
                  <EventTicketCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={() => navigate(`/events/${event.id}`)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy sự kiện nào</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">
                Có vẻ như bạn chưa đăng ký tham gia sự kiện nào hoặc không tìm thấy kết quả phù hợp.
              </p>
              <button
                onClick={() => navigate("/events")}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Khám phá sự kiện ngay
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm min-w-[120px] text-center">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black text-${color}-600`}>{value}</p>
  </div>
);

const FilterButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${active
      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
      : "text-slate-500 hover:bg-slate-100"
      }`}
  >
    {label}
  </button>
);

const EventTicketCard = ({ event, index, onClick }) => {
  const status = STATUS_CONFIG[event.status] || STATUS_CONFIG.PUBLISHED;
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-100 cursor-pointer flex flex-col h-full"
    >
      {/* Event Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.coverImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80"}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div className={`${status.bg} ${status.color} px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 backdrop-blur-md shadow-sm`}>
            <StatusIcon size={12} />
            {status.label}
          </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
            <Calendar size={14} className="text-orange-400" />
            {new Date(event.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-indigo-500" />
            </div>
            <span className="line-clamp-1">{event.location || "IUH Campus"}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
              <Clock size={16} className="text-indigo-500" />
            </div>
            <span>
              {new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              {" - "}
              {new Date(event.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            Chi tiết sự kiện
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GuestEventsPage;
