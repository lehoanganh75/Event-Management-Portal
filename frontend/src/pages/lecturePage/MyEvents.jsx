import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  Tag,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowsUpFromLine,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  Globe,
  ShieldCheck,
  Info,
  AlertTriangle,
  Hash,
  Award,
  MessageSquare,
  Building2,
  UserPlus,
  FileText,
  Mail,
  BookOpen,
  Image as ImageIcon
} from "lucide-react";
import CreateEventModal from "../../components/events/CreateEventModal";
import { EventCreator } from "../../components/events/EventCreator";
import { getMyEvents, getMyPlans, deleteEvent, updateEvent, cancelPlan } from "../../api/eventApi";
import { exportEventsToExcel } from "../../utils/exportExcel";

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
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-${color}-100 text-${color}-700`}>
    {children}
  </span>
);

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [creatorKey, setCreatorKey] = useState(0);
  const [sortConfig, setSortConfig] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [fromPlan, setFromPlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const prefillRef = useRef({});
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      let accountId = null;
      
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          accountId = user.id || user.accountId || user.account?.id || user.userId;
        } catch (error) {
          console.error("Lỗi parse user data:", error);
        }
      }

      if (!accountId) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          try {
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            accountId = payload.accountId || payload.sub || payload.userId || payload.id;
          } catch (e) {
            console.error("Lỗi decode token:", e);
          }
        }
      }

      if (accountId) {
        // Gọi đồng thời cả API Events (Đã duyệt) và Plans (Chờ duyệt/Từ chối)
        const [eventsResponse, plansResponse] = await Promise.all([
          getMyEvents(accountId).catch(() => ({ data: [] })),
          getMyPlans(accountId).catch(() => ({ data: [] }))
        ]);

        // Gộp mảng và loại bỏ các item trùng lặp ID (nếu có)
        const combinedEvents = [...(eventsResponse.data || []), ...(plansResponse.data || [])];
        const uniqueEvents = Array.from(new Map(combinedEvents.map(item => [item.id, item])).values());
        
        setEvents(uniqueEvents);
      } else {
        showToast("Không tìm thấy thông tin tài khoản", "error");
        setEvents([]);
      }
    } catch (error) {
      console.error(error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const processedEvents = useMemo(() => {
    let result = events.filter((event) => {
      // Bỏ qua các sự kiện đang ở trạng thái nháp (Draft)
      if (event.status === "Draft" || event.status === "DRAFT") return false;

      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    result.sort((a, b) => {
      if (sortConfig === "newest")
        return new Date(b.startTime) - new Date(a.startTime);
      if (sortConfig === "oldest")
        return new Date(a.startTime) - new Date(b.startTime);
      if (sortConfig === "most-registered")
        return (b.registeredCount || 0) - (a.registeredCount || 0);
      return 0;
    });
    return result;
  }, [events, searchTerm, statusFilter, sortConfig]);

  const totalPages = Math.ceil(processedEvents.length / itemsPerPage);
  const currentItems = processedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
    setSelectedEventIds(new Set());
    setSelectAll(false);
  }, [searchTerm, statusFilter]);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    
    if (checked) {
      const allIds = currentItems.map(event => event.id);
      setSelectedEventIds(new Set(allIds));
    } else {
      setSelectedEventIds(new Set());
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    setSelectedEventIds(new Set());
    setSelectAll(false);
  };

  const handleExportAll = () => {
    if (processedEvents.length === 0) {
      showToast("Không có dữ liệu để xuất!", "error");
      return;
    }

    try {
      exportEventsToExcel(processedEvents, "Danh_sach_su_kien");
      showToast(`Xuất thành công ${processedEvents.length} sự kiện!`, "success");
    } catch (error) {
      console.error("Excel Export Error:", error);
      showToast("Có lỗi khi xuất file!", "error");
    }
  };

  const handleExportSelected = () => {
    if (selectedEventIds.size === 0) {
      showToast("Vui lòng chọn ít nhất một sự kiện!", "error");
      return;
    }

    const selectedEvents = events.filter(event => selectedEventIds.has(event.id));
    
    try {
      exportEventsToExcel(selectedEvents, "Danh_sach_su_kien_da_chon");
      showToast(`Xuất thành công ${selectedEvents.length} sự kiện đã chọn!`, "success");
    } catch (error) {
      console.error("Excel Export Error:", error);
      showToast("Có lỗi khi xuất file!", "error");
    }
  };

  const getStatusStyle = (status) => {
    const statusUpper = status?.toUpperCase?.() || "";
    if (statusUpper === "PUBLISHED") return "bg-blue-50 text-blue-600 border border-blue-100";
    if (statusUpper === "ONGOING") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    if (statusUpper === "PENDINGAPPROVAL" || statusUpper === "PENDING_APPROVAL") return "bg-amber-50 text-amber-600 border border-amber-100";
    if (statusUpper === "COMPLETED") return "bg-purple-50 text-purple-600 border border-purple-100";
    if (statusUpper === "CANCELLED") return "bg-rose-50 text-rose-600 border border-rose-100";
    return "bg-slate-50 text-slate-500 border border-slate-200";
  };

  const getStatusColorName = (status) => {
    const statusUpper = status?.toUpperCase?.() || "";
    if (statusUpper === "PUBLISHED") return "blue";
    if (statusUpper === "ONGOING" || statusUpper === "COMPLETED") return "emerald";
    if (statusUpper === "PENDINGAPPROVAL" || statusUpper === "PENDING_APPROVAL") return "amber";
    if (statusUpper === "CANCELLED" || statusUpper === "REJECTED") return "rose";
    return "slate";
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

  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEvent(eventToDelete.id);
      setEvents(events.filter((e) => e.id !== eventToDelete.id));
      showToast("Xóa thành công!", "success");
    } catch {
      showToast("Xóa thất bại!", "error");
    } finally {
      closeDeleteModal();
    }
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
      showToast("Lỗi server!", "error");
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
    try {
      await cancelPlan(planId);
      let accountId = "user-id";
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          accountId = user.id || user.accountId || accountId;
        } catch (e) {}
      }
      await cancelPlan(planId, accountId);
    } catch (error) {
      console.error("Lỗi update plan status:", error);
    }
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 relative min-h-screen p-6 bg-slate-50/50"
    >
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-6 right-6 z-100 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${
              toast.type === "success"
                ? "border-emerald-100"
                : "border-rose-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="text-emerald-500" size={24} />
            ) : (
              <AlertCircle className="text-rose-500" size={24} />
            )}
            <p
              className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}
            >
              {toast.message}
            </p>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-4 text-slate-400"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Quản lý sự kiện
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Tìm thấy {processedEvents.length} kết quả
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold border border-slate-200 transition-all hover:bg-slate-50"
          >
            <Download size={18} /> Xuất tất cả ({processedEvents.length})
          </button>
          
          <button
            onClick={handleExportSelected}
            disabled={selectedEventIds.size === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
              selectedEventIds.size > 0
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Download size={18} /> Xuất đã chọn ({selectedEventIds.size})
          </button>
          
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200"
          >
            <Plus size={20} /> Tạo mới
          </button>
        </div>
      </div>

      {selectedEventIds.size > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-blue-600" size={20} />
            <span className="text-sm font-bold text-blue-800">
              Đã chọn <span className="text-blue-600 text-lg mx-1">{selectedEventIds.size}</span> sự kiện
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedEventIds(new Set());
              setSelectAll(false);
            }}
            className="text-blue-600 hover:text-blue-800 font-bold text-sm flex items-center gap-1"
          >
            <X size={16} /> Bỏ chọn tất cả
          </button>
        </motion.div>
      )}

      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm tên, địa điểm..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-2xl border border-transparent">
              <Filter size={16} className="text-slate-400" />
              <select
                className="bg-transparent border-none text-sm font-bold text-slate-600 py-2.5 outline-none cursor-pointer min-w-40"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-2xl border border-transparent">
              <ArrowsUpFromLine size={16} className="text-slate-400" />
              <select
                className="bg-transparent border-none text-sm font-bold text-slate-600 py-2.5 outline-none cursor-pointer min-w-40"
                value={sortConfig}
                onChange={(e) => setSortConfig(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="most-registered">Đăng ký nhiều</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center">
              <Loader2
                className="animate-spin inline-block text-blue-600"
                size={40}
              />
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <CalendarIcon size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-base font-medium">
                {searchTerm || statusFilter !== "All"
                  ? "Không tìm thấy sự kiện phù hợp"
                  : "Chưa có sự kiện nào"}
              </p>
            </div>
          ) : (
            <table className="w-full text-left min-w-250">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4">Sự kiện</th>
                  <th className="px-6 py-4">Địa điểm & Thời gian</th>
                  <th className="px-6 py-4">Đăng ký</th>
                  <th className="px-6 py-4">Người duyệt</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="wait">
                  {currentItems.map((event) => (
                    <motion.tr
                      layout
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedEventIds.has(event.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedEventIds);
                            if (e.target.checked) {
                              newSet.add(event.id);
                            } else {
                              newSet.delete(event.id);
                            }
                            setSelectedEventIds(newSet);
                            setSelectAll(newSet.size === currentItems.length && currentItems.length > 0);
                          }}
                          className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-700 block">
                          {event.title}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-400 uppercase">
                          <Tag size={12} /> {event.eventMode}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                          <MapPin size={14} className="text-rose-500" />{" "}
                          {event.location}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 font-medium">
                          <CalendarIcon size={14} />{" "}
                          {new Date(event.startTime).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="w-32">
                          <div className="flex justify-between text-[16px] font-bold mb-1">
                            <span className="text-slate-500">
                              {event.registeredCount || 0}/
                              {event.maxParticipants}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {event.approvedByName ? (
                            <>
                              <span className="text-xs font-bold text-slate-700 line-clamp-1">
                                {event.approvedByName}
                              </span>
                            </>
                        ) : event.approvedByAccountId ? (
                          <>
                            <span className="text-xs font-bold text-slate-700 line-clamp-1">
                              Admin
                            </span>
                          </>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 italic">Chưa duyệt</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(event.status)}`}
                        >
                          {STATUS_LABELS[event.status] ||
                            STATUS_LABELS[
                              event.status?.charAt(0).toUpperCase() +
                                event.status?.slice(1).toLowerCase()
                            ] ||
                            event.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => openModal(event, "view")}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openModal(event, "edit")}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(event)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
          <div className="p-6 bg-slate-50/30 flex justify-between items-center border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white border border-slate-200 text-slate-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
                Xác nhận xóa?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Bạn có chắc muốn xóa{" "}
                <span className="font-bold text-slate-700">
                  "{eventToDelete?.title}"
                </span>
                ? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all text-sm uppercase"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                      {selectedEvent?.id ? `#${selectedEvent.id.substring(0, 8).toUpperCase()}` : ""}
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
                      <Section title="Thông tin cơ bản" icon={FileText} color="blue">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow label="ID" value={selectedEvent?.id ? `#${selectedEvent.id.substring(0, 8).toUpperCase()}` : ""} icon={Hash} color="slate" />
                          <InfoRow label="Tên sự kiện" value={selectedEvent?.title} icon={FileText} color="blue" />
                          <InfoRow label="Loại sự kiện" value={EVENT_TYPE_LABELS[selectedEvent?.type] || selectedEvent?.type || "Không xác định"} icon={Tag} color="purple" />
                          <InfoRow label="Chủ đề" value={selectedEvent?.eventTopic || "Không có"} icon={BookOpen} color="emerald" />
                          <InfoRow label="Đơn vị tổ chức" value={selectedEvent?.major ? `${selectedEvent?.faculty} – ${selectedEvent?.major}` : selectedEvent?.faculty || selectedEvent?.organizerUnit || "Chưa xác định"} icon={Building2} color="amber" />
                          <InfoRow label="Hình thức" value={selectedEvent?.eventMode === "ONLINE" ? "Trực tuyến" : selectedEvent?.eventMode === "OFFLINE" ? "Trực tiếp" : selectedEvent?.eventMode} icon={Globe} color="cyan" />
                          <InfoRow label="Trạng thái" value={<Badge color={getStatusColorName(selectedEvent?.status)}>{STATUS_LABELS[selectedEvent?.status] || selectedEvent?.status}</Badge>} icon={ShieldCheck} color="slate" />
                          <InfoRow label="Vòng quay may mắn" value={selectedEvent?.hasLuckyDraw ? "Có" : "Không"} icon={Award} color="amber" />
                          {selectedEvent?.coverImage && <InfoRow label="Ảnh bìa" value={<a href={selectedEvent.coverImage} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Xem ảnh đính kèm</a>} icon={ImageIcon} color="pink" />}
                        </div>
                      </Section>

                      <Section title="Thời gian & Địa điểm" icon={Clock} color="rose">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow label="Thời gian bắt đầu" value={formatDate(selectedEvent?.startTime)} icon={CalendarIcon} color="rose" />
                          <InfoRow label="Thời gian kết thúc" value={formatDate(selectedEvent?.endTime)} icon={CalendarIcon} color="rose" />
                          <InfoRow label="Hạn đăng ký" value={formatDate(selectedEvent?.registrationDeadline)} icon={Clock} color="amber" />
                          <InfoRow label="Địa điểm" value={selectedEvent?.location} icon={MapPin} color="green" />
                        </div>
                      </Section>

                      <Section title="Quy mô & Đối tượng" icon={Users} color="violet">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow label="Số lượng tối đa" value={`${selectedEvent?.maxParticipants || 0} người`} icon={Users} color="violet" />
                          <InfoRow label="Đã đăng ký" value={`${selectedEvent?.registeredCount || 0} người`} icon={UserPlus} color="indigo" />
                          <div className="col-span-2">
                            <InfoRow label="Đối tượng tham gia" value={getArrayDisplay(selectedEvent?.participants)} icon={Users} color="purple" />
                          </div>
                        </div>
                      </Section>

                      {(selectedEvent?.recipients?.length > 0 || selectedEvent?.customRecipients?.length > 0) && (
                        <Section title="Nơi nhận thông báo" icon={Mail} color="amber">
                          <div className="space-y-4">
                            {selectedEvent?.recipients?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nơi nhận chính</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedEvent.recipients.map((r, i) => <Badge key={i} color="blue">{r}</Badge>)}
                                </div>
                              </div>
                            )}
                            {selectedEvent?.customRecipients?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nơi nhận khác</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedEvent.customRecipients.map((r, i) => <Badge key={i} color="purple">{r}</Badge>)}
                                </div>
                              </div>
                            )}
                          </div>
                        </Section>
                      )}

                      <Section title="Thành phần tham gia" icon={Users} color="indigo">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoRow label="Người trình bày" value={getArrayDisplay(selectedEvent?.presenters)} icon={UserPlus} color="cyan" />
                          <InfoRow label="Ban tổ chức" value={getArrayDisplay(selectedEvent?.organizingCommittee)} icon={Award} color="amber" />
                          <InfoRow label="Người tham dự" value={getArrayDisplay(selectedEvent?.attendees)} icon={Users} color="green" />
                          <InfoRow label="Người tạo" value={selectedEvent?.createdByName || "Không có"} icon={UserPlus} color="slate" />
                          <InfoRow label="Người duyệt" value={selectedEvent?.approvedByName || "Chưa có"} icon={ShieldCheck} color="emerald" />
                        </div>
                      </Section>

                      <Section title="Mô tả chi tiết" icon={FileText} color="slate">
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                            {selectedEvent?.description || "Không có mô tả"}
                          </p>
                        </div>
                      </Section>

                      <Section title="Thông tin bổ sung" icon={MessageSquare} color="amber">
                        <div className="grid grid-cols-1 gap-4">
                          <InfoRow label="Ghi chú quản lý" value={selectedEvent?.notes || "Không có"} icon={FileText} color="amber" />
                          <InfoRow label="Thông tin thêm" value={selectedEvent?.additionalInfo || "Không có"} icon={Info} color="slate" />
                        </div>
                      </Section>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <CalendarIcon size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-500">
                              Ngày tạo: <span className="font-bold text-slate-700">{formatDate(selectedEvent?.createdAt)}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-500">
                              Cập nhật lần cuối: <span className="font-bold text-slate-700">{formatDate(selectedEvent?.updatedAt)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Tên sự kiện</label>
                          <input
                            type="text"
                            value={selectedEvent?.title || ""}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Loại sự kiện</label>
                          <select
                            value={selectedEvent?.type || ""}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, type: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          >
                            <option value="">Chọn loại</option>
                            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Chủ đề</label>
                          <input
                            type="text"
                            value={selectedEvent?.eventTopic || ""}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, eventTopic: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Hình thức</label>
                          <select
                            value={selectedEvent?.eventMode || "OFFLINE"}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, eventMode: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          >
                            <option value="OFFLINE">Offline (Trực tiếp)</option>
                            <option value="ONLINE">Online (Trực tuyến)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Địa điểm / Link</label>
                          <input
                            type="text"
                            value={selectedEvent?.location || ""}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Trạng thái</label>
                          <select
                            value={selectedEvent?.status || ""}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, status: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          >
                            {Object.entries(STATUS_LABELS).filter(([k]) => k !== "All").map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Thời gian bắt đầu</label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocal(selectedEvent?.startTime)}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, startTime: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Thời gian kết thúc</label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocal(selectedEvent?.endTime)}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, endTime: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Hạn đăng ký</label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocal(selectedEvent?.registrationDeadline)}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, registrationDeadline: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Số lượng tối đa</label>
                          <input
                            type="number"
                            min="1"
                            value={selectedEvent?.maxParticipants || 0}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, maxParticipants: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>

                        <div className="col-span-2 flex items-center gap-3 py-2 mt-2">
                          <input
                            type="checkbox"
                            id="edit-lucky-draw"
                            checked={selectedEvent?.hasLuckyDraw || false}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, hasLuckyDraw: e.target.checked })}
                            className="w-4 h-4 accent-blue-500 cursor-pointer"
                          />
                          <label htmlFor="edit-lucky-draw" className="text-xs font-bold text-slate-500 cursor-pointer">
                            Có tổ chức vòng quay may mắn
                          </label>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-2">Mô tả</label>
                          <textarea
                            rows={4}
                            value={selectedEvent?.description || ""}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                            placeholder="Nhập mô tả chi tiết..."
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-2">Ghi chú quản lý</label>
                          <textarea
                            rows={2}
                            value={selectedEvent?.notes || ""}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, notes: e.target.value })}
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
    </motion.div>
  );
};

export default MyEvents;