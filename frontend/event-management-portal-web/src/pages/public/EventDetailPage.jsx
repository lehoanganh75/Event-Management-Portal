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
import { motion } from "framer-motion";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import AIChatBot from "../../components/chat/AIChatBot";
import eventService from "../../services/eventService";
import TicketDetail from "../../components/ticket/TicketDetail";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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

    if (role.creator || role.approver || role.organizer) {
      // Điều hướng dựa trên vai trò hệ thống
      const systemRole = event.currentUserRole?.systemRole || "STUDENT";
      if (systemRole === "ADMIN" || systemRole === "SUPER_ADMIN") {
        navigate(`/admin/events/${event.id}`);
      } else {
        navigate(`/lecturer/events/${event.id}`);
      }
      return;
    }

    if (role.registered) {
      setShowTicket(!showTicket);
      if (!showTicket) {
        setTimeout(() => {
          document.getElementById("ticket-section")?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 100);
      }
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmRegister = async () => {
    setShowConfirmModal(false);
    setIsRegistering(true);
    try {
      await eventService.registerEvent(event.id);
      setShowSuccessModal(true);
      await fetchEvent(); // Refresh để cập nhật role
      setShowTicket(true);
    } catch (error) {
      alert(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await eventService.cancelRegistration(event.id);
      setShowCancelModal(false);
      setShowTicket(false);
      await fetchEvent();
    } catch (error) {
      alert(error.response?.data?.message || "Hủy đăng ký thất bại");
    } finally {
      setIsCancelling(false);
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
                  (!role.registered && !role.creator && !role.approver && !role.organizer &&
                    isDeadlinePassed(event.registrationDeadline))
                }
                className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${role.creator || role.approver || role.organizer
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
                ) : role.creator || role.approver || role.organizer ? (
                  "QUẢN LÝ SỰ KIỆN"
                ) : role.registered ? (
                  <>
                    {showTicket ? "ĐÓNG VÉ CỦA TÔI" : "XEM VÉ CỦA TÔI"}
                    <motion.div animate={{ rotate: showTicket ? 180 : 0 }}>
                      {showTicket ? <XCircle size={22} /> : <QrCode size={22} />}
                    </motion.div>
                  </>
                ) : isDeadlinePassed(event.registrationDeadline) ? (
                  "HẾT HẠN ĐĂNG KÝ"
                ) : (
                  "ĐĂNG KÝ THAM GIA"
                )}
              </button>

              {role.registered && !role.registration?.checkedIn && !isDeadlinePassed(event.endTime) && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={isCancelling}
                  className="w-full mt-4 h-12 rounded-2xl font-medium text-red-600 border-2 border-red-50 hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isCancelling ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "HỦY ĐĂNG KÝ THAM GIA"
                  )}
                </button>
              )}

              {/* Tham gia tương tác */}
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

      {/* ==================== MODALS ==================== */}
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isRegistering && setShowConfirmModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận đăng ký</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Bạn có chắc chắn muốn đăng ký tham gia sự kiện <br />
                <span className="font-bold text-gray-900">"{event.title}"</span>?
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isRegistering}
                  className="px-6 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                >
                  Để sau
                </button>
                <button
                  onClick={handleConfirmRegister}
                  disabled={isRegistering}
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Xác nhận"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-green-500" />
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              >
                <QrCode className="text-emerald-500" size={40} />
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Bạn đã đăng ký tham gia sự kiện thành công. <br />
              Vui lòng xem thông tin vé bên dưới.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-xl"
            >
              Tuyệt vời!
            </button>
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isCancelling && setShowCancelModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Hủy đăng ký?</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện <br />
              <span className="font-bold text-gray-900">"{event.title}"</span>?
              <br />
              <span className="text-sm text-red-500 mt-2 block italic">Hành động này không thể hoàn tác.</span>
            </p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-6 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-all"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-6 py-3.5 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Xác nhận hủy"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
