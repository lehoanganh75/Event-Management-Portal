import React, { useState, useEffect } from "react";
import {
  GraduationCap, ShieldCheck, Plus, Edit2, Trash2,
  X, CheckCircle, XCircle, AlertTriangle, Users, Building2, Check, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import eventService from "../../services/eventService";

const MOCK_DEPARTMENTS = [
  { id: "1", code: "CNTT", name: "Khoa Công nghệ Thông tin", description: "Đào tạo kỹ sư CNTT", memberCount: 1200, status: "ACTIVE" },
  { id: "2", code: "QTKD", name: "Khoa Quản trị Kinh doanh", description: "Đào tạo quản trị kinh doanh", memberCount: 980, status: "ACTIVE" },
  { id: "3", code: "CK", name: "Khoa Cơ khí", description: "Đào tạo kỹ sư cơ khí", memberCount: 750, status: "ACTIVE" },
  { id: "4", code: "DT", name: "Khoa Điện tử", description: "Đào tạo kỹ sư điện tử", memberCount: 620, status: "ACTIVE" },
  { id: "5", code: "XD", name: "Khoa Xây dựng", description: "Đào tạo kỹ sư xây dựng", memberCount: 440, status: "INACTIVE" },
];

const MOCK_ROLES = [
  { id: "1", name: "SUPER_ADMIN", label: "Quản trị viên cấp cao", description: "Toàn quyền hệ thống", color: "purple", userCount: 1 },
  { id: "2", name: "ADMIN", label: "Quản trị viên", description: "Quản lý sự kiện và người dùng", color: "blue", userCount: 5 },
  { id: "3", name: "ORGANIZER", label: "Ban tổ chức", description: "Tạo và quản lý sự kiện", color: "orange", userCount: 23 },
  { id: "4", name: "MEMBER", label: "Sinh viên", description: "Tham gia sự kiện có hạn", color: "green", userCount: 156 },
  { id: "5", name: "STUDENT", label: "Sinh viên", description: "Đăng ký và tham gia sự kiện", color: "cyan", userCount: 3420 },
  { id: "6", name: "GUEST", label: "Khách", description: "Xem sự kiện công khai", color: "slate", userCount: 89 },
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

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deptForm, setDeptForm] = useState({ name: "", email: "", phone: "", officeLocation: "", type: "CLUB", description: "", logoUrl: "" });
  const [roleForm, setRoleForm] = useState({ name: "", label: "", description: "", color: "blue" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3000);
  };

  const fetchOrgs = async () => {
    try {
      const res = await eventService.getAllOrganizations();
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
      showToast("Không thể tải danh sách đơn vị tổ chức", "error");
    }
  };

  useEffect(() => {
    if (activeTab === "departments") {
      fetchOrgs();
    }
  }, [activeTab]);

  const handleUpdateStatus = async (orgId, status) => {
    try {
      await eventService.updateOrganizationStatus(orgId, status);
      showToast("Cập nhật trạng thái thành công!");
      fetchOrgs();
    } catch (err) {
      console.error(err);
      showToast("Không thể cập nhật trạng thái đơn vị", "error");
    }
  };

  const openCreateDept = () => {
    setDeptForm({ name: "", email: "", phone: "", officeLocation: "", type: "CLUB", description: "", logoUrl: "" });
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

  const handleSaveDept = async () => {
    if (!deptForm.name || !deptForm.email) {
      showToast("Vui lòng điền tên và email đơn vị", "error");
      return;
    }
    try {
      if (modalMode === "create") {
        await eventService.createOrganization({
          ...deptForm,
          status: "APPROVED" // Admins create auto-approved orgs
        });
        showToast("Thêm đơn vị thành công!");
      } else {
        // Mock success message since we edit state for demo
        showToast("Cập nhật đơn vị thành công!");
      }
      setIsModalOpen(false);
      fetchOrgs();
    } catch (err) {
      console.error(err);
      showToast("Có lỗi xảy ra khi lưu đơn vị", "error");
    }
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
    if (activeTab === "departments") {
      // For real orgs, deleting can be done by status = SUSPENDED, or mock delete
      setDepartments(p => p.filter(d => d.id !== itemToDelete.id));
    } else {
      setRoles(p => p.filter(r => r.id !== itemToDelete.id));
    }
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
          <h2 className="text-base font-black text-slate-800 tracking-tight uppercase">
            {activeTab === "departments" ? "Cơ cấu tổ chức" : "Phân quyền hệ thống"}
          </h2>
          <p className="text-slate-400 text-[11px] mt-0.5">
            {activeTab === "departments"
              ? "Quản lý đơn vị tổ chức trong hệ thống"
              : "Quản lý vai trò và phân quyền tài khoản người dùng"}
          </p>
        </div>
        <button
          onClick={activeTab === "departments" ? openCreateDept : openCreateRole}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all cursor-pointer active:scale-95 text-xs"
        >
          <Plus size={18} /> {activeTab === "departments" ? "Thêm đơn vị" : "Thêm vai trò"}
        </button>
      </div>
 
      {activeTab === "departments" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Đơn vị</th>
                  <th className="px-4 py-3">Phân loại</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Địa điểm</th>
                  <th className="px-4 py-3">Người sở hữu</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Phê duyệt yêu cầu</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {departments.map((dept) => {
                  let statusClass = "bg-slate-50 text-slate-500 border-slate-200";
                  let statusText = "Khác";
                  if (dept.status === "APPROVED") {
                    statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    statusText = "Hoạt động";
                  } else if (dept.status === "PENDING") {
                    statusClass = "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
                    statusText = "Chờ duyệt";
                  } else if (dept.status === "REJECTED") {
                    statusClass = "bg-rose-50 text-rose-700 border-rose-200";
                    statusText = "Từ chối";
                  } else if (dept.status === "SUSPENDED") {
                    statusClass = "bg-slate-50 text-slate-500 border-slate-200";
                    statusText = "Đình chỉ";
                  }
 
                  return (
                    <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Đơn vị */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {dept.logoUrl ? (
                            <img
                              src={dept.logoUrl}
                              alt={dept.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                              <Building2 size={18} className="text-blue-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800 leading-snug text-xs max-w-[200px] line-clamp-2">{dept.name}</div>
                            {dept.description && (
                              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 max-w-[180px]">
                                {dept.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
 
                      {/* Loại hình */}
                      <td className="px-4 py-3">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
                          {dept.type || "ORGANIZATION"}
                        </span>
                      </td>
 
                      {/* Liên hệ */}
                      <td className="px-4 py-3">
                        <div className="text-xs space-y-0.5 whitespace-nowrap">
                          <p className="text-slate-600 font-medium">{dept.email}</p>
                          {dept.phone && <p className="text-slate-400 text-[10px]">{dept.phone}</p>}
                        </div>
                      </td>
 
                      {/* Văn phòng / Địa điểm */}
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        <div className="max-w-[150px] line-clamp-2 leading-relaxed">
                          {dept.officeLocation || <span className="text-slate-300">-</span>}
                        </div>
                      </td>
 
                      {/* Người sở hữu */}
                      <td className="px-4 py-3">
                        {dept.ownerName ? (
                          <div className="text-xs space-y-0.5 whitespace-nowrap">
                            <p className="font-bold text-slate-800 leading-none mb-1">
                              {dept.ownerName}
                            </p>
                            <p className="text-slate-500 text-[10px]">{dept.ownerEmail}</p>
                            {dept.ownerPhone && (
                              <p className="text-slate-400 text-[9px]">{dept.ownerPhone}</p>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-[10px] text-slate-400">
                            {dept.ownerAccountId || "Hệ thống"}
                          </span>
                        )}
                      </td>
 
                      {/* Trạng thái */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border whitespace-nowrap ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>
 
                      {/* Phê duyệt yêu cầu */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {dept.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(dept.id, "APPROVED")}
                                className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-emerald-100 whitespace-nowrap"
                                title="Chấp nhận yêu cầu"
                              >
                                <Check size={12} /> Duyệt
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(dept.id, "REJECTED")}
                                className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-100 whitespace-nowrap"
                                title="Từ chối yêu cầu"
                              >
                                <X size={12} /> Từ chối
                              </button>
                            </>
                          ) : dept.status === "APPROVED" ? (
                            <button
                              onClick={() => handleUpdateStatus(dept.id, "SUSPENDED")}
                              className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                              title="Tạm đình chỉ hoạt động"
                            >
                              <ShieldAlert size={12} className="text-amber-500" /> Đình chỉ
                            </button>
                          ) : dept.status === "SUSPENDED" ? (
                            <button
                              onClick={() => handleUpdateStatus(dept.id, "APPROVED")}
                              className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                              title="Kích hoạt lại hoạt động"
                            >
                              <Check size={12} /> Kích hoạt lại
                            </button>
                          ) : dept.status === "REJECTED" ? (
                            <button
                              onClick={() => handleUpdateStatus(dept.id, "APPROVED")}
                              className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                              title="Xét duyệt lại"
                            >
                              Duyệt lại
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </td>
 
                      {/* Thao tác */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEditDept(dept)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(dept);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa đơn vị"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                    ? (modalMode === "create" ? "Thêm đơn vị mới" : "Chỉnh sửa đơn vị")
                    : (modalMode === "create" ? "Thêm vai trò mới" : "Chỉnh sửa vai trò")}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"><X size={18} /></button>
              </div>

              <div className="p-7 space-y-4 max-h-[70vh] overflow-y-auto">
                {activeTab === "departments" ? (
                  <>
                    {[
                      { label: "Tên đơn vị / CLB *", field: "name", placeholder: "VD: CLB Tin học" },
                      { label: "Email liên hệ *", field: "email", placeholder: "VD: email@domain.com" },
                      { label: "Số điện thoại", field: "phone", placeholder: "Nhập số điện thoại" },
                      { label: "Văn phòng / Địa điểm", field: "officeLocation", placeholder: "VD: Phòng H3.1" },
                      { label: "Ảnh logo (URL)", field: "logoUrl", placeholder: "Nhập link ảnh logo" },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">{label}</label>
                        <input value={deptForm[field] || ""} onChange={e => setDeptForm(p => ({ ...p, [field]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-blue-500 transition-all" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Loại hình</label>
                      <select value={deptForm.type} onChange={e => setDeptForm(p => ({ ...p, type: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 cursor-pointer focus:bg-white focus:border-blue-500 transition-all">
                        <option value="CLUB">Câu lạc bộ</option>
                        <option value="FACULTY">Khoa / Viện</option>
                        <option value="DEPARTMENT">Phòng ban</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Mô tả ngắn</label>
                      <textarea value={deptForm.description || ""} onChange={e => setDeptForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Nhập mô tả hoạt động..." rows={3}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-blue-500 transition-all resize-none" />
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
