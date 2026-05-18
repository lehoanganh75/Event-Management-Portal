import React from "react";
import { Calendar, Plus, X, Check } from "lucide-react";
import { Field, Input, Select, Textarea } from "./BaseUI";

export const SESSION_TYPES = [
  { value: "KEYNOTE", label: "Keynote (Phiên chính)" },
  { value: "WORKSHOP", label: "Workshop (Thực hành)" },
  { value: "PANEL", label: "Panel Discussion (Thảo luận)" },
  { value: "BREAK", label: "Break (Giải lao)" },
  { value: "NETWORKING", label: "Networking (Kết nối)" },
];

const SessionsSection = ({
  formData,
  setFormData,
  term,
  addSession,
  updateSession,
  removeSession,
  confirmSession,
  confirmAllSessions,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Calendar size={16} className="text-slate-500" />
          Chương trình chi tiết
        </h3>

        <div className="flex items-center gap-2">
          {formData.sessions && formData.sessions.length >= 2 && formData.sessions.some(s => !s.isConfirmed) && (
            <button
              onClick={() => confirmAllSessions()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Check size={13} />
              Xác nhận tất cả phiên
            </button>
          )}

          <button
            onClick={() => addSession()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
          >
            <Plus size={13} />
            Thêm phiên
          </button>
        </div>
      </div>

      <div id="field-sessions" className="space-y-4">
        {(formData.sessions || []).map((session, idx) =>
          session.isConfirmed ? (
            <div
              key={idx}
              className="flex items-center gap-4 py-4 border-b border-slate-100"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium">
                {session.orderIndex}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {session.title}
                </p>

                <p className="text-xs text-slate-500 mt-0.5">
                  {SESSION_TYPES.find((t) => t.value === session.type)?.label}
                  {" • "}
                  {session.room || "Chưa chọn phòng"}
                </p>
              </div>

              <button
                onClick={() => updateSession(idx, "isConfirmed", false)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Sửa
              </button>

              <button
                onClick={() => removeSession(idx)}
                className="text-rose-500 hover:text-rose-600"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <div key={idx} className="space-y-4 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Thứ tự: {session.orderIndex}
                </span>

                <button
                  onClick={() => removeSession(idx)}
                  className="text-rose-500 hover:text-rose-600"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Tên phiên / Hoạt động"
                  required
                  error={session.titleError}
                >
                  <Input
                    value={session.title}
                    onChange={(e) =>
                      updateSession(idx, "title", e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && confirmSession(idx)
                    }
                    placeholder={`VD: Khai mạc ${term}`}
                    autoFocus
                  />
                </Field>

                <Field label="Loại phiên">
                  <Select
                    value={session.type}
                    onChange={(e) =>
                      updateSession(idx, "type", e.target.value)
                    }
                  >
                    {SESSION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field
                  label="Thời gian bắt đầu"
                  error={session.startTimeError}
                >
                  <Input
                    type="datetime-local"
                    value={session.startTime}
                    onChange={(e) =>
                      updateSession(idx, "startTime", e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && confirmSession(idx)
                    }
                  />
                </Field>

                <Field
                  label="Thời gian kết thúc"
                  error={session.endTimeError}
                >
                  <Input
                    type="datetime-local"
                    value={session.endTime}
                    onChange={(e) =>
                      updateSession(idx, "endTime", e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && confirmSession(idx)
                    }
                  />
                </Field>

                <Field label="Địa điểm / Phòng">
                  <Input
                    value={session.room}
                    onChange={(e) =>
                      updateSession(idx, "room", e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && confirmSession(idx)
                    }
                    placeholder="VD: Hội trường A"
                  />
                </Field>
              </div>

              <Field label="Mô tả nội dung phiên">
                <Textarea
                  value={session.description}
                  onChange={(e) =>
                    updateSession(idx, "description", e.target.value)
                  }
                  placeholder="Chi tiết các hoạt động..."
                  rows={2}
                />
              </Field>

              <div className="flex justify-end">
                <button
                  onClick={() => confirmSession(idx)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
                >
                  <Check size={14} />
                  Xác nhận phiên
                </button>
              </div>
            </div>
          )
        )}

        {(!formData.sessions || formData.sessions.length === 0) && (
          <div className="py-10 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <Calendar size={24} className="mx-auto mb-3 text-slate-300" />
            Chưa có lịch trình chi tiết. Nhấn “Thêm phiên” để lập lịch.
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsSection;