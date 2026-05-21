import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Calendar, Users, TrendingUp, Settings, ArrowLeft,
  CheckCircle, Trash2,
  Star,
  Gift,
  Trophy,
  UserCheck,
  X,
  List,
  Info,
  MessageSquare,
  MessageCircle,
  LogOut,
  QrCode,
  Download,
  Maximize2,
  ClipboardCheck,
  Bot
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import authService from "../../../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import QRScannerModal from "./QRScannerModal";
import QuizModal from "../../quiz/QuizModal";
import QuizCreatorModal from "../../quiz/QuizCreatorModal";
import SurveyModal from "../../survey/SurveyModal";
import SurveyCreatorModal from "../../survey/SurveyCreatorModal";
import EventStatistics from "./EventStatistics";
import EventAIAnalysis from "./EventAIAnalysis";
import QRCode from "react-qr-code";
import DuckRaceLuckyDraw from "../../engagement/DuckRaceLuckyDraw";
import { useQuiz } from "../../../hooks/useQuiz";
import { toast } from "react-toastify";
import luckyDrawService from "../../../services/luckyDrawService";
import eventService from "../../../services/eventService";
import OrganizerTab from "./EventManagement/OrganizerTab";
import PresenterTab from "./EventManagement/PresenterTab";
import OverviewTab from "./EventManagement/OverviewTab";
import ProgramTab from "./EventManagement/ProgramTab";
import LuckyDrawTab from "./EventManagement/LuckyDrawTab";
import LuckyDrawCreatorModal from "./EventManagement/LuckyDrawCreatorModal";
import SettingsTab from "./EventManagement/SettingsTab";
import QuizTab from "./EventManagement/QuizTab";
import SurveyTab from "./EventManagement/SurveyTab";
import RegistrationTab from "./EventManagement/RegistrationTab";
import CheckInTab from "./EventManagement/CheckInTab";
import OrganizerInvitation from "./EventManagement/OrganizerInvitation";
import FeedbackTab from "./EventManagement/FeedbackTab";
import QATab from "./EventManagement/QATab";



import { useLanguage } from "../../../context/LanguageContext";

