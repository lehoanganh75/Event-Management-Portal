import React, { useState } from "react";
import {
  GraduationCap, ShieldCheck, Plus, Edit2, Trash2,
  X, CheckCircle, XCircle, AlertTriangle, Users, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const MOCK_DEPARTMENTS = [
  { id: "1", code: "CNTT", name: "Khoa Công nghệ Thông tin", description: "Đào tạo kỹ sư CNTT", memberCount: 1200, status: "ACTIVE" },
  { id: "2", code: "QTKD", name: "Khoa Quản trị Kinh doanh", description: "Đào tạo quản trị kinh doanh", memberCount: 980, status: "ACTIVE" },
  { id: "3", code: "CK", name: "Khoa Cơ khí", description: "Đào tạo kỹ sư cơ khí", memberCount: 750, status: "ACTIVE" },
  { id: "4", code: "DT", name: "Khoa Điện tử", description: "Đào tạo kỹ sư điện tử", memberCount: 620, status: "ACTIVE" },
  { id: "5", code: "XD", name: "Khoa Xây dựng", description: "Đào tạo kỹ sư xây dựng", memberCount: 440, status: "INACTIVE" },
];

const MOCK_ROLES = [
  { id: "1", name: "SUPER_ADMIN", label: "Quản trị viên cao cấp", description: "Toàn quyền hệ thống", color: "purple", userCount: 1 },
  { id: "2", name: "ADMIN", label: "Quản trị viên", description: "Quản lý sự kiện và người dùng", color: "blue", userCount: 5 },
  { id: "3", name: "STUDENT", label: "Sinh viên", description: "Đăng ký và tham gia sự kiện", color: "cyan", userCount: 3420 },
  { id: "4", name: "GUEST", label: "Khách", description: "Xem sự kiện công khai", color: "slate", userCount: 89 },
];

const ROLE_COLORS = {
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  green: "bg-green-100 text-green-700 border-green-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

const AdminDepartmentsRolesPage = () => {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("roles") ? "roles" : "departments"
  );

  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deptForm, setDeptForm] = useState({ code: "", name: "", description: "", status: "ACTIVE" });
  const [roleForm, setRoleForm] = useState({ name: "", label: "", description: "", color: "blue" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3000);
  };

  const openCreateDept = () => {
    setDeptForm({ code: "", name: "", description: "", status: "ACTIVE" });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditDept = (d) => {
    setDeptForm({ ...d });
    setSelectedItem(d);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openCreateRole = () => {
    setRoleForm({ name: "", label: "", description: "", color: "blue" });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditRole = (r) => {
    setRoleForm({ ...r });
    setSelectedItem(r);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveDept = () => {
    if (modalMode === "create") {
      setDepartments(p => [{ ...deptForm, id: Date.now().toString(), memberCount: 0 }, ...p]);
      showToast("Thêm khoa thành công!");
    } else {
      setDepartments(p => p.map(d => d.id === selectedItem.id ? { ...d, ...deptForm } : d));
      showToast("Cập nhật khoa thành công!");
    }
    setIsModalOpen(false);
  };

  const handleSaveRole = () => {
    if (modalMode === "create") {
      setRoles(p => [{ ...roleForm, id: Date.now().toString(), userCount: 0 }, ...p]);
      showToast("Thêm vai trò thành công!");
    } else {
      setRoles(p => p.map(r => r.id === selectedItem.id ? { ...r, ...roleForm } : r));
      showToast("Cập nhật vai trò thành công!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (activeTab === "departments") setDepartments(p => p.filter(d => d.id !== itemToDelete.id));
    else setRoles(p => p.filter(r => r.id !== itemToDelete.id));
    showToast("Xóa thành công!");
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6 bg-slate-50/50 min-h-screen p-6">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}>
            {toast.type === "success"
              ? <CheckCircle className="text-emerald-500" size={20} />
              : <XCircle className="text-rose-500" size={20} />}
            <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>{toast.message}</p>
            <button onClick={() => setToast(p => ({ ...p, show: false }))} className="cursor-pointer">
              <X size={16} className="text-slate-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Khoa & Vai trò</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý đơn vị và phân quyền hệ thống</p>
        </div>
        <button
          onClick={activeTab === "departments" ? openCreateDept : openCreateRole}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all cursor-pointer active:scale-95"
        >
          <Plus size={18} /> {activeTab === "departments" ? "Thêm khoa" : "Thêm vai trò"}
        </button>
      </div>

      <div className="flex bg-white border border-slate-200 rounded-2xl p-1 w-fit">
        {[
          { key: "departments", label: "Quản lý Khoa", icon: GraduationCap },
          { key: "roles", label: "Quản lý Vai trò", icon: ShieldCheck },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === key ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-700"}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{dept.code}</span>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{dept.name}</h3>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${dept.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                  {dept.status === "ACTIVE" ? "Hoạt động" : "Vô hiệu"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{dept.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users size={13} />
                  <span className="font-semibold">{dept.memberCount.toLocaleString()} thành viên</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEditDept(dept)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Edit2 size={15} /></button>
                  <button onClick={() => { setItemToDelete(dept); setIsDeleteOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${ROLE_COLORS[role.color] || ROLE_COLORS.slate}`}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${ROLE_COLORS[role.color] || ROLE_COLORS.slate}`}>{role.name}</span>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">{role.label}</h3>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">{role.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users size={13} />
                  <span className="font-semibold">{role.userCount.toLocaleString()} người dùng</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEditRole(role)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Edit2 size={15} /></button>
                  <button onClick={() => { setItemToDelete(role); setIsDeleteOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">
                  {activeTab === "departments"
                    ? (modalMode === "create" ? "Thêm khoa mới" : "Chỉnh sửa khoa")
                    : (modalMode === "create" ? "Thêm vai trò mới" : "Chỉnh sửa vai trò")}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"><X size={18} /></button>
              </div>

              <div className="p-7 space-y-4">
                {activeTab === "departments" ? (
                  <>
                    {[
                      { label: "Mã khoa", field: "code", placeholder: "VD: CNTT" },
                      { label: "Tên khoa", field: "name", placeholder: "Nhập tên khoa" },
                      { label: "Mô tả", field: "description", placeholder: "Nhập mô tả" },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">{label}</label>
                        <input value={deptForm[field] || ""} onChange={e => setDeptForm(p => ({ ...p, [field]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-blue-500 transition-all" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Trạng thái</label>
                      <select value={deptForm.status} onChange={e => setDeptForm(p => ({ ...p, status: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 cursor-pointer">
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Vô hiệu</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      { label: "Tên vai trò (key)", field: "name", placeholder: "VD: ORGANIZER" },
                      { label: "Tên hiển thị", field: "label", placeholder: "VD: Ban tổ chức" },
                      { label: "Mô tả", field: "description", placeholder: "Nhập mô tả quyền hạn" },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">{label}</label>
                        <input value={roleForm[field] || ""} onChange={e => setRoleForm(p => ({ ...p, [field]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-blue-500 transition-all" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Màu sắc</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(ROLE_COLORS).map(c => (
                          <button key={c} onClick={() => setRoleForm(p => ({ ...p, color: c }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${roleForm.color === c ? "ring-2 ring-offset-1 ring-blue-500" : ""} ${ROLE_COLORS[c]}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="px-7 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 cursor-pointer">Hủy</button>
                <button onClick={activeTab === "departments" ? handleSaveDept : handleSaveRole}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-200">
                  {modalMode === "create" ? "Thêm mới" : "Lưu thay đổi"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteOpen && itemToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-rose-500" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Xác nhận xóa?</h2>
              <p className="text-slate-500 text-sm mb-6">
                Bạn chắc chắn muốn xóa <span className="font-bold text-slate-700">"{itemToDelete.name || itemToDelete.label}"</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 border border-slate-100 cursor-pointer">Hủy</button>
                <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl font-bold bg-rose-500 text-white hover:bg-rose-600 cursor-pointer">Xóa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDepartmentsRolesPage;