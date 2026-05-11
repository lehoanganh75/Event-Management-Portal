import React, { useState, useEffect } from "react";
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
  addDays,
  parseISO
} from "date-fns";
import viLocale from "date-fns/locale/vi";
import enLocale from "date-fns/locale/en-US";
import { ChevronLeft, ChevronRight, X, Users, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import eventService from "../../services/eventService";
import { useLanguage } from "../../context/LanguageContext";

const getCategoryByEventType = (type, t) => {
  switch (type) {
    case "WORKSHOP":
    case "WEBINAR":
      return t('category_academic');
    case "CONCERT":
      return t('category_culture');
    case "COMPETITION":
      return t('category_sports');
    case "SEMINAR":
    case "TALKSHOW":
    case "CONFERENCE":
      return t('category_forum');
    case "FESTIVAL":
      return t('category_festival');
    case "VOLUNTEER":
      return t('category_community');
    case "INTERNATIONAL":
      return t('category_intl');
    default:
      return t('category_academic');
  }
};

const getCategoryColors = (t) => ({
  [t('category_academic')]: "bg-[#4B84D3]",
  [t('category_culture')]: "bg-[#F19B9B]",
  [t('category_sports')]: "bg-[#FFC627]",
  [t('category_community')]: "bg-[#097341]",
  [t('category_intl')]: "bg-[#FF4D4D]",
  [t('category_festival')]: "bg-[#D97D21]",
  [t('category_forum')]: "bg-[#00A195]"
});

// Fallback color if category not found
const DEFAULT_COLOR = "bg-blue-400";

const CalendarPage = () => {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date()); // Auto start with current date
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const CATEGORY_COLORS = getCategoryColors(t);
  const locale = language === 'VI' ? viLocale : enLocale;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventsForUser();
      if (response && response.data) {
        // Handle array response
        setEvents(Array.isArray(response.data) ? response.data : response.data.content || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải sự kiện:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const getEventsForDay = (day) => {
    return events.filter(event => {
      if (!event.startTime) return false;
      const eventDate = new Date(event.startTime);
      return isSameDay(day, eventDate);
    }).sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
  };
  
  const handleDayClick = (day, dayEvents) => {
    if (dayEvents && dayEvents.length > 0) {
      setSelectedDay(day);
      setSelectedDayEvents(dayEvents);
      setIsModalOpen(true);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-center items-center mb-6">
        <button onClick={prevMonth} className="text-red-700 hover:text-red-800 p-2">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <div className="bg-[#D32027] text-white px-8 py-2 rounded-lg mx-6 font-bold text-2xl uppercase">
          {t('month')} {format(currentDate, language === 'VI' ? "M yyyy" : "MMM yyyy", { locale })}
        </div>
        <button onClick={nextMonth} className="text-red-700 hover:text-red-800 p-2">
          <ChevronRight size={28} strokeWidth={3} />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
    return (
      <div className="grid grid-cols-7 bg-[#D32027]">
        {days.map((day, idx) => (
          <div key={idx} className="text-white text-center py-3 font-semibold text-sm uppercase">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const dayEvents = getEventsForDay(day);

        days.push(
          <div
            key={day}
            className={`min-h-[140px] border border-red-200 bg-white p-1 relative flex flex-col cursor-pointer hover:bg-gray-50 transition-colors ${
              !isSameMonth(day, monthStart)
                ? "text-gray-300"
                : "text-gray-700"
            }`}
            onClick={() => handleDayClick(cloneDay, dayEvents)}
          >
            <div className="flex justify-end p-1">
              <span className={`font-bold ${isSameDay(day, new Date()) ? "text-red-600" : ""}`}>
                {formattedDate}
              </span>
            </div>
            <div className="flex-1 overflow-visible space-y-1 mt-1 pr-1">
              {dayEvents.slice(0, 5).map((event, idx) => {
                const category = event.categoryName || event.category || getCategoryByEventType(event.type, t);
                const bgClass = CATEGORY_COLORS[category] || DEFAULT_COLOR;
                return (
                  <Link
                    to={`/events/${event.id}`}
                    key={idx}
                    className={`${bgClass} text-white p-1.5 rounded block text-[10px] sm:text-xs cursor-pointer hover:brightness-110 transition shadow-sm`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="font-bold uppercase truncate leading-tight">
                      {event.title}
                    </div>
                  </Link>
                );
              })}
              
              {dayEvents.length > 5 && (
                <div className="text-[10px] font-bold text-red-600 bg-red-50 p-1 rounded text-center mt-1 border border-red-100 hover:bg-red-100 transition-colors">
                  + {dayEvents.length - 5} {t('more_events')}
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-r border-b border-red-200">{rows}</div>;
  };

  const renderLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-6 mb-8 mt-2">
        {Object.entries(CATEGORY_COLORS).map(([name, colorClass]) => (
          <div key={name} className="flex items-center gap-2">
            <div className={`w-5 h-5 ${colorClass}`}></div>
            <span className="text-sm font-semibold text-gray-700">{name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 shadow-sm rounded-xl">
          {renderLegend()}
          {renderHeader()}
          {loading ? (
            <div className="flex justify-center p-20">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="calendar-grid">
              {renderDays()}
              {renderCells()}
            </div>
          )}
        </div>

        {/* Modal chi tiết ngày */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-[#D32027] p-4 flex justify-between items-center text-white">
                <div>
                  <h2 className="text-xl font-bold">
                    {t('events_on')} {selectedDay ? format(selectedDay, "dd/MM/yyyy") : ""}
                  </h2>
                  <p className="text-sm opacity-90">{language === 'VI' ? `Có ${selectedDayEvents.length} sự kiện diễn ra trong ngày này` : `There are ${selectedDayEvents.length} events on this day`}</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {selectedDayEvents.map((event, idx) => {
                  const category = event.categoryName || event.category || getCategoryByEventType(event.type, t);
                  const bgClass = CATEGORY_COLORS[category] || DEFAULT_COLOR;
                  
                  return (
                    <Link
                      to={`/events/${event.id}`}
                      key={idx}
                      className="group flex border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-red-100"
                    >
                      <div className={`w-3 ${bgClass} shrink-0`}></div>
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-800 uppercase group-hover:text-[#D32027] transition-colors">
                            {event.title}
                          </h3>
                          <span className={`${bgClass} text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>
                            {category}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarIcon size={16} className="text-[#D32027]" />
                            <span>{event.startTime ? format(new Date(event.startTime), "HH:mm") : "N/A"}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-[#D32027]" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-[#D32027]" />
                            <span>{event.registeredCount || 0} {t('registered_count')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-center bg-gray-50 border-l border-gray-100 group-hover:bg-red-50 transition-colors">
                        <ChevronRight className="text-gray-400 group-hover:text-[#D32027]" />
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  {t('close_btn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global style cho custom scrollbar trong các ngày nhiều sự kiện */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1; 
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1; 
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; 
          }
        `}} />
      </div>
    </>
  );
};

export default CalendarPage;
