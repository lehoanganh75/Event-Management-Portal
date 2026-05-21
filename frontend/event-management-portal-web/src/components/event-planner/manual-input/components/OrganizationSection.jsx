import React, { useState } from "react";
import {
  Building,
  Sparkles,
  UserPlus,
  Search,
  UserCheck,
  Plus,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  Field,
  Input,
  Select,
  Textarea,
  AISuggestionBox,
} from "./BaseUI.jsx";
import ImageUpload from "../../../common/ImageUpload.jsx";
import { useAuth } from "../../../../context/AuthContext";
import eventService from "../../../../services/eventService";
import { toast } from "react-toastify";

export const ORGANIZER_ROLES = [
  { value: "LEADER", label: "Trưởng ban" },
  { value: "COORDINATOR", label: "Điều phối viên" },
  { value: "MEMBER", label: "Thành viên" },
  { value: "ADVISOR", label: "Cố vấn" },
];

const OrganizationSection = ({
  formData,
  setFormData,
  errors,
  orgs,
  showOrgAISuggestions,
  setShowOrgAISuggestions,
  showUserSuggestions,
  setShowUserSuggestions,
  systemUsers,
  loadingUsers,
  searchKey,
  setSearchKey,
  fetchUsers,
  addInvite,
  updateInvite,
  removeInvite,
  confirmInvite,
  term,
}) => {
  const { user } = useAuth();

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: "", email: "", phone: "", officeLocation: "", type: "CLUB", logoUrl: "", description: "" });
  const [isSubmittingOrg, setIsSubmittingOrg] = useState(false);

  /**
   * Lọc danh sách organization dựa trên quyền của user:
   * - ADMIN / SUPER_ADMIN / LECTURER: thấy tất cả orgs (Lecturer thấy APPROVED)
   * - STUDENT / GUEST: chỉ thấy các orgs do mình làm chủ và đã được duyệt (APPROVED)
   */
  const isStudent = user?.role?.toUpperCase() === "STUDENT";

  const displayedOrgs = isStudent
    ? orgs.filter((org) =>
        org.ownerAccountId === (user?.accountId || user?.id) &&
        (org.status === "APPROVED" || !org.status)
      )
    : orgs.filter((org) =>
        org.status === "APPROVED" ||
        !org.status ||
        ["ADMIN", "SUPER_ADMIN"].includes(user?.role?.toUpperCase())
      );

  const isSelectionModeNew = !isStudent && formData.orgSelectionMode === "new";

  const filteredUsers = systemUsers.filter(
    (u) =>
      (u.profile?.fullName || "")
        .toLowerCase()
        .includes(searchKey.toLowerCase()) ||
      (u.email || "")
        .toLowerCase()
        .includes(searchKey.toLowerCase()) ||
      (u.username || "")
        .toLowerCase()
        .includes(searchKey.toLowerCase())
  );

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
          <Building size={18} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Ban tổ chức
          </h2>
          <p className="text-sm text-slate-500">
            Quản lý đơn vị và thành viên tổ chức
          </p>
        </div>
      </div>

      {/* Mode */}
      {!isStudent && (
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="radio"
              name="orgMode"
              checked={formData.orgSelectionMode !== "new"}
              onChange={() =>
                setFormData({
                  ...formData,
                  orgSelectionMode: "existing",
                })
              }
              className="w-4 h-4"
            />
            Chọn từ hệ thống
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="radio"
              name="orgMode"
              checked={formData.orgSelectionMode === "new"}
              onChange={() =>
                setFormData({
                  ...formData,
                  orgSelectionMode: "new",
                })
              }
              className="w-4 h-4"
            />
            Tạo mới
          </label>
        </div>
      )}

      {/* Existing organization */}
      {!isSelectionModeNew ? (
        <div className="space-y-3">
          <Field
            id="field-organizationId"
            label="Đơn vị tổ chức"
            required
            error={errors.organizationId}
          >
            <Select
              value={formData.organizationId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  organizationId: e.target.value,
                })
              }
            >
              <option value="">-- Chọn đơn vị --</option>
              {displayedOrgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </Select>
          </Field>

          {/* Hiển thị khi STUDENT / GUEST chưa có tổ chức nào APPROVED */}
          {isStudent && displayedOrgs.length === 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">Bạn chưa có tổ chức / CLB nào được phê duyệt</p>
                <p className="text-xs text-amber-700 mt-0.5">Hãy thành lập một tổ chức mới và chờ Admin phê duyệt để có thể tạo sự kiện.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrgForm({ name: "", email: "", phone: "", officeLocation: "", type: "CLUB", logoUrl: "", description: "" });
                  setIsOrgModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shrink-0 shadow-sm"
              >
                <Plus size={13} />
                Thành lập tổ chức / CLB
              </button>
            </div>
          )}

          {/* Nút thành lập thêm khi đã có org nhưng muốn tạo thêm (STUDENT/GUEST) */}
          {isStudent && displayedOrgs.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setOrgForm({ name: "", email: "", phone: "", officeLocation: "", type: "CLUB", logoUrl: "", description: "" });
                setIsOrgModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
            >
              <Plus size={13} />
              Thành lập thêm tổ chức / CLB mới
            </button>
          )}

          {/* Modal Thành lập tổ chức */}
          {isOrgModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div onClick={() => setIsOrgModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
              <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Thành lập tổ chức / CLB</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Yêu cầu thành lập ban tổ chức hoặc câu lạc bộ mới</p>
                  </div>
                  <button onClick={() => setIsOrgModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"><X size={18} /></button>
                </div>

                <div className="p-7 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Tên tổ chức / CLB *</label>
                      <input value={orgForm.name} onChange={e => setOrgForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: CLB Tin học - IUH" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Email liên hệ *</label>
                      <input value={orgForm.email} onChange={e => setOrgForm(p => ({ ...p, email: e.target.value }))} placeholder="VD: clbtinhoc@iuh.edu.vn" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Số điện thoại</label>
                      <input value={orgForm.phone} onChange={e => setOrgForm(p => ({ ...p, phone: e.target.value }))} placeholder="VD: 0987654321" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Văn phòng / Địa điểm</label>
                      <input value={orgForm.officeLocation} onChange={e => setOrgForm(p => ({ ...p, officeLocation: e.target.value }))} placeholder="VD: Phòng H3.1" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Loại hình</label>
                      <select value={orgForm.type} onChange={e => setOrgForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 cursor-pointer focus:bg-white focus:border-indigo-500 transition-all">
                        <option value="CLUB">Câu lạc bộ</option>
                        <option value="FACULTY">Khoa / Viện</option>
                        <option value="DEPARTMENT">Phòng ban</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Ảnh đại diện / Logo (URL)</label>
                      <input value={orgForm.logoUrl} onChange={e => setOrgForm(p => ({ ...p, logoUrl: e.target.value }))} placeholder="Nhập link ảnh logo hoặc để trống" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Mô tả giới thiệu</label>
                    <textarea value={orgForm.description} onChange={e => setOrgForm(p => ({ ...p, description: e.target.value }))} placeholder="Giới thiệu mục tiêu hoạt động của CLB/Tổ chức..." rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all resize-none" />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-xs font-bold text-slate-500 mb-1.5">Thành viên sáng lập / Ban chủ nhiệm mặc định:</span>
                    <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="block text-sm font-bold text-slate-700">{user?.fullName || user?.username}</span>
                        <span className="block text-xs text-slate-500">{user?.email}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-black uppercase">Người tạo / Trưởng ban</span>
                    </div>
                  </div>
                </div>

                <div className="px-7 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                  <button onClick={() => setIsOrgModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 cursor-pointer">Hủy</button>
                  <button
                    disabled={isSubmittingOrg}
                    onClick={async () => {
                      if (!orgForm.name || !orgForm.email) {
                        toast.error("Vui lòng nhập đầy đủ các trường bắt buộc (*)");
                        return;
                      }
                      setIsSubmittingOrg(true);
                      try {
                        await eventService.createOrganization({
                          ...orgForm,
                          ownerAccountId: user?.accountId || user?.id
                        });
                        toast.success("Yêu cầu thành lập đã được gửi, vui lòng chờ Admin phê duyệt!");
                        setIsOrgModalOpen(false);
                      } catch (err) {
                        toast.error("Không thể tạo yêu cầu thành lập");
                        console.error(err);
                      } finally {
                        setIsSubmittingOrg(false);
                      }
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 cursor-pointer shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    {isSubmittingOrg ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Thông tin ban tổ chức
            </h3>

            <button
              onClick={() =>
                setShowOrgAISuggestions(!showOrgAISuggestions)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors"
            >
              <Sparkles size={13} />
              AI gợi ý
            </button>
          </div>

          {showOrgAISuggestions && (
            <AISuggestionBox
              title="Mẫu ban tổ chức"
              suggestions={[
                {
                  label: "CLB Kỹ năng - IUH",
                  data: {
                    name: "CLB Kỹ năng - IUH",
                    email: "kynang@iuh.edu.vn",
                    type: "CLUB",
                    officeLocation: "Phòng H3.1",
                  },
                },
                {
                  label: "Khoa CNTT - IUH",
                  data: {
                    name: "Khoa Công nghệ Thông tin",
                    email: "fit@iuh.edu.vn",
                    type: "FACULTY",
                    officeLocation: "Lầu 2, Nhà H",
                  },
                },
                {
                  label: "Đoàn Thanh niên IUH",
                  data: {
                    name: "Đoàn Thanh niên IUH",
                    email: "doanthanhnien@iuh.edu.vn",
                    type: "DEPARTMENT",
                    officeLocation: "Tòa nhà V",
                  },
                },
              ]}
              onSelect={(s) => {
                setFormData({
                  ...formData,
                  newOrg: {
                    ...formData.newOrg,
                    ...s.data,
                  },
                });
                setShowOrgAISuggestions(false);
              }}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              id="field-newOrgName"
              label="Tên ban tổ chức"
              required
              error={errors.newOrgName}
            >
              <Input
                placeholder="VD: CLB Kỹ năng mềm"
                value={formData.newOrg?.name || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newOrg: {
                      ...formData.newOrg,
                      name: e.target.value,
                    },
                  })
                }
              />
            </Field>

            <Field
              id="field-newOrgEmail"
              label="Email liên hệ"
              required
              error={errors.newOrgEmail}
            >
              <Input
                type="email"
                placeholder="vd@iuh.edu.vn"
                value={formData.newOrg?.email || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newOrg: {
                      ...formData.newOrg,
                      email: e.target.value,
                    },
                  })
                }
              />
            </Field>

            <Field label="Số điện thoại">
              <Input
                placeholder="0xxx..."
                value={formData.newOrg?.phone || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newOrg: {
                      ...formData.newOrg,
                      phone: e.target.value,
                    },
                  })
                }
              />
            </Field>

            <Field label="Văn phòng">
              <Input
                placeholder="VD: Phòng H3.1"
                value={formData.newOrg?.officeLocation || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newOrg: {
                      ...formData.newOrg,
                      officeLocation: e.target.value,
                    },
                  })
                }
              />
            </Field>

            <Field label="Loại hình">
              <Select
                value={formData.newOrg?.type || "OTHER"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newOrg: {
                      ...formData.newOrg,
                      type: e.target.value,
                    },
                  })
                }
              >
                <option value="FACULTY">Khoa / Viện</option>
                <option value="CLUB">Câu lạc bộ</option>
                <option value="DEPARTMENT">Phòng ban</option>
                <option value="COMPANY">Doanh nghiệp</option>
                <option value="OTHER">Khác</option>
              </Select>
            </Field>

            <Field label="Logo">
              <ImageUpload
                value={formData.newOrg?.logoUrl}
                onChange={(url) =>
                  setFormData({
                    ...formData,
                    newOrg: {
                      ...formData.newOrg,
                      logoUrl: url,
                    },
                  })
                }
              />
            </Field>
          </div>

          <Field label="Mô tả">
            <Textarea
              placeholder="Giới thiệu ngắn gọn..."
              value={formData.newOrg?.description || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  newOrg: {
                    ...formData.newOrg,
                    description: e.target.value,
                  },
                })
              }
            />
          </Field>
        </div>
      )}

      {/* Members */}
      <div className="pt-2 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Thành viên tổ chức
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mời và quản lý thành viên
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!showUserSuggestions) fetchUsers();
                setShowUserSuggestions(!showUserSuggestions);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-200 bg-white text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors"
            >
              <Sparkles size={13} />
              AI gợi ý
            </button>

            <button
              onClick={() => addInvite()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              <Plus size={13} />
              Thêm
            </button>
          </div>
        </div>

        {showUserSuggestions && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="relative mb-4">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <Input
                placeholder="Tìm kiếm thành viên..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
              {loadingUsers ? (
                <div className="md:col-span-2 py-8 text-center text-sm text-slate-400">
                  Đang tải danh sách...
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      addInvite(u);
                      setShowUserSuggestions(false);
                      setSearchKey("");
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <UserCheck size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {u.profile?.fullName || u.username}
                      </p>

                      <p className="text-xs text-slate-500 truncate">
                        {u.email}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="md:col-span-2 py-8 text-center text-sm text-slate-400">
                  Không tìm thấy người dùng phù hợp
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {(formData.invitations || []).map((invite, idx) =>
            invite.isConfirmed ? (
              <div
                key={idx}
                className="flex items-center gap-4 py-4 border-b border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <UserCheck size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {invite.inviteeName ||
                      invite.inviteeEmail?.split("@")[0]}
                  </p>

                  <p className="text-xs text-slate-500">
                    {invite.inviteeEmail}
                  </p>
                </div>

                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs">
                  {
                    ORGANIZER_ROLES.find(
                      (r) => r.value === invite.targetRole
                    )?.label
                  }
                </span>

                 {!(
                  invite.isCreator ||
                  invite.isOrgOwner ||
                  invite.inviteeAccountId === (user?.accountId || user?.id) ||
                  (invite.inviteeEmail && user?.email && invite.inviteeEmail.toLowerCase() === user.email.toLowerCase())
                ) ? (
                  <>
                    <button
                      onClick={() => updateInvite(idx, "isConfirmed", false)}
                      className="text-sm text-blue-600 hover:text-blue-700 shrink-0"
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() => removeInvite(idx)}
                      className="text-rose-500 hover:text-rose-600 shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 font-medium select-none shrink-0">
                    {invite.isOrgOwner ? "Chủ đơn vị / Trưởng ban" : "Người tạo / Trưởng ban"}
                  </span>
                )}
              </div>
            ) : (
              <div key={idx} className="space-y-4 py-2">
                <Field label="Email người được mời" required>
                  <Input
                    type="email"
                    value={invite.inviteeEmail}
                    onChange={(e) =>
                      updateInvite(idx, "inviteeEmail", e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && confirmInvite(idx)
                    }
                    placeholder="email@iuh.edu.vn"
                    autoFocus
                  />
                </Field>

                <Field label="Vai trò">
                  <Select
                    value={invite.targetRole}
                    onChange={(e) =>
                      updateInvite(idx, "targetRole", e.target.value)
                    }
                  >
                    {ORGANIZER_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Lời nhắn">
                  <Input
                    value={invite.message}
                    onChange={(e) =>
                      updateInvite(idx, "message", e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && confirmInvite(idx)
                    }
                    placeholder={`Mời tham gia ${term}`}
                  />
                </Field>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => removeInvite(idx)}
                    className="px-4 py-2 rounded-lg border border-rose-200 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Xóa
                  </button>

                  <button
                    onClick={() => confirmInvite(idx)}
                    disabled={!invite.inviteeEmail}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
                  >
                    <Check size={14} />
                    Xác nhận
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSection;