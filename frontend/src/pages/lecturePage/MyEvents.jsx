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
} from "lucide-react";
import CreateEventModal from "../../components/events/CreateEventModal";
import { EventCreator } from "../../components/events/EventCreator";
import { getAllEvents } from "../../api/eventApi";
import { exportEventsToExcel } from "../../utils/exportExcel";

const STATUS_LABELS = {
  All: "Tất cả trạng thái",
  Draft: "Bản nháp",
  PendingApproval: "Chờ duyệt",
  Published: "Đã đăng",
  Ongoing: "Đang diễn ra",
  Completed: "Đã kết thúc",
  Cancelled: "Đã hủy",
};

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
      const response = await getAllEvents();
      setEvents(response.data || []);
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
    switch (status) {
      case "Published":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "Ongoing":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Draft":
        return "bg-slate-100 text-slate-500";
      case "PendingApproval":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "Completed":
        return "bg-purple-50 text-purple-600 border border-purple-100";
      case "Cancelled":
        return "bg-rose-50 text-rose-600 border border-rose-100";
      default:
        return "bg-slate-50 text-slate-500";
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
      const response = await fetch(
        `http://localhost:8080/api/events/${eventToDelete.id}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        setEvents(events.filter((e) => e.id !== eventToDelete.id));
        showToast("Xóa thành công!", "success");
      } else {
        showToast("Xóa thất bại!", "error");
      }
    } catch {
      showToast("Lỗi kết nối!", "error");
    } finally {
      closeDeleteModal();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/api/events/${selectedEvent.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedEvent),
        },
      );
      if (response.ok) {
        setEvents(
          events.map((ev) => (ev.id === selectedEvent.id ? selectedEvent : ev)),
        );
        closeModal();
        showToast("Cập nhật thành công!", "success");
      } else {
        showToast("Cập nhật thất bại!", "error");
      }
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
      await fetch(`http://localhost:8080/api/event-plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
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
              className="relative bg-white w-full max-w-3xl rounded-4xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
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
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {modalMode === "view"
                      ? "Thông tin chi tiết"
                      : "Cấu hình sự kiện"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleUpdate}
                className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar"
              >
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Globe size={14} /> Thông tin chung
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Tên sự kiện
                      </label>
                      <input
                        disabled={modalMode === "view"}
                        value={selectedEvent?.title || ""}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Chủ đề sự kiện (Topic)
                      </label>
                      <input
                        disabled={modalMode === "view"}
                        placeholder="Ví dụ: Công nghệ AI mới"
                        value={selectedEvent?.eventTopic || ""}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            eventTopic: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Chế độ
                      </label>
                      <select
                        disabled={modalMode === "view"}
                        value={selectedEvent?.eventMode || "OFFLINE"}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            eventMode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="OFFLINE">Offline (Trực tiếp)</option>
                        <option value="ONLINE">Online (Trực tuyến)</option>
                      </select>
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Địa điểm / Link cuộc họp
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          disabled={modalMode === "view"}
                          value={selectedEvent?.location || ""}
                          onChange={(e) =>
                            setSelectedEvent({
                              ...selectedEvent,
                              location: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck size={14} /> Đơn vị phụ trách
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Khoa
                      </label>
                      <input
                        disabled={modalMode === "view"}
                        value={selectedEvent?.faculty || ""}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            faculty: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Chuyên ngành
                      </label>
                      <input
                        disabled={modalMode === "view"}
                        value={selectedEvent?.major || ""}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            major: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock size={14} /> Thời gian & Quy mô
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Bắt đầu
                      </label>
                      <input
                        type="datetime-local"
                        disabled={modalMode === "view"}
                        value={
                          selectedEvent?.startTime
                            ? selectedEvent.startTime.slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Kết thúc
                      </label>
                      <input
                        type="datetime-local"
                        disabled={modalMode === "view"}
                        value={
                          selectedEvent?.endTime
                            ? selectedEvent.endTime.slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            endTime: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">
                        Hạn đăng ký
                      </label>
                      <input
                        type="datetime-local"
                        disabled={modalMode === "view"}
                        value={
                          selectedEvent?.registrationDeadline
                            ? selectedEvent.registrationDeadline.slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            registrationDeadline: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl text-sm font-bold text-rose-700 outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Giới hạn tham gia
                      </label>
                      <div className="relative">
                        <Users
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                          size={16}
                        />
                        <input
                          type="number"
                          disabled={modalMode === "view"}
                          value={selectedEvent?.maxParticipants || 0}
                          onChange={(e) =>
                            setSelectedEvent({
                              ...selectedEvent,
                              maxParticipants: parseInt(e.target.value),
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Trạng thái hiện tại
                      </label>
                      <select
                        disabled={modalMode === "view"}
                        value={selectedEvent?.status || ""}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            status: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none cursor-pointer ${getStatusStyle(selectedEvent?.status).split(" ")[1]}`}
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

                    <div className="flex items-end pb-3 ml-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          disabled={modalMode === "view"}
                          checked={selectedEvent?.hasLuckyDraw || false}
                          onChange={(e) =>
                            setSelectedEvent({
                              ...selectedEvent,
                              hasLuckyDraw: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-blue-600"
                        />
                        <span className="text-sm font-bold text-slate-600">
                          Bốc thăm may mắn
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info size={14} /> Nội dung & Ghi chú
                  </h3>
                  <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Mô tả sự kiện
                      </label>
                      <textarea
                        rows={4}
                        disabled={modalMode === "view"}
                        value={selectedEvent?.description || ""}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none resize-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Nhập mô tả chi tiết sự kiện..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Ghi chú quản lý
                      </label>
                      <textarea
                        rows={2}
                        disabled={modalMode === "view"}
                        value={selectedEvent?.notes || ""}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            notes: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none resize-none"
                        placeholder="Các lưu ý nội bộ..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white py-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all border border-slate-100"
                  >
                    Đóng
                  </button>
                  {modalMode === "edit" && (
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all text-sm uppercase tracking-wider"
                    >
                      Cập nhật thông tin
                    </button>
                  )}
                </div>
              </form>
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