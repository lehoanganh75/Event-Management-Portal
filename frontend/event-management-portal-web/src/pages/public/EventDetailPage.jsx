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
import QRScannerModal from "../../components/common/management/QRScannerModal";

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
  const [showQuizScanner, setShowQuizScanner] = useState(false);
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

  const quizControls = useQuiz(event?.id);
  const { quizState, activeQuizId: wsActiveQuizId } = quizControls;
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
              Ban tổ chức vừa kích hoạt một thử thách mới. Hãy nhấn vào "Trò chơi tương tác" và nhập mã PIN để tham gia!
            </p>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
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

    if (isInTeam) {
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
      toast.info("Đang chuyển hướng đến trang đăng nhập để đăng ký tham gia sự kiện!", { autoClose: 2000 });
      setShowRegisterModal(false);
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setIsRegistering(true);
    try {
      await eventService.registerEvent(event.id);
      toast.success("Đăng ký thành công!");
      setShowRegisterModal(false);
      setTimeout(() => fetchEvent(), 1000);
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

  const handleQuizScanSuccess = async (scannedData) => {
    setShowQuizScanner(false);
    
    let pin = scannedData ? scannedData.replace(/\s+/g, "") : "";
    if (pin.includes("pin=")) {
      const match = pin.match(/[?&]pin=([^&]+)/);
      if (match) {
        pin = match[1];
      }
    } else if (pin.includes("/")) {
      const parts = pin.split("/");
      const lastPart = parts[parts.length - 1];
      if (lastPart.length === 6) {
        pin = lastPart;
      }
    }
    
    pin = pin.toUpperCase();
    
    if (!pin || pin.length !== 6) {
      toast.error("Mã QR không hợp lệ. Vui lòng quét mã QR chứa mã PIN thử thách 6 ký tự.");
      return;
    }
    
    try {
      const res = await eventService.getQuizByPin(pin);
      if (res.data?.id) {
        // Enforce Check-in logic
        const isSystemAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user?.role?.toUpperCase());
        const isLecturer = user?.role?.toUpperCase() === "LECTURER";
        const roleData = event?.currentUserRole || {};
        const isTeam = roleData?.creator || roleData?.approver || !!roleData?.organizerRole;
        const canBypassCheckIn = isSystemAdmin || isLecturer || isTeam;

        if (res.data.requireCheckIn && !canBypassCheckIn) {
          if (!user) {
            toast.error("Vui lòng đăng nhập và check-in để tham gia thử thách này.");
            return;
          }
          if (!roleData?.registered || !roleData?.registration?.checkedIn) {
            toast.error("Bạn cần hoàn tất Check-in tại quầy để tham gia thử thách này!");
            return;
          }
        }

        setJoiningQuizId(res.data.id);
        setShowQuizModal(true);
        setPinInput("");
        toast.success("Kết nối thử thách thành công!");
      } else {
        toast.error("Mã PIN không đúng hoặc trò chơi chưa bắt đầu");
      }
    } catch (err) {
      toast.error("Mã PIN từ QR không đúng hoặc trò chơi chưa được tạo");
    }
  };

  const handleCancelRegistration = async () => {
    setIsRegistering(true);
    try {
      await eventService.cancelRegistration(event.id);
      toast.success("Đã hủy đăng ký");
      setShowCancelModal(false);
      setTimeout(async () => {
        await fetchEvent();
        setShowTicket(false);
      }, 1000);
    } catch (error) {
      toast.error("Đăng ký thất bại");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-gray-500 font-medium tracking-tight animate-pulse">{"Khởi tạo không gian sự kiện..."}</p>
        </div>
      </div>
    );
  }

  if (!event) return <div>{"Không tìm thấy sự kiện"}</div>;

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
              event={event}
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
        quizControls={quizControls}
      />

      <JoinCodeModal
        isOpen={showJoinCodeModal}
        onClose={() => setShowJoinCodeModal(false)}
        pinInput={pinInput}
        setPinInput={setPinInput}
        setJoiningQuizId={setJoiningQuizId}
        setShowQuizModal={setShowQuizModal}
        setShowQuizScanner={setShowQuizScanner}
        user={user}
        role={role}
        event={event}
      />

      <QRScannerModal
        isOpen={showQuizScanner}
        onClose={() => setShowQuizScanner(false)}
        onScanSuccess={handleQuizScanSuccess}
        title="Quét mã PIN thử thách"
        description="Vui lòng đưa mã QR chứa mã PIN hoặc link tham gia thử thách vào khung hình camera."
      />
    </div>
  );
}
