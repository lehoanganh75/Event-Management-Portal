import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const CalendarHeader = ({
  currentDate,
  prevMonth,
  nextMonth,
  language,
  locale,
}) => {
  return (
    <div className="flex items-center justify-center gap-5 mb-6">
      <button
        onClick={prevMonth}
        className="
          w-10 h-10
          rounded-xl
          border border-slate-200
          bg-white
          flex items-center justify-center
          text-slate-600
          hover:border-blue-200
          hover:text-[#1E40AF]
          transition-all
        "
      >
        <ChevronLeft size={20} />
      </button>

      <div
        className="
          text-2xl
          font-bold
          text-slate-800
          tracking-tight
        "
      >
        {language === "VI"
          ? `Tháng ${format(currentDate, "MM", {
            locale,
          })} - ${format(currentDate, "yyyy")}`
          : `${format(currentDate, "MMMM", {
            locale,
          })} ${format(currentDate, "yyyy")}`}
      </div>

      <button
        onClick={nextMonth}
        className="
          w-10 h-10
          rounded-xl
          border border-slate-200
          bg-white
          flex items-center justify-center
          text-slate-600
          hover:border-blue-200
          hover:text-[#1E40AF]
          transition-all
        "
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default CalendarHeader;
