import React from "react";
import {
  Calendar,
  MapPin,
  FileText,
  MessageSquareQuote,
  Mic2,
} from "lucide-react";

const InvitationEventDetails = ({
  invitation,
  formatDate,
  isPresenter,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold uppercase tracking-wider mb-4">
          Chi tiết sự kiện
        </span>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
          {invitation.event?.title}
        </h2>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Thời gian
            </p>

            <p className="text-sm font-semibold text-slate-700">
              {formatDate(invitation.event?.startTime)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <MapPin size={20} />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Địa điểm
            </p>

            <p className="text-sm font-semibold text-slate-700 line-clamp-2">
              {invitation.event?.location || "Trực tuyến"}
            </p>
          </div>
        </div>
      </div>

      {/* Topic */}
      {invitation.event?.eventTopic && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-indigo-500" />

            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Chủ đề chính
            </h3>
          </div>

          <p className="text-slate-700 leading-relaxed">
            {invitation.event.eventTopic}
          </p>
        </div>
      )}

      {/* Description */}
      {invitation.event?.description && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-slate-500" />

            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Mô tả sự kiện
            </h3>
          </div>

          <div className="text-sm text-slate-600 leading-7 whitespace-pre-wrap">
            {invitation.event.description}
          </div>
        </div>
      )}

      {/* Sender message */}
      {invitation.message && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareQuote
              size={18}
              className="text-indigo-500"
            />

            <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">
              Lời nhắn từ người gửi
            </h3>
          </div>

          <p className="text-sm text-slate-600 italic leading-7">
            “{invitation.message}”
          </p>
        </div>
      )}

      {/* Presenter */}
      {isPresenter && invitation.presenterSession && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mic2 size={18} className="text-indigo-500" />

            <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">
              Chủ đề thuyết trình
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shrink-0">
              {invitation.presenterSession === "ALL"
                ? "✨"
                : "🎙️"}
            </div>

            <p className="font-semibold text-slate-700">
              {invitation.presenterSession === "ALL"
                ? "Đảm nhận toàn bộ phiên chương trình"
                : invitation.presenterSession}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationEventDetails;
