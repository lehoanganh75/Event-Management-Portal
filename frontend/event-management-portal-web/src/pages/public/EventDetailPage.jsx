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
  Users,
  Trophy,
  ClipboardCheck,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  Share2,
  Heart,
  Mail,
  Phone
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

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log("User", user);

  const isSystemAdmin = () => {
    const role = user?.role?.toUpperCase();
    return ["SUPER_ADMIN", "ADMIN"].includes(role);
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

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventBySlug(eventId);
      setEvent(res.data);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      eventService.getQuizzesByEvent(eventId)
        .then(res => setQuizzes(res.data || []))
        .catch(() => { });
    }
  }, [eventId]);

  useEffect(() => {
    if (quizState.type === 'START' && showQuizModal) {
      setJoiningQuizId(activeQuizId);
    }
  }, [quizState.type]);

  const formatTimeRange = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  console.log(event);


  const handleMainAction = async () => {
    if (!event) return;
    const role = event.currentUserRole || {};

    // Determine system role from user object
    const sysRole = user?.role?.toUpperCase();
    const isSysAdmin = ["SUPER_ADMIN", "ADMIN"].includes(sysRole);
    const isLecturer = sysRole === "LECTURER";
    const isStudent = sysRole === "STUDENT";

    // Team access check
    const isInTeam = role.creator || role.approver || !!role.organizerRole;

    if (isInTeam || isSysAdmin) {
      if (isSysAdmin) {
        navigate(`/admin/events/${event.id}`);
      } else if (isLecturer) {
        navigate(`/lecturer/events/${event.id}`);
      } else if (isStudent) {
        navigate(`/student/events/${event.id}`);
      } else {
        navigate(`/manage-event/${event.id}`);
      }
      return;
    }

    if (role.registered && role.registration?.status !== "CANCELLED") {
      setShowTicket(true);
      return;
    }

    setShowRegisterModal(true);
  };

  const confirmRegistration = async () => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để đăng ký tham gia sự kiện!", {
        autoClose: 2000
      });
      setShowRegisterModal(false);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    setIsRegistering(true);
    try {
      await eventService.registerEvent(event.id);
      toast.success("Đăng ký thành công!");
      setShowRegisterModal(false);
      // Delay fetch to allow backend to update registeredCount
      setTimeout(async () => {
        await fetchEvent();
        setShowTicket(true);
      }, 1000);
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng ký thất bại";
      setRegistrationError(msg);
      toast.error(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleScanSuccess = async (token) => {
    setShowScanner(false);
    try {
      await eventService.checkInByEventToken(token);
      toast.success("Điểm danh thành công!");
      await fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã QR không hợp lệ");
    }
  };

  const handleCancelRegistration = async () => {
    setIsRegistering(true);
    try {
      await eventService.cancelRegistration(event.id);
      toast.success("Đã hủy đăng ký");
      setShowCancelModal(false);
      // Delay fetch to allow backend to update registeredCount
      setTimeout(async () => {
        await fetchEvent();
        setShowTicket(false);
      }, 1000);
    } catch (error) {
      toast.error("Hủy đăng ký thất bại");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-gray-500 font-medium tracking-tight animate-pulse">Khởi tạo không gian sự kiện...</p>
        </div>
      </div>
    );
  }

  if (!event) return <div>Event not found</div>;

  const role = event.currentUserRole || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100">
      <Header />
      <AIChatBot />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={event.imageurl || event.coverImage || "https://images.unsplash.com/photo-1540575861501-7ce0e220abb4?q=80&w=2070&auto=format&fit=crop"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute top-8 left-8 z-20">
          <button
            onClick={() => navigate(-1)}
            className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm">Quay lại</span>
          </button>
        </div>

        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md shadow-sm">
                  {event.type || "SỰ KIỆN"}
                </span>
                {event.hasLuckyDraw && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                    <Zap size={12} fill="currentColor" />
                    LUCKY DRAW
                  </span>
                )}
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-white/30">
                  {event.eventMode || "OFFLINE"}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-8 text-white/90">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">Ngày diễn ra</p>
                    <p className="font-semibold text-sm md:text-base">{event.eventDate || "12/05/2026"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">Địa điểm</p>
                    <p className="font-semibold text-sm md:text-base">{event.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== CONTENT SECTION ==================== */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 -mt-12 relative z-20 pb-24">
        <div className="grid lg:grid-cols-12 gap-10">

          {/* LEFT: MAIN INFO */}
          <div className="lg:col-span-8 space-y-10">

            {/* GIỚI THIỆU */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Giới thiệu sự kiện</h2>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line font-medium italic mb-8">
                  "{event.description}"
                </p>
              </div>

              {/* Đối tượng tham gia */}
              <div className="mt-12">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                  <Users size={16} />
                  Đối tượng tham gia
                </h3>
                <div className="flex flex-wrap gap-3">
                  {event.targetobjects?.length > 0 ? (
                    event.targetobjects.map((target, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-600 border border-slate-200 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-default">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {target.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">Mọi người quan tâm</span>
                  )}
                </div>
              </div>
            </div>

            {/* LỊCH TRÌNH TIMELINE */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Lịch trình chi tiết</h2>
                </div>
                <div className="bg-slate-50 text-slate-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                  {event.sessions?.length || 0} Phiên
                </div>
              </div>

              <div className="space-y-0">
                {event.sessions?.length > 0 ? (
                  event.sessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="flex gap-6 p-6 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-20 flex-shrink-0 pt-1">
                        <p className="font-bold text-slate-900 text-sm">
                          {new Date(session.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                          {new Date(session.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      <div className="flex-1 space-y-2">
                        <h4 className="text-base font-bold text-slate-800 leading-snug">
                          {session.title}
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          {session.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          {session.presenter && (
                            <div className="flex items-center gap-2">
                              <img
                                src={session.presenter.avatarUrl || `https://ui-avatars.com/api/?name=${session.presenter.fullName}&background=random`}
                                alt="Presenter"
                                className="w-5 h-5 rounded-full object-cover border border-slate-100"
                              />
                              <span className="text-[10px] font-semibold text-slate-600">
                                {session.presenter.fullName}
                              </span>
                            </div>
                          )}

                          {session.room && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                              <MapPin size={12} className="text-rose-500" />
                              {session.room}
                            </div>
                          )}

                          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                            {index === 0 ? "Bắt đầu" : index === event.sessions.length - 1 ? "Kết thúc" : "Phiên họp"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Info className="mx-auto text-slate-300 mb-4" size={40} />
                    <p className="text-slate-400 font-medium italic">Lịch trình đang được ban tổ chức chuẩn bị...</p>
                  </div>
                )}
              </div>
            </div>

            {/* DIỄN GIẢ & KHÁCH MỜI */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Diễn giả & Khách mời</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {event.presenters?.length > 0 ? (
                  event.presenters.map((presenter, idx) => (
                    <div key={idx} className="flex items-start gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all cursor-default">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={presenter.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${presenter.id}&background=random`}
                          alt="Presenter"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-slate-800 mb-0.5 truncate">
                          {presenter.profile?.fullName || "Chuyên gia khách mời"}
                        </h4>
                        <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                          {presenter.role || "DIỄN GIẢ"}
                        </p>

                        {presenter.profile?.bio && (
                          <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed mb-3">
                            {presenter.profile.bio}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                          {presenter.profile?.email && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Mail size={10} />
                              <span className="text-[10px] font-medium truncate max-w-[120px]">{presenter.profile.email}</span>
                            </div>
                          )}
                          {presenter.profile?.phone && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Phone size={10} />
                              <span className="text-[10px] font-medium">{presenter.profile.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">Diễn giả sẽ sớm được bật mí...</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: SIDEBAR STICKY */}
          <div className="lg:col-span-4 space-y-8">

            {/* ĐƠN VỊ TỔ CHỨC */}
            {event.organization && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Đơn vị tổ chức</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 p-2">
                    {event.organization.logourl ? (
                      <img src={event.organization.logourl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ShieldCheck size={24} className="text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight uppercase text-sm tracking-tight">{event.organization.name}</h4>
                    <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded mt-1 uppercase">
                      {event.organization.type || "ORGANIZATION"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* REGISTRATION CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 overflow-hidden">
              <div className="mb-6 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-indigo-600 tracking-tight">Miễn phí</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sự kiện nội bộ</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <QrCode size={20} className="text-slate-400" />
                  </div>
                </div>

                {/* Progress bar as a line */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((event.registeredCount || 0) / (event.maxParticipants || 1)) * 100, 100)}%` }}
                    className="h-full bg-indigo-600"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Tổng cộng</span>
                    <span className="font-bold text-slate-800 text-xs">{event.maxParticipants} Ghế</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Đã đăng ký</span>
                    <span className="font-bold text-emerald-600 text-xs">{event.registeredCount}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Thời hạn</span>
                    <span className="font-bold text-slate-800 text-[10px]">{new Date(event.registrationDeadline).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleMainAction}
                  disabled={
                    isRegistering ||
                    ((!role.registered || role.registration?.status === "CANCELLED") &&
                      !role.creator && !role.approver && !role.organizerRole &&
                      isDeadlinePassed(event.registrationDeadline))
                  }
                  className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 ${role.creator || role.approver || role.organizerRole || isSystemAdmin()
                    ? "bg-slate-800 text-white"
                    : role.registered
                      ? role.registration?.checkedIn
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-indigo-600 text-white"
                      : isDeadlinePassed(event.registrationDeadline)
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                >
                  {isRegistering ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : role.creator || role.approver || role.organizerRole || isSystemAdmin() ? (
                    <>
                      <ShieldCheck size={20} />
                      Quản lý sự kiện
                    </>
                  ) : role.registered && role.registration?.status !== "CANCELLED" ? (
                    <>
                      <QrCode size={20} />
                      {role.registration?.checkedIn ? "Đã điểm danh ✓" : "Xem vé tham gia"}
                    </>
                  ) : isDeadlinePassed(event.registrationDeadline) ? (
                    "Hết hạn đăng ký"
                  ) : (
                    "Đăng ký ngay"
                  )}
                </motion.button>

                {role.registered && role.registration?.status !== "CANCELLED" && !showTicket && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-[0.2em] transition-colors"
                  >
                    Hủy đăng ký tham gia
                  </button>
                )}

                {/* INTERACTIONS FOR REGISTERED USERS */}
                {event.currentUserRole?.registered && (
                  <div className="pt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowSurveyModal(true)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all"
                    >
                      <ClipboardCheck size={18} className="text-indigo-600" />
                      <span className="text-[9px] font-bold text-slate-700 uppercase">Khảo sát</span>
                    </button>
                    <button
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-amber-50 hover:border-amber-100 transition-all"
                    >
                      <MessageCircle size={18} className="text-amber-600" />
                      <span className="text-[9px] font-bold text-slate-700 uppercase">Hỏi đáp</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* QUẢNG CÁO TÍNH NĂNG */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md">
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-amber-400" fill="currentColor" size={20} />
              </div>
              <h4 className="text-lg font-bold mb-1 uppercase tracking-tight">IUH Event Portal</h4>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-4">
                Hệ thống quản lý sự kiện thông minh, điểm danh QR và chatbot AI hỗ trợ 24/7.
              </p>
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
                Tìm hiểu thêm <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* TICKETS & MODALS */}
      <AnimatePresence>
        {showTicket && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md"
          >
            <div className="max-w-xl w-full relative">
              <button
                onClick={() => setShowTicket(false)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white"
              >
                <XCircle size={32} />
              </button>
              <TicketDetail eventId={event.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Modals */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onConfirm={confirmRegistration}
        event={event}
        isRegistering={isRegistering}
        error={registrationError}
        isGuest={!user}
      />

      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-slate-200">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase tracking-tight">Hủy đăng ký?</h3>
              <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">Bạn chắc chắn muốn hủy tham gia? Bạn có thể mất suất nếu sự kiện đã đủ người.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-[10px] uppercase tracking-widest">Quay lại</button>
                <button onClick={handleCancelRegistration} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-sm">Hủy ngay</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => { setShowQuizModal(false); setJoiningQuizId(null); }}
        eventId={eventId}
        quizId={joiningQuizId}
      />

      <SurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        eventId={eventId}
      />
    </div>
  );
}
