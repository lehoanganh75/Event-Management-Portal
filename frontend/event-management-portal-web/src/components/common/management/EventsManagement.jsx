import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Eye, Edit2, Trash2, Send, Loader2, ChevronLeft, ChevronRight, Plus,
  Calendar, Clock, Users, PlayCircle, CheckCircle2, Download, AlertCircle, X,
  XCircle, CheckCircle,
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
import { EventCreator } from "../../event-planner/EventCreator";
import CreateEventModal from "../../event-planner/CreateEventModal";
import { extractDataFromDocx } from "../../../services/docxImportService";

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

  const isAdminMode = useMemo(() => type === "admin", [type]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

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



  /* ===== FETCH ===== */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (isAdminMode) {
        if (mode === "plan") {
          res = await eventService.getAllPlans();
        } else if (mode === "event") {
          // You might need a specific getAdminAllEvents that only returns non-plan events
          // or just filter from all. But let's use the separate plan endpoint for plans.
          res = await eventService.getAdminAllEvents();
        } else {
          res = await eventService.getAdminAllEvents();
        }
      } else {
        res = mode === "plan"
          ? await eventService.getMyPlans()
          : await eventService.getMyEvents();
      }

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
        if (activeTab === "Công bố") return ["PUBLISHED", "ONGOING"].includes(e.status);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) return;
    try {
      await eventService.deleteEvent(id);
    } catch (error) {
      showToast("Lỗi khi xóa sự kiện", "error");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy sự kiện này?")) return;
    try {
      await eventService.cancelEvent(id);
      // toast.success removed - handled by WebSocket notification
      fetchData();
    } catch (error) {
      showToast("Lỗi khi hủy sự kiện", "error");
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

    // Optimistic Update
    const oldEvents = [...events];
    const currentEvent = oldEvents.find(e => e.id === id);
    if (!currentEvent) return;

    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));

    try {
      // Sử dụng các API chuyên biệt nếu có để kích hoạt logic nghiệp vụ (thông báo, v.v.)
      switch (newStatus) {
        case "PLAN_APPROVED":
          await eventService.approvePlan(id);
          break;
        case "PUBLISHED":
          await eventService.approveEvent(id);
          break;
        case "REJECTED":
          const rejectReason = prompt("Lý do từ chối:", "Cập nhật bởi Admin");
          if (!rejectReason) {
            setEvents(oldEvents);
            return;
          }
          await eventService.rejectPlan(id, rejectReason);
          break;
        case "CANCELLED":
          const cancelReason = prompt("Lý do hủy:", "Cập nhật bởi Admin");
          if (!cancelReason) {
            setEvents(oldEvents);
            return;
          }
          await eventService.cancelEvent(id, cancelReason);
          break;
        default:
          await eventService.updateEvent(id, { ...currentEvent, status: newStatus });
      }

      showToast(`Cập nhật trạng thái thành công: ${STATUS_LABELS[newStatus]}`, "success");
      fetchData();
    } catch (err) {
        setEvents(oldEvents); // Rollback
        showToast("Không thể cập nhật trạng thái", "error");
      }
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
              orderIndex: idx + 1
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
            eventTitle: data.rawText?.split('\n')[0]?.substring(0, 50) || "Sự kiện mới từ Docx",
            eventPurpose: data.rawText || "",
            eventType: "WORKSHOP",
            eventMode: "OFFLINE",
            orgSelectionMode: "existing",
            sessions: [],
            presenters: []
          };

          // Handle datetimes
          if (extracted?.suggestedStartTime) {
            mappedData.startTime = new Date(extracted.suggestedStartTime).toISOString().slice(0, 16);
          }
          if (extracted?.suggestedEndTime) {
            mappedData.endTime = new Date(extracted.suggestedEndTime).toISOString().slice(0, 16);
          }

          setImportedRawText(data.rawText || "");
          
          setCreatorConfig({ 
            initialFormData: mappedData, 
            fromPlan: false,
            forceEventMode: mode === "event",
            startAtStep: mode === "plan" ? 3 : 5 
          });
          setShowEventCreator(true);
          
          showToast("✨ Đã xử lý file thành công!", "success");
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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md"
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
          {/* Luôn hiển thị Import và Tạo mới đối với Admin hoặc trong mode Plan */}
          {(isAdminMode || mode === "plan" || mode === "all") && (
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
                {mode === "plan" ? "Tạo kế hoạch mới" : "Tạo sự kiện mới"}
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
            { id: "Công bố", label: "Công bố", icon: Clock, count: events.filter(e => ["PUBLISHED", "ONGOING"].includes(e.status)).length },
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
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_COLOR[e.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[e.status] || e.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => navigate(isAdminMode ? `/admin/events/${e.id}` : `/lecturer/events/${e.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 transition-all"
                          title="Bảng điều khiển"
                        >
                          <LayoutDashboard size={18} />
                        </button>

                        {/* ACTIONS FOR ADMIN */}
                        {isAdminMode && (
                          <>
                            {e.status === "PLAN_PENDING_APPROVAL" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(e.id, "PLAN_APPROVED")}
                                  className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-all"
                                  title="Duyệt kế hoạch"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(e.id, "REJECTED")}
                                  className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                                  title="Từ chối"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}

                            {e.status === "EVENT_PENDING_APPROVAL" && (
                              <button
                                onClick={() => handleStatusUpdate(e.id, "PUBLISHED")}
                                className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                                title="Duyệt sự kiện"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                          </>
                        )}

                        {/* ACTIONS FOR LECTURER */}
                        {!isAdminMode && (
                          <div className="flex gap-1.5">
                            {e.currentUserRole?.canEditEvent && (
                              <>
                                <button
                                  onClick={() => handleEdit(e)}
                                  className="p-2 hover:bg-amber-100 rounded-lg text-amber-600 transition-all"
                                  title="Chỉnh sửa"
                                >
                                  <Edit2 size={18} />
                                </button>

                                {(e.status === "DRAFT" || e.status === "REJECTED") && (
                                  <button
                                    onClick={() => handleSubmitForApproval(e.id, e.title)}
                                    className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all"
                                    title="Gửi phê duyệt"
                                    disabled={submittingId === e.id}
                                  >
                                    {submittingId === e.id ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                  </button>
                                )}

                                {e.status === "DRAFT" && (
                                  <button
                                    onClick={() => handleDelete(e.id)}
                                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                                    title="Xóa"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
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
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setImportedRawText(""); }}
        onSelectPlan={handleSelectPlan}
        onCreateNew={handleCreateNew}
        initialAiText={importedRawText}
      />
    </div>
  );
};

export default EventsManagement;
