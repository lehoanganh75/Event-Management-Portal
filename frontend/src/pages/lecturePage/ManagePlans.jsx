import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Download,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EventPlanner } from "./EventPlanner";
import { getAllPlans, deletePlan, updatePlan } from "../../api/eventApi";

const STATUS_LABELS = {
  upcoming: "Sắp diễn ra",
  ongoing: "Đang diễn ra",
  completed: "Đã kết thúc",
  draft: "Bản nháp",
  cancelled: "Đã hủy",
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
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getAllPlans();
      setPlans(response.data);
    } catch {
      showToast("Không thể tải danh sách kế hoạch", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

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
    try {
      const response = await updatePlan(selectedPlan.id, selectedPlan);
      if (response.ok || response.status === 200) {
        setPlans(
          plans.map((p) => (p.id === selectedPlan.id ? selectedPlan : p)),
        );
        closeModal();
        showToast("Cập nhật kế hoạch thành công", "success");
      }
    } catch {
      showToast("Lỗi khi cập nhật dữ liệu", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      await deletePlan(planToDelete.id);
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
            <p
              className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}
            >
              {toast.message}
            </p>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="ml-4 text-slate-400"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Quản lý kế hoạch
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Lập lịch và theo dõi tiến độ các kế hoạch sự kiện.
          </p>
        </div>
        <button
          onClick={() => setViewMode("CREATE")}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg"
        >
          <Plus size={18} /> Tạo kế hoạch mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
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
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {p.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {p.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {p.eventDate}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${p.status === "upcoming" ? "bg-blue-100 text-blue-700" : p.status === "draft" ? "bg-slate-100 text-slate-500" : "bg-slate-100 text-slate-700"}`}
                      >
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openModal(p, "view")}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openModal(p, "edit")}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setPlanToDelete(p);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 tracking-tighter uppercase">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all shadow-sm ${
                      currentPage === pageNumber
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                        : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">
                Xác nhận xóa?
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                Bạn có chắc muốn xóa{" "}
                <span className="font-bold">"{planToDelete?.title}"</span>? Hành
                động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all uppercase text-xs tracking-wider"
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
          <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
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
                      ? "Thông tin kế hoạch"
                      : "Cấu hình kế hoạch"}
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
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={14} /> Thông tin chung
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-3xl">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tên kế hoạch
                      </label>
                      <input
                        disabled={modalMode === "view"}
                        value={selectedPlan?.title || ""}
                        onChange={(e) =>
                          setSelectedPlan({
                            ...selectedPlan,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Đơn vị tổ chức
                      </label>
                      <input
                        disabled={modalMode === "view"}
                        value={selectedPlan?.organizationId || ""}
                        onChange={(e) =>
                          setSelectedPlan({
                            ...selectedPlan,
                            organizationId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Hình thức
                      </label>
                      <select
                        disabled={modalMode === "view"}
                        value={selectedPlan?.eventMode || "Offline"}
                        onChange={(e) =>
                          setSelectedPlan({
                            ...selectedPlan,
                            eventMode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                      >
                        <option value="Offline">Offline</option>
                        <option value="Online">Online</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Địa điểm
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                          size={16}
                        />
                        <input
                          disabled={modalMode === "view"}
                          value={selectedPlan?.location || ""}
                          onChange={(e) =>
                            setSelectedPlan({
                              ...selectedPlan,
                              location: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Trạng thái
                      </label>
                      <select
                        disabled
                        value={selectedPlan?.status || ""}
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-not-allowed"
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} /> Thời gian & Quy mô
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-3xl">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Bắt đầu
                      </label>
                      <input
                        type="datetime-local"
                        disabled={modalMode === "view"}
                        value={
                          toDatetimeLocal(selectedPlan?.startTime)
                        }
                        onChange={(e) =>
                          setSelectedPlan({
                            ...selectedPlan,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Kết thúc
                      </label>
                      <input
                        type="datetime-local"
                        disabled={modalMode === "view"}
                        value={
                          toDatetimeLocal(selectedPlan?.endTime)
                        }
                        onChange={(e) =>
                          setSelectedPlan({
                            ...selectedPlan,
                            endTime: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                        Hạn đăng ký
                      </label>
                      <input
                        type="datetime-local"
                        disabled={modalMode === "view"}
                        value={
                          toDatetimeLocal(selectedPlan?.registrationDeadline)
                        }
                        onChange={(e) =>
                          setSelectedPlan({
                            ...selectedPlan,
                            registrationDeadline: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm font-bold text-rose-700 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Số lượng tối đa
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          disabled={modalMode === "view"}
                          value={selectedPlan?.maxParticipants || 0}
                          onChange={(e) =>
                            setSelectedPlan({
                              ...selectedPlan,
                              maxParticipants: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">
                          ĐÃ ĐĂNG KÝ: {selectedPlan?.registeredCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> Mô tả chi tiết
                  </h3>
                  <div className="bg-slate-50 p-5 rounded-3xl">
                    <textarea
                      rows={4}
                      disabled={modalMode === "view"}
                      value={selectedPlan?.description || ""}
                      onChange={(e) =>
                        setSelectedPlan({
                          ...selectedPlan,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none resize-none"
                      placeholder="Mô tả kế hoạch..."
                    />
                  </div>
                </div>

                {modalMode === "view" && (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-2 pt-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-tighter">
                      Tạo:{" "}
                      {selectedPlan?.createdAt
                        ? new Date(selectedPlan.createdAt).toLocaleString(
                            "vi-VN",
                          )
                        : "---"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-tighter">
                      Cập nhật:{" "}
                      {selectedPlan?.updatedAt
                        ? new Date(selectedPlan.updatedAt).toLocaleString(
                            "vi-VN",
                          )
                        : "---"}
                    </p>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Đóng
                  </button>
                  {modalMode === "edit" && (
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <Save size={18} /> Cập nhật ngay
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagePlans;