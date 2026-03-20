import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Eye, CheckCircle, XCircle, X, ChevronLeft, ChevronRight,
  ClipboardList, Clock, Calendar, MapPin, Users, Filter,
  AlertTriangle, Loader2, User, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllPlans, approvePlan, cancelPlan } from "../../api/eventApi";

const STATUS_LABELS = {
  Draft: { label: "Bản nháp", color: "bg-slate-50 text-slate-600 border-slate-200" },
  PendingApproval: { label: "Chờ duyệt", color: "bg-amber-50 text-amber-700 border-amber-200" },
  Published: { label: "Đã duyệt", color: "bg-blue-50 text-blue-700 border-blue-200" },
  Cancelled: { label: "Đã hủy", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getCurrentAccountId = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.accountId || payload.userId || payload.sub || null;
  } catch { return null; }
};

const ITEMS_PER_PAGE = 8;

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3000);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await getAllPlans();
      setPlans(res.data || []);
    } catch (e) {
      showToast("Lỗi tải dữ liệu!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleApprove = async (id) => {
    const accountId = getCurrentAccountId();
    if (!accountId) { showToast("Không xác định được người dùng!", "error"); return; }
    try {
      await approvePlan(id, accountId, accountId);
      showToast("Đã phê duyệt kế hoạch!");
      fetchPlans();
      setSelectedPlan(null);
    } catch { showToast("Lỗi phê duyệt!", "error"); }
  };

  const handleReject = async (id) => {
    const accountId = getCurrentAccountId();
    if (!accountId) { showToast("Không xác định được người dùng!", "error"); return; }
    try {
      await cancelPlan(id, accountId);
      showToast("Đã từ chối kế hoạch!");
      fetchPlans();
      setSelectedPlan(null);
    } catch { showToast("Lỗi từ chối!", "error"); }
  };

  const filtered = useMemo(() => plans.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.createdByName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  }), [plans, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = {
    total: plans.length,
    pending: plans.filter(p => p.status === "PendingApproval").length,
    published: plans.filter(p => p.status === "Published").length,
    draft: plans.filter(p => p.status === "Draft").length,
  };

  return (
    <div className="space-y-6 bg-slate-50/50 min-h-screen">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}>
            {toast.type === "success" ? <CheckCircle className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{toast.message}</p>
            <button onClick={() => setToast(p => ({ ...p, show: false }))}><X size={16} className="text-slate-400" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Quản lý kế hoạch</h2>
        <p className="text-slate-500 text-sm mt-1">Xem xét và phê duyệt kế hoạch sự kiện</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng kế hoạch", value: stats.total, color: "blue" },
          { label: "Chờ duyệt", value: stats.pending, color: "amber" },
          { label: "Đã duyệt", value: stats.published, color: "emerald" },
          { label: "Bản nháp", value: stats.draft, color: "slate" },
        ].map(({ label, value, color }) => (
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
            <input type="text" placeholder="Tìm kiếm kế hoạch, người tạo..." value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer font-medium">
            <option value="All">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={36} />
              <p className="text-sm text-slate-500">Đang tải...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-16 text-center">
              <ClipboardList size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Không có kế hoạch nào</p>
            </div>
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
                {paginated.map(plan => {
                  const statusInfo = STATUS_LABELS[plan.status] || { label: plan.status, color: "bg-slate-50 text-slate-600 border-slate-200" };
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{plan.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{plan.location || "Chưa có địa điểm"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {plan.createdByName?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <span className="text-xs font-medium text-slate-600">{plan.createdByName || "Không rõ"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 space-y-0.5">
                          <div className="flex items-center gap-1"><Calendar size={11} /> {formatDate(plan.startTime)}</div>
                          <div className="flex items-center gap-1"><Clock size={11} /> {formatDate(plan.endTime)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusInfo.color}`}>{statusInfo.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {plan.status === "PendingApproval" && (
                            <>
                              <button onClick={() => handleApprove(plan.id)} title="Phê duyệt"
                                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer">
                                <CheckCircle size={16} />
                              </button>
                              <button onClick={() => handleReject(plan.id)} title="Từ chối"
                                className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button onClick={() => setSelectedPlan(plan)} title="Xem chi tiết"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-5 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500">Trang {currentPage} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer"><ChevronLeft size={16} /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-black cursor-pointer ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300"}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPlan(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><FileText size={18} /></div>
                  <h2 className="text-lg font-black text-slate-800">Chi tiết kế hoạch</h2>
                </div>
                <button onClick={() => setSelectedPlan(null)} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-7 space-y-4">
                <h3 className="text-xl font-black text-slate-800">{selectedPlan.title}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Người tạo", value: selectedPlan.createdByName || "—", icon: User },
                    { label: "Người duyệt", value: selectedPlan.approvedByName || "Chưa có", icon: CheckCircle },
                    { label: "Bắt đầu", value: formatDate(selectedPlan.startTime), icon: Calendar },
                    { label: "Kết thúc", value: formatDate(selectedPlan.endTime), icon: Calendar },
                    { label: "Địa điểm", value: selectedPlan.location || "—", icon: MapPin },
                    { label: "Số lượng tối đa", value: `${selectedPlan.maxParticipants || 0} người`, icon: Users },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
                {selectedPlan.description && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Mô tả</p>
                    <p className="text-sm text-slate-700">{selectedPlan.description}</p>
                  </div>
                )}
              </div>

              {selectedPlan.status === "PendingApproval" && (
                <div className="px-7 py-5 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                  <button onClick={() => handleReject(selectedPlan.id)}
                    className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all cursor-pointer flex items-center justify-center gap-2">
                    <XCircle size={16} /> Từ chối
                  </button>
                  <button onClick={() => handleApprove(selectedPlan.id)}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                    <CheckCircle size={16} /> Phê duyệt
                  </button>
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