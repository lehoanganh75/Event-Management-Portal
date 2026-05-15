import React from "react";
import { Calendar, Plus, Sparkles, X, Check } from "lucide-react";
import { Field, Input, Select, Textarea, AISuggestionBox } from "./BaseUI";

export const SESSION_TYPES = [
  { value: "KEYNOTE", label: "Keynote (Phiên chính)" },
  { value: "WORKSHOP", label: "Workshop (Thực hành)" },
  { value: "PANEL", label: "Panel Discussion (Thảo luận)" },
  { value: "BREAK", label: "Break (Giải lao)" },
  { value: "NETWORKING", label: "Networking (Kết nối)" }
];

const SessionsSection = ({ 
  formData, 
  setFormData, 
  term,
  showSessionAISuggestions,
  setShowSessionAISuggestions,
  addSession,
  updateSession,
  removeSession,
  confirmSession
}) => {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={18} className="text-indigo-500" />
          Chương trình chi tiết (Sessions)
        </h3>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowSessionAISuggestions(!showSessionAISuggestions)}
            style={{ background: "#fdfaff", border: "1px solid #ddd6fe", color: "#8b5cf6", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Sparkles size={14} /> AI gợi ý lịch trình
          </button>
          <button
            onClick={() => addSession()}
            style={{ background: "#f1f5f9", border: "none", color: "#475569", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Plus size={14} /> Thêm phiên
          </button>
        </div>
      </div>

      {showSessionAISuggestions && (
        <AISuggestionBox
          title="Mẫu lịch trình từ AI"
          suggestions={[
            {
              label: "Lịch trình Workshop 1 buổi", data: [
                { title: "Đón khách & Check-in", type: "BREAK", room: "Sảnh", description: "Tiếp đón đại biểu" },
                { title: "Khai mạc & Giới thiệu", type: "KEYNOTE", room: "Hội trường", description: "Phát biểu khai mạc" },
                { title: "Thực hành Workshop", type: "WORKSHOP", room: "Phòng Lab", description: "Hướng dẫn kỹ thuật" },
                { title: "Bế mạc & Trao chứng nhận", type: "NETWORKING", room: "Hội trường", description: "Chụp ảnh lưu niệm" }
              ]
            },
            {
              label: "Lịch trình Seminar chuyên môn", data: [
                { title: "Khai mạc", type: "KEYNOTE", room: "Hội trường A", description: "Giới thiệu mục tiêu" },
                { title: "Thảo luận chuyên gia", type: "PANEL", room: "Hội trường A", description: "Trao đổi cùng chuyên gia" },
                { title: "Nghỉ giải lao", type: "BREAK", room: "Sảnh", description: "Teabreak" },
                { title: "Hỏi đáp & Kết nối", type: "NETWORKING", room: "Hội trường A", description: "Tự do thảo luận" }
              ]
            }
          ]}
          onSelect={(s) => {
            const newSessions = s.data.map((item, i) => ({
              ...item,
              startTime: formData.startTime || "",
              endTime: formData.endTime || "",
              maxParticipants: formData.maxParticipants || 0,
              orderIndex: i + 1
            }));
            setFormData({ ...formData, sessions: newSessions });
            setShowSessionAISuggestions(false);
          }}
        />
      )}

      <div id="field-sessions" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(formData.sessions || []).map((session, idx) => (
          session.isConfirmed ? (
            <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, animation: "fadeIn 0.3s ease" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6" }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{session.orderIndex}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{session.title}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontWeight: 600, marginRight: 8 }}>
                    {SESSION_TYPES.find(t => t.value === session.type)?.label}
                  </span>
                  {session.room || "Chưa chọn phòng"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => updateSession(idx, 'isConfirmed', false)}
                  style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 8px" }}
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => removeSession(idx)}
                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "4px 8px" }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <div key={idx} style={{ background: "#fafafa", padding: 20, borderRadius: 14, border: "2px solid #8b5cf6", display: "flex", flexDirection: "column", gap: 16, position: "relative", boxShadow: "0 4px 12px rgba(139, 92, 246, 0.08)" }}>
              <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8 }}>
                <div style={{ background: "#e2e8f0", color: "#475569", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  Thứ tự: {session.orderIndex}
                </div>
                <button
                  onClick={() => removeSession(idx)}
                  style={{ background: "#fee2e2", border: "none", color: "#ef4444", padding: "6px", borderRadius: 8, cursor: "pointer" }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Field label="Tên phiên / Hoạt động" required error={session.titleError}>
                  <Input
                    value={session.title}
                    onChange={(e) => updateSession(idx, 'title', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmSession(idx)}
                    placeholder={`VD: Khai mạc ${term}`}
                    autoFocus
                  />
                </Field>
                <Field label="Loại phiên">
                  <Select value={session.type} onChange={(e) => updateSession(idx, 'type', e.target.value)}>
                    {SESSION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Field label="Thời gian bắt đầu" error={session.startTimeError}>
                  <Input type="datetime-local" value={session.startTime} onChange={(e) => updateSession(idx, 'startTime', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmSession(idx)} />
                </Field>
                <Field label="Thời gian kết thúc" error={session.endTimeError}>
                  <Input type="datetime-local" value={session.endTime} onChange={(e) => updateSession(idx, 'endTime', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmSession(idx)} />
                </Field>
                <Field label="Địa điểm / Phòng">
                  <Input value={session.room} onChange={(e) => updateSession(idx, 'room', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmSession(idx)} placeholder="VD: Hội trường A" />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <Field label="Mô tả nội dung phiên">
                  <Textarea value={session.description} onChange={(e) => updateSession(idx, 'description', e.target.value)} placeholder="Chi tiết các hoạt động..." rows={2} />
                </Field>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <button
                  onClick={() => confirmSession(idx)}
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
                  <Check size={16} /> Xác nhận phiên
                </button>
              </div>
            </div>
          )
        ))}
        {(!formData.sessions || formData.sessions.length === 0) && (
          <div style={{ textAlign: "center", padding: "32px", border: "1px dashed #e2e8f0", borderRadius: 16, color: "#94a3b8", fontSize: 13, background: "#fcfcfc" }}>
            <Calendar size={24} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            Chưa có lịch trình chi tiết. Nhấn "Thêm phiên" hoặc "AI gợi ý" để lập lịch.
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsSection;
