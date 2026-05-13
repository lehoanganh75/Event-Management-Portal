import React from "react";
import { Users, MapPin, Info, Mail, Phone } from "lucide-react";

const EventInfo = ({ event, language, t }) => {
  return (
    <div className="lg:col-span-8 space-y-6">
      {/* GIỚI THIỆU */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Info size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {t("event_intro")}
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Tổng quan thông tin sự kiện
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
            <p className="text-sm leading-7 text-slate-600 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Đối tượng */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-indigo-500" />

              <h3 className="text-sm font-semibold text-slate-700">
                {t("target_audience")}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {event.targetobjects?.length > 0 ? (
                event.targetobjects.map((target, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium hover:bg-indigo-100 transition-colors"
                  >
                    {target.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400 italic">
                  {t("everyone_welcome")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LỊCH TRÌNH */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("detailed_schedule")}
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Timeline chương trình
            </p>
          </div>

          <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600">
            {event.sessions?.length || 0} {t("sessions_count")}
          </div>
        </div>

        {/* Content */}
        <div className="divide-y divide-slate-100">
          {event.sessions?.length > 0 ? (
            event.sessions.map((session, index) => (
              <div
                key={session.id}
                className="p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Time */}
                  <div className="md:w-24 shrink-0">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-indigo-700">
                        {new Date(session.startTime).toLocaleTimeString(
                          language === "VI" ? "vi-VN" : "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit"
                          }
                        )}
                      </p>

                      <p className="text-[11px] text-indigo-400 mt-1">
                        {new Date(session.endTime).toLocaleTimeString(
                          language === "VI" ? "vi-VN" : "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit"
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-semibold uppercase">
                        {index === 0
                          ? t("session_start")
                          : index === event.sessions.length - 1
                            ? t("session_end")
                            : t("session_normal")}
                      </span>

                      {session.room && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin
                            size={12}
                            className="text-rose-500"
                          />

                          {session.room}
                        </div>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-800 mb-2">
                      {session.title}
                    </h4>

                    <p className="text-sm text-slate-500 leading-6">
                      {session.description}
                    </p>

                    {session.presenter && (
                      <div className="flex items-center gap-3 mt-4">
                        <img
                          src={
                            session.presenter.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${session.presenter.fullName}&background=random`
                          }
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />

                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {session.presenter.fullName}
                          </p>

                          <p className="text-xs text-slate-400">
                            Diễn giả
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-14 text-center">
              <Info
                className="mx-auto text-slate-300 mb-3"
                size={34}
              />

              <p className="text-sm text-slate-400">
                Lịch trình đang được cập nhật...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DIỄN GIẢ */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Users size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {t("presenters_guests")}
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Chuyên gia & khách mời
              </p>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-6">
          {event.presenters?.length > 0 ? (
            <div className="space-y-4">
              {event.presenters.map((presenter, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-100 hover:bg-white transition-all"
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={
                        presenter.profile?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${presenter.id}&background=random`
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-slate-800">
                        {presenter.profile?.fullName ||
                          "Chuyên gia khách mời"}
                      </h4>

                      <span className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-semibold uppercase">
                        {presenter.role || "Diễn giả"}
                      </span>
                    </div>

                    {presenter.profile?.bio && (
                      <p className="text-sm text-slate-500 leading-6 mb-4">
                        {presenter.profile.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4">
                      {presenter.profile?.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail
                            size={13}
                            className="text-indigo-500"
                          />

                          {presenter.profile.email}
                        </div>
                      )}

                      {presenter.profile?.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone
                            size={13}
                            className="text-emerald-500"
                          />

                          {presenter.profile.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users
                size={34}
                className="mx-auto text-slate-300 mb-3"
              />

              <p className="text-sm text-slate-400">
                Danh sách diễn giả sẽ sớm được cập nhật.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventInfo;