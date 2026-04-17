import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  User, Shield, CheckCircle, XCircle, AlertTriangle,
  Loader2, UserCog, Lock, Unlock, Mail, Fingerprint, Users, ShieldCheck, ShieldAlert,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../../context/AuthContext';

const ROLES = ["SUPER_ADMIN", "ADMIN", "MEMBER", "GUEST"];

const ROLE_LABELS = {
  SUPER_ADMIN: "S.Admin",
  ADMIN: "Quản trị",
  MEMBER: "Thành viên",
  GUEST: "Khách",
};

const ROLE_COLORS = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
  MEMBER: "bg-indigo-100 text-indigo-700 border-indigo-200",
  GUEST: "bg-slate-100 text-slate-600 border-slate-200",
};

const ITEMS_PER_PAGE = 8;

const AccountsPage = () => {
  const { accounts, fetchAccounts, updateAccount, deleteAccount, updateAccountStatus } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Tất cả");
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
    role: "STUDENT",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 3000);
  };

  /* --- STATISTICS (Giống EventPage) --- */
  const stats = useMemo(() => ({
    total: accounts?.length || 0,
    active: accounts?.filter(a => a.status === "ACTIVE").length || 0,
    admin: accounts?.filter(a => ["ADMIN", "SUPER_ADMIN"].includes(a.role)).length || 0,
    student: accounts?.filter(a => a.role === "STUDENT").length || 0,
    locked: accounts?.filter(a => a.status !== "ACTIVE").length || 0,
  }), [accounts]);

  /* --- FILTER LOGIC (Giống EventPage) --- */
  const filtered = useMemo(() => {
    const list = Array.isArray(accounts) ? accounts : [];
    return list.filter((a) => {
      const s = searchTerm.toLowerCase();
      const matchSearch = (a.fullName || "").toLowerCase().includes(s) ||
                          (a.username || "").toLowerCase().includes(s) ||
                          (a.email || "").toLowerCase().includes(s);
      const matchRole = roleFilter === "All" || a.role === roleFilter;
      
      let matchTab = true;
      if (activeTab === "Đang hoạt động") matchTab = a.status === "ACTIVE";
      if (activeTab === "Bị khóa") matchTab = a.status !== "ACTIVE";
      if (activeTab === "Quản trị") matchTab = ["ADMIN", "SUPER_ADMIN"].includes(a.role);

      return matchSearch && matchRole && matchTab;
    });
  }, [accounts, searchTerm, roleFilter, activeTab]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

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

  const handleSave = async () => {
    try {
      if (modalMode === "edit") {
        await updateAccount(selectedAccount.id, formData);
        showToast("Cập nhật thành công!");
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast("Thao tác thất bại", "error");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-left">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {/* Icon đại diện cho Quản lý tài khoản */}
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <UserCog size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Quản lý bài đăng</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setModalMode("create"); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md active:scale-95"
          >
            <Plus size={18} /> Thêm tài khoản
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS (UI 5 cột giống EventPage) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Users size={28} className="opacity-80" />
            <div>
              <p className="text-sm opacity-90">Tổng tài khoản</p>
              <p className="text-3xl font-semibold mt-1">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle size={28} className="opacity-80" />
            <div>
              <p className="text-sm opacity-90">Đang hoạt động</p>
              <p className="text-3xl font-semibold mt-1">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-500 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="opacity-80" />
            <div>
              <p className="text-sm opacity-90">Quản trị viên</p>
              <p className="text-3xl font-semibold mt-1">{stats.admin}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-500 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <User size={28} className="opacity-80" />
            <div>
              <p className="text-sm opacity-90">Sinh viên</p>
              <p className="text-3xl font-semibold mt-1">{stats.student}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert size={28} className="opacity-80" />
            <div>
              <p className="text-sm opacity-90">Đã khóa</p>
              <p className="text-3xl font-semibold mt-1">{stats.locked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS (Giống EventPage) */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto pb-1 gap-2">
        {[
          { id: "Tất cả", label: "Tất cả", icon: Users, count: stats.total },
          { id: "Đang hoạt động", label: "Đang hoạt động", icon: CheckCircle2, count: stats.active },
          { id: "Quản trị", label: "Quản trị", icon: ShieldCheck, count: stats.admin },
          { id: "Bị khóa", label: "Bị khóa", icon: Lock, count: stats.locked },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            className="pl-11 pr-4 py-3 w-full border border-gray-100 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            placeholder="Tìm theo tên, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="border border-gray-100 bg-slate-50 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 focus:outline-none min-w-[180px] cursor-pointer"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">Tất cả vai trò</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>

        <button 
          onClick={() => { setSearchTerm(""); setRoleFilter("All"); setActiveTab("Tất cả"); }}
          className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-all active:scale-95"
        >
          Đặt lại
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {!accounts ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
             <Loader2 className="animate-spin text-blue-600" size={40} />
             <p className="text-slate-500 font-medium italic">Đang tải danh sách người dùng...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-600">Người dùng</th>
                <th className="p-4 text-left font-semibold text-gray-600">Email</th>
                <th className="p-4 text-left font-semibold text-gray-600">Vai trò</th>
                <th className="p-4 text-center font-semibold text-gray-600">Trạng thái</th>
                <th className="p-4 text-center font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginated.length > 0 ? (
                paginated.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm border border-blue-100 shadow-sm">
                          {(acc.fullName || acc.username || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{acc.fullName || "—"}</p>
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                            <Fingerprint size={10} /> {acc.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-2"><Mail size={14} className="text-slate-300"/>{acc.email || "—"}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${ROLE_COLORS[acc.role] || "bg-gray-100"}`}>
                        {ROLE_LABELS[acc.role] || acc.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${acc.status === "ACTIVE" ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {acc.status === "ACTIVE" ? <CheckCircle size={10}/> : <XCircle size={10}/>}
                        {acc.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => updateAccountStatus(acc.id)} 
                          className={`p-2 rounded-lg transition-all ${acc.status === "ACTIVE" ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' : 'text-amber-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={acc.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                        >
                          {acc.status === "ACTIVE" ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                        <button 
                          onClick={() => openEdit(acc)} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => { setAccountToDelete(acc); setIsDeleteOpen(true); }} 
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-500 italic">
                    Không tìm thấy tài khoản nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-slate-600">Trang {currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL EDIT/CREATE (Bo góc lớn giống EventPage) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white">
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 uppercase tracking-tight italic">
                  {modalMode === "edit" ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
                </h3>
                <X onClick={() => setIsModalOpen(false)} className="text-slate-400 cursor-pointer hover:text-rose-500 transition-all" size={20} />
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block tracking-widest">Họ và tên</label>
                  <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-blue-500 transition-all shadow-inner" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block tracking-widest">Email liên hệ</label>
                  <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-blue-500 transition-all shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block tracking-widest">Vai trò hệ thống</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 cursor-pointer" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div className="pt-4">
                  <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Lưu thông tin</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG (Giống EventPage) */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl border-4 border-white">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={40} className="text-rose-500" /></div>
              <h3 className="font-black text-slate-800 mb-2 italic text-xl uppercase tracking-tighter">Xác nhận xóa?</h3>
              <p className="text-[10px] text-slate-400 font-bold mb-8 uppercase tracking-widest leading-relaxed">Tài khoản <span className="text-rose-500 italic">@{accountToDelete?.username}</span> sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 font-black text-slate-400 text-[10px] uppercase cursor-pointer hover:bg-slate-50 py-3 rounded-2xl transition-colors">Hủy bỏ</button>
                <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all">Xóa ngay</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountsPage;