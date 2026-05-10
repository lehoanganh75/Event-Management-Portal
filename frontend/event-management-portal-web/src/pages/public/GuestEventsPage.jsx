import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar, MapPin, Clock, Search, Filter, ChevronRight,
  Ticket, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles,
  LayoutGrid, CalendarDays, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Moon, Sun, Sunrise
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import eventService from "../../services/eventService";
import Layout from "../../components/layout/Layout";
import { showToast } from "../../utils/toast.jsx";
import { useLanguage } from "../../context/LanguageContext";

const GuestEventsPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("calendar"); // 'list' or 'calendar'
  const [weekOffset, setWeekOffset] = useState(0);

  // Build STATUS_CONFIG dynamically from translations
  const STATUS_CONFIG = {
    PUBLISHED: { label: t("guestEvents.statusUpcoming"), color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
    ONGOING: { label: t("guestEvents.statusOngoing"), color: "text-emerald-600", bg: "bg-emerald-50", icon: Sparkles },
    COMPLETED: { label: t("guestEvents.statusCompleted"), color: "text-slate-600", bg: "bg-slate-50", icon: CheckCircle2 },
    CANCELLED: { label: t("guestEvents.statusCancelled"), color: "text-rose-600", bg: "bg-rose-50", icon: XCircle },
  };

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
      showToast(t("guestEvents.noEvents"), "error");
    } finally {
      setLoading(false);
    }
  };

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

  const weekDays = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff + weekOffset * 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const eventsByDayAndSlot = useMemo(() => {
    const grid = {};
    events.forEach(event => {
      const date = new Date(event.startTime);
      const dayKey = date.toDateString();
      const hour = date.getHours();

      let slot = "MORNING";
      if (hour >= 12 && hour < 18) slot = "AFTERNOON";
      else if (hour >= 18) slot = "EVENING";

      if (!grid[dayKey]) grid[dayKey] = { MORNING: [], AFTERNOON: [], EVENING: [] };
      grid[dayKey][slot].push(event);
    });
    return grid;
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
                  {t("guestEvents.portalBadge")}
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t("guestEvents.title")}</h1>
                <p className="text-slate-500 max-w-md">{t("guestEvents.subtitle")}</p>
              </div>

              <div className="flex gap-4">
                <StatCard label={t("guestEvents.totalEvents")} value={stats.total} color="blue" />
                <StatCard label={t("guestEvents.ongoing")} value={stats.ongoing} color="emerald" />
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
                  placeholder={t("guestEvents.searchPlaceholder")}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar flex-1">
                  <FilterButton active={activeFilter === "ALL"} onClick={() => setActiveFilter("ALL")} label={t("guestEvents.filterAll")} />
                  <FilterButton active={activeFilter === "ONGOING"} onClick={() => setActiveFilter("ONGOING")} label={t("guestEvents.filterOngoing")} />
                  <FilterButton active={activeFilter === "PUBLISHED"} onClick={() => setActiveFilter("PUBLISHED")} label={t("guestEvents.filterUpcoming")} />
                  <FilterButton active={activeFilter === "COMPLETED"} onClick={() => setActiveFilter("COMPLETED")} label={t("guestEvents.filterCompleted")} />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`p-2 rounded-xl transition-all ${viewMode === "calendar" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <CalendarDays size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* VIEW RENDERER */}
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Ticket className="text-indigo-500 animate-pulse" size={24} />
                </div>
              </div>
              <p className="text-slate-500 font-medium animate-pulse">{t("guestEvents.loadingTickets")}</p>
            </div>
          ) : viewMode === "calendar" ? (
            <CalendarView
              weekDays={weekDays}
              eventsByDayAndSlot={eventsByDayAndSlot}
              weekOffset={weekOffset}
              setWeekOffset={setWeekOffset}
              onEventClick={(id) => navigate(`/events/${id}`)}
            />
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, index) => (
                  <EventTicketCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={() => navigate(`/events/${event.id}`)}
                    statusConfig={STATUS_CONFIG}
                    t={t}
                    language={language}
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t("guestEvents.noEvents")}</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">{t("guestEvents.noEventsDesc")}</p>
              <button
                onClick={() => navigate("/events")}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                {t("guestEvents.exploreNow")}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

/* --- CALENDAR VIEW COMPONENT --- */
const CalendarView = ({ weekDays, eventsByDayAndSlot, weekOffset, setWeekOffset, onEventClick }) => {
  const slots = [
    { id: "MORNING", label: "Sáng", icon: Sunrise, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "AFTERNOON", label: "Chiều", icon: Sun, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "EVENING", label: "Tối", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
    >
      {/* Calendar Header */}
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <CalendarDays size={24} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Lịch sự kiện tuần này</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              {weekDays[0].toLocaleDateString('vi-VN')} - {weekDays[6].toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/5">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-2 hover:bg-white/20 rounded-xl transition-all"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/20 rounded-xl transition-all"
          >
            Hiện tại
          </button>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-2 hover:bg-white/20 rounded-xl transition-all"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50/50">
            <div className="p-4 flex items-center justify-center border-r border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ca học</span>
            </div>
            {weekDays.map((date, i) => (
              <div key={i} className={`p-4 text-center border-r border-slate-100 last:border-r-0 ${date.toDateString() === new Date().toDateString() ? "bg-indigo-50/50" : ""}`}>
                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">{dayNames[i]}</p>
                <p className={`text-sm font-bold ${date.toDateString() === new Date().toDateString() ? "text-indigo-900" : "text-slate-800"}`}>
                  {date.getDate()}/{date.getMonth() + 1}
                </p>
              </div>
            ))}
          </div>

          {/* Slots */}
          {slots.map(slot => (
            <div key={slot.id} className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-slate-50 last:border-b-0 min-h-[160px]">
              <div className="p-6 flex flex-col items-center justify-center gap-2 border-r border-slate-100 bg-slate-50/30">
                <div className={`p-2.5 rounded-xl ${slot.bg} ${slot.color} shadow-sm`}>
                  <slot.icon size={20} />
                </div>
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{slot.label}</span>
              </div>

              {weekDays.map((date, i) => {
                const dayKey = date.toDateString();
                const dayEvents = eventsByDayAndSlot[dayKey]?.[slot.id] || [];

                return (
                  <div
                    key={i}
                    className={`p-3 border-r border-slate-50 last:border-r-0 transition-colors hover:bg-slate-50/50 ${date.toDateString() === new Date().toDateString() ? "bg-indigo-50/20" : ""}`}
                  >
                    <div className="space-y-2">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={() => onEventClick(event.id)}
                          className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col h-full"
                        >
                          <div className="flex-1">
                            <p className="text-[11px] font-black text-indigo-600 line-clamp-2 leading-tight mb-2 group-hover:text-indigo-700 uppercase tracking-tight">
                              {event.title}
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex items-start gap-1.5">
                                <span className="text-[8px] font-black text-slate-400 uppercase shrink-0 mt-0.5">Phòng:</span>
                                <span className="text-[9px] font-bold text-slate-600 truncate">{event.location || "IUH Campus"}</span>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <span className="text-[8px] font-black text-slate-400 uppercase shrink-0 mt-0.5">Giờ:</span>
                                <span className="text-[9px] font-bold text-slate-600">
                                  {new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
                            <div className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[7px] font-black uppercase">
                              Chi tiết
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-200" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ca Sáng</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400 shadow-sm shadow-orange-200" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ca Chiều</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-sm shadow-indigo-200" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ca Tối</span>
        </div>
      </div>
    </motion.div>
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

const EventTicketCard = ({ event, index, onClick, statusConfig, t, language }) => {
  const status = statusConfig[event.status] || statusConfig.PUBLISHED;
  const StatusIcon = status.icon;
  const locale = language === "vi" ? "vi-VN" : "en-US";

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
            {new Date(event.startTime).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
              {new Date(event.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
              {" - "}
              {new Date(event.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            {t("guestEvents.eventDetail")}
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
