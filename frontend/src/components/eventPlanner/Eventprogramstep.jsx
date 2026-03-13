import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Plus, Search, X,
  Mic, Users, UserPlus, Settings,
  Type, Hash, Mail, Link, Calendar, AlignJustify,
  HelpCircle, UserCheck, Check,
} from "lucide-react";

const MOCK_USERS = [
  { id: "GV001", name: "TS. Nguyễn Văn An",  email: "nguyenvanan@uni.edu.vn",  dept: "Khoa CNTT",     avatar: "NA" },
  { id: "GV002", name: "ThS. Trần Thị Bình", email: "tranthibinh@uni.edu.vn",  dept: "Khoa CNTT",     avatar: "TB" },
  { id: "GV003", name: "PGS. Lê Minh Cường", email: "leminhcuong@uni.edu.vn",  dept: "Khoa Kế toán",  avatar: "LC" },
  { id: "GV004", name: "TS. Phạm Thị Dung",  email: "phamthidung@uni.edu.vn",  dept: "Khoa QTKD",     avatar: "PD" },
  { id: "GV005", name: "ThS. Hoàng Văn Em",  email: "hoangvanem@uni.edu.vn",   dept: "Phòng Đào tạo", avatar: "HE" },
];
const CURRENT_USER = { id: "ME", name: "Bạn (Tôi)", email: "me@uni.edu.vn", dept: "Khoa CNTT", avatar: "TÔI", isMe: true };
const FIELD_TYPES = [
  { value: "short_text", label: "Văn bản ngắn", icon: Type },
  { value: "long_text",  label: "Văn bản dài",  icon: AlignJustify },
  { value: "number",     label: "Số",            icon: Hash },
  { value: "email",      label: "Email",         icon: Mail },
  { value: "url",        label: "Đường dẫn",     icon: Link },
  { value: "datetime",   label: "Ngày giờ",      icon: Calendar },
  { value: "other",      label: "Khác",          icon: HelpCircle },
];

const ROLE_OPTIONS = [
  { value: "Đồng chủ trì", label: "Đồng chủ trì" },
  { value: "Chủ trì", label: "Chủ trì" },
  { value: "Người trình bày", label: "Người trình bày" },
  { value: "Thành viên BTC", label: "Thành viên BTC" },
  { value: "Người tham dự", label: "Người tham dự" },
  { value: "Khác", label: "Khác" },
];

const AVATAR_BG = ["#3b82f6","#10b981","#8b5cf6","#f43f5e","#f59e0b","#06b6d4"];

/* ── Primitives ── */
const fi = "'Inter','Segoe UI',sans-serif";

function Avatar({ initials, idx = 0, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: AVATAR_BG[idx % AVATAR_BG.length],
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size > 32 ? 12 : 10, fontWeight: 700, flexShrink: 0, fontFamily: fi }}>
      {initials}
    </div>
  );
}

function Inp({ error, style, ...p }) {
  const [f, setF] = useState(false);
  return <input {...p}
    onFocus={e => { setF(true); p.onFocus?.(e); }} onBlur={e => { setF(false); p.onBlur?.(e); }}
    style={{ width: "100%", padding: "11px 14px", fontSize: 14, fontFamily: fi, outline: "none",
      boxSizing: "border-box", color: "#111", transition: "border .15s", borderRadius: 9,
      background: error ? "#fff5f5" : "#fff",
      border: `1.5px solid ${error ? "#fca5a5" : f ? "#2563eb" : "#e5e5e5"}`, ...style }} />;
}

function Sel({ children, style, ...p }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ position: "relative", ...style }}>
      <select {...p} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ width: "100%", padding: "11px 36px 11px 14px", fontSize: 14, fontFamily: fi,
          outline: "none", appearance: "none", cursor: "pointer", color: "#111", borderRadius: 9,
          background: "#fff", border: `1.5px solid ${f ? "#2563eb" : "#e5e5e5"}`, transition: "border .15s" }}>
        {children}
      </select>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <path d="M2 4l4 4 4-4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ── Section Card ── */
