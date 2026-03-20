import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Filter,
  MoreHorizontal,
  Lock,
  Unlock,
  UserCog,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "ORGANIZER",
  "MEMBER",
  "STUDENT",
  "GUEST",
  "EVENT_PARTICIPANT",
];
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
const API_BASE_URL = "http://localhost:8082/api/admin/accounts";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
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

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      console.log("Fetching accounts with headers:", headers);

      const res = await fetch(API_BASE_URL, { headers });
      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch error:", res.status, errorText);
        showToast(
          `Lỗi tải dữ liệu: ${res.status} - ${errorText.slice(0, 100)}`,
          "error",
        );
        return;
      }

      const data = await res.json();
      console.log("Raw data from backend:", data);

      const mapped = Array.isArray(data) ? data : [];
      setAccounts(mapped);
    } catch (e) {
      console.error("Fetch exception:", e);
      showToast("Lỗi kết nối server: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filtered = useMemo(
    () =>
      accounts.filter((a) => {
        const searchLower = searchTerm.toLowerCase();
        const matchSearch =
          (a.fullName || "").toLowerCase().includes(searchLower) ||
          (a.username || "").toLowerCase().includes(searchLower) ||
          (a.email || "").toLowerCase().includes(searchLower);
        const matchRole =
          roleFilter === "All" || (a.roles && a.roles.includes(roleFilter));
        const matchStatus = statusFilter === "All" || a.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
      }),
    [accounts, searchTerm, roleFilter, statusFilter],
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const openCreate = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      roles: ["STUDENT"],
      status: "ACTIVE",
      password: "",
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEdit = (acc) => {
    setFormData({ ...acc });
    setSelectedAccount(acc);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (modalMode === "edit") {
      try {
        const res = await fetch(`${API_BASE_URL}/${selectedAccount.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            username: formData.username,
            roles: formData.roles,
            status: formData.status,
          }),
        });

        if (res.ok) {
          const updatedAccount = await res.json();
          setAccounts((prev) =>
            prev.map((acc) =>
              acc.id === selectedAccount.id ? updatedAccount : acc,
            ),
          );
          showToast("Cập nhật tài khoản thành công!");
          setIsModalOpen(false);
        }
      } catch (error) {
        showToast("Lỗi kết nối server!", "error");
      }
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/${accountToDelete.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setAccounts((p) => p.filter((a) => a.id !== accountToDelete.id));
        showToast("Xóa tài khoản thành công!");
      } else {
        showToast("Lỗi khi xóa tài khoản!", "error");
      }
    } catch (e) {
      showToast("Lỗi kết nối server!", "error");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  const toggleStatus = async (id) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;

    let newStatus;
    if (account.status === "ACTIVE") {
      newStatus = "PENDING";
    } else {
      newStatus = "ACTIVE";
    }

    try {
      const res = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedAcc = await res.json();
        setAccounts((p) => p.map((a) => (a.id === id ? updatedAcc : a)));
        showToast("Cập nhật trạng thái thành công!");
      } else {
        const errorText = await res.text();
        showToast(`Lỗi: ${res.status} - ${errorText}`, "error");
      }
    } catch (e) {
      showToast("Lỗi kết nối!", "error");
    }
  };

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.status === "ACTIVE").length,
    admin: accounts.filter(
      (a) =>
        (a.roles || []).includes("ADMIN") ||
        (a.roles || []).includes("SUPER_ADMIN"),
    ).length,
    student: accounts.filter((a) => (a.roles || []).includes("STUDENT")).length,
  };

  return (
    <div className="space-y-6 bg-slate-50/50 min-h-screen">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border bg-white ${toast.type === "success" ? "border-emerald-100" : "border-rose-100"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="text-emerald-500" size={20} />
            ) : (
              <XCircle className="text-rose-500" size={20} />
            )}
            <p
              className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}
            >
              {toast.message}
            </p>
            <button onClick={() => setToast((p) => ({ ...p, show: false }))}>
              <X size={16} className="text-slate-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Quản lý tài khoản
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {accounts.length} tài khoản trong hệ thống
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} /> Thêm tài khoản
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng tài khoản",
            value: stats.total,
            color: "blue",
            icon: UserCog,
          },
          {
            label: "Đang hoạt động",
            value: stats.active,
            color: "emerald",
            icon: CheckCircle,
          },
          {
            label: "Quản trị viên",
            value: stats.admin,
            color: "purple",
            icon: Shield,
          },
          {
            label: "Sinh viên",
            value: stats.student,
            color: "orange",
            icon: User,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}
              >
                <Icon size={20} className={`text-${color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm kiếm tên, username, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer font-medium"
          >
            <option value="All">Tất cả vai trò</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer font-medium"
          >
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Khóa</option>
            <option value="DISABLED">Vô hiệu hóa</option>
            <option value="PENDING">Chờ duyệt</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={36} />
              <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-16 text-center">
              <UserCog size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                Không tìm thấy tài khoản nào
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {(acc.fullName || acc.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {acc.fullName || "—"}
                          </p>
                          <p className="text-xs text-slate-400">
                            @{acc.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {acc.email || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(acc.roles || []).map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${ROLE_COLORS[r] || ROLE_COLORS.GUEST}`}
                          >
                            {ROLE_LABELS[r] || r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${acc.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : acc.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}
                      >
                        {acc.status === "ACTIVE"
                          ? "Hoạt động"
                          : acc.status === "PENDING"
                            ? "Chờ duyệt"
                            : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {acc.createdAt
                        ? new Date(acc.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => toggleStatus(acc.id)}
                          title={
                            acc.status === "ACTIVE"
                              ? "Vô hiệu hóa"
                              : "Kích hoạt"
                          }
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${acc.status === "ACTIVE" ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                        >
                          {acc.status === "ACTIVE" ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(acc)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setAccountToDelete(acc);
                            setIsDeleteOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

        {totalPages > 1 && (
          <div className="p-5 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-black ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300"} cursor-pointer`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <UserCog size={20} />
                  </div>
                  <h2 className="text-lg font-black text-slate-800">
                    {modalMode === "create"
                      ? "Thêm tài khoản mới"
                      : "Chỉnh sửa tài khoản"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-7 space-y-4">
                {[
                  {
                    label: "Họ và tên",
                    field: "fullName",
                    placeholder: "Nhập họ và tên",
                  },
                  {
                    label: "Username",
                    field: "username",
                    placeholder: "Nhập username",
                  },
                  {
                    label: "Email",
                    field: "email",
                    placeholder: "Nhập email",
                    type: "email",
                  },
                ].map(({ label, field, placeholder, type = "text" }) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={formData[field] || ""}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, [field]: e.target.value }))
                      }
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                ))}

                {modalMode === "create" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder="Nhập mật khẩu"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-blue-500 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">
                    Vai trò
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            roles: p.roles.includes(r)
                              ? p.roles.filter((x) => x !== r)
                              : [...p.roles, r],
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${formData.roles?.includes(r) ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"}`}
                      >
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, status: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 cursor-pointer"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="LOCKED">Khóa</option>
                    <option value="DISABLED">Vô hiệu hóa</option>
                    <option value="PENDING">Chờ duyệt</option>
                  </select>
                </div>
              </div>

              <div className="px-7 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-200"
                >
                  {modalMode === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteOpen && accountToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-rose-500" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">
                Xác nhận xóa?
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Bạn chắc chắn muốn xóa tài khoản{" "}
                <span className="font-bold text-slate-700">
                  "{accountToDelete.fullName || accountToDelete.username}"
                </span>
                ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 border border-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-2xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountsPage;
