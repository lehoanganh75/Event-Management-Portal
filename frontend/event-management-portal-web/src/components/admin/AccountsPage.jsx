import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  User, Shield, CheckCircle, XCircle, AlertTriangle,
  Loader2, UserCog, Lock, Unlock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Import AuthContext
import { useAuth } from '../../context/AuthContext';

const ROLES = ["SUPER_ADMIN", "ADMIN", "ORGANIZER", "MEMBER", "STUDENT", "GUEST", "EVENT_PARTICIPANT"];

const ROLE_LABELS = {
  SUPER_ADMIN: "Quản trị viên cao cấp",
  ADMIN: "Quản trị viên",
  MEMBER: "Thành viên",
  GUEST: "Khách",
};

const ROLE_COLORS = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
  MEMBER: "bg-green-100 text-green-700 border-green-200",
  GUEST: "bg-slate-100 text-slate-600 border-slate-200",
};

const ITEMS_PER_PAGE = 8;

const AccountsPage = () => {
  // Lấy accounts và các hàm xử lý từ Context
  const { accounts, fetchAccounts, updateAccount, deleteAccount, updateAccountStatus } = useAuth();

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

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  console.log(accounts);
  
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "STUDENT", // Sửa lại thành role đơn
    status: "ACTIVE",
    password: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 3000);
  };

  console.log("Acconts: ", accounts);

  // 1. Logic Filter & Pagination (Dùng accounts từ Context)
  const filtered = useMemo(() => {
    
    
    const list = Array.isArray(accounts) ? accounts : [];
    return list.filter((a) => {
      const s = searchTerm.toLowerCase();
      const matchSearch = (a.fullName || "").toLowerCase().includes(s) ||
                          (a.username || "").toLowerCase().includes(s) ||
                          (a.email || "").toLowerCase().includes(s);
      const matchRole = roleFilter === "All" || a.role === roleFilter;
      const matchStatus = statusFilter === "All" || a.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [accounts, searchTerm, roleFilter, statusFilter]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  // 2. Mở Modal chỉnh sửa
  const openEdit = (acc) => {
    setSelectedAccount(acc);
    setFormData({
      username: acc.username || "",
      email: acc.email || "",
      fullName: acc.fullName || "",
      role: acc.role || "STUDENT",
      status: acc.status || "ACTIVE",
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // 3. Xử lý Save qua Context
  const handleSave = async () => {
    try {
      if (modalMode === "edit") {
        await updateAccount(selectedAccount.id, formData);
        showToast("Cập nhật thành công!");
      } else {
        showToast("Tính năng tạo mới đang được cập nhật", "info");
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast("Thao tác thất bại", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount(accountToDelete.id);
      showToast("Đã xóa tài khoản!");
      setIsDeleteOpen(false);
    } catch (e) {
      showToast("Xóa thất bại", "error");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await updateAccountStatus(id);
      showToast("Cập nhật trạng thái thành công!");
    } catch (e) {
      showToast("Lỗi cập nhật", "error");
    }
  };

  const stats = {
    total: accounts?.length || 0,
    active: accounts?.filter(a => a.status === "ACTIVE").length || 0,
    admin: accounts?.filter(a => ["ADMIN", "SUPER_ADMIN"].includes(a.role)).length || 0,
    student: accounts?.filter(a => a.role === "STUDENT").length || 0,
  };

  return (
    <div className="space-y-6 bg-slate-50/50 min-h-screen p-6 font-sans text-left">
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Quản lý tài khoản</h2>
          <p className="text-slate-500 text-xs font-bold uppercase opacity-60 mt-1">{stats.total} thành viên hệ thống</p>
        </div>
        <button onClick={() => { setModalMode("create"); setIsModalOpen(true); }} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
          <Plus size={18} /> Thêm tài khoản
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng tài khoản", value: stats.total, color: "blue", icon: UserCog },
          { label: "Đang hoạt động", value: stats.active, color: "emerald", icon: CheckCircle },
          { label: "Quản trị viên", value: stats.admin, color: "purple", icon: Shield },
          { label: "Sinh viên", value: stats.student, color: "orange", icon: User },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={`text-${color}-600`} />
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter & Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Tìm tên, email hoặc username..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-slate-50 px-4 py-2.5 rounded-2xl border-none text-xs font-black text-slate-600 outline-none cursor-pointer uppercase tracking-tighter">
            <option value="All">Tất cả vai trò</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          {!accounts ? (
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
              <tbody className="divide-y divide-slate-50 font-medium text-sm">
                {paginated.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-xs border border-blue-100">{(acc.fullName || acc.username || "U").charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-bold text-slate-800">{acc.fullName || "—"}</p>
                          <p className="text-[10px] text-slate-400 font-bold">@{acc.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">{acc.email || "—"}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${ROLE_COLORS[acc.role] || ROLE_COLORS.GUEST}`}>
                            {ROLE_LABELS[acc.role] || acc.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${acc.status === "ACTIVE" ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {acc.status === "ACTIVE" ? "Hoạt động" : "Vô hiệu"}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => toggleStatus(acc.id)} className="p-2 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer">{acc.status === "ACTIVE" ? <Lock size={16} /> : <Unlock size={16} />}</button>
                        <button onClick={() => openEdit(acc)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"><Edit2 size={16} /></button>
                        <button onClick={() => { setAccountToDelete(acc); setIsDeleteOpen(true); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Edit/Create */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white">
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-black text-slate-800 uppercase tracking-tight italic">{modalMode === "edit" ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}</h3>
                  <X onClick={() => setIsModalOpen(false)} className="text-slate-400 cursor-pointer hover:text-rose-500 transition-colors" />
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block">Họ và tên</label>
                    <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-blue-500 transition-all" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block">Email liên hệ</label>
                    <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-blue-500 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block">Vai trò gán cho tài khoản</label>
                    <select className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 cursor-pointer" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </div>
                  <div className="pt-4">
                    <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Lưu thông tin ngay</button>
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl border-4 border-white">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={40} className="text-rose-500" /></div>
              <h3 className="font-black text-slate-800 mb-2 italic text-xl">Xác nhận xóa?</h3>
              <p className="text-xs text-slate-400 font-bold mb-8 uppercase tracking-tighter">Tài khoản <span className="text-rose-500">@{accountToDelete?.username}</span> sẽ bị xóa vĩnh viễn.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 font-black text-slate-400 text-xs uppercase cursor-pointer hover:bg-slate-50 py-3 rounded-2xl transition-colors">Hủy</button>
                <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all">Xóa ngay</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountsPage;