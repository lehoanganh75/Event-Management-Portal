import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import AIChatBot from "../../components/chat/AIChatBot";
import eventService from "../../services/eventService";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useQuiz } from "../../hooks/useQuiz";
import { useLanguage } from "../../context/LanguageContext";

// New sub-components
import EventHero from "../../components/event-detail/EventHero";
import EventInfo from "../../components/event-detail/EventInfo";
import EventSidebar from "../../components/event-detail/EventSidebar";
import JoinCodeModal from "../../components/event-detail/JoinCodeModal";
import EventActionModals from "../../components/event-detail/EventActionModals";
import EventFeedback from "../../components/event-detail/EventFeedback";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();

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
  const [pinInput, setPinInput] = useState("");
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

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  const handleMainAction = async () => {
    if (!event) return;
    const role = event.currentUserRole || {};
    const sysRole = user?.role?.toUpperCase();
    const isSysAdmin = ["SUPER_ADMIN", "ADMIN"].includes(sysRole);
    const isLecturer = sysRole === "LECTURER";
    const isStudent = sysRole === "STUDENT";
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
      toast.info(t('reg_redirect'), { autoClose: 2000 });
      setShowRegisterModal(false);
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setIsRegistering(true);
    try {
      await eventService.registerEvent(event.id);
      toast.success(t('reg_success'));
      setShowRegisterModal(false);
      setTimeout(() => fetchEvent(), 1000);
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
  const isSystemAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user?.role?.toUpperCase());

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100">
      <Header />
      <AIChatBot />

      <EventHero
        event={event}
        language={language}
        t={t}
      />

      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 -mt-12 relative z-20 pb-24">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <EventInfo
              event={event}
              language={language}
              t={t}
            />

            <EventFeedback
              eventId={event.id}
              role={role}
              t={t}
              setShowFeedbackModal={setShowFeedbackModal}
            />
          </div>

          <EventSidebar
            event={event}
            role={role}
            t={t}
            isSystemAdmin={isSystemAdmin}
            isRegistering={isRegistering}
            isDeadlinePassed={isDeadlinePassed}
            handleMainAction={handleMainAction}
            setShowCancelModal={setShowCancelModal}
            showTicket={showTicket}
            isQuizLive={isQuizLive}
            setShowQuizModal={setShowQuizModal}
            setJoiningQuizId={setJoiningQuizId}
            quizState={quizState}
            wsActiveQuizId={wsActiveQuizId}
            setShowJoinCodeModal={setShowJoinCodeModal}
            setShowSurveyModal={setShowSurveyModal}
            setShowQAModal={setShowQAModal}
            setShowFeedbackModal={setShowFeedbackModal}
          />
        </div>
      </main>

      <Footer />

      <EventActionModals
        event={event}
        user={user}
        t={t}
        showTicket={showTicket}
        setShowTicket={setShowTicket}
        showRegisterModal={showRegisterModal}
        setShowRegisterModal={setShowRegisterModal}
        confirmRegistration={confirmRegistration}
        isRegistering={isRegistering}
        registrationError={registrationError}
        showScanner={showScanner}
        setShowScanner={setShowScanner}
        handleScanSuccess={handleScanSuccess}
        showCancelModal={showCancelModal}
        setShowCancelModal={setShowCancelModal}
        handleCancelRegistration={handleCancelRegistration}
        showQuizModal={showQuizModal}
        setShowQuizModal={setShowQuizModal}
        joiningQuizId={joiningQuizId}
        setJoiningQuizId={setJoiningQuizId}
        showSurveyModal={showSurveyModal}
        setShowSurveyModal={setShowSurveyModal}
        showQAModal={showQAModal}
        setShowQAModal={setShowQAModal}
        showFeedbackModal={showFeedbackModal}
        setShowFeedbackModal={setShowFeedbackModal}
      />

      <JoinCodeModal
        isOpen={showJoinCodeModal}
        onClose={() => setShowJoinCodeModal(false)}
        pinInput={pinInput}
        setPinInput={setPinInput}
        setJoiningQuizId={setJoiningQuizId}
        setShowQuizModal={setShowQuizModal}
        setShowScanner={setShowScanner}
      />
    </div>
  );
}
