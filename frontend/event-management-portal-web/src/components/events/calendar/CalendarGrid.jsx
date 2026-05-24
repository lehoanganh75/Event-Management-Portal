import React from "react";
import { format, isSameMonth, isSameDay, addDays } from "date-fns";
import { Link } from "react-router-dom";

const normalizeDate = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const isMultiDayEvent = (event) => {
  if (!event.startTime || !event.endTime) return false;

  return !isSameDay(
    new Date(event.startTime),
    new Date(event.endTime)
  );
};

const getEventLayoutInfo = (event, currentDay) => {
  if (!event.startTime || !event.endTime) {
    return {
      marginClass: "mx-0",
      roundedClass: "rounded-lg",
      showTitle: true,
      isRangeLine: false,
    };
  }

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  if (isSameDay(start, end)) {
    return {
      marginClass: "mx-0",
      roundedClass: "rounded-lg",
      showTitle: true,
      isRangeLine: false,
    };
  }

  const dDate = normalizeDate(currentDay);
  const sDate = normalizeDate(start);
  const eDate = normalizeDate(end);

  const isStart = isSameDay(dDate, sDate);
  const isEnd = isSameDay(dDate, eDate);

  if (isStart) {
    return {
      marginClass: "-mr-2 ml-0",
      roundedClass: "rounded-l-lg rounded-r-none",
      showTitle: true,
      isRangeLine: false,
    };
  }

  if (isEnd) {
    return {
      marginClass: "-ml-2 mr-0",
      roundedClass: "rounded-r-lg rounded-l-none",
      showTitle: false,
      isRangeLine: true,
    };
  }

  return {
    marginClass: "-mx-2",
    roundedClass: "rounded-none",
    showTitle: false,
    isRangeLine: true,
  };
};

const getEventDisplayTitle = (event, currentDay) => {
  if (!event.startTime || !event.endTime) {
    return event.title;
  }

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  if (isSameDay(start, end)) {
    return event.title;
  }

  const dDate = normalizeDate(currentDay);
  const sDate = normalizeDate(start);

  if (isSameDay(dDate, sDate)) {
    return event.title;
  }

  return "";
};

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
  const daysHeader = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    let rowCount = 0;
    while (day <= endDate) {
      rowCount++;
      const currentWeekRow = rowCount;
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, "d");
        const dayEvents = getEventsForDay(day);
        const isBottomHalf = currentWeekRow >= 4;

        days.push(
          <div
            key={day.toString()}
            onClick={() => handleDayClick(cloneDay, dayEvents)}
            className={`
              min-h-[130px]
              border border-slate-200
              p-2
              bg-white
              flex flex-col
              transition-all
              hover:bg-slate-50
              cursor-pointer
              overflow-visible
              relative
              hover:z-20
              ${!isSameMonth(day, monthStart) ? "opacity-40" : ""}
              ${
                isSameDay(day, new Date())
                  ? "bg-blue-50 border-blue-200"
                  : ""
              }
            `}
          >
            {/* Day Number */}
            <div className="flex justify-end mb-2">
              <span
                className={`
                  text-sm font-semibold
                  ${
                    isSameDay(day, new Date())
                      ? "text-[#1E40AF]"
                      : "text-slate-700"
                  }
                `}
              >
                {formattedDate}
              </span>
            </div>

            {/* Events */}
            <div className="space-y-1 overflow-visible">
              {dayEvents.slice(0, 4).map((event, idx) => {
                const category =
                  event.categoryName ||
                  event.category ||
                  getCategoryByEventType(event.type, t);

                const bgClass =
                  categoryColors[category] || defaultColor;

                const layout = getEventLayoutInfo(event, day);

                const title = getEventDisplayTitle(event, day);

                const multiDay = isMultiDayEvent(event);

                return (
                  <Link
                    key={`${event.id || idx}-${day.toString()}`}
                    to={`/events/${event.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                      ${bgClass}
                      ${layout.marginClass}
                      ${layout.roundedClass}
                      group
                      relative
                      block
                      h-[26px]
                      px-2
                      text-left
                      text-white
                      transition-all
                      hover:brightness-95
                      overflow-visible
                      z-10
                      hover:z-30
                    `}
                  >
                    {layout.showTitle ? (
                      <div className="flex h-full items-center min-w-0">
                        <span
                          className="
                            text-[11px]
                            font-semibold
                            whitespace-nowrap
                            overflow-hidden
                            text-ellipsis
                            flex-1
                          "
                        >
                          {title}
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="h-[2px] w-full rounded-full bg-white/80" />
                      </div>
                    )}

                    <div
                      className={`
                        pointer-events-none
                        absolute
                        left-0
                        z-[999]
                        hidden
                        w-max
                        max-w-[320px]
                        rounded-lg
                        bg-slate-900
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-white
                        shadow-2xl
                        group-hover:block
                        whitespace-normal
                        break-words
                        ${isBottomHalf ? "bottom-full mb-1" : "top-full mt-1"}
                      `}
                    >
                      <div className="font-semibold">
                        {event.title}
                      </div>

                      {event.startTime && event.endTime && (
                        <div className="mt-1 text-[11px] text-slate-300">
                          {format(new Date(event.startTime), "dd/MM/yyyy HH:mm")}{" "}
                          →{" "}
                          {format(new Date(event.endTime), "dd/MM/yyyy HH:mm")}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* More Events */}
              {dayEvents.length > 4 && (
                <div
                  className="
                    text-[11px]
                    font-medium
                    text-[#1E40AF]
                    bg-blue-50
                    rounded-lg
                    px-2
                    py-1
                    text-center
                  "
                >
                  + {dayEvents.length - 4} sự kiện khác
                </div>
              )}
            </div>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div
          className="grid grid-cols-7"
          key={day.toString()}
        >
          {days}
        </div>
      );

      days = [];
    }

    return rows;
  };

  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-2xl
        overflow-x-auto
        no-scrollbar
        shadow-sm
      "
    >
      <div className="min-w-[800px] md:min-w-0">
        {/* Header */}
        <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200">
          {daysHeader.map((day, idx) => (
            <div
              key={idx}
              className="
                py-3
                text-center
                text-sm
                font-semibold
                text-slate-600
              "
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div>{renderCells()}</div>
      </div>
    </div>
  );
};

export default CalendarGrid;