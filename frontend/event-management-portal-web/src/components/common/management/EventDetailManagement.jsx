import React, { useMemo } from "react";
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
  Camera
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRScannerModal from "./QRScannerModal";

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
  { label: "Ban tổ chức", value: "ORGANIZER" },
  { label: "Thành viên", value: "MEMBER" },
  { label: "Điều phối viên", value: "COORDINATOR" },
  { label: "Trưởng ban", value: "LEADER" },
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
    case "LEADER": return { label: "Trưởng ban", color: "bg-purple-100 text-purple-700" };
    case "COORDINATOR": return { label: "Điều phối viên", color: "bg-indigo-100 text-indigo-700" };
    case "MEMBER": return { label: "Thành viên", color: "bg-blue-100 text-blue-700" };
    case "ADVISOR": return { label: "Cố vấn", color: "bg-teal-100 text-teal-700" };
    case "ORGANIZER": return { label: "Ban tổ chức", color: "bg-gray-100 text-gray-700" };
    default: return { label: role, color: "bg-gray-100 text-gray-600" };
  }
};

const EventDetailManagement = ({
  event,
  luckyDraw,
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
  onRemovePresenter = () => { },
  onManualCheckIn = () => { },
  onUndoCheckIn = () => { },
  // QR Scanner props
  showQRScanner = false,
  setShowQRScanner = () => { },
  onQRScanSuccess = () => { },
}) => {
  const navigate = useNavigate();

  const userPerms = event?.currentUserRole || {};
  const up = userPerms;

  // 1. Nhóm Ban điều hành cốt lõi (Core Management)
  const isCoreTeam =
    up.isCreator ||
    ['LEADER', 'COORDINATOR', 'ORGANIZER'].includes(up.organizerRole);

  // 2. Diễn giả (Presenter)
  const isPresenter = up.isPresented || up.presented || up.presenter;

  // 3. Các vai trò hỗ trợ khác
  const isMember = up.organizerRole === 'MEMBER';
  const isAdvisor = up.organizerRole === 'ADVISOR';

  // 4. Quản trị viên hệ thống (Không nằm trong team và không phải diễn giả thì xem như quan sát viên toàn quyền)
  const isSystemAdminOnly = (up.systemRole === 'ADMIN' || up.systemRole === 'SUPER_ADMIN') && !isCoreTeam && !isPresenter;

  // Quyền xem tất cả (Dành cho Core Team hoặc Admin thuần túy)
  const canSeeAll = isCoreTeam || isSystemAdminOnly;

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

    // Đăng ký & Điểm danh (Core Team, Admin, hoặc Member)
    if (canSeeAll || isMember) {
      if (up.canManageRegistrations) baseTabs.push({ key: "Đăng ký", label: "Đăng ký", icon: UserCheck });
      if (up.canCheckIn) baseTabs.push({ key: "Điểm danh", label: "Điểm danh", icon: CheckCircle });
    }

    // Nhân sự (Tất cả vai trò còn lại đều thấy)
    baseTabs.push({ key: "Ban tổ chức", label: "Ban tổ chức", icon: Users });
    baseTabs.push({ key: "Diễn giả", label: "Diễn giả", icon: Star });

    // Vòng quay may mắn (Core Team hoặc Admin)
    if (canSeeAll && event?.hasLuckyDraw && up.canManageLuckyDraw) {
      baseTabs.push({ key: "Vòng quay", label: "Vòng quay may mắn", icon: Gift });
    }

    // Thống kê (Core Team, Admin, hoặc Advisor)
    if (canSeeAll || isAdvisor) {
      if (up.canViewAnalytics) baseTabs.push({ key: "Thống kê", label: "Thống kê", icon: TrendingUp });
    }

    // Cấu hình (Chỉ Core Team hoặc Admin)
    if (canSeeAll && up.canEditEvent) {
      baseTabs.push({ key: "Cài đặt", label: "Cài đặt", icon: Settings });
    }

    return baseTabs;
  }, [event, up, isCoreTeam, isPresenter, isMember, isAdvisor, canSeeAll]);

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
    if (roles.length === 0 && (up.systemRole === 'ADMIN' || up.systemRole === 'SUPER_ADMIN')) {
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
                            {userPerms.canEditEvent && <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Chỉnh sửa sự kiện</div>}
                            {userPerms.canManageTeam && <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Quản lý nhân sự</div>}
                            {userPerms.canCheckIn && <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Thực hiện điểm danh</div>}
                            {userPerms.canViewAnalytics && <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md"><CheckCircle size={12} /> Xem báo cáo thống kê</div>}
                            {!userPerms.canEditEvent && !userPerms.canManageTeam && !userPerms.canCheckIn && (
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

            {/* ĐIỂM DANH */}
            {activeTab === "Điểm danh" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Điểm danh ({checkedInCount} / {event.registeredCount})</h3>
                  {userPerms.canCheckIn && (
                    <button
                      onClick={() => setShowQRScanner(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                    >
                      <Camera size={16} /> Quét mã QR
                    </button>
                  )}
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
                                {userPerms.canCheckIn && (
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
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-xs text-gray-600">{reg.checkInTime ? formatDateTime(reg.checkInTime) : "—"}</td>
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
                <div className="flex justify-between items-center mb-4">
                  {!isAddingMember ? (
                    <><h3 className="font-semibold text-lg">Ban tổ chức ({event.organizers?.length || 0} người)</h3>{userPerms.canManageTeam && <button onClick={() => setIsAddingMember(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"><UserPlus size={18} /> Thêm</button>}</>
                  ) : (
                    <><h3 className="font-bold flex items-center gap-2"><UserPlus size={20} className="text-emerald-500" /> Mời thành viên mới</h3><div className="flex gap-3"><button onClick={() => { onFetchUsers(); setShowUserSuggestions(!showUserSuggestions); }} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">AI gợi ý</button><button onClick={() => addInvite()} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">Thêm thủ công</button><button onClick={() => setIsAddingMember(false)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold">Hủy</button></div></>
                  )}
                </div>

                {isAddingMember && (
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-dashed border-slate-200 space-y-4">
                    {showUserSuggestions && (
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm max-h-[300px] overflow-y-auto space-y-2">
                        <Input placeholder="Tìm kiếm..." value={searchKey} onChange={e => setSearchKey(e.target.value)} />
                        {loadingUsers ? <p className="text-center text-gray-400">Đang tải...</p> : filteredUsers.map(u => (
                          <div key={u.id} onClick={() => { addInvite(u); setShowUserSuggestions(false); }} className="p-3 hover:bg-slate-50 cursor-pointer rounded-lg border border-transparent hover:border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><UserCheck size={16} /></div>
                            <div><p className="text-sm font-bold">{u.profile?.fullName || u.username}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {invitations.map((invite, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 relative shadow-sm">
                        <button onClick={() => removeInvite(idx)} className="absolute top-4 right-4 p-2 text-red-500 bg-red-50 rounded-lg"><X size={16} /></button>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Email *"><Input value={invite.inviteeEmail} onChange={e => updateInvite(idx, 'inviteeEmail', e.target.value)} /></Field>
                          <Field label="Vai trò"><Select value={invite.targetRole} onChange={e => updateInvite(idx, 'targetRole', e.target.value)}>{ORGANIZER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</Select></Field>
                        </div>
                        <Field label="Lời nhắn" style={{ marginTop: 16 }}><Input value={invite.message} onChange={e => updateInvite(idx, 'message', e.target.value)} /></Field>
                      </div>
                    ))}
                    {invitations.length > 0 && <div className="flex justify-end"><button onClick={handleSendInvites} disabled={isInviting} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50">{isInviting ? "Đang gửi..." : "Gửi lời mời ngay"}</button></div>}
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-left text-gray-600">Họ tên</th>
                        <th className="p-4 text-left text-gray-600">Vai trò</th>
                        <th className="p-4 text-left text-gray-600 text-center">Ngày phân công</th>
                        {userPerms.canManageTeam && <th className="p-4 text-center text-gray-600">Gỡ</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {event.organizers?.length > 0 ? event.organizers.map((org, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={org.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                              <span className="font-medium text-slate-800">{org.fullName}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getOrganizerRole(org.role).color}`}>
                              {getOrganizerRole(org.role).label}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-600 text-center">{formatDateTime(org.assignedAt)}</td>
                          {userPerms.canManageTeam && (
                            <td className="p-4 text-center">
                              {org.role !== 'LEADER' && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Bạn có chắc muốn gỡ ${org.fullName} khỏi Ban tổ chức?`)) {
                                      onRemoveMember(org.id);
                                    }
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Gỡ bỏ"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      )) : <tr><td colSpan={userPerms.canManageTeam ? "4" : "3"} className="p-20 text-center text-gray-500">Chưa có thành viên</td></tr>}
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
                    <><h3 className="font-semibold text-lg">Danh sách diễn giả ({event.presenters?.length || 0} người)</h3>{userPerms.canManageTeam && <button onClick={() => setIsAddingPresenter(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"><UserPlus size={18} /> Thêm</button>}</>
                  ) : (
                    <><h3 className="font-bold flex items-center gap-2"><Sparkles size={20} className="text-emerald-500" /> Mời diễn giả mới</h3><div className="flex gap-3"><button onClick={() => { onFetchUsers(); setShowUserSuggestions(!showUserSuggestions); }} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">AI gợi ý</button><button onClick={() => addPresenterInvite()} className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">Thêm thủ công</button><button onClick={() => setIsAddingPresenter(false)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold">Hủy</button></div></>
                  )}
                </div>

                {isAddingPresenter && (
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-dashed border-slate-200 space-y-4">
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
                      {event.presenters?.length > 0 ? event.presenters.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                alt="Avatar"
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                              />
                              <div>
                                <p className="font-bold text-slate-800">{p.fullName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]" title={p.bio}>{p.bio || "Chưa có tiểu sử"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-gray-600">
                            <div className="space-y-1">
                              <p className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {p.email}</p>
                              {p.phone && <p className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {p.phone}</p>}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase">
                              {p.sessions?.length > 0 ? p.sessions.map(s => `P${s.orderIndex}: ${s.title}`).join(' | ') : "N/A"}
                            </span>
                          </td>
                          {userPerms.canManageTeam && (
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  if (window.confirm(`Bạn có chắc muốn gỡ diễn giả ${p.fullName}?`)) {
                                    onRemovePresenter(p.id);
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Gỡ bỏ"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          )}
                        </tr>
                      )) : <tr><td colSpan={userPerms.canManageTeam ? "4" : "3"} className="p-20 text-center text-gray-500">Chưa có diễn giả</td></tr>}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm"><Users className="mx-auto mb-3 text-blue-600" size={32} /><p className="text-3xl font-black text-slate-800">{event.registeredCount}</p><p className="text-xs font-bold text-slate-400 uppercase mt-1">Tổng đăng ký</p></div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm"><CheckCircle className="mx-auto mb-3 text-emerald-600" size={32} /><p className="text-3xl font-black text-emerald-600">{checkedInCount}</p><p className="text-xs font-bold text-slate-400 uppercase mt-1">Đã check-in</p></div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm"><TrendingUp className="mx-auto mb-3 text-amber-600" size={32} /><p className="text-3xl font-black text-amber-600">{event.registeredCount > 0 ? Math.round((checkedInCount / event.registeredCount) * 100) : 0}%</p><p className="text-xs font-bold text-slate-400 uppercase mt-1">Tỷ lệ tham gia</p></div>
                </div>
              </div>
            )}

            {/* CÀI ĐẶT */}
            {activeTab === "Cài đặt" && canEdit && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Gift size={24} /></div><div><h4 className="font-bold text-slate-800 uppercase tracking-tight">Lucky Draw</h4><p className="text-xs text-gray-500">Thiết lập giải thưởng cho sự kiện</p></div></div>
                    <button onClick={onOpenLuckyDrawModal} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100">{luckyDraw ? "Cập nhật cấu hình" : "Thiết lập ngay"}</button>
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
    </div>
  );
};

export default EventDetailManagement;
