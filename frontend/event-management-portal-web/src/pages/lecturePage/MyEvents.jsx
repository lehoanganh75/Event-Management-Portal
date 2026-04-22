import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { useAuth } from "../../context/AuthContext";

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
  CONVERTED: "Đã chuyển đổi",
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
  const { user } = useAuth();
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

  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await eventApi.events.delete(deleteId);
      fetchEvents();
      setDeleteId(null);
      showToast("Xóa sự kiện thành công");
    } catch (error) {
      showToast("Lỗi khi xóa sự kiện", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // 1. Fetch dữ liệu tích hợp (Events + Plans)
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) return;

      const accountId = user.id || user.accountId || user.account?.id;
      const isAdmin = user.roles?.some(r => ["ADMIN", "SUPER_ADMIN"].includes(r.toUpperCase())) || 
                      user.account?.roles?.some(r => ["ADMIN", "SUPER_ADMIN"].includes(r.toUpperCase()));

      console.log("🛠️ Current User (from Auth):", user);
      console.log("🛡️ My Account ID:", accountId);

      // Luôn chỉ lấy sự kiện của tôi trong trang "My Events"
      const evRes = await eventApi.events.getMyEvents();
      
      console.log("📦 My Events Response:", evRes.data);
        
      // Đảm bảo ánh xạ dữ liệu ngày tạo nếu Backend trả về trường khác
      const mappedEvents = (evRes.data || []).map(e => ({
          ...e,
          createdAt: e.createdAt || e.createAt || e.createdDate
      }));
      
      // Chỉ lấy các trạng thái liên quan đến sự kiện thực tế (loại bỏ kế hoạch và bản nháp theo yêu cầu)
      const eventStatuses = [
        "EVENT_PENDING_APPROVAL", 
        "PUBLISHED", 
        "ONGOING", 
        "COMPLETED", 
        "CANCELLED",
        "REJECTED"
      ];
      
      const eventList = mappedEvents.filter(e => {
          const s = e.status?.toUpperCase();
          return eventStatuses.includes(s);
      });
      
      setEvents(eventList);

    } catch (error) {
      console.error("Fetch error:", error);
      showToast("Lỗi khi tải danh sách sự kiện", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, fetchEvents]);

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
      const title = e?.title || "";
      const location = e?.location || "";
      const eventTopic = e?.eventTopic || "";
      
      const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          eventTopic.toLowerCase().includes(searchTerm.toLowerCase());
                          
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
      const s = eventToDelete.status?.toUpperCase();
      if (s === "PUBLISHED" || s === "ONGOING") {
        await eventApi.events.cancel(eventToDelete.id);
        showToast("Hủy sự kiện thành công!", "success");
      } else {
        await eventApi.events.delete(eventToDelete.id);
        showToast("Xóa thành công!", "success");
      }
      fetchEvents();
    } catch {
      showToast("Thao tác thất bại!", "error");
    } finally { setIsDeleteModalOpen(false); setEventToDelete(null); }
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

  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleExportAll = () => {
    if (processedEvents.length === 0) {
      showToast("Không có dữ liệu để xuất", "error");
      return;
    }
    exportEventsToExcel(processedEvents);
  };

  const getStatusStyle = (status) => {
    const s = status?.toUpperCase() || "";
    if (s === "PUBLISHED" || s === "ONGOING") return "border-blue-200 text-blue-700 bg-blue-50";
    if (s === "COMPLETED" || s === "PLAN_APPROVED") return "border-emerald-200 text-emerald-700 bg-emerald-50";
    if (s === "CANCELLED" || s === "REJECTED") return "border-rose-200 text-rose-700 bg-rose-50";
    if (s === "DRAFT") return "border-slate-200 text-slate-700 bg-slate-50";
    if (s === "EVENT_PENDING_APPROVAL" || s === "PLAN_PENDING_APPROVAL" || s === "PENDING_APPROVAL") return "border-amber-200 text-amber-700 bg-amber-50";
    if (s === "CONVERTED") return "border-indigo-200 text-indigo-700 bg-indigo-50";
    return "border-slate-200 text-slate-700 bg-slate-50";
  };

  const [creatorConfig, setCreatorConfig] = useState({ 
    initialFormData: {}, 
    fromPlan: false 
  });

  const handleSelectPlan = (data) => {
    setCreatorConfig({
      initialFormData: data.initialFormData || {},
      fromPlan: data.fromPlan || false
    });
    setIsCreateOpen(false);
    setShowEventCreator(true);
  };

  const handleCreateNew = () => {
    setCreatorConfig({
      initialFormData: {},
      fromPlan: false
    });
    setIsCreateOpen(false);
    setShowEventCreator(true);
  };

  if (showEventCreator) {
    return (
      <EventCreator
        initialFormData={creatorConfig.initialFormData}
        fromPlan={creatorConfig.fromPlan}
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
                  <th className="px-6 py-4">Ngày tạo</th>
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
                    <td className="px-6 py-5 text-[11px] font-bold text-slate-500">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => openModal(e, "view")} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="Xem chi tiết"><Eye size={18} /></button>
                        
                        {/* Chỉ cho sửa nếu là Draft hoặc Rejected hoặc Published */}
                        {(e.status === "DRAFT" || e.status === "REJECTED" || e.status === "PUBLISHED" || e.status === "PLAN_APPROVED") && (
                          <button onClick={() => openModal(e, "edit")} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer" title="Chỉnh sửa"><Edit2 size={18} /></button>
                        )}

                        {/* Nếu là Published/Ongoing thì cho Hủy, nếu là Draft/Rejected thì cho Xóa */}
                        {(e.status === "PUBLISHED" || e.status === "ONGOING") ? (
                          <button onClick={() => openDeleteModal(e)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer" title="Hủy sự kiện"><AlertTriangle size={18} /></button>
                        ) : (e.status === "DRAFT" || e.status === "REJECTED" || e.status === "PLAN_APPROVED") && (
                          <button onClick={() => setDeleteId(e.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer" title="Xóa"><Trash2 size={18} /></button>
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
      
      {/* Create Modal Component Integration */}
      <CreateEventModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSelectPlan={handleSelectPlan} onCreateNew={handleCreateNew} />

      {/* Delete/Cancel Confirmation Modal */}
      {(deleteId || eventToDelete) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 text-sans">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100">
            <div className={`w-16 h-16 ${deleteId ? "bg-rose-50" : "bg-amber-50"} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              {deleteId ? <Trash2 className="text-rose-500" size={32} /> : <AlertTriangle className="text-amber-500" size={32} />}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 font-sans uppercase">
              {deleteId ? "Xác nhận xóa" : "Xác nhận hủy"}
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              {deleteId 
                ? "Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này không thể hoàn tác."
                : "Bạn có chắc chắn muốn hủy sự kiện này không? Trạng thái sẽ chuyển thành Đã hủy."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => { setDeleteId(null); setEventToDelete(null); }}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-100 uppercase text-xs"
              >
                Không, quay lại
              </button>
              <button 
                onClick={deleteId ? confirmDelete : handleConfirmDelete}
                className={`flex-1 px-6 py-3 rounded-xl font-bold text-white ${deleteId ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" : "bg-amber-500 hover:bg-amber-600 shadow-amber-200"} shadow-lg transition-all uppercase text-xs`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    {modalMode === "edit" ? <Edit2 size={18} /> : <Eye size={18} />}
                  </div>
                  <h2 className="text-lg font-black text-slate-800">
                    {modalMode === "edit" ? "Chỉnh sửa sự kiện" : "Chi tiết sự kiện"}
                  </h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-7 space-y-6">
                {modalMode === "edit" ? (
                  <form id="edit-event-form" onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Tiêu đề sự kiện</label>
                      <input 
                        type="text" 
                        value={selectedEvent.title || ""} 
                        onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Địa điểm</label>
                        <input 
                          type="text" 
                          value={selectedEvent.location || ""} 
                          onChange={(e) => setSelectedEvent({...selectedEvent, location: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Số lượng tối đa</label>
                        <input 
                          type="number" 
                          value={selectedEvent.maxParticipants || 0} 
                          onChange={(e) => setSelectedEvent({...selectedEvent, maxParticipants: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Mô tả sự kiện</label>
                        <textarea 
                          rows={4}
                          value={selectedEvent.description || ""} 
                          onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700 resize-none" 
                        />
                      </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                      <h3 className="text-xl font-black text-blue-900 mb-2">{selectedEvent.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge color="blue">{selectedEvent.type || "SỰ KIỆN"}</Badge>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(selectedEvent.status)}`}>
                          {STATUS_LABELS[selectedEvent.status] || selectedEvent.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Section title="Thông tin cơ bản" icon={Info} color="blue">
                        <InfoRow label="Người tạo" value={selectedEvent.createdByName || user?.name} icon={UserPlus} />
                        <InfoRow label="Địa điểm" value={selectedEvent.location} icon={MapPin} color="rose" />
                        <InfoRow label="Thời gian" value={formatDate(selectedEvent.startTime)} icon={CalendarIcon} color="amber" />
                        <InfoRow label="Quy mô" value={`${selectedEvent.registeredCount || 0} / ${selectedEvent.maxParticipants} người`} icon={Users} color="indigo" />
                      </Section>

                      <Section title="Trạng thái & Ngày tạo" icon={Clock} color="slate">
                        <InfoRow label="Trạng thái" value={STATUS_LABELS[selectedEvent.status] || selectedEvent.status} icon={ShieldCheck} />
                        <InfoRow label="Ngày tạo" value={formatDate(selectedEvent.createdAt)} icon={CalendarIcon} />
                        <InfoRow label="Người duyệt" value={selectedEvent.approvedByName || "—"} icon={CheckCircle2} />
                      </Section>
                    </div>

                    {selectedEvent.description && (
                      <Section title="Mô tả & Mục đích" icon={FileText} color="purple">
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                      </Section>
                    )}
                  </div>
                )}
              </div>

              <div className="px-7 py-5 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                {modalMode === "edit" ? (
                  <>
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all cursor-pointer">Hủy</button>
                    <button type="submit" form="edit-event-form" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-200">Lưu thay đổi</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200 bg-white">Đóng</button>
                    {(selectedEvent.status === "DRAFT" || selectedEvent.status === "REJECTED") && (
                       <button onClick={() => handleSubmitForApproval(selectedEvent.id)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                          {submittingId === selectedEvent.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          Gửi phê duyệt
                       </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyEvents;