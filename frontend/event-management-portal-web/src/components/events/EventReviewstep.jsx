import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Award,
  Clock,
  BookOpen,
  Tag,
  Building2,
  Pencil,
  Check,
  X,
  Plus,
  Send,
  Loader2,
} from "lucide-react";
import axios from "axios";

const fi = "'Inter','Segoe UI',sans-serif";

const EVENT_TYPE_LABELS = {
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  TALKSHOW: "Talkshow",
  COMPETITION: "Cuộc thi",
  CONFERENCE: "Hội nghị",
  WEBINAR: "Webinar",
  CONCERT: "Buổi biểu diễn",
  OTHER: "Khác",
};

const EVENT_TYPE_COLORS = {
  WORKSHOP: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  SEMINAR: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  TALKSHOW: { bg: "#fdf4ff", color: "#9333ea", border: "#e9d5ff" },
  COMPETITION: { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  CONFERENCE: { bg: "#f0f9ff", color: "#0284c7", border: "#bae6fd" },
  WEBINAR: { bg: "#fefce8", color: "#ca8a04", border: "#fef08a" },
  CONCERT: { bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
  OTHER: { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
};

const formatDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d)) return null;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toISO = (dt) => {
  if (!dt) return null;
  const date = new Date(dt);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

function Badge({ label, type }) {
  const c = EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS.OTHER;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 12px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontFamily: fi,
      }}
    >
      {label}
    </span>
  );
}

function InfoRow({ icon, label, value, accent = "#64748b" }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {React.cloneElement(icon, { size: 14, color: accent })}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#94a3b8",
            margin: "0 0 2px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#1e293b",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </span>
        <div style={{ height: 1, width: 60, background: "#f1f5f9" }} />
      </div>
      {children}
    </div>
  );
}

function EditableField({ label, value, onChange, multiline = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const save = () => {
    onChange(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value || "");
    setEditing(false);
  };
  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: fi,
    outline: "none",
    boxSizing: "border-box",
    color: "#111",
    borderRadius: 8,
    border: "1.5px solid #2563eb",
    background: "#fff",
    resize: "none",
  };
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#94a3b8",
          margin: "0 0 4px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {multiline ? (
            <textarea
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              style={inputStyle}
              autoFocus
            />
          ) : (
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              style={inputStyle}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
            />
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={save}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 12px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: fi,
              }}
            >
              <Check size={12} /> Lưu
            </button>
            <button
              onClick={cancel}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 12px",
                background: "#fff",
                color: "#64748b",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: fi,
              }}
            >
              <X size={12} /> Hủy
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: value ? "#1e293b" : "#cbd5e1",
              margin: 0,
              lineHeight: 1.6,
              flex: 1,
            }}
          >
            {value || "Chưa nhập"}
          </p>
          <button
            onClick={() => {
              setDraft(value || "");
              setEditing(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              background: "none",
              color: "#cbd5e1",
              border: "none",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: fi,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            <Pencil size={11} /> Sửa
          </button>
        </div>
      )}
    </div>
  );
}

function PersonTag({ name, onRemove }) {
  const initials =
    name
      .split(" ")
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";
  const colors = [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#f43f5e",
    "#f59e0b",
    "#06b6d4",
  ];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px 6px 6px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 99,
        fontSize: 13,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: bg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      <span style={{ fontWeight: 500, color: "#1e293b" }}>{name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#cbd5e1",
            display: "flex",
            padding: 0,
            marginLeft: 2,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function TagList({ items, onRemove, onAdd, placeholder, addLabel }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const confirm = () => {
    if (draft.trim()) onAdd(draft.trim());
    setDraft("");
    setAdding(false);
  };
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      {items.length === 0 && !adding && (
        <span style={{ fontSize: 13, color: "#cbd5e1", fontStyle: "italic" }}>
          {placeholder}
        </span>
      )}
      {items.map((item, i) => (
        <PersonTag
          key={i}
          name={item}
          onRemove={onRemove ? () => onRemove(i) : null}
        />
      ))}
      {adding ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirm();
              if (e.key === "Escape") {
                setAdding(false);
                setDraft("");
              }
            }}
            placeholder="Nhập tên..."
            style={{
              padding: "5px 10px",
              border: "1.5px solid #2563eb",
              borderRadius: 99,
              fontSize: 13,
              outline: "none",
              fontFamily: fi,
              width: 160,
            }}
          />
          <button
            onClick={confirm}
            style={{
              padding: "5px 10px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: fi,
            }}
          >
            Thêm
          </button>
          <button
            onClick={() => {
              setAdding(false);
              setDraft("");
            }}
            style={{
              padding: "5px 10px",
              background: "#fff",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              borderRadius: 99,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: fi,
            }}
          >
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 10px",
            border: "1.5px dashed #e2e8f0",
            borderRadius: 99,
            background: "none",
            color: "#94a3b8",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: fi,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.color = "#2563eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <Plus size={12} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function PillToggle({ label, checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 12px",
        border: `1.5px solid ${checked ? "#2563eb" : "#e2e8f0"}`,
        borderRadius: 8,
        cursor: "pointer",
        background: checked ? "#eff6ff" : "#fff",
        transition: "all .12s",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 15,
          height: 15,
          borderRadius: 4,
          border: `1.5px solid ${checked ? "#2563eb" : "#cbd5e1"}`,
          background: checked ? "#2563eb" : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && <Check size={9} color="#fff" strokeWidth={3} />}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: checked ? "#1d4ed8" : "#475569",
        }}
      >
        {label}
      </span>
    </div>
  );
}