const EventDetailManagement = ({
  event,
  luckyDraw,
  eventSummary,
  loading = false,
  activeTab,
  setActiveTab,
  canEdit = false,
  onBack = null,
  onEditInfo = () => { },
  onCancelEvent = () => { },
  onDeleteEvent = () => { },
  // Modals
  onOpenLuckyDrawModal = () => { },
  showCancelInput,
  setShowCancelInput,
  cancelReason,
  setCancelReason,
  isCancelling,
  showDeleteConfirm,
  setShowDeleteConfirm,
  isDeleting,
  // Data actions
  onRemoveMember = () => { },
  onLeaveTeam = () => { },
  onApproveLeave = () => { },
  onRejectLeave = () => { },
  onRemovePresenter = () => { },
  onManualCheckIn = () => { },
  onUndoCheckIn = () => { },
  onUpdateCheckInTime = () => { },
  onUpdateOrganizerRole = () => { },
  // QR Scanner props
  showQRScanner = false,
  setShowQRScanner = () => { },
  onQRScanSuccess = () => { },
  onRefresh = () => { },
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const { t, language } = useLanguage();

  const STATUS_CONFIG = {
    DRAFT: { label: "Bản nháp", color: "bg-gray-100 text-gray-600" },
    PLAN_PENDING_APPROVAL: { label: "Kế hoạch chờ duyệt", color: "bg-orange-100 text-orange-600" },
    PLAN_APPROVED: { label: "Kế hoạch đã duyệt", color: "bg-emerald-100 text-emerald-600" },
    EVENT_PENDING_APPROVAL: { label: "Sự kiện chờ duyệt", color: "bg-amber-100 text-amber-600" },
    PUBLISHED: { label: "Đã công bố", color: "bg-blue-100 text-blue-600" },
    ONGOING: { label: "Đang diễn ra", color: "bg-green-100 text-green-600" },
    COMPLETED: { label: "Đã kết thúc", color: "bg-indigo-100 text-indigo-600" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-600" },
    REJECTED: { label: "Đã từ chối", color: "bg-rose-100 text-rose-600" },
    CONVERTED: { label: "Sự kiện đã bị hủy", color: "bg-slate-100 text-slate-600" },
  };

  const ORGANIZER_ROLES = [
    { label: "Ban tổ chức", value: "LEADER" },
    { label: "Giảng viên / Tổ chức", value: "COORDINATOR" },
    { label: "Thành viên", value: "MEMBER" },
    { label: "Thư ký", value: "ADVISOR" },
  ];

  const formatFullDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(language === 'VI' ? 'vi-VN' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(language === 'VI' ? 'vi-VN' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(language === 'VI' ? 'vi-VN' : 'en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getRegistrationStatus = (status) => {
    switch (status) {
      case "REGISTERED": return { label: "Đã đăng ký", color: "bg-blue-100 text-blue-700" };
      case "PENDING": return { label: "Kế hoạch chờ duyệt", color: "bg-amber-100 text-amber-700" };
      case "ATTENDED": return { label: "Đã điểm danh ✓", color: "bg-emerald-100 text-emerald-700" };
      case "CANCELLED": return { label: "Đã hủy", color: "bg-red-100 text-red-700" };
      default: return { label: status || "—", color: "bg-gray-100 text-gray-600" };
    }
  };

  const getOrganizerRole = (role) => {
    const normalizedRole = role?.replace('ROLE_', '')?.toUpperCase();

    const roleMap = {
      'LEADER': { label: 'Trưởng ban tổ chức', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      'COORDINATOR': { label: 'Điều phối viên', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
      'MEMBER': { label: 'Thành viên', color: 'bg-slate-100 text-slate-700 border-slate-200' },
      'ADVISOR': { label: 'Cố vấn', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      'HOST': { label: 'Chủ trì', color: 'bg-rose-100 text-rose-700 border-rose-200' }
    };

    const roleData = roleMap[normalizedRole] || { label: role, color: 'bg-gray-100 text-gray-600 border-gray-200' };
    return roleData;
  };

  // --- INTERNAL INVITATION STATE (Moved from parent pages) ---
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [isInviting, setIsInviting] = useState(false);

  const [isAddingPresenter, setIsAddingPresenter] = useState(false);
  const [presenterInvitations, setPresenterInvitations] = useState([]);
  const [isInvitingPresenter, setIsInvitingPresenter] = useState(false);

  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [systemUsers, setSystemUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await authService.getAllAccounts();
      setSystemUsers(res.data || []);
    } catch (err) {
      toast.error("Lỗi lấy danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return systemUsers.filter(u =>
      (u.profile?.fullName || "").toLowerCase().includes(searchKey.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchKey.toLowerCase())
    );
  }, [systemUsers, searchKey]);

  const addInvite = (user = null) => {
    if (user) {
      if (invitations.some(inv => inv.inviteeEmail === user.email || inv.inviteeAccountId === user.id)) {
        toast.info("Người dùng này đã có trong danh sách chuẩn bị mời");
        return;
      }
    }
    const newInvite = user ? {
      inviteeEmail: user.email || "",
      inviteeAccountId: user.id || "",
      fullName: user.fullName || user.profile?.fullName || user.username || "",
      targetRole: "MEMBER",
      message: ""
    } : { inviteeEmail: "", inviteeAccountId: "", fullName: "", targetRole: "MEMBER", message: "" };

    if (user) {
      const emptyIdx = invitations.findIndex(inv => !inv.inviteeEmail);
      if (emptyIdx !== -1) {
        const newList = [...invitations];
        newList[emptyIdx] = newInvite;
        setInvitations(newList);
        return;
      }
    }
    setInvitations([...invitations, newInvite]);
  };

  const updateInvite = (idx, field, val) => {
    const newList = [...invitations];
    newList[idx][field] = val;
    // Auto-fill if email matches a system user
    if (field === 'inviteeEmail' && val) {
      const matchedUser = systemUsers.find(u => u.email?.toLowerCase() === val.toLowerCase());
      if (matchedUser) {
        newList[idx].inviteeAccountId = matchedUser.id;
        newList[idx].fullName = matchedUser.profile?.fullName || matchedUser.fullName || matchedUser.username;
      }
    }
    setInvitations(newList);
  };

  const handleSendInvites = async () => {
    try {
      const validInvites = invitations.filter(inv => inv.inviteeEmail?.trim() !== "");
      if (validInvites.length === 0) return;

      const emptyMessageInvite = validInvites.find(inv => !inv.message?.trim());
      if (emptyMessageInvite) {
        toast.error("Vui lòng nhập Lời nhắn mời tham gia cho tất cả thành viên chuẩn bị mời!");
        return;
      }

      const myEmail = authUser?.email || authUser?.account?.email;
      if (myEmail) {
        const selfInvite = validInvites.find(inv => inv.inviteeEmail?.toLowerCase() === myEmail.toLowerCase());
        if (selfInvite) {
          toast.error("Không thể mời chính bạn vì bạn đã là thành viên trong ban tổ chức!");
          return;
        }
      }

      setIsInviting(true);
      await eventService.sendOrganizerInvitations(event.id, { invitations: validInvites });
      toast.success("Đã gửi lời mời!");
      setInvitations([]);
      setIsAddingMember(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi gửi lời mời");
    } finally {
      setIsInviting(false);
    }
  };

  const addPresenterInvite = (selectedUser = null) => {
    if (selectedUser) {
      const myEmail = authUser?.email || authUser?.account?.email;
      if (selectedUser.email && myEmail && selectedUser.email.toLowerCase() === myEmail.toLowerCase()) {
        toast.error("Không thể thêm chính mình (Người tạo) làm diễn giả!");
        return;
      }

      if (presenterInvitations.some(inv => inv.inviteeEmail === selectedUser.email || inv.inviteeAccountId === selectedUser.id)) {
        toast.info("Người dùng này đã có trong danh sách chuẩn bị mời");
        return;
      }
    }
    const newInvite = selectedUser ? {
      inviteeEmail: selectedUser.email || "",
      inviteeAccountId: selectedUser.id || "",
      fullName: selectedUser.fullName || selectedUser.profile?.fullName || selectedUser.username || "",
      session: "ALL",
      bio: ""
    } : { inviteeEmail: "", inviteeAccountId: "", fullName: "", session: "ALL", bio: "" };

    if (selectedUser) {
      const emptyIdx = presenterInvitations.findIndex(inv => !inv.inviteeEmail);
      if (emptyIdx !== -1) {
        const newList = [...presenterInvitations];
        newList[emptyIdx] = newInvite;
        setPresenterInvitations(newList);
        return;
      }
    }
    setPresenterInvitations([...presenterInvitations, newInvite]);
  };

  const updatePresenterInvite = (idx, field, val) => {
    const newList = [...presenterInvitations];
    newList[idx][field] = val;
    if (field === 'inviteeEmail' && val) {
      const matchedUser = systemUsers.find(u => u.email?.toLowerCase() === val.toLowerCase());
      if (matchedUser) {
        newList[idx].inviteeAccountId = matchedUser.id;
        newList[idx].fullName = matchedUser.profile?.fullName || matchedUser.fullName || matchedUser.username;
      }
    }
    setPresenterInvitations(newList);
  };

  const handleSendPresenterInvites = async () => {
    try {
      const validInvites = presenterInvitations.filter(inv => inv.inviteeEmail?.trim() !== "");
      if (validInvites.length === 0) return;

      const myEmail = authUser?.email || authUser?.account?.email;
      if (myEmail) {
        const selfInvite = validInvites.find(inv => inv.inviteeEmail?.toLowerCase() === myEmail.toLowerCase());
        if (selfInvite) {
          toast.error("Không thể tự mời chính mình (Người tạo) làm diễn giả!");
          return;
        }
      }

      const emptyBioInvite = validInvites.find(inv => !inv.bio?.trim());
      if (emptyBioInvite) {
        toast.error("Vui lòng nhập Lời nhắn cho tất cả diễn giả chuẩn bị mời!");
        return;
      }

      setIsInvitingPresenter(true);
      await eventService.sendPresenterInvitations(event.id, { invitations: validInvites });
      toast.success("Đã gửi lời mời diễn giả!");
      setPresenterInvitations([]);
      setIsAddingPresenter(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi gửi lời mời");
    } finally {
      setIsInvitingPresenter(false);
    }
  };

  const [subTabOrganizer, setSubTabOrganizer] = React.useState("ALL");
  const [enrichedNames, setEnrichedNames] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => { }, icon: Trash2, color: "rose" });

  // Editing state
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [newCheckInTime, setNewCheckInTime] = useState("");
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);

  // Import Word logic
  const fileInputRef = useRef(null);

  const handleWordImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      toast.error("Vui lòng chọn file Word (.docx)");
      return;
    }

    setImportingWord(true);
    try {
      const toastId = toast.loading("Đang nhập dữ liệu từ Word...");
      await eventService.importQuizFromWord(event.id, file);
      toast.update(toastId, {
        render: "Nhập thử thách thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
      fetchQuizzes();
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Lỗi khi nhập file: " + (error.response?.data?.message || error.message));
    } finally {
      setImportingWord(false);
      e.target.value = null;
    }
  };

  const surveyFileInputRef = useRef(null);
  const handleSurveyWordImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast.error("Vui lòng chọn file Word (.docx)");
      return;
    }

    try {
      const toastId = toast.loading("Đang nhập khảo sát từ Word...");
      await eventService.importSurveyFromWord(event.id, file);
      toast.update(toastId, {
        render: "Nhập khảo sát thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });
      // Optionally fetch survey or refresh event
      onRefresh();
    } catch (error) {
      console.error("Survey import error:", error);
      toast.error("Lỗi khi nhập file: " + (error.response?.data?.message || error.message));
    } finally {
      e.target.value = null;
    }
  };

  // Event QR Token states
  const [showEventQRModal, setShowEventQRModal] = useState(false);
  const [eventQRToken, setEventQRToken] = useState("");

  const [showAllSurveyQuestions, setShowAllSurveyQuestions] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);
  const [showQRZoom, setShowQRZoom] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(30);

  // Quiz & Survey states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizIsOrganizer, setQuizIsOrganizer] = useState(true);
  const [showQuizCreatorModal, setShowQuizCreatorModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showSurveyCreatorModal, setShowSurveyCreatorModal] = useState(false);
  const [showLuckyDrawCreatorModal, setShowLuckyDrawCreatorModal] = useState(false);
  const [showDuckRace, setShowDuckRace] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [importingWord, setImportingWord] = useState(false);

  // Duck Race states
  const [raceParticipants, setRaceParticipants] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleOpenDuckRace = async () => {
    const ldId = luckyDraw?.id || luckyDraw?.luckyDraw?.id;
    console.log("luckyDraw ID extracted for duck race:", ldId);
    if (!ldId) {
      toast.error("Chiến dịch Lucky Draw chưa được thiết lập!");
      return;
    }
    try {
      const res = await luckyDrawService.getParticipants(ldId);
      const participants = res.data || [];
      if (!participants || participants.length === 0) {
        toast.warning("Không có người tham gia hợp lệ! Cần có ít nhất 1 người tham gia để mở Đua Vịt.");
        return;
      }
      setRaceParticipants(participants);
      setShowDuckRace(true);
    } catch (err) {
      toast.error("Không thể tải danh sách người tham gia đua vịt");
    }
  };

  const handleDuckSpin = async (prizeId) => {
    const ldId = luckyDraw?.id || luckyDraw?.luckyDraw?.id;
    return (await luckyDrawService.adminSpin(ldId, prizeId)).data;
  };

  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
  const [showQuizScanner, setShowQuizScanner] = useState(false);

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
        const isSystemAdmin = ["SUPER_ADMIN", "ADMIN"].includes(authUser?.role?.toUpperCase());
        const isLecturer = authUser?.role?.toUpperCase() === "LECTURER";
        const roleData = event?.currentUserRole || {};
        const isTeam = roleData?.creator || roleData?.approver || !!roleData?.organizerRole;
        const canBypassCheckIn = isSystemAdmin || isLecturer || isTeam;

        if (res.data.requireCheckIn && !canBypassCheckIn) {
          if (!authUser) {
            toast.error("Vui lòng đăng nhập và check-in để tham gia thử thách này.");
            return;
          }
          if (!roleData?.registered || !roleData?.registration?.checkedIn) {
            toast.error("Bạn cần hoàn tất Check-in tại quầy để tham gia thử thách này!");
            return;
          }
        }

        setActiveQuizId(res.data.id);
        setQuizIsOrganizer(false);
        setShowQuizModal(true);
        toast.success("Kết nối thử thách thành công!");
      } else {
        toast.error("Mã PIN không đúng hoặc trò chơi chưa bắt đầu");
      }
    } catch (err) {
      toast.error("Mã PIN từ QR không đúng hoặc trò chơi chưa được tạo");
    }
  };

  // Always-on WebSocket for quiz - connected at component level to never miss events
  const quizControls = useQuiz(event?.id);
  const { quizState, leaderboard, activeQuizId: wsActiveQuizId } = quizControls;

  // This is the management view — only organizers can access it,
  // so no need to show "quiz started" notifications here.

  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const res = await eventService.getQuizzesByEvent(event.id);
      setQuizzes(res.data || []);
    } catch (err) {
      console.error("Lỗi tải quiz:", err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Thử thách") {
      fetchQuizzes();
    }
  }, [activeTab, event?.id]);

  const handleStartQuiz = async (quizId) => {
    try {
      // Always call startQuiz to ensure active=true in DB
      // (local quizzes data may be stale after a previous force-close)
      await eventService.startQuiz(quizId);
    } catch (err) {
      console.error("Failed to activate quiz:", err);
    }
    setActiveQuizId(quizId);
    setQuizIsOrganizer(true);
    setShowQuizModal(true);
  };

  const downloadEventQR = () => {
    const svg = document.getElementById("event-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_Event_${event.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShowEventQR = async () => {
    try {
      setLoadingQR(true);
      setShowEventQRModal(true);
      const res = await eventService.getEventQRToken(event.id);
      setEventQRToken(res.data.token);
    } catch (err) {
      toast.error("Không thể lấy mã QR sự kiện");
      setShowEventQRModal(false);
    } finally {
      setLoadingQR(false);
    }
  };

  // 🔄 Tự động làm mới QR mỗi 30 giây khi modal đang mở và là loại DYNAMIC
  useEffect(() => {
    let interval;
    let timer;
    if (showEventQRModal && !loadingQR && event?.qrType === "DYNAMIC") {
      setQrCountdown(30);

      timer = setInterval(() => {
        setQrCountdown(prev => (prev <= 1 ? 30 : prev - 1));
      }, 1000);

      interval = setInterval(async () => {
        try {
          const res = await eventService.getEventQRToken(event.id);
          setEventQRToken(res.data.token);
        } catch (err) {
          console.error("Lỗi refresh QR:", err);
        }
      }, 30000); // 30 giây
    } else {
      setQrCountdown(30);
    }
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [showEventQRModal, event?.id, loadingQR, event?.qrType]);

  const handleToggleCheckIn = async (enabled) => {
    try {
      await eventService.toggleCheckIn(event.id, enabled);
      toast.success(enabled ? "Đã mở điểm danh" : "Đã đóng điểm danh");
      onRefresh();
    } catch (err) {
      toast.error("Lỗi khi thay đổi trạng thái điểm danh");
    }
  };

  const handleUpdateQRType = async (qrType) => {
    try {
      await eventService.updateQRType(event.id, qrType);
      toast.success(qrType === "DYNAMIC" ? "Đã chuyển sang QR Động (Bảo mật cao)" : "Đã chuyển sang QR Tĩnh (Vĩnh viễn)");
      onRefresh();
    } catch (err) {
      toast.error("Lỗi khi thay đổi loại QR");
    }
  };

  // 1. Tự động fetch tên cho lời mời & thành viên nếu chỉ có ID hoặc Email
  useEffect(() => {
    const organizersToEnrich = (event?.organizers || [])
      .filter(org => {
        const name = org.fullName;
        return !name || /^\d+$/.test(name);
      });

    const invitationsToEnrich = (event?.invitations || [])
      .filter(inv => inv.status === 'PENDING')
      .filter(inv => {
        const name = inv.inviteeName;
        const looksLikeId = name && /^\d+$/.test(name);
        const looksLikeEmail = name && name.includes('@');
        return !name || looksLikeId || looksLikeEmail;
      });

    if (organizersToEnrich.length > 0 || invitationsToEnrich.length > 0) {
      const fetchNames = async () => {
        const discoveredNames = {};
        let hasNew = false;

        // Fetch cho thành viên đã gán (theo accountId)
        if (organizersToEnrich.length > 0) {
          const ids = organizersToEnrich.map(org => org.accountId).filter(Boolean);
          if (ids.length > 0) {
            try {
              const res = await authService.getUsersByIds(ids);
              (res.data || []).forEach(u => {
                const org = organizersToEnrich.find(o => o.accountId === u.id);
                if (org && !enrichedNames[org.accountId]) {
                  discoveredNames[org.accountId] = u.fullName || u.profile?.fullName || u.username;
                  hasNew = true;
                }
              });
            } catch (e) {
              console.warn("Lỗi fetch tên hàng loạt cho thành viên");
            }
          }
        }

        // Fetch cho lời mời (theo email)
        for (const inv of invitationsToEnrich) {
          if (enrichedNames[inv.inviteeEmail]) continue;
          try {
            const res = await authService.searchUsers(inv.inviteeEmail);
            const userFound = res.data?.find(u => u.email === inv.inviteeEmail);
            if (userFound) {
              discoveredNames[inv.inviteeEmail] = userFound.fullName || userFound.profile?.fullName || userFound.username;
              hasNew = true;
            }
          } catch (e) {
            console.warn("Lỗi fetch tên cho:", inv.inviteeEmail);
          }
        }

        if (hasNew) {
          setEnrichedNames(prev => ({ ...prev, ...discoveredNames }));
        }
      };
      fetchNames();
    }
  }, [event?.organizers, event?.invitations]);

  const userPerms = event?.currentUserRole || {};
  const up = userPerms;

  // Vai trò hệ thống thực tế (từ AuthContext hoặc từ backend)
  const systemRole = up.systemRole || authUser?.role || "";
  const isAdmin = systemRole === 'ADMIN' || systemRole === 'SUPER_ADMIN';

  // 1. Nhóm Ban điều hành cốt lõi (Core Management)
  const isCoreTeam =
    up.isCreator || up.creator ||
    ['LEADER', 'COORDINATOR'].includes(up.organizerRole);

  // 2. Diễn giả (Presenter)
  const isPresenter = up.isPresented || up.presented || up.presenter;

  // 3. Các vai trò hỗ trợ khác
  const isMember = up.organizerRole === 'MEMBER';
  const isAdvisor = up.organizerRole === 'ADVISOR';
  const isLeader = up.organizerRole === 'LEADER' || up.isCreator || up.creator;

  // Quyền xem tất cả (Dành cho Core Team hoặc Admin hệ thống)
  const canSeeAll = isCoreTeam || isAdmin;

  // Các vai trò có thể mời được (Lọc dựa trên vai trò của người đang mời)
  const availableInviteRoles = useMemo(() => {
    if (isAdmin || up.isCreator || up.creator || up.organizerRole === 'LEADER') {
      return ORGANIZER_ROLES;
    }
    if (up.organizerRole === 'COORDINATOR') {
      // Điều phối viên chỉ được mời Thành viên
      return ORGANIZER_ROLES.filter(r => r.value === 'MEMBER');
    }
    return [];
  }, [isAdmin, up]);

  const isPlan = ['DRAFT', 'PLAN_PENDING_APPROVAL', 'PLAN_APPROVED', 'REJECTED'].includes(event?.status);

  const dynamicTabs = useMemo(() => {
    if (!event) return [];

    const tabs = [];

    // 1. Tổng quan (Giai đoạn chuẩn bị - Thông tin)
    tabs.push({ key: "Tổng quan", label: "Tổng quan", icon: Info });

    // 2. Chương trình (Giai đoạn chuẩn bị - Nội dung)
    tabs.push({ key: "Chương trình", label: "Chương trình", icon: List });

    // 3. Ban tổ chức (Giai đoạn chuẩn bị - Đội ngũ vận hành)
    tabs.push({ key: "Ban tổ chức", label: "Ban tổ chức", icon: Users });

    // 4. Diễn giả (Giai đoạn chuẩn bị - Nhân sự then chốt)
    tabs.push({ key: "Diễn giả", label: "Diễn giả", icon: Star });

    // Nếu là Kế hoạch hoặc Diễn giả (không phải Core Team), CHỈ hiện 4 tab trên
    if (isPlan || (isPresenter && !isCoreTeam)) {
      return tabs;
    }

    // --- Logic cho các vai trò quản lý/BTC sự kiện đã công bố ---

    // 5. Đăng ký (Giai đoạn vận hành - Trước sự kiện)
    if (canSeeAll || isMember) {
      if (canSeeAll || up.canManageRegistrations) {
        tabs.push({ key: "Đăng ký", label: "Đăng ký", icon: UserCheck });
      }
    }

    // 6. Điểm danh (Giai đoạn vận hành - Trong sự kiện)
    if (canSeeAll || isMember) {
      if (canSeeAll || isMember || up.canCheckIn) {
        tabs.push({ key: "Điểm danh", label: "Điểm danh", icon: CheckCircle });
      }
    }

    // 7. Hỏi đáp (Q&A) (Giai đoạn tương tác - Trong sự kiện)
    if (canSeeAll) {
      tabs.push({ key: 'qa', label: 'Hỏi đáp (Q&A)', icon: MessageCircle });
    }

    // 8. Thử thách (Giai đoạn tương tác - Trong sự kiện)
    if (canSeeAll) {
      tabs.push({ key: "Thử thách", label: "Thử thách", icon: Trophy });
    }

    // 9. Vòng quay may mắn (Giai đoạn tương tác - Nếu có)
    if (canSeeAll && event?.hasLuckyDraw) {
      tabs.push({ key: "Vòng quay may mắn", label: "Vòng quay may mắn", icon: Gift });
    }

    // 10. Khảo sát (Giai đoạn tương tác/Phản hồi)
    if (canSeeAll) {
      tabs.push({ key: "Khảo sát", label: "Khảo sát", icon: ClipboardCheck });
    }

    // 11. Đánh giá (Giai đoạn hậu sự kiện)
    if (canSeeAll) {
      tabs.push({ key: 'feedback', label: 'Đánh giá', icon: MessageSquare });
    }

    // 12. Thống kê (Giai đoạn kết thúc - Báo cáo)
    if (canSeeAll || isAdvisor || up.canViewAnalytics) {
      tabs.push({ key: "Thống kê", label: "Thống kê", icon: TrendingUp });
    }

    // 13. Phân tích AI (Giai đoạn hậu sự kiện)
    if (canSeeAll || up.canViewAnalytics) {
      tabs.push({ key: "Phân tích AI", label: "Phân tích AI", icon: Bot });
    }

    // 14. Cài đặt (Hệ thống)
    if (canSeeAll || up.canEditEvent || event.currentUserRole?.organizerRole) {
      tabs.push({ key: "Cài đặt", label: "Cài đặt", icon: Settings });
    }

    return tabs;
  }, [event, up, isCoreTeam, isPresenter, isMember, isAdvisor, canSeeAll, isAdmin, t]);

  console.log("Event: ", event);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-500">{"Đang tải..."}</p>
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-red-500">
        <p>{"Không tìm thấy sự kiện"}</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-xl">{"Quay lại"}</button>
      </div>
    </div>
  );

  const currentStatus = STATUS_CONFIG[event.status] || { label: event.status, color: "bg-gray-100 text-gray-600" };
  const checkedInCount = event.registrations?.filter(r => r.checkedIn === true).length || 0;

  const getAllUserRoles = () => {
    const roles = [];
    const up = userPerms;

    // 1. Kiểm tra vai trò Ban tổ chức (Organizer)
    if (up.organizerRole) {
      roles.push(getOrganizerRole(up.organizerRole));
    }

    // 2. Kiểm tra vai trò Người tạo/Duyệt (Creator/Approver)
    // Jackson thường serialize 'isCreator' thành 'creator' hoặc 'isCreator'
    if (up.isCreator || up.creator) {
      roles.push({ label: "Trưởng nhóm", color: "bg-indigo-600 text-white" });
    }
    if (up.isApprover || up.approver) {
      roles.push({ label: "Người duyệt sự kiện", color: "bg-emerald-600 text-white" });
    }

    // 3. Kiểm tra vai trò Diễn giả (Presenter)
    if (up.isPresented || up.presented || up.presenter) {
      roles.push({ label: t('presenter'), color: "bg-amber-500 text-white" });
    }

    // 4. Kiểm tra vai trò Người tham gia (Participant)
    if (up.isRegistered || up.registered || up.registration) {
      roles.push({ label: "Người tham gia", color: "bg-blue-500 text-white" });
    }

    // 5. Nếu chưa có vai trò cụ thể nào trong sự kiện nhưng là Admin hệ thống
    if (roles.length === 0 && isAdmin) {
      roles.push({ label: "Quản trị viên", color: "bg-slate-800 text-white" });
    }
    return roles;
  };

  const userRoles = getAllUserRoles();

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Banner */}
      <div className="relative h-72 w-full overflow-hidden bg-slate-900">
        <img
          src={event.coverImage || "https://picsum.photos/1200/400?tech"}
          alt={event.title}
          className="w-full h-full object-cover opacity-80"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

        <button
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className="
          absolute top-5 left-5
          inline-flex items-center gap-2
          px-4 py-2
          rounded-xl
          bg-white
          text-slate-700
          text-sm font-medium
          border border-white/80
          hover:bg-slate-50
          transition-colors
        "
        >
          <ArrowLeft size={17} />
          {"Quay lại"}
        </button>

        <div className="absolute top-5 right-5">
          <span
            className={`
            inline-flex items-center
            px-4 py-2
            rounded-xl
            text-sm font-medium
            border
            ${currentStatus.color}
          `}
          >
            {currentStatus.label}
          </span>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative -mt-10 pb-12">
        {/* Header Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              {event.title}
            </h1>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Ngày tổ chức
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {formatDate(event.startTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <style>
            {`
            .custom-tabs-scrollbar::-webkit-scrollbar {
              height: 4px;
            }
            .custom-tabs-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
            }
            .custom-tabs-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 999px;
            }
            .custom-tabs-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}
          </style>

          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50 custom-tabs-scrollbar">
            {dynamicTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                  relative
                  min-w-fit
                  flex items-center justify-center gap-2
                  px-4 py-3
                  text-sm font-medium
                  transition-colors
                  ${isActive
                      ? "text-blue-600 bg-white"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }
                `}
                >
                  <Icon
                    size={16}
                    className={isActive ? "text-blue-600" : "text-slate-400"}
                  />

                  {tab.label}

                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600"
                      initial={false}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-5 md:p-6">
            {/* TỔNG QUAN */}
            {activeTab === "Tổng quan" && (
              <OverviewTab
                event={event}
                userRoles={userRoles}
                isAdmin={isAdmin}
                userPerms={userPerms}
                isMember={isMember}
                isCoreTeam={isCoreTeam}
                formatDate={formatDate}
                formatFullDateTime={formatFullDateTime}
                user={authUser}
                getOrganizerRole={getOrganizerRole}
              />
            )}

            {/* CHƯƠNG TRÌNH SỰ KIỆN */}
            {activeTab === "Chương trình" && <ProgramTab event={event} />}

            {/* ĐĂNG KÝ */}
            {activeTab === "Đăng ký" && (
              <RegistrationTab
                event={event}
                getRegistrationStatus={getRegistrationStatus}
                formatDateTime={formatDateTime}
              />
            )}

            {/* ĐIỂM DANH */}
            {activeTab === "Điểm danh" && (
              <CheckInTab
                event={event}
                checkedInCount={checkedInCount}
                handleToggleCheckIn={handleToggleCheckIn}
                handleUpdateQRType={handleUpdateQRType}
                handleShowEventQR={handleShowEventQR}
                userPerms={userPerms}
                isMember={isMember}
                isCoreTeam={isCoreTeam}
                isAdmin={isAdmin}
                isLeader={isLeader}
                onUndoCheckIn={onUndoCheckIn}
                onManualCheckIn={onManualCheckIn}
                editingTimeId={editingTimeId}
                setEditingTimeId={setEditingTimeId}
                newCheckInTime={newCheckInTime}
                setNewCheckInTime={setNewCheckInTime}
                isUpdatingTime={isUpdatingTime}
                onUpdateCheckInTime={onUpdateCheckInTime}
                formatDateTime={formatDateTime}
              />
            )}

            {/* BAN TỔ CHỨC */}
            {activeTab === "Ban tổ chức" && (
              <div className="space-y-6">
                <OrganizerInvitation
                  isAddingMember={isAddingMember}
                  setIsAddingMember={setIsAddingMember}
                  onFetchUsers={fetchUsers}
                  showUserSuggestions={showUserSuggestions}
                  setShowUserSuggestions={setShowUserSuggestions}
                  searchKey={searchKey}
                  setSearchKey={setSearchKey}
                  loadingUsers={loadingUsers}
                  filteredUsers={filteredUsers}
                  invitations={invitations}
                  addInvite={addInvite}
                  removeInvite={(idx) =>
                    setInvitations(invitations.filter((_, i) => i !== idx))
                  }
                  updateInvite={updateInvite}
                  handleSendInvites={handleSendInvites}
                  isInviting={isInviting}
                  availableInviteRoles={availableInviteRoles}
                />

                <OrganizerTab
                  event={event}
                  userPerms={userPerms}
                  authUser={authUser}
                  isAdmin={isAdmin}
                  isAddingMember={isAddingMember}
                  subTabOrganizer={subTabOrganizer}
                  setSubTabOrganizer={setSubTabOrganizer}
                  setIsAddingMember={setIsAddingMember}
                  addInvite={addInvite}
                  onRemoveMember={onRemoveMember}
                  onApproveLeave={onApproveLeave}
                  onRejectLeave={onRejectLeave}
                  formatDateTime={formatDateTime}
                  getOrganizerRole={getOrganizerRole}
                  setShowConfirmModal={setShowConfirmModal}
                  setConfirmConfig={setConfirmConfig}
                  onUpdateOrganizerRole={onUpdateOrganizerRole}
                />
              </div>
            )}

            {/* DIỄN GIẢ */}
            {activeTab === "Diễn giả" && (
              <PresenterTab
                event={event}
                userPerms={userPerms}
                isAddingPresenter={isAddingPresenter}
                setIsAddingPresenter={setIsAddingPresenter}
                addPresenterInvite={addPresenterInvite}
                onFetchUsers={fetchUsers}
                showUserSuggestions={showUserSuggestions}
                setShowUserSuggestions={setShowUserSuggestions}
                searchKey={searchKey}
                setSearchKey={setSearchKey}
                loadingUsers={loadingUsers}
                filteredUsers={filteredUsers}
                presenterInvitations={presenterInvitations}
                removePresenterInvite={(idx) =>
                  setPresenterInvitations(
                    presenterInvitations.filter((_, i) => i !== idx)
                  )
                }
                updatePresenterInvite={updatePresenterInvite}
                handleSendPresenterInvites={handleSendPresenterInvites}
                isInvitingPresenter={isInvitingPresenter}
                formatDateTime={formatDateTime}
                setConfirmConfig={setConfirmConfig}
                setShowConfirmModal={setShowConfirmModal}
                onRemoveMember={onRemoveMember}
                onRemovePresenter={onRemovePresenter}
              />
            )}

            {/* VÒNG QUAY MAY MẮN */}
            {activeTab === "Vòng quay may mắn" && (
              <LuckyDrawTab
                event={event}
                luckyDraw={luckyDraw}
                handleOpenDuckRace={handleOpenDuckRace}
                onRefresh={onRefresh}
                isAdmin={isAdmin}
                navigate={navigate}
                onOpenCreator={() => setShowLuckyDrawCreatorModal(true)}
              />
            )}

            {/* THỐNG KÊ */}
            {activeTab === "Thống kê" && (
              <div className="space-y-6">
                <EventStatistics
                  summary={
                    eventSummary || {
                      totalRegistered:
                        event.registeredCount ||
                        event.registrations?.length ||
                        0,
                      totalCheckedIn: checkedInCount,
                      attendanceRate:
                        (event.registeredCount ||
                          event.registrations?.length) > 0
                          ? (checkedInCount /
                            (event.registeredCount ||
                              event.registrations?.length)) *
                          100
                          : 0,
                      detailedAnalysis: eventSummary?.detailedAnalysis || {},
                      isLive: event.status === "ONGOING",
                    }
                  }
                  loading={loading}
                />
              </div>
            )}

            {/* PHÂN TÍCH AI */}
            {activeTab === "Phân tích AI" && (
              <div className="space-y-6">
                {event.status === "COMPLETED" ? (
                  <EventAIAnalysis eventId={event.id} />
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-8 shadow-sm">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bot size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Phân tích AI chưa sẵn sàng
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Tính năng phân tích AI chỉ khả dụng sau khi sự kiện hoàn toàn để thu thập đầy đủ dữ liệu thống kê, tương tác và phản hồi của người tham gia.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CÀI ĐẶT */}
            {activeTab === "Cài đặt" && (
              <SettingsTab
                event={event}
                isAdmin={isAdmin}
                isMember={isMember}
                userPerms={up}
                onEdit={onEditInfo}
                onNavigateToLuckyDraw={() => {
                  if (event?.hasLuckyDraw) {
                    setActiveTab("Vòng quay");
                  } else {
                    setShowLuckyDrawCreatorModal(true);
                  }
                }}
                setShowDeleteConfirm={setShowDeleteConfirm}
                onResetStatistics={() => {
                  toast.success("Đang làm mới dữ liệu thống kê...");
                  onRefresh();
                }}
                onLeaveTeam={() => {
                  setConfirmConfig({
                    title: "Xác nhận rời ban tổ chức",
                    message:
                      "Bạn có chắc chắn muốn rời ban tổ chức sự kiện này? Hành động này sẽ gửi yêu cầu đến Leader và Coordinator để phê duyệt.",
                    onConfirm: onLeaveTeam,
                    icon: LogOut,
                    color: "rose",
                  });
                  setShowConfirmModal(true);
                }}
              />
            )}

            {/* THỬ THÁCH */}
            {activeTab === "Thử thách" && (
              <QuizTab
                loadingQuizzes={loadingQuizzes}
                quizzes={quizzes}
                setShowQuizCreatorModal={setShowQuizCreatorModal}
                handleStartQuiz={handleStartQuiz}
                fileInputRef={fileInputRef}
                handleWordImport={handleWordImport}
                importingWord={importingWord}
              />
            )}

            {/* KHẢO SÁT */}
            {activeTab === "Khảo sát" && (
              <div className="space-y-6">
                <SurveyTab
                  event={event}
                  surveyFileInputRef={surveyFileInputRef}
                  handleSurveyWordImport={handleSurveyWordImport}
                  setShowSurveyModal={setShowSurveyModal}
                  showAllSurveyQuestions={showAllSurveyQuestions}
                  setShowAllSurveyQuestions={setShowAllSurveyQuestions}
                  setShowSurveyCreatorModal={setShowSurveyCreatorModal}
                />
              </div>
            )}

            {/* PHẢN HỒI / ĐÁNH GIÁ */}
            {activeTab === "feedback" && <FeedbackTab eventId={event.id} event={event} />}

            {/* HỎI ĐÁP Q&A */}
            {activeTab === "qa" && <QATab eventId={event.id} event={event} />}

            {/* FULL SCREEN JOIN MODAL */}
            <AnimatePresence>
              {showJoinCodeModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[5000] bg-slate-900 flex flex-col items-center justify-center p-6"
                >
                  <button
                    onClick={() => setShowJoinCodeModal(false)}
                    className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                  >
                    <X size={24} />
                  </button>

                  <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8"
                    >
                      <Trophy size={40} className="text-amber-300" />
                    </motion.div>

                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3">
                      Mã tham gia
                    </h2>

                    <p className="text-slate-300 text-sm mb-10">
                      Nhập PIN 6 số hoặc quét mã QR để tham gia thử thách
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-xl">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Mã PIN"
                        maxLength={6}
                        className="
                        flex-1 w-full
                        bg-white
                        rounded-2xl
                        px-6 py-5
                        text-3xl font-semibold
                        text-center uppercase tracking-[0.3em]
                        text-indigo-700
                        outline-none
                      "
                        onChange={(e) => {
                          const val = e.target.value.replace(/\s+/g, "").toUpperCase();
                          e.target.value = val;
                          if (val.length === 6) {
                            const matched = quizzes.find((q) =>
                              q.id?.startsWith(val.toLowerCase())
                            );
                            if (matched) {
                                // Enforce Check-in logic
                                const isSystemAdmin = ["SUPER_ADMIN", "ADMIN"].includes(authUser?.role?.toUpperCase());
                                const isLecturer = authUser?.role?.toUpperCase() === "LECTURER";
                                const roleData = event?.currentUserRole || {};
                                const isTeam = roleData?.creator || roleData?.approver || !!roleData?.organizerRole;
                                const canBypassCheckIn = isSystemAdmin || isLecturer || isTeam;

                                if (matched.requireCheckIn && !canBypassCheckIn) {
                                  if (!authUser) {
                                    toast.error("Vui lòng đăng nhập và check-in để tham gia thử thách này.");
                                    e.target.value = "";
                                    return;
                                  }
                                  if (!roleData?.registered || !roleData?.registration?.checkedIn) {
                                    toast.error("Bạn cần hoàn tất Check-in tại quầy để tham gia thử thách này!");
                                    e.target.value = "";
                                    return;
                                  }
                                }

                              setActiveQuizId(matched.id);
                              setQuizIsOrganizer(false);
                              setShowQuizModal(true);
                              setShowJoinCodeModal(false);
                              toast.success("Đang kết nối...");
                            } else {
                              toast.error("Mã PIN không đúng");
                            }
                          }
                        }}
                      />

                      <button
                        onClick={() => {
                          setShowJoinCodeModal(false);
                          setTimeout(() => {
                            setShowQuizScanner(true);
                          }, 300);
                        }}
                        className="
                        w-full md:w-28 h-16 md:h-24
                        bg-amber-400
                        text-slate-900
                        rounded-2xl
                        flex md:flex-col items-center justify-center gap-2
                        hover:bg-amber-300
                        transition-colors
                        font-medium
                      "
                      >
                        <QrCode size={28} />
                        <span className="text-xs">Quét QR</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Xác nhận xóa sự kiện
                  </h3>

                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Sự kiện cùng các dữ liệu liên quan sẽ bị xóa mềm và không còn hiển thị trong hệ thống.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
                <p className="text-sm text-amber-700 leading-relaxed">
                  Bao gồm:
                </p>

                <ul className="mt-2 text-sm text-amber-700 space-y-1 list-disc pl-5">
                  <li>Phiên họp (sessions)</li>
                  <li>Bài viết liên quan (posts)</li>
                  <li>Dữ liệu đăng ký tham gia</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>

                <button
                  onClick={onDeleteEvent}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                >
                  {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={onQRScanSuccess}
      />

      {/* EVENT QR MODAL */}
      <AnimatePresence>
        {showEventQRModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEventQRModal(false)}
              className="absolute inset-0 bg-black/50"
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200"
            >
              <div className="p-6 text-center">
                <div className="flex justify-between items-start mb-5">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-800">
                      QR điểm danh
                    </h3>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${event?.qrType === "DYNAMIC"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}
                      >
                        {event?.qrType === "DYNAMIC" ? "QR động" : "QR tĩnh"}
                      </span>

                      {event?.qrType === "DYNAMIC" && (
                        <span className="text-xs text-slate-400">
                          {qrCountdown}s
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!loadingQR && eventQRToken && (
                      <button
                        onClick={downloadEventQR}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-indigo-600"
                        title="Tải mã QR"
                      >
                        <Download size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => setShowEventQRModal(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => !loadingQR && setShowQRZoom(true)}
                  className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-5 flex items-center justify-center min-h-[230px] relative group cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {loadingQR ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-slate-500">Đang tạo mã...</p>
                    </div>
                  ) : (
                    <>
                      <QRCode id="event-qr-code" value={eventQRToken} size={200} />

                      {event?.qrType === "DYNAMIC" && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 overflow-hidden rounded-b-xl">
                          <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{
                              duration: 30,
                              ease: "linear",
                              repeat: Infinity,
                            }}
                            className="h-full bg-indigo-600"
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-xl text-white">
                        <Maximize2 size={28} className="mb-2" />
                        <span className="text-xs font-medium">Phóng to</span>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-sm font-medium text-slate-800 line-clamp-2">
                  {event?.title}
                </p>

                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Nhấp vào mã QR để phóng to hoặc tải về để in.
                </p>

                <button
                  onClick={() => setShowEventQRModal(false)}
                  className="mt-6 w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR ZOOM MODAL */}
      <AnimatePresence>
        {showQRZoom && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRZoom(false)}
              className="absolute inset-0 bg-black/70"
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center"
            >
              <div className="flex justify-center mb-5">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <QRCode value={eventQRToken} size={300} />
                </div>
              </div>

              <h4 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                {event?.title}
              </h4>

              <p className="text-sm text-slate-500 mb-6">
                Quét mã QR để điểm danh sự kiện
              </p>

              <button
                onClick={() => setShowQRZoom(false)}
                className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL XÁC NHẬN CHUNG */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/40"
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${confirmConfig.color === "rose"
                      ? "bg-rose-50 text-rose-600"
                      : confirmConfig.color === "amber"
                        ? "bg-amber-50 text-amber-600"
                        : confirmConfig.color === "emerald"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                  >
                    {confirmConfig.icon && (
                      <confirmConfig.icon className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {confirmConfig.title}
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed mt-1">
                      {confirmConfig.message}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    onClick={() => {
                      confirmConfig.onConfirm();
                      setShowConfirmModal(false);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${confirmConfig.color === "rose"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : confirmConfig.color === "amber"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : confirmConfig.color === "emerald"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUIZ MODAL */}
      {showQuizModal && (
        <QuizModal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          eventId={event.id}
          quizId={activeQuizId || wsActiveQuizId}
          isOrganizer={quizIsOrganizer}
          quizControls={quizControls}
        />
      )}

      <QuizCreatorModal
        isOpen={showQuizCreatorModal}
        onClose={() => setShowQuizCreatorModal(false)}
        eventId={event.id}
        onCreated={fetchQuizzes}
      />

      <DuckRaceLuckyDraw
        isOpen={showDuckRace}
        onClose={() => {
          setShowDuckRace(false);
          onRefresh();
        }}
        participants={raceParticipants}
        onSpin={handleDuckSpin}
        campaignTitle={luckyDraw?.luckyDraw?.title || luckyDraw?.title}
        prizes={luckyDraw?.luckyDraw?.prizes || luckyDraw?.prizes || []}
        luckyDrawId={luckyDraw?.id || luckyDraw?.luckyDraw?.id}
      />

      <SurveyCreatorModal
        isOpen={showSurveyCreatorModal}
        onClose={() => setShowSurveyCreatorModal(false)}
        eventId={event.id}
        onSaved={() => { }}
      />

      <SurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onRefresh={onRefresh}
      />

      <LuckyDrawCreatorModal
        isOpen={showLuckyDrawCreatorModal}
        onClose={() => setShowLuckyDrawCreatorModal(false)}
        event={event}
        onRefresh={onRefresh}
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
};

export default EventDetailManagement;
