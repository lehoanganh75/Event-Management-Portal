import React, { useState, useEffect, useMemo } from "react";
import { Ticket, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import eventService from "../../services/eventService";
import Layout from "../../components/layout/Layout";
import { showToast } from "../../utils/toast.jsx";
import { useLanguage } from "../../context/LanguageContext";

// Components
import GuestEventsBanner from "../../components/events/guest/GuestEventsBanner";
import GuestEventsFilter from "../../components/events/guest/GuestEventsFilter";
import GuestEventsSchedule from "../../components/events/guest/GuestEventsSchedule";
import GuestEventCard from "../../components/events/guest/GuestEventCard";

const GuestEventsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CALENDAR");
  const [currentDate, setCurrentDate] = useState(new Date());

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

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] pb-20">
        <GuestEventsBanner
          stats={stats}
          viewMode={viewMode}
          setViewMode={setViewMode}
          t={t}
        />

        <div className="max-w-7xl mx-auto px-6 -mt-8">
          {viewMode === "GRID" && (
            <GuestEventsFilter
              search={search}
              setSearch={setSearch}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              t={t}
            />
          )}

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Ticket className="text-indigo-500 animate-pulse" size={24} />
                </div>
              </div>
              <p className="text-slate-500 font-medium animate-pulse">
                {t("loading_schedule") || "Đang tải lịch trình của bạn..."}
              </p>
            </div>
          ) : viewMode === "GRID" ? (
            filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredEvents.map((event, index) => (
                    <GuestEventCard
                      key={event.id}
                      event={event}
                      index={index}
                      onClick={() => navigate(`/events/${event.id}`)}
                      t={t}
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {t("no_events_found") || "Không tìm thấy sự kiện nào"}
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">
                  {t("no_events_registered_desc") || "Có vẻ như bạn chưa đăng ký tham gia sự kiện nào hoặc không tìm thấy kết quả phù hợp."}
                </p>
                <button
                  onClick={() => navigate("/events")}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  {t("explore_now") || "Khám phá sự kiện ngay"}
                </button>
              </motion.div>
            )
          ) : (
            <GuestEventsSchedule
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              events={events}
              navigate={navigate}
              t={t}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GuestEventsPage;
