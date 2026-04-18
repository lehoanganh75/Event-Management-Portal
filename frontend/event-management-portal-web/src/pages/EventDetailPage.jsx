import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  MessageCircle,
  QrCode,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import AIChatBot from "../components/chat/AIChatBot";
import eventService from "../services/eventService";
import TicketDetail from "../components/ticket/TicketDetail";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

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
      navigate(`/manage-event/${event.id}`);
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

    if (!window.confirm(`Bạn muốn đăng ký tham gia "${event.title}"?`)) return;

    setIsRegistering(true);
    try {
      await eventService.registerEvent(event.id);
      alert("Đăng ký thành công!");
      await fetchEvent();
      setShowTicket(true);
    } catch (error) {
      alert(error.response?.data?.message || "Đăng ký thất bại");
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AIChatBot />

      {/* HERO */}
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 relative z-10 pb-12">
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
                              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                                session.type === "KEYNOTE" ? "bg-purple-100 text-purple-700" :
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
                className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${
                  role.creator || role.approver || role.organizer
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
    </div>
  );
}
