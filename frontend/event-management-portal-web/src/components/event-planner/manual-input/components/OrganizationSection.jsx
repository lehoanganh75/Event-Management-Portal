import React from "react";
import {
  Building,
  Sparkles,
  UserPlus,
  Search,
  UserCheck,
  Plus,
  X,
  Check,
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

export const ORGANIZER_ROLES = [
  { value: "ORGANIZER", label: "Người tổ chức" },
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

      {/* Existing organization */}
      {formData.orgSelectionMode !== "new" ? (
        <div>
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
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </Select>
          </Field>
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
                  <span className="text-xs text-slate-400 font-medium select-none shrink-0">Người tạo (Trưởng ban)</span>
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