function Card({ title, icon: Icon, accentColor, badge, children }) {
  const colors = {
    blue:    { icon: "#2563eb", border: "#dbeafe", header: "#eff6ff", dot: "#2563eb" },
    emerald: { icon: "#10b981", border: "#d1fae5", header: "#f0fdf8", dot: "#10b981" },
    purple:  { icon: "#8b5cf6", border: "#ede9fe", header: "#faf5ff", dot: "#8b5cf6" },
    slate:   { icon: "#64748b", border: "#e2e8f0", header: "#f8fafc", dot: "#64748b" },
  };
  const c = colors[accentColor] || colors.slate;
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${c.border}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Card header */}
      <div style={{ padding: "16px 24px", background: c.header, borderBottom: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#fff", border: `1px solid ${c.border}`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={c.icon} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>{title}</span>
        {badge != null && badge > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: c.icon, background: "#fff",
            border: `1px solid ${c.border}`, padding: "1px 9px", borderRadius: 99, marginLeft: 2 }}>
            {badge}
          </span>
        )}
      </div>
      {/* Card body */}
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

/* ── People Search ── */
function PeopleSearch({ onSelect, accentColor = "blue" }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [done, setDone] = useState(false);
  const colors = { blue: "#2563eb", emerald: "#10b981", purple: "#8b5cf6" };
  const ac = colors[accentColor] || colors.blue;

  const search = () => {
    if (!q.trim()) return;
    const ql = q.toLowerCase();
    setRes(MOCK_USERS.filter(u => u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql) || u.id.toLowerCase().includes(ql)));
    setDone(true);
  };
  const pick = u => { onSelect(u); setQ(""); setRes([]); setDone(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} color="#ccc" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <Inp placeholder="Tìm theo tên, email hoặc mã số..."
            value={q} onChange={e => { setQ(e.target.value); setDone(false); }}
            onKeyDown={e => e.key === "Enter" && search()}
            style={{ paddingLeft: 38, fontSize: 13 }} />
        </div>
        <button onClick={search}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: ac,
            color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: fi, flexShrink: 0, transition: "opacity .15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          <Search size={13} /> Tìm
        </button>
      </div>
      {done && (
        <div style={{ border: "1.5px solid #e5e5e5", borderRadius: 10, overflow: "hidden" }}>
          {res.length === 0
            ? <p style={{ padding: 16, textAlign: "center", fontSize: 13, color: "#aaa", margin: 0 }}>Không tìm thấy kết quả.</p>
            : res.map((u, i) => (
              <div key={u.id} onClick={() => pick(u)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  cursor: "pointer", borderBottom: i < res.length - 1 ? "1px solid #f0f0f0" : "none",
                  transition: "background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fbff"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                <Avatar initials={u.avatar} idx={i} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: 0 }}>{u.name}</p>
                  <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{u.id} · {u.email}</p>
                </div>
                <span style={{ fontSize: 11, color: "#888", background: "#f5f5f5",
                  padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>{u.dept}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* ── Manual Person Form ── */
function ManualForm({ onAdd, onCancel, roleLabel }) {
  const [d, setD] = useState({ name: "", title: "", org: "", role: "", customRole: "" });
  const [err, setErr] = useState({ name: false, role: false });

  const go = () => {
    let hasError = false;
    if (!d.name.trim()) { setErr(prev => ({ ...prev, name: true })); hasError = true; }
    if (!d.role) { setErr(prev => ({ ...prev, role: true })); hasError = true; }
    if (hasError) return;

    const finalRole = d.role === "Khác" ? (d.customRole.trim() || "Khác") : d.role;

    onAdd({
      id: `m_${Date.now()}`,
      name: d.name.trim(),
      title: d.title.trim(),
      org: d.org.trim(),
      role: finalRole,
      isManual: true,
      avatar: d.name.trim().split(" ").map(w => w[0]).slice(-2).join("").toUpperCase() || "NG",
    });
  };

  const lbl = t => <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>{t}</label>;

  return (
    <div style={{ padding: "18px 20px", background: "#fafafa", border: "1.5px dashed #e0e0e0", borderRadius: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 16px" }}>
        Thêm {roleLabel} thủ công
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          {lbl("Họ và tên *")}
          <Inp
            placeholder="Nguyễn Văn A"
            error={err.name}
            value={d.name}
            onChange={e => { setD({ ...d, name: e.target.value }); setErr(prev => ({ ...prev, name: false })); }}
          />
        </div>
        <div>
          {lbl("Chức danh / Vai trò")}
          <Inp
            placeholder="TS., ThS., Trưởng BTC..."
            value={d.title}
            onChange={e => setD({ ...d, title: e.target.value })}
          />
        </div>
        <div>
          {lbl("Đơn vị")}
          <Inp
            placeholder="Trường / Khoa / Công ty..."
            value={d.org}
            onChange={e => setD({ ...d, org: e.target.value })}
          />
        </div>
        <div>
          {lbl("Vai trò *")}
          <Sel
            value={d.role}
            onChange={e => {
              setD({ ...d, role: e.target.value, customRole: "" });
              setErr(prev => ({ ...prev, role: false }));
            }}
            error={err.role}
          >
            <option value="">Chọn vai trò</option>
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Sel>
          {d.role === "Khác" && (
            <Inp
              placeholder="Nhập vai trò cụ thể..."
              value={d.customRole}
              onChange={e => setD({ ...d, customRole: e.target.value })}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={go}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#10b981",
            color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fi }}
          onMouseEnter={e => e.currentTarget.style.background = "#059669"}
          onMouseLeave={e => e.currentTarget.style.background = "#10b981"}>
          <Plus size={14} /> Thêm
        </button>
        <button onClick={onCancel}
          style={{ padding: "9px 16px", background: "#fff", color: "#555", border: "1.5px solid #e5e5e5",
            borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: fi }}>Hủy</button>
      </div>
    </div>
  );
}

/* ── Person Card ── */
function PersonCard({ person, idx, onRemove, accentBg, accentBorder }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
        border: `1.5px solid ${person.isMe ? "#ddd6fe" : accentBorder}`,
        borderRadius: 11, background: h ? (person.isMe ? "#f0eeff" : accentBg) : (person.isMe ? "#f5f3ff" : "#fff"),
        transition: "all .15s" }}>
      <Avatar initials={person.avatar} idx={idx} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
            {person.title ? `${person.title} ` : ""}{person.name}
          </span>
          {person.isMe && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#ede9fe", color: "#7c3aed" }}>Tôi</span>}
          {person.isManual && !person.isMe && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#fef3c7", color: "#d97706" }}>Thủ công</span>}
        </div>
        <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{person.email || person.org || person.dept || ""}</p>
      </div>
      <button onClick={() => onRemove(person.id)}
        style={{ border: "none", background: "none", cursor: "pointer", color: "#ccc",
          padding: 4, borderRadius: 6, transition: "color .12s", display: "flex" }}
        onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
        onMouseLeave={e => e.currentTarget.style.color = "#ccc"}>
        <X size={15} />
      </button>
    </div>
  );
}

/* ── People Body (inside card) ── */
function PeopleBody({ people, onAdd, onRemove, showAddMe, meAdded, onAddMe, accentColor, roleLabel }) {
  const [mode, setMode] = useState(null);
  const acs = {
    blue:    { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", hbg: "#dbeafe" },
    emerald: { color: "#10b981", bg: "#f0fdf8", border: "#a7f3d0", hbg: "#d1fae5" },
    purple:  { color: "#8b5cf6", bg: "#faf5ff", border: "#ddd6fe", hbg: "#ede9fe" },
  };
  const ac = acs[accentColor] || acs.blue;
  const add = p => { if (!people.find(x => x.id === p.id)) { onAdd(p); setMode(null); } };

  const ActionBtn = ({ children, onClick, color, bg, border }) => {
    const [h, setH] = useState(false);
    return (
      <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px",
          border: `1.5px solid ${h ? color : border}`, borderRadius: 9,
          background: h ? bg : "#fff", color, fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: fi, transition: "all .15s" }}>
        {children}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* People grid */}
      {people.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {people.map((p, i) => (
            <PersonCard key={p.id} person={p} idx={i} onRemove={onRemove}
              accentBg={ac.bg} accentBorder={ac.border} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {people.length === 0 && mode === null && (
        <div style={{ padding: "20px", textAlign: "center", background: "#fafafa",
          border: "1.5px dashed #e5e5e5", borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: "#bbb", margin: 0 }}>Chưa có {roleLabel} nào. Thêm bên dưới.</p>
        </div>
      )}

      {/* Buttons */}
      {mode === null && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <ActionBtn onClick={() => setMode("search")} color={ac.color} bg={ac.bg} border={ac.border}>
            <Search size={14} /> Tìm kiếm hệ thống
          </ActionBtn>
          <ActionBtn onClick={() => setMode("manual")} color="#555" bg="#fafafa" border="#e5e5e5">
            <Plus size={14} /> Thêm thủ công
          </ActionBtn>
          {showAddMe && !meAdded && (
            <ActionBtn onClick={onAddMe} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe">
              <UserCheck size={14} /> Thêm tôi vào BTC
            </ActionBtn>
          )}
        </div>
      )}

      {mode === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PeopleSearch onSelect={add} accentColor={accentColor} />
          <button onClick={() => setMode(null)}
            style={{ fontSize: 12, color: "#aaa", background: "none", border: "none",
              cursor: "pointer", textDecoration: "underline", fontFamily: fi, textAlign: "left", padding: 0 }}>
            ← Đóng tìm kiếm
          </button>
        </div>
      )}

      {mode === "manual" && (
        <ManualForm onAdd={add} onCancel={() => setMode(null)} roleLabel={roleLabel} />
      )}
    </div>
  );
}

/* ── Custom Fields ── */
function CustomFields({ fields, onChange }) {
  const [show, setShow] = useState(false);
  const [nf, setNf] = useState({ name: "", type: "short_text", description: "" });
  const [err, setErr] = useState(false);

  const add = () => {
    if (!nf.name.trim()) { setErr(true); return; }
    onChange([...fields, { id: `f_${Date.now()}`, ...nf }]);
    setNf({ name: "", type: "short_text", description: "" });
    setErr(false); setShow(false);
  };
  const lbl = t => <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 6 }}>{t}</label>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>Thêm các trường thông tin tùy chỉnh cho form đăng ký sự kiện.</p>

      {fields.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {fields.map(f => {
            const TI = FIELD_TYPES.find(t => t.value === f.type)?.icon || HelpCircle;
            const tl = FIELD_TYPES.find(t => t.value === f.type)?.label || f.type;
            return (
              <div key={f.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
                background: "#fafafa", border: "1.5px solid #e5e5e5", borderRadius: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #e5e5e5",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <TI size={13} color="#94a3b8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111", margin: "0 0 2px" }}>{f.name}</p>
                  <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{tl}{f.description ? ` · ${f.description}` : ""}</p>
                </div>
                <button onClick={() => onChange(fields.filter(x => x.id !== f.id))}
                  style={{ border: "none", background: "none", cursor: "pointer", color: "#ccc", padding: 3, borderRadius: 5, display: "flex" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={e => e.currentTarget.style.color = "#ccc"}>
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {show ? (
        <div style={{ padding: "18px 20px", background: "#fafafa", border: "1.5px dashed #e0e0e0", borderRadius: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 16px" }}>Thêm trường mới</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>{lbl("Tên trường *")}<Inp placeholder="VD: Số điện thoại liên hệ" error={err && !nf.name} value={nf.name} onChange={e => { setNf({ ...nf, name: e.target.value }); setErr(false); }} /></div>
            <div>{lbl("Loại trường")}<Sel value={nf.type} onChange={e => setNf({ ...nf, type: e.target.value })}>
              {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Sel></div>
            <div style={{ gridColumn: "1/-1" }}>{lbl("Mô tả / Hướng dẫn điền")}<Inp placeholder="Ghi chú hoặc hướng dẫn..." value={nf.description} onChange={e => setNf({ ...nf, description: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={add}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#2563eb",
                color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fi }}
              onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
              onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}>
              <Plus size={14} /> Thêm trường
            </button>
            <button onClick={() => { setShow(false); setErr(false); }}
              style={{ padding: "9px 16px", background: "#fff", color: "#555", border: "1.5px solid #e5e5e5", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: fi }}>Hủy</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px",
            width: "100%", border: "1.5px dashed #e0e0e0", borderRadius: 10, background: "#fff",
            color: "#aaa", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: fi, transition: "all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.background = "#f8fbff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0e0e0"; e.currentTarget.style.color = "#aaa"; e.currentTarget.style.background = "#fff"; }}>
          <Plus size={15} /> Thêm trường thông tin
        </button>
      )}
    </div>
  );
}

export const EventProgramStep = ({ onBack, onNext }) => {
  const [presenters,   setPresenters]   = useState([]);
  const [organizers,   setOrganizers]   = useState([]);
  const [attendees,    setAttendees]    = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const meAdded = organizers.some(o => o.id === "ME");

  const addTo    = (list, setter) => p  => { if (!list.find(x => x.id === p.id)) setter([...list, p]); };
  const removeFrom = (list, setter) => id => setter(list.filter(p => p.id !== id));

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "0 40px 60px", fontFamily: fi }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: "#bbb", fontWeight: 500, margin: "0 0 6px", letterSpacing: "0.04em" }}>Bước 3 / 3</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Chương trình sự kiện</h2>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Thiết lập nhân sự và thông tin bổ sung cho sự kiện</p>
      </div>

      {/* Top row: 2 cards side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card title="Người trình bày" icon={Mic} accentColor="blue" badge={presenters.length}>
          <PeopleBody people={presenters}
            onAdd={addTo(presenters, setPresenters)}
            onRemove={removeFrom(presenters, setPresenters)}
            accentColor="blue" roleLabel="người trình bày" />
        </Card>

        <Card title="Ban tổ chức" icon={Users} accentColor="emerald" badge={organizers.length}>
          <PeopleBody people={organizers}
            onAdd={addTo(organizers, setOrganizers)}
            onRemove={removeFrom(organizers, setOrganizers)}
            showAddMe meAdded={meAdded}
            onAddMe={() => { if (!meAdded) setOrganizers([...organizers, CURRENT_USER]); }}
            accentColor="emerald" roleLabel="thành viên BTC" />
        </Card>
      </div>

      {/* Bottom row: 2 cards side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <Card title="Người tham dự" icon={UserPlus} accentColor="purple" badge={attendees.length}>
          <PeopleBody people={attendees}
            onAdd={addTo(attendees, setAttendees)}
            onRemove={removeFrom(attendees, setAttendees)}
            accentColor="purple" roleLabel="người tham dự" />
        </Card>

        <Card title="Thông tin bổ sung" icon={Settings} accentColor="slate" badge={customFields.length}>
          <CustomFields fields={customFields} onChange={setCustomFields} />
        </Card>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 24, borderTop: "1px solid #f0f0f0" }}>
        <button onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 22px",
            border: "1.5px solid #e5e5e5", borderRadius: 10, background: "#fff", color: "#555",
            fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: fi, transition: "all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#d0d0d0"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e5e5"; }}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <button onClick={() => onNext?.({ presenters, organizers, attendees, customFields })}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 28px",
            border: "none", borderRadius: 10, background: "#2563eb", color: "#fff",
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: fi, transition: "background .15s",
            boxShadow: "0 2px 10px rgba(37,99,235,0.25)" }}
          onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
          onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}>
          Tiếp tục <ArrowRight size={16} />
        </button>
      </div>

      <style>{`* { box-sizing: border-box; } ::placeholder { color: #ccc; }`}</style>
    </div>
  );
};

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f8", padding: "40px 0", fontFamily: fi }}>
      <EventProgramStep onBack={() => {}} onNext={d => console.log(d)} />
    </div>
  );
}