import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  ArrowRight,
  Search,
  X,
  Mic,
  Users,
  UserPlus,
  Settings,
  Type,
  Hash,
  Mail,
  Link,
  Calendar,
  AlignJustify,
  HelpCircle,
  UserCheck,
  Upload,
  Image,
  GripVertical,
  Edit2,
  Info,
} from "lucide-react";
import axios from "axios";
import { userApi } from "../../api/userApi"; // Import API mới tách
import { notificationApi } from "../../api/notificationApi";

const FIELD_TYPES = [
  { value: "short_text", label: "Văn bản ngắn", icon: Type },
  { value: "long_text", label: "Văn bản dài", icon: AlignJustify },
  { value: "number", label: "Số", icon: Hash },
  { value: "email", label: "Email", icon: Mail },
  { value: "url", label: "Đường dẫn", icon: Link },
  { value: "datetime", label: "Ngày giờ", icon: Calendar },
  { value: "other", label: "Khác", icon: HelpCircle },
];

const ROLE_OPTIONS = [
  { value: "Đồng chủ trì", label: "Đồng chủ trì" },
  { value: "Chủ trì", label: "Chủ trì" },
  { value: "Người trình bày", label: "Người trình bày" },
  { value: "Thành viên BTC", label: "Thành viên BTC" },
  { value: "Người tham dự", label: "Người tham dự" },
  { value: "Khác", label: "Khác" },
];

const AVATAR_BG = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f43f5e",
  "#f59e0b",
  "#06b6d4",
];
const fi = "'Inter','Segoe UI',sans-serif";

function Avatar({ initials, idx = 0, size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: AVATAR_BG[idx % AVATAR_BG.length],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size > 32 ? 12 : 10,
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: fi,
      }}
    >
      {initials}
    </div>
  );
}

function Inp({ error, style, ...p }) {
  const [f, setF] = useState(false);
  return (
    <input
      {...p}
      onFocus={(e) => {
        setF(true);
        p.onFocus?.(e);
      }}
      onBlur={(e) => {
        setF(false);
        p.onBlur?.(e);
      }}
      style={{
        width: "100%",
        padding: "11px 14px",
        fontSize: 14,
        fontFamily: fi,
        outline: "none",
        boxSizing: "border-box",
        color: "#111",
        transition: "border .15s",
        borderRadius: 9,
        background: error ? "#fff5f5" : "#fff",
        border: `1.5px solid ${error ? "#fca5a5" : f ? "#2563eb" : "#e5e5e5"}`,
        ...style,
      }}
    />
  );
}

