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
  Waves
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
import QRCode from "react-qr-code";
import DuckRaceLuckyDraw from "../../engagement/DuckRaceLuckyDraw";
import { useQuiz } from "../../../hooks/useQuiz";
import { toast } from "react-toastify";
import luckyDrawService from "../../../services/luckyDrawService";
import eventService from "../../../services/eventService";

// Helper components that were inside the page
const Field = ({ label, children, required, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
    {label && (
      <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
    )}
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    style={{
      width: "100%",
      padding: "12px 16px",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      fontSize: 14,
      outline: "none",
      transition: "all 0.2s",
      background: "#fff",
      ...props.style
    }}
  />
);

const Select = (props) => (
  <select
    {...props}
    style={{
      width: "100%",
      padding: "12px 16px",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      fontSize: 14,
      outline: "none",
      background: "#fff",
      cursor: "pointer",
      ...props.style
    }}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    style={{
      width: "100%",
      padding: "12px 16px",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      fontSize: 14,
      outline: "none",
      resize: "none",
      background: "#fff",
      ...props.style
    }}
  />
);

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
  onBack = () => { },
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
    let interval;
    if (showEventQRModal && !loadingQR && event?.qrType === "DYNAMIC") {
      interval = setInterval(async () => {
        try {
          const res = await eventService.getEventQRToken(event.id);
          setEventQRToken(res.data.token);
        } catch (err) {
          console.error("Lỗi refresh QR:", err);
        }
      }, 30000); // 30 giây
    }
    return () => clearInterval(interval);
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
  const systemRole = up.systemRole || authUser?.role || (authUser?.roles && authUser.roles[0]) || "";
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

    // 10. Cài đặt (Hệ thống)
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
        <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 hover:bg-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow transition-all"><ArrowLeft size={18} /> Quay lại</button>
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
          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50 no-scrollbar">
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
              <div className="space-y-8">
                {/* TIMELINE SECTION (Simplified) */}
                <div className="pb-16">
                  <h3 className="font-bold text-sm mb-16 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                    <Flag className="text-amber-500" size={18} /> Lộ trình thời gian
                  </h3>

                  <div className="relative px-4">
                    <div className="mx-20 relative">
                      {/* Background Line */}
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />

                      {/* Calculation of positions */}
                      {(() => {
                        const now = new Date();
                        const deadline = new Date(event.registrationDeadline);
                        const start = new Date(event.startTime);
                        const end = new Date(event.endTime);

                        const allDates = [deadline, start, end, now].filter(d => !isNaN(d.getTime())).sort((a, b) => a - b);
                        if (allDates.length < 2) return null;

                        const minDate = allDates[0];
                        const maxDate = allDates[allDates.length - 1];
                        const totalSpan = maxDate - minDate || 1;

                        const getPos = (date) => Math.min(Math.max(((date - minDate) / totalSpan) * 100, 0), 100);

                        const deadlinePos = getPos(deadline);
                        const startPos = getPos(start);
                        const endPos = getPos(end);
                        const nowPos = getPos(now);
                        const isPast = (date) => now > date;

                        return (
                          <>
                            {/* Progress Line */}
                            <div
                              className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                              style={{ width: `${nowPos}%` }}
                            />

                            {/* MILESTONE: DEADLINE */}
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${deadlinePos}%` }}>
                              <div className={`w-3 h-3 rounded-full border-2 ${isPast(deadline) ? 'bg-indigo-500 border-indigo-100' : 'bg-white border-slate-300'} z-10`} />
                              <div className="absolute top-1/2 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
                              <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center w-32">
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Hạn đăng ký</p>
                                <p className="text-[10px] font-bold text-slate-700 leading-tight">{formatFullDateTime(event.registrationDeadline)}</p>
                              </div>
                            </div>

                            {/* MILESTONE: START */}
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${startPos}%` }}>
                              <div className={`w-3 h-3 rounded-full border-2 ${isPast(start) ? 'bg-indigo-500 border-indigo-100' : 'bg-white border-slate-300'} z-10`} />
                              <div className="absolute bottom-1/2 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
                              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center w-32">
                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Bắt đầu</p>
                                <p className="text-[10px] font-bold text-slate-700 leading-tight">{formatFullDateTime(event.startTime)}</p>
                              </div>
                            </div>

                            {/* MILESTONE: END */}
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${endPos}%` }}>
                              <div className={`w-3 h-3 rounded-full border-2 ${isPast(end) ? 'bg-indigo-500 border-indigo-100' : 'bg-white border-slate-300'} z-10`} />
                              <div className="absolute top-1/2 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
                              <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center w-32">
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Kết thúc</p>
                                <p className="text-[10px] font-bold text-slate-700 leading-tight">{formatFullDateTime(event.endTime)}</p>
                              </div>
                            </div>

                            {/* CURRENT TIME INDICATOR */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                              style={{ left: `${nowPos}%` }}
                            >
                              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse border-2 border-white">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
                                HÔM NAY
                              </div>
                              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center w-32">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Hiện tại</p>
                                <p className="text-[11px] font-black text-slate-900">{formatFullDateTime(now)}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* CỘT 1: QUYỀN HẠN CỦA BẠN */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden group h-full">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <UserCheck size={80} />
                    </div>
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                      <UserPlus size={18} className="text-indigo-600" /> Quyền hạn của bạn
                    </h3>
                    {userRoles.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vị trí hiện tại</span>
                          <div className="flex flex-wrap gap-2">
                            {userRoles.map((r, i) => (
                              <span key={i} className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase ${r.color}`}>
                                {r.label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khả năng thao tác</span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {(isAdmin || userPerms.canEditEvent) && <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Chỉnh sửa sự kiện</div>}
                            {(isAdmin || userPerms.canManageTeam) && <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Quản lý nhân sự</div>}
                            {(isAdmin || userPerms.canCheckIn || isMember || isCoreTeam) && <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Thực hiện điểm danh</div>}
                            {(isAdmin || userPerms.canViewAnalytics) && <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Xem báo cáo thống kê</div>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-xs text-slate-400 italic">Bạn đang xem với tư cách khách</p>
                      </div>
                    )}
                  </div>

                  {/* CỘT 2: THÔNG TIN CHUNG */}
                  <div className="h-full">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><Info size={18} className="text-blue-600" /> Thông tin chung</h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex flex-col"><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider">Chủ đề</span><span className="text-slate-700 font-medium">{event.eventTopic}</span></div>
                      <div className="flex flex-col"><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider">Loại sự kiện</span><span className="text-slate-700 font-medium">{event.type}</span></div>
                      <div className="flex flex-col"><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider">Số lượng tối đa</span><span className="text-slate-700 font-medium">{event.maxParticipants} người</span></div>
                    </div>
                  </div>

                  {/* CỘT 3: ĐỐI TƯỢNG */}
                  <div className="h-full">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><Users size={18} className="text-emerald-600" /> Đối tượng & Đơn vị</h3>
                    <div className="space-y-4 text-sm">
                      <div><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider mb-1 block">Đối tượng mục tiêu</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">{event.targetObjects?.length > 0 ? event.targetObjects.map((obj, i) => (<span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-medium border border-emerald-100">{obj.name}</span>)) : <span className="text-gray-400 italic">Không giới hạn</span>}</div>
                      </div>
                    </div>
                  </div>

                  {/* CỘT 4: NHÂN SỰ PHỤ TRÁCH */}
                  <div className="h-full">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><UserCheck size={18} className="text-blue-600" /> Nhân sự phụ trách</h3>
                    <div className="space-y-3">
                      {event.creator && (
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                          <img src={event.creator.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-9 h-9 rounded-full" alt="" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{event.creator.fullName}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-black">Người tạo sự kiện</p>
                          </div>
                        </div>
                      )}
                      {event.approver && (
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                          <img src={event.approver.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-9 h-9 rounded-full" alt="" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{event.approver.fullName}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-black">Người duyệt sự kiện</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHƯƠNG TRÌNH SỰ KIỆN */}
            {activeTab === "Chương trình" && (
              <div className="max-w-4xl mx-auto py-4">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Lịch trình chi tiết</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {event.sessions?.length || 0} phiên thảo luận
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative space-y-8 before:absolute before:inset-y-0 before:left-[90px] md:before:left-[110px] before:w-[2px] before:bg-slate-50">
                  {event.sessions?.length > 0 ? [...event.sessions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map((session, idx) => (
                    <div key={idx} className="relative flex items-start gap-6 md:gap-10 group">
                      {/* Time Column */}
                      <div className="w-[80px] md:w-[90px] flex-shrink-0 pt-2 text-right">
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-slate-900 tabular-nums">
                            {new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 tabular-nums">
                            đến {new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Node */}
                      <div className="absolute left-[90px] md:left-[110px] top-[14px] -ml-[7px] w-3.5 h-3.5 rounded-full bg-white border-[3px] border-indigo-600 z-10 shadow-sm transition-all duration-300 ring-4 ring-white" />

                      {/* Card Content */}
                      <div className="flex-1 pb-4">
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-indigo-100/20 transition-all duration-300 relative overflow-hidden">
                          {/* Room Tag */}
                          {session.room && (
                            <div className="absolute top-0 right-0 px-3 py-1 bg-slate-50 border-bl border-slate-50 rounded-bl-xl flex items-center gap-1.5">
                              <MapPin size={10} className="text-rose-500" />
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{session.room}</span>
                            </div>
                          )}

                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                  PHIÊN {idx + 1}
                                </span>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">/ {session.type || "SESSION"}</span>
                              </div>
                              <h4 className="text-base font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                                {session.title}
                              </h4>
                              {session.description && (
                                <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                                  {session.description}
                                </p>
                              )}
                            </div>

                            {session.presenter && (
                              <div className="pt-4 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={session.presenter.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.presenter.fullName)}&background=random`}
                                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-50"
                                    alt={session.presenter.fullName}
                                  />
                                  <div>
                                    <h5 className="font-bold text-slate-800 text-sm leading-tight">{session.presenter.fullName}</h5>
                                    <p className="text-[10px] text-slate-400 font-medium italic">Diễn giả chính</p>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    <Mail size={10} className="text-indigo-400" />
                                    <span className="text-[10px] font-bold tabular-nums tracking-tight">{session.presenter.email}</span>
                                  </div>
                                  {session.presenter.phone && (
                                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                      <Phone size={10} className="text-emerald-400" />
                                      <span className="text-[10px] font-bold tabular-nums tracking-tight">{session.presenter.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                        <Clock className="text-slate-300" size={40} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">Chưa có chương trình chi tiết</h4>
                      <p className="text-slate-400 mt-2 max-w-sm mx-auto">Chúng tôi đang cập nhật nội dung các phiên thảo luận. Vui lòng quay lại sau.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ĐĂNG KÝ */}
            {activeTab === "Đăng ký" && (
              <div>
                <h3 className="font-semibold text-lg mb-6">Danh sách đăng ký ({event.registeredCount})</h3>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr><th className="p-4 text-left text-gray-600 w-[150px]">Mã vé</th><th className="p-4 text-left text-gray-600">Người tham gia</th><th className="p-4 text-left text-gray-600">Trạng thái</th><th className="p-4 text-left text-gray-600">Đăng ký lúc</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {event.registrations?.length > 0 ? event.registrations.map((reg, idx) => {
                        const statusDisplay = getRegistrationStatus(reg.status);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono text-xs text-blue-600">{reg.ticketCode || "—"}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-gray-100">
                                  {reg.profile?.avatarUrl ? (
                                    <img src={reg.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-black uppercase">
                                      {(reg.profile?.fullName || reg.participantAccountId)?.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 leading-tight text-xs">{reg.profile?.fullName || "—"}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">{reg.participantAccountId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4"><span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>{statusDisplay.label}</span></td>
                            <td className="p-4 text-gray-600 text-xs">{formatDateTime(reg.registeredAt)}</td>
                          </tr>
                        );
                      }) : <tr><td colSpan="4" className="p-20 text-center text-gray-500">Chưa có người đăng ký nào</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Điểm danh" && (
              <div>
                <div className="flex items-center justify-between mb-6 bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                  <div>
                    <h3 className="font-bold text-lg text-indigo-900">Điểm danh ({checkedInCount} / {event.registeredCount})</h3>
                    <p className="text-xs text-indigo-600 mt-1 font-medium">Ban tổ chức kiểm soát việc mở/đóng và hiển thị mã quét</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-indigo-200 shadow-sm">
                      <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Trạng thái</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={event.checkInEnabled}
                          onChange={(e) => handleToggleCheckIn(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* QR Type Switch */}
                    <div className="flex items-center gap-2 bg-white px-1 py-1 rounded-2xl border border-indigo-100 shadow-sm">
                      <button
                        onClick={() => handleUpdateQRType("DYNAMIC")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${event.qrType === "DYNAMIC"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-400 hover:text-slate-600"
                          }`}
                      >
                        QR ĐỘNG
                      </button>
                      <button
                        onClick={() => handleUpdateQRType("STATIC")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${event.qrType === "STATIC"
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-400 hover:text-slate-600"
                          }`}
                      >
                        QR TĨNH
                      </button>
                    </div>

                    {(userPerms.canCheckIn || isMember || isCoreTeam || isAdmin) && (
                      <button
                        onClick={handleShowEventQR}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        <QrCode size={18} /> Hiển thị mã QR
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr><th className="p-4 text-left text-gray-600">Mã vé</th><th className="p-4 text-left text-gray-600">Người tham gia</th><th className="p-4 text-left text-gray-600">Check-in</th><th className="p-4 text-left text-gray-600">Thời gian</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {event.registrations?.length > 0 ? event.registrations.map((reg, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono text-xs text-blue-600">{reg.ticketCode || "—"}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-gray-100">
                                {reg.profile?.avatarUrl ? (
                                  <img src={reg.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-black uppercase">
                                    {(reg.profile?.fullName || reg.participantAccountId)?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 leading-tight text-xs">{reg.profile?.fullName || "—"}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{reg.participantAccountId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {reg.checkedIn ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-600 flex items-center gap-1 font-bold text-xs uppercase">
                                    <CheckCircle size={14} /> Đã điểm danh
                                  </span>
                                  {(isAdmin || userPerms.canCheckIn || isLeader || isCoreTeam) && (
                                    <button
                                      onClick={() => onUndoCheckIn(reg.id)}
                                      className="ml-auto text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase transition-colors underline decoration-dotted"
                                    >
                                      Hủy
                                    </button>
                                  )}
                                </div>
                                {reg.checkedInBy && (
                                  <div className="flex items-center gap-1.5 opacity-60">
                                    <img src={reg.checkedInBy.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-3.5 h-3.5 rounded-full" alt="" />
                                    <span className="text-[9px] font-bold text-slate-500">Bởi: {reg.checkedInBy.fullName}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-tight italic">Chưa check-in</span>
                                {(isAdmin || userPerms.canCheckIn || isLeader || isCoreTeam) && (
                                  <button
                                    onClick={() => onManualCheckIn(reg.id)}
                                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold uppercase transition-all border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50"
                                  >
                                    Check-in thủ công
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {editingTimeId === reg.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="datetime-local"
                                  value={newCheckInTime}
                                  onChange={(e) => setNewCheckInTime(e.target.value)}
                                  className="text-[11px] p-1 border rounded"
                                />
                                <button
                                  disabled={isUpdatingTime}
                                  onClick={async () => {
                                    setIsUpdatingTime(true);
                                    try {
                                      await onUpdateCheckInTime(reg.id, newCheckInTime);
                                      setEditingTimeId(null);
                                    } finally {
                                      setIsUpdatingTime(false);
                                    }
                                  }}
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  {isUpdatingTime ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                                </button>
                                <button
                                  onClick={() => setEditingTimeId(null)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">
                                  {reg.checkInTime ? formatDateTime(reg.checkInTime) : "—"}
                                </span>
                                {reg.checkedIn && (isAdmin || userPerms.canCheckIn || isLeader || isCoreTeam) && (
                                  <button
                                    onClick={() => {
                                      setEditingTimeId(reg.id);
                                      setNewCheckInTime(reg.checkInTime ? reg.checkInTime.substring(0, 16) : new Date().toISOString().substring(0, 16));
                                    }}
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Chỉnh sửa thời gian"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )) : <tr><td colSpan="4" className="p-20 text-center text-gray-500">Chưa có dữ liệu</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BAN TỔ CHỨC */}
            {activeTab === "Ban tổ chức" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    {isAddingMember && (
                      <div className="flex gap-3">
                        <button onClick={() => { onFetchUsers(); setShowUserSuggestions(!showUserSuggestions); }} className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">AI gợi ý</button>
                        <button onClick={() => addInvite()} className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Thêm thủ công</button>
                        <button onClick={() => setIsAddingMember(false)} className="bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Hủy</button>
                      </div>
                    )}
                  </div>
                </div>

                {isAddingMember && (
                  <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 space-y-6">
                    {showUserSuggestions && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xl max-h-[350px] overflow-y-auto space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <Input className="pl-10 h-11 rounded-xl border-slate-100 focus:ring-indigo-500" placeholder="Tìm kiếm theo tên hoặc email..." value={searchKey} onChange={e => setSearchKey(e.target.value)} />
                        </div>
                        {loadingUsers ? (
                          <div className="py-10 text-center space-y-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tìm kiếm nhân sự...</p>
                          </div>
                        ) : filteredUsers.map(u => (
                          <div key={u.id} onClick={() => { addInvite(u); setShowUserSuggestions(false); }} className="p-4 hover:bg-indigo-50/50 cursor-pointer rounded-2xl border border-transparent hover:border-indigo-100 flex items-center justify-between group transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-white transition-colors">
                                <UserCheck size={20} className="text-slate-400 group-hover:text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800">{u.fullName || u.profile?.fullName || u.username}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{u.email}</p>
                              </div>
                            </div>
                            <Plus size={18} className="text-slate-300 group-hover:text-indigo-600" />
                          </div>
                        ))}
                      </div>
                    )}
                    {invitations.map((invite, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 relative shadow-sm hover:shadow-md transition-shadow">
                        <button onClick={() => removeInvite(idx)} className="absolute top-6 right-6 p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"><X size={18} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Field label="Địa chỉ Email nhân sự *">
                            <Input className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500" placeholder="example@domain.com" value={invite.inviteeEmail} onChange={e => updateInvite(idx, 'inviteeEmail', e.target.value)} />
                          </Field>
                          <Field label="Phân quyền vai trò">
                            <Select
                              className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                              value={invite.targetRole}
                              onChange={e => updateInvite(idx, 'targetRole', e.target.value)}
                            >
                              {availableInviteRoles.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </Select>
                          </Field>
                        </div>
                        <div className="mt-6">
                          <Field label="Lời nhắn mời tham gia">
                            <textarea
                              className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium min-h-[100px]"
                              placeholder="Chào bạn, mời bạn tham gia vào ban tổ chức sự kiện..."
                              value={invite.message}
                              onChange={e => updateInvite(idx, 'message', e.target.value)}
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                    {invitations.length > 0 && (
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handleSendInvites}
                          disabled={isInviting}
                          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-3"
                        >
                          {isInviting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={20} />}
                          {isInviting ? "ĐANG GỬI LỜI MỜI..." : "XÁC NHẬN GỬI LỜI MỜI"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* BAN TỔ CHỨC */}
                {activeTab === "Ban tổ chức" && (
                  <div className="space-y-8">
                    {/* Organization Header */}
                    {event.organization && (
                      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />

                        <div className="relative flex flex-col md:flex-row items-center gap-8">
                          <div className="w-24 h-24 bg-white rounded-3xl p-3 shadow-2xl flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform">
                            <img
                              src={event.organization.logoUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                              alt={event.organization.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="text-center md:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">
                                {event.organization.type || "ORGANIZATION"}
                              </span>
                              <span className="text-indigo-100 text-xs font-bold flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-400" />
                                Đơn vị tổ chức xác thực
                              </span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">{event.organization.name}</h2>
                            <p className="text-indigo-100/80 text-sm font-medium max-w-xl">
                              Chịu trách nhiệm điều phối và quản lý toàn diện các hoạt động trong khuôn khổ sự kiện.
                            </p>
                          </div>

                          <div className="md:ml-auto flex items-center gap-6 border-l border-white/10 pl-8 hidden lg:flex">
                            <div className="text-center">
                              <div className="text-2xl font-black">{(event.organizers?.length || 0)}</div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Nhân sự</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-black">{event.organizers?.filter(o => o.role === 'LEADER').length || 0}</div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Lãnh đạo</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                        <h3 className="font-black text-xl text-slate-800">Đội ngũ vận hành</h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {userPerms.canManageTeam && (
                          <button
                            onClick={() => setActiveTab("Lời mời")}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
                          >
                            <UserPlus size={18} /> Mời thành viên
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex border-b border-gray-100 mb-8 gap-8 overflow-x-auto no-scrollbar">
                      {[
                        { key: "ALL", label: "Tất cả", count: (event.organizers?.length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER').length || 0) },
                        { key: "LEADER", label: "Ban tổ chức", count: (event.organizers?.filter(o => o.role === 'LEADER').length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER' && i.targetRole === 'LEADER').length || 0) },
                        { key: "COORDINATOR", label: "Điều phối viên", count: (event.organizers?.filter(o => o.role === 'COORDINATOR').length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER' && i.targetRole === 'COORDINATOR').length || 0) },
                        { key: "MEMBER", label: "Thành viên", count: (event.organizers?.filter(o => o.role === 'MEMBER').length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER' && i.targetRole === 'MEMBER').length || 0) },
                        { key: "ADVISOR", label: "Cố vấn", count: (event.organizers?.filter(o => o.role === 'ADVISOR').length || 0) + (event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER' && i.targetRole === 'ADVISOR').length || 0) },
                        { key: "INVITATION", label: "Lời mời", count: event.invitations?.filter(i => i.status === 'PENDING' && i.type === 'ORGANIZER').length || 0 },
                        { key: "LEAVING", label: "Yêu cầu rời", count: event.organizers?.filter(o => o.status === 'LEAVING_PENDING').length || 0 },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setSubTabOrganizer(tab.key)}
                          className={`pb-4 text-[11px] font-black uppercase tracking-[0.1em] transition-all relative ${subTabOrganizer === tab.key ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                        >
                          {tab.label}
                          {tab.count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${subTabOrganizer === tab.key ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>{tab.count}</span>}
                          {subTabOrganizer === tab.key && <motion.div layoutId="subTabOrganizer" className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-full" />}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Thông tin thành viên</th>
                            <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Vai trò</th>
                            <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Liên hệ</th>
                            <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái</th>
                            <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {(() => {
                            const accepted = (event.organizers || []).map(o => ({
                              ...o,
                              fullName: o.profile?.fullName || o.fullName,
                              avatarUrl: o.profile?.avatarUrl || o.avatarUrl,
                              email: o.profile?.email || o.email,
                              bio: o.profile?.bio || o.bio,
                              phone: o.profile?.phone || o.phone,
                              isPending: false
                            }));

                            const pending = (event.invitations || [])
                              .filter(inv => inv.status === 'PENDING' && inv.type === 'ORGANIZER')
                              .map(inv => ({
                                ...inv,
                                fullName: inv.invitee?.fullName || inv.inviteeEmail,
                                avatarUrl: inv.invitee?.avatarUrl,
                                email: inv.invitee?.email || inv.inviteeEmail,
                                bio: inv.message || "Lời mời ban tổ chức đang chờ xác nhận",
                                role: inv.targetRole,
                                isPending: true,
                                createdAt: inv.sentAt
                              }));

                            const combined = [...accepted, ...pending];

                            const visibleByRole = combined.filter(org => {
                              const requesterRole = userPerms.organizerRole;
                              const requesterId = authUser?.id;
                              if (userPerms.isCreator || isAdmin || requesterRole === 'LEADER' || requesterRole === 'ADVISOR') return true;
                              if (org.role === 'LEADER' || org.role === 'COORDINATOR') return true;
                              if (requesterRole === 'COORDINATOR') {
                                if (org.role === 'MEMBER' && (org.addedByAccountId === requesterId || org.inviterAccountId === requesterId)) return true;
                                return false;
                              }
                              if (requesterRole === 'MEMBER') return org.role === 'MEMBER';
                              return true;
                            });

                            const filtered = visibleByRole.filter(org => {
                              if (subTabOrganizer === "ALL") return true;
                              if (subTabOrganizer === "INVITATION") return org.isPending;
                              if (subTabOrganizer === "LEAVING") return org.status === 'LEAVING_PENDING';
                              return org.role === subTabOrganizer;
                            });

                            if (filtered.length === 0) {
                              return <tr><td colSpan={5} className="p-24 text-center">
                                <div className="flex flex-col items-center gap-3">
                                  <Users size={40} className="text-slate-200" />
                                  <p className="text-sm font-bold text-slate-400 italic">Không tìm thấy nhân sự phù hợp</p>
                                </div>
                              </td></tr>;
                            }

                            return filtered.map((org, idx) => {
                              const isMe = org.accountId === authUser?.id || org.id === authUser?.id || org.email === authUser?.email;
                              const roleData = getOrganizerRole(org.role);
                              return (
                                <tr key={idx} className={`hover:bg-slate-50 transition-all group ${org.isPending ? "bg-amber-50/10" : ""}`}>
                                  <td className="p-6">
                                    <div className="flex items-center gap-4">
                                      <div className="relative">
                                        <img
                                          src={org.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                          alt="Avatar"
                                          className={`w-12 h-12 rounded-2xl object-cover border-2 shadow-sm ${org.isPending ? "border-amber-200" : "border-white"}`}
                                        />
                                        {isMe && (
                                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 border-[3px] border-white rounded-full flex items-center justify-center shadow-md">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                          </div>
                                        )}
                                        {org.isPending && (
                                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                                            <Clock size={10} className="text-white animate-spin-slow" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className={`text-sm font-black tracking-tight ${isMe ? "text-indigo-600" : "text-slate-800"}`}>
                                            {org.fullName}
                                          </span>
                                          {isMe && <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-md uppercase tracking-widest">TÔI</span>}
                                          {org.isPending && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg uppercase tracking-wider border border-amber-200">Đang mời</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold leading-tight line-clamp-1 max-w-[200px]" title={org.bio}>
                                          {org.bio || "Thành viên Ban tổ chức"}
                                        </p>
                                        {org.isPending && (
                                          <div className="flex items-center gap-1 text-[9px] text-amber-600 font-bold">
                                            <Clock size={10} />
                                            Mời lúc: {formatDateTime(org.createdAt)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${roleData.color}`}>
                                      <div className={`w-1.5 h-1.5 rounded-full bg-current opacity-50`} />
                                      {roleData.label}
                                    </span>
                                  </td>
                                  <td className="p-6">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 text-slate-500">
                                        <Mail size={12} className="text-slate-400" />
                                        <span className="text-[10px] font-bold">{org.email}</span>
                                      </div>
                                      {org.phone && (
                                        <div className="flex items-center gap-2 text-slate-500">
                                          <Phone size={12} className="text-slate-400" />
                                          <span className="text-[10px] font-bold">{org.phone}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-6 text-center">
                                    {org.isPending ? (
                                      <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-amber-100 animate-pulse">
                                        ĐANG MỜI
                                      </span>
                                    ) : org.status === 'LEAVING_PENDING' ? (
                                      <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-rose-100 animate-pulse">
                                        XIN RỜI
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
                                        {org.status === 'ACTIVE' || !org.status ? 'CHÍNH THỨC' : org.status}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-6 text-center">
                                    <div className="flex items-center justify-center gap-2 transition-opacity">
                                      {org.isPending ? (
                                        (isAdmin || userPerms.canManageTeam) && (
                                          <button
                                            onClick={() => {
                                              setConfirmConfig({
                                                title: "Hủy lời mời",
                                                message: `Bạn có chắc muốn hủy lời mời tới ${org.fullName}?`,
                                                onConfirm: () => onRemoveMember(org),
                                                icon: X,
                                                color: "rose"
                                              });
                                              setShowConfirmModal(true);
                                            }}
                                            className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                                            title="Hủy lời mời"
                                          >
                                            <X size={18} />
                                          </button>
                                        )
                                      ) : org.status === 'LEAVING_PENDING' ? (
                                        (() => {
                                          const userRole = event.currentUserRole?.organizerRole;
                                          const canHandle = (org.role === 'COORDINATOR' || org.role === 'ADVISOR') ? userRole === 'LEADER' : (userRole === 'LEADER' || userRole === 'COORDINATOR');

                                          if (!canHandle) return <span className="text-[10px] text-slate-400 italic font-bold">Đang xử lý...</span>;

                                          return (
                                            <>
                                              <button
                                                onClick={() => {
                                                  setConfirmConfig({
                                                    title: "Phê duyệt rời nhóm",
                                                    message: `Chấp nhận yêu cầu rời ban tổ chức của ${org.fullName}?`,
                                                    onConfirm: () => onApproveLeave(org.id),
                                                    icon: CheckCircle,
                                                    color: "emerald"
                                                  });
                                                  setShowConfirmModal(true);
                                                }}
                                                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all" title="Chấp nhận"
                                              >
                                                <CheckCircle size={18} />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setConfirmConfig({
                                                    title: "Từ chối rời nhóm",
                                                    message: `Từ chối yêu cầu rời ban tổ chức của ${org.fullName}?`,
                                                    onConfirm: () => onRejectLeave(org.id),
                                                    icon: XCircle,
                                                    color: "rose"
                                                  });
                                                  setShowConfirmModal(true);
                                                }}
                                                className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all" title="Từ chối"
                                              >
                                                <XCircle size={18} />
                                              </button>
                                            </>
                                          );
                                        })()
                                      ) : (
                                        (isAdmin || userPerms.canManageTeam) && org.role !== 'LEADER' && (
                                          <button
                                            onClick={() => {
                                              setConfirmConfig({
                                                title: "Gỡ thành viên",
                                                message: `Bạn có chắc muốn gỡ ${org.fullName} khỏi ban tổ chức?`,
                                                onConfirm: () => onRemoveMember(org),
                                                icon: Trash2,
                                                color: "rose"
                                              });
                                              setShowConfirmModal(true);
                                            }}
                                            className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                                            title="Gỡ bỏ"
                                          >
                                            <Trash2 size={18} />
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DIỄN GIẢ */}
            {activeTab === "Diễn giả" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-4">
                  {!isAddingPresenter ? (
                    <><h3 className="font-semibold text-lg">Danh sách diễn giả ({event.presenters?.length || 0} người)</h3>{userPerms.canManageTeam && <button onClick={() => { setIsAddingPresenter(true); addPresenterInvite(); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"><UserPlus size={18} /> Thêm</button>}</>
                  ) : (
                    <><h3 className="font-bold flex items-center gap-2"><Sparkles size={20} className="text-emerald-500" /> Mời diễn giả mới</h3><div className="flex gap-3"><button onClick={() => { onFetchUsers(); setShowUserSuggestions(!showUserSuggestions); }} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">AI gợi ý</button><button onClick={() => addPresenterInvite()} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">Thêm thủ công</button><button onClick={() => setIsAddingPresenter(false)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold">Hủy</button></div></>
                  )}
                </div>

                {isAddingPresenter && (
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-dashed border-slate-200 space-y-4">
                    {showUserSuggestions && (
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm max-h-[300px] overflow-y-auto space-y-2 mb-4">
                        <Input placeholder="Tìm kiếm..." value={searchKey} onChange={e => setSearchKey(e.target.value)} />
                        {loadingUsers ? <p className="text-center text-gray-400">Đang tải...</p> : filteredUsers.map(u => (
                          <div key={u.id} onClick={() => { addPresenterInvite(u); setShowUserSuggestions(false); }} className="p-3 hover:bg-slate-50 cursor-pointer rounded-lg border border-transparent hover:border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><UserCheck size={16} /></div>
                            <div><p className="text-sm font-bold">{u.fullName || u.profile?.fullName || u.username}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {presenterInvitations.map((invite, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 relative shadow-sm">
                        <button onClick={() => removePresenterInvite(idx)} className="absolute top-4 right-4 p-2 text-red-500 bg-red-50 rounded-lg"><X size={16} /></button>
                        <Field label="Email *"><Input value={invite.inviteeEmail} onChange={e => updatePresenterInvite(idx, 'inviteeEmail', e.target.value)} /></Field>
                        <Field label="Phiên" style={{ marginTop: 16 }}>
                          <Select value={invite.session} onChange={e => updatePresenterInvite(idx, 'session', e.target.value)}>
                            <option value="ALL">Toàn bộ sự kiện</option>
                            {event.sessions?.slice().sort((a, b) => a.orderIndex - b.orderIndex).map(s => (
                              <option key={s.id} value={s.title}>Phiên {s.orderIndex}: {s.title}</option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Lời mời / Thông tin bổ sung" style={{ marginTop: 16 }}><Textarea value={invite.bio} onChange={e => updatePresenterInvite(idx, 'bio', e.target.value)} placeholder="Lời nhắn hoặc giới thiệu ngắn gọn về diễn giả..." rows={3} /></Field>
                      </div>
                    ))}
                    {presenterInvitations.length > 0 && <div className="flex justify-end"><button onClick={handleSendPresenterInvites} disabled={isInvitingPresenter} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50">{isInvitingPresenter ? "Đang gửi..." : "Gửi lời mời ngay"}</button></div>}
                  </div>
                )}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-center text-gray-600">Thông tin diễn giả</th>
                        <th className="p-4 text-left text-gray-600">Phiên</th>
                        {userPerms.canManageTeam && <th className="p-4 text-center text-gray-600">Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const accepted = (event.presenters || []).map(p => ({
                          ...p,
                          fullName: p.profile?.fullName || "Chưa có tên",
                          avatarUrl: p.profile?.avatarUrl,
                          email: p.profile?.email,
                          phone: p.profile?.phone,
                          bio: p.profile?.bio,
                          isPending: false,
                          displaySessions: p.sessions || []
                        }));

                        const pending = (event.invitations || [])
                          .filter(inv => inv.status === 'PENDING' && inv.type === 'PRESENTER')
                          .map(inv => ({
                            ...inv,
                            isPending: true,
                            fullName: inv.invitee?.fullName || inv.inviteeEmail,
                            avatarUrl: inv.invitee?.avatarUrl,
                            email: inv.invitee?.email || inv.inviteeEmail,
                            phone: inv.invitee?.phone,
                            bio: inv.presenterBio || "Lời mời diễn giả đang chờ xác nhận",
                            displaySessions: inv.presenterSession ? [{ title: inv.presenterSession }] : [],
                            createdAt: inv.sentAt
                          }));

                        const combined = [...accepted, ...pending];

                        if (combined.length === 0) {
                          return <tr><td colSpan={userPerms.canManageTeam ? "3" : "2"} className="p-20 text-center text-gray-500 italic bg-slate-50/30">Chưa có diễn giả tham gia sự kiện này</td></tr>;
                        }

                        return combined.map((p, idx) => (
                          <tr key={idx} className={`group hover:bg-slate-50/80 transition-all ${p.isPending ? "bg-amber-50/20" : ""}`}>
                            <td className="p-5">
                              <div className="flex items-center gap-5">
                                <div className="relative flex-shrink-0">
                                  <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-sm transition-transform group-hover:scale-105 ${p.isPending ? "border-amber-200" : "border-white"}`}>
                                    <img
                                      src={p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName)}&background=random`}
                                      alt="Avatar"
                                      className={`w-full h-full object-cover ${p.isPending ? "grayscale-[0.3]" : ""}`}
                                    />
                                  </div>
                                  {p.isPending && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                                      <Clock size={10} className="text-white animate-spin-slow" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="font-bold text-slate-900 truncate text-base">{p.fullName}</p>
                                    {p.isPending && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg uppercase tracking-wider border border-amber-200">Đang mời</span>}
                                  </div>
                                  <p className="text-xs text-slate-400 line-clamp-1 italic font-medium mb-2" title={p.bio}>
                                    {p.bio || "Diễn giả tham gia sự kiện"}
                                  </p>
                                  <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                      <Mail size={12} className="text-slate-400" />
                                      <span className="text-[11px] font-semibold">{p.email || "N/A"}</span>
                                    </div>
                                    {p.phone && (
                                      <div className="flex items-center gap-1.5 text-slate-500 border-l border-slate-200 pl-4">
                                        <Phone size={12} className="text-slate-400" />
                                        <span className="text-[11px] font-semibold">{p.phone}</span>
                                      </div>
                                    )}
                                    {p.isPending && (
                                      <div className="flex items-center gap-1.5 text-amber-600 border-l border-slate-200 pl-4">
                                        <Clock size={12} className="text-amber-400" />
                                        <span className="text-[10px] font-bold">Mời lúc: {formatDateTime(p.createdAt)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              <div className="flex flex-col gap-3 max-w-[400px] mx-auto">
                                {p.displaySessions?.length > 0 ? (
                                  p.displaySessions.map((s, sIdx) => (
                                    <div key={sIdx} className="relative pl-6 last:pb-0 pb-3 group/sess">
                                      {/* Vertical line connector */}
                                      {p.displaySessions.length > 1 && sIdx !== p.displaySessions.length - 1 && (
                                        <div className="absolute left-[7px] top-[14px] bottom-0 w-[2px] bg-slate-100 group-hover/sess:bg-indigo-100 transition-colors" />
                                      )}

                                      {/* Dot indicator */}
                                      <div className={`absolute left-0 top-[6px] w-[16px] h-[16px] rounded-full border-2 z-10 flex items-center justify-center transition-all ${p.isPending ? "bg-amber-50 border-amber-200 text-amber-500" : "bg-white border-indigo-200 text-indigo-500 group-hover/sess:border-indigo-400"}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                      </div>

                                      <div className="flex flex-col">
                                        <p className={`text-[11px] font-black uppercase tracking-tight mb-1 ${p.isPending ? "text-amber-700" : "text-slate-800 group-hover/sess:text-indigo-700"} transition-colors`}>
                                          {s.title}
                                        </p>

                                        {!p.isPending && s.startTime ? (
                                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold opacity-80">
                                            <div className="flex items-center gap-1">
                                              <Clock size={10} className="text-slate-400" />
                                              <span>{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {s.room && (
                                              <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                                                <MapPin size={10} className="text-slate-400" />
                                                <span>{s.room}</span>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          p.isPending && <span className="text-[9px] text-amber-600 font-bold italic">Dự kiến tham gia phiên này</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center">
                                    <span className="text-xs text-slate-400 font-medium italic">Chưa phân công phiên</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            {userPerms.canManageTeam && (
                              <td className="p-5 text-center">
                                <button
                                  onClick={() => {
                                    const isPending = p.isPending;
                                    setConfirmConfig({
                                      title: isPending ? "Hủy lời mời" : "Gỡ diễn giả",
                                      message: `Bạn có chắc muốn ${isPending ? "hủy lời mời tới" : "gỡ"} diễn giả ${p.fullName}?`,
                                      onConfirm: () => isPending ? onRemoveMember(p) : onRemovePresenter(p.id),
                                      icon: isPending ? X : Trash2,
                                      color: "rose"
                                    });
                                    setShowConfirmModal(true);
                                  }}
                                  className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-rose-100 border border-transparent hover:border-rose-100"
                                  title={p.isPending ? "Hủy lời mời" : "Gỡ bỏ"}
                                >
                                  {p.isPending ? <X size={20} /> : <Trash2 size={20} />}
                                </button>
                              </td>
                            )}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VÒNG QUAY */}
            {activeTab === "Vòng quay" && (
              <div className="space-y-6">
                {console.log("luckyDraw response in FE:", luckyDraw)}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Gift size={24} className="text-amber-500" /> {luckyDraw?.luckyDraw?.title || luckyDraw?.title || "Chương trình vòng quay"}
                    </h2>
                    <div className="flex items-center gap-3">
                      {event?.currentUserRole?.organizerRole === 'LEADER' && (
                        <button
                          onClick={handleOpenDuckRace}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-200"
                        >
                          <Waves size={16} /> Mở Đua Vịt (LIVE)
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng giải thưởng</p><p className="text-xl font-black text-slate-800">{(luckyDraw?.luckyDraw?.prizes?.length || luckyDraw?.prizes?.length) || 0}</p></div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã trúng giải</p><p className="text-xl font-black text-emerald-600">{(luckyDraw?.enrichedResults?.length || luckyDraw?.results?.length) || 0}</p></div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Người tham gia</p><p className="text-xl font-black text-blue-600">{(luckyDraw?.luckyDraw?.entries?.length || luckyDraw?.entries?.length) || 0}</p></div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                      <p className={`text-sm font-black mt-1 ${(luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "ACTIVE" ? "text-emerald-600 animate-pulse" :
                        (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "COMPLETED" ? "text-blue-600" :
                          (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "CANCELLED" ? "text-rose-600" : "text-amber-600"
                        }`}>
                        {
                          (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "PENDING" ? "Chờ bắt đầu" :
                            (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "ACTIVE" ? "Đang diễn ra" :
                              (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "COMPLETED" ? "Đã kết thúc" :
                                (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "CANCELLED" ? "Đã hủy" : "Không rõ"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Row 1: Prize Structure and Participants */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cơ cấu giải thưởng */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="p-4 bg-slate-50/50 border-b border-gray-100 font-extrabold text-slate-800 tracking-wide flex items-center justify-between">
                        <span>Cơ cấu giải thưởng</span>
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{(luckyDraw?.luckyDraw?.prizes || luckyDraw?.prizes)?.length || 0} Loại</span>
                      </div>
                      <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                        {(luckyDraw?.luckyDraw?.prizes || luckyDraw?.prizes)?.map(p => {
                          const total = p.quantity || 1;
                          const remaining = p.remainingQuantity ?? p.quantity ?? 1;
                          const pct = Math.round((remaining / total) * 100);
                          return (
                            <div key={p.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/60 transition-all cursor-default select-none">
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                  <span className="text-sm font-extrabold text-slate-800">{p.prizeName || p.name}</span>
                                  <span className="text-xs text-slate-400 mt-0.5">{p.description || "Quà tặng vòng quay may mắn"}</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs font-black px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg tracking-wider border border-indigo-100">
                                    {remaining} / {total}
                                  </span>
                                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Còn lại</span>
                                </div>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${pct > 50 ? "from-indigo-500 to-indigo-400" : "from-amber-500 to-amber-400"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Người tham gia */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="p-4 bg-slate-50/50 border-b border-gray-100 font-extrabold text-slate-800 tracking-wide flex items-center justify-between">
                        <span>Người tham gia</span>
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{(luckyDraw?.luckyDraw?.entries?.length || luckyDraw?.entries?.length) || 0} Người</span>
                      </div>
                      <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                        {(luckyDraw?.luckyDraw?.entries || luckyDraw?.entries)?.map(entry => {
                          const user = entry?.profile || entry?.user || entry?.participant || {};
                          return (
                            <div key={entry.id} className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition-all cursor-default select-none">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-400 flex items-center justify-center text-white font-black text-sm shadow-sm select-none">
                                  {user.fullName?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-extrabold text-slate-800">{user.fullName || "N/A"}</span>
                                  <span className="text-xs text-slate-400 font-medium">{user.email || "Email hidden"}</span>
                                </div>
                              </div>
                              <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider select-none ${entry.status === "VALID" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                                {entry.status === "VALID" ? "Hợp lệ" : entry.status}
                              </span>
                            </div>
                          );
                        })}
                        {(!luckyDraw?.luckyDraw?.entries?.length && !luckyDraw?.entries?.length) && (
                          <div className="p-8 text-center text-slate-400 text-xs">Chưa có ai tham gia</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Danh sách trúng thưởng */}
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="p-4 bg-slate-50/50 border-b border-gray-100 font-extrabold text-slate-800 tracking-wide flex items-center justify-between">
                      <span>Danh sách trúng thưởng</span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{(luckyDraw?.enrichedResults || luckyDraw?.results)?.length || 0} Người</span>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                      {(luckyDraw?.enrichedResults || luckyDraw?.results)?.map(res => {
                        const r = res?.result || res;
                        const timeStr = r.winTime || r.drawTime;
                        const formattedTime = timeStr ? new Date(timeStr).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        }) : "N/A";
                        return (
                          <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-all cursor-default select-none">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0 overflow-hidden select-none border border-emerald-200">
                                {r.winner?.avatarUrl ? (
                                  <img src={r.winner.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  r.winner?.fullName?.charAt(0).toUpperCase() || "N"
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                                  {r.winner?.fullName || "N/A"}
                                  {r.winner?.phone && (
                                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">
                                      {r.winner.phone}
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{r.winner?.email || "Email hidden"}</span>
                                {formattedTime && (
                                  <span className="text-[10px] text-slate-400 font-semibold mt-1">Trúng giải lúc: {formattedTime}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                              <span className="text-xs font-extrabold px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shadow-sm select-none">
                                {r.wonPrize?.name || r.prize?.prizeName || r.prize?.name || "Giải thưởng"}
                              </span>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const newClaimed = !r.claimed;
                                    await luckyDrawService.updateClaimed(r.id, newClaimed);
                                    toast.success("Cập nhật trạng thái thành công!");
                                    // re-trigger data loading of lucky draw details if available
                                    if (fetchLuckyDrawDetail) {
                                      fetchLuckyDrawDetail();
                                    } else if (handleOpenLuckyDrawModal) {
                                      handleOpenLuckyDrawModal();
                                    }
                                  } catch (err) {
                                    console.error("Lỗi khi cập nhật trạng thái nhận quà", err);
                                  }
                                }}
                                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border select-none transition-all ${r.claimed
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/50'
                                  : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/50'
                                  }`}
                              >
                                {r.claimed ? 'Đã nhận quà' : 'Chưa nhận quà'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
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

            {/* CÀI ĐẶT */}
            {activeTab === "Cài đặt" && (
              <div className="space-y-8">
                {/* Thiết lập cá nhân cho bất kỳ ai là BTC */}
                {event.currentUserRole?.organizerRole && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                          <Settings size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 uppercase tracking-tight">Thiết lập cá nhân</h4>
                          <p className="text-xs text-gray-500">Quản lý vai trò của bạn trong ban tổ chức</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const role = event.currentUserRole.organizerRole;
                          const needsApproval = role !== 'LEADER';
                          setConfirmConfig({
                            title: "Rời ban tổ chức",
                            message: needsApproval
                              ? "Vì bạn là " + getOrganizerRole(role).label + ", yêu cầu rời đi của bạn sẽ cần cấp trên phê duyệt. Bạn vẫn muốn tiếp tục?"
                              : "Bạn có chắc chắn muốn rời khỏi ban tổ chức sự kiện này?",
                            onConfirm: onLeaveTeam,
                            icon: AlertTriangle,
                            color: "rose"
                          });
                          setShowConfirmModal(true);
                        }}
                        className="text-rose-600 hover:bg-rose-50 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-rose-100"
                      >
                        <LogOut size={18} /> Rời khỏi ban tổ chức
                      </button>
                    </div>
                  </div>
                )}

                {/* Thiết lập hệ thống (Chỉ Core Team hoặc người có quyền Edit) */}
                {(canSeeAll || up.canEditEvent) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Cột 1: Thông tin & Tính năng tương tác */}
                    <div className="flex flex-col gap-6">
                      {/* Chỉnh sửa thông tin sự kiện (Trên cùng) */}
                      {(canSeeAll && canEdit) && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                              <Edit3 size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-tight">Chỉnh sửa thông tin</h4>
                              <p className="text-[10px] text-gray-500">Cập nhật tên, thời gian, địa điểm và mô tả sự kiện</p>
                            </div>
                          </div>
                          <button
                            onClick={onEditInfo}
                            className="whitespace-nowrap px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                          >
                            <Edit3 size={14} /> Chỉnh sửa ngay
                          </button>
                        </div>
                      )}

                      {/* Lucky Draw (Ở dưới Chỉnh sửa thông tin) */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                            <Gift size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-tight">Lucky Draw</h4>
                            <p className="text-[10px] text-gray-500">Thiết lập giải thưởng cho sự kiện</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const routePrefix = isAdmin ? '/admin' : '/lecturer';
                            navigate(`${routePrefix}/events/${event.id}/lucky-draw/setup`);
                          }}
                          className="whitespace-nowrap px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-100"
                        >
                          Thiết lập ngay
                        </button>
                      </div>
                    </div>

                    {/* Cột 2: Khu vực nguy hiểm */}
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-rose-600 font-bold text-sm mb-4 flex items-center gap-2">
                          <XCircle size={18} /> Khu vực nguy hiểm
                        </h3>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-rose-900">Hủy sự kiện</h4>
                            <p className="text-[10px] text-rose-700 mt-0.5">Dừng sự kiện và thông báo cho người tham gia.</p>
                          </div>
                          <button
                            onClick={() => setShowCancelInput(!showCancelInput)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showCancelInput ? 'bg-rose-100 text-rose-700' : 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                          >
                            {showCancelInput ? 'Đóng' : 'Hủy'}
                          </button>
                        </div>
                        {showCancelInput && (
                          <div className="mt-4 space-y-3 bg-white p-4 rounded-xl border border-rose-100 shadow-inner animate-in slide-in-from-top-2 duration-300">
                            <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Nhập lý do hủy..." rows={3} />
                            <div className="flex justify-end">
                              <button
                                onClick={onCancelEvent}
                                disabled={isCancelling}
                                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-all"
                              >
                                {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy vĩnh viễn'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="pt-6 border-t border-rose-100 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-rose-900">Xóa sự kiện</h4>
                          <p className="text-[10px] text-rose-700 mt-0.5">Xóa vĩnh viễn sự kiện này khỏi hệ thống.</p>
                        </div>
                        <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-all">Xóa ngay</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* THỬ THÁCH */}
            {activeTab === "Thử thách" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Thử thách trực tiếp</h3>
                    <p className="text-xs text-slate-500">Kích hoạt các bộ câu hỏi để tăng tương tác trong sự kiện</p>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleWordImport}
                      accept=".docx"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#f0f3ff] text-[#5c59f2] rounded-xl text-sm font-bold hover:bg-[#e8ebff] transition-all active:scale-95 border border-[#dce2ff]"
                    >
                      <FileUp size={18} /> Import Word
                    </button>
                    <button
                      onClick={() => setShowQuizCreatorModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#1a61ff] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-[#0051ff] transition-all active:scale-95"
                    >
                      <Plus size={18} /> Tạo bộ câu hỏi
                    </button>
                  </div>
                </div>

                {loadingQuizzes ? (
                  <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
                ) : quizzes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizzes.map(quiz => (
                      <div key={quiz.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">{quiz.title}</h4>
                          <p className="text-xs text-slate-500">{quiz.description || "Không có mô tả"}</p>
                          <div className="flex gap-2 mt-3">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black">{quiz.questions?.length || 0} CÂU HỎI</span>
                            {quiz.isActive && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-md text-[10px] font-black animate-pulse">ĐANG BẬT</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg active:scale-90"
                        >
                          <PlayCircle size={24} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">Chưa có bộ câu hỏi nào cho sự kiện này.</p>
                  </div>
                )}
              </div>
            )}

            {/* KHẢO SÁT */}
            {activeTab === "Khảo sát" && (
              <div className="space-y-6">
                <input
                  type="file"
                  ref={surveyFileInputRef}
                  className="hidden"
                  accept=".docx"
                  onChange={handleSurveyWordImport}
                />
                {event.survey ? (
                  <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-100/50">
                          <ClipboardCheck size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{event.survey.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{event.survey.description || "Không có mô tả"}</p>
                          <div className="flex gap-2 mt-3">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase">
                              {event.survey.questions?.length || 0} CÂU HỎI
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${event.survey.isPublished ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                              {event.survey.isPublished ? 'ĐÃ CÔNG BỐ' : 'BẢN NHÁP'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => surveyFileInputRef.current.click()}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#f0f3ff] text-[#5c59f2] rounded-xl text-sm font-bold hover:bg-[#e8ebff] transition-all"
                        >
                          <FileUp size={18} /> Ghi đè từ Word
                        </button>
                        {!event.survey.isPublished && (
                          <button
                            onClick={() => setShowSurveyModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a61ff] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-[#0051ff] transition-all"
                          >
                            <Plus size={18} /> Chỉnh sửa & Công bố
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {(showAllSurveyQuestions ? event.survey.questions : event.survey.questions?.slice(0, 3)).map((q, idx) => (
                        <div key={q.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-sm font-bold text-slate-700 flex items-start gap-2">
                            <span className="text-indigo-600">Q{idx + 1}.</span> {q.questionText}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}</p>
                        </div>
                      ))}
                      {event.survey.questions?.length > 3 && (
                        <button
                          onClick={() => setShowAllSurveyQuestions(!showAllSurveyQuestions)}
                          className="w-full py-2 text-center text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-all"
                        >
                          {showAllSurveyQuestions ? 'Thu gọn' : `...và ${event.survey.questions.length - 3} câu hỏi khác (Bấm để xem tất cả)`}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-indigo-50 border border-indigo-100 p-12 rounded-[3.5rem] text-center">
                    <div className="w-20 h-20 bg-white text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-100/50">
                      <ClipboardCheck size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">Chưa có khảo sát</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">Bạn có thể tạo form khảo sát để lắng nghe ý kiến đóng góp từ những người đã tham gia sự kiện.</p>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => surveyFileInputRef.current.click()}
                        className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95"
                      >
                        <FileUp size={20} /> Import từ Word
                      </button>
                      <button
                        onClick={() => setShowSurveyCreatorModal(true)}
                        className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <Plus size={20} /> Tạo mới khảo sát
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

                <div className="space-y-2">
                  <p className="text-slate-800 font-bold text-sm uppercase">{event?.title}</p>
                  <p className="text-slate-400 text-[10px] leading-relaxed px-4">
                    Nhấp vào mã QR để phóng to hoặc tải về để in ấn và sử dụng.
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
