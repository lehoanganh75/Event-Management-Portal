import React from "react";
import { Users, Plus, Sparkles, X, Check, Search, Briefcase } from "lucide-react";
import { Field, Input, Select } from "./BaseUI";

const PresentersSection = ({ 
  formData, 
  setFormData, 
  systemUsers, 
  loadingUsers, 
  presenterSearchKey, 
  setPresenterSearchKey,
  showPresenterSuggestions,
  setShowPresenterSuggestions,
  fetchUsers,
  addPresenter,
  updatePresenter,
  removePresenter,
  confirmPresenter
}) => {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={18} className="text-indigo-500" />
          Mời Diễn giả / Người thuyết trình
        </h3>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              if (!showPresenterSuggestions) fetchUsers();
              setShowPresenterSuggestions(!showPresenterSuggestions);
            }}
            style={{ background: "#fdfaff", border: "1px solid #ddd6fe", color: "#8b5cf6", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Sparkles size={14} /> AI gợi ý diễn giả
          </button>
          <button
            onClick={() => addPresenter()}
            style={{ background: "#f1f5f9", border: "none", color: "#475569", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Plus size={14} /> Thêm diễn giả
          </button>
        </div>
      </div>

      {showPresenterSuggestions && (
        <div style={{ background: "#fdfaff", border: "1px solid #f3e8ff", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8b5cf6", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
            <Search size={16} />
            Tìm kiếm diễn giả từ hệ thống
          </div>
          <Input
            placeholder="Nhập tên, email hoặc username để tìm..."
            value={presenterSearchKey}
            onChange={(e) => setPresenterSearchKey(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxHeight: 300, overflowY: "auto", padding: 4 }}>
            {loadingUsers ? (
              <div style={{ gridColumn: "span 2", textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>Đang tải danh sách...</div>
            ) : systemUsers.filter(u =>
              (u.profile?.fullName || "").toLowerCase().includes(presenterSearchKey.toLowerCase()) ||
              (u.email || "").toLowerCase().includes(presenterSearchKey.toLowerCase())
            ).length > 0 ? (
              systemUsers.filter(u =>
                (u.profile?.fullName || "").toLowerCase().includes(presenterSearchKey.toLowerCase()) ||
                (u.email || "").toLowerCase().includes(presenterSearchKey.toLowerCase())
              ).map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    addPresenter(u);
                    setShowPresenterSuggestions(false);
                    setPresenterSearchKey("");
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
              <div style={{ gridColumn: "span 2", textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>Không tìm thấy diễn giả phù hợp</div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(formData.presenters || []).map((presenter, idx) => (
          presenter.isConfirmed ? (
            <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, animation: "fadeIn 0.3s ease" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                <Briefcase size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{presenter.fullName || presenter.email.split('@')[0]}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {presenter.targetSessionName === 'ALL' ? 'Thuyết trình tất cả' : presenter.targetSessionName ? `Phiên: ${presenter.targetSessionName}` : 'Chưa gán phiên'} • {presenter.email}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => updatePresenter(idx, 'isConfirmed', false)}
                  style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 8px" }}
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => removePresenter(idx)}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 8px" }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <div key={idx} style={{ background: "#fafafa", padding: 20, borderRadius: 14, border: "2px solid #6366f1", display: "flex", flexDirection: "column", gap: 16, position: "relative", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)" }}>
              <button
                onClick={() => removePresenter(idx)}
                style={{ position: "absolute", top: 12, right: 12, background: "#fee2e2", border: "none", color: "#ef4444", padding: "6px", borderRadius: 8, cursor: "pointer" }}
              >
                <X size={14} />
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <Field label="Email diễn giả" required>
                  <Input
                    type="email"
                    value={presenter.email}
                    onChange={(e) => updatePresenter(idx, 'email', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmPresenter(idx)}
                    placeholder="Nhập email để hệ thống tự tìm thông tin"
                    autoFocus
                  />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Tên diễn giả">
                  <Input value={presenter.fullName} onChange={(e) => updatePresenter(idx, 'fullName', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmPresenter(idx)} placeholder="Hệ thống tự điền nếu tìm thấy" />
                </Field>
                <Field label="Phiên đảm nhiệm">
                  <Select value={presenter.targetSessionId} onChange={(e) => {
                    const sid = e.target.value;
                    const sname = sid === 'ALL' ? 'ALL' : formData.sessions?.find(s => s.id === sid || s.orderIndex === parseInt(sid))?.title || '';
                    updatePresenter(idx, 'targetSessionId', sid);
                    updatePresenter(idx, 'targetSessionName', sname);
                  }}>
                    <option value="">-- Chưa gán --</option>
                    <option value="ALL">Tất cả các phiên</option>
                    {(formData.sessions || []).map((s, i) => (
                      <option key={i} value={s.id || s.orderIndex}>{s.title}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <button
                  onClick={() => confirmPresenter(idx)}
                  style={{
                    background: "#1e1b4b",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <Check size={16} /> Xác nhận diễn giả
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default PresentersSection;
