import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ChevronRight, CheckCircle2, Sparkles, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  PUBLISHED: { label: "Sắp diễn ra", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  ONGOING: { label: "Đang diễn ra", color: "text-emerald-600", bg: "bg-emerald-50", icon: Sparkles },
  COMPLETED: { label: "Đã kết thúc", color: "text-slate-600", bg: "bg-slate-50", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", color: "text-rose-600", bg: "bg-rose-50", icon: XCircle },
};

const GuestEventCard = ({ event, index, onClick, t }) => {
  const status = STATUS_CONFIG[event.status] || STATUS_CONFIG.PUBLISHED;
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200/60 cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.coverImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80"}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <div className={`${status.bg} ${status.color} px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1.5 backdrop-blur-md shadow-sm border border-white/20`}>
            <StatusIcon size={12} />
            {status.label}
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>{event.type || (t ? t('event') : 'Sự kiện')}</span>
          <span>•</span>
          <span>{new Date(event.startTime).toLocaleDateString('vi-VN')}</span>
        </div>
        
        <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors mb-4">
          {event.title}
        </h3>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <MapPin size={14} className="text-slate-400" />
            <span className="line-clamp-1">{event.location || "IUH Campus"}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Clock size={14} className="text-slate-400" />
            <span>
              {new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              {" - "}
              {new Date(event.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-indigo-600">
          <span>{t ? t('view_details') : 'Xem chi tiết'}</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export default GuestEventCard;
