import React from "react";
import { UserPlus, UserCheck, Plus, Sparkles, X, Check, Search, Briefcase } from "lucide-react";
import { Field, Input, Select } from "./BaseUI";

export const ORGANIZER_ROLES = [
  { value: "ORGANIZER", label: "Người tổ chức" },
  { value: "LEADER", label: "Trưởng ban" },
  { value: "COORDINATOR", label: "Điều phối viên" },
  { value: "MEMBER", label: "Thành viên" },
  { value: "ADVISOR", label: "Cố vấn" }
];

const InvitationsSection = ({
  formData,
  setFormData,
  term,
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
  confirmInvite
}) => {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <UserPlus size={18} className="text-indigo-500" />
          Mời thành viên ban tổ chức
        </h3>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              if (!showUserSuggestions) fetchUsers();
              setShowUserSuggestions(!showUserSuggestions);
            }}
            style={{ background: "#fdfaff", border: "1px solid #ddd6fe", color: "#8b5cf6", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Sparkles size={14} /> AI gợi ý thành viên
          </button>
          <button
            onClick={() => addInvite()}
            style={{ background: "#f1f5f9", border: "none", color: "#475569", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Plus size={14} /> Thêm thủ công
          </button>
        </div>
      </div>

      {showUserSuggestions && (
        <div style={{ background: "#fdfaff", border: "1px solid #f3e8ff", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8b5cf6", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
            <Search size={16} />
            Tìm kiếm người dùng từ hệ thống
          </div>
          <Input
            placeholder="Nhập tên, email hoặc username để tìm..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxHeight: 300, overflowY: "auto", padding: 4 }}>
            {loadingUsers ? (
              <div style={{ gridColumn: "span 2", textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>Đang tải danh sách...</div>
            ) : systemUsers.filter(u =>
              (u.profile?.fullName || "").toLowerCase().includes(searchKey.toLowerCase()) ||
              (u.email || "").toLowerCase().includes(searchKey.toLowerCase())
            ).length > 0 ? (
              systemUsers.filter(u =>
                (u.profile?.fullName || "").toLowerCase().includes(searchKey.toLowerCase()) ||
                (u.email || "").toLowerCase().includes(searchKey.toLowerCase())
              ).map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    addInvite(u);
                    setShowUserSuggestions(false);
                    setSearchKey("");
                  }}
                  style={{ background: "#fff", border: "1px solid #f1f5f9", padding: 12, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all .15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#ddd6fe"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#f1f5f9"}
                >
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    <Briefcase size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.profile?.fullName || u.username}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "span 2", textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>Không tìm thấy người dùng phù hợp</div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(formData.invitations || []).map((invite, idx) => (
          invite.isConfirmed ? (
            <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, animation: "fadeIn 0.3s ease" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e" }}>
                <UserCheck size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{invite.inviteeName || invite.inviteeEmail.split('@')[0]}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontWeight: 600, marginRight: 8 }}>
                    {ORGANIZER_ROLES.find(r => r.value === invite.targetRole)?.label}
                  </span>
                  {invite.inviteeEmail}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => updateInvite(idx, 'isConfirmed', false)}
                  style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 8px" }}
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => removeInvite(idx)}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 8px" }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              <button
                onClick={() => removeInvite(idx)}
                style={{ position: "absolute", top: 12, right: 12, background: "#fee2e2", border: "none", color: "#ef4444", padding: "6px", borderRadius: 8, cursor: "pointer" }}
              >
                <X size={14} />
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <Field label="Email người được mời" required>
                  <Input
                    type="email"
                    value={invite.inviteeEmail}
                    onChange={(e) => updateInvite(idx, 'inviteeEmail', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmInvite(idx)}
                    placeholder="Nhập email (ví dụ: email@iuh.edu.vn)"
                    autoFocus
                  />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <Field label="Vai trò dự kiến">
                  <Select value={invite.targetRole} onChange={(e) => updateInvite(idx, 'targetRole', e.target.value)}>
                    {ORGANIZER_ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Lời nhắn gửi kèm">
                <Input
                  value={invite.message}
                  onChange={(e) => updateInvite(idx, 'message', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmInvite(idx)}
                  placeholder={`VD: Mời bạn làm truyền thông cho ${term} này...`}
                />
              </Field>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <button
                  onClick={() => confirmInvite(idx)}
                  disabled={!invite.inviteeEmail}
                  style={{
                    background: invite.inviteeEmail ? "#1e1b4b" : "#94a3b8",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: invite.inviteeEmail ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s"
                  }}
                >
                  <Check size={16} /> Xác nhận thêm
                </button>
              </div>
            </div>
          )
        ))}
        {(!formData.invitations || formData.invitations.length === 0) && (
          <div style={{ textAlign: "center", padding: "32px", border: "1px dashed #e2e8f0", borderRadius: 16, color: "#94a3b8", fontSize: 13, background: "#fcfcfc" }}>
            <UserPlus size={24} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            Chưa có thành viên nào được mời. Nhấn "AI gợi ý" hoặc "Thêm thủ công" để mời.
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsSection;
