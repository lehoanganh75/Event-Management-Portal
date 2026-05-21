import React from "react";
import { format, isSameDay } from "date-fns";
import { X, Calendar as CalendarIcon, MapPin, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const CalendarModal = ({
  isOpen,
  onClose,
  selectedDay,
  events,
  t,
  getCategoryByEventType,
  categoryColors,
  defaultColor,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#1E40AF] text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {"Sự kiện ngày"} {selectedDay ? format(selectedDay, "dd/MM/yyyy") : ""}
            </h2>
            <p className="text-sm text-blue-100 mt-1">{events.length} events</p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {events.map((event, idx) => {
            const category = event.categoryName || event.category || getCategoryByEventType(event.type, t);
            const bgClass = categoryColors[category] || defaultColor;

            return (
              <Link
                key={idx}
                to={`/events/${event.id}`}
                className="group flex border border-slate-200 rounded-xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className={`w-2 ${bgClass}`} />

                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-[#1E40AF] transition-colors">
                      {event.title}
                    </h3>

                    <span className={`${bgClass} text-white px-2 py-1 rounded-lg text-[10px] font-semibold`}>
                      {category}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                      <CalendarIcon size={15} className="text-[#1E40AF]" />
                      <span>
                        {event.startTime ? (
                          event.endTime && !isSameDay(new Date(event.startTime), new Date(event.endTime))
                            ? `${format(new Date(event.startTime), "HH:mm dd/MM/yyyy")} - ${format(new Date(event.endTime), "HH:mm dd/MM/yyyy")}`
                            : format(new Date(event.startTime), "HH:mm")
                        ) : "N/A"}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-[#1E40AF]" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-[#1E40AF]" />
                      <span>{event.registeredCount || 0} {"người đã đăng ký"}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 flex items-center text-slate-300 group-hover:text-[#1E40AF] transition-colors">
                  <ChevronRight size={18} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition"
          >
            {"Đóng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
