import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  QrCode,
  Camera,
  Trophy,
  ClipboardCheck,
  MessageCircle,
  Star,
  Zap,
  ChevronRight,
} from "lucide-react";

const EventSidebar = ({
  event,
  role,
  t,
  isSystemAdmin,
  isRegistering,
  isDeadlinePassed,
  handleMainAction,
  setShowCancelModal,
  showTicket,
  isQuizLive,
  setShowQuizModal,
  setJoiningQuizId,
  quizState,
  wsActiveQuizId,
  setShowJoinCodeModal,
  setShowSurveyModal,
  setShowQAModal,
  setShowFeedbackModal,
}) => {
  console.log("event sidebar", event);
  const isInTeam = !!(role?.creator || role?.approver || role?.organizerRole);
  return (
    <div className="lg:col-span-4 space-y-5">
      {/* ORGANIZATION */}
      {event.organization && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-4">
            {"Đơn vị tổ chức"}
          </p>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100">
              {(event.organization.logoUrl || event.organization.logourl) ? (
                <img
                  src={event.organization.logoUrl || event.organization.logourl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <ShieldCheck size={22} className="text-indigo-600" />
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800">
                {event.organization.name}
              </h4>

              <span className="inline-flex mt-1 px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium">
                {event.organization.type || "Organization"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-2xl font-bold text-indigo-600">
              {"Miễn phí"}
            </p>

            <p className="text-[11px] text-gray-500 mt-1">
              {"Sự kiện nội bộ"}
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <QrCode size={20} />
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  ((event.registeredCount || 0) /
                    (event.maxParticipants || 1)) *
                  100,
                  100
                )}%`,
              }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div>
              <p className="text-[10px] text-gray-500 uppercase">
                {"Tổng cộng"}
              </p>

              <p className="text-sm font-semibold text-gray-800 mt-1">
                {event.maxParticipants}
              </p>
            </div>

            <div className="border-x border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase">
                {"Đã đăng ký"}
              </p>

              <p className="text-sm font-semibold text-emerald-600 mt-1">
                {event.registeredCount}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 uppercase">
                {"Thời hạn"}
              </p>

              <p className="text-[11px] font-medium text-gray-700 mt-1">
                {event.registrationDeadline && !isNaN(new Date(event.registrationDeadline).getTime())
                  ? new Date(event.registrationDeadline).toLocaleDateString("vi-VN")
                  : "Không giới hạn"}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN ACTION */}
        <button
          onClick={handleMainAction}
          disabled={
            isRegistering ||
            ((!role.registered ||
              role.registration?.status === "CANCELLED") &&
              !isInTeam &&
              isDeadlinePassed(event.registrationDeadline))
          }
          className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${isInTeam
            ? "bg-gray-900 text-white"
            : role.registered
              ? role.registration?.checkedIn
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
              : isDeadlinePassed(event.registrationDeadline)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
        >
          {isRegistering ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isInTeam ? (
            <>
              <ShieldCheck size={18} />
              {"Bảng điều khiển BTC"}
            </>
          ) : role.registered &&
            role.registration?.status !== "CANCELLED" ? (
            <>
              {role.registration?.checkedIn ? (
                <>
                  <QrCode size={18} />
                  {"Đã điểm danh ✓"}
                </>
              ) : (
                <>
                  <Camera size={18} />
                  {"Quét mã điểm danh"}
                </>
              )}
            </>
          ) : isDeadlinePassed(event.registrationDeadline) ? (
            "Hết hạn đăng ký"
          ) : (
            "Đăng ký ngay"
          )}
        </button>

        {/* CANCEL */}
        {role.registered &&
          role.registration?.status !== "CANCELLED" &&
          !showTicket && (
            <div className="mt-3">
              {role.registration?.checkedIn ? (
                <div className="text-center text-[11px] text-emerald-600">
                  Không thể hủy sau khi điểm danh
                </div>
              ) : new Date(event.startTime) - new Date() >
                30 * 60 * 1000 ? (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full text-sm text-rose-500 hover:text-rose-600"
                >
                  {"Hủy đăng ký tham gia"}
                </button>
              ) : (
                <div className="text-center text-[11px] text-gray-400">
                  Quá hạn hủy đăng ký
                </div>
              )}
            </div>
          )}

        {/* INTERACTIONS */}
        {((role.registered && role.registration?.status !== "CANCELLED") ||
          isInTeam) && (
            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">


              <button
                onClick={() => setShowJoinCodeModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all"
              >
                <Trophy size={18} />
                Trò chơi tương tác
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowSurveyModal(true)}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-2">
                    <ClipboardCheck size={18} />
                  </div>

                  <p className="text-xs font-medium text-gray-700">
                    Khảo sát
                  </p>
                </button>

                <button
                  onClick={() => setShowQAModal(true)}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-2">
                    <MessageCircle size={18} />
                  </div>

                  <p className="text-xs font-medium text-gray-700">
                    Hỏi đáp
                  </p>
                </button>
              </div>
            </div>
          )}
      </div>

      {/* FEATURE CARD */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-4">
          <Zap size={20} />
        </div>

        <h4 className="text-lg font-semibold mb-2">
          IUH Event Portal
        </h4>

        <p className="text-sm text-indigo-100 leading-relaxed mb-5">
          Hệ thống quản lý sự kiện với QR check-in, khảo sát,
          Q&A và trò chơi tương tác.
        </p>

        <button className="flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all">
          {"Tìm hiểu thêm"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default EventSidebar;
