import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Eye, Trash2, Calendar as CalendarIcon,
  MapPin, Tag, Download, Loader2, ChevronLeft, ChevronRight,
  Filter, ArrowsUpFromLine, X, CheckCircle2, AlertCircle,
  Users, Clock, Globe, ShieldCheck, Info, AlertTriangle,
  Hash, Award, MessageSquare, Building2, UserPlus,
  FileText, Mail, BookOpen, Image as ImageIcon, Send,
} from "lucide-react";
import CreateEventModal from "../../components/events/CreateEventModal";
import { EventCreator } from "../../components/events/EventCreator";
// SỬA: Import từ các file API tập trung
import { eventApi } from "../../api/eventApi";
import { notificationApi } from "../../api/notificationApi";
import { exportEventsToExcel } from "../../utils/exportExcel";

const STATUS_LABELS = {
  All: "Tất cả trạng thái",
  DRAFT: "Bản nháp",
  PLAN_PENDING_APPROVAL: "Chờ duyệt kế hoạch",
  PLAN_APPROVED: "Kế hoạch đã duyệt",
  EVENT_PENDING_APPROVAL: "Chờ duyệt sự kiện",
  PUBLISHED: "Đã đăng",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
  REJECTED: "Từ chối",
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

// --- HELPERS ---
const toDatetimeLocal = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ""; }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa cập nhật";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "Chưa cập nhật" : d.toLocaleDateString("vi-VN");
};

const getArrayDisplay = (arr) => (!arr || arr.length === 0 ? "Không có" : arr.join(", "));

