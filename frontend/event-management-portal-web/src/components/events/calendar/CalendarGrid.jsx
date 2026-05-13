import React from "react";
import { format, isSameMonth, isSameDay, addDays } from "date-fns";
import { Link } from "react-router-dom";

const CalendarGrid = ({
  startDate,
  endDate,
  monthStart,
  t,
  getEventsForDay,
  handleDayClick,
  getCategoryByEventType,
  categoryColors,
  defaultColor,
}) => {
  const daysHeader = [t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat"), t("sun")];

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, "d");
        const dayEvents = getEventsForDay(day);

        days.push(
          <div
            key={day.toString()}
            onClick={() => handleDayClick(cloneDay, dayEvents)}
            className={`
              min-h-[130px] border border-slate-200 p-2 bg-white flex flex-col transition-all hover:bg-slate-50 cursor-pointer
              ${!isSameMonth(day, monthStart) ? "opacity-40" : ""}
              ${isSameDay(day, new Date()) ? "bg-blue-50 border-blue-200" : ""}
            `}
          >
            <div className="flex justify-end mb-2">
              <span className={`text-sm font-semibold ${isSameDay(day, new Date()) ? "text-[#1E40AF]" : "text-slate-700"}`}>
                {formattedDate}
              </span>
            </div>

            <div className="space-y-1">
              {dayEvents.slice(0, 4).map((event, idx) => {
                const category = event.categoryName || event.category || getCategoryByEventType(event.type, t);
                const bgClass = categoryColors[category] || defaultColor;

                return (
                  <Link
                    key={idx}
                    to={`/events/${event.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                      ${bgClass} text-white px-2 py-1.5 rounded-lg block text-[11px] font-medium truncate hover:opacity-90 transition
                    `}
                  >
                    {event.title}
                  </Link>
                );
              })}

              {dayEvents.length > 4 && (
                <div className="text-[11px] font-medium text-[#1E40AF] bg-blue-50 rounded-lg px-2 py-1 text-center">
                  + {dayEvents.length - 4} {t("more_events")}
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return rows;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Days Header */}
      <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200">
        {daysHeader.map((day, idx) => (
          <div key={idx} className="py-3 text-center text-sm font-semibold text-slate-600">
            {day}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div>{renderCells()}</div>
    </div>
  );
};

export default CalendarGrid;
