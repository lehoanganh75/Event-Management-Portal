import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Eye, Edit2, Trash2, Send, Loader2, ChevronLeft, ChevronRight, Plus,
  Calendar, Clock, Users, PlayCircle, CheckCircle2, Download, AlertCircle, X,
  XCircle, CheckCircle, Check,
  FileText, LayoutDashboard, FileUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { showToast } from "../../../utils/toast.jsx";
import eventService from "../../../services/eventService";
import notificationService from "../../../services/notificationService";
import { exportEventsToExcel } from "../../../utils/exportExcel";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../context/NotificationContext";
import EventCreator from "../../event-planner/EventCreator";
import CreateEventModal from "../../event-planner/CreateEventModal";
import CreatePlanModal from "../../event-planner/CreatePlanModal";
import { extractDataFromDocx } from "../../../services/docxImportService";
import { exportToWord } from "../../event-planner/WordExporter";
import ConfirmModal from "../../common/ConfirmModal";
import PromptModal from "../../common/PromptModal";
import EventReviewStep from "../../event-planner/EventReviewstep";

/* ================= CONFIG ================= */
const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  PLAN_PENDING_APPROVAL: "Kế hoạch chờ duyệt",
  PLAN_APPROVED: "Kế hoạch đã duyệt",
  EVENT_PENDING_APPROVAL: "Sự kiện chờ duyệt",
  PUBLISHED: "Đã công bố",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
  REJECTED: "Đã từ chối",
  CONVERTED: "Đã chuyển đổi",
};

const STATUS_COLOR = {
  DRAFT: "bg-gray-100 text-gray-600",
  PLAN_PENDING_APPROVAL: "bg-orange-100 text-orange-600",
  PLAN_APPROVED: "bg-emerald-100 text-emerald-600",
  EVENT_PENDING_APPROVAL: "bg-amber-100 text-amber-600",
  PUBLISHED: "bg-blue-100 text-blue-600",
  ONGOING: "bg-green-100 text-green-600",
  COMPLETED: "bg-indigo-100 text-indigo-600",
  CANCELLED: "bg-red-100 text-red-600",
  REJECTED: "bg-rose-100 text-rose-600",
  CONVERTED: "bg-slate-100 text-slate-600",
};

