import React from "react";
import { Clock, MapPin } from "lucide-react";

const ProgramTab = ({ event }) => {
  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Lịch trình chi tiết</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {event.sessions?.length || 0} phiên thảo luận
            </p>
          </div>
        </div>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-y-0 before:left-[90px] md:before:left-[110px] before:w-[2px] before:bg-slate-50">
        {event.sessions?.length > 0 ? [...event.sessions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map((session, idx) => (
          <div key={idx} className="relative flex items-start gap-6 md:gap-10 group">
            {/* Time Column */}
            <div className="w-[80px] md:w-[90px] flex-shrink-0 pt-2 text-right">
              <div className="space-y-0.5">
                <p className="text-sm font-black text-slate-900 tabular-nums">
                  {new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[10px] font-bold text-slate-400 tabular-nums">
                  đến {new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Timeline Node */}
            <div className="absolute left-[90px] md:left-[110px] top-[14px] -ml-[7px] w-3.5 h-3.5 rounded-full bg-white border-[3px] border-indigo-600 z-10 shadow-sm transition-all duration-300 ring-4 ring-white" />

            {/* Card Content */}
            <div className="flex-1 pb-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-indigo-100/20 transition-all duration-300 relative overflow-hidden">
                {/* Room Tag */}
                {session.room && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-slate-50 border-bl border-slate-50 rounded-bl-xl flex items-center gap-1.5">
                    <MapPin size={10} className="text-rose-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{session.room}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        PHIÊN {idx + 1}
                      </span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">/ {session.type || "SESSION"}</span>
                    </div>
                    <h4 className="text-base font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                      {session.title}
                    </h4>
                    {session.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {session.description}
                      </p>
                    )}
                  </div>

                  {session.presenters?.length > 0 && (
                    <div className="pt-2 border-t border-slate-50 flex flex-wrap gap-4">
                      {session.presenters.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-white shadow-sm">
                            <img 
                              src={p.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                              className="w-full h-full object-cover" 
                              alt="" 
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-700 leading-none">{p.fullName}</span>
                            <span className="text-[8px] text-slate-400 font-medium">Diễn giả</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Chưa có thông tin chương trình.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramTab;
