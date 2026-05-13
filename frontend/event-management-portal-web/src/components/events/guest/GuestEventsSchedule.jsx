import React from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const GuestEventsSchedule = ({ currentDate, setCurrentDate, events, navigate, t }) => {
  const startOfSelectedWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfSelectedWeek, i));

  const getEventsForSlot = (day, shift) => {
    return events.filter(event => {
      if (!event.startTime) return false;
      const eventDate = new Date(event.startTime);
      if (!isSameDay(day, eventDate)) return false;

      const hour = eventDate.getHours();
      if (shift === "MORNING") return hour < 12;
      if (shift === "AFTERNOON") return hour >= 12 && hour < 18;
      if (shift === "EVENING") return hour >= 18;
      return false;
    });
  };

  const getEventColors = (type) => {
    switch (type) {
      case "COMPETITION":
      case "VOLUNTEER":
        return { bg: "bg-[#71c332]", border: "border-[#5ea32a]", text: "text-white" };
      case "WORKSHOP":
      case "SEMINAR":
        return { bg: "bg-[#e8e9ed]", border: "border-[#d1d2d6]", text: "text-[#333]" };
      case "WEBINAR":
        return { bg: "bg-[#81d4fa]", border: "border-[#4fc3f7]", text: "text-[#1a3a6b]" };
      default:
        return { bg: "bg-[#ebf5ff]", border: "border-[#b3d7ff]", text: "text-[#1a3a6b]" };
    }
  };

  const shifts = [
    { key: "MORNING", label: t("shift_morning") },
    { key: "AFTERNOON", label: t("shift_afternoon") },
    { key: "EVENING", label: t("shift_evening") }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 flex flex-col xl:flex-row items-center justify-between gap-4 border-b border-[#dee2e6] bg-white">
        <h2 className="text-xl font-bold text-[#444] shrink-0">
          {t("schedule_weekly_title")}
        </h2>

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
              <CalendarIcon size={14} /> {t("current_btn")}
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="px-4 py-1.5 bg-[#007bff] text-white text-sm font-medium rounded hover:bg-[#0069d9] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ChevronLeft size={14} /> {t("prev_week")}
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="px-4 py-1.5 bg-[#007bff] text-white text-sm font-medium rounded hover:bg-[#0069d9] transition-all flex items-center gap-1.5 shadow-sm"
            >
              {t("next_week")} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-[#f0f7ff]">
              <th className="border border-[#c6e2ff] py-3 text-[#0066cc] font-bold text-sm w-24">
                {t("shift_label")}
              </th>
              {weekDays.map((day, i) => (
                <th key={i} className="border border-[#c6e2ff] py-3 px-2 text-[#0066cc] font-bold text-sm w-[13%]">
                  <div className="mb-1">
                    {i + 1 === 7 ? t("sun") : `${t("mon").split(" ")[0]} ${i + 2}`}
                  </div>
                  <div className="font-normal text-[13px] text-slate-500">{format(day, "dd/MM/yyyy")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.key}>
                <td className="border border-[#c6e2ff] bg-[#fffdf0] p-4 text-center">
                  <span className="font-bold text-[#666] text-sm uppercase">
                    {shift.label}
                  </span>
                </td>
                {weekDays.map((day, i) => {
                  const dayEvents = getEventsForSlot(day, shift.key);
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
                                <div><span className="font-bold">{t("location_label")}:</span> {event.location || "IUH Campus"}</div>
                                <div><span className="font-bold">{t("time_label")}:</span> {format(new Date(event.startTime), "HH:mm")} - {format(new Date(event.endTime), "HH:mm")}</div>
                                <div><span className="font-bold">{t("organizer_label")}:</span> {event.organizerName || "IUH Events"}</div>
                                <div className="italic text-[10px] mt-1 opacity-70">{t("notes_label")}: {event.location}</div>
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

      <div className="p-4 bg-white border-t border-[#dee2e6] flex flex-wrap gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-[#e8e9ed] border border-[#d1d2d6]"></div>
          <span className="text-xs text-slate-600">{t("academic_workshop")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-[#71c332] border border-[#5ea32a]"></div>
          <span className="text-xs text-slate-600">{t("volunteer_competition")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-[#81d4fa] border border-[#4fc3f7]"></div>
          <span className="text-xs text-slate-600">{t("online_webinar")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-[#fffdf0] border border-[#c6e2ff]"></div>
          <span className="text-xs text-slate-600">{t("culture_sports")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-[#ef5350] border border-[#d32f2f]"></div>
          <span className="text-xs text-slate-600">{t("cancelled_suspended")}</span>
        </div>
      </div>
    </div>
  );
};

export default GuestEventsSchedule;
