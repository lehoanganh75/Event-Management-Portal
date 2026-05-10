import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Calendar, Clock, MapPin, Users, Award, TrendingUp, Settings, ArrowLeft,
  Edit3, CheckCircle, Flag, XCircle, Trash2,
  Star,
  Gift,
  PlayCircle,
  Trophy,
  Target,
  UserPlus,
  Sparkles,
  Plus,
  Search,
  UserCheck,
  X,
  List,
  Info,
  MessageSquare,
  AlertTriangle,
  Mail,
  Camera,
  Phone,
  FileText,
  FileUp,
  Send,
  Trash,
  LogOut,
  Loader2,
  Check,
  QrCode,
  Download,
  Maximize2,
  ClipboardCheck,
  ShieldCheck,
  Waves,
  Bot
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import SettingsTab from "./EventManagement/SettingsTab";
import QuizTab from "./EventManagement/QuizTab";
import SurveyTab from "./EventManagement/SurveyTab";
import RegistrationTab from "./EventManagement/RegistrationTab";
import CheckInTab from "./EventManagement/CheckInTab";
import OrganizerInvitation from "./EventManagement/OrganizerInvitation";



const ORGANIZER_ROLES = [
  { label: "Ban tổ chức", value: "LEADER" },
  { label: "Điều phối viên", value: "COORDINATOR" },
  { label: "Thành viên", value: "MEMBER" },
  { label: "Cố vấn", value: "ADVISOR" },
];

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

const formatFullDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

