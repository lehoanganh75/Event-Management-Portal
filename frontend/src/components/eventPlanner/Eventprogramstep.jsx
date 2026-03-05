import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Plus, Search, X,
  Mic, BookOpen, Users, UserPlus, Settings,
  Type, Hash, Mail, Link, Calendar, AlignJustify,
  HelpCircle, UserCheck, Info, Save,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: "GV001", name: "TS. Nguyễn Văn An",   email: "nguyenvanan@uni.edu.vn",  dept: "Khoa CNTT",     avatar: "NA" },
  { id: "GV002", name: "ThS. Trần Thị Bình",  email: "tranthibinh@uni.edu.vn",  dept: "Khoa CNTT",     avatar: "TB" },
  { id: "GV003", name: "PGS. Lê Minh Cường",  email: "leminhcuong@uni.edu.vn",  dept: "Khoa Kế toán",  avatar: "LC" },
  { id: "GV004", name: "TS. Phạm Thị Dung",   email: "phamthidung@uni.edu.vn",  dept: "Khoa QTKD",     avatar: "PD" },
  { id: "GV005", name: "ThS. Hoàng Văn Em",   email: "hoangvanem@uni.edu.vn",   dept: "Phòng Đào tạo", avatar: "HE" },
];

const CURRENT_USER = {
  id: "ME", name: "Bạn (Tôi)", email: "me@uni.edu.vn",
  dept: "Khoa CNTT", avatar: "TÔI", isMe: true,
};

const FIELD_TYPES = [
  { value: "short_text", label: "Văn bản ngắn", icon: Type },
  { value: "long_text",  label: "Văn bản dài",  icon: AlignJustify },
  { value: "number",     label: "Số",            icon: Hash },
  { value: "email",      label: "Email",         icon: Mail },
  { value: "url",        label: "Đường dẫn",     icon: Link },
  { value: "datetime",   label: "Ngày giờ",      icon: Calendar },
  { value: "other",      label: "Khác",          icon: HelpCircle },
];

const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-purple-500",
  "bg-rose-500",  "bg-amber-500",  "bg-cyan-500",
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials, idx }) {
  const color = avatarColors[(idx ?? 0) % avatarColors.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── People Search ────────────────────────────────────────────────────────────
function PeopleSearch({ onSelect }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    const q = query.toLowerCase();
    setResults(MOCK_USERS.filter(
      (u) => u.name.toLowerCase().includes(q) ||
             u.email.toLowerCase().includes(q) ||
             u.id.toLowerCase().includes(q)
    ));
    setSearched(true);
  };

  const select = (u) => { onSelect(u); setQuery(""); setResults([]); setSearched(false); };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc mã số..."
            className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1.5"
        >
          <Search size={13} /> Tìm
        </button>
      </div>

      {searched && (
        <div className="border-2 border-slate-100 rounded-lg overflow-hidden">
          {results.length === 0
            ? <p className="p-3 text-center text-sm text-slate-500">Không tìm thấy kết quả.</p>
            : results.map((u, i) => (
              <div
                key={u.id}
                onClick={() => select(u)}
                className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition border-b border-slate-100 last:border-b-0"
              >
                <Avatar initials={u.avatar} idx={i} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.id} · {u.email}</p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{u.dept}</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ─── Manual Person Form ───────────────────────────────────────────────────────
function ManualPersonForm({ onAdd, onCancel, roleLabel = "người" }) {
  const [data, setData] = useState({ name: "", title: "", org: "", email: "" });
  const [err,  setErr]  = useState(false);

  const handleAdd = () => {
    if (!data.name.trim()) { setErr(true); return; }
    onAdd({
      id: `manual_${Date.now()}`,
      ...data,
      isManual: true,
      avatar: data.name.trim().split(" ").map(w => w[0]).slice(-2).join("").toUpperCase(),
    });
    setData({ name: "", title: "", org: "", email: "" });
  };

  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thêm {roleLabel} thủ công</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Họ và tên <span className="text-red-500">*</span></label>
          <input
            type="text" placeholder="Nguyễn Văn A"
            className={`w-full p-2.5 border-2 rounded-lg text-sm outline-none focus:border-blue-500 bg-white ${err && !data.name ? "border-red-300" : "border-slate-200"}`}
            value={data.name}
            onChange={(e) => { setData({ ...data, name: e.target.value }); setErr(false); }}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Chức danh / Vai trò</label>
          <input
            type="text" placeholder="TS., ThS., Trưởng BTC..."
            className="w-full p-2.5 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
            value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Đơn vị</label>
          <input
            type="text" placeholder="Trường / Khoa / Công ty..."
            className="w-full p-2.5 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
            value={data.org} onChange={(e) => setData({ ...data, org: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
          <input
            type="email" placeholder="example@email.com"
            className="w-full p-2.5 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
            value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleAdd} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-1.5">
          <Plus size={14} /> Thêm
        </button>
        <button onClick={onCancel} className="px-4 py-2 border-2 border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition">
          Hủy
        </button>
      </div>
    </div>
  );
}

// ─── Reusable People Section ──────────────────────────────────────────────────
function PeopleSection({ title, icon: Icon, iconColor, people, onAdd, onRemove,
  showAddMeButton = false, meAdded = false, onAddMe,
  accentColor = "blue", roleLabel = "người" }) {

  const [mode, setMode] = useState(null);

  const accentMap = {
    blue:    { searchBtn: "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100",       card: "bg-blue-50 border-blue-100" },
    emerald: { searchBtn: "border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100", card: "bg-emerald-50 border-emerald-100" },
    purple:  { searchBtn: "border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100",    card: "bg-purple-50 border-purple-100" },
  };
  const ac = accentMap[accentColor] || accentMap.blue;

  const handleAdd = (p) => { if (people.find(x => x.id === p.id)) return; onAdd(p); setMode(null); };

  return (
    <div className="space-y-3">
      {/* Title row */}
      <div className="flex items-center gap-2">
        <Icon size={15} className={iconColor} />
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        {people.length > 0 && (
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {people.length}
          </span>
        )}
      </div>

      {/* People list */}
      {people.length > 0 && (
        <div className="space-y-2">
          {people.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-2.5 p-2.5 border rounded-lg ${p.isMe ? "bg-indigo-50 border-indigo-100" : ac.card}`}>
              <Avatar initials={p.avatar} idx={i} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {p.title ? `${p.title} ` : ""}{p.name}
                  {p.isMe    && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Tôi</span>}
                  {p.isManual && !p.isMe && <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Thủ công</span>}
                </p>
                <p className="text-xs text-slate-500 truncate">{p.email || p.org || p.dept || ""}</p>
              </div>
              <button onClick={() => onRemove(p.id)} className="text-slate-300 hover:text-red-500 transition flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {mode === null && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMode("search")} className={`flex items-center gap-1.5 px-3 py-2 border-2 rounded-lg text-xs font-medium transition ${ac.searchBtn}`}>
            <Search size={13} /> Tìm kiếm
          </button>
          <button onClick={() => setMode("manual")} className="flex items-center gap-1.5 px-3 py-2 border-2 border-slate-200 text-slate-600 bg-slate-50 rounded-lg text-xs font-medium hover:bg-slate-100 transition">
            <Plus size={13} /> Thêm thủ công
          </button>
          {showAddMeButton && !meAdded && (
            <button onClick={onAddMe} className="flex items-center gap-1.5 px-3 py-2 border-2 border-indigo-200 text-indigo-600 bg-indigo-50 rounded-lg text-xs font-medium hover:bg-indigo-100 transition">
              <UserCheck size={13} /> Thêm tôi vào BTC
            </button>
          )}
        </div>
      )}

      {mode === "search" && (
        <div className="space-y-2">
          <PeopleSearch onSelect={handleAdd} />
          <button onClick={() => setMode(null)} className="text-xs text-slate-500 hover:text-slate-700 underline">
            Đóng tìm kiếm
          </button>
        </div>
      )}

      {mode === "manual" && (
        <ManualPersonForm onAdd={handleAdd} onCancel={() => setMode(null)} roleLabel={roleLabel} />
      )}
    </div>
  );
}

// ─── Custom Fields Section ────────────────────────────────────────────────────
function CustomFieldsSection({ fields, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [newField, setNewField] = useState({ name: "", type: "short_text", description: "" });
  const [err, setErr] = useState(false);

  const addField = () => {
    if (!newField.name.trim()) { setErr(true); return; }
    onChange([...fields, { id: `field_${Date.now()}`, ...newField }]);
    setNewField({ name: "", type: "short_text", description: "" });
    setErr(false);
    setShowForm(false);
  };

  const removeField = (id) => onChange(fields.filter(f => f.id !== id));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Settings size={15} className="text-slate-500" />
        <h3 className="text-sm font-bold text-slate-700">Thông tin bổ sung</h3>
        {fields.length > 0 && (
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {fields.length} trường
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400">Thêm các trường thông tin tùy chỉnh cho sự kiện.</p>

      {/* Fields list */}
      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((f) => {
            const TypeIcon  = FIELD_TYPES.find(t => t.value === f.type)?.icon  || HelpCircle;
            const typeLabel = FIELD_TYPES.find(t => t.value === f.type)?.label || f.type;
            return (
              <div key={f.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TypeIcon size={13} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-400">{typeLabel}{f.description ? ` · ${f.description}` : ""}</p>
                </div>
                <button onClick={() => removeField(f.id)} className="text-slate-300 hover:text-red-500 transition flex-shrink-0 mt-0.5">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add field */}
      {showForm ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thêm trường mới</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tên trường <span className="text-red-500">*</span></label>
              <input
                type="text" placeholder="VD: Số điện thoại liên hệ"
                className={`w-full p-2.5 border-2 rounded-lg text-sm outline-none focus:border-blue-500 bg-white ${err && !newField.name ? "border-red-300" : "border-slate-200"}`}
                value={newField.name}
                onChange={(e) => { setNewField({ ...newField, name: e.target.value }); setErr(false); }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Loại trường</label>
              <select
                className="w-full p-2.5 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                value={newField.type} onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              >
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-600 block mb-1">Mô tả trường</label>
              <input
                type="text" placeholder="Ghi chú hoặc hướng dẫn điền..."
                className="w-full p-2.5 border-2 border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                value={newField.description} onChange={(e) => setNewField({ ...newField, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addField} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-1.5">
              <Plus size={14} /> Thêm trường
            </button>
            <button onClick={() => { setShowForm(false); setErr(false); }} className="px-4 py-2 border-2 border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition">
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 w-full justify-center border-2 border-dashed border-slate-300 text-slate-500 rounded-lg text-sm font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          <Plus size={15} /> Thêm trường thông tin
        </button>
      )}
    </div>
  );
}

// ─── Section Card Wrapper ─────────────────────────────────────────────────────
function SectionCard({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {children}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export const EventProgramStep = ({ onBack, onNext }) => {
  const [presenters,  setPresenters]  = useState([]);
  const [organizers,  setOrganizers]  = useState([]);
  const [attendees,   setAttendees]   = useState([]);
  const [customFields, setCustomFields] = useState([]);

  const meAdded = organizers.some(o => o.id === "ME");

  const makeAdd    = (list, setter) => (p) => { if (!list.find(x => x.id === p.id)) setter([...list, p]); };
  const makeRemove = (list, setter) => (id) => setter(list.filter(p => p.id !== id));

  const handleNext = () => {
    onNext && onNext({ presenters, organizers, attendees, customFields });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">

      {/* Page Header */}
      <SectionCard>
        <h1 className="text-xl font-bold text-slate-800 mb-1">Chương trình sự kiện</h1>
        <p className="text-sm text-slate-500">Thiết lập nhân sự và thông tin bổ sung cho sự kiện</p>
      </SectionCard>

      {/* ── 1. Người trình bày ─── */}
      <SectionCard>
        <PeopleSection
          title="Người trình bày"
          icon={Mic} iconColor="text-blue-500"
          people={presenters}
          onAdd={makeAdd(presenters, setPresenters)}
          onRemove={makeRemove(presenters, setPresenters)}
          accentColor="blue" roleLabel="người trình bày"
        />
      </SectionCard>

      {/* ── 2. Ban tổ chức ───────── */}
      <SectionCard>
        <PeopleSection
          title="Ban tổ chức"
          icon={Users} iconColor="text-emerald-500"
          people={organizers}
          onAdd={makeAdd(organizers, setOrganizers)}
          onRemove={makeRemove(organizers, setOrganizers)}
          showAddMeButton meAdded={meAdded}
          onAddMe={() => { if (!meAdded) setOrganizers([...organizers, CURRENT_USER]); }}
          accentColor="emerald" roleLabel="thành viên BTC"
        />
      </SectionCard>

      {/* ── 3. Người tham dự ────── */}
      <SectionCard>
        <PeopleSection
          title="Người tham dự sự kiện"
          icon={UserPlus} iconColor="text-purple-500"
          people={attendees}
          onAdd={makeAdd(attendees, setAttendees)}
          onRemove={makeRemove(attendees, setAttendees)}
          accentColor="purple" roleLabel="người tham dự"
        />
      </SectionCard>

      {/* ── 4. Thông tin bổ sung ── */}
      <SectionCard>
        <CustomFieldsSection fields={customFields} onChange={setCustomFields} />
      </SectionCard>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 border-2 border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition text-sm"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
        >
          Tiếp tục <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <EventProgramStep
        onBack={() => alert("Quay lại")}
        onNext={(data) => { console.log(data); alert("Tiếp tục!"); }}
      />
    </div>
  );
}