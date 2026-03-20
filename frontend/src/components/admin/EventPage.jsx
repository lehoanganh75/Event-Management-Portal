import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  CalendarIcon,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  Filter,
  Calendar,
  MapPin,
  Users,
  Tag,
  CheckCircle,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileText,
  Globe,
  ShieldCheck,
  Award,
  Image as ImageIcon,
  Clock,
  UserPlus,
  Building2,
  BookOpen,
  MessageSquare,
  Hash,
  Info,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllEvents,
  getAllPlans,
  deleteEvent,
  approvePlan,
  cancelPlan,
  updateEvent,
} from "../../api/eventApi";
import CreateEventModal from "../events/CreateEventModal";
import { EventCreator } from "../events/EventCreator";

const STATUS_LABELS = {
  All: "Tất cả trạng thái",
  PendingApproval: "Chờ duyệt",
  Published: "Đã đăng",
  Ongoing: "Đang diễn ra",
  Completed: "Đã kết thúc",
  Cancelled: "Đã hủy",
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

    if (format === "short") return `${day}/${month}/${year}`;
    if (format === "time") return `${hour}:${min}`;
    return `${hour}:${min} - ${day}/${month}/${year}`;
  } catch {
    return "Chưa cập nhật";
  }
};

const getArrayDisplay = (arr) => {
  if (!arr || arr.length === 0) return "Không có";
  return arr.join(", ");
};

const getCurrentAccountId = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("[getCurrentAccountId] payload:", payload);
    return payload.accountId || payload.userId || payload.sub || null;
  } catch (e) {
    console.error("[getCurrentAccountId] Lỗi decode token:", e);
    return null;
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
      <div className="text-sm font-semibold text-slate-800">{value || "—"}</div>
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

const EventPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [creatorFilter, setCreatorFilter] = useState("All");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [creatorKey, setCreatorKey] = useState(0);
  const [fromPlan, setFromPlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const prefillRef = useRef({});

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const [eventsRes, plansRes] = await Promise.all([
        getAllEvents().catch(() => ({ data: [] })),
        getAllPlans().catch(() => ({ data: [] })),
      ]);

      const combined = [...(eventsRes.data || []), ...(plansRes.data || [])];
      const unique = Array.from(
        new Map(combined.map((item) => [item.id, item])).values(),
      );

      setEvents(unique);
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi tải danh sách sự kiện", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const uniqueCreators = useMemo(() => {
    const creators = events
      .map((e) => e.createdByName)
      .filter((name) => name && name.trim() !== "");
    return [...new Set(creators)].sort();
  }, [events]);

  const processedEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Bỏ qua bản nháp
        if (event.status === "Draft" || event.status === "DRAFT") return false;

        const matchesSearch =
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "All" ||
          event.status === statusFilter ||
          event.status?.toUpperCase() === statusFilter.toUpperCase() ||
          (statusFilter === "PendingApproval" &&
            event.status === "PENDING_APPROVAL");

        const matchesCreator =
          creatorFilter === "All" || event.createdByName === creatorFilter;

        return matchesSearch && matchesStatus && matchesCreator;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.startTime) -
          new Date(a.createdAt || a.startTime),
      );
  }, [events, searchTerm, statusFilter, creatorFilter]);

  const totalPages = Math.ceil(processedEvents.length / itemsPerPage);
  const currentItems = processedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, creatorFilter]);

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete.id);
      showToast("Xóa sự kiện thành công!", "success");
      setEvents(events.filter((e) => e.id !== eventToDelete.id));
    } catch (err) {
      showToast("Lỗi khi xóa sự kiện!", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const handleApprove = async (id) => {
    const accountId = getCurrentAccountId();
    if (!accountId) {
      showToast("Không xác định được người dùng!", "error");
      return;
    }
    try {
      await approvePlan(id, accountId, accountId);
      showToast("Đã phê duyệt sự kiện!", "success");
      fetchEvents();
    } catch (err) {
      showToast("Lỗi khi phê duyệt!", "error");
    }
  };

  const handleReject = async (id) => {
    const accountId = getCurrentAccountId();
    if (!accountId) {
      showToast("Không xác định được người dùng!", "error");
      return;
    }
    try {
      await cancelPlan(id, accountId);
      showToast("Đã từ chối sự kiện!", "success");
      fetchEvents();
    } catch (err) {
      showToast("Lỗi khi từ chối!", "error");
    }
  };

  const openModal = (event, mode) => {
    setSelectedEvent({ ...event });
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateEvent(selectedEvent.id, selectedEvent);
      setEvents(
        events.map((ev) => (ev.id === selectedEvent.id ? selectedEvent : ev)),
      );
      closeModal();
      showToast("Cập nhật thành công!", "success");
    } catch {
      showToast("Cập nhật thất bại!", "error");
    }
  };

  const handleSelectPlan = ({ fromPlan: fp, initialFormData }) => {
    prefillRef.current = initialFormData || {};
    setCreatorKey((k) => k + 1);
    setFromPlan(fp);
    setSelectedPlanId(initialFormData?._selectedPlanId || null);
    setShowEventCreator(true);
  };

  const handleCreateNew = ({ fromPlan: fp, initialFormData }) => {
    prefillRef.current = initialFormData || {};
    setCreatorKey((k) => k + 1);
    setFromPlan(fp);
    setShowEventCreator(true);
  };

  const updatePlanStatus = async (planId) => {
    const accountId = getCurrentAccountId();
    if (!accountId) return;
    try {
      await cancelPlan(planId, accountId);
    } catch (error) {
      console.error("Lỗi update plan status:", error);
    }
  };

  const getStatusStyle = (status) => {
    const s = status?.toUpperCase() || "";
    if (s === "PUBLISHED") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "ONGOING")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "PENDINGAPPROVAL" || s === "PENDING_APPROVAL")
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "COMPLETED")
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (s === "CANCELLED" || s === "REJECTED")
      return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getStatusColorName = (status) => {
    const statusUpper = status?.toUpperCase?.() || "";
    if (statusUpper === "PUBLISHED") return "blue";
    if (statusUpper === "ONGOING" || statusUpper === "COMPLETED")
      return "emerald";
    if (statusUpper === "PENDINGAPPROVAL" || statusUpper === "PENDING_APPROVAL")
      return "amber";
    if (statusUpper === "CANCELLED" || statusUpper === "REJECTED")
      return "rose";
    return "slate";
  };

  if (showEventCreator) {
    return (
      <EventCreator
        key={creatorKey}
        initialFormData={prefillRef.current}
        fromPlan={fromPlan}
        onBack={async () => {
          if (selectedPlanId) {
            await updatePlanStatus(selectedPlanId);
          }
          setShowEventCreator(false);
          setFromPlan(false);
          setSelectedPlanId(null);
          prefillRef.current = {};
          fetchEvents();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 bg-slate-50/50 min-h-screen relative">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="text-emerald-500" size={24} />
            ) : (
              <XCircle className="text-rose-500" size={24} />
            )}
            <p
              className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}
            >
              {toast.message}
            </p>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="ml-4 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Quản lý tất cả sự kiện
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Tìm thấy {processedEvents.length} sự kiện trên hệ thống
          </p>
        </div>

        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          Tạo sự kiện mới
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện theo tên, địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            <Filter size={16} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-slate-700 py-1.5 outline-none cursor-pointer min-w-[140px]"
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            <User size={16} className="text-slate-500" />
            <select
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-slate-700 py-1.5 outline-none cursor-pointer min-w-[140px]"
            >
              <option value="All">Tất cả người tạo</option>
              {uniqueCreators.map((creator, idx) => (
                <option key={idx} value={creator}>{creator}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-sm text-slate-500 font-medium">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : processedEvents.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <Calendar className="text-slate-300" size={60} />
              <p className="text-slate-500 font-medium text-lg">
                Không tìm thấy sự kiện nào!
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Tên sự kiện</th>
                  <th className="px-6 py-4">Thời gian & Địa điểm</th>
                  <th className="px-6 py-4">Đăng ký</th>
                  <th className="px-6 py-4">Người tạo</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {currentItems.map((event) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={event.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800 block mb-1">
                          {event.title}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-400 uppercase">
                          <Tag size={12} /> {event.type || "Sự kiện"} •{" "}
                          {event.eventMode || "OFFLINE"}
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <MapPin size={14} className="text-rose-500" />
                          <span className="truncate max-w-[200px]">
                            {event.location || "Chưa cập nhật"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                          <Calendar size={13} className="text-blue-500" />
                          {event.eventDate || "Chưa cập nhật"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <Users size={16} className="text-indigo-500" />
                          {event.registeredCount || 0} / {event.maxParticipants}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                            {event.createdByName ? event.createdByName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {event.createdByName || "Không rõ"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(event.status)}`}
                        >
                          {STATUS_LABELS[event.status] ||
                            STATUS_LABELS[
                              event.status?.charAt(0).toUpperCase() +
                                event.status?.slice(1).toLowerCase()
                            ] ||
                            event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {(event.status === "PendingApproval" ||
                            event.status === "PENDING_APPROVAL" ||
                            event.status === "PENDINGAPPROVAL") && (
                            <>
                              <button
                                onClick={() => handleApprove(event.id)}
                                title="Phê duyệt"
                                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(event.id)}
                                title="Từ chối"
                                className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                <XCircle size={18} />
                              </button>
                              <div className="w-px h-5 bg-slate-200 mx-1"></div>
                            </>
                          )}
                          <button
                            onClick={() => openModal(event, "view")}
                            title="Xem chi tiết"
                            className="p-2 text-slate-400 bg-slate-50 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openModal(event, "edit")}
                            title="Chỉnh sửa"
                            className="p-2 text-slate-400 bg-slate-50 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEventToDelete(event);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Xóa"
                            className="p-2 text-slate-400 bg-slate-50 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="p-5 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all shadow-sm ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDeleteModalOpen && eventToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                Xác nhận xóa?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2">
                Bạn chắc chắn muốn xóa sự kiện <br />
                <span className="font-bold text-slate-700 italic">
                  "{eventToDelete.title}"
                </span>
                ? <br />
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 border border-slate-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-4 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all text-sm uppercase"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${modalMode === "view" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}
                  >
                    {modalMode === "view" ? (
                      <Info size={20} />
                    ) : (
                      <Edit2 size={20} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                      {modalMode === "view"
                        ? "Thông tin chi tiết sự kiện"
                        : "Chỉnh sửa sự kiện"}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {selectedEvent?.id
                        ? `#${selectedEvent.id.substring(0, 8).toUpperCase()}`
                        : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form onSubmit={handleUpdate} className="space-y-8">
                  {modalMode === "view" ? (
                    <>
                      <Section
                        title="Thông tin cơ bản"
                        icon={FileText}
                        color="blue"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow
                            label="ID"
                            value={
                              selectedEvent?.id
                                ? `#${selectedEvent.id.substring(0, 8).toUpperCase()}`
                                : ""
                            }
                            icon={Hash}
                            color="slate"
                          />
                          <InfoRow
                            label="Tên sự kiện"
                            value={selectedEvent?.title}
                            icon={FileText}
                            color="blue"
                          />
                          <InfoRow
                            label="Loại sự kiện"
                            value={
                              EVENT_TYPE_LABELS[selectedEvent?.type] ||
                              selectedEvent?.type ||
                              "Không xác định"
                            }
                            icon={Tag}
                            color="purple"
                          />
                          <InfoRow
                            label="Chủ đề"
                            value={selectedEvent?.eventTopic || "Không có"}
                            icon={BookOpen}
                            color="emerald"
                          />
                          <InfoRow
                            label="Đơn vị tổ chức"
                            value={
                              selectedEvent?.major
                                ? `${selectedEvent?.faculty} – ${selectedEvent?.major}`
                                : selectedEvent?.faculty ||
                                  selectedEvent?.organizerUnit ||
                                  "Chưa xác định"
                            }
                            icon={Building2}
                            color="amber"
                          />
                          <InfoRow
                            label="Hình thức"
                            value={
                              selectedEvent?.eventMode === "ONLINE"
                                ? "Trực tuyến"
                                : selectedEvent?.eventMode === "OFFLINE"
                                  ? "Trực tiếp"
                                  : selectedEvent?.eventMode
                            }
                            icon={Globe}
                            color="cyan"
                          />
                          <InfoRow
                            label="Trạng thái"
                            value={
                              <Badge
                                color={getStatusColorName(
                                  selectedEvent?.status,
                                )}
                              >
                                {STATUS_LABELS[selectedEvent?.status] ||
                                  selectedEvent?.status}
                              </Badge>
                            }
                            icon={ShieldCheck}
                            color="slate"
                          />
                          <InfoRow
                            label="Vòng quay may mắn"
                            value={selectedEvent?.hasLuckyDraw ? "Có" : "Không"}
                            icon={Award}
                            color="amber"
                          />
                          {selectedEvent?.coverImage && (
                            <InfoRow
                              label="Ảnh bìa"
                              value={
                                <a
                                  href={selectedEvent.coverImage}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Xem ảnh đính kèm
                                </a>
                              }
                              icon={ImageIcon}
                              color="pink"
                            />
                          )}
                        </div>
                      </Section>

                      <Section
                        title="Thời gian & Địa điểm"
                        icon={Clock}
                        color="rose"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow
                            label="Thời gian bắt đầu"
                            value={formatDate(selectedEvent?.startTime)}
                            icon={CalendarIcon}
                            color="rose"
                          />
                          <InfoRow
                            label="Thời gian kết thúc"
                            value={formatDate(selectedEvent?.endTime)}
                            icon={CalendarIcon}
                            color="rose"
                          />
                          <InfoRow
                            label="Hạn đăng ký"
                            value={formatDate(
                              selectedEvent?.registrationDeadline,
                            )}
                            icon={Clock}
                            color="amber"
                          />
                          <InfoRow
                            label="Địa điểm"
                            value={selectedEvent?.location}
                            icon={MapPin}
                            color="green"
                          />
                        </div>
                      </Section>

                      <Section
                        title="Quy mô & Đối tượng"
                        icon={Users}
                        color="violet"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow
                            label="Số lượng tối đa"
                            value={`${selectedEvent?.maxParticipants || 0} người`}
                            icon={Users}
                            color="violet"
                          />
                          <InfoRow
                            label="Đã đăng ký"
                            value={`${selectedEvent?.registeredCount || 0} người`}
                            icon={UserPlus}
                            color="indigo"
                          />
                          <div className="col-span-2">
                            <InfoRow
                              label="Đối tượng tham gia"
                              value={getArrayDisplay(
                                selectedEvent?.participants,
                              )}
                              icon={Users}
                              color="purple"
                            />
                          </div>
                        </div>
                      </Section>

                      {(selectedEvent?.recipients?.length > 0 ||
                        selectedEvent?.customRecipients?.length > 0) && (
                        <Section
                          title="Nơi nhận thông báo"
                          icon={Mail}
                          color="amber"
                        >
                          <div className="space-y-4">
                            {selectedEvent?.recipients?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                  Nơi nhận chính
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedEvent.recipients.map((r, i) => (
                                    <Badge key={i} color="blue">
                                      {r}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedEvent?.customRecipients?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                  Nơi nhận khác
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedEvent.customRecipients.map(
                                    (r, i) => (
                                      <Badge key={i} color="purple">
                                        {r}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </Section>
                      )}

                      <Section
                        title="Thành phần tham gia"
                        icon={Users}
                        color="indigo"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow
                            label="Người trình bày"
                            value={getArrayDisplay(selectedEvent?.presenters)}
                            icon={UserPlus}
                            color="cyan"
                          />
                          <InfoRow
                            label="Ban tổ chức"
                            value={getArrayDisplay(
                              selectedEvent?.organizingCommittee,
                            )}
                            icon={Award}
                            color="amber"
                          />
                          <InfoRow
                            label="Người tham dự"
                            value={getArrayDisplay(selectedEvent?.attendees)}
                            icon={Users}
                            color="green"
                          />
                          <InfoRow
                            label="Người tạo"
                            value={selectedEvent?.createdByName || "Không có"}
                            icon={UserPlus}
                            color="slate"
                          />
                          <InfoRow
                            label="Người duyệt"
                            value={selectedEvent?.approvedByName || "Chưa có"}
                            icon={ShieldCheck}
                            color="emerald"
                          />
                        </div>
                      </Section>

                      <Section
                        title="Mô tả chi tiết"
                        icon={FileText}
                        color="slate"
                      >
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                            {selectedEvent?.description || "Không có mô tả"}
                          </p>
                        </div>
                      </Section>

                      <Section
                        title="Thông tin bổ sung"
                        icon={MessageSquare}
                        color="amber"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <InfoRow
                            label="Ghi chú quản lý"
                            value={selectedEvent?.notes || "Không có"}
                            icon={FileText}
                            color="amber"
                          />
                          <InfoRow
                            label="Thông tin thêm"
                            value={selectedEvent?.additionalInfo || "Không có"}
                            icon={Info}
                            color="slate"
                          />
                        </div>
                      </Section>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <CalendarIcon
                              size={14}
                              className="text-slate-400"
                            />
                            <span className="font-medium text-slate-500">
                              Ngày tạo:{" "}
                              <span className="font-bold text-slate-700">
                                {formatDate(selectedEvent?.createdAt)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-500">
                              Cập nhật lần cuối:{" "}
                              <span className="font-bold text-slate-700">
                                {formatDate(selectedEvent?.updatedAt)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Tên sự kiện
                          </label>
                          <input
                            type="text"
                            value={selectedEvent?.title || ""}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Loại sự kiện
                          </label>
                          <select
                            value={selectedEvent?.type || ""}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                type: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          >
                            <option value="">Chọn loại</option>
                            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Chủ đề
                          </label>
                          <input
                            type="text"
                            value={selectedEvent?.eventTopic || ""}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                eventTopic: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Hình thức
                          </label>
                          <select
                            value={selectedEvent?.eventMode || "OFFLINE"}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                eventMode: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          >
                            <option value="OFFLINE">Offline (Trực tiếp)</option>
                            <option value="ONLINE">Online (Trực tuyến)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Địa điểm / Link
                          </label>
                          <input
                            type="text"
                            value={selectedEvent?.location || ""}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                location: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Trạng thái
                          </label>
                          <select
                            value={selectedEvent?.status || ""}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                status: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          >
                            {Object.entries(STATUS_LABELS)
                              .filter(([k]) => k !== "All")
                              .map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Thời gian bắt đầu
                          </label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocal(selectedEvent?.startTime)}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                startTime: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Thời gian kết thúc
                          </label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocal(selectedEvent?.endTime)}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                endTime: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Hạn đăng ký
                          </label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocal(
                              selectedEvent?.registrationDeadline,
                            )}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                registrationDeadline: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Số lượng tối đa
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={selectedEvent?.maxParticipants || 0}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                maxParticipants: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div className="col-span-2 flex items-center gap-3 py-2 mt-2">
                          <input
                            type="checkbox"
                            id="edit-lucky-draw"
                            checked={selectedEvent?.hasLuckyDraw || false}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                hasLuckyDraw: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor="edit-lucky-draw"
                            className="text-xs font-bold text-slate-500 cursor-pointer"
                          >
                            Có tổ chức vòng quay may mắn
                          </label>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Mô tả
                          </label>
                          <textarea
                            rows={4}
                            value={selectedEvent?.description || ""}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                description: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                            placeholder="Nhập mô tả chi tiết..."
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Ghi chú quản lý
                          </label>
                          <textarea
                            rows={2}
                            value={selectedEvent?.notes || ""}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                notes: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                            placeholder="Các lưu ý nội bộ..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all border border-transparent"
                    >
                      Đóng
                    </button>
                    {modalMode === "edit" && (
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                      >
                        <Edit2 size={18} /> Lưu thay đổi
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchEvents}
        onSelectPlan={handleSelectPlan}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
};

export default EventPage;
