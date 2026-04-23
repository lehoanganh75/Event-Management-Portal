import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Calendar,
  MapPin,
  Users,
  Loader2,
  User,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { useNotification } from "../../context/NotificationContext";

const STATUS_LABELS = {
  DRAFT: { label: "Bản nháp", color: "bg-slate-50 text-slate-600 border-slate-200" },
  PLAN_PENDING_APPROVAL: { label: "Chờ duyệt kế hoạch", color: "bg-amber-50 text-amber-700 border-amber-200" },
  PENDING_APPROVAL: { label: "Chờ duyệt kế hoạch", color: "bg-amber-50 text-amber-700 border-amber-200" },
  PLAN_APPROVED: { label: "Kế hoạch đã duyệt", color: "bg-blue-50 text-blue-700 border-blue-200" },
  APPROVED: { label: "Đã duyệt", color: "bg-blue-50 text-blue-700 border-blue-200" },
  EVENT_PENDING_APPROVAL: { label: "Chờ duyệt sự kiện", color: "bg-orange-50 text-orange-700 border-orange-200" },
  PUBLISHED: { label: "Đã xuất bản", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ONGOING: { label: "Đang diễn ra", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-gray-50 text-gray-700 border-gray-200" },
  CANCELLED: { label: "Đã hủy", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getAvatarColor = (name) => {
  const colors = ["bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600", "bg-purple-100 text-purple-600", "bg-amber-100 text-amber-600", "bg-rose-100 text-rose-600", "bg-cyan-100 text-cyan-600"];
  if (!name || name === "Không rõ") return colors[0];
  const index = name.length % colors.length;
  return colors[index];
};

const ITEMS_PER_PAGE = 5;

const PlansPage = () => {
  // 2. LẤY DATA VÀ PHƯƠNG THỨC TỪ CONTEXT
  const { user } = useAuth();
  const { 
    events: eventService, 
    approvePlan, 
    rejectPlan, 
    loading: eventLoading 
  } = useEvents();
  const { service: notificationService } = useNotification();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 3000);
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      // Dùng hàm lấy tất cả kế hoạch từ service trong context
      const res = await eventService.getAllPlans();
      setPlans(res.data || []);
    } catch (e) {
      showToast("Lỗi tải dữ liệu!", "error");
    } finally {
      setLoading(false);
    }
  }, [eventService]);

  useEffect(() => {
    if (user) fetchPlans();
  }, [user, fetchPlans]);

  // 3. XỬ LÝ PHÊ DUYỆT / TỪ CHỐI QUA CONTEXT
  const handleApprove = async (plan) => {
    if (!user) return;
    try {
      await approvePlan(plan.id, plan);
      showToast(`Đã phê duyệt kế hoạch "${plan?.title}" thành công!`, "success");
      fetchPlans();
      setSelectedPlan(null);
    } catch (error) {
      showToast("Lỗi phê duyệt!", "error");
    }
  };

  const handleReject = async (plan) => {
    if (!user) return;
    const reason = prompt("Nhập lý do từ chối kế hoạch này:");
    if (reason === null) return;

    try {
      await rejectPlan(plan.id, reason, plan);
      showToast(`Đã từ chối kế hoạch "${plan?.title}"!`);
      fetchPlans();
      setSelectedPlan(null);
    } catch (error) {
      showToast("Lỗi thao tác!", "error");
    }
  };

  const filtered = useMemo(() =>
    plans.filter((p) => {
      const creatorStr = (p.createdByName || "").toLowerCase();
      const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || creatorStr.includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "All" || p.status?.toUpperCase() === statusFilter.toUpperCase();
      return matchSearch && matchStatus;
    }),
    [plans, searchTerm, statusFilter]
  );

  const stats = useMemo(() => ({
    total: plans.length,
    pending: plans.filter((p) => p.status?.toUpperCase() === "PLAN_PENDING_APPROVAL").length,
    published: plans.filter((p) => p.status?.toUpperCase() === "PLAN_APPROVED" || p.status?.toUpperCase() === "PUBLISHED").length,
    draft: plans.filter((p) => p.status?.toUpperCase() === "DRAFT").length,
  }), [plans]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ==================== UI GIỮ NGUYÊN 100% ====================
  return (
    <div className="space-y-6 bg-slate-50/50 min-h-screen p-6">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}>
            {toast.type === "success" ? <CheckCircle className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{toast.message}</p>
            <button onClick={() => setToast((p) => ({ ...p, show: false }))}><X size={16} className="text-slate-400" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Quản lý kế hoạch</h2>
        <p className="text-slate-500 text-sm mt-1">Xem xét và phê duyệt kế hoạch sự kiện</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: "Tổng kế hoạch", value: stats.total, color: "blue" }, { label: "Chờ duyệt", value: stats.pending, color: "amber" }, { label: "Đã duyệt", value: stats.published, color: "emerald" }, { label: "Bản nháp", value: stats.draft, color: "slate" }].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className={`text-2xl font-black text-${color}-600`}>{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Tìm kiếm kế hoạch, người tạo..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer font-medium">
            <option value="All">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PLAN_PENDING_APPROVAL">Chờ duyệt kế hoạch</option>
            <option value="PLAN_APPROVED">Kế hoạch đã duyệt</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center gap-3"><Loader2 className="animate-spin text-blue-600" size={36} /><p className="text-sm text-slate-500">Đang tải...</p></div>
          ) : paginated.length === 0 ? (
            <div className="p-16 text-center"><ClipboardList size={48} className="text-slate-200 mx-auto mb-3" /><p className="text-slate-500 font-medium">Không có kế hoạch nào</p></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Tên kế hoạch</th>
                  <th className="px-6 py-4">Người tạo</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((plan) => {
                  const statusInfo = STATUS_LABELS[plan.status] || STATUS_LABELS[plan.status?.toUpperCase()] || { label: plan.status || "Không xác định", color: "bg-slate-50 text-slate-600 border-slate-200" };
                  const creatorName = plan.createdByName || "Không rõ";
                  const initial = creatorName !== "Không rõ" ? creatorName.charAt(0).toUpperCase() : "?";
                  const avatarColor = getAvatarColor(creatorName);
                  const currentStatus = plan.status?.toUpperCase() || "";
                  const isPending = currentStatus === "PLAN_PENDING_APPROVAL" || currentStatus === "PENDING_APPROVAL";

                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{plan.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={10} />{plan.location || "Chưa có địa điểm"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 ${avatarColor} rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm`}>{initial}</div>
                          <span className="text-xs font-semibold text-slate-700">{creatorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1"><Calendar size={11} /><span>{formatDate(plan.startTime)}</span></div>
                        <div className="flex items-center gap-1"><Clock size={11} /><span>{formatDate(plan.endTime)}</span></div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusInfo.color}`}>{statusInfo.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPending && (
                            <>
                              <button onClick={() => handleApprove(plan)} title="Phê duyệt" className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all cursor-pointer hover:scale-105"><CheckCircle size={16} /></button>
                              <button onClick={() => handleReject(plan)} title="Từ chối" className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all cursor-pointer hover:scale-105"><XCircle size={16} /></button>
                            </>
                          )}
                          <button onClick={() => setSelectedPlan(plan)} title="Xem chi tiết" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer hover:scale-105"><Eye size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                currentPage === num 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                  : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL CHI TIẾT (GIỮ NGUYÊN) */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPlan(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><FileText size={18} /></div>
                  <h2 className="text-lg font-black text-slate-800">Chi tiết kế hoạch</h2>
                </div>
                <button onClick={() => setSelectedPlan(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-7 space-y-4">
                <h3 className="text-xl font-black text-slate-800">{selectedPlan.title}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[{ label: "Người tạo", value: selectedPlan.createdByName || "Không rõ", icon: User }, { label: "Người duyệt", value: selectedPlan.approvedByName || "Chưa có", icon: CheckCircle }, { label: "Bắt đầu", value: formatDate(selectedPlan.startTime), icon: Calendar }, { label: "Kết thúc", value: formatDate(selectedPlan.endTime), icon: Calendar }, { label: "Địa điểm", value: selectedPlan.location || "—", icon: MapPin }, { label: "Số lượng tối đa", value: `${selectedPlan.maxParticipants || 0} người`, icon: Users }].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1"><Icon size={12} className="text-slate-400" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span></div>
                      <p className="text-sm font-semibold text-slate-800 break-all">{value}</p>
                    </div>
                  ))}
                </div>
                {selectedPlan.description && (
                  <div className="bg-slate-50 rounded-xl p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Mô tả</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedPlan.description}</p></div>
                )}
              </div>
              {(selectedPlan.status?.toUpperCase() === "PLAN_PENDING_APPROVAL" || selectedPlan.status?.toUpperCase() === "PENDING_APPROVAL") && (
                <div className="px-7 py-5 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                  <button onClick={() => handleReject(selectedPlan)} className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all cursor-pointer flex items-center justify-center gap-2"><XCircle size={16} /> Từ chối</button>
                  <button onClick={() => handleApprove(selectedPlan)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"><CheckCircle size={16} /> Phê duyệt</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlansPage;