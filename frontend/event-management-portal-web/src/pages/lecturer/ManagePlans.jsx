import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Save,
  Calendar as CalendarIcon,
  MapPin,
  Globe,
  Clock,
  ShieldCheck,
  Users,
  FileText,
  Tag,
  Building2,
  Mail,
  UserPlus,
  BookOpen,
  Hash,
  Image as ImageIcon,
  Award,
  CheckSquare,
  MessageSquare,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EventPlanner } from "../../components/event-planner/EventPlanner";
import eventService from "../../services/eventService";
import notificationService from "../../services/notificationService";
import authService from "../../services/authService";
import { exportToWord } from "../../components/event-planner/WordExporter";

const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  PLAN_PENDING_APPROVAL: "Chờ duyệt kế hoạch",
  PLAN_APPROVED: "Kế hoạch đã duyệt",
  EVENT_PENDING_APPROVAL: "Chờ duyệt sự kiện",
  PUBLISHED: "Đã xuất bản",
  CANCELLED: "Đã hủy",
  COMPLETED: "Đã kết thúc",
  ONGOING: "Đang diễn ra",
};

const EVENT_TYPE_LABELS = {
  WORKSHOP: "Workshop",
  CONFERENCE: "Hội nghị",
  SEMINAR: "Seminar",
  TALKSHOW: "Talkshow",
  COMPETITION: "Cuộc thi",
  WEBINAR: "Webinar",
  CONCERT: "Buổi biểu diễn",
  MEETING: "Họp",
  TRAINING: "Đào tạo",
  TEAM_BUILDING: "Team building",
  OTHER: "Khác",
};

const ORGANIZATION_DISPLAY_NAMES = {
  "org-it": "Khoa Công nghệ Thông tin",
  "org-ktkt": "Khoa Kế toán - Kiểm toán",
  "org-qtkd": "Khoa Quản trị Kinh doanh",
  "org-ctst": "Phòng Đào tạo",
  "org-ctsv": "Phòng Công tác Sinh viên",
};

const EVENT_MODE_LABELS = {
  OFFLINE: "Trực tiếp",
  ONLINE: "Trực tuyến",
  HYBRID: "Kết hợp",
};

const toDatetimeLocal = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

const formatDate = (dateStr, format = "full") => {
  if (!dateStr) return "Chưa cập nhật";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Chưa cập nhật";

    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hour = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");

    if (format === "short") {
      return `${day}/${month}/${year}`;
    }
    if (format === "time") {
      return `${hour}:${min}`;
    }
    return `${hour}:${min} - ${day}/${month}/${year}`;
  } catch {
    return "Chưa cập nhật";
  }
};

const Section = ({ title, icon: Icon, color = "blue", children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 bg-${color}-100 rounded-lg`}>
        <Icon size={16} className={`text-${color}-600`} />
      </div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
        {title}
      </h3>
      <div className="flex-1 h-px bg-slate-200 ml-2" />
    </div>
    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value, icon: Icon, color = "slate" }) => (
  <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
    <div className={`p-1.5 bg-${color}-50 rounded-lg mt-0.5`}>
      <Icon size={14} className={`text-${color}-600`} />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
  </div>
);

const Badge = ({ children, color = "slate" }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-${color}-100 text-${color}-700`}
  >
    {children}
  </span>
);

const ManagePlans = () => {
  const [viewMode, setViewMode] = useState("LIST");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      const accountId = currentUser?.accountId;

      if (accountId) {
        const response = await eventService.getMyPlans();
        setPlans(response.data || []);
      } else {
        showToast("Không tìm thấy thông tin tài khoản", "error");
      }
    } catch (error) {
      console.error("Fetch plans error:", error);
      showToast("Không thể tải danh sách kế hoạch", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const base64Url = accessToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return {
          accountId:
            payload.accountId || payload.sub || payload.userId || payload.id,
          name: payload.name || payload.fullName || "Người dùng",
          email: payload.email,
        };
      }
    } catch (e) {
      console.error("Lỗi decode token:", e);
    }

    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return {
          accountId:
            user.id || user.accountId || user.account?.id || user.userId,
          name: user.fullName || user.name || "Người dùng",
          email: user.email,
        };
      }
    } catch (error) {
      console.error("Lỗi parse user data:", error);
    }

    return null;
  };

  const sendNotifications = async (planId, planTitle) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.accountId) {
        console.error("Không tìm thấy thông tin người dùng");
        return;
      }

      let allAccounts = [];
      try {
        const accountsResponse = await authService.getAllAccounts();
        allAccounts = accountsResponse.data || [];
      } catch (err) {
        console.error("Lỗi lấy danh sách accounts:", err);
      }

      const adminRoles = ["ADMIN", "SUPER_ADMIN"];
      const adminAccounts = allAccounts.filter((account) =>
        adminRoles.includes(account.role?.toUpperCase())
      );

      const sendPlanNotification = async (
        targetUserId,
        planId,
        planTitle,
        isAdmin = false,
      ) => {
        try {
          const payload = {
            userProfileId: targetUserId,
            type: isAdmin ? "EVENT_SUBMITTED" : "GENERAL", 
            title: isAdmin
              ? "🚀 Kế hoạch mới cần phê duyệt! 📋"
              : "🚀 Đã gửi phê duyệt thành công! ✅",
            message: isAdmin
              ? `${currentUser.name || "Người dùng"} đã gửi kế hoạch "${planTitle}" để phê duyệt. Vui lòng xem xét.`
              : `Kế hoạch "${planTitle}" đã được gửi và đang chờ phê duyệt. Bạn sẽ nhận được thông báo khi có kết quả.`,
            relatedEntityId: planId,
            relatedEntityType: "PLAN",
            actionUrl: `/manage-plans/${planId}`,
            priority: isAdmin ? 1 : 2,
          };

          await notificationService.sendNotification(payload);
        } catch (error) {
          console.warn(
            `⚠️ Lỗi gửi thông báo cho ${targetUserId}:`,
            error.message,
          );
        }
      };

      for (const admin of adminAccounts) {
        const adminUserId = admin.id || admin.userProfileId || admin.accountId;
        if (!adminUserId) continue;
        if (String(adminUserId) === String(currentUser.accountId)) continue;
        await sendPlanNotification(adminUserId, planId, planTitle, true);
      }

      await sendPlanNotification(
        currentUser.accountId,
        planId,
        planTitle,
        false,
      );
    } catch (error) {
      console.error("❌ Lỗi tổng thể gửi thông báo:", error);
    }
  };

  const handleSubmitForApproval = async (planId) => {
    setSubmittingId(planId);
    try {
      const planToSubmit = plans.find((p) => p.id === planId);
      if (planToSubmit.status?.toUpperCase() !== "DRAFT") {
        showToast(
          `Không thể gửi duyệt. Kế hoạch đang ở trạng thái: ${STATUS_LABELS[planToSubmit.status] || planToSubmit.status}`,
          "error",
        );
        setSubmittingId(null);
        return;
      }

      await eventService.submitPlanForApproval(planId);
      await sendNotifications(planId, planToSubmit.title);
      showToast("Đã gửi yêu cầu phê duyệt thành công", "success");
      await fetchPlans();
    } catch (error) {
      console.error("Submit error:", error);
      const errorMsg = error.response?.data?.error || "Gửi phê duyệt thất bại";
      showToast(errorMsg, "error");
    } finally {
      setSubmittingId(null);
      if (isModalOpen) closeModal();
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const openModal = (plan, mode) => {
    setSelectedPlan({ ...plan });
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (selectedPlan.startTime && selectedPlan.endTime) {
      const start = new Date(selectedPlan.startTime);
      const end = new Date(selectedPlan.endTime);
      if (end <= start) {
        showToast("Thời gian kết thúc phải sau thời gian bắt đầu!", "error");
        return;
      }
    }
    try {
      const response = await eventService.updatePlan(selectedPlan.id, selectedPlan);
      if (response.status >= 200 && response.status < 300) {
        setPlans(
          plans.map((p) =>
            p.id === selectedPlan.id
              ? { ...selectedPlan, updatedAt: new Date() }
              : p,
          ),
        );
        closeModal();
        showToast("Cập nhật kế hoạch thành công", "success");
      }
    } catch (error) {
      showToast("Lỗi khi cập nhật dữ liệu", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      await eventService.deletePlan(planToDelete.id);
      setPlans(plans.filter((p) => p.id !== planToDelete.id));
      showToast("Đã xóa kế hoạch thành công", "success");
    } catch {
      showToast("Xóa kế hoạch thất bại", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  };

  const filteredPlans = useMemo(() => {
    return plans.filter(
      (p) =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [plans, searchTerm]);

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const currentItems = filteredPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatID = (id) => {
    if (!id) return "";
    return `#${id.substring(0, 8).toUpperCase()}`;
  };

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase?.() || "";
    const colors = {
      DRAFT: "slate",
      PLAN_PENDING_APPROVAL: "amber",
      PLAN_APPROVED: "emerald",
      EVENT_PENDING_APPROVAL: "amber",
      PUBLISHED: "blue",
      CANCELLED: "red",
      COMPLETED: "green",
      ONGOING: "blue",
    };
    return colors[statusUpper] || "slate";
  };

  const getArrayDisplay = (arr) => {
    if (!arr || arr.length === 0) return "Không có";
    return Array.isArray(arr) ? arr.join(", ") : String(arr);
  };

  if (viewMode === "CREATE") {
    return (
      <EventPlanner
        onBack={() => {
          setViewMode("LIST");
          fetchPlans();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 p-4 bg-slate-50 min-h-screen relative">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="text-emerald-500" size={24} />
            ) : (
              <AlertCircle className="text-rose-500" size={24} />
            )}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 text-slate-400"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý kế hoạch</h1>
          <p className="text-slate-500 text-sm font-medium">Lập lịch và theo dõi tiến độ các kế hoạch sự kiện.</p>
        </div>
        <button onClick={() => setViewMode("CREATE")} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={18} /> Tạo kế hoạch mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-3"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Mã KH</th>
                  <th className="px-6 py-4">Tên kế hoạch</th>
                  <th className="px-6 py-4">Ngày dự kiến</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatID(p.id)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800 block mb-1">{p.title}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {p.eventTopic && <span className="inline-flex items-center text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 truncate max-w-[200px]">{p.eventTopic}</span>}
                        {p.hasLuckyDraw && <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100"><Award size={10} /> Vòng quay</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.eventDate || formatDate(p.startTime, "short")}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge color={getStatusColor(p.status)}>{STATUS_LABELS[p.status] || p.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openModal(p, "view")} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                        <button onClick={() => exportToWord(p)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Download size={16} /></button>
                        {(p.status === "DRAFT" || p.status === "BẢN NHÁP") && (
                          <button onClick={() => openModal(p, "edit")} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                        )}
                        {(p.status === "DRAFT" || p.status === "BẢN NHÁP") && (
                          <button onClick={() => handleSubmitForApproval(p.id)} disabled={submittingId === p.id} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50">
                            {submittingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          </button>
                        )}
                        {(p.status === "DRAFT" || p.status === "BẢN NHÁP") && (
                          <button onClick={() => { setPlanToDelete(p); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${modalMode === "view" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}>
                    {modalMode === "view" ? <Info size={20} /> : <Edit2 size={20} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{modalMode === "view" ? "Thông tin chi tiết kế hoạch" : "Chỉnh sửa kế hoạch"}</h2>
                    <p className="text-xs text-slate-400 font-medium">{formatID(selectedPlan.id)}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form onSubmit={handleUpdate} className="space-y-8">
                  {modalMode === "view" ? (
                    <>
                      <Section title="Thông tin cơ bản" icon={FileText} color="blue">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow label="ID" value={formatID(selectedPlan.id)} icon={Hash} color="slate" />
                          <InfoRow label="Tên kế hoạch" value={selectedPlan.title} icon={FileText} color="blue" />
                          <InfoRow label="Loại sự kiện" value={EVENT_TYPE_LABELS[selectedPlan.type] || selectedPlan.type} icon={Tag} color="purple" />
                          <InfoRow label="Chủ đề" value={selectedPlan.eventTopic || "Không có"} icon={BookOpen} color="emerald" />
                          <InfoRow label="Đơn vị tổ chức" value={selectedPlan.major ? `${selectedPlan.faculty} – ${selectedPlan.major}` : selectedPlan.faculty || "Chưa xác định"} icon={Building2} color="amber" />
                          <InfoRow label="Hình thức" value={EVENT_MODE_LABELS[selectedPlan.eventMode] || selectedPlan.eventMode} icon={Globe} color="cyan" />
                        </div>
                      </Section>
                      <Section title="Thời gian & Địa điểm" icon={Clock} color="rose">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow label="Thời gian bắt đầu" value={formatDate(selectedPlan.startTime)} icon={CalendarIcon} color="rose" />
                          <InfoRow label="Thời gian kết thúc" value={formatDate(selectedPlan.endTime)} icon={CalendarIcon} color="rose" />
                          <InfoRow label="Địa điểm" value={selectedPlan.location} icon={MapPin} color="green" />
                        </div>
                      </Section>
                      <Section title="Mô tả chi tiết" icon={FileText} color="slate">
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{selectedPlan.description || "Không có mô tả"}</p>
                        </div>
                      </Section>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Tên kế hoạch</label>
                        <input type="text" value={selectedPlan.title || ""} onChange={(e) => setSelectedPlan({ ...selectedPlan, title: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Mô tả</label>
                        <textarea rows={4} value={selectedPlan.description || ""} onChange={(e) => setSelectedPlan({ ...selectedPlan, description: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none resize-none" />
                      </div>
                    </div>
                  )}

                  <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                    <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Đóng</button>
                    {modalMode === "edit" && (
                      <button type="submit" className="flex items-center gap-2 bg-amber-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-amber-700 transition-all active:scale-95"><Save size={18} /> Lưu thay đổi</button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagePlans;
