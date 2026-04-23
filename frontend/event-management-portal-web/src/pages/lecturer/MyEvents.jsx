import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Eye, Edit2, Trash2, Send, Loader2, ChevronLeft, ChevronRight, Plus,
  Calendar, Clock, Users, PlayCircle, CheckCircle2, Download, AlertCircle, X,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import eventService from "../../services/eventService";
import notificationService from "../../services/notificationService";
import { exportEventsToExcel } from "../../utils/exportExcel";
import { useAuth } from "../../context/AuthContext";
import { EventCreator } from "../../components/event-planner/EventCreator";
import CreateEventModal from "../../components/event-planner/CreateEventModal";

/* ================= CONFIG ================= */
const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  PLAN_PENDING_APPROVAL: "Chờ duyệt kế hoạch",
  PLAN_APPROVED: "Đã duyệt kế hoạch",
  EVENT_PENDING_APPROVAL: "Chờ duyệt sự kiện",
  PUBLISHED: "Đã công bố",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
  REJECTED: "Bị từ chối",
};

const STATUS_COLOR = {
  PLAN_PENDING_APPROVAL: "bg-orange-100 text-orange-600",
  EVENT_PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-blue-100 text-blue-600",
  ONGOING: "bg-green-100 text-green-600",
  COMPLETED: "bg-indigo-100 text-indigo-600",
  CANCELLED: "bg-red-100 text-red-600",
  DRAFT: "bg-gray-100 text-gray-600",
  REJECTED: "bg-rose-100 text-rose-600",
};

/* ================= MAIN ================= */
const MyEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("Tất cả");

  const [page, setPage] = useState(1);
  const perPage = 8;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [creatorConfig, setCreatorConfig] = useState({ initialFormData: {}, fromPlan: false });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  /* ===== HELPERS ===== */
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  /* ===== FETCH ===== */
  const fetchMyEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getMyEvents();
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
      showToast("Lỗi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  /* ===== STATISTICS ===== */
  const stats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter(e => ["PUBLISHED", "EVENT_PENDING_APPROVAL", "PLAN_PENDING_APPROVAL"].includes(e.status)).length;
    const ongoing = events.filter(e => e.status === "ONGOING").length;
    const completed = events.filter(e => e.status === "COMPLETED").length;
    const totalRegistered = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);

    return { total, upcoming, ongoing, completed, totalRegistered };
  }, [events]);

  /* ===== FILTER ===== */
  const filteredEvents = useMemo(() => {
    return events
      .filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase())
      )
      .filter(e => {
        if (statusFilter !== "ALL") return e.status === statusFilter;

        if (activeTab === "Sắp tới") return ["PUBLISHED", "EVENT_PENDING_APPROVAL", "PLAN_PENDING_APPROVAL"].includes(e.status);
        if (activeTab === "Đang diễn ra") return e.status === "ONGOING";
        if (activeTab === "Hoàn thành") return e.status === "COMPLETED";
        if (activeTab === "Đã hủy") return e.status === "CANCELLED";
        if (activeTab === "Chờ duyệt") return ["PLAN_PENDING_APPROVAL", "EVENT_PENDING_APPROVAL"].includes(e.status);

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

  const handleSubmitForApproval = async (id, title) => {
    setSubmittingId(id);
    try {
      await eventService.submitPlanForApproval(id);
      await notificationService.sendNotification({
        userProfileId: user?.accountId,
        title: "Gửi phê duyệt thành công",
        message: `Sự kiện "${title}" đã được gửi tới Quản trị viên.`,
        type: "SYSTEM"
      });
      showToast("Đã gửi yêu cầu phê duyệt thành công");
      fetchMyEvents();
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
      showToast("Xóa sự kiện thành công");
      fetchMyEvents();
    } catch (error) {
      showToast("Lỗi khi xóa sự kiện", "error");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy sự kiện này?")) return;
    try {
      await eventService.cancelEvent(id);
      showToast("Hủy sự kiện thành công");
      fetchMyEvents();
    } catch (error) {
      showToast("Lỗi khi hủy sự kiện", "error");
    }
  };

  const handleEdit = (event) => {
    setCreatorConfig({
      initialFormData: event,
      fromPlan: event.status.includes("PLAN")
    });
    setShowEventCreator(true);
  };

  /* ===== MODAL HANDLERS ===== */
  const handleSelectPlan = (data) => {
    setCreatorConfig({
      initialFormData: data.initialFormData || {},
      fromPlan: data.fromPlan || false
    });
    setIsCreateModalOpen(false);
    setShowEventCreator(true);
  };

  const handleCreateNew = () => {
    setCreatorConfig({ initialFormData: {}, fromPlan: false });
    setIsCreateModalOpen(false);
    setShowEventCreator(true);
  };

  if (showEventCreator) {
    return <EventCreator onBack={() => { setShowEventCreator(false); fetchMyEvents(); }} initialData={creatorConfig.initialFormData} fromPlan={creatorConfig.fromPlan} />;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* TOAST */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}
          >
            {toast.type === "success" ? <CheckCircle2 className="text-emerald-500" size={24} /> : <AlertCircle className="text-rose-500" size={24} />}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{toast.message}</p>
            <X size={16} className="ml-4 cursor-pointer text-slate-400" onClick={() => setToast({ ...toast, show: false })} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">©</div>
          <h1 className="text-2xl font-semibold text-slate-800">Sự kiện của tôi</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus size={18} />
            Tạo sự kiện mới
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Download size={18} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS */}
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

      {/* TABS */}
      <div className="flex border-b mb-6 overflow-x-auto pb-1">
        {["Tất cả", "Sắp tới", "Đang diễn ra", "Hoàn thành", "Đã hủy", "Chờ duyệt"].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
          >
            {tab}
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
          {Object.keys(STATUS_LABELS).map(k => (
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
                <th className="p-4 text-left font-medium text-gray-600">Tên sự kiện</th>
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
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[e.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[e.status] || e.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/lecturer/events/${e.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>

                        {(e.status === "DRAFT" || e.status === "REJECTED") && (
                          <>
                            <button
                              onClick={() => handleEdit(e)}
                              className="p-2 hover:bg-amber-100 rounded-lg text-amber-600 transition-all"
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleSubmitForApproval(e.id, e.title)}
                              className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all"
                              title="Gửi phê duyệt"
                              disabled={submittingId === e.id}
                            >
                              {submittingId === e.id ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                            <button
                              onClick={() => handleDelete(e.id)}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}

                        {(e.status === "PUBLISHED" || e.status === "ONGOING") && (
                          <button
                            onClick={() => handleCancel(e.id)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                            title="Hủy sự kiện"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    Không tìm thấy sự kiện nào
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
        onClose={() => setIsCreateModalOpen(false)}
        onSelectPlan={handleSelectPlan}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
};

export default MyEvents;