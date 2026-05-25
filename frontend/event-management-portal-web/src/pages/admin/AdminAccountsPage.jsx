import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  UserCog,
  Lock,
  Unlock,
  Mail,
  Fingerprint,
  Users,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { showToast } from "../../utils/toast.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/common/ConfirmModal";

// Nguồn duy nhất cho danh sách role — mỗi tài khoản chỉ có đúng 1 role
const ROLE_LABELS = {
  SUPER_ADMIN: "Quản trị viên cấp cao",
  ADMIN: "Quản trị viên",
  LECTURER: "Giảng viên",
  STUDENT: "Sinh viên",
  GUEST: "Khách",
};

const ROLE_COLORS = {
  SUPER_ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  LECTURER: "bg-teal-50 text-teal-700 border-teal-200",
  STUDENT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  GUEST: "bg-slate-50 text-slate-600 border-slate-200",
};

const ITEMS_PER_PAGE = 8;

const AdminAccountsPage = ({ restrictRoles }) => {
  const {
    accounts,
    fetchAccounts,
    updateAccount,
    createAccount,
    deleteAccount,
    updateAccountStatus,
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [accountToUpdateStatus, setAccountToUpdateStatus] = useState(null);

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

  // Lấy danh sách role từ ROLE_LABELS — nguồn duy nhất, không dùng array riêng
  const allRoles = Object.keys(ROLE_LABELS);
  const displayRoles = restrictRoles
    ? allRoles.filter((r) => restrictRoles.includes(r))
    : allRoles;

  const allowedAccounts = restrictRoles
    ? (accounts || []).filter((a) => restrictRoles.includes(a.role))
    : accounts || [];

  const stats = useMemo(
    () => ({
      total: allowedAccounts.length,
      active: allowedAccounts.filter((a) => a.status === "ACTIVE").length,
      admin: allowedAccounts.filter((a) =>
        ["ADMIN", "SUPER_ADMIN", "LECTURER"].includes(a.role)
      ).length,
      student: allowedAccounts.filter((a) => a.role === "STUDENT").length,
      guest: allowedAccounts.filter((a) => a.role === "GUEST").length,
      locked: allowedAccounts.filter((a) => a.status !== "ACTIVE").length,
    }),
    [allowedAccounts]
  );

  const filtered = useMemo(() => {
    return allowedAccounts.filter((a) => {
      const s = searchTerm.toLowerCase();

      const matchSearch =
        (a.fullName || "").toLowerCase().includes(s) ||
        (a.username || "").toLowerCase().includes(s) ||
        (a.email || "").toLowerCase().includes(s);

      const matchRole = roleFilter === "All" || a.role === roleFilter;

      let matchTab = true;

      if (activeTab === "Đang hoạt động") matchTab = a.status === "ACTIVE";
      if (activeTab === "Đang bị khóa") matchTab = a.status !== "ACTIVE";
      if (activeTab === "Quản trị")
        matchTab = ["ADMIN", "SUPER_ADMIN", "LECTURER"].includes(a.role);
      if (activeTab === "Sinh viên") matchTab = a.role === "STUDENT";
      if (activeTab === "Khách") matchTab = a.role === "GUEST";

      return matchSearch && matchRole && matchTab;
    });
  }, [allowedAccounts, searchTerm, roleFilter, activeTab]);

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const openCreate = () => {
    setSelectedAccount(null);
    setFormData({
      username: "",
      password: "",
      email: "",
      fullName: "",
      role: restrictRoles && restrictRoles.length > 0 ? restrictRoles[0] : "STUDENT",
      status: "ACTIVE",
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

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
      if (modalMode === "create") {
        if (!formData.username || !formData.password || !formData.email || !formData.fullName) {
          showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
          return;
        }
        await createAccount(formData);
        showToast("Thêm tài khoản mới thành công!", "success");
      } else if (modalMode === "edit") {
        await updateAccount(selectedAccount.id, formData);
        showToast("Cập nhật thành công!", "success");
      }

      setIsModalOpen(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Thao tác thất bại";
      showToast(errorMsg, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await deleteAccount(accountToDelete.id);
      showToast("Xóa tài khoản thành công!", "success");
      setIsDeleteOpen(false);
    } catch (error) {
      showToast(
        "Xóa thất bại: " + (error.response?.data?.message || error.message),
        "error"
      );
    }
  };

  const handleConfirmUpdateStatus = async () => {
    if (!accountToUpdateStatus) return;

    try {
      const isLocking = accountToUpdateStatus.status === "ACTIVE";
      await updateAccountStatus(accountToUpdateStatus.id);
      showToast(
        isLocking
          ? "Đã khóa tài khoản thành công!"
          : "Đã mở khóa tài khoản thành công!",
        "success"
      );
      setIsStatusConfirmOpen(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      showToast("Cập nhật trạng thái thất bại: " + errorMsg, "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-left text-slate-800">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <UserCog size={21} />
          </div>

          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-800">
              Quản lý tài khoản
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Quản lý người dùng, vai trò và trạng thái tài khoản
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          Thêm tài khoản
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          {
            label: "Tổng tài khoản",
            value: stats.total,
            icon: Users,
            className: "bg-blue-600",
          },
          {
            label: "Đang hoạt động",
            value: stats.active,
            icon: CheckCircle,
            className: "bg-emerald-600",
          },
          {
            label: "Quản trị viên",
            value: stats.admin,
            icon: ShieldCheck,
            className: "bg-purple-600",
          },
          {
            label: "Sinh viên",
            value: stats.student,
            icon: User,
            className: "bg-indigo-600",
          },
          {
            label: "Đã khóa",
            value: stats.locked,
            icon: ShieldAlert,
            className: "bg-slate-700",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`${item.className} rounded-xl border border-white/10 p-5 text-white`}
            >
              <div className="flex items-center gap-3">
                <Icon size={26} className="opacity-85" />
                <div>
                  <p className="text-sm opacity-90">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-1">
        {[
          { id: "Tất cả", label: "Tất cả", icon: Users, count: stats.total, show: true },
          {
            id: "Quản trị",
            label: "Quản trị",
            icon: ShieldCheck,
            count: stats.admin,
            show:
              !restrictRoles ||
              restrictRoles.some((r) =>
                ["ADMIN", "SUPER_ADMIN", "LECTURER"].includes(r)
              ),
          },
          {
            id: "Sinh viên",
            label: "Sinh viên",
            icon: User,
            count: stats.student,
            show: !restrictRoles || restrictRoles.includes("STUDENT"),
          },
          {
            id: "Khách",
            label: "Khách",
            icon: User,
            count: stats.guest,
            show: !restrictRoles || restrictRoles.includes("GUEST"),
          },
          {
            id: "Đang hoạt động",
            label: "Đang hoạt động",
            icon: CheckCircle2,
            count: stats.active,
            show: true,
          },
          {
            id: "Đang bị khóa",
            label: "Đang bị khóa",
            icon: Lock,
            count: stats.locked,
            show: true,
          },
        ]
          .filter((t) => t.show)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-2.5 text-[14px] font-medium transition-colors ${activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
            >
              <tab.icon size={16} />
              {tab.label}

              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${activeTab === tab.id
                    ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-500"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />

          <input
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500"
            placeholder="Tìm theo tên, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="min-w-[180px] cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">Tất cả vai trò</option>
          {displayRoles.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearchTerm("");
            setRoleFilter("All");
            setActiveTab("Tất cả");
          }}
          className="rounded-lg bg-slate-800 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-900"
        >
          Đặt lại
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {!accounts ? (
          <div className="flex flex-col items-center gap-3 p-20 text-center">
            <Loader2 className="animate-spin text-blue-600" size={36} />
            <p className="font-medium text-slate-500">
              Đang tải danh sách người dùng...
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 text-left font-semibold text-slate-600">
                  Người dùng
                </th>
                <th className="p-4 text-left font-semibold text-slate-600">
                  Email
                </th>
                <th className="p-4 text-left font-semibold text-slate-600">
                  Vai trò
                </th>
                <th className="p-4 text-center font-semibold text-slate-600">
                  Trạng thái
                </th>
                <th className="p-4 text-center font-semibold text-slate-600">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((acc) => (
                  <tr key={acc.id} className="transition-colors hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-sm font-semibold text-blue-600">
                          {(acc.fullName || acc.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {acc.fullName || "—"}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-400">
                            <Fingerprint size={11} />
                            {acc.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-medium text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-300" />
                        {acc.email || "—"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${ROLE_COLORS[acc.role] || "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                      >
                        {ROLE_LABELS[acc.role] || acc.role}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium ${acc.status === "ACTIVE"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                      >
                        {acc.status === "ACTIVE" ? (
                          <CheckCircle size={11} />
                        ) : (
                          <XCircle size={11} />
                        )}
                        {acc.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setAccountToUpdateStatus(acc);
                            setIsStatusConfirmOpen(true);
                          }}
                          className={`rounded-md p-2 transition-colors ${acc.status === "ACTIVE"
                              ? "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                              : "text-amber-500 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                          title={acc.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                        >
                          {acc.status === "ACTIVE" ? (
                            <Lock size={18} />
                          ) : (
                            <Unlock size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => openEdit(acc)}
                          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit2 size={18} />
                        </button>

                        <button
                          onClick={() => {
                            setAccountToDelete(acc);
                            setIsDeleteOpen(true);
                          }}
                          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-500">
                    Không tìm thấy tài khoản nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-sm font-extrabold text-slate-700 shadow-sm select-none">
            {currentPage}/{totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 p-4">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {modalMode === "edit"
                    ? "Cập nhật tài khoản"
                    : "Thêm tài khoản mới"}
                </h3>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 p-6">
                {modalMode === "create" ? (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      Tên đăng nhập
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition-colors focus:border-blue-500"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Nhập tên đăng nhập..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      Tên đăng nhập
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-400 outline-none cursor-not-allowed"
                      value={formData.username}
                      disabled
                    />
                  </div>
                )}

                {modalMode === "create" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition-colors focus:border-blue-500"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Nhập mật khẩu..."
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Họ và tên
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition-colors focus:border-blue-500"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Email liên hệ
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition-colors focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Vai trò hệ thống
                  </label>
                  <select
                    className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 outline-none transition-colors focus:border-blue-500"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    {displayRoles.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Lưu thông tin
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tài khoản?"
        message={`Tài khoản @${accountToDelete?.username} sẽ bị gỡ bỏ vĩnh viễn. Hành động này không thể hoàn tác.`}
        confirmText="Xóa vĩnh viễn"
        type="danger"
      />

      <ConfirmModal
        isOpen={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        onConfirm={handleConfirmUpdateStatus}
        title={
          accountToUpdateStatus?.status === "ACTIVE"
            ? "Khóa tài khoản?"
            : "Mở khóa tài khoản?"
        }
        message={
          accountToUpdateStatus?.status === "ACTIVE"
            ? `Bạn có chắc chắn muốn khóa tài khoản @${accountToUpdateStatus?.username}? Người dùng này sẽ bị đăng xuất ngay lập tức.`
            : `Xác nhận mở khóa cho tài khoản @${accountToUpdateStatus?.username}?`
        }
        confirmText={
          accountToUpdateStatus?.status === "ACTIVE" ? "Khóa ngay" : "Mở khóa"
        }
        type={accountToUpdateStatus?.status === "ACTIVE" ? "warning" : "info"}
      />
    </div>
  );
};

export default AdminAccountsPage;