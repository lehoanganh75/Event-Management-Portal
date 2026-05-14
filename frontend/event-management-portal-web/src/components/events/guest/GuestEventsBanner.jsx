import React from "react";
import { Ticket, Search, Calendar as CalendarIcon } from "lucide-react";

const GuestEventsBanner = ({ stats, viewMode, setViewMode, t }) => {
  return (
    <div className="bg-white border-b border-slate-200/60 pt-10 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Ticket size={18} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                {t("my_events_label") || "SỰ KIỆN CỦA TÔI"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("event_schedule_title") || "Lịch trình Sự kiện"}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {t("event_schedule_subtitle") || "Theo dõi và quản lý các sự kiện bạn đã tham gia"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setViewMode("GRID")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${viewMode === "GRID"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <Search size={14} /> {t("grid_view") || "Dạng lưới"}
              </button>
              <button
                onClick={() => setViewMode("CALENDAR")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${viewMode === "CALENDAR"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <CalendarIcon size={14} /> {t("calendar_view") || "Dạng lịch"}
              </button>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden md:block" />
            <div className="hidden sm:flex items-center gap-3">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm min-w-[120px] text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {t("total_label") || "Tổng cộng"}
                </p>
                <p className="text-2xl font-black text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm min-w-[120px] text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {t("ongoing_label") || "Đang diễn ra"}
                </p>
                <p className="text-2xl font-black text-emerald-600">{stats.ongoing}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestEventsBanner;