const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// --- SUB-COMPONENTS ---
const Section = ({ title, icon: Icon, color = "blue", children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 bg-${color}-100 rounded-lg`}>
        <Icon size={16} className={`text-${color}-600`} />
      </div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
      <div className="flex-1 h-px bg-slate-200 ml-2" />
    </div>
    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">{children}</div>
  </div>
);

const InfoRow = ({ label, value, icon: Icon, color = "slate" }) => (
  <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
    <div className={`p-1.5 bg-${color}-50 rounded-lg mt-0.5`}>
      <Icon size={14} className={`text-${color}-600`} />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
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
  const [submittingId, setSubmittingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showEventCreator, setShowEventCreator] = useState(false);
  const prefillRef = useRef({});

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // 1. Fetch dữ liệu tích hợp (Events + Plans)
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      const accountId = user?.id || user?.accountId;

      if (accountId) {
        // Sử dụng Promise.all để gọi song song qua eventApi mới
        const [evRes, plRes] = await Promise.all([
          eventApi.events.getMyEvents(accountId),
          eventApi.plans.getMyPlans(accountId)
        ]);

        const combined = [...(evRes.data || []), ...(plRes.data || [])];
        // Loại bỏ trùng lặp ID
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        setEvents(unique);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showToast("Lỗi khi tải danh sách sự kiện", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  // 2. Gửi phê duyệt tích hợp Notification trung tâm
  const handleSubmitForApproval = async (eventId) => {
    setSubmittingId(eventId);
    try {
      const eventToSubmit = events.find((e) => e.id === eventId);
      if (eventToSubmit.status?.toUpperCase() !== "DRAFT") {
        showToast("Sự kiện này đã được gửi trước đó", "error");
        return;
      }

      await eventApi.events.submitApproval(eventId);

      // Gửi thông báo qua notificationApi mới (Clean payload)
      await notificationApi.create.send({
        userProfileId: getCurrentUser()?.accountId,
        title: "Gửi phê duyệt thành công",
        message: `Sự kiện "${eventToSubmit.title}" đã được gửi tới Quản trị viên.`,
        type: "SYSTEM"
      });

      showToast("Đã gửi yêu cầu phê duyệt thành công", "success");
      fetchEvents();
    } catch (error) {
      showToast("Gửi phê duyệt thất bại", "error");
    } finally {
      setSubmittingId(null);
      if (isModalOpen) setIsModalOpen(false);
    }
  };

  // 3. Logic Filter & Sort
  const processedEvents = useMemo(() => {
    let result = events.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "All" || e.status === statusFilter;
      return matchSearch && matchStatus;
    });

    result.sort((a, b) => {
      if (sortConfig === "newest") return new Date(b.startTime) - new Date(a.startTime);
      if (sortConfig === "oldest") return new Date(a.startTime) - new Date(b.startTime);
      if (sortConfig === "most-registered") return (b.registeredCount || 0) - (a.registeredCount || 0);
      return 0;
    });
    return result;
  }, [events, searchTerm, statusFilter, sortConfig]);

  const paginated = processedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleConfirmDelete = async () => {
    try {
      await eventApi.events.delete(eventToDelete.id);
      showToast("Xóa thành công!", "success");
      fetchEvents();
    } catch {
      showToast("Xóa thất bại!", "error");
    } finally { setIsDeleteModalOpen(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await eventApi.events.update(selectedEvent.id, selectedEvent);
      showToast("Cập nhật thành công!", "success");
      setIsModalOpen(false);
      fetchEvents();
    } catch { showToast("Cập nhật thất bại!", "error"); }
  };

  const openModal = (event, mode) => {
    setSelectedEvent({ ...event });
    setModalMode(mode);
    setIsModalOpen(true);
  };

  if (showEventCreator) {
    return (
      <EventCreator
        initialFormData={prefillRef.current}
        fromPlan={fromPlan}
        onBack={() => { setShowEventCreator(false); fetchEvents(); }}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative min-h-screen p-6 bg-slate-50/50 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}>
            {toast.type === "success" ? <CheckCircle2 className="text-emerald-500" size={24} /> : <AlertCircle className="text-rose-500" size={24} />}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{toast.message}</p>
            <X size={16} className="ml-4 cursor-pointer text-slate-400" onClick={() => setToast({ ...toast, show: false })} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Quản lý sự kiện</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Tìm thấy {processedEvents.length} bản ghi</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportAll} className="flex items-center gap-2 bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold border border-slate-200 transition-all hover:bg-slate-50 cursor-pointer">
            <Download size={18} /> Xuất Excel
          </button>
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 cursor-pointer">
            <Plus size={20} /> Tạo sự kiện mới
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Tìm kiếm theo tên hoặc địa điểm..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <select className="bg-slate-50 border-none text-sm font-bold text-slate-600 px-4 py-2.5 rounded-2xl outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="bg-slate-50 border-none text-sm font-bold text-slate-600 px-4 py-2.5 rounded-2xl outline-none cursor-pointer" value={sortConfig} onChange={(e) => setSortConfig(e.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="most-registered">Nhiều người đăng ký</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center"><Loader2 className="animate-spin inline-block text-blue-600" size={40} /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Tên sự kiện</th>
                  <th className="px-6 py-4">Thời gian & Địa điểm</th>
                  <th className="px-6 py-4">Đăng ký</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-700 block mb-0.5">{e.title}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{e.type || 'SỰ KIỆN'}</span>
                    </td>
                    <td className="px-6 py-5 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><MapPin size={14} className="text-rose-500" /> {e.location}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400"><Clock size={13} /> {formatDate(e.startTime)}</div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700 text-sm">{e.registeredCount || 0} / {e.maxParticipants}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${getStatusStyle(e.status)}`}>
                        {STATUS_LABELS[e.status] || e.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => openModal(e, "view")} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"><Eye size={18} /></button>
                        <button onClick={() => openModal(e, "edit")} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"><Edit2 size={18} /></button>
                        {(e.status === "DRAFT") && (
                          <button onClick={() => handleSubmitForApproval(e.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer">
                            <Send size={18} />
                          </button>
                        )}
                        <button onClick={() => openDeleteModal(e)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Create Modal Component Integration */}
      <CreateEventModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSelectPlan={handleSelectPlan} onCreateNew={handleCreateNew} />

      {/* Pagination & Modals (View/Edit/Delete) - Các phần này giữ nguyên logic UI của bạn */}
    </motion.div>
  );
};

export default MyEvents;