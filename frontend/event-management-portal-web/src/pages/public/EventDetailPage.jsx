import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  XCircle,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import AIChatBot from "../../components/chat/AIChatBot";
import eventService from "../../services/eventService";
import TicketDetail from "../../components/ticket/TicketDetail";
import RegisterModal from "../../components/common/RegisterModal";
import QRScannerModal from "../../components/common/management/QRScannerModal";
import QuizModal from "../../components/quiz/QuizModal";
import SurveyModal from "../../components/survey/SurveyModal";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useQuiz } from "../../hooks/useQuiz";
import { Sparkles, Trophy, ClipboardCheck } from "lucide-react";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSystemAdmin = () => {
    const roles = user?.roles || (user?.role ? [user.role] : []);
    return roles.some(r => ["SUPER_ADMIN", "ADMIN"].includes(r?.toUpperCase()));
  };

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [joiningQuizId, setJoiningQuizId] = useState(null);
  const [registrationError, setRegistrationError] = useState("");

  const { quizState, activeQuizId } = useQuiz(eventId);
  const isQuizLive = ['START', 'NEXT_QUESTION', 'LEADERBOARD'].includes(quizState.type);

  useEffect(() => {
    if (eventId) {
      eventService.getQuizzesByEvent(eventId)
        .then(res => setQuizzes(res.data || []))
        .catch(() => { });
    }
  }, [eventId]);

  // Auto-open quiz modal when START event received and student already in lobby
  useEffect(() => {
    if (quizState.type === 'START' && showQuizModal) {
      setJoiningQuizId(activeQuizId);
    }
  }, [quizState.type]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventById(eventId);
      setEvent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  const formatDateTime = (iso) => {
    if (!iso) return "Chưa cập nhật";
    const d = new Date(iso);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • ${d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  const handleMainAction = async () => {
    if (!event) return;
    const role = event.currentUserRole || {};
    const hasAdminAccess = isSystemAdmin();

    if (role.creator || role.approver || role.organizerRole || hasAdminAccess) {
      const orgRole = (role.organizerRole || "").toLowerCase();

      // Super Admin/Admin mặc định vào view Leader để quản lý cao nhất
      if (hasAdminAccess || orgRole === "leader" || role.creator || role.approver) {
        navigate(`/events/${event.id}/v3/leader`);
      } else if (orgRole === "coordinator") {
        navigate(`/events/${event.id}/v3/coordinator`);
      } else if (orgRole === "member") {
        navigate(`/events/${event.id}/v3/member`);
      } else if (orgRole === "advisor") {
        navigate(`/events/${event.id}/v3/advisor`);
      } else {
        // Mặc định hoặc các role khác (Advisor...)
        navigate(`/manage-event/${event.id}`);
      }
      return;
    }

    if (role.registered) {
      if (role.registration?.checkedIn) {
        toast.info("Bạn đã điểm danh thành công cho sự kiện này rồi!");
        return;
      }

      if (!event.checkInEnabled) {
        toast.warning("Ban tổ chức hiện đang đóng cổng điểm danh. Vui lòng thử lại sau vài giây.");
        fetchEvent(); // Tự động làm mới dữ liệu
        return;
      }

      const now = new Date();
      const openTime = new Date(new Date(event.startTime).getTime() - 30 * 60000);
      if (now < openTime) {
        toast.warning(`Hệ thống điểm danh sẽ mở lúc ${openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        return;
      }

      setShowScanner(true);
      return;
    }

    setRegistrationError("");
    setShowRegisterModal(true);
  };

  const confirmRegistration = async () => {
    setIsRegistering(true);
    setRegistrationError("");
    try {
      await eventService.registerEvent(event.id);
      toast.success("Đăng ký thành công!");
      setShowRegisterModal(false);
      await fetchEvent(); // Refresh để cập nhật role
      setShowTicket(true);
    } catch (error) {
      console.error("Registration error:", error);
      const data = error.response?.data;
      const msg = data?.message || data?.error || error.message || "Đăng ký thất bại";
      setRegistrationError(msg);
      toast.error(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleScanSuccess = async (token) => {
    setShowScanner(false);
    try {
      const res = await eventService.checkInByEventToken(token);
      toast.success(res.data.message || "Điểm danh thành công!");
      await fetchEvent(); // Refresh to update check-in status
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã QR không hợp lệ hoặc đã hết hạn");
    }
  };

  const handleCancelRegistration = async () => {
    setIsRegistering(true);
    try {
      await eventService.cancelRegistration(event.id);
      toast.success("Đã hủy đăng ký thành công");
      setShowCancelModal(false);
      await fetchEvent();
      setShowTicket(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Hủy đăng ký thất bại");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">Không tìm thấy sự kiện</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const role = event.currentUserRole || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <AIChatBot />

      {/* ==================== HERO SECTION ==================== */}
      <div className="relative h-[460px] overflow-hidden">
        <img
          src={event.coverImage || "https://via.placeholder.com/1200x600/1a1a2e/ffffff?text=IUH+Event"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/90 hover:bg-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg z-20"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <div className="inline-block bg-orange-500 text-white text-sm font-bold px-6 py-1.5 rounded-full mb-4">
            {event.type || "SỰ KIỆN"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">{event.title}</h1>
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              {formatDateTime(event.startTime)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={20} />
              {event.location} {event.eventMode ? `• ${event.eventMode}` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 relative z-10 pb-12 flex-grow">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">

            {/* Thông tin chi tiết */}
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Thông tin chi tiết</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
              {event.notes && (
                <div className="mt-6 bg-amber-50 border border-amber-200 p-5 rounded-2xl flex gap-4">
                  <Clock className="text-amber-600 mt-1" size={24} />
                  <div>
                    <p className="font-semibold text-amber-800">Lưu ý quan trọng</p>
                    <p className="text-amber-700">{event.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Diễn giả */}
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h3 className="font-semibold text-xl mb-4">Diễn giả</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {event.presenters && event.presenters.length > 0 ? (
                  event.presenters.map((presenter, index) => (
                    <div key={index} className="flex gap-4 bg-gray-50 p-5 rounded-2xl">
                      <img
                        src={presenter.avatarUrl || "https://via.placeholder.com/80x80"}
                        alt={presenter.fullName}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div>
                        <p className="font-bold">{presenter.fullName}</p>
                        <p className="text-sm text-gray-600">{presenter.position}</p>
                        <p className="text-xs text-gray-500 mt-1">{presenter.department}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Chưa có thông tin diễn giả</p>
                )}
              </div>
            </div>

            {/* Lịch trình */}
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-6">Lịch trình sự kiện</h2>
              <div className="space-y-6">
                {event.sessions && event.sessions.length > 0 ? (
                  event.sessions
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((session) => {
                      const start = new Date(session.startTime);
                      const end = new Date(session.endTime);
                      return (
                        <div key={session.id} className="flex gap-6 border-l-4 border-blue-500 pl-6 py-1">
                          <div className="w-28 flex-shrink-0">
                            <div className="font-mono text-sm font-semibold text-gray-800">
                              {start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                              {" - "}
                              {end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {start.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg leading-tight">{session.title}</h4>
                              <span className={`text-xs font-medium px-3 py-1 rounded-full ${session.type === "KEYNOTE" ? "bg-purple-100 text-purple-700" :
                                session.type === "WORKSHOP" ? "bg-blue-100 text-blue-700" :
                                  session.type === "BREAK" ? "bg-amber-100 text-amber-700" :
                                    "bg-gray-100 text-gray-600"
                                }`}>
                                {session.type}
                              </span>
                            </div>
                            <p className="text-gray-600 text-[15px] leading-relaxed">{session.description}</p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                              <MapPin size={16} />
                              <span>{session.room}</span>
                              {session.maxParticipants && (
                                <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  Tối đa {session.maxParticipants} người
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    Chưa có lịch trình sự kiện nào được cập nhật.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-8">
              {/* Số lượng tham gia */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Số lượng tham gia</span>
                  <span className="font-semibold text-gray-800">
                    {event.registeredCount || 0} / {event.maxParticipants || 500}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(((event.registeredCount || 0) / (event.maxParticipants || 500)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Nút hành động */}
              <button
                onClick={handleMainAction}
                disabled={
                  isRegistering ||
                  (!role.registered && !role.creator && !role.approver && !role.organizerRole &&
                    isDeadlinePassed(event.registrationDeadline))
                }
                className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${role.creator || role.approver || role.organizerRole || isSystemAdmin()
                  ? "bg-zinc-900 text-white"
                  : role.registered
                    ? showTicket
                      ? "bg-slate-100 text-slate-600 border border-slate-200"
                      : "bg-emerald-600 text-white"
                    : isDeadlinePassed(event.registrationDeadline)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white shadow-blue-200"
                  }`}
              >
                {isRegistering ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : role.creator || role.approver || role.organizerRole || isSystemAdmin() ? (
                  "QUẢN LÝ SỰ KIỆN"
                ) : role.registered && role.registration?.status !== "CANCELLED" ? (
                  <>
                    {role.registration?.checkedIn ? (
                      "ĐÃ ĐIỂM DANH ✓"
                    ) : !event.checkInEnabled ? (
                      "ĐIỂM DANH ĐANG ĐÓNG"
                    ) : new Date() < new Date(new Date(event.startTime).getTime() - 30 * 60000) ? (
                      `MỞ ĐIỂM DANH LÚC ${new Date(new Date(event.startTime).getTime() - 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    ) : (
                      "QUÉT MÃ ĐIỂM DANH"
                    )}
                    <motion.div animate={{ rotate: showTicket ? 180 : 0 }}>
                      <QrCode size={22} />
                    </motion.div>
                  </>
                ) : isDeadlinePassed(event.registrationDeadline) ? (
                  "HẾT HẠN ĐĂNG KÝ"
                ) : (
                  "ĐĂNG KÝ THAM GIA"
                )}
              </button>

              {role.registered && role.registration?.status !== "CANCELLED" && !showTicket && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={isRegistering}
                  className="w-full mt-3 py-3 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                >
                  Hủy đăng ký tham gia
                </button>
              )}

              {/* Tham gia thử thách */}
              {event.currentUserRole?.registered && quizzes.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 shadow-xl shadow-indigo-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy size={24} className="text-amber-300" fill="currentColor" />
                    <span className="font-black text-white uppercase tracking-tight">Thử thách tương tác</span>
                  </div>
                  <div className="space-y-2">
                    {quizzes.map(quiz => (
                      <button
                        key={quiz.id}
                        onClick={() => { setJoiningQuizId(quiz.id); setShowQuizModal(true); }}
                        className="w-full flex items-center justify-between bg-white/15 hover:bg-white/25 text-white rounded-2xl px-4 py-3 transition-all font-bold text-sm"
                      >
                        <span>{quiz.title}</span>
                        {quiz.isActive
                          ? <span className="text-[10px] font-black bg-emerald-400 text-white px-2 py-0.5 rounded-md animate-pulse">ĐANG DIỄN RA</span>
                          : <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md">THAM GIA</span>
                        }
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Khảo sát */}
              <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="text-green-600" size={24} />
                  <span className="font-semibold">Tham gia tương tác</span>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                  Đặt câu hỏi và tham gia bình chọn ngay trong ngày hội thảo
                </p>
                <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-medium hover:brightness-105 transition">
                  Đặt câu hỏi
                </button>
              </div>
            </div>

            {/* Vé */}
            {showTicket && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                id="ticket-section"
                className="pt-4"
              >
                <TicketDetail eventId={event.id} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onConfirm={confirmRegistration}
        event={event}
        isRegistering={isRegistering}
        error={registrationError}
      />

      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hủy đăng ký?</h3>
              <p className="text-gray-500 text-sm mb-8">
                Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleCancelRegistration}
                  disabled={isRegistering}
                  className="flex-1 py-3.5 bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isRegistering ? "Đang xử lý..." : "Xác nhận hủy"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTONS FOR QUIZ/SURVEY */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-[99]">
        {isQuizLive && (
          <motion.button
            initial={{ scale: 0, x: 100 }}
            animate={{ scale: 1, x: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowQuizModal(true)}
            className="w-16 h-16 bg-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white animate-bounce"
          >
            <Trophy size={24} />
          </motion.button>
        )}

        {event.currentUserRole?.registered && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowSurveyModal(true)}
            className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white"
          >
            <ClipboardCheck size={24} />
          </motion.button>
        )}
      </div>

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => { setShowQuizModal(false); setJoiningQuizId(null); }}
        eventId={eventId}
        quizId={joiningQuizId}
        isOrganizer={false}
      />

      <SurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        eventId={eventId}
      />
    </div>
  );
}
