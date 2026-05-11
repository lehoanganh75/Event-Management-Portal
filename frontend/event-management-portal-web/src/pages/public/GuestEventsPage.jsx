import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon, MapPin, Clock, Search, Filter, ChevronRight,
  Ticket, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles, ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays
} from "date-fns";
import viLocale from "date-fns/locale/vi";
import enLocale from "date-fns/locale/en-US";

import eventService from "../../services/eventService";
import Layout from "../../components/layout/Layout";
import { showToast } from "../../utils/toast.jsx";
import { useLanguage } from "../../context/LanguageContext";

const STATUS_CONFIG = {
  PUBLISHED: { label: "Sắp diễn ra", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  ONGOING: { label: "Đang diễn ra", color: "text-emerald-600", bg: "bg-emerald-50", icon: Sparkles },
  COMPLETED: { label: "Đã kết thúc", color: "text-slate-600", bg: "bg-slate-50", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", color: "text-rose-600", bg: "bg-rose-50", icon: XCircle },
};

const GuestEventsPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CALENDAR"); // Default to CALENDAR
  const [currentDate, setCurrentDate] = useState(new Date());

  const locale = language === 'VI' ? viLocale : enLocale;

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

  const getEventColors = (type) => {
    switch (type) {
      case "COMPETITION":
      case "VOLUNTEER":
        return { bg: "bg-[#71c332]", border: "border-[#5ea32a]", text: "text-white" }; // Thực hành
      case "WORKSHOP":
      case "SEMINAR":
        return { bg: "bg-[#e8e9ed]", border: "border-[#d1d2d6]", text: "text-[#333]" }; // Lý thuyết
      case "WEBINAR":
        return { bg: "bg-[#81d4fa]", border: "border-[#4fc3f7]", text: "text-[#1a3a6b]" }; // Trực tuyến
      default:
        return { bg: "bg-[#ebf5ff]", border: "border-[#b3d7ff]", text: "text-[#1a3a6b]" }; // Mặc định
    }
  };

  // LOGIC FOR IUH WEEKLY SCHEDULE
  const startOfSelectedWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfSelectedWeek, i));

  const getEventsForSlot = (day, shift) => {
    return events.filter(event => {
      if (!event.startTime) return false;
      const eventDate = new Date(event.startTime);
      if (!isSameDay(day, eventDate)) return false;
      
      const hour = eventDate.getHours();
      if (shift === "SÁNG") return hour < 12;
      if (shift === "CHIỀU") return hour >= 12 && hour < 18;
      if (shift === "TỐI") return hour >= 18;
      return false;
    });
  };

  const renderIUHSchedule = () => {
    const shifts = ["Sáng", "Chiều", "Tối"];
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden animate-in fade-in duration-500">
        {/* IUH Style Toolbar */}
        <div className="p-4 flex flex-col xl:flex-row items-center justify-between gap-4 border-b border-[#dee2e6] bg-white">
          <h2 className="text-xl font-bold text-[#444] shrink-0">Lịch học, lịch thi theo tuần</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <input 
                type="date" 
                value={format(currentDate, "yyyy-MM-dd")}
                onChange={(e) => setCurrentDate(new Date(e.target.value))}
                className="border border-[#ced4da] rounded px-3 py-1.5 text-sm outline-none focus:border-[#80bdff]"
              />
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-1.5 bg-[#007bff] text-white text-sm font-medium rounded hover:bg-[#0069d9] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <CalendarIcon size={14} /> Hiện tại
              </button>
              <button 
                onClick={() => setCurrentDate(addDays(currentDate, -7))}
                className="px-4 py-1.5 bg-[#007bff] text-white text-sm font-medium rounded hover:bg-[#0069d9] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ChevronLeft size={14} /> Trở về
              </button>
              <button 
                onClick={() => setCurrentDate(addDays(currentDate, 7))}
                className="px-4 py-1.5 bg-[#007bff] text-white text-sm font-medium rounded hover:bg-[#0069d9] transition-all flex items-center gap-1.5 shadow-sm"
              >
                Tiếp <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#f0f7ff]">
                <th className="border border-[#c6e2ff] py-3 text-[#0066cc] font-bold text-sm w-24">Ca học</th>
                {weekDays.map((day, i) => (
                  <th key={i} className="border border-[#c6e2ff] py-3 px-2 text-[#0066cc] font-bold text-sm w-[13%]">
                    <div className="mb-1">Thứ {i + 2 === 8 ? "Chủ nhật" : i + 2}</div>
                    <div className="font-normal text-[13px] text-slate-500">{format(day, "dd/MM/yyyy")}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift}>
                  <td className="border border-[#c6e2ff] bg-[#fffdf0] p-4 text-center">
                    <span className="font-bold text-[#666] text-sm uppercase">
                      {shift}
                    </span>
                  </td>
                  {weekDays.map((day, i) => {
                    const dayEvents = getEventsForSlot(day, shift.toUpperCase());
                    return (
                      <td key={i} className="border border-[#c6e2ff] p-2 align-top bg-[url('https://www.transparenttextures.com/patterns/graphy-light.png')] bg-repeat min-h-[160px]">
                        <div className="space-y-3">
                          {dayEvents.map((event, idx) => {
                            const colors = getEventColors(event.type);
                            return (
                              <motion.div
                                key={idx}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => navigate(`/events/${event.id}`)}
                                className={`${colors.bg} ${colors.border} ${colors.text} border rounded p-3 shadow-xs cursor-pointer hover:shadow transition-all group relative overflow-hidden`}
                              >
                                <div className="font-bold text-[13px] mb-2 leading-tight group-hover:underline">
                                  {event.title}
                                </div>
                                <div className="space-y-1 text-[11px] opacity-90">
                                  <div><span className="font-bold">Địa điểm:</span> {event.location || "IUH Campus"}</div>
                                  <div><span className="font-bold">Thời gian:</span> {format(new Date(event.startTime), "HH:mm")} - {format(new Date(event.endTime), "HH:mm")}</div>
                                  <div><span className="font-bold">Bản tổ chức:</span> {event.organizerName || "IUH Events"}</div>
                                  <div className="italic text-[10px] mt-1 opacity-70">Ghi chú: {event.location}</div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-4 bg-white border-t border-[#dee2e6] flex flex-wrap gap-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-[#e8e9ed] border border-[#d1d2d6]"></div>
            <span className="text-xs text-slate-600">Sự kiện Học thuật / Workshop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-[#71c332] border border-[#5ea32a]"></div>
            <span className="text-xs text-slate-600">Sự kiện Tình nguyện / Cuộc thi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-[#81d4fa] border border-[#4fc3f7]"></div>
            <span className="text-xs text-slate-600">Sự kiện Trực tuyến / Webinar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-[#fffdf0] border border-[#c6e2ff]"></div>
            <span className="text-xs text-slate-600">Sự kiện Văn hóa / Hội thao</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-[#ef5350] border border-[#d32f2f]"></div>
            <span className="text-xs text-slate-600">Sự kiện đã hủy / Tạm ngưng</span>
          </div>
        </div>
      </div>
    );
  };

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
                <p className="text-slate-500 max-w-md">Theo dõi và quản lý lịch trình tham gia sự kiện của bạn.</p>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mr-4 shadow-inner">
                  <button 
                    onClick={() => setViewMode("GRID")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === "GRID" ? "bg-white text-indigo-600 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <Search size={14} /> Dạng lưới
                  </button>
                  <button 
                    onClick={() => setViewMode("CALENDAR")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === "CALENDAR" ? "bg-white text-indigo-600 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <CalendarIcon size={14} /> Dạng lịch
                  </button>
                </div>
                <StatCard label="Tổng sự kiện" value={stats.total} color="blue" />
                <StatCard label="Đang diễn ra" value={stats.ongoing} color="emerald" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-8">
          {viewMode === "GRID" && (
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
                  <FilterButton active={activeFilter === "ALL"} onClick={() => setActiveFilter("ALL")} label="Tất cả" />
                  <FilterButton active={activeFilter === "ONGOING"} onClick={() => setActiveFilter("ONGOING")} label="Đang diễn ra" />
                  <FilterButton active={activeFilter === "PUBLISHED"} onClick={() => setActiveFilter("PUBLISHED")} label="Sắp diễn ra" />
                  <FilterButton active={activeFilter === "COMPLETED"} onClick={() => setActiveFilter("COMPLETED")} label="Đã kết thúc" />
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Ticket className="text-indigo-500 animate-pulse" size={24} />
                </div>
              </div>
              <p className="text-slate-500 font-medium animate-pulse">Đang tải lịch trình của bạn...</p>
            </div>
          ) : viewMode === "GRID" ? (
            filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredEvents.map((event, index) => (
                    <EventTicketCard key={event.id} event={event} index={index} onClick={() => navigate(`/events/${event.id}`)} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy sự kiện nào</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">Có vẻ như bạn chưa đăng ký tham gia sự kiện nào hoặc không tìm thấy kết quả phù hợp.</p>
                <button onClick={() => navigate("/events")} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                  Khám phá sự kiện ngay
                </button>
              </motion.div>
            )
          ) : (
            renderIUHSchedule()
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
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.coverImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80"}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute top-4 right-4">
          <div className={`${status.bg} ${status.color} px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 backdrop-blur-md shadow-sm`}>
            <StatusIcon size={12} />
            {status.label}
          </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
            <CalendarIcon size={14} className="text-orange-400" />
            {new Date(event.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>
      </div>

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
