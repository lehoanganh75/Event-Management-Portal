import React, { useMemo, useState, useEffect } from "react";
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
  Send,
  Trash,
  LogOut,
  Loader2,
  Check,
  QrCode,
  Download,
  Maximize2,
  ClipboardCheck
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
import eventService from "../../../services/eventService";
import { useQuiz } from "../../../hooks/useQuiz";
import { toast } from "react-toastify";

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
    case "ADVISOR": return { label: "Cố vấn", color: "bg-teal-100 text-teal-700" };

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

  // Event QR Token states
  const [showEventQRModal, setShowEventQRModal] = useState(false);
  const [eventQRToken, setEventQRToken] = useState("");
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

    // Mọi vai trò đều thấy 2 tab này
    const baseTabs = [
      { key: "Tổng quan", label: "Tổng quan", icon: Info },
      { key: "Chương trình", label: "Chương trình", icon: List },
    ];

    // Nếu là Diễn giả (và không phải Core Team), CHỈ hiện thêm 2 tab nhân sự, KHÔNG hiện gì khác
    if (isPresenter && !isCoreTeam) {
      baseTabs.push({ key: "Ban tổ chức", label: "Ban tổ chức", icon: Users });
      baseTabs.push({ key: "Diễn giả", label: "Diễn giả", icon: Star });
      return baseTabs;
    }

    // --- Logic cho các vai trò khác ---

    // Đăng ký & Điểm danh (Core Team, Admin, hoặc Member trong BTC)
    if (canSeeAll || isMember) {
      if (canSeeAll || up.canManageRegistrations) baseTabs.push({ key: "Đăng ký", label: "Đăng ký", icon: UserCheck });
      // Cho phép cả Member thấy tab Điểm danh để hỗ trợ quét mã
      if (canSeeAll || isMember || up.canCheckIn) baseTabs.push({ key: "Điểm danh", label: "Điểm danh", icon: CheckCircle });
    }

    // Nhân sự (Mọi người đều thấy nhưng nội dung bên trong có thể khác)
    baseTabs.push({ key: "Ban tổ chức", label: "Ban tổ chức", icon: Users });
    baseTabs.push({ key: "Diễn giả", label: "Diễn giả", icon: Star });

    // Vòng quay may mắn (Chỉ khi sự kiện có và là Core/Admin)
    if (canSeeAll && event?.hasLuckyDraw) {
      baseTabs.push({ key: "Vòng quay", label: "Vòng quay may mắn", icon: Gift });
    }

    // Thống kê (Core Team, Admin, hoặc Advisor)
    if (canSeeAll || isAdvisor || up.canViewAnalytics) {
      baseTabs.push({ key: "Thống kê", label: "Thống kê", icon: TrendingUp });
    }

    // Thử thách & Khảo sát (BTC & Admin)
    if (canSeeAll) {
      baseTabs.push({ key: "Thử thách", label: "Thử thách", icon: Trophy });
      baseTabs.push({ key: "Khảo sát", label: "Khảo sát", icon: ClipboardCheck });
    }

    // Cài đặt (Mọi thành viên Ban tổ chức đều thấy để có thể rời ban, nhưng nội dung bên trong sẽ khác nhau)
    if (canSeeAll || up.canEditEvent || event.currentUserRole?.organizer) {
      baseTabs.push({ key: "Cài đặt", label: "Cài đặt", icon: Settings });
    }

    return baseTabs;
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
          <div className="flex gap-2">
            {userRoles.map((r, i) => (
              <span key={i} className={`px-3 py-1.5 rounded-2xl text-[10px] font-bold uppercase shadow-sm ${r.color}`}>
                {r.label}
              </span>
            ))}
          </div>
          <span className={`px-5 py-2 rounded-2xl text-sm font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 -mt-12 pb-12">
        {/* Header Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
              {userRoles.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1.5">
                    {userRoles.map((r, i) => (
                      <span key={i} className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${r.color}`}>
                        {r.label}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">• Tư cách của bạn</span>
                </div>
              )}
            </div>
            {canSeeAll && canEdit && (
              <button
                onClick={onEditInfo}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all shadow-sm"
              >
                <Edit3 size={16} /> Chỉnh sửa
              </button>
            )}
          </div>
          <p className="text-base text-gray-600 leading-relaxed">{event.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3">
            <div className="flex gap-3"><div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Calendar className="text-blue-600" size={22} /></div><div><p className="text-gray-500 text-xs">Ngày tổ chức</p><p className="font-semibold text-sm">{formatDate(event.startTime)}</p></div></div>
            <div className="flex gap-3"><div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Clock className="text-blue-600" size={22} /></div><div><p className="text-gray-500 text-xs">Thời gian</p><p className="font-semibold text-sm">{new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p></div></div>
            <div className="flex gap-3"><div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><MapPin className="text-blue-600" size={22} /></div><div><p className="text-gray-500 text-xs">Địa điểm</p><p className="font-semibold text-sm">{event.location}</p><p className="text-xs text-gray-500">{event.eventMode === "OFFLINE" ? "Trực tiếp" : "Trực tuyến"}</p></div></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-400 overflow-x-auto bg-gray-50 no-scrollbar">
            {dynamicTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative min-w-max ${activeTab === tab.key ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-600 hover:text-slate-800"}`}><Icon size={16} />{tab.label}</button>
              );
            })}
          </div>

          <div className="p-6">
            {/* TỔNG QUAN */}
            {activeTab === "Tổng quan" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-base mb-4 flex items-center gap-2"><Flag className="text-amber-600" size={20} /> Các mốc thời gian quan trọng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><Calendar className="text-blue-600" size={18} /></div><div><p className="text-[11px] text-gray-500 font-medium">BẮT ĐẦU</p></div></div><p className="text-sm font-medium text-slate-700">{formatFullDateTime(event.startTime)}</p></div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><Clock className="text-red-600" size={18} /></div><div><p className="text-[11px] text-gray-500 font-medium">HẠN ĐĂNG KÝ</p></div></div><p className="text-sm font-medium text-slate-700">{formatFullDateTime(event.registrationDeadline)}</p></div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><Calendar className="text-emerald-600" size={18} /></div><div><p className="text-[11px] text-gray-500 font-medium">KẾT THÚC</p></div></div><p className="text-sm font-medium text-slate-700">{formatFullDateTime(event.endTime)}</p></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* CỘT 1: THÔNG TIN CỦA BẠN (MỚI) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden group">
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
                            {!(isAdmin || userPerms.canEditEvent || userPerms.canManageTeam || userPerms.canCheckIn) && (
                              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md"><Info size={12} /> Chỉ xem thông tin</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-xs text-slate-400 italic">Bạn đang xem với tư cách khách</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><Info size={18} className="text-blue-600" /> Thông tin chung</h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex flex-col"><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider">Chủ đề</span><span className="text-slate-700 font-medium">{event.eventTopic}</span></div>
                      <div className="flex flex-col"><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider">Loại sự kiện</span><span className="text-slate-700 font-medium">{event.type}</span></div>
                      <div className="flex flex-col"><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider">Số lượng tối đa</span><span className="text-slate-700 font-medium">{event.maxParticipants} người</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><Users size={18} className="text-emerald-600" /> Đối tượng & Đơn vị</h3>
                    <div className="space-y-4 text-sm">
                      <div><span className="text-gray-500 text-[11px] uppercase font-bold tracking-wider mb-1 block">Đối tượng mục tiêu</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">{event.targetObjects?.length > 0 ? event.targetObjects.map((obj, i) => (<span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-medium border border-emerald-100">{obj.name}</span>)) : <span className="text-gray-400 italic">Không giới hạn</span>}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHƯƠNG TRÌNH */}
            {activeTab === "Chương trình" && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg flex items-center gap-2"><List size={20} className="text-blue-600" /> Nội dung chương trình ({event.sessions?.length || 0} phiên)</h3>
                <div className="space-y-6">
                  {event.sessions?.length > 0 ? [...event.sessions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map((session, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3"><span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">{session.type || "SESSION"}</span><h4 className="font-bold text-slate-800 text-lg">{session.title}</h4></div>
                          <p className="text-sm text-gray-500 flex items-center gap-2"><Clock size={14} />{new Date(session.startTime).toLocaleTimeString('vi-VN')} - {new Date(session.endTime).toLocaleTimeString('vi-VN')}<span className="mx-2 text-gray-300">|</span><MapPin size={14} />{session.room || "Chưa rõ"}</p>
                        </div>
                      </div>
                    </div>
                  )) : <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-gray-200"><p className="text-gray-500">Chưa có thông tin</p></div>}
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
                                  {reg.avatarUrl ? (
                                    <img src={reg.avatarUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-black uppercase">
                                      {reg.fullName?.charAt(0) || reg.participantAccountId?.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 leading-tight text-xs">{reg.fullName || "—"}</p>
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
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                          event.qrType === "DYNAMIC" 
                            ? "bg-indigo-600 text-white shadow-md" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        QR ĐỘNG
                      </button>
                      <button
                        onClick={() => handleUpdateQRType("STATIC")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                          event.qrType === "STATIC" 
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
                                {reg.avatarUrl ? (
                                  <img src={reg.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-black uppercase">
                                    {reg.fullName?.charAt(0) || reg.participantAccountId?.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 leading-tight text-xs">{reg.fullName || "—"}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{reg.participantAccountId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {reg.checkedIn ? (
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
                  {!isAddingMember ? (
                    <h3 className="font-semibold text-lg">Ban tổ chức ({event.organizers?.length || 0} người)</h3>
                  ) : (
                    <h3 className="font-bold flex items-center gap-2"><UserPlus size={20} className="text-emerald-500" /> Mời thành viên mới</h3>
                  )}

                  <div className="flex items-center gap-3">
                    {userPerms.canManageTeam && !isAddingMember && (
                      <button 
                        onClick={() => { setIsAddingMember(true); addInvite(); }} 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                      >
                        <UserPlus size={18} /> Thêm
                      </button>
                    )}

                    {isAddingMember && (
                      <div className="flex gap-3">
                        <button onClick={() => { onFetchUsers(); setShowUserSuggestions(!showUserSuggestions); }} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">AI gợi ý</button>
                        <button onClick={() => addInvite()} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">Thêm thủ công</button>
                        <button onClick={() => setIsAddingMember(false)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold">Hủy</button>
                      </div>
                    )}
                  </div>
                </div>

                {isAddingMember && (
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-dashed border-slate-200 space-y-4">
                    {showUserSuggestions && (
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm max-h-[300px] overflow-y-auto space-y-2">
                        <Input placeholder="Tìm kiếm..." value={searchKey} onChange={e => setSearchKey(e.target.value)} />
                        {loadingUsers ? <p className="text-center text-gray-400">Đang tải...</p> : filteredUsers.map(u => (
                          <div key={u.id} onClick={() => { addInvite(u); setShowUserSuggestions(false); }} className="p-3 hover:bg-slate-50 cursor-pointer rounded-lg border border-transparent hover:border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><UserCheck size={16} /></div>
                            <div><p className="text-sm font-bold">{u.fullName || u.profile?.fullName || u.username}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {invitations.map((invite, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 relative shadow-sm">
                        <button onClick={() => removeInvite(idx)} className="absolute top-4 right-4 p-2 text-red-500 bg-red-50 rounded-lg"><X size={16} /></button>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Email *"><Input value={invite.inviteeEmail} onChange={e => updateInvite(idx, 'inviteeEmail', e.target.value)} /></Field>
                          <Field label="Vai trò">
                            <Select 
                              value={invite.targetRole} 
                              onChange={e => updateInvite(idx, 'targetRole', e.target.value)}
                            >
                              {availableInviteRoles.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </Select>
                          </Field>
                        </div>
                        <Field label="Lời nhắn" style={{ marginTop: 16 }}><Input value={invite.message} onChange={e => updateInvite(idx, 'message', e.target.value)} /></Field>
                      </div>
                    ))}
                    {invitations.length > 0 && <div className="flex justify-end"><button onClick={handleSendInvites} disabled={isInviting} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50">{isInviting ? "Đang gửi..." : "Gửi lời mời ngay"}</button></div>}
                  </div>
                )}

                <div className="flex border-b border-gray-100 mb-6 gap-6 overflow-x-auto no-scrollbar">
                  {[
                    { key: "ALL", label: "Tất cả", count: (event.organizers?.length || 0) + (event.invitations?.filter(i => i.status === 'PENDING').length || 0) },
                    { key: "LEADER", label: "Ban tổ chức", count: event.organizers?.filter(o => o.role === 'LEADER').length || 0 },
                    { key: "COORDINATOR", label: "Điều phối viên", count: event.organizers?.filter(o => o.role === 'COORDINATOR').length || 0 },
                    { key: "MEMBER", label: "Thành viên", count: event.organizers?.filter(o => o.role === 'MEMBER').length || 0 },
                    { key: "PENDING", label: "Chờ xác nhận", count: event.invitations?.filter(i => i.status === 'PENDING').length || 0 },
                    { key: "LEAVING", label: "Yêu cầu rời", count: event.organizers?.filter(o => o.status === 'LEAVING_PENDING').length || 0 },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSubTabOrganizer(tab.key)}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${subTabOrganizer === tab.key ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {tab.label}
                      {tab.count > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] ${subTabOrganizer === tab.key ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>{tab.count}</span>}
                      {subTabOrganizer === tab.key && <motion.div layoutId="subTabOrganizer" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                    </button>
                  ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-left text-gray-600">Họ tên</th>
                        <th className="p-4 text-left text-gray-600">Vai trò</th>
                        <th className="p-4 text-left text-gray-600 text-center">Ngày phân công</th>
                        <th className="p-4 text-center text-gray-600">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const organizers = event.organizers || [];
                        const pendingInvites = (event.invitations || [])
                          .filter(inv => inv.status === 'PENDING' && inv.type !== 'PRESENTER')
                          .map(inv => ({
                            ...inv,
                            isPending: true,
                            fullName: inv.inviteeName,
                            email: inv.inviteeEmail,
                            role: inv.targetRole,
                            createdAt: inv.sentAt
                          }));
                        const combined = [...organizers, ...pendingInvites];

                        // --- BẮT ĐẦU: LỌC HIỂN THỊ THEO VAI TRÒ (PHÂN QUYỀN DỮ LIỆU) ---
                        const visibleByRole = combined.filter(org => {
                          const requesterRole = userPerms.organizerRole;
                          const requesterId = authUser?.id;
                          
                          // 1. Leader/Creator/Admin/Advisor: Thấy hết
                          if (userPerms.isCreator || isAdmin || requesterRole === 'LEADER' || requesterRole === 'ADVISOR') return true;
                          
                          // 2. Các vai trò quản lý cấp cao (Leader/Coordinator) luôn công khai cho mọi người trong BTC thấy
                          if (org.role === 'LEADER' || org.role === 'COORDINATOR') return true;

                          // 3. Coordinator (Điều phối viên)
                          if (requesterRole === 'COORDINATOR') {
                            // Thấy member mà mình đã mời (check qua addedByAccountId cho member đã vào hoặc inviterAccountId cho member pending)
                            if (org.role === 'MEMBER' && (org.addedByAccountId === requesterId || org.inviterAccountId === requesterId)) return true;
                            return false;
                          }
                          
                          // 4. Member (Thành viên)
                          if (requesterRole === 'MEMBER') {
                            // Thấy các member khác
                            return org.role === 'MEMBER';
                          }
                          
                          return true;
                        });

                        const filtered = visibleByRole.filter(org => {
                          if (subTabOrganizer === "ALL") return true;
                          if (subTabOrganizer === "PENDING") return org.isPending;
                          if (subTabOrganizer === "LEAVING") return org.status === 'LEAVING_PENDING';
                          return org.role === subTabOrganizer;
                        });
                        // --- KẾT THÚC: LỌC HIỂN THỊ ---

                        if (filtered.length === 0) {
                          return <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic">Không có dữ liệu phù hợp</td></tr>;
                        }

                        return filtered.map((org, idx) => {
                          const isMe = org.accountId === authUser?.id || org.id === authUser?.id || org.email === authUser?.email;
                          return (
                            <tr key={idx} className={`hover:bg-slate-50 transition-colors ${org.isPending ? "opacity-75" : ""}`}>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <img
                                      src={org.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                      alt="Avatar"
                                      className={`w-8 h-8 rounded-full object-cover border ${org.isPending ? "border-amber-200 grayscale-[0.5]" : "border-slate-200"}`}
                                    />
                                    {org.isPending && (
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-white rounded-full animate-pulse" title="Đang chờ xác nhận" />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${isMe ? "text-blue-700" : "text-slate-800"}`}>
                                        {enrichedNames[org.accountId] || enrichedNames[org.email] || org.fullName || org.inviteeEmail}
                                      </span>
                                      {isMe && <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase tracking-tighter">Bạn</span>}
                                      {org.status === 'LEAVING_PENDING' && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black rounded uppercase tracking-tighter animate-pulse">Đang xin rời</span>}
                                    </div>
                                    {org.isPending && <span className="text-[10px] text-amber-600 font-bold italic">Đang chờ xác nhận qua email...</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${org.isPending ? "bg-amber-50 text-amber-600 border border-amber-100" : getOrganizerRole(org.role).color}`}>
                                    {getOrganizerRole(org.role).label}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-[11px] text-gray-500 font-medium text-center">
                                {org.isPending ? "Lời mời gửi lúc:" : "Phân công lúc:"}<br />
                                {formatDateTime(org.assignedAt || org.createdAt)}
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {org.status === 'LEAVING_PENDING' ? (
                                    (() => {
                                      const userRole = event.currentUserRole?.organizerRole;
                                      const canHandle = (org.role === 'COORDINATOR' || org.role === 'ADVISOR') ? userRole === 'LEADER' : (userRole === 'LEADER' || userRole === 'COORDINATOR');
                                      
                                      if (!canHandle) return <span className="text-[10px] text-gray-400 italic">Chờ duyệt...</span>;

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
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Duyệt"
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
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Từ chối"
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
                                          const isPending = org.isPending;
                                          setConfirmConfig({
                                            title: isPending ? "Hủy lời mời" : "Gỡ thành viên",
                                            message: `Bạn có chắc muốn ${isPending ? "hủy lời mời tới" : "gỡ"} ${enrichedNames[org.accountId] || enrichedNames[org.email] || org.fullName || org.inviteeEmail} khỏi ban tổ chức?`,
                                            onConfirm: () => onRemoveMember(org),
                                            icon: isPending ? X : Trash2,
                                            color: "rose"
                                          });
                                          setShowConfirmModal(true);
                                        }}
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        title={org.isPending ? "Hủy lời mời" : "Gỡ bỏ"}
                                      >
                                        {org.isPending ? <X size={16} /> : <Trash2 size={16} />}
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
                        <th className="p-4 text-left text-gray-600">Diễn giả</th>
                        <th className="p-4 text-left text-gray-600">Liên hệ</th>
                        <th className="p-4 text-left text-gray-600">Phiên</th>
                        {userPerms.canManageTeam && <th className="p-4 text-center text-gray-600">Gỡ</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const accepted = event.presenters || [];
                        const pending = (event.invitations || [])
                          .filter(inv => inv.status === 'PENDING' && inv.type === 'PRESENTER')
                          .map(inv => ({
                            ...inv,
                            isPending: true,
                            fullName: inv.inviteeName,
                            email: inv.inviteeEmail,
                            bio: inv.presenterBio,
                            sessions: [{ title: inv.presenterSession }], // Fake session structure for display
                            createdAt: inv.sentAt
                          }));
                        const combined = [...accepted, ...pending];

                        if (combined.length === 0) {
                          return <tr><td colSpan={userPerms.canManageTeam ? "4" : "3"} className="p-20 text-center text-gray-500 italic">Chưa có diễn giả</td></tr>;
                        }

                        return combined.map((p, idx) => (
                          <tr key={idx} className={`hover:bg-slate-50 transition-colors ${p.isPending ? "opacity-75" : ""}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <img
                                    src={p.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                    alt="Avatar"
                                    className={`w-10 h-10 rounded-xl object-cover border ${p.isPending ? "border-amber-200 grayscale-[0.5]" : "border-slate-200"}`}
                                  />
                                  {p.isPending && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-white rounded-full animate-pulse" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-800">{enrichedNames[p.accountId] || enrichedNames[p.email] || p.fullName}</p>
                                    {p.isPending && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase tracking-tighter">Đang mời</span>}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]" title={p.bio}>{p.bio || "Chưa có tiểu sử"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-xs text-gray-600">
                              <div className="space-y-1">
                                <p className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {p.email}</p>
                                {p.phone && <p className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {p.phone}</p>}
                                {p.isPending && <p className="text-[10px] text-amber-600 font-bold italic mt-1">Chờ xác nhận lúc: {formatDateTime(p.createdAt)}</p>}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.isPending ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600"}`}>
                                {p.isPending ? p.presenterSession : (p.sessions?.length > 0 ? p.sessions.map(s => `P${s.orderIndex || ''}: ${s.title}`).join(' | ') : "N/A")}
                              </span>
                            </td>
                            {userPerms.canManageTeam && (
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => {
                                    const isPending = p.isPending;
                                    setConfirmConfig({
                                      title: isPending ? "Hủy lời mời" : "Gỡ diễn giả",
                                      message: `Bạn có chắc muốn ${isPending ? "hủy lời mời tới" : "gỡ"} diễn giả ${enrichedNames[p.accountId] || enrichedNames[p.email] || p.fullName}?`,
                                      onConfirm: () => isPending ? onRemoveMember(p) : onRemovePresenter(p.id), // onRemoveMember handles general invitations
                                      icon: isPending ? X : Trash2,
                                      color: "rose"
                                    });
                                    setShowConfirmModal(true);
                                  }}
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                  title={p.isPending ? "Hủy lời mời" : "Gỡ bỏ"}
                                >
                                  {p.isPending ? <X size={16} /> : <Trash2 size={16} />}
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
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Gift size={24} className="text-amber-500" /> {luckyDraw?.luckyDraw?.title || "Chương trình vòng quay"}</h2><span className="px-3 py-1 text-xs font-black uppercase rounded-full bg-indigo-100 text-indigo-600">{luckyDraw?.luckyDraw?.status}</span></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng giải thưởng</p><p className="text-xl font-black text-slate-800">{luckyDraw?.luckyDraw?.prizes?.length || 0}</p></div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã trúng giải</p><p className="text-xl font-black text-emerald-600">{luckyDraw?.enrichedResults?.length || 0}</p></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-100 font-bold">Cơ cấu giải thưởng</div>
                    <div className="divide-y divide-slate-50">
                      {luckyDraw?.luckyDraw?.prizes?.map(p => (
                        <div key={p.id} className="p-4 flex justify-between items-center"><div className="flex flex-col"><span className="text-sm font-bold text-slate-800">{p.prizeName}</span><span className="text-xs text-gray-500">{p.description}</span></div><span className="text-sm font-black text-indigo-600">x{p.quantity}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-100 font-bold">Danh sách trúng thưởng</div>
                    <div className="divide-y divide-slate-50">
                      {luckyDraw?.enrichedResults?.map(res => (
                        <div key={res.result.id} className="p-4 flex justify-between items-center"><div className="flex flex-col"><span className="text-sm font-bold text-slate-800">{res.result.winner?.fullName}</span><span className="text-xs text-gray-500">{res.result.winner?.email}</span></div><span className="text-sm font-black text-emerald-600">{res.result.prize?.prizeName}</span></div>
                      ))}
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
                {event.currentUserRole?.organizer && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Gift size={24} /></div><div><h4 className="font-bold text-slate-800 uppercase tracking-tight">Lucky Draw</h4><p className="text-xs text-gray-500">Thiết lập giải thưởng cho sự kiện</p></div></div>
                      <button 
                        onClick={() => {
                          const routePrefix = isAdmin ? '/admin' : '/lecturer';
                          navigate(`${routePrefix}/events/${event.id}/lucky-draw/setup`);
                        }} 
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
                      >
                        {luckyDraw ? "Cập nhật cấu hình" : "Thiết lập ngay"}
                      </button>
                    </div>

                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm space-y-6">
                      <div><h3 className="text-rose-600 font-bold text-sm mb-4 flex items-center gap-2"><XCircle size={18} /> Khu vực nguy hiểm</h3>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1"><h4 className="text-sm font-bold text-rose-900">Hủy sự kiện</h4><p className="text-[10px] text-rose-700 mt-0.5">Dừng sự kiện và thông báo cho người tham gia.</p></div>
                          <button onClick={() => setShowCancelInput(!showCancelInput)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showCancelInput ? 'bg-rose-100 text-rose-700' : 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50'}`}>{showCancelInput ? 'Đóng' : 'Hủy'}</button>
                        </div>
                        {showCancelInput && (
                          <div className="mt-4 space-y-3 bg-white p-4 rounded-xl border border-rose-100 shadow-inner animate-in slide-in-from-top-2 duration-300">
                            <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Nhập lý do hủy..." rows={3} />
                            <div className="flex justify-end"><button onClick={onCancelEvent} disabled={isCancelling} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-all">{isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy vĩnh viễn'}</button></div>
                          </div>
                        )}
                      </div>
                      <div className="pt-6 border-t border-rose-100 flex items-center justify-between gap-4">
                        <div className="flex-1"><h4 className="text-sm font-bold text-rose-900">Xóa sự kiện</h4><p className="text-[10px] text-rose-700 mt-0.5">Xóa vĩnh viễn sự kiện này khỏi hệ thống.</p></div>
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
                  <button 
                    onClick={() => setShowQuizCreatorModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <Plus size={16} /> Tạo bộ câu hỏi
                  </button>
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
                             <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black">{quiz.questionsCount || 0} CÂU HỎI</span>
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
                <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[3rem] text-center">
                  <div className="w-16 h-16 bg-white text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-100/50">
                     <ClipboardCheck size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Khảo sát & Phản hồi</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Tạo form khảo sát để lắng nghe ý kiến từ người tham gia sự kiện của bạn.</p>
                  
                  <div className="flex justify-center gap-4 mt-8">
                     <button 
                       onClick={() => setShowSurveyCreatorModal(true)}
                       className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                     >
                       Tạo khảo sát
                     </button>
                     <button 
                       onClick={() => setShowSurveyModal(true)}
                       className="px-8 py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all"
                     >
                       Xem bản nháp
                     </button>
                  </div>
                </div>
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

      {/* SURVEY CREATOR MODAL */}
      <SurveyCreatorModal
        isOpen={showSurveyCreatorModal}
        onClose={() => setShowSurveyCreatorModal(false)}
        eventId={event.id}
        onSaved={() => {}}
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