/* ================= MAIN ================= */
const EventsManagement = ({ type = "lecturer", mode = "all" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications } = useNotification();

  const isAdminMode = useMemo(() => {
    const role = user?.role;
    // Nếu là Admin hoặc Super Admin thì luôn dùng chế độ quản trị (xem hết)
    return role === "ADMIN" || role === "SUPER_ADMIN";
  }, [user]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const lastProcessedNotificationId = React.useRef(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("Tất cả");

  // Determine allowed statuses based on mode
  const allowedStatuses = useMemo(() => {
    if (mode === "plan") return ["DRAFT", "PLAN_PENDING_APPROVAL", "PLAN_APPROVED", "REJECTED"];
    if (mode === "event") return ["EVENT_PENDING_APPROVAL", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED", "CONVERTED"];
    return Object.keys(STATUS_LABELS);
  }, [mode]);

  const [page, setPage] = useState(1);
  const perPage = 5;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [creatorConfig, setCreatorConfig] = useState({ initialFormData: {}, fromPlan: false, forceEventMode: false });
  const [importedRawText, setImportedRawText] = useState("");

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, id: null });
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, defaultValue: "" });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, event: null });

  /* ===== FETCH ===== */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res;

      // Kiểm tra quyền từ role để gọi API tương ứng
      if (isAdminMode) {
        // SUPER_ADMIN, ADMIN -> Load toàn bộ (is_deleted = false)
        res = mode === "plan"
          ? await eventService.getAllPlans()
          : await eventService.getAdminAllEvents();
      } else {
        // LECTURER, STUDENT... -> Load sự kiện liên quan đến mình
        res = mode === "plan"
          ? await eventService.getMyPlans()
          : await eventService.getMyEvents();
      }

      console.log(isAdminMode);
      console.log(res.data);

      let allData = res.data || [];
      if (mode !== "all") {
        allData = allData.filter(e => allowedStatuses.includes(e.status));
      }
      setEvents(allData);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [isAdminMode, mode, allowedStatuses]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time Update: Auto-refresh data when a relevant notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];

      // Only process if it's a new notification we haven't handled yet
      if (latest.id !== lastProcessedNotificationId.current) {
        lastProcessedNotificationId.current = latest.id;

        const relevantTypes = [
          "PLAN_SUBMITTED", "PLAN_APPROVED", "PLAN_REJECTED",
          "EVENT_SUBMITTED", "EVENT_APPROVED", "EVENT_REJECTED",
          "PLAN_CREATED", "EVENT_CREATED", "STATUS_UPDATED"
        ];

        if (relevantTypes.includes(latest.type)) {
          console.log("Real-time Refresh: Relevant notification received", latest.type);
          // Small delay to ensure DB transaction is fully committed on backend
          const timer = setTimeout(() => {
            fetchData();
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [notifications, fetchData]);

  /* ===== STATISTICS ===== */
  const stats = useMemo(() => {
    const total = events.length;

    if (mode === "plan") {
      const drafts = events.filter(e => e.status === "DRAFT").length;
      const pending = events.filter(e => e.status === "PLAN_PENDING_APPROVAL").length;
      const approved = events.filter(e => e.status === "PLAN_APPROVED").length;
      const rejected = events.filter(e => e.status === "REJECTED").length;
      return { total, drafts, pending, approved, rejected };
    }

    const upcoming = events.filter(e => ["PUBLISHED", "EVENT_PENDING_APPROVAL"].includes(e.status)).length;
    const ongoing = events.filter(e => e.status === "ONGOING").length;
    const completed = events.filter(e => e.status === "COMPLETED").length;
    const totalRegistered = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);

    return { total, upcoming, ongoing, completed, totalRegistered };
  }, [events, mode]);

  /* ===== FILTER ===== */
  const filteredEvents = useMemo(() => {
    return events
      .filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase())
      )
      .filter(e => {
        if (activeTab === "Tất cả") {
          if (statusFilter !== "ALL") return e.status === statusFilter;
          return true;
        }
        if (activeTab === "Kế hoạch") return ["DRAFT", "REJECTED"].includes(e.status);
        if (activeTab === "Chờ duyệt") return ["PLAN_PENDING_APPROVAL"].includes(e.status);
        if (activeTab === "Đã duyệt") return ["PLAN_APPROVED"].includes(e.status);
        if (activeTab === "Chờ duyệt sự kiện") return ["EVENT_PENDING_APPROVAL"].includes(e.status);
        if (activeTab === "Công bố") return e.status === "PUBLISHED";
        if (activeTab === "Đang diễn ra") return e.status === "ONGOING";
        if (activeTab === "Hoàn thành") return e.status === "COMPLETED";
        if (activeTab === "Đã hủy") return e.status === "CANCELLED";
        return true;
      });
  }, [events, search, statusFilter, activeTab]);

  const totalPages = Math.ceil(filteredEvents.length / perPage);
  const currentEvents = filteredEvents.slice((page - 1) * perPage, page * perPage);

  /* ===== ACTIONS ===== */
  const handleExport = () => {
    if (filteredEvents.length === 0) {
      showToast("Không có dữ liệu để xuất", "error");
      return;
    }
    exportEventsToExcel(filteredEvents);
  };

  // Lecturer Actions
  const handleSubmitForApproval = async (id, title) => {
    setSubmittingId(id);
    try {
      await eventService.submitPlanForApproval(id);
      await notificationService.sendNotification({
        userProfileId: user?.accountId || user?.id,
        title: "Gửi phê duyệt thành công",
        message: `Sự kiện "${title}" đã được gửi tới Quản trị viên.`,
        type: "SYSTEM"
      });
      // toast.success removed - handled by WebSocket notification
      fetchData();
    } catch (error) {
      showToast("Gửi phê duyệt thất bại", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async () => {
    const { id } = deleteModal;
    if (!id) return;
    try {
      await eventService.deleteEvent(id);
      showToast("Đã xóa sự kiện thành công", "success");
      fetchData();
    } catch (error) {
      showToast("Lỗi khi xóa sự kiện", "error");
    }
  };

  const handleCancel = async () => {
    const { id } = cancelModal;
    if (!id) return;
    try {
      await eventService.cancelEvent(id);
      showToast("Đã hủy sự kiện thành công", "success");
      fetchData();
    } catch (error) {
      showToast("Lỗi khi hủy sự kiện", "error");
    }
  };

  const handleExportWord = async (event) => {
    try {
      await exportToWord({
        ...event,
        eventTitle: event.title,
        eventPurpose: event.description,
        createdByName: user?.profile?.fullName || user?.username || "",
      }, user?.accountId || user?.id);
      showToast("✅ Đã xuất file Word!", "success");
    } catch (err) {
      showToast("Lỗi xuất Word: " + err.message, "error");
    }
  };

  const handleView = (e) => {
    if (mode === "plan" || e.status.includes("PLAN") || e.status === "DRAFT") {
      setPreviewModal({ isOpen: true, event: e });
    } else {
      navigate(isAdminMode ? `/admin/events/${e.id}` : `/${type}/events/${e.id}`);
    }
  };

  const handleEdit = (event) => {
    setCreatorConfig({
      initialFormData: {
        ...event,
        eventTitle: event.title || "",
        eventPurpose: event.description || "",
        eventType: event.type || "OTHER"
      },
      fromPlan: event.status.includes("PLAN")
    });
    setShowEventCreator(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!isAdminMode) return;

    const oldEvents = [...events];
    const currentEvent = oldEvents.find(e => e.id === id);
    if (!currentEvent) return;

    const performUpdate = async (reason = "") => {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      try {
        switch (newStatus) {
          case "PLAN_APPROVED":
            await eventService.approvePlan(id);
            // Send notification to creator
            if (currentEvent.createdByAccountId) {
              await notificationService.sendNotification({
                userProfileId: currentEvent.createdByAccountId,
                title: "Kế hoạch đã được duyệt",
                message: `Chúc mừng! Kế hoạch "${currentEvent.title}" của bạn đã được phê duyệt.`,
                type: "SYSTEM"
              }).catch(e => console.error("Notify fail", e));
            }
            break;
          case "PUBLISHED":
            await eventService.approveEvent(id);
            // Send notification to creator
            if (currentEvent.createdByAccountId) {
              await notificationService.sendNotification({
                userProfileId: currentEvent.createdByAccountId,
                title: "Sự kiện đã xuất bản",
                message: `Sự kiện "${currentEvent.title}" của bạn đã chính thức được công khai.`,
                type: "SYSTEM"
              }).catch(e => console.error("Notify fail", e));
            }
            break;
          case "REJECTED":
            await eventService.rejectPlan(id, reason || "Cập nhật bởi Admin");
            // Send notification to creator with reason
            if (currentEvent.createdByAccountId) {
              await notificationService.sendNotification({
                userProfileId: currentEvent.createdByAccountId,
                title: "Kế hoạch bị từ chối",
                message: `Kế hoạch "${currentEvent.title}" cần điều chỉnh thêm. Lý do: ${reason}`,
                type: "SYSTEM"
              }).catch(e => console.error("Notify fail", e));
            }
            break;
          case "CANCELLED":
            await eventService.cancelEvent(id, reason || "Cập nhật bởi Admin");
            break;
          default:
            await eventService.updateEvent(id, { ...currentEvent, status: newStatus });
        }
        showToast(`Cập nhật trạng thái thành công: ${STATUS_LABELS[newStatus]}`, "success");
        fetchData();
      } catch (err) {
        setEvents(oldEvents);
        showToast("Không thể cập nhật trạng thái", "error");
      }
    };

    if (newStatus === "REJECTED") {
      setPromptModal({
        isOpen: true,
        title: "Từ chối kế hoạch",
        message: "Vui lòng nhập lý do từ chối để thông báo cho người tạo.",
        placeholder: "Nhập lý do tại đây...",
        defaultValue: "Kế hoạch cần điều chỉnh thêm...",
        onConfirm: (reason) => {
          performUpdate(reason);
          setPromptModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }

    if (newStatus === "CANCELLED") {
      setPromptModal({
        isOpen: true,
        title: "Hủy sự kiện",
        message: "Vui lòng nhập lý do hủy sự kiện để thông báo cho người tham gia.",
        placeholder: "Nhập lý do tại đây...",
        defaultValue: "Sự kiện bị hủy do lý do khách quan...",
        onConfirm: (reason) => {
          performUpdate(reason);
          setPromptModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }

    performUpdate();
  };

  const [isImporting, setIsImporting] = useState(false);

  const handleImportDocx = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      showToast("Vui lòng chọn file định dạng .docx", "error");
      return;
    }

    setIsImporting(true);
    try {
      showToast("⏳ Đang phân tích nội dung kế hoạch bằng AI...", "info");
      const data = await extractDataFromDocx(file);

      if (!data || (!data.extracted && !data.rawText)) {
        throw new Error("Không thể trích xuất thông tin từ file này.");
      }

      const extracted = data.extracted;

      // Map AI result to our form structure
      const mappedData = extracted ? {
        eventTitle: extracted.title || "",
        eventTopic: extracted.subject || "",
        eventPurpose: extracted.purpose || extracted.description || "",
        location: extracted.suggestedLocation || "",
        maxParticipants: extracted.estimatedParticipants || 50,
        eventType: "WORKSHOP", // Default
        eventMode: "OFFLINE",
        orgSelectionMode: "existing",
        sessions: extracted.programItems?.map((item, idx) => ({
          title: item.title || "Không tên",
          description: item.description || "",
          durationMinutes: item.durationMinutes || 0,
          startTime: item.startTime || "",
          endTime: item.endTime || "",
          speaker: item.speaker || "",
          room: item.location || "",
          orderIndex: idx + 1,
          isConfirmed: true
        })) || [],
        // Extract unique presenters from sessions
        presenters: extracted.programItems?.reduce((acc, item) => {
          if (item.speaker && !acc.find(p => p.fullName === item.speaker)) {
            acc.push({
              fullName: item.speaker,
              email: "",
              position: "Diễn giả",
              department: "",
              bio: `Diễn giả tại phiên: ${item.title}`,
              targetSessionName: item.title
            });
          }
          return acc;
        }, []) || [],
        interactionSettings: extracted.additionalData?.interactionSettings || {
          enableQA: true,
          enablePolls: true,
          allowUserQuestions: true
        },
        hasLuckyDraw: extracted.additionalData?.hasLuckyDraw || false,
        aiReasoning: extracted.reasoning || ""
      } : {
        eventTitle: (function () {
          const lines = data.rawText?.split('\n') || [];
          // Tìm dòng có chứa V/v hoặc KẾ HOẠCH trước
          const targetLine = lines.find(l => l.includes("V/v") || l.includes("KẾ HOẠCH"));
          if (targetLine) return targetLine.replace(/V\/v:?\s*/i, "").trim().substring(0, 100);
          // Nếu không thấy, tìm dòng dài nhưng không phải thông tin hành chính
          return lines.find(l =>
            l.trim().length > 10 &&
            !l.includes("TRƯỜNG") &&
            !l.includes("KHOA") &&
            !l.includes("CỘNG HÒA") &&
            !l.includes("Độc lập")
          )?.trim().substring(0, 70) || "Kế hoạch sự kiện mới";
        })(),
        eventPurpose: data.rawText || "",
        eventType: "WORKSHOP",
        eventMode: "OFFLINE",
        orgSelectionMode: "existing",
        sessions: [],
        presenters: []
      };

      // Handle datetimes
      const formatForInput = (isoStr) => {
        if (!isoStr) return "";
        try {
          if (typeof isoStr === 'string' && isoStr.includes('T')) {
            return isoStr.substring(0, 16);
          }
          const date = new Date(isoStr);
          if (isNaN(date)) return "";

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
          return "";
        }
      };

      if (extracted) {
        mappedData.startTime = formatForInput(extracted.suggestedStartTime);
        mappedData.endTime = formatForInput(extracted.suggestedEndTime);
        mappedData.registrationDeadline = formatForInput(extracted.registrationDeadline);
      }

      // Update session times as well
      if (mappedData.sessions) {
        mappedData.sessions = mappedData.sessions.map(s => ({
          ...s,
          startTime: formatForInput(s.startTime),
          endTime: formatForInput(s.endTime)
        }));
      }

      setImportedRawText(data.rawText || "");

      setCreatorConfig({
        initialFormData: mappedData,
        fromPlan: false,
        isEdit: false,
        startAtStep: 1,
        forceEventMode: mode !== "plan" && activeTab !== "Kế hoạch"
      });

      setShowEventCreator(true);
      showToast("✨ Đã trích xuất thông tin thành công!", "success");

      // Force scroll fix
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (err) {

      console.error("Docx import error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định khi nhập dữ liệu";
      showToast("❌ " + errorMsg, "error");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  /* ===== MODAL HANDLERS ===== */
  const handleSelectPlan = (data) => {
    setCreatorConfig({
      initialFormData: data.initialFormData || {},
      fromPlan: data.fromPlan || false,
      startAtStep: data.startAtStep || 1
    });
    setIsCreateModalOpen(false);
    setShowEventCreator(true);
  };

  const handleCreateNew = () => {
    setCreatorConfig({
      initialFormData: {},
      fromPlan: false,
      forceEventMode: mode === "event",
      startAtStep: 1
    });
    setIsCreateModalOpen(false);
    setShowEventCreator(true);
  };

  if (showEventCreator) {
    return (
      <EventCreator
        onBack={() => { setShowEventCreator(false); fetchData(); }}
        initialFormData={creatorConfig.initialFormData}
        fromPlan={creatorConfig.fromPlan}
        planId={creatorConfig.initialFormData.id}
        startAtStep={creatorConfig.startAtStep}
        forceEventMode={creatorConfig.forceEventMode}
      />
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Loading Overlay for AI Import */}
      <AnimatePresence>
        {isImporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileUp className="text-indigo-400 animate-pulse" size={32} />
              </div>
            </div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-center"
            >
              <h3 className="text-xl font-black text-white mb-2">Đang phân tích kế hoạch</h3>
              <p className="text-slate-300 text-sm max-w-xs mx-auto">
                AI đang trích xuất thông tin từ file Word của bạn. Quá trình này có thể mất từ 10-30 giây...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">©</div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {isAdminMode ? (mode === "plan" ? "Quản lý kế hoạch hệ thống" : "Quản lý sự kiện hệ thống") : (mode === "plan" ? "Kế hoạch của tôi" : "Sự kiện của tôi")}
          </h1>
        </div>

        <div className="flex gap-3">
          {/* Hiển thị Import và Tạo mới cho Admin, Student, Lecturer hoặc trong mode Plan */}
          {(isAdminMode || type === "student" || type === "lecturer" || mode === "plan" || mode === "all") && (
            <>
              <label className={`flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer border border-indigo-200 shadow-sm ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="file"
                  className="hidden"
                  accept=".docx"
                  onChange={handleImportDocx}
                  disabled={isImporting}
                />
                {isImporting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <FileUp size={18} />
                )}
                {isImporting ? "Đang xử lý..." : "Import Word"}
              </label>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                <Plus size={18} />
                {mode === "plan" ? "Tạo kế hoạch mới" : (type === "student" ? "Đề xuất sự kiện" : "Tạo sự kiện mới")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* STATISTICS CARDS */}
      {mode === "plan" ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <FileText size={28} />
              <div>
                <p className="text-sm opacity-90">Tổng kế hoạch</p>
                <p className="text-3xl font-semibold mt-1">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-500 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <Edit2 size={28} />
              <div>
                <p className="text-sm opacity-90">Bản nháp</p>
                <p className="text-3xl font-semibold mt-1">{stats.drafts}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-500 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={28} />
              <div>
                <p className="text-sm opacity-90">Chờ duyệt</p>
                <p className="text-3xl font-semibold mt-1">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={28} />
              <div>
                <p className="text-sm opacity-90">Đã duyệt</p>
                <p className="text-3xl font-semibold mt-1">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-rose-500 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <XCircle size={28} />
              <div>
                <p className="text-sm opacity-90">Từ chối</p>
                <p className="text-3xl font-semibold mt-1">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar size={28} />
              <div>
                <p className="text-sm opacity-90">Tổng sự kiện</p>
                <p className="text-3xl font-semibold mt-1">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <Clock size={28} />
              <div>
                <p className="text-sm opacity-90">Sắp diễn ra</p>
                <p className="text-3xl font-semibold mt-1">{stats.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <PlayCircle size={28} />
              <div>
                <p className="text-sm opacity-90">Đang diễn ra</p>
                <p className="text-3xl font-semibold mt-1">{stats.ongoing}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={28} />
              <div>
                <p className="text-sm opacity-90">Đã hoàn thành</p>
                <p className="text-3xl font-semibold mt-1">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <Users size={28} />
              <div>
                <p className="text-sm opacity-90">Tổng đăng ký</p>
                <p className="text-3xl font-semibold mt-1">{stats.totalRegistered}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto pb-1 gap-2 no-scrollbar">
        {[
          { id: "Tất cả", label: "Tất cả", icon: Calendar, count: events.length },
          ...(mode === "all" || mode === "plan" ? [
            { id: "Kế hoạch", label: "Bản nháp & Từ chối", icon: FileText, count: events.filter(e => ["DRAFT", "REJECTED"].includes(e.status)).length },
            { id: "Chờ duyệt", label: "Chờ duyệt", icon: AlertCircle, count: events.filter(e => ["PLAN_PENDING_APPROVAL"].includes(e.status)).length },
            { id: "Đã duyệt", label: "Đã duyệt", icon: CheckCircle2, count: events.filter(e => ["PLAN_APPROVED"].includes(e.status)).length }
          ] : []),
          ...(mode === "all" || mode === "event" ? [
            { id: "Chờ duyệt sự kiện", label: "Chờ duyệt", icon: AlertCircle, count: events.filter(e => ["EVENT_PENDING_APPROVAL"].includes(e.status)).length },
            { id: "Công bố", label: "Đã công bố", icon: Send, count: events.filter(e => e.status === "PUBLISHED").length },
            { id: "Đang diễn ra", label: "Đang diễn ra", icon: PlayCircle, count: events.filter(e => e.status === "ONGOING").length },
            { id: "Hoàn thành", label: "Hoàn thành", icon: CheckCircle2, count: events.filter(e => e.status === "COMPLETED").length },
            { id: "Đã hủy", label: "Đã hủy", icon: XCircle, count: events.filter(e => e.status === "CANCELLED").length }
          ] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            className="pl-11 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
            placeholder="Tìm kiếm theo tiêu đề, địa điểm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 min-w-[180px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          {allowedStatuses.map(k => (
            <option key={k} value={k}>
              {STATUS_LABELS[k]}
            </option>
          ))}
        </select>

        <div className="flex-1 flex gap-3 justify-end">
          <button
            onClick={() => { setSearch(""); setStatusFilter("ALL"); setActiveTab("Tất cả"); setPage(1); }}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-all"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
            <p className="mt-3 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left font-medium text-gray-600">{mode === "plan" ? "Tên kế hoạch" : "Tên sự kiện"}</th>
                <th className="p-4 text-left font-medium text-gray-600">Địa điểm</th>
                <th className="p-4 text-left font-medium text-gray-600">Thời gian</th>
                <th className="p-4 text-left font-medium text-gray-600">{isAdminMode ? "Người tạo" : "Người duyệt"}</th>
                <th className="p-4 text-left font-medium text-gray-600">Trạng thái</th>
                <th className="p-4 text-center font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentEvents.length > 0 ? (
                currentEvents.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{e.title}</td>
                    <td className="p-4 text-gray-600">{e.location || "Chưa cập nhật"}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(e.startTime).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {isAdminMode ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px]">
                            {(e.createdByName || e.creator?.fullName || e.createdBy || "U").substring(0, 1).toUpperCase()}
                          </div>
                          <span>{e.createdByName || e.creator?.fullName || e.createdBy || "Hệ thống"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-indigo-600">
                          {(e.approvedByName || e.approver?.fullName) ? (
                            <>
                              <CheckCircle size={14} />
                              <span>{e.approvedByName || e.approver?.fullName}</span>
                            </>
                          ) : (
                            ["PLAN_APPROVED", "PUBLISHED", "ONGOING", "COMPLETED"].includes(e.status) ? (
                              <>
                                <CheckCircle size={14} />
                                <span>Đã phê duyệt</span>
                              </>
                            ) : (
                              <span className="text-gray-400 italic text-xs">Chưa duyệt</span>
                            )
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_COLOR[e.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[e.status] || e.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        {/* 1. Xem chi tiết / Điều hướng Dashboard */}
                        <button
                          onClick={() => handleView(e)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-all cursor-pointer"
                          title="Xem chi tiết / Bảng điều khiển"
                        >
                          <Eye size={16} />
                        </button>

                        {/* 2. Lưu Word (Chỉ cho Plan) */}
                        {mode === "plan" && (
                          <button
                            onClick={() => handleExportWord(e)}
                            className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-all cursor-pointer"
                            title="Lưu file Word"
                          >
                            <Download size={16} />
                          </button>
                        )}

                        {/* 3. Chỉnh sửa (Nếu có quyền hoặc là bản nháp/bị từ chối của mình) */}
                        {(e.currentUserRole?.canEditEvent || (!isAdminMode && (e.status === "DRAFT" || e.status === "REJECTED"))) && (
                          <button
                            onClick={() => handleEdit(e)}
                            className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition-all cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}

                        {/* 4. Gửi phê duyệt (Cho Lecturer khi ở Draft/Rejected) */}
                        {!isAdminMode && (e.status === "DRAFT" || e.status === "REJECTED") && (
                          <button
                            onClick={() => handleSubmitForApproval(e.id, e.title)}
                            className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-all cursor-pointer disabled:cursor-not-allowed"
                            title="Gửi phê duyệt"
                            disabled={submittingId === e.id}
                          >
                            {submittingId === e.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                        )}

                        {/* 5. Xóa (Cho Admin hoặc Lecturer khi ở Draft) */}
                        {(isAdminMode || (!isAdminMode && e.status === "DRAFT")) && (
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, id: e.id })}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-all cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {/* 6. Admin Approval Actions (Quick) */}
                        {isAdminMode && e.status === "PLAN_PENDING_APPROVAL" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(e.id, "PLAN_APPROVED")}
                              className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-all cursor-pointer"
                              title="Phê duyệt kế hoạch"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(e.id, "REJECTED")}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-all cursor-pointer"
                              title="Từ chối kế hoạch"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}

                        {isAdminMode && e.status === "EVENT_PENDING_APPROVAL" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(e.id, "PUBLISHED")}
                              className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-all cursor-pointer"
                              title="Phê duyệt sự kiện"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(e.id, "REJECTED")}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-all cursor-pointer"
                              title="Từ chối sự kiện"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    {mode === "plan" ? "Không tìm thấy kế hoạch nào" : "Không tìm thấy sự kiện nào"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            disabled={page === 1}
          >
            <ChevronLeft size={20} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${page === num
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 hover:bg-gray-50"
                }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            disabled={page === totalPages}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODALS */}
      {mode === "plan" ? (
        <CreatePlanModal
          isOpen={isCreateModalOpen}
          onClose={() => { setIsCreateModalOpen(false); setImportedRawText(""); }}
          onSelectPlan={handleSelectPlan}
          onCreateNew={handleCreateNew}
          initialAiText={importedRawText}
        />
      ) : (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => { setIsCreateModalOpen(false); setImportedRawText(""); }}
          onSelectPlan={handleSelectPlan}
          onCreateNew={handleCreateNew}
          initialAiText={importedRawText}
        />
      )}

      <PromptModal
        isOpen={promptModal.isOpen}
        onClose={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={promptModal.onConfirm}
        title={promptModal.title}
        message={promptModal.message}
        placeholder={promptModal.placeholder}
        defaultValue={promptModal.defaultValue}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Xóa kế hoạch"
        message="Bạn có chắc chắn muốn xóa kế hoạch này? Hành động này không thể hoàn tác."
        confirmText="Xóa ngay"
        type="danger"
      />

      <ConfirmModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, id: null })}
        onConfirm={handleCancel}
        title="Hủy sự kiện"
        message="Bạn có chắc chắn muốn hủy sự kiện này? Hệ thống sẽ thông báo tới người tham gia."
        confirmText="Xác nhận hủy"
        type="warning"
      />

      {/* PLAN PREVIEW MODAL */}
      <AnimatePresence>
        {previewModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewModal({ isOpen: false, event: null })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Chi tiết kế hoạch</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Xem trước nội dung đề xuất</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewModal({ isOpen: false, event: null })}
                  className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-800 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
                <EventReviewStep
                  formData={{
                    ...previewModal.event,
                    eventTitle: previewModal.event.title,
                    eventPurpose: previewModal.event.description,
                    startTime: previewModal.event.startTime,
                    endTime: previewModal.event.endTime,
                    location: previewModal.event.location,
                    maxParticipants: previewModal.event.maxParticipants,
                    targetObjects: previewModal.event.targetObjects || [],
                    sessions: previewModal.event.sessions || [],
                    presenters: previewModal.event.presenters || [],
                    organizationName: previewModal.event.organizationName,
                    organizationEmail: previewModal.event.organizationEmail,
                  }}
                  isPlanMode={true}
                  onBack={() => setPreviewModal({ isOpen: false, event: null })}
                  // Pass empty handlers to disable buttons in preview mode
                  onSubmit={() => { }}
                  onSaveDraft={() => { }}
                  onReset={() => { }}
                  isReadOnly={true}
                />
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleExportWord(previewModal.event);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all mr-auto"
                >
                  <Download size={18} />
                  Xuất Word
                </button>

                {isAdminMode && previewModal.event.status === "PLAN_PENDING_APPROVAL" && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(previewModal.event.id, "REJECTED");
                        setPreviewModal({ isOpen: false, event: null });
                      }}
                      className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all flex items-center gap-2"
                    >
                      <XCircle size={18} />
                      Từ chối
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(previewModal.event.id, "PLAN_APPROVED");
                        setPreviewModal({ isOpen: false, event: null });
                      }}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Phê duyệt kế hoạch
                    </button>
                  </>
                )}

                {isAdminMode && previewModal.event.status === "EVENT_PENDING_APPROVAL" && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(previewModal.event.id, "REJECTED");
                        setPreviewModal({ isOpen: false, event: null });
                      }}
                      className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all flex items-center gap-2"
                    >
                      <XCircle size={18} />
                      Từ chối
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(previewModal.event.id, "PUBLISHED");
                        setPreviewModal({ isOpen: false, event: null });
                      }}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Duyệt & Đăng tải
                    </button>
                  </>
                )}

                <button
                  onClick={() => setPreviewModal({ isOpen: false, event: null })}
                  className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-100"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsManagement;