const getRegistrationStatus = (status) => {
  switch (status) {
    case "REGISTERED": return { label: "Đã đăng ký", color: "bg-blue-100 text-blue-700" };
    case "PENDING": return { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700" };
    case "ATTENDED": return { label: "Đã tham gia", color: "bg-emerald-100 text-emerald-700" };
    case "CANCELLED": return { label: "Đã hủy", color: "bg-red-100 text-red-700" };
    default: return { label: status || "Không xác định", color: "bg-gray-100 text-gray-600" };
  }
};

const getOrganizerRole = (role) => {
  switch (role) {
    case "LEADER": return { label: "Ban tổ chức", color: "bg-purple-100 text-purple-700" };
    case "COORDINATOR": return { label: "Điều phối viên", color: "bg-indigo-100 text-indigo-700" };
    case "MEMBER": return { label: "Thành viên", color: "bg-blue-100 text-blue-700" };
    case "ADVISOR": return { label: "Cố vấn", color: "bg-emerald-100 text-emerald-700" };
    case "PARTICIPANT": return { label: "Người tham gia", color: "bg-slate-100 text-slate-600" };
    default: return { label: role, color: "bg-gray-100 text-gray-600" };
  }
};

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
  // Invitations
  isAddingMember,
  setIsAddingMember,
  showUserSuggestions,
  setShowUserSuggestions,
  searchKey,
  setSearchKey,
  loadingUsers,
  filteredUsers,
  invitations,
  addInvite,
  updateInvite,
  removeInvite,
  handleSendInvites,
  isInviting,
  // Presenters
  isAddingPresenter,
  setIsAddingPresenter,
  presenterInvitations,
  addPresenterInvite,
  updatePresenterInvite,
  removePresenterInvite,
  handleSendPresenterInvites,
  isInvitingPresenter,
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
  onFetchUsers = () => { },
  onRemoveMember = () => { },
  onLeaveTeam = () => { },
  onApproveLeave = () => { },
  onRejectLeave = () => { },
  onRemovePresenter = () => { },
  onManualCheckIn = () => { },
  onUndoCheckIn = () => { },
  onUpdateCheckInTime = () => { },
  // QR Scanner props
  showQRScanner = false,
  setShowQRScanner = () => { },
  onQRScanSuccess = () => { },
  onRefresh = () => { },
}) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
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

    if (!file.name.endsWith('.docx')) {
      toast.error("Vui lòng chọn file Word (.docx)");
      return;
    }

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
  const [showQuizCreatorModal, setShowQuizCreatorModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showSurveyCreatorModal, setShowSurveyCreatorModal] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Duck Race states
  const [showDuckRace, setShowDuckRace] = useState(false);
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

  // Always-on WebSocket for quiz - connected at component level to never miss events
  const { quizState, leaderboard, activeQuizId: wsActiveQuizId } = useQuiz(event?.id);

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
      await eventService.startQuiz(quizId);
      toast.success("Đã bắt đầu thử thách! Sinh viên sẽ nhận được thông báo.");
      setActiveQuizId(quizId);
      setShowQuizModal(true);
      fetchQuizzes(); // refresh isActive state
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi bắt đầu thử thách");
    }
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
    let refreshInterval;
    let timerInterval;

    if (showEventQRModal && !loadingQR && event?.qrType === "DYNAMIC") {
      setQrCountdown(30);

      refreshInterval = setInterval(async () => {
        try {
          const res = await eventService.getEventQRToken(event.id);
          setEventQRToken(res.data.token);
          setQrCountdown(30);
        } catch (err) {
          console.error("Lỗi refresh QR:", err);
        }
      }, 30000);

      timerInterval = setInterval(() => {
        setQrCountdown(prev => (prev > 0 ? prev - 1 : 30));
      }, 1000);
    }

    return () => {
      clearInterval(refreshInterval);
      clearInterval(timerInterval);
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
    ['LEADER', 'COORDINATOR', 'ORGANIZER'].includes(up.organizerRole);

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

  const dynamicTabs = useMemo(() => {
    if (!event) return [];

    const tabs = [];

    // 1. Tổng quan (Giai đoạn chuẩn bị - Thông tin)
    tabs.push({ key: "Tổng quan", label: "Tổng quan", icon: Info });

    // 2. Chương trình (Giai đoạn chuẩn bị - Nội dung)
    tabs.push({ key: "Chương trình", label: "Chương trình", icon: List });

    // 3. Diễn giả (Giai đoạn chuẩn bị - Nhân sự then chốt)
    tabs.push({ key: "Diễn giả", label: "Diễn giả", icon: Star });

    // 4. Ban tổ chức (Giai đoạn chuẩn bị - Đội ngũ vận hành)
    tabs.push({ key: "Ban tổ chức", label: "Ban tổ chức", icon: Users });

    // Nếu là Diễn giả (và không phải Core Team), CHỈ hiện 4 tab trên
    if (isPresenter && !isCoreTeam) {
      return tabs;
    }

    // --- Logic cho các vai trò quản lý/BTC ---

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

    // 7. Thử thách (Giai đoạn tương tác)
    if (canSeeAll) {
      tabs.push({ key: "Thử thách", label: "Thử thách", icon: Trophy });
    }

    // 8. Khảo sát (Giai đoạn tương tác/Phản hồi)
    if (canSeeAll) {
      tabs.push({ key: "Khảo sát", label: "Khảo sát", icon: ClipboardCheck });
    }

    // Vòng quay may mắn (Giai đoạn tương tác - Nếu có)
    if (canSeeAll && event?.hasLuckyDraw) {
      tabs.push({ key: "Vòng quay", label: "Vòng quay may mắn", icon: Gift });
    }

    // 9. Thống kê (Giai đoạn kết thúc - Báo cáo)
    if (canSeeAll || isAdvisor || up.canViewAnalytics) {
      tabs.push({ key: "Thống kê", label: "Thống kê", icon: TrendingUp });
    }

    // 10. Phân tích AI (Giai đoạn hậu sự kiện)
    if (canSeeAll || up.canViewAnalytics) {
      tabs.push({ key: "Phân tích AI", label: "Phân tích AI", icon: Bot });
    }

    // 11. Cài đặt (Hệ thống)
    if (canSeeAll || up.canEditEvent || event.currentUserRole?.organizerRole) {
      tabs.push({ key: "Cài đặt", label: "Cài đặt", icon: Settings });
    }

    return tabs;
  }, [event, up, isCoreTeam, isPresenter, isMember, isAdvisor, canSeeAll, isAdmin]);

  console.log("Event: ", event);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-500">Đang tải thông tin sự kiện...</p>
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-red-500">
        <p>Không tìm thấy sự kiện hoặc đã xảy ra lỗi.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-xl">Quay lại</button>
      </div>
    </div>
  );

  const currentStatus = STATUS_CONFIG[event.status] || { label: event.status, color: "bg-gray-100 text-gray-600" };
  const attendedCount = event.registrations?.filter(r => r.status === "ATTENDED").length || 0;
  const pendingCount = event.registrations?.filter(r => r.status === "PENDING").length || 0;
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
      roles.push({ label: "Trưởng ban (Người tạo)", color: "bg-indigo-600 text-white" });
    }
    if (up.isApprover || up.approver) {
      roles.push({ label: "Người duyệt sự kiện", color: "bg-emerald-600 text-white" });
    }

    // 3. Kiểm tra vai trò Diễn giả (Presenter)
    if (up.isPresented || up.presented || up.presenter) {
      roles.push({ label: "Diễn giả", color: "bg-amber-500 text-white" });
    }

    // 4. Kiểm tra vai trò Người tham gia (Participant)
    if (up.isRegistered || up.registered || up.registration) {
      roles.push({ label: "Người tham gia", color: "bg-blue-500 text-white" });
    }

    // 5. Nếu chưa có vai trò cụ thể nào trong sự kiện nhưng là Admin hệ thống
    if (roles.length === 0 && isAdmin) {
      roles.push({ label: "Quản trị viên hệ thống", color: "bg-slate-800 text-white" });
    }
    return roles;
  };

  const userRoles = getAllUserRoles();


  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Banner */}
      <div className="relative h-80 w-full overflow-hidden">
        <img src={event.coverImage || "https://picsum.photos/1200/400?tech"} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        <button
          onClick={() => onBack ? onBack() : navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 hover:bg-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow transition-all"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <span className={`px-5 py-2 rounded-2xl text-sm font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative -mt-12 pb-12">
        {/* Header Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
            </div>
            {/* Nút chỉnh sửa đã được di chuyển vào tab Cài đặt */}
          </div>
          <p className="text-base text-gray-600 leading-relaxed">{event.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3">
            <div className="flex gap-3"><div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Calendar className="text-blue-600" size={22} /></div><div><p className="text-gray-500 text-xs">Ngày tổ chức</p><p className="font-semibold text-sm">{formatDate(event.startTime)}</p></div></div>
            <div className="flex gap-3"><div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><MapPin className="text-blue-600" size={22} /></div><div><p className="text-gray-500 text-xs">Địa điểm</p><p className="font-semibold text-sm">{event.location}</p><p className="text-xs text-gray-500">{event.eventMode === "OFFLINE" ? "Trực tiếp" : "Trực tuyến"}</p></div></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
                border-radius: 10px;
              }
              .custom-tabs-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}
          </style>
          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50 custom-tabs-scrollbar">
            {dynamicTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-3.5 text-[12px] font-bold transition-all relative flex-1 min-w-fit ${isActive ? "text-blue-600 bg-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                >
                  <Icon size={16} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
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
              />
            )}

            {/* CHƯƠNG TRÌNH SỰ KIỆN */}
            {activeTab === "Chương trình" && (
              <ProgramTab event={event} />
            )}

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
              <div className="space-y-8">
                <OrganizerInvitation
                  isAddingMember={isAddingMember}
                  setIsAddingMember={setIsAddingMember}
                  onFetchUsers={onFetchUsers}
                  showUserSuggestions={showUserSuggestions}
                  setShowUserSuggestions={setShowUserSuggestions}
                  searchKey={searchKey}
                  setSearchKey={setSearchKey}
                  loadingUsers={loadingUsers}
                  filteredUsers={filteredUsers}
                  invitations={invitations}
                  addInvite={addInvite}
                  removeInvite={removeInvite}
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
                onFetchUsers={onFetchUsers}
                showUserSuggestions={showUserSuggestions}
                setShowUserSuggestions={setShowUserSuggestions}
                searchKey={searchKey}
                setSearchKey={setSearchKey}
                loadingUsers={loadingUsers}
                filteredUsers={filteredUsers}
                presenterInvitations={presenterInvitations}
                removePresenterInvite={removePresenterInvite}
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
            {activeTab === "Vòng quay" && (
              <LuckyDrawTab
                event={event}
                luckyDraw={luckyDraw}
                handleOpenDuckRace={handleOpenDuckRace}
                onRefresh={onRefresh}
                isAdmin={isAdmin}
                navigate={navigate}
              />
            )}

            {/* THỐNG KÊ */}
            {activeTab === "Thống kê" && (
              <div className="space-y-8">
                <EventStatistics
                  summary={eventSummary || {
                    totalRegistered: event.registeredCount || event.registrations?.length || 0,
                    totalCheckedIn: checkedInCount,
                    attendanceRate: (event.registeredCount || event.registrations?.length) > 0
                      ? (checkedInCount / (event.registeredCount || event.registrations?.length)) * 100
                      : 0,
                    detailedAnalysis: eventSummary?.detailedAnalysis || {},
                    isLive: event.status === 'ONGOING'
                  }}
                  loading={loading}
                />
              </div>
            )}

            {/* PHÂN TÍCH AI */}
            {activeTab === "Phân tích AI" && (
              <div className="space-y-8">
                <EventAIAnalysis eventId={event.id} />
              </div>
            )}

            {/* CÀI ĐẶT */}
            {activeTab === "Cài đặt" && (
              <SettingsTab
                event={event}
                getOrganizerRole={getOrganizerRole}
                onLeaveTeam={onLeaveTeam}
                setConfirmConfig={setConfirmConfig}
                setShowConfirmModal={setShowConfirmModal}
                canSeeAll={canSeeAll}
                up={up}
                canEdit={canEdit}
                onEditInfo={onEditInfo}
                isAdmin={isAdmin}
                navigate={navigate}
                showCancelInput={showCancelInput}
                setShowCancelInput={setShowCancelInput}
                cancelReason={cancelReason}
                setCancelReason={setCancelReason}
                onCancelEvent={onCancelEvent}
                isCancelling={isCancelling}
                setShowDeleteConfirm={setShowDeleteConfirm}
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
              />
            )}

            {/* KHẢO SÁT */}
            {activeTab === "Khảo sát" && (
              <SurveyTab
                event={event}
                surveyFileInputRef={surveyFileInputRef}
                handleSurveyWordImport={handleSurveyWordImport}
                setShowSurveyModal={setShowSurveyModal}
                showAllSurveyQuestions={showAllSurveyQuestions}
                setShowAllSurveyQuestions={setShowAllSurveyQuestions}
                setShowSurveyCreatorModal={setShowSurveyCreatorModal}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Bạn có chắc chắn muốn xóa sự kiện này? Các thông tin liên quan như <strong>phiên họp (sessions)</strong> và <strong>bài viết (posts)</strong> cũng sẽ bị xóa mềm. Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Hủy bỏ</button>
              <button onClick={onDeleteEvent} disabled={isDeleting} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 disabled:opacity-50 transition-all">{isDeleting ? "Đang xóa..." : "Xác nhận xóa"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={onQRScanSuccess}
        title="Quét mã vé sinh viên"
        instruction="Vui lòng đưa mã QR trên vé của sinh viên vào khung hình camera để thực hiện điểm danh."
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden relative z-10 border border-white"
            >
              <div className="p-8 text-center">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">QR Điểm Danh</h3>
                  <div className="flex items-center gap-2">
                    {!loadingQR && eventQRToken && (
                      <button
                        onClick={downloadEventQR}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-indigo-600"
                        title="Tải mã QR"
                      >
                        <Download size={20} />
                      </button>
                    )}
                    <button onClick={() => setShowEventQRModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => !loadingQR && setShowQRZoom(true)}
                  className={`bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-6 flex items-center justify-center min-h-[240px] relative group cursor-pointer transition-all hover:bg-slate-100 active:scale-95`}
                >
                  {loadingQR ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-slate-500 font-medium">Đang tạo mã...</p>
                    </div>
                  ) : (
                    <>
                      <QRCode id="event-qr-code" value={eventQRToken} size={200} />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-[2rem] text-white">
                        <Maximize2 size={32} className="mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Phóng to</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-slate-800 font-bold text-base uppercase tracking-tight">{event?.title}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${event?.qrType === "DYNAMIC" ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {event?.qrType === "DYNAMIC" ? "QR Động (Bảo mật cao)" : "QR Tĩnh (Cố định)"}
                      </span>
                    </div>
                  </div>

                  {event?.qrType === "DYNAMIC" && (
                    <div className="flex flex-col items-center gap-2 px-6 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Mã sẽ làm mới sau</p>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-indigo-600 animate-pulse" />
                        <span className="text-2xl font-black text-indigo-900 font-mono">
                          {qrCountdown}s
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-slate-400 text-[10px] leading-relaxed px-4">
                    {event?.qrType === "DYNAMIC"
                      ? "Mã QR này chỉ có hiệu lực trong thời gian ngắn. Vui lòng yêu cầu người tham gia quét mã ngay."
                      : "Mã QR này cố định cho sự kiện này. Bạn có thể in mã này để người tham gia tự quét."
                    }
                  </p>
                </div>

                <button
                  onClick={() => setShowEventQRModal(false)}
                  className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
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
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative z-10 flex flex-col items-center gap-8"
            >
              <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-white">
                <QRCode value={eventQRToken} size={360} />
              </div>
              <div className="text-center text-white space-y-4">
                <h4 className="text-2xl font-black uppercase tracking-tight">{event?.title}</h4>
                <button
                  onClick={() => setShowQRZoom(false)}
                  className="px-12 py-4 bg-white text-slate-900 rounded-full font-black text-sm uppercase tracking-[3px] hover:bg-slate-100 transition-all active:scale-95"
                >
                  Đóng phóng to
                </button>
              </div>
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-white"
            >
              <div className="p-8 text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-${confirmConfig.color}-50`}>
                  {confirmConfig.icon && <confirmConfig.icon className={`w-8 h-8 text-${confirmConfig.color}-500`} />}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{confirmConfig.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{confirmConfig.message}</p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => {
                      confirmConfig.onConfirm();
                      setShowConfirmModal(false);
                    }}
                    className={`py-3.5 px-6 bg-${confirmConfig.color}-600 hover:bg-${confirmConfig.color}-700 text-white rounded-xl font-bold shadow-lg shadow-${confirmConfig.color}-100 transition-all`}
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
      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        eventId={event.id}
        quizId={activeQuizId || wsActiveQuizId}
        isOrganizer={true}
        quizState={quizState}
        leaderboard={leaderboard}
      />

      {/* QUIZ CREATOR MODAL */}
      <QuizCreatorModal
        isOpen={showQuizCreatorModal}
        onClose={() => setShowQuizCreatorModal(false)}
        eventId={event.id}
        onCreated={fetchQuizzes}
      />

      {/* DUCK RACE MODAL */}
      <DuckRaceLuckyDraw
        isOpen={showDuckRace}
        onClose={() => {
          setShowDuckRace(false);
          onRefresh(); // Refresh to see new winners
        }}
        participants={raceParticipants}
        onSpin={handleDuckSpin}
        campaignTitle={luckyDraw?.luckyDraw?.title || luckyDraw?.title}
        prizes={luckyDraw?.luckyDraw?.prizes || luckyDraw?.prizes || []}
        luckyDrawId={luckyDraw?.id || luckyDraw?.luckyDraw?.id}
      />

      {/* SURVEY CREATOR MODAL */}
      <SurveyCreatorModal
        isOpen={showSurveyCreatorModal}
        onClose={() => setShowSurveyCreatorModal(false)}
        eventId={event.id}
        onSaved={() => { }}
      />

      {/* SURVEY MODAL (student view) */}
      <SurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        eventId={event.id}
      />
    </div>
  );
};

export default EventDetailManagement;