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
import viLocale from "date-fns/locale/vi";
import enLocale from "date-fns/locale/en-US";

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
      return t("category_academic");
    case "CONCERT":
      return t("category_culture");
    case "COMPETITION":
      return t("category_sports");
    case "SEMINAR":
    case "TALKSHOW":
    case "CONFERENCE":
      return t("category_forum");
    case "FESTIVAL":
      return t("category_festival");
    case "VOLUNTEER":
      return t("category_community");
    case "INTERNATIONAL":
      return t("category_intl");
    default:
      return t("category_academic");
  }
};

const getCategoryColors = (t) => ({
  [t("category_academic")]: "bg-blue-500",
  [t("category_culture")]: "bg-pink-500",
  [t("category_sports")]: "bg-amber-500",
  [t("category_community")]: "bg-emerald-500",
  [t("category_intl")]: "bg-rose-500",
  [t("category_festival")]: "bg-orange-500",
  [t("category_forum")]: "bg-cyan-500",
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
  const locale = language === "VI" ? viLocale : enLocale;

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

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const getEventsForDay = (day) => {
    return events
      .filter((event) => event.startTime && isSameDay(new Date(event.startTime), day))
      .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
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
