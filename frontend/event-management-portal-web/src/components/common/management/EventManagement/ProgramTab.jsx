import React from "react";
import { Clock, MapPin } from "lucide-react";

const ProgramTab = ({ event }) => {
  return (
    <div className="max-w-5xl mx-auto py-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-sm">
            <Clock size={22} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Lịch trình chi tiết
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {event.sessions?.length || 0} phiên thảo luận
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
          <Clock size={14} className="text-indigo-500" />
          Timeline
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-2 md:pl-4">
        {/* Line */}
        <div className="absolute left-[88px] md:left-[110px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent" />

        {event.sessions?.length > 0 ? (
          <div className="space-y-6">
            {[...event.sessions]
              .sort(
                (a, b) =>
                  new Date(a.startTime) -
                  new Date(b.startTime)
              )
              .map((session, idx) => (
                <div
                  key={idx}
                  className="relative flex items-start gap-5 md:gap-8 group"
                >
                  {/* Time */}
                  <div className="w-[75px] md:w-[90px] shrink-0 pt-1 text-right">
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                      <p className="text-sm font-semibold text-slate-800 tabular-nums">
                        {new Date(
                          session.startTime
                        ).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        →
                        {" "}
                        {new Date(
                          session.endTime
                        ).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-[88px] md:left-[110px] top-5 -ml-[8px] z-10">
                    <div className="w-4 h-4 rounded-full bg-white border-[3px] border-indigo-500 shadow-sm ring-4 ring-indigo-50 group-hover:scale-110 transition-all" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all">
                      {/* Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-transparent to-sky-50/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      {/* Room */}
                      {session.room && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600">
                          <MapPin size={11} />

                          <span className="text-[10px] font-semibold uppercase tracking-wide">
                            {session.room}
                          </span>
                        </div>
                      )}

                      <div className="relative z-10 space-y-4">
                        {/* Top */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold uppercase tracking-wide">
                              Phiên {idx + 1}
                            </span>

                            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                              {session.type || "SESSION"}
                            </span>
                          </div>

                          <h4 className="text-base md:text-lg font-semibold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                            {session.title}
                          </h4>

                          {session.description && (
                            <p className="text-sm leading-7 text-slate-500">
                              {session.description}
                            </p>
                          )}
                        </div>

                        {/* Presenters */}
                        {session.presenters?.length >
                          0 && (
                            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4">
                              {session.presenters.map(
                                (p, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2"
                                  >
                                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white shadow-sm">
                                      <img
                                        src={
                                          p.avatarUrl ||
                                          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                        }
                                        className="w-full h-full object-cover"
                                        alt=""
                                      />
                                    </div>

                                    <div>
                                      <p className="text-sm font-medium text-slate-700 leading-none">
                                        {p.fullName}
                                      </p>

                                      <p className="text-[11px] text-slate-400 mt-1">
                                        Diễn giả
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-slate-50 border border-dashed border-slate-200 rounded-3xl py-20 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Clock size={24} />
            </div>

            <h4 className="text-base font-semibold text-slate-700 mb-1">
              Chưa có lịch trình
            </h4>

            <p className="text-sm text-slate-500">
              Các phiên thảo luận sẽ hiển thị tại đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramTab;
