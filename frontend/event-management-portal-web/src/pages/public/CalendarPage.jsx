import React, { useState, useEffect } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import { vi, enUS } from "date-fns/locale";

import Header from "../../components/layout/Header";
import eventService from "../../services/eventService";
import { useLanguage } from "../../context/LanguageContext";

// Components
import CalendarHeader from "../../components/events/calendar/CalendarHeader";
import CalendarGrid from "../../components/events/calendar/CalendarGrid";
import CalendarLegend from "../../components/events/calendar/CalendarLegend";
import CalendarModal from "../../components/events/calendar/CalendarModal";

const getCategoryByEventType = (type, t) => {
  switch (type) {
    case "WORKSHOP":
    case "WEBINAR":
      return "Học Thuật - Kỹ năng";
    case "CONCERT":
      return "Văn Hóa - Văn nghệ";
    case "COMPETITION":
      return "Thể thao";
    case "SEMINAR":
    case "TALKSHOW":
    case "CONFERENCE":
      return "Diễn đàn - Hội thảo";
    case "FESTIVAL":
      return "Lễ hội trường";
    case "VOLUNTEER":
      return "Vì Cộng Đồng";
    case "INTERNATIONAL":
      return "Quốc tế";
    default:
      return "Học Thuật - Kỹ năng";
  }
};

const getCategoryColors = (t) => ({
  ["Học Thuật - Kỹ năng"]: "bg-blue-500",
  ["Văn Hóa - Văn nghệ"]: "bg-pink-500",
  ["Thể thao"]: "bg-amber-500",
  ["Vì Cộng Đồng"]: "bg-emerald-500",
  ["Quốc tế"]: "bg-rose-500",
  ["Lễ hội trường"]: "bg-orange-500",
  ["Diễn đàn - Hội thảo"]: "bg-cyan-500",
});

const DEFAULT_COLOR = "bg-blue-500";

const CalendarPage = () => {
  const { t, language } = useLanguage();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const CATEGORY_COLORS = getCategoryColors(t);
  const locale = language === "VI" ? vi : enUS;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventsForUser();
      if (response?.data) {
        setEvents(Array.isArray(response.data) ? response.data : response.data.content || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("events: ", events);
  

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const getEventsForDay = (day) => {
    return events
      .filter((event) => {
        if (!event.startTime) return false;
        const start = new Date(event.startTime);
        const end = event.endTime ? new Date(event.endTime) : start;
        
        const dDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const sDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const eDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        
        return dDate >= sDate && dDate <= eDate;
      })
      .sort((a, b) => {
        const aStart = new Date(a.startTime).getTime();
        const bStart = new Date(b.startTime).getTime();
        const aEnd = a.endTime ? new Date(a.endTime).getTime() : aStart;
        const bEnd = b.endTime ? new Date(b.endTime).getTime() : bStart;
        
        const aDuration = aEnd - aStart;
        const bDuration = bEnd - bStart;
        
        if (aDuration !== bDuration) {
          return bDuration - aDuration; // Longer events first
        }
        if (aStart !== bStart) {
          return aStart - bStart; // Earlier events first
        }
        return (b.registeredCount || 0) - (a.registeredCount || 0);
      });
  };

  const handleDayClick = (day, dayEvents) => {
    if (dayEvents && dayEvents.length > 0) {
      setSelectedDay(day);
      setSelectedDayEvents(dayEvents);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CalendarLegend categoryColors={CATEGORY_COLORS} />

          <CalendarHeader
            currentDate={currentDate}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            language={language}
            locale={locale}
          />

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl py-28 flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CalendarGrid
              startDate={startDate}
              endDate={endDate}
              monthStart={monthStart}
              t={t}
              getEventsForDay={getEventsForDay}
              handleDayClick={handleDayClick}
              getCategoryByEventType={getCategoryByEventType}
              categoryColors={CATEGORY_COLORS}
              defaultColor={DEFAULT_COLOR}
            />
          )}
        </div>

        <CalendarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDay={selectedDay}
          events={selectedDayEvents}
          t={t}
          getCategoryByEventType={getCategoryByEventType}
          categoryColors={CATEGORY_COLORS}
          defaultColor={DEFAULT_COLOR}
        />
      </div>
    </>
  );
};

export default CalendarPage;
