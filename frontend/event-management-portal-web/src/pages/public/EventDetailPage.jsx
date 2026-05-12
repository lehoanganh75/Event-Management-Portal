import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  X,
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
  Phone,
  Camera,
  Star
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
import QAModal from "../../components/survey/QAModal";
import FeedbackModal from "../../components/engagement/FeedbackModal";
import SurveyModal from "../../components/survey/SurveyModal";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useQuiz } from "../../hooks/useQuiz";
import { useLanguage } from "../../context/LanguageContext";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();

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
  const [showQAModal, setShowQAModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [joiningQuizId, setJoiningQuizId] = useState(null);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const { quizState, activeQuizId: wsActiveQuizId } = useQuiz(event?.id);
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
    if (quizState?.type === 'START' && quizState.data) {
      const qId = quizState.data;
      
      // If user is not already in the quiz modal, alert them
      if (!showQuizModal) {
        toast.info(
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Trophy size={16} />
              <p className="font-black text-[11px] uppercase tracking-wider">Thử thách mới đã bắt đầu!</p>
            </div>
            <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
              Ban tổ chức vừa kích hoạt một thử thách mới. Hãy tham gia ngay để dành lấy những phần quà hấp dẫn!
            </p>
            <button 
              onClick={() => {
                setJoiningQuizId(qId);
                setShowQuizModal(true);
              }}
              className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              Tham gia ngay
            </button>
          </div>,
          { 
            position: "top-right",
            autoClose: 15000,
            pauseOnHover: true,
            theme: "light"
          }
        );
      } else {
        setJoiningQuizId(qId);
      }
    }
  }, [quizState.type, quizState.data]);

  const formatTimeRange = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const locale = language === 'VI' ? 'vi-VN' : 'en-US';
    return `${start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
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
      if (role.registration?.checkedIn) {
        setShowTicket(true);
      } else {
        setShowScanner(true);
      }
      return;
    }

    setShowRegisterModal(true);
  };

  const confirmRegistration = async () => {
    if (!user) {
      toast.info(t('reg_redirect'), {
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
      toast.success(t('reg_success'));
      setShowRegisterModal(false);
      // Delay fetch to allow backend to update registeredCount
      setTimeout(async () => {
        await fetchEvent();
      }, 1000);
    } catch (error) {
      const msg = error.response?.data?.message || t('reg_failed');
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
      toast.success(t('checkin_success'));
      await fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || t('invalid_qr'));
    }
  };

  const handleCancelRegistration = async () => {
    setIsRegistering(true);
    try {
      await eventService.cancelRegistration(event.id);
      toast.success(t('cancel_success'));
      setShowCancelModal(false);
      // Delay fetch to allow backend to update registeredCount
      setTimeout(async () => {
        await fetchEvent();
        setShowTicket(false);
      }, 1000);
    } catch (error) {
      toast.error(t('reg_failed'));
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-gray-500 font-medium tracking-tight animate-pulse">{t('initializing')}</p>
        </div>
      </div>
    );
  }

  if (!event) return <div>{t('event_not_found')}</div>;

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
            <span className="font-semibold text-sm">{t('back_btn')}</span>
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
                  {event.type || t('event_type')}
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
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">{t('event_date_label')}</p>
                  <p className="font-semibold text-sm md:text-base">
                    {event.startTime ? new Date(event.startTime).toLocaleDateString(language === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "12/05/2026"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">{t('location_label')}</p>
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
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{t('event_intro')}</h2>
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
                  {t('target_audience')}
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
                    <span className="text-slate-400 italic">{t('everyone_welcome')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* LỊCH TRÌNH TIMELINE */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{t('detailed_schedule')}</h2>
                </div>
                <div className="bg-slate-50 text-slate-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                  {event.sessions?.length || 0} {t('sessions_count')}
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
                          {new Date(session.startTime).toLocaleTimeString(language === 'VI' ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                          {new Date(session.endTime).toLocaleTimeString(language === 'VI' ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })}
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
                            {index === 0 ? t('session_start') : index === event.sessions.length - 1 ? t('session_end') : t('session_normal')}
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
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{t('presenters_guests')}</h2>
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
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('organizer_label')}</p>
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
                    <span className="text-3xl font-bold text-indigo-600 tracking-tight">{t('free_label')}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('internal_event')}</span>
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
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{t('total_label')}</span>
                    <span className="font-bold text-slate-800 text-xs">{event.maxParticipants} {t('seats_label')}</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{t('registered_label')}</span>
                    <span className="font-bold text-emerald-600 text-xs">{event.registeredCount}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{t('deadline_label')}</span>
                    <span className="font-bold text-slate-800 text-[10px]">{new Date(event.registrationDeadline).toLocaleDateString(language === 'VI' ? "vi-VN" : "en-US", { day: '2-digit', month: '2-digit' })}</span>
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
                      {t('org_dashboard')}
                    </>
                  ) : role.registered && role.registration?.status !== "CANCELLED" ? (
                    <>
                      {role.registration?.checkedIn ? (
                        <>
                          <QrCode size={20} />
                          {t('checked_in_status')}
                        </>
                      ) : (
                        <>
                          <Camera size={20} />
                          {t('scan_checkin')}
                        </>
                      )}
                    </>
                  ) : isDeadlinePassed(event.registrationDeadline) ? (
                    t('reg_deadline_passed')
                  ) : (
                    t('register_now')
                  )}
                </motion.button>

                {role.registered && role.registration?.status !== "CANCELLED" && !showTicket && (
                  <div className="w-full">
                    {role.registration?.checkedIn ? (
                      <div className="w-full py-4 text-[9px] font-bold text-emerald-600/60 text-center uppercase tracking-wider">
                        Không thể hủy khi đã điểm danh
                      </div>
                    ) : new Date(event.startTime) - new Date() > 30 * 60 * 1000 ? (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-[0.2em] transition-colors"
                      >
                        {t('cancel_reg')}
                      </button>
                    ) : (
                      <div className="w-full py-4 text-[9px] font-bold text-slate-300 text-center uppercase tracking-wider">
                        Quá hạn hủy đăng ký sự kiện
                      </div>
                    )}
                  </div>
                )}

                {/* INTERACTIONS FOR REGISTERED USERS */}
                {event.currentUserRole?.registered && (
                  <div className="pt-4 space-y-3">
                    {isQuizLive && (
                      <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setJoiningQuizId(quizState.data || wsActiveQuizId);
                          setShowQuizModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group"
                      >
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-white"
                        />
                        <Trophy size={20} className="relative z-10 animate-bounce" />
                        <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em]">Tham gia trò chơi ngay!</span>
                      </motion.button>
                    )}

                    {/* INTERACTIVE GAME BUTTON */}
                    <button
                      onClick={() => setShowJoinCodeModal(true)}
                      className="w-full flex items-center justify-center gap-4 p-5 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Trophy size={24} className="animate-bounce" />
                      <span className="text-sm font-black uppercase tracking-[0.2em]">Tham gia trò chơi tương tác</span>
                    </button>

                    {/* INTERACTION GRID (Khảo sát, Hỏi đáp) */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowSurveyModal(true)}
                        className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                          <ClipboardCheck size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Bình chọn / Khảo sát</span>
                      </button>
                      <button
                        onClick={() => setShowQAModal(true)}
                        className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                          <MessageCircle size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Hỏi đáp (Q&A)</span>
                      </button>
                    </div>

                    {/* FEEDBACK BUTTON (Only if checked in or completed) */}
                    {(role.registration?.checkedIn || event.status === 'COMPLETED') && (
                      <button
                        onClick={() => setShowFeedbackModal(true)}
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all group"
                      >
                        <Star size={18} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Đánh giá sự kiện này</span>
                      </button>
                    )}
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
                {t('explore_more')} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* TICKETS & MODALS */}
      {createPortal(
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
        </AnimatePresence>,
        document.body
      )}

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
              <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase tracking-tight">{t('confirm_cancel')}</h3>
              <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">{t('confirm_cancel_desc')}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-[10px] uppercase tracking-widest">{t('back_btn')}</button>
                <button onClick={handleCancelRegistration} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-sm">{t('cancel_confirm_btn')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => { setShowQuizModal(false); setJoiningQuizId(null); }}
        isOrganizer={false}
        eventId={event.id}
        quizId={joiningQuizId}
      />

      <SurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        survey={event.survey}
        eventId={event.id}
      />

      <QAModal 
        isOpen={showQAModal} 
        onClose={() => setShowQAModal(false)} 
        eventId={event.id} 
        user={user}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        eventId={event.id}
        user={user}
      />
      
      {/* FULL SCREEN JOIN MODAL (Hình 2 Style) */}
      {createPortal(
        <AnimatePresence>
          {showJoinCodeModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[10000] bg-[#46178F] flex flex-col items-center justify-center p-6 overflow-hidden"
            >
              {/* Close button */}
              <button 
                onClick={() => setShowJoinCodeModal(false)}
                className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
              >
                <X size={28} />
              </button>

              {/* Floating particles background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="absolute rounded-full bg-white/10"
                    style={{ 
                      width: 10 + (i % 5) * 20, 
                      height: 10 + (i % 5) * 20, 
                      left: `${(i * 13) % 100}%`, 
                      top: `${(i * 17) % 100}%` 
                    }}
                    animate={{ y: [0, -50, 0], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity }}
                  />
                ))}
              </div>

              <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-12 border-4 border-white/30 shadow-2xl"
                >
                  <Trophy size={64} className="text-amber-300" fill="currentColor" />
                </motion.div>

                <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 text-center">Tham gia ngay!</h2>
                <p className="text-white/60 text-lg font-bold uppercase tracking-[0.3em] mb-16 text-center">Nhập mã PIN hoặc quét QR để bắt đầu</p>
                
                <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl">
                  {/* CENTER: PIN INPUT */}
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <input 
                        autoFocus
                        type="text"
                        placeholder="MÃ PIN (6 SỐ)"
                        maxLength={6}
                        className="w-full bg-white rounded-[2rem] px-8 py-8 text-4xl font-black text-center uppercase tracking-[0.4em] text-[#46178F] shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus:ring-8 focus:ring-white/20 outline-none transition-all placeholder:tracking-normal placeholder:font-black placeholder:text-slate-200"
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          if (val.length === 6) {
                            const matched = quizzes.find(q => q.id?.startsWith(val.toLowerCase()));
                            if (matched) {
                              setJoiningQuizId(matched.id);
                              setShowQuizModal(true);
                              setShowJoinCodeModal(false);
                              toast.success("Kết nối thành công!");
                            } else {
                              toast.error("Mã PIN không đúng");
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* RIGHT: QR SCANNER BUTTON */}
                  <div className="flex-shrink-0">
                    <button 
                      onClick={() => setShowScanner(true)}
                      className="w-24 h-24 md:w-32 md:h-32 bg-amber-400 text-slate-900 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-amber-300 hover:scale-105 transition-all shadow-2xl group"
                    >
                      <QrCode size={40} className="group-hover:rotate-12 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Quét QR</span>
                    </button>
                  </div>
                </div>

                <p className="mt-16 text-white/40 text-xs font-bold uppercase tracking-widest animate-pulse">Đang đợi bạn nhập mã...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
