import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
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
  Users,
  FileText,
  Tag,
  Building2,
  Mail,
  UserPlus,
  BookOpen,
  Hash,
  Image as ImageIcon,
  Award,
  CheckSquare,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EventPlanner } from "./EventPlanner";
import { getAllPlans, deletePlan, updatePlan } from "../../api/eventApi";

const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  PUBLISHED: "Đã xuất bản",
  CANCELLED: "Đã hủy",
  COMPLETED: "Đã kết thúc",
  upcoming: "Sắp diễn ra",
  ongoing: "Đang diễn ra",
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

const ORGANIZATION_DISPLAY_NAMES = {
  "org-it": "Khoa Công nghệ Thông tin",
  "org-ktkt": "Khoa Kế toán - Kiểm toán",
  "org-qtkd": "Khoa Quản trị Kinh doanh",
  "org-ctst": "Phòng Đào tạo",
  "org-ctsv": "Phòng Công tác Sinh viên",
};

const EVENT_MODE_LABELS = {
  OFFLINE: "Trực tiếp",
  ONLINE: "Trực tuyến",
  HYBRID: "Kết hợp",
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

    if (format === "short") {
      return `${day}/${month}/${year}`;
    }
    if (format === "time") {
      return `${hour}:${min}`;
    }
    return `${hour}:${min} - ${day}/${month}/${year}`;
  } catch {
    return "Chưa cập nhật";
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
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
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

  const formatID = (id) => {
    if (!id) return "";
    return `#${id.substring(0, 8).toUpperCase()}`;
  };

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase?.() || "";
    const colors = {
      DRAFT: "slate",
      PENDING_APPROVAL: "amber",
      APPROVED: "emerald",
      REJECTED: "rose",
      PUBLISHED: "blue",
      CANCELLED: "red",
      COMPLETED: "green",
    };
    return colors[statusUpper] || "slate";
  };

  const getArrayDisplay = (arr) => {
    if (!arr || arr.length === 0) return "Không có";
    return arr.join(", ");
  };

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
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
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
                      {formatID(p.id)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {p.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {p.eventDate || formatDate(p.startTime, "short")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge color={getStatusColor(p.status)}>
                        {STATUS_LABELS[p.status] ||
                          STATUS_LABELS[p.status?.toUpperCase?.()] ||
                          p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openModal(p, "view")}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openModal(p, "edit")}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setPlanToDelete(p);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Xóa"
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
        {isModalOpen && selectedPlan && (
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
              className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      modalMode === "view"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
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
                        ? "Thông tin chi tiết kế hoạch"
                        : "Chỉnh sửa kế hoạch"}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {formatID(selectedPlan.id)}
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
                  <Section
                    title="Thông tin cơ bản"
                    icon={FileText}
                    color="blue"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoRow
                        label="ID"
                        value={formatID(selectedPlan.id)}
                        icon={Hash}
                        color="slate"
                      />
                      <InfoRow
                        label="Tên kế hoạch"
                        value={selectedPlan.title}
                        icon={FileText}
                        color="blue"
                      />
                      <InfoRow
                        label="Loại sự kiện"
                        value={
                          EVENT_TYPE_LABELS[selectedPlan.type] ||
                          selectedPlan.type
                        }
                        icon={Tag}
                        color="purple"
                      />
                      <InfoRow
                        label="Chủ đề"
                        value={selectedPlan.eventTopic || "Không có"}
                        icon={BookOpen}
                        color="emerald"
                      />
                      <InfoRow
                        label="Đơn vị tổ chức"
                        value={
                          selectedPlan.major
                            ? `${selectedPlan.faculty} – ${selectedPlan.major}`
                            : selectedPlan.faculty || "Chưa xác định"
                        }
                        icon={Building2}
                        color="amber"
                      />
                      <InfoRow
                        label="Hình thức"
                        value={
                          EVENT_MODE_LABELS[selectedPlan.eventMode] ||
                          selectedPlan.eventMode
                        }
                        icon={Globe}
                        color="cyan"
                      />
                      <InfoRow
                        label="Trạng thái"
                        value={
                          <Badge color={getStatusColor(selectedPlan.status)}>
                            {STATUS_LABELS[
                              selectedPlan.status?.toUpperCase?.()
                            ] || selectedPlan.status}
                          </Badge>
                        }
                        icon={ShieldCheck}
                        color="slate"
                      />
                      <InfoRow
                        label="Ảnh bìa"
                        value={selectedPlan.coverImage || "Không có"}
                        icon={ImageIcon}
                        color="pink"
                      />
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
                        value={formatDate(selectedPlan.startTime)}
                        icon={CalendarIcon}
                        color="rose"
                      />
                      <InfoRow
                        label="Thời gian kết thúc"
                        value={formatDate(selectedPlan.endTime)}
                        icon={CalendarIcon}
                        color="rose"
                      />
                      <InfoRow
                        label="Hạn đăng ký"
                        value={formatDate(selectedPlan.registrationDeadline)}
                        icon={Clock}
                        color="amber"
                      />
                      <InfoRow
                        label="Địa điểm"
                        value={selectedPlan.location}
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
                        value={`${selectedPlan.maxParticipants || 0} người`}
                        icon={Users}
                        color="violet"
                      />
                      <InfoRow
                        label="Đã đăng ký"
                        value={`${selectedPlan.registeredCount || 0} người`}
                        icon={UserPlus}
                        color="indigo"
                      />
                      <div className="col-span-2">
                        <InfoRow
                          label="Đối tượng tham gia"
                          value={getArrayDisplay(selectedPlan.participants)}
                          icon={Users}
                          color="purple"
                        />
                      </div>
                      <InfoRow
                        label="Chuyên ngành"
                        value={selectedPlan.major || "Không có"}
                        icon={Building2}
                        color="amber"
                      />
                    </div>
                  </Section>

                  <Section title="Nơi nhận kế hoạch" icon={Mail} color="amber">
                    <div className="space-y-4">
                      {selectedPlan.recipients?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Nơi nhận chính
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlan.recipients.map((r, i) => (
                              <Badge key={i} color="blue">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedPlan.customRecipients?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Nơi nhận khác
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlan.customRecipients.map((r, i) => (
                              <Badge key={i} color="purple">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {!selectedPlan.recipients?.length &&
                        !selectedPlan.customRecipients?.length && (
                          <p className="text-sm text-slate-400 italic">
                            Chưa có nơi nhận
                          </p>
                        )}
                    </div>
                  </Section>

                  <Section
                    title="Thành phần tham gia"
                    icon={Users}
                    color="indigo"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoRow
                        label="Người trình bày"
                        value={getArrayDisplay(selectedPlan.presenters)}
                        icon={UserPlus}
                        color="cyan"
                      />
                      <InfoRow
                        label="Ban tổ chức"
                        value={getArrayDisplay(
                          selectedPlan.organizingCommittee,
                        )}
                        icon={Award}
                        color="amber"
                      />
                      <InfoRow
                        label="Người tham dự"
                        value={getArrayDisplay(selectedPlan.attendees)}
                        icon={Users}
                        color="green"
                      />
                      <InfoRow
                        label="Người tạo"
                        value={selectedPlan.createdByAccountId || "Không có"}
                        icon={UserPlus}
                        color="slate"
                      />
                      <InfoRow
                        label="Người duyệt"
                        value={selectedPlan.approvedByAccountId || "Không có"}
                        icon={ShieldCheck}
                        color="emerald"
                      />
                    </div>
                  </Section>

                  <Section title="Mô tả chi tiết" icon={FileText} color="slate">
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                        {selectedPlan.description || "Không có mô tả"}
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
                        label="Ghi chú"
                        value={selectedPlan.notes || "Không có"}
                        icon={FileText}
                        color="amber"
                      />
                      <InfoRow
                        label="Thông tin thêm"
                        value={selectedPlan.additionalInfo || "Không có"}
                        icon={Info}
                        color="slate"
                      />
                      {selectedPlan.customFieldsJson && (
                        <InfoRow
                          label="Custom Fields"
                          value={selectedPlan.customFieldsJson}
                          icon={FileText}
                          color="purple"
                        />
                      )}
                    </div>
                  </Section>

                  {modalMode === "view" && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-500">
                            Ngày tạo:{" "}
                            <span className="font-bold text-slate-700">
                              {formatDate(selectedPlan.createdAt)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-500">
                            Cập nhật lần cuối:{" "}
                            <span className="font-bold text-slate-700">
                              {formatDate(selectedPlan.updatedAt)}
                            </span>
                          </span>
                        </div>
                        {selectedPlan.deletedAt && (
                          <div className="flex items-center gap-2">
                            <X size={14} className="text-rose-400" />
                            <span className="font-medium text-slate-500">
                              Đã xóa:{" "}
                              <span className="font-bold text-rose-600">
                                {formatDate(selectedPlan.deletedAt)}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {modalMode === "edit" && (
                    <div className="space-y-6 border-t border-slate-200 pt-6">
                      <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest">
                        Chỉnh sửa thông tin
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Tên kế hoạch
                          </label>
                          <input
                            type="text"
                            value={selectedPlan.title || ""}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                title: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Loại sự kiện
                          </label>
                          <select
                            value={selectedPlan.type || ""}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                type: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none"
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
                            value={selectedPlan.eventTopic || "Không có"}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                eventTopic: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Địa điểm
                          </label>
                          <input
                            type="text"
                            value={selectedPlan.location || ""}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                location: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Thời gian bắt đầu
                          </label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocal(selectedPlan.startTime)}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                startTime: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Thời gian kết thúc
                          </label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocal(selectedPlan.endTime)}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                endTime: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Hạn đăng ký
                          </label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocal(
                              selectedPlan.registrationDeadline,
                            )}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                registrationDeadline: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Số lượng tối đa
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={selectedPlan.maxParticipants || 0}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                maxParticipants: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Mô tả
                          </label>
                          <textarea
                            rows={4}
                            value={selectedPlan.description || ""}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                description: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
                            placeholder="Nhập mô tả chi tiết..."
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Ghi chú
                          </label>
                          <textarea
                            rows={3}
                            value={selectedPlan.notes || ""}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                notes: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
                            placeholder="Nhập ghi chú..."
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Thông tin thêm
                          </label>
                          <textarea
                            rows={3}
                            value={selectedPlan.additionalInfo || ""}
                            onChange={(e) =>
                              setSelectedPlan({
                                ...selectedPlan,
                                additionalInfo: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
                            placeholder="Nhập thông tin thêm..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      Đóng
                    </button>
                    {modalMode === "edit" && (
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-amber-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-amber-700 transition-all active:scale-95"
                      >
                        <Save size={18} /> Lưu thay đổi
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagePlans;