function Sel({ children, style, ...p }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ position: "relative", ...style }}>
      <select
        {...p}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={{
          width: "100%",
          padding: "11px 36px 11px 14px",
          fontSize: 14,
          fontFamily: fi,
          outline: "none",
          appearance: "none",
          cursor: "pointer",
          color: "#111",
          borderRadius: 9,
          background: "#fff",
          border: `1.5px solid ${f ? "#2563eb" : "#e5e5e5"}`,
          transition: "border .15s",
        }}
      >
        {children}
      </select>
      <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <path
          d="M2 4l4 4 4-4"
          stroke="#aaa"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Card({ title, icon: Icon, accentColor, badge, children }) {
  const colors = {
    blue: {
      icon: "#2563eb",
      border: "#dbeafe",
      header: "#eff6ff",
      dot: "#2563eb",
    },
    emerald: {
      icon: "#10b981",
      border: "#d1fae5",
      header: "#f0fdf8",
      dot: "#10b981",
    },
    purple: {
      icon: "#8b5cf6",
      border: "#ede9fe",
      header: "#faf5ff",
      dot: "#8b5cf6",
    },
    slate: {
      icon: "#64748b",
      border: "#e2e8f0",
      header: "#f8fafc",
      dot: "#64748b",
    },
  };
  const c = colors[accentColor] || colors.slate;
  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${c.border}`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          background: c.header,
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: "#fff",
            border: `1px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} color={c.icon} />
        </div>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#111",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </span>
        {badge != null && badge > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: c.icon,
              background: "#fff",
              border: `1px solid ${c.border}`,
              padding: "1px 9px",
              borderRadius: 99,
              marginLeft: 2,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

function PeopleSearch({ onSelect, accentColor = "blue" }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const colors = { blue: "#2563eb", emerald: "#10b981", purple: "#8b5cf6" };
  const ac = colors[accentColor] || colors.blue;

  const search = async () => {
    if (!q.trim()) { setRes([]); setDone(true); return; }
    setLoading(true);
    setDone(false);

    try {
      // SỬ DỤNG API ĐÃ TÁCH
      const response = await userApi.searchProfiles(q);
      setRes(response.data || []);
      setDone(true);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      setRes([]);
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  const pick = (u) => {
    onSelect({
      id: u.id,
      name: u.fullName,
      fullName: u.fullName, 
      email: u.account?.email || "",
      dept: u.majorName || "",
      avatar: (u.fullName || "").charAt(0).toUpperCase() || "NG",
      role: u.account?.roles?.[0] || "MEMBER",
      loginCode: u.loginCode,
      phone: u.phone,
    });
    setQ(""); setRes([]); setDone(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={14}
            color="#ccc"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <Inp
            placeholder="Tìm theo tên, email hoặc mã số..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setDone(false);
              if (!e.target.value) setRes([]);
            }}
            onKeyDown={(e) => e.key === "Enter" && search()}
            style={{ paddingLeft: 38, fontSize: 13 }}
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            background: ac,
            color: "#fff",
            border: "none",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: fi,
            flexShrink: 0,
            transition: "opacity .15s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "..." : <Search size={13} />}
          {loading ? "Đang tìm..." : "Tìm"}
        </button>
      </div>

      {done && (
        <div
          style={{
            border: "1.5px solid #e5e5e5",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <p
              style={{
                padding: 16,
                textAlign: "center",
                fontSize: 13,
                color: "#aaa",
                margin: 0,
              }}
            >
              Đang tìm kiếm...
            </p>
          ) : res.length === 0 ? (
            <p
              style={{
                padding: 16,
                textAlign: "center",
                fontSize: 13,
                color: "#aaa",
                margin: 0,
              }}
            >
              Không tìm thấy kết quả.
            </p>
          ) : (
            res.map((u, i) => (
              <div
                key={u.id}
                onClick={() => pick(u)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderBottom:
                    i < res.length - 1 ? "1px solid #f0f0f0" : "none",
                  transition: "background .12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8fbff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                <Avatar
                  initials={u.fullName?.charAt(0) || "?"}
                  idx={i}
                  size={36}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111",
                      margin: 0,
                    }}
                  >
                    {u.fullName}
                  </p>
                  <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                    {u.loginCode} · {u.account?.email}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: "#888",
                    background: "#f5f5f5",
                    padding: "3px 10px",
                    borderRadius: 99,
                    whiteSpace: "nowrap",
                  }}
                >
                  {u.majorName || "Chưa có"}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ManualForm({ onAdd, onCancel, roleLabel }) {
  const [d, setD] = useState({
    name: "",
    title: "",
    org: "",
    role: "",
    customRole: "",
  });
  const [err, setErr] = useState({ name: false, role: false });

  const go = () => {
    let hasError = false;
    if (!d.name.trim()) {
      setErr((prev) => ({ ...prev, name: true }));
      hasError = true;
    }
    if (!d.role) {
      setErr((prev) => ({ ...prev, role: true }));
      hasError = true;
    }
    if (hasError) return;

    const finalRole =
      d.role === "Khác" ? d.customRole.trim() || "Khác" : d.role;

    onAdd({
      id: `m_${Date.now()}`,
      name: d.name.trim(),
      fullName: d.name.trim(),
      title: d.title.trim(),
      org: d.org.trim(),
      role: finalRole,
      isManual: true,
      avatar:
        d.name
          .trim()
          .split(" ")
          .map((w) => w[0])
          .slice(-2)
          .join("")
          .toUpperCase() || "NG",
    });
  };

  const lbl = (t) => (
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#888",
        display: "block",
        marginBottom: 6,
      }}
    >
      {t}
    </label>
  );

  return (
    <div
      style={{
        padding: "18px 20px",
        background: "#fafafa",
        border: "1.5px dashed #e0e0e0",
        borderRadius: 12,
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#aaa",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          margin: "0 0 16px",
        }}
      >
        Thêm {roleLabel} thủ công
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div>
          {lbl("Họ và tên *")}
          <Inp
            placeholder="Nguyễn Văn A"
            error={err.name}
            value={d.name}
            onChange={(e) => {
              setD({ ...d, name: e.target.value });
              setErr((prev) => ({ ...prev, name: false }));
            }}
          />
        </div>
        <div>
          {lbl("Chức danh / Vai trò")}
          <Inp
            placeholder="TS., ThS., Trưởng BTC..."
            value={d.title}
            onChange={(e) => setD({ ...d, title: e.target.value })}
          />
        </div>
        <div>
          {lbl("Đơn vị")}
          <Inp
            placeholder="Trường / Khoa / Công ty..."
            value={d.org}
            onChange={(e) => setD({ ...d, org: e.target.value })}
          />
        </div>
        <div>
          {lbl("Vai trò *")}
          <Sel
            value={d.role}
            onChange={(e) => {
              setD({ ...d, role: e.target.value, customRole: "" });
              setErr((prev) => ({ ...prev, role: false }));
            }}
          >
            <option value="">Chọn vai trò</option>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Sel>
          {d.role === "Khác" && (
            <Inp
              placeholder="Nhập vai trò cụ thể..."
              value={d.customRole}
              onChange={(e) => setD({ ...d, customRole: e.target.value })}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={go}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: fi,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#10b981")}
        >
          <Plus size={14} /> Thêm
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "9px 16px",
            background: "#fff",
            color: "#555",
            border: "1.5px solid #e5e5e5",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: fi,
          }}
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

function PersonCard({ person, idx, onRemove, accentBg, accentBorder }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        border: `1.5px solid ${person.isMe ? "#ddd6fe" : accentBorder}`,
        borderRadius: 11,
        background: h
          ? person.isMe
            ? "#f0eeff"
            : accentBg
          : person.isMe
            ? "#f5f3ff"
            : "#fff",
        transition: "all .15s",
      }}
    >
      <Avatar initials={person.avatar} idx={idx} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 2,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
            {person.title ? `${person.title} ` : ""}
            {person.name}
          </span>
          {person.isMe && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 99,
                background: "#ede9fe",
                color: "#7c3aed",
              }}
            >
              Tôi
            </span>
          )}
          {person.isManual && !person.isMe && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 99,
                background: "#fef3c7",
                color: "#d97706",
              }}
            >
              Thủ công
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
          {person.email || person.org || person.dept || ""}
        </p>
      </div>
      <button
        onClick={() => onRemove(person.id)}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "#ccc",
          padding: 4,
          borderRadius: 6,
          transition: "color .12s",
          display: "flex",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
      >
        <X size={15} />
      </button>
    </div>
  );
}

function PeopleBody({
  people,
  onAdd,
  onRemove,
  showAddMe,
  meAdded,
  onAddMe,
  accentColor,
  roleLabel,
}) {
  const [mode, setMode] = useState(null);
  const acs = {
    blue: {
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
      hbg: "#dbeafe",
    },
    emerald: {
      color: "#10b981",
      bg: "#f0fdf8",
      border: "#a7f3d0",
      hbg: "#d1fae5",
    },
    purple: {
      color: "#8b5cf6",
      bg: "#faf5ff",
      border: "#ddd6fe",
      hbg: "#ede9fe",
    },
  };
  const ac = acs[accentColor] || acs.blue;

  const add = (p) => {
    if (!people.find((x) => x.id === p.id)) {
      const personWithFullName = {
        ...p,
        fullName: p.fullName || p.name || "",
      };
      onAdd(personWithFullName);
      setMode(null);
    }
  };

  const ActionBtn = ({ children, onClick, color, bg, border }) => {
    const [h, setH] = useState(false);
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 16px",
          border: `1.5px solid ${h ? color : border}`,
          borderRadius: 9,
          background: h ? bg : "#fff",
          color,
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: fi,
          transition: "all .15s",
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {people.length > 0 && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {people.map((p, i) => (
            <PersonCard
              key={p.id}
              person={p}
              idx={i}
              onRemove={onRemove}
              accentBg={ac.bg}
              accentBorder={ac.border}
            />
          ))}
        </div>
      )}

      {people.length === 0 && mode === null && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "#fafafa",
            border: "1.5px dashed #e5e5e5",
            borderRadius: 10,
          }}
        >
          <p style={{ fontSize: 13, color: "#bbb", margin: 0 }}>
            Chưa có {roleLabel} nào. Thêm bên dưới.
          </p>
        </div>
      )}

      {mode === null && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <ActionBtn
            onClick={() => setMode("search")}
            color={ac.color}
            bg={ac.bg}
            border={ac.border}
          >
            <Search size={14} /> Tìm kiếm hệ thống
          </ActionBtn>
          <ActionBtn
            onClick={() => setMode("manual")}
            color="#555"
            bg="#fafafa"
            border="#e5e5e5"
          >
            <Plus size={14} /> Thêm thủ công
          </ActionBtn>
          {showAddMe && !meAdded && (
            <ActionBtn
              onClick={onAddMe}
              color="#7c3aed"
              bg="#f5f3ff"
              border="#ddd6fe"
            >
              <UserCheck size={14} /> Thêm tôi vào BTC
            </ActionBtn>
          )}
        </div>
      )}

      {mode === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PeopleSearch onSelect={add} accentColor={accentColor} />
          <button
            onClick={() => setMode(null)}
            style={{
              fontSize: 12,
              color: "#aaa",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              fontFamily: fi,
              textAlign: "left",
              padding: 0,
            }}
          >
            ← Đóng tìm kiếm
          </button>
        </div>
      )}

      {mode === "manual" && (
        <ManualForm
          onAdd={add}
          onCancel={() => setMode(null)}
          roleLabel={roleLabel}
        />
      )}
    </div>
  );
}

function CustomFields({ fields, onChange }) {
  const [show, setShow] = useState(false);
  const [nf, setNf] = useState({
    name: "",
    type: "short_text",
    description: "",
  });
  const [err, setErr] = useState(false);

  const add = () => {
    if (!nf.name.trim()) {
      setErr(true);
      return;
    }
    onChange([...fields, { id: `f_${Date.now()}`, ...nf }]);
    setNf({ name: "", type: "short_text", description: "" });
    setErr(false);
    setShow(false);
  };

  const lbl = (t) => (
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#888",
        display: "block",
        marginBottom: 6,
      }}
    >
      {t}
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
        Thêm các trường thông tin tùy chỉnh cho form đăng ký sự kiện.
      </p>

      {fields.length > 0 && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {fields.map((f) => {
            const TI =
              FIELD_TYPES.find((t) => t.value === f.type)?.icon || HelpCircle;
            const tl =
              FIELD_TYPES.find((t) => t.value === f.type)?.label || f.type;
            return (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 14px",
                  background: "#fafafa",
                  border: "1.5px solid #e5e5e5",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TI size={13} color="#94a3b8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111",
                      margin: "0 0 2px",
                    }}
                  >
                    {f.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                    {tl}
                    {f.description ? ` · ${f.description}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => onChange(fields.filter((x) => x.id !== f.id))}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#ccc",
                    padding: 3,
                    borderRadius: 5,
                    display: "flex",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ef4444")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {show ? (
        <div
          style={{
            padding: "18px 20px",
            background: "#fafafa",
            border: "1.5px dashed #e0e0e0",
            borderRadius: 12,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              margin: "0 0 16px",
            }}
          >
            Thêm trường mới
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              {lbl("Tên trường *")}
              <Inp
                placeholder="VD: Số điện thoại liên hệ"
                error={err && !nf.name}
                value={nf.name}
                onChange={(e) => {
                  setNf({ ...nf, name: e.target.value });
                  setErr(false);
                }}
              />
            </div>
            <div>
              {lbl("Loại trường")}
              <Sel
                value={nf.type}
                onChange={(e) => setNf({ ...nf, type: e.target.value })}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Sel>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              {lbl("Mô tả / Hướng dẫn điền")}
              <Inp
                placeholder="Ghi chú hoặc hướng dẫn..."
                value={nf.description}
                onChange={(e) => setNf({ ...nf, description: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={add}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: fi,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#2563eb")
              }
            >
              <Plus size={14} /> Thêm trường
            </button>
            <button
              onClick={() => {
                setShow(false);
                setErr(false);
              }}
              style={{
                padding: "9px 16px",
                background: "#fff",
                color: "#555",
                border: "1.5px solid #e5e5e5",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: fi,
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShow(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px",
            width: "100%",
            border: "1.5px dashed #e0e0e0",
            borderRadius: 10,
            background: "#fff",
            color: "#aaa",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: fi,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.color = "#2563eb";
            e.currentTarget.style.background = "#f8fbff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e0e0e0";
            e.currentTarget.style.color = "#aaa";
            e.currentTarget.style.background = "#fff";
          }}
        >
          <Plus size={15} /> Thêm trường thông tin
        </button>
      )}
    </div>
  );
}

function ProgramItems({ items, presenters, onChange }) {
  const [show, setShow] = useState(false);
  const [ni, setNi] = useState({
    title: "",
    presenter: "",
    presenterTitle: "",
  });
  const [err, setErr] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);

  const addOrUpdate = () => {
    if (!ni.title.trim()) {
      setErr(true);
      return;
    }
    if (editingId) {
      onChange(
        items.map((item) =>
          item.id === editingId ? { ...item, ...ni } : item,
        ),
      );
    } else {
      onChange([...items, { id: `item_${Date.now()}`, ...ni }]);
    }
    setNi({ title: "", presenter: "", presenterTitle: "" });
    setErr(false);
    setShow(false);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setNi({
      title: item.title,
      presenter: item.presenter || "",
      presenterTitle: item.presenterTitle || "",
    });
    setEditingId(item.id);
    setShow(true);
    setErr(false);
  };

  const cancelEdit = () => {
    setShow(false);
    setErr(false);
    setEditingId(null);
    setNi({ title: "", presenter: "", presenterTitle: "" });
  };

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.parentNode);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    const newItems = [...items];
    const draggedItem = newItems[draggedIdx];
    newItems.splice(draggedIdx, 1);
    newItems.splice(index, 0, draggedItem);
    onChange(newItems);
    setDraggedIdx(null);
  };

  const handlePresenterSelect = (e) => {
    const val = e.target.value;
    if (val === "custom") {
      setNi({ ...ni, presenter: "", presenterTitle: "" });
    } else if (val) {
      const p = presenters.find((x) => x.id === val);
      if (p) {
        setNi({
          ...ni,
          presenter: p.name,
          presenterTitle: p.title || p.dept || "",
        });
      }
    } else {
      setNi({ ...ni, presenter: "", presenterTitle: "" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
        Lịch trình chi tiết các phần trong sự kiện.
      </p>

      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: draggedIdx === idx ? "#e2e8f0" : "#f8fafc",
                border: "1px solid",
                borderColor: draggedIdx === idx ? "#94a3b8" : "#e2e8f0",
                borderRadius: 12,
                cursor: "grab",
              }}
            >
              <GripVertical
                size={18}
                color="#cbd5e1"
                style={{ cursor: "grab" }}
              />
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#64748b",
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1e293b",
                    margin: "0 0 2px",
                  }}
                >
                  {item.title}
                </p>
                {item.presenter && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Mic size={12} />
                    {item.presenter}{" "}
                    {item.presenterTitle ? `· ${item.presenterTitle}` : ""}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => handleEdit(item)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#cbd5e1",
                    padding: 6,
                    borderRadius: 8,
                    display: "flex",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#3b82f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#cbd5e1")
                  }
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onChange(items.filter((_, i) => i !== idx))}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#cbd5e1",
                    padding: 6,
                    borderRadius: 8,
                    display: "flex",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ef4444")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#cbd5e1")
                  }
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {show ? (
        <div
          style={{
            padding: "20px",
            background: "#f1f5f9",
            border: "1.5px dashed #cbd5e1",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Tên phần / Nội dung *
              </label>
              <Inp
                placeholder="VD: Khai mạc, Trình bày AI..."
                error={err && !ni.title}
                value={ni.title}
                onChange={(e) => {
                  setNi({ ...ni, title: e.target.value });
                  setErr(false);
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Người trình bày
                </label>
                <Sel onChange={handlePresenterSelect}>
                  <option value="">-- Chọn từ danh sách --</option>
                  {presenters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  <option value="custom">Nhập tên khác...</option>
                </Sel>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Tên người trình bày (nếu không chọn)
                </label>
                <Inp
                  placeholder="Họ và tên..."
                  value={ni.presenter}
                  onChange={(e) => setNi({ ...ni, presenter: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Chức danh / Đơn vị người chia sẻ
              </label>
              <Inp
                placeholder="Giảng viên - Khoa CNTT..."
                value={ni.presenterTitle}
                onChange={(e) =>
                  setNi({ ...ni, presenterTitle: e.target.value })
                }
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={addOrUpdate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: fi,
                }}
              >
                {editingId ? <Check size={14} /> : <Plus size={14} />}
                {editingId ? "Lưu thay đổi" : "Thêm vào chương trình"}
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  padding: "10px 20px",
                  background: "#fff",
                  color: "#64748b",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: fi,
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShow(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px",
            width: "100%",
            border: "1.5px dashed #cbd5e1",
            borderRadius: 12,
            background: "#fff",
            color: "#94a3b8",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: fi,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.color = "#2563eb";
            e.currentTarget.style.background = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.background = "#fff";
          }}
        >
          <Plus size={16} /> Thêm phần nội dung mới
        </button>
      )}
    </div>
  );
}

function EventSummary({ formData }) {
  const eventTypeLabels = {
    WORKSHOP: "Workshop",
    SEMINAR: "Seminar",
    TALKSHOW: "Talkshow",
    COMPETITION: "Cuộc thi",
    CONFERENCE: "Hội nghị",
    WEBINAR: "Webinar",
    CONCERT: "Buổi biểu diễn",
    OTHER: "Khác",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Lấy targetObjects từ formData
  const targetObjects = formData?.targetObjects || [];

  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1.5px solid #e2e8f0",
        borderRadius: 14,
        padding: "24px",
        marginBottom: 24,
      }}
    >
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#111",
          margin: "0 0 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Info size={18} color="#2563eb" />
        Tổng quan sự kiện
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            LOẠI SỰ KIỆN
          </p>
          <p
            style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}
          >
            {eventTypeLabels[formData?.eventType] ||
              formData?.eventType ||
              "Chưa chọn"}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            TÊN SỰ KIỆN
          </p>
          <p
            style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}
          >
            {formData?.eventTitle || formData?.title || "Chưa nhập"}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            ĐỊA ĐIỂM
          </p>
          <p
            style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}
          >
            {formData?.location || "Chưa nhập"}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            THỜI GIAN BẮT ĐẦU
          </p>
          <p
            style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}
          >
            {formatDate(formData?.startTime)}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            THỜI GIAN KẾT THÚC
          </p>
          <p
            style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}
          >
            {formatDate(formData?.endTime)}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            HẠN ĐĂNG KÝ
          </p>
          <p
            style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}
          >
            {formatDate(formData?.registrationDeadline)}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            SỐ LƯỢNG TỐI ĐA
          </p>
          <p
            style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}
          >
            {formData?.maxParticipants || 0} người
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            ĐƠN VỊ TỔ CHỨC
          </p>
          <p
            style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}
          >
            {formData?.faculty
              ? formData?.major
                ? `${formData.faculty} – ${formData.major}`
                : formData.faculty
              : "Chưa chọn"}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            ĐỐI TƯỢNG THAM GIA DỰ KIẾN
          </p>
          <p
            style={{ fontSize: 14, color: "#111", fontWeight: 500, margin: 0 }}
          >
            {targetObjects.length > 0
              ? targetObjects
                  .map((obj) => obj.name || obj.fullName || obj.typeName)
                  .join(", ")
              : "Chưa có"}
          </p>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <p
          style={{
            fontSize: 11,
            color: "#94a3b8",
            margin: "0 0 4px",
            fontWeight: 600,
          }}
        >
          MỤC ĐÍCH SỰ KIỆN
        </p>
        <p
          style={{ fontSize: 14, color: "#334155", margin: 0, lineHeight: 1.6 }}
        >
          {formData?.eventPurpose || formData?.description || "Chưa nhập"}
        </p>
      </div>
    </div>
  );
}
export const EventProgramStep = ({
  onBack,
  onNext,
  formData: externalFormData,
  setFormData: setExternalFormData,
  mode = "event",
}) => {
  const [presenters, setPresenters] = useState(
    externalFormData?.presenters || [],
  );
  const [organizers, setOrganizers] = useState(
    externalFormData?.organizers || [],
  );
  const [attendees, setAttendees] = useState(externalFormData?.attendees || []);
  const [programItems, setProgramItems] = useState(
    externalFormData?.programItems || [],
  );
  const [customFields, setCustomFields] = useState(
    externalFormData?.customFields || [],
  );
  const [coverImage, setCoverImage] = useState(
    externalFormData?.coverImage || "",
  );

  const [targetObjects, setTargetObjects] = useState(
    externalFormData?.targetObjects || [],
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user sạch từ localStorage (Không cần decodeJWT rườm rà)
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const accountId = user.id || user.accountId || user.userId;
        if (accountId) {
          setCurrentUser({
            id: accountId,
            name: user.fullName || user.username || "Tôi",
            fullName: user.fullName || user.username || "Tôi",
            email: user.email || "",
            title: user.title || "",
            org: user.department || user.faculty || user.majorName || "",
            isMe: true,
            avatar: (user.fullName || "T").charAt(0).toUpperCase(),
          });
        }
      } catch (error) {
        console.error("Lỗi parse user data:", error);
      }
    }
  }, []);

  const meAdded = organizers.some(
    (o) => o.id === currentUser?.id || o.id === "ME",
  );

 const addTo = (list, setter) => (p) => {
  console.log("🔍 Adding person - raw data:", p);  // THÊM LOG NÀY
  if (!list.find((x) => x.id === p.id)) {
    const newPerson = {
      ...p,
      fullName: p.fullName || p.name || "",
      name: p.name || p.fullName || "",
    };
    console.log("✅ Person after mapping:", newPerson);  // THÊM LOG NÀY
    setter([...list, newPerson]);
  }
};

  const removeFrom = (list, setter) => (id) =>
    setter(list.filter((p) => p.id !== id));

  const handleAddMe = () => {
    if (currentUser && !meAdded) {
      const userData = localStorage.getItem("user");
      let realName = "Tôi";
      if (userData) {
        try {
          const user = JSON.parse(userData);
          realName = user.fullName || user.username || "Tôi";
        } catch (e) {}
      }

      setOrganizers([
        ...organizers,
        {
          id: currentUser.id,
          name: realName,
          fullName: realName,
          title: currentUser.title || "",
          role: "MEMBER",
          department: currentUser.org || "",
          organization: currentUser.org || "",
          isMe: true,
          isManual: false,
          avatar: (realName || "T").charAt(0).toUpperCase(),
        },
      ]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const fullEventData = {
      ...externalFormData,
      presenters,
      organizers,
      attendees,
      programItems,
      customFields,
      ...(mode === "event" && { coverImage }),
    };

    setExternalFormData(fullEventData);
    onNext(fullEventData);
    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 40px 60px",
        fontFamily: fi,
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            fontSize: 12,
            color: "#bbb",
            fontWeight: 500,
            margin: "0 0 6px",
            letterSpacing: "0.04em",
          }}
        >
          Bước 3 / 3
        </p>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          {mode === "event"
            ? "Hoàn thiện và gửi phê duyệt"
            : "Hoàn thiện kế hoạch"}
        </h2>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
          {mode === "event"
            ? "Kiểm tra lại thông tin và gửi yêu cầu phê duyệt sự kiện"
            : "Kiểm tra lại thông tin và hoàn tất tạo kế hoạch"}
        </p>
      </div>

      <EventSummary formData={externalFormData} />

      <div style={{ marginBottom: 24 }}>
        <Card
          title="Nội dung chương trình"
          icon={AlignJustify}
          accentColor="blue"
          badge={programItems.length}
        >
          <ProgramItems
            items={programItems}
            presenters={presenters}
            onChange={setProgramItems}
          />
        </Card>
      </div>

      {mode === "event" && (
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e5e5e5",
            borderRadius: 14,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Image size={18} color="#8b5cf6" />
            Ảnh bìa sự kiện
          </h3>

          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div
              style={{
                width: 240,
                height: 135,
                borderRadius: 12,
                background: coverImage
                  ? `url(${coverImage}) center/cover`
                  : "#f1f5f9",
                border: "1.5px dashed #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {!coverImage && <Image size={32} color="#94a3b8" />}
            </div>

            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 13,
                  color: "#64748b",
                  margin: "0 0 12px",
                  lineHeight: 1.6,
                }}
              >
                Ảnh bìa sẽ hiển thị ở trang chi tiết sự kiện, giúp thu hút người
                tham gia. Nên sử dụng ảnh có tỷ lệ 16:9, kích thước tối thiểu
                1200x675px.
              </p>

              <div style={{ display: "flex", gap: 12 }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    background: "#8b5cf6",
                    color: "#fff",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: fi,
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#7c3aed")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#8b5cf6")
                  }
                >
                  <Upload size={14} />
                  {isUploading ? "Đang tải..." : "Chọn ảnh"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>

                {coverImage && (
                  <button
                    onClick={() => setCoverImage("")}
                    style={{
                      padding: "10px 20px",
                      background: "#fff",
                      color: "#ef4444",
                      border: "1.5px solid #fecaca",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: fi,
                    }}
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Card
          title="Người trình bày"
          icon={Mic}
          accentColor="blue"
          badge={presenters.length}
        >
          <PeopleBody
            people={presenters}
            onAdd={addTo(presenters, setPresenters)}
            onRemove={removeFrom(presenters, setPresenters)}
            accentColor="blue"
            roleLabel="người trình bày"
          />
        </Card>

        <Card
          title="Ban tổ chức"
          icon={Users}
          accentColor="emerald"
          badge={organizers.length}
        >
          <PeopleBody
            people={organizers}
            onAdd={addTo(organizers, setOrganizers)}
            onRemove={removeFrom(organizers, setOrganizers)}
            showAddMe={!!currentUser}
            meAdded={meAdded}
            onAddMe={handleAddMe}
            accentColor="emerald"
            roleLabel="thành viên BTC"
          />
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <Card
          title="Người tham dự"
          icon={UserPlus}
          accentColor="purple"
          badge={attendees.length}
        >
          <PeopleBody
            people={attendees}
            onAdd={addTo(attendees, setAttendees)}
            onRemove={removeFrom(attendees, setAttendees)}
            accentColor="purple"
            roleLabel="người tham dự"
          />
        </Card>

        <Card
          title="Thông tin bổ sung"
          icon={Settings}
          accentColor="slate"
          badge={customFields.length}
        >
          <CustomFields fields={customFields} onChange={setCustomFields} />
        </Card>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 24,
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "11px 22px",
            border: "1.5px solid #e5e5e5",
            borderRadius: 10,
            background: "#fff",
            color: "#555",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: fi,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fafafa";
            e.currentTarget.style.borderColor = "#d0d0d0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = "#e5e5e5";
          }}
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "11px 28px",
            border: "none",
            borderRadius: 10,
            background: mode === "event" ? "#10b981" : "#2563eb",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontFamily: fi,
            transition: "background .15s",
            boxShadow:
              mode === "event"
                ? "0 2px 10px rgba(16,185,129,0.25)"
                : "0 2px 10px rgba(37,99,235,0.25)",
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background =
                mode === "event" ? "#059669" : "#1d4ed8";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background =
                mode === "event" ? "#10b981" : "#2563eb";
            }
          }}
        >
          {isSubmitting
            ? "Đang xử lý..."
            : mode === "event"
              ? "Gửi phê duyệt"
              : "Hoàn tất kế hoạch"}
          {!isSubmitting && <ArrowRight size={16} />}
        </button>
      </div>

      <style>{`* { box-sizing: border-box; } ::placeholder { color: #ccc; }`}</style>
    </div>
  );
};

export default EventProgramStep;
