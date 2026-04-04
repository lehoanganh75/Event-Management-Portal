import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Search, Edit2, Eye, Trash2, Calendar as CalendarIcon,
  MapPin, Tag, Loader2, ChevronLeft, ChevronRight,
  Filter, X, CheckCircle, XCircle, Users, Clock, Globe,
  ShieldCheck, Info, AlertTriangle, Hash, Award,
  MessageSquare, Building2, UserPlus, FileText, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// 1. IMPORT CONTEXT THAY VÌ API
import { useEvent } from "../../context/EventContext";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

import CreateEventModal from "../events/CreateEventModal";
import { EventCreator } from "../events/EventCreator";

const STATUS_LABELS = {
  All: "Tất cả trạng thái",
  EVENT_PENDING_APPROVAL: "Chờ duyệt sự kiện",
  PLAN_PENDING_APPROVAL: "Chờ duyệt kế hoạch",
  PLAN_APPROVED: "Kế hoạch đã duyệt",
  PUBLISHED: "Đã đăng",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Từ chối",
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

// Lấy thông tin user sạch từ localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// --- SUB-COMPONENTS UI ---
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

const EventPage = () => {
  const navigate = useNavigate();

  // 1. LẤY DATA & SERVICE TỪ CONTEXT
  const { user } = useAuth();
  const { 
    events: eventService, // service gốc chứa getAllEvents
    approvePlan, 
    rejectPlan,
    fetchEventDetail,
    loading: eventLoading 
  } = useEvent();
  
  const { service: notificationService } = useNotification();

  // State local
  const [dataEvents, setDataEvents] = useState([]); // Đổi tên để tránh trùng với service
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [creatorFilter, setCreatorFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [showEventCreator, setShowEventCreator] = useState(false);

  const [modalMode, setModalMode] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // 2. FETCH EVENTS TỪ HÀM getAllEvents NHƯ BẠN YÊU CẦU
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Gọi đúng hàm lấy tất cả sự kiện (dành cho Admin)
      const res = await eventService.getAllEvents();
      const validEvents = (res.data || []).filter(e => e.status?.toUpperCase() !== "DRAFT");
      setDataEvents(validEvents);
    } catch (error) {
      showToast("Lỗi khi tải danh sách sự kiện", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user) fetchEvents(); 
  }, [user]);

  // 3. LOGIC PHÊ DUYỆT / TỪ CHỐI
  const handleApprovePlanAction = async (id) => {
    try {
      setLoading(true);
      await approvePlan(id); // Dùng hàm từ Context
      showToast("Đã phê duyệt kế hoạch thành công", "success");
      fetchEvents();
    } catch (err) {
      showToast("Lỗi khi phê duyệt kế hoạch", "error");
    } finally { setLoading(false); }
  };

  const handleRejectPlanAction = async (id) => {
    const reason = prompt("Nhập lý do từ chối kế hoạch:");
    if (reason === null) return;
    try {
      setLoading(true);
      await rejectPlan(id, reason); // Dùng hàm từ Context
      showToast("Đã từ chối kế hoạch", "success");
      fetchEvents();
    } catch (err) {
      showToast("Lỗi thao tác", "error");
    } finally { setLoading(false); }
  };

  const handleApproveEventAction = async (id) => {
    try {
      setLoading(true);
      // Gọi thông qua service gốc vì context thường chỉ bọc các hàm chung
      await eventService.approveEvent(id); 
      showToast("Đã phê duyệt đăng tải sự kiện", "success");
      fetchEvents();
    } catch (err) {
      showToast("Lỗi phê duyệt sự kiện", "error");
    } finally { setLoading(false); }
  };

  // 4. LOGIC FILTER & PHÂN TRANG (Dùng dataEvents thay vì events)
  const uniqueCreators = useMemo(() => {
    const creators = dataEvents.map((e) => e.createdByName).filter(Boolean);
    return [...new Set(creators)].sort();
  }, [dataEvents]);

  const processedEvents = useMemo(() => {
    return dataEvents.filter((e) => {
      const matchesSearch = e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            e.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || e.status === statusFilter;
      const matchesCreator = creatorFilter === "All" || e.createdByName === creatorFilter;
      return matchesSearch && matchesStatus && matchesCreator;
    }).sort((a, b) => new Date(b.createdAt || b.startTime) - new Date(a.createdAt || a.startTime));
  }, [dataEvents, searchTerm, statusFilter, creatorFilter]);

  const currentItems = processedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(processedEvents.length / itemsPerPage);

  const handleConfirmDelete = async () => {
    try {
      await eventService.deleteEvent(eventToDelete.id);
      showToast("Xóa sự kiện thành công!", "success");
      fetchEvents();
    } catch (err) {
      showToast("Lỗi khi xóa sự kiện!", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    }
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

  const handleSelectPlan = (plan) => {
    setIsCreateOpen(false);
    navigate(`/lecturer/create-event?planId=${plan.id}`);
  };

  const handleCreateNew = () => {
    setIsCreateOpen(false);
    navigate("/lecturer/create-event");
  };

  const openModal = async (event, mode) => {
    setLoading(true); 
    try {
      // 1. Gọi hàm fetchEventDetail từ Context (useEvent)
      const detailData = await fetchEventDetail(event.id);
      
      // 2. Log thông tin ra console để kiểm tra
      console.log("=== EVENT DETAIL DATA ===");
      console.log("ID:", event.id);
      console.log("Full Object:", detailData);
      
      // Nếu dữ liệu trả về nằm trong detailData.data (tùy cấu trúc axios của bạn)
      const finalData = detailData?.data || detailData;

      // 3. Cập nhật vào state để Modal hiển thị
      setSelectedEvent(finalData); 
      setModalMode(mode);
      setIsModalOpen(true);
      
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sự kiện:", error);
      showToast("Không thể tải thông tin chi tiết!", "error");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedEvent(null); };

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
    <div className="space-y-6 bg-slate-50/50 min-h-screen p-6 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}>
            {toast.type === "success" ? <CheckCircle className="text-emerald-500" size={24} /> : <XCircle className="text-rose-500" size={24} />}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{toast.message}</p>
            <X size={16} className="ml-4 cursor-pointer text-slate-400" onClick={() => setToast({ ...toast, show: false })} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Quản lý tất cả sự kiện</h2>
          <p className="text-slate-500 text-sm font-medium">Hệ thống có {processedEvents.length} sự kiện</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 cursor-pointer">
          <Plus size={20} /> Tạo sự kiện mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Tìm kiếm sự kiện..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 px-4 py-2 rounded-xl outline-none cursor-pointer">
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={creatorFilter} onChange={(e) => setCreatorFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 px-4 py-2 rounded-xl outline-none cursor-pointer">
            <option value="All">Tất cả người tạo</option>
            {uniqueCreators.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center"><Loader2 className="animate-spin inline-block text-blue-600" size={40} /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Sự kiện</th>
                  <th className="px-6 py-4">Thời gian & Địa điểm</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800 block mb-1">{e.title}</span>
                      <Badge color="slate">{e.type || "Sự kiện"}</Badge>
                    </td>
                    <td className="px-6 py-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><MapPin size={14} className="text-rose-500" /> {e.location}</div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400"><Clock size={14} /> {formatDate(e.startTime)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        e.status?.toUpperCase() === 'PUBLISHED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        e.status?.toUpperCase().includes('PENDING') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {STATUS_LABELS[e.status] || e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        {e.status?.toUpperCase().includes("PENDING") && (
                          <>
                            <button onClick={() => e.status?.includes("PLAN") ? handleApprovePlan(e.id) : handleApproveEvent(e.id)} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors"><CheckCircle size={18} /></button>
                            <button onClick={() => e.status?.includes("PLAN") ? handleRejectPlan(e.id) : null} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"><XCircle size={18} /></button>
                          </>
                        )}
                        <button onClick={() => openModal(e, "view")} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"><Eye size={18} /></button>
                        <button onClick={() => { setEventToDelete(e); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 cursor-pointer"><ChevronLeft size={18} /></button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" : "bg-white border border-slate-200 text-slate-400 hover:border-blue-600 hover:text-blue-600 cursor-pointer"}`}>{i + 1}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 cursor-pointer"><ChevronRight size={18} /></button>
        </div>
      )}

      {/* Modals & Child Components */}
      <CreateEventModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSelectPlan={handleSelectPlan} onCreateNew={handleCreateNew} />
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-white">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-inner"><AlertTriangle size={32} /></div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Xác nhận xóa?</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">Sự kiện "{eventToDelete?.title}" sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-xl cursor-pointer">Hủy</button>
                <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-rose-200 cursor-pointer">XÓA NGAY</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Detail Modal Integration... */}
      <AnimatePresence>
  {isModalOpen && selectedEvent && (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border-4 border-white"
      >
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Info size={20} /></div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic">Chi tiết sự kiện</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {selectedEvent.id}</p>
            </div>
          </div>
          <X onClick={closeModal} size={24} className="text-slate-300 hover:text-slate-600 cursor-pointer transition-colors" />
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          
          {/* Cover Image & Quick Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               {selectedEvent.coverImage ? (
                  <img 
                    src={selectedEvent.coverImage} 
                    alt="Cover" 
                    className="w-full h-64 object-cover rounded-[2rem] shadow-inner border border-slate-100"
                  />
               ) : (
                  <div className="w-full h-64 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 italic">
                    Không có ảnh bìa
                  </div>
               )}
            </div>
            <div className="space-y-4">
               <Section title="Trạng thái & Loại" icon={Tag} color="purple">
                  <div className="flex flex-col gap-3">
                    <Badge color={selectedEvent.status?.includes('PENDING') ? 'amber' : 'blue'}>
                      {STATUS_LABELS[selectedEvent.status] || selectedEvent.status}
                    </Badge>
                    <Badge color="indigo">
                      {EVENT_TYPE_LABELS[selectedEvent.type] || selectedEvent.type}
                    </Badge>
                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-white rounded-xl border border-slate-100">
                      <Globe size={14} className="text-blue-500" />
                      <span className="text-xs font-bold text-slate-600">{selectedEvent.eventMode}</span>
                    </div>
                  </div>
               </Section>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thông tin cơ bản */}
            <Section title="Thông tin cơ bản" icon={FileText} color="blue">
              <div className="space-y-1">
                <InfoRow label="Tiêu đề sự kiện" value={selectedEvent.title} icon={FileText} color="blue" />
                <InfoRow label="Chủ đề" value={selectedEvent.eventTopic} icon={Hash} color="cyan" />
                <InfoRow label="Đơn vị tổ chức" value={selectedEvent.organizerUnit || "Khoa/Đơn vị đào tạo"} icon={Building2} color="amber" />
                <InfoRow label="Người tạo" value={selectedEvent.createdByAccountId} icon={UserPlus} color="slate" />
              </div>
            </Section>

            {/* Thời gian & Địa điểm */}
            <Section title="Thời gian & Địa điểm" icon={CalendarIcon} color="rose">
              <div className="space-y-1">
                <InfoRow label="Địa điểm" value={selectedEvent.location} icon={MapPin} color="rose" />
                <InfoRow label="Bắt đầu" value={new Date(selectedEvent.startTime).toLocaleString('vi-VN')} icon={Clock} color="emerald" />
                <InfoRow label="Kết thúc" value={new Date(selectedEvent.endTime).toLocaleString('vi-VN')} icon={Clock} color="rose" />
                <InfoRow label="Hạn đăng ký" value={formatDate(selectedEvent.registrationDeadline)} icon={CalendarIcon} color="orange" />
              </div>
            </Section>
          </div>

          {/* Nội dung chi tiết */}
          <Section title="Mô tả kế hoạch" icon={Info} color="emerald">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Giới thiệu ngắn</p>
                <p className="text-sm text-slate-600 leading-relaxed italic bg-white p-4 rounded-2xl border border-slate-100">
                  "{selectedEvent.description || "Không có mô tả"}"
                </p>
              </div>
              {selectedEvent.notes && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ghi chú kế hoạch</p>
                  <div className="text-sm text-slate-800 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    {selectedEvent.notes}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Thông số hậu cần */}
          <Section title="Hậu cần & Quy mô" icon={Users} color="indigo">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Số lượng tối đa</p>
                <p className="text-xl font-black text-indigo-600">{selectedEvent.maxParticipants} <span className="text-xs text-slate-400 font-bold">người</span></p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Đã đăng ký</p>
                <p className="text-xl font-black text-emerald-600">{selectedEvent.registeredCount || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Duyệt bởi</p>
                <p className="text-sm font-black text-slate-700">{selectedEvent.approvedByAccountId || "Chưa duyệt"}</p>
              </div>
            </div>
          </Section>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-50 flex justify-end gap-3 bg-slate-50/30">
          <button 
            onClick={closeModal} 
            className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            Đóng cửa sổ
          </button>
          
          {selectedEvent.status?.includes('PENDING') && (
            <button 
              onClick={() => { /* Logic duyệt nhanh nếu cần */ }}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all cursor-pointer"
            >
              Phê duyệt ngay
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </div>
  );
};

export default EventPage;