import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Hourglass,
  AlertCircle,
  Star,
  CheckCircle,
  QrCode,
  XCircle,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

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
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • ${d.toLocaleDateString("vi-VN")}`;
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  const handleMainAction = async () => {
    if (!event) return;

    const role = event.currentUserRole || {};

    // 1. Nếu là Quản lý
    if (role.creator || role.approver || role.organizer) {
      navigate(`/manage-event/${event.id}`);
      return;
    }

    // 2. Nếu đã đăng ký → Logic ẨN/HIỆN (Toggle)
    if (role.registered) {
      if (showTicket) {
        // Nếu đang hiện thì ẩn đi
        setShowTicket(false);
      } else {
        // Nếu đang ẩn thì hiện lên và scroll xuống
        setShowTicket(true);
        setTimeout(() => {
          document.getElementById("ticket-section")?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 100);
      }
      return;
    }

    // 3. Chưa đăng ký → Thực hiện đăng ký
    if (!window.confirm(`Bạn muốn đăng ký tham gia "${event.title}"?`)) return;

    setIsRegistering(true);
    try {
      await eventService.registerEvent(event.id);
      alert("Đăng ký thành công!");
      
      await fetchEvent(); // Tải lại để lấy role.registered = true
      setShowTicket(true); // Đăng ký xong thì hiện vé luôn
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
          <AlertCircle size={64} className="mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Không tìm thấy sự kiện</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const role = event.currentUserRole || {};

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* HERO SECTION */}
      <div className="relative h-[420px] md:h-[480px]">
        <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/90 hover:bg-white p-3 rounded-2xl shadow-lg transition z-20 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              {event.type}
            </span>
            <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              {event.eventTopic}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
        {/* ROLE BADGES */}
        <div className="flex gap-3 mb-6">
          {role.creator && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-5 py-2 rounded-2xl text-sm font-semibold">
              <Star size={18} /> Chủ trì
            </div>
          )}
          {role.registered && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-2 rounded-2xl text-sm font-semibold">
              <CheckCircle size={18} /> Đã đăng ký
            </div>
          )}
        </div>

        {/* Nội dung Event */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT - Info + Description + Presenters */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold mb-6">Thông tin sự kiện</h2>
              {/* ... giữ nguyên phần info card của bạn ... */}
              <div className="space-y-6">
                {/* Thời gian, địa điểm, hạn đăng ký... */}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Thời gian bắt đầu</p>
                    <p className="text-lg font-semibold text-gray-800 mt-1">{formatDateTime(event.startTime)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-rose-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">Địa điểm • {event.eventMode}</p>
                    <p className="text-lg font-semibold text-gray-800 mt-1">{event.location}</p>
                  </div>
                </div>

                {event.registrationDeadline && (
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDeadlinePassed(event.registrationDeadline) ? "bg-red-50" : "bg-green-50"}`}>
                      <Hourglass className={isDeadlinePassed(event.registrationDeadline) ? "text-red-600" : "text-green-600"} size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Hạn chót đăng ký</p>
                      <p className={`text-lg font-semibold mt-1 ${isDeadlinePassed(event.registrationDeadline) ? "text-red-600" : "text-gray-800"}`}>
                        {formatDateTime(event.registrationDeadline)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <h3 className="font-semibold text-lg mb-3">Giới thiệu sự kiện</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>

              {event.notes && (
                <div className="mt-6 bg-amber-50 border border-amber-200 p-5 rounded-2xl flex gap-4">
                  <AlertCircle className="text-amber-600 mt-0.5" size={24} />
                  <div>
                    <p className="font-semibold text-amber-800">Lưu ý quan trọng</p>
                    <p className="text-amber-700 mt-1">{event.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Diễn giả */}
            {event.presenters && event.presenters.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold mb-6">Diễn giả khách mời</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {event.presenters.map((presenter) => (
                    <div key={presenter.id} className="flex gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <img src={presenter.avatarUrl} alt={presenter.fullName} className="w-20 h-20 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{presenter.fullName}</h4>
                        <p className="text-gray-600 text-sm mt-1">{presenter.position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR - Nút hành động */}
          <div className="lg:col-span-4">
            <div className="space-y-6 sticky top-6">
              {/* Card chứa nút bấm chính */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Số lượng tham gia</span>
                    <span className="font-semibold text-gray-800">
                      {event.registeredCount} / {event.maxParticipants}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${(event.registeredCount / event.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>

               <button
                  onClick={handleMainAction}
                  // Disable nếu đang xử lý HOẶC (Chưa đăng ký/không phải quản lý VÀ đã hết hạn)
                  disabled={
                    isRegistering || 
                    (!role.registered && !role.creator && !role.approver && !role.organizer && isDeadlinePassed(event.registrationDeadline))
                  }
                  className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${
                    role.creator || role.approver || role.organizer
                      ? "bg-zinc-900 text-white" // Style Quản lý
                      : role.registered
                      ? showTicket
                        ? "bg-slate-100 text-slate-600 shadow-none border border-slate-200" // Đang mở vé
                        : "bg-emerald-600 text-white shadow-emerald-200" // Đã đăng ký nhưng đang ẩn vé
                      : isDeadlinePassed(event.registrationDeadline)
                      ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed" // Style Hết hạn
                      : "bg-blue-600 text-white shadow-blue-200" // Style Đăng ký bình thường
                  } disabled:opacity-70`}
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
                    <>
                      HẾT HẠN ĐĂNG KÝ
                      <Clock size={20} />
                    </>
                  ) : (
                    "ĐĂNG KÝ THAM GIA"
                  )}
                </button>

                {/* HIỂN THỊ VÉ NGAY DƯỚI NÚT BẤM (Nếu là Mobile hoặc muốn nằm trong card) */}
              </div>

              {/* ==================== VÉ HIỂN THỊ NGAY DƯỚI NÚT BẤM ==================== */}
              {showTicket && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="ticket-section" 
                  className="w-full"
                >
                  <TicketDetail eventId={event.id} />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}