const RECIPIENT_OPTIONS = [
  "Trưởng khoa",
  "Ban Giám hiệu",
  "Phòng Đào tạo",
  "Phòng CTSV",
  "Các bộ môn",
];
const PARTICIPANT_OPTIONS = ["Sinh viên", "Giảng viên", "Cán bộ", "Khách mời"];

export const EventReviewStep = ({
  onBack,
  onNext,
  formData: externalFormData,
  setFormData: setExternalFormData,
}) => {
  const [data, setData] = useState({
    ...externalFormData,
    presenters: Array.isArray(externalFormData?.presenters)
      ? externalFormData.presenters.map((p) =>
          typeof p === "object" ? p.name || p.fullName : p,
        )
      : [],
    organizers: Array.isArray(externalFormData?.organizers)
      ? externalFormData.organizers.map((o) =>
          typeof o === "object" ? o.name || o.fullName : o,
        )
      : [],
    attendees: Array.isArray(externalFormData?.attendees)
      ? externalFormData.attendees.map((a) =>
          typeof a === "object" ? a.name || a.fullName : a,
        )
      : [],
    targetObjects: Array.isArray(externalFormData?.targetObjects)
      ? externalFormData.targetObjects
      : [],
    programItems: Array.isArray(externalFormData?.programItems)
      ? externalFormData.programItems
      : [],
    participants: Array.isArray(externalFormData?.participants)
      ? externalFormData.participants
      : [],
    recipients: Array.isArray(externalFormData?.recipients)
      ? externalFormData.recipients
      : [],
    customRecipients: Array.isArray(externalFormData?.customRecipients)
      ? externalFormData.customRecipients
      : [],
  });

  console.log("=".repeat(80));
  console.log("📋 EventReviewStep - Form Data:");
  console.log("  - targetObjects:", data.targetObjects);
  console.log("  - targetObjects length:", data.targetObjects?.length || 0);
  console.log("  - participants:", data.participants);
  console.log("  - presenters:", data.presenters);
  console.log("  - organizers:", data.organizers);
  console.log("  - recipients:", data.recipients);
  console.log("  - attendees:", data.attendees);
  console.log("=".repeat(80));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const set = (key, val) => setData((prev) => ({ ...prev, [key]: val }));

  const typeColor =
    EVENT_TYPE_COLORS[data.eventType] || EVENT_TYPE_COLORS.OTHER;
  const typeLabel =
    EVENT_TYPE_LABELS[data.eventType] || data.eventType || "Chưa phân loại";

  const getCurrentUser = () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const base64Url = accessToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return {
          accountId:
            payload.accountId || payload.sub || payload.userId || payload.id,
          name: payload.name || payload.fullName || "Người dùng",
          email: payload.email,
        };
      }
    } catch (e) {
      console.error("Lỗi decode token:", e);
    }

    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return {
          accountId:
            user.id || user.accountId || user.account?.id || user.userId,
          name: user.fullName || user.name || "Người dùng",
          email: user.email,
        };
      }
    } catch (error) {
      console.error("Lỗi parse user data:", error);
    }

    return null;
  };

  const sendNotifications = async (eventId, eventTitle) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.accountId) {
        console.error("Không tìm thấy thông tin người dùng");
        return;
      }

      const IDENTITY_SERVICE_URL =
        import.meta.env.VITE_IDENTITY_API_URL || "http://localhost:8082";
      const token = localStorage.getItem("accessToken");

      let adminAccounts = [];
      try {
        const accountsResponse = await axios.get(
          `${IDENTITY_SERVICE_URL}/api/admin/accounts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const allAccounts = accountsResponse.data || [];
        const adminRoles = ["ADMIN", "SUPER_ADMIN"];
        adminAccounts = allAccounts.filter(
          (account) =>
            account.roles?.some((role) =>
              adminRoles.includes(role.toUpperCase()),
            ) && account.id !== currentUser.accountId,
        );
      } catch (err) {
        console.error("Lỗi lấy danh sách accounts:", err);
      }

      for (const admin of adminAccounts) {
        if (!admin.id) continue;
        try {
          await notificationApi.createNotification({
            userProfileId: admin.id,
            type: "EVENT_SUBMITTED",
            title: "Sự kiện mới cần phê duyệt",
            message: `${currentUser.name} đã tạo sự kiện "${eventTitle}" và đang chờ phê duyệt.`,
            relatedEntityId: eventId,
            relatedEntityType: "EVENT",
            actionUrl: `/admin/events/${eventId}`,
            priority: 3,
          });
        } catch (e) {
          console.error(`Lỗi gửi thông báo admin ${admin.id}:`, e);
        }
      }
      await notificationApi.createNotification({
        userProfileId: currentUser.accountId,
        type: "EVENT_SUBMITTED",
        title: "Gửi phê duyệt thành công",
        message: `Sự kiện "${eventTitle}" đã được gửi và đang chờ duyệt.`,
        relatedEntityId: eventId,
        relatedEntityType: "EVENT",
        actionUrl: `/my-events`,
        priority: 2,
      });
    } catch (error) {
      console.error("Lỗi tổng thể gửi thông báo:", error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentUser = getCurrentUser();

      if (!currentUser || !currentUser.accountId) {
        toast.error("Không xác định được người dùng. Vui lòng đăng nhập lại.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title: (data.eventTitle || data.title || "").trim(),
        description: (data.eventPurpose || data.description || "").trim(),
        eventTopic: (data.eventTopic || "").trim(),
        location: (data.location || "").trim(),
        eventMode: (data.eventMode || "OFFLINE").toUpperCase(),
        type: data.eventType || data.type || "OTHER",
        startTime: toISO(data.startTime),
        endTime: toISO(data.endTime),
        registrationDeadline: toISO(data.registrationDeadline),
        maxParticipants: Number(data.maxParticipants) || 50,
        hasLuckyDraw: data.hasLuckyDraw || false,
        faculty: data.faculty || "",
        major: data.major || "",
        organizerUnit: data.organizerUnit || data.faculty || "",
        participants: Array.isArray(data.participants) ? data.participants : [],
        recipients: Array.isArray(data.recipients) ? data.recipients : [],
        customRecipients: Array.isArray(data.customRecipients)
          ? data.customRecipients
          : [],
        presenters: data.presenters.map((p) =>
          typeof p === "string" ? p : p.name || p.fullName,
        ),
        organizingCommittee: data.organizers.map((o) =>
          typeof o === "string" ? o : o.name || o.fullName,
        ),
        attendees: data.attendees.map((a) =>
          typeof a === "string" ? a : a.name || a.fullName,
        ),
        targetObjects: Array.isArray(data.targetObjects)
          ? data.targetObjects
          : [],
        programItems: Array.isArray(data.programItems) ? data.programItems : [],
        notes: (data.notes || "").trim(),
        coverImage: data.coverImage || "",
        createdByAccountId: currentUser.accountId,
        status: "EVENT_PENDING_APPROVAL",
      };

      Object.keys(payload).forEach((key) => {
        if (
          payload[key] === undefined ||
          payload[key] === null ||
          payload[key] === ""
        ) {
          delete payload[key];
        }
      });

      const response = await createEvent(payload);
      const createdEvent = response.data;
      const eventId = createdEvent?.id;
      const eventTitle = payload.title;

      if (eventId) {
        await sendNotifications(eventId, eventTitle);
      }

      toast.success("✅ Gửi phê duyệt thành công! Đã gửi thông báo đến admin.");
      if (onBack) onBack();
    } catch (err) {
      console.error("❌ Lỗi:", err);
      let errorMessage = "Lỗi không xác định";

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(`❌ Lỗi khi gửi phê duyệt: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecipientDisplay = (r) => {
    if (typeof r === "string") return r;
    return r?.name || "";
  };

  const isRecipientChecked = (opt) => {
    return data.recipients.some((r) => getRecipientDisplay(r) === opt);
  };

  const toggleRecipient = (opt) => {
    if (isRecipientChecked(opt)) {
      set(
        "recipients",
        data.recipients.filter((r) => getRecipientDisplay(r) !== opt),
      );
    } else {
      set("recipients", [
        ...data.recipients,
        { name: opt, type: "DEPARTMENT" },
      ]);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 860,
        margin: "0 auto",
        padding: "0 24px 60px",
        fontFamily: fi,
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: 12,
            color: "#94a3b8",
            fontWeight: 600,
            margin: "0 0 6px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Xem lại & Gửi phê duyệt
        </p>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          Kiểm tra thông tin sự kiện
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Chỉnh sửa nếu cần, sau đó gửi phê duyệt trực tiếp
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "6px 24px",
              background: typeColor.bg,
              borderBottom: `1.5px solid ${typeColor.border}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <BookOpen size={13} color={typeColor.color} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: typeColor.color,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Từ kế hoạch có sẵn
            </span>
            <div style={{ marginLeft: "auto" }}>
              <Badge label={typeLabel} type={data.eventType} />
            </div>
          </div>
          <div
            style={{
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <EditableField
              label="Tên sự kiện"
              value={data.eventTitle || data.title}
              onChange={(v) => {
                set("eventTitle", v);
                set("title", v);
              }}
            />
            <EditableField
              label="Mục đích tổ chức"
              value={data.eventPurpose || data.description}
              onChange={(v) => {
                set("eventPurpose", v);
                set("description", v);
              }}
              multiline
            />
            {(data.eventTopic || (data.themes && data.themes.length > 0)) && (
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    margin: "0 0 8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Chủ đề
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(data.themes?.length ? data.themes : [data.eventTopic])
                    .filter(Boolean)
                    .map((t, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "4px 12px",
                          background: "#f1f5f9",
                          color: "#475569",
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 600,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 16,
            padding: "24px 28px",
          }}
        >
          <Section title="Thời gian & Địa điểm">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <InfoRow
                icon={<Calendar />}
                label="Bắt đầu"
                value={formatDate(data.startTime)}
                accent="#2563eb"
              />
              <InfoRow
                icon={<Clock />}
                label="Kết thúc"
                value={formatDate(data.endTime)}
                accent="#2563eb"
              />
              <InfoRow
                icon={<Clock />}
                label="Hạn đăng ký"
                value={formatDate(data.registrationDeadline)}
                accent="#f59e0b"
              />
              <InfoRow
                icon={<MapPin />}
                label="Địa điểm"
                value={data.location}
                accent="#ef4444"
              />
            </div>
          </Section>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 16,
            padding: "24px 28px",
          }}
        >
          <Section>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Đối tượng tham gia dự kiến */}
              {data.targetObjects && data.targetObjects.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Users size={14} color="#f59e0b" />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#b45309",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Đối tượng tham gia dự kiến
                    </span>
                    <div
                      style={{ flex: 1, height: 1, background: "#fef3c7" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {data.targetObjects.map((obj, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 16px",
                          background:
                            "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
                          borderRadius: 40,
                          border: "1px solid #fed7aa",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        }}
                      >
                        <Users size={12} color="#d97706" />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#b45309",
                          }}
                        >
                          {obj.typeName || obj.type || obj.fullName || obj.name}
                        </span>
                        {obj.quantity && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#d97706",
                              background: "#fff",
                              padding: "2px 8px",
                              borderRadius: 20,
                              marginLeft: 4,
                            }}
                          >
                            {obj.quantity} người
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Số lượng tối đa */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: "#f8fafc",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "#eef2ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Users size={20} color="#2563eb" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#64748b",
                        margin: 0,
                      }}
                    >
                      Số lượng tối đa
                    </p>
                    <p
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {data.maxParticipants || 0}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#94a3b8",
                          marginLeft: 4,
                        }}
                      >
                        người
                      </span>
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    background: "#e6f7e6",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#10b981",
                  }}
                >
                  {data.maxParticipants > 0 ? "Còn chỗ" : "Hết chỗ"}
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 16,
            padding: "24px 28px",
          }}
        >
          <Section title="Đơn vị & Nơi nhận">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <InfoRow
                  icon={<Building2 />}
                  label="Khoa / Đơn vị"
                  value={data.faculty || data.organizerUnit}
                  accent="#8b5cf6"
                />
                {data.major && (
                  <InfoRow
                    icon={<Tag />}
                    label="Chuyên ngành"
                    value={data.major}
                    accent="#8b5cf6"
                  />
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    margin: "0 0 10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Nơi nhận kế hoạch
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {RECIPIENT_OPTIONS.map((opt) => (
                    <PillToggle
                      key={opt}
                      label={opt}
                      checked={isRecipientChecked(opt)}
                      onChange={() => toggleRecipient(opt)}
                    />
                  ))}
                  {(data.customRecipients || []).map((r, i) => (
                    <PillToggle
                      key={i}
                      label={typeof r === "string" ? r : r.name}
                      checked={true}
                      onChange={() =>
                        set(
                          "customRecipients",
                          data.customRecipients.filter((_, idx) => idx !== i),
                        )
                      }
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={14} color="#eab308" />
                <span
                  style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}
                >
                  Bốc thăm may mắn:
                </span>
                <PillToggle
                  label={data.hasLuckyDraw ? "Có" : "Không"}
                  checked={data.hasLuckyDraw}
                  onChange={() => set("hasLuckyDraw", !data.hasLuckyDraw)}
                />
              </div>
            </div>
          </Section>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 16,
            padding: "24px 28px",
          }}
        >
          <Section title="Người liên quan">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    margin: "0 0 10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Người trình bày
                </p>
                <TagList
                  items={data.presenters}
                  onRemove={(i) =>
                    set(
                      "presenters",
                      data.presenters.filter((_, idx) => idx !== i),
                    )
                  }
                  onAdd={(name) =>
                    set("presenters", [...data.presenters, name])
                  }
                  placeholder="Chưa có người trình bày"
                  addLabel="Thêm"
                />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    margin: "0 0 10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Ban tổ chức
                </p>
                <TagList
                  items={data.organizers}
                  onRemove={(i) =>
                    set(
                      "organizers",
                      data.organizers.filter((_, idx) => idx !== i),
                    )
                  }
                  onAdd={(name) =>
                    set("organizers", [...data.organizers, name])
                  }
                  placeholder="Chưa có thành viên BTC"
                  addLabel="Thêm"
                />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    margin: "0 0 10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Người tham dự
                </p>
                <TagList
                  items={data.attendees}
                  onRemove={(i) =>
                    set(
                      "attendees",
                      data.attendees.filter((_, idx) => idx !== i),
                    )
                  }
                  onAdd={(name) => set("attendees", [...data.attendees, name])}
                  placeholder="Chưa có người tham dự"
                  addLabel="Thêm"
                />
              </div>
            </div>
          </Section>
        </div>

        {data.programItems && data.programItems.length > 0 && (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e2e8f0",
              borderRadius: 16,
              padding: "24px 28px",
            }}
          >
            <Section title="Chương trình sự kiện">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {data.programItems.map((item, idx) => (
                  <div key={idx}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      {idx + 1}. {item.title}
                    </p>
                    {item.notes && (
                      <p
                        style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}
                      >
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {data.notes && (
          <div
            style={{
              background: "#fffbeb",
              border: "1.5px solid #fde68a",
              borderRadius: 16,
              padding: "20px 28px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#92400e",
                margin: "0 0 6px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Ghi chú
            </p>
            <p
              style={{
                fontSize: 14,
                color: "#78350f",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {data.notes}
            </p>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 8,
          }}
        >
          <button
            onClick={onBack}
            disabled={isSubmitting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              background: "#fff",
              color: "#64748b",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: fi,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            <ArrowLeft size={15} /> Quay lại
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 28px",
              border: "none",
              borderRadius: 10,
              background: isSubmitting ? "#93c5fd" : "#2563eb",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontFamily: fi,
              boxShadow: "0 2px 12px rgba(37,99,235,0.25)",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.background = "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.background = "#2563eb";
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={15}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Đang gửi...
              </>
            ) : (
              <>
                <Send size={15} /> Gửi phê duyệt
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::placeholder { color: #cbd5e1; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default EventReviewStep;
