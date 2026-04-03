import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  User, Shield, CheckCircle, XCircle, AlertTriangle,
  Loader2, UserCog, Lock, Unlock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// SỬA: Import API tập trung
import { userApi } from "../../api/userApi";

const ROLES = ["SUPER_ADMIN", "ADMIN", "ORGANIZER", "MEMBER", "STUDENT", "GUEST", "EVENT_PARTICIPANT"];

const ROLE_LABELS = {
  SUPER_ADMIN: "Quản trị viên cao cấp",
  ADMIN: "Quản trị viên",
  ORGANIZER: "Ban tổ chức",
  MEMBER: "Thành viên",
  STUDENT: "Sinh viên",
  GUEST: "Khách",
  EVENT_PARTICIPANT: "Người tham gia",
};

const ROLE_COLORS = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
  ORGANIZER: "bg-orange-100 text-orange-700 border-orange-200",
  MEMBER: "bg-green-100 text-green-700 border-green-200",
  STUDENT: "bg-cyan-100 text-cyan-700 border-cyan-200",
  GUEST: "bg-slate-100 text-slate-600 border-slate-200",
  EVENT_PARTICIPANT: "bg-pink-100 text-pink-700 border-pink-200",
};

const ITEMS_PER_PAGE = 8;

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    roles: ["STUDENT"],
    status: "ACTIVE",
    password: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 3000);
  };

  // 1. Fetch dữ liệu sử dụng axiosClient (đã đính kèm Token tự động)
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await userApi.accounts.getAll();
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast("Không thể tải danh sách tài khoản", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  // 2. Logic Filter & Pagination
  const filtered = useMemo(() =>
    accounts.filter((a) => {
      const s = searchTerm.toLowerCase();
      const matchSearch = (a.fullName || "").toLowerCase().includes(s) ||
                          (a.username || "").toLowerCase().includes(s) ||
                          (a.email || "").toLowerCase().includes(s);
      const matchRole = roleFilter === "All" || (a.roles && a.roles.includes(roleFilter));
      const matchStatus = statusFilter === "All" || a.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    }), [accounts, searchTerm, roleFilter, statusFilter]
  );

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  // 3. Xử lý Save (Update/Create)
  const handleSave = async () => {
    try {
      if (modalMode === "edit") {
        await userApi.accounts.update(selectedAccount.id, formData);
        showToast("Cập nhật thành công!");
      } else {
        // Nếu có api.create, sử dụng tương tự
        // await userApi.accounts.create(formData);
        showToast("Tính năng tạo mới đang được cập nhật", "info");
      }
      fetchAccounts();
      setIsModalOpen(false);
    } catch (error) {
      showToast(error.response?.data?.message || "Thao tác thất bại", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await userApi.accounts.delete(accountToDelete.id);
      setAccounts(p => p.filter(a => a.id !== accountToDelete.id));
      showToast("Đã xóa tài khoản!");
    } catch (e) {
      showToast("Xóa thất bại", "error");
    } finally { setIsDeleteOpen(false); }
  };

  const toggleStatus = async (id) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    const newStatus = account.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

    try {
      await userApi.accounts.updateStatus(id, newStatus);
      setAccounts(p => p.map(a => a.id === id ? { ...a, status: newStatus } : a));
      showToast("Cập nhật trạng thái thành công!");
    } catch (e) {
      showToast("Lỗi cập nhật", "error");
    }
  };

  const stats = {
    total: accounts.length,
    active: accounts.filter(a => a.status === "ACTIVE").length,
    admin: accounts.filter(a => (a.roles || []).some(r => ["ADMIN", "SUPER_ADMIN"].includes(r))).length,
    student: accounts.filter(a => (a.roles || []).includes("STUDENT")).length,
  };

  return (
    <div className="space-y-6 bg-slate-50/50 min-h-screen p-6 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}>
            {toast.type === "success" ? <CheckCircle className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{toast.message}</p>
            <X size={16} className="text-slate-400 cursor-pointer" onClick={() => setToast({ ...toast, show: false })} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý tài khoản</h2>
          <p className="text-slate-500 text-sm mt-1">{accounts.length} người dùng hiện có</p>
        </div>
        <button onClick={() => { setModalMode("create"); setIsModalOpen(true); }} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
          <Plus size={18} /> Thêm tài khoản
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng tài khoản", value: stats.total, color: "blue", icon: UserCog },
          { label: "Hoạt động", value: stats.active, color: "emerald", icon: CheckCircle },
          { label: "Quản trị viên", value: stats.admin, color: "purple", icon: Shield },
          { label: "Sinh viên", value: stats.student, color: "orange", icon: User },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={`text-${color}-600`} />
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter & Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Tìm tên, email..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-slate-50 px-4 py-2.5 rounded-2xl border-none text-sm font-bold text-slate-600 outline-none cursor-pointer">
            <option value="All">Tất cả vai trò</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center"><Loader2 className="animate-spin inline-block text-blue-600" size={36} /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-sm">{(acc.fullName || acc.username || "U").charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{acc.fullName || "—"}</p>
                          <p className="text-[10px] text-slate-400">@{acc.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{acc.email || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(acc.roles || []).map(r => (
                          <span key={r} className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${ROLE_COLORS[r] || ROLE_COLORS.GUEST}`}>{ROLE_LABELS[r]}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${acc.status === "ACTIVE" ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {acc.status === "ACTIVE" ? "Hoạt động" : "Vô hiệu"}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => toggleStatus(acc.id)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer">{acc.status === "ACTIVE" ? <Lock size={16} /> : <Unlock size={16} />}</button>
                        <button onClick={() => openEdit(acc)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><Edit2 size={16} /></button>
                        <button onClick={() => { setAccountToDelete(acc); setIsDeleteOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination & Modals (Tương tự logic UI ban đầu của bạn nhưng đã dọn dẹp biến thừa) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white">
               <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-black text-slate-800 uppercase tracking-tight">Tài khoản</h3>
                  <X onClick={() => setIsModalOpen(false)} className="text-slate-400 cursor-pointer" />
               </div>
               <div className="p-8 space-y-4">
                  <input className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none" placeholder="Họ và tên" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  <input className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-black">LƯU THAY ĐỔI</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-[2rem] max-w-xs w-full text-center shadow-2xl border-4 border-white">
              <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
              <h3 className="font-black text-slate-800 mb-6">Xác nhận xóa tài khoản?</h3>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 font-bold text-slate-400">HỦY</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-black">XÓA</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountsPage;