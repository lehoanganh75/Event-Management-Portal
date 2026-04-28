import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Info,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Award,
  Check,
  Sparkles,
  ChevronDown,
  Upload,
  Building,
  Mail,
  Briefcase,
  UserPlus,
  MessageSquare,
  Clock,
  Timer,
  Search,
  UserCheck
} from "lucide-react";
import ImageUpload from "../common/ImageUpload.jsx";
import eventService from "../../services/eventService";
import authService from "../../services/authService";

const Field = ({ label, icon: Icon, required, error, hint, action, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "#1e293b",
        }}
      >
        {Icon && <Icon size={14} className="text-slate-400" />}
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {action}
    </div>
    {children}
    {error && (
      <p style={{ fontSize: 12, color: "#ef4444", margin: 0, fontWeight: 500 }}>{error}</p>
    )}
  </div>
);

const Input = ({ error, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "10px 14px",
        fontSize: 14,
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        color: "#1e293b",
        transition: "all .15s",
        borderRadius: 8,
        background: "#fff",
        border: `1px solid ${error ? "#fca5a5" : focused ? "#8b5cf6" : "#e2e8f0"}`,
        ...style,
      }}
    />
  );
};

const Textarea = ({ error, rows = 3, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      rows={rows}
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "10px 14px",
        fontSize: 14,
        fontFamily: "inherit",
        outline: "none",
        resize: "none",
        boxSizing: "border-box",
        color: "#1e293b",
        lineHeight: 1.6,
        transition: "all .15s",
        borderRadius: 8,
        background: "#fff",
        border: `1px solid ${error ? "#fca5a5" : focused ? "#8b5cf6" : "#e2e8f0"}`,
      }}
    />
  );
};

const Select = ({ children, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "10px 40px 10px 14px",
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
          appearance: "none",
          cursor: "pointer",
          color: "#1e293b",
          borderRadius: 8,
          background: "#fff",
          border: `1px solid ${focused ? "#8b5cf6" : "#e2e8f0"}`,
          transition: "all .15s",
        }}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#94a3b8",
        }}
      />
    </div>
  );
};

const AISuggestionBox = ({ title, suggestions, onSelect }) => (
  <div style={{
    background: "#fdfaff",
    border: "1px solid #f3e8ff",
    borderRadius: 12,
    padding: "16px",
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: 12
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8b5cf6", fontSize: 13, fontWeight: 600 }}>
      <Sparkles size={14} />
      {title}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {suggestions.map((s, i) => (
        <div
          key={i}
          onClick={() => onSelect(s)}
          style={{
            background: "#fff",
            padding: "12px 16px",
            borderRadius: 8,
            fontSize: 13,
            color: "#475569",
            cursor: "pointer",
            border: "1px solid #f1f5f9",
            transition: "all .15s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#ddd6fe"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#f1f5f9"}
        >
          {typeof s === 'string' ? s : s.label}
        </div>
      ))}
    </div>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <div
    onClick={onChange}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      userSelect: "none",
      padding: "4px 0"
    }}
  >
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: `1.5px solid ${checked ? "#2563eb" : "#cbd5e1"}`,
        background: checked ? "#2563eb" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .15s"
      }}
    >
      {checked && <Check size={12} color="#fff" strokeWidth={4} />}
    </div>
    <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>{label}</span>
  </div>
);

const ORGANIZER_ROLES = [
  { value: "ORGANIZER", label: "Người tổ chức" },
  { value: "LEADER", label: "Trưởng ban" },
  { value: "COORDINATOR", label: "Điều phối viên" },
  { value: "MEMBER", label: "Thành viên" },
  { value: "ADVISOR", label: "Cố vấn" }
];

const EVENT_TYPES = [
  { value: "WORKSHOP", label: "Workshop" },
  { value: "SEMINAR", label: "Seminar" },
  { value: "TALKSHOW", label: "Talkshow" },
  { value: "COMPETITION", label: "Competition (Cuộc thi)" },
  { value: "CONFERENCE", label: "Conference (Hội nghị)" },
  { value: "WEBINAR", label: "Webinar" },
  { value: "CONCERT", label: "Concert (Hòa nhạc)" },
  { value: "FESTIVAL", label: "Festival (Lễ hội)" },
  { value: "OTHER", label: "Khác" }
];

const SESSION_TYPES = [
  { value: "KEYNOTE", label: "Keynote (Phiên chính)" },
  { value: "WORKSHOP", label: "Workshop (Thực hành)" },
  { value: "PANEL", label: "Panel Discussion (Thảo luận)" },
  { value: "BREAK", label: "Break (Giải lao)" },
  { value: "NETWORKING", label: "Networking (Kết nối)" }
];

const DateTimeField = ({ label, value, onChange, error, required }) => {
  // Handle string, Date object, or null/undefined
  let stringValue = "";
  if (typeof value === 'string') {
    stringValue = value;
  } else if (value instanceof Date && !isNaN(value)) {
    // Format Date to YYYY-MM-DDTHH:mm (local time)
    const pad = (num) => String(num).padStart(2, '0');
    const yyyy = value.getFullYear();
    const mm = pad(value.getMonth() + 1);
    const dd = pad(value.getDate());
    const hh = pad(value.getHours());
    const min = pad(value.getMinutes());
    stringValue = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  const dateVal = stringValue ? stringValue.split('T')[0] : "";
  const timeVal = stringValue ? stringValue.split('T')[1] || "00:00" : "00:00";

  return (
    <Field label={label} required={required} error={error}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input
          type="date"
          value={dateVal}
          onChange={(e) => onChange(e.target.value + "T" + timeVal)}
          style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}
        />
        <input
          type="time"
          value={timeVal}
          onChange={(e) => onChange(dateVal + "T" + e.target.value)}
          style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}
        />
      </div>
    </Field>
  );
};

export default function ManualInputStep({
  formData,
  setFormData,
  onNext,
  onBack,
  activeSections = [],
  isPlanMode = false,
}) {
  const term = isPlanMode ? "kế hoạch" : "sự kiện";
  const [errors, setErrors] = useState({});
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showOrgAISuggestions, setShowOrgAISuggestions] = useState(false);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [showLocationAISuggestions, setShowLocationAISuggestions] = useState(false);
  const [showMaxParticipantsAISuggestions, setShowMaxParticipantsAISuggestions] = useState(false);
  const [showGoalAISuggestions, setShowGoalAISuggestions] = useState(false);
  const [showRequirementAISuggestions, setShowRequirementAISuggestions] = useState(false);
  const [showDescriptionAISuggestions, setShowDescriptionAISuggestions] = useState(false);

  const [orgs, setOrgs] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoadingOrgs(true);
      try {
        const res = await eventService.getAllOrganizations();
        setOrgs(res.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách tổ chức:", err);
      } finally {
        setLoadingOrgs(false);
      }
    };
    if (activeSections.includes('organization')) {
      fetchData();
    }
  }, [activeSections]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await authService.getAllAccounts();
      setSystemUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách người dùng:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const isVisible = (section) => activeSections.length === 0 || activeSections.includes(section);

  const validate = () => {
    const e = {};
    if (isVisible('organization')) {
      if (formData.orgSelectionMode === 'existing' && !formData.organizationId) {
        e.organizationId = "Vui lòng chọn ban tổ chức";
      }
      if (formData.orgSelectionMode === 'new') {
        if (!formData.newOrg?.name) e.newOrgName = "Vui lòng nhập tên ban tổ chức";
        if (!formData.newOrg?.email) e.newOrgEmail = "Vui lòng nhập email";
      }
    }
    if (isVisible('basic')) {
      if (!formData.eventTitle) e.eventTitle = `Vui lòng nhập tên ${term}`;
      if (!formData.startTime) e.startTime = "Vui lòng chọn thời gian bắt đầu";
      if (!formData.endTime) e.endTime = "Vui lòng chọn thời gian kết thúc";
      if (!formData.registrationDeadline) e.registrationDeadline = "Vui lòng chọn hạn đăng ký";
    }
    if (isVisible('details') || isVisible('attendees')) {
      if (!formData.location) e.location = "Vui lòng nhập địa điểm";
      if (isVisible('attendees') && !formData.maxParticipants) e.maxParticipants = "Vui lòng nhập số lượng tối đa";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
    }
  };

  const addInvite = (user = null) => {
    const invites = formData.invitations || [];
    const newInvite = user ? {
      inviteeEmail: user.email || "",
      inviteeName: user.profile?.fullName || user.username || "",
      inviteePosition: user.profile?.position || "",
      targetRole: "MEMBER",
      message: ""
    } : { inviteeEmail: "", inviteeName: "", inviteePosition: "", targetRole: "MEMBER", message: "" };

    setFormData({
      ...formData,
      invitations: [...invites, newInvite]
    });
  };

  const updateInvite = (index, field, value) => {
    const invites = [...(formData.invitations || [])];
    invites[index] = { ...invites[index], [field]: value };
    setFormData({ ...formData, invitations: invites });
  };

  const removeInvite = (index) => {
    const invites = (formData.invitations || []).filter((_, i) => i !== index);
    setFormData({ ...formData, invitations: invites });
  };

  const addPresenter = (user = null) => {
    const presenters = formData.presenters || [];
    const newPresenter = user ? {
      email: user.email || "",
      fullName: user.profile?.fullName || user.username || "",
      position: user.profile?.position || "",
      department: user.profile?.department || "",
      presenterAccountId: user.id,
      bio: "",
      session: ""
    } : { email: "", fullName: "", position: "", department: "", bio: "", session: "" };

    setFormData({
      ...formData,
      presenters: [...presenters, newPresenter]
    });
  };

  const updatePresenter = (index, field, value) => {
    let newPresenters = [...(formData.presenters || [])];
    let newSessions = [...(formData.sessions || [])];
    const presenter = newPresenters[index];

    // Cập nhật giá trị trường đang sửa
    newPresenters[index] = { ...presenter, [field]: value };

    // XỬ LÝ ĐỒNG BỘ NẾU CHỌN PHẠM VI THUYẾT TRÌNH
    if (field === 'targetSessionName') {
      if (value === 'ALL') {
        // 1. Reset các diễn giả khác đang để "ALL" về trống
        newPresenters = newPresenters.map((p, i) =>
          (i !== index && p.targetSessionName === 'ALL') ? { ...p, targetSessionName: '' } : p
        );

        // 2. Cập nhật TẤT CẢ các session sang diễn giả này
        newSessions = newSessions.map(s => ({ ...s, presenterName: presenter.fullName }));
      } else if (value && value !== '') {
        // Cập nhật diễn giả cho một session cụ thể (theo title)
        newSessions = newSessions.map(s =>
          s.title === value ? { ...s, presenterName: presenter.fullName } : s
        );
      }
    }

    // NẾU ĐỔI TÊN DIỄN GIẢ -> CẬP NHẬT TRONG CÁC SESSION ĐANG LIÊN KẾT
    if (field === 'fullName') {
      const oldName = presenter.fullName;
      newSessions = newSessions.map(s =>
        s.presenterName === oldName ? { ...s, presenterName: value } : s
      );
    }

    setFormData({
      ...formData,
      presenters: newPresenters,
      sessions: newSessions
    });
  };

  const removePresenter = (index) => {
    const presenters = (formData.presenters || []).filter((_, i) => i !== index);
    setFormData({ ...formData, presenters: presenters });
  };

  const [showPresenterSuggestions, setShowPresenterSuggestions] = useState(false);
  const [presenterSearchKey, setPresenterSearchKey] = useState("");

  const addSession = () => {
    const sessions = formData.sessions || [];
    const newSession = {
      title: "",
      description: "",
      room: "",
      type: "KEYNOTE",
      startTime: formData.startTime || "",
      endTime: formData.endTime || "",
      maxParticipants: formData.maxParticipants || 0,
      orderIndex: sessions.length + 1
    };
    setFormData({ ...formData, sessions: [...sessions, newSession] });
  };

  const updateSession = (index, field, value) => {
    const sessions = [...(formData.sessions || [])];
    sessions[index] = { ...sessions[index], [field]: value };
    setFormData({ ...formData, sessions: sessions });
  };

  const removeSession = (index) => {
    const sessions = (formData.sessions || []).filter((_, i) => i !== index);
    // Cập nhật lại orderIndex
    const updatedSessions = sessions.map((s, i) => ({ ...s, orderIndex: i + 1 }));
    setFormData({ ...formData, sessions: updatedSessions });
  };

  const [showSessionAISuggestions, setShowSessionAISuggestions] = useState(false);

  const filteredUsers = systemUsers.filter(u =>
    (u.profile?.fullName || "").toLowerCase().includes(searchKey.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchKey.toLowerCase()) ||
    (u.username || "").toLowerCase().includes(searchKey.toLowerCase())
  );

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: "20px 0" }}>
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "32px", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* ORGANIZATION SELECTION */}
        {isVisible('organization') && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Building size={20} className="text-indigo-600" />
              Ban tổ chức
            </h2>

            <div style={{ display: "flex", gap: 24, padding: "4px 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#475569" }}>
                <input
                  type="radio"
                  name="orgMode"
                  checked={formData.orgSelectionMode !== 'new'}
                  onChange={() => setFormData({ ...formData, orgSelectionMode: 'existing' })}
                  style={{ width: 16, height: 16 }}
                />
                Chọn từ danh sách
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#475569" }}>
                <input
                  type="radio"
                  name="orgMode"
                  checked={formData.orgSelectionMode === 'new'}
                  onChange={() => setFormData({ ...formData, orgSelectionMode: 'new' })}
                  style={{ width: 16, height: 16 }}
                />
                Tạo ban tổ chức mới
              </label>
            </div>

            {formData.orgSelectionMode !== 'new' ? (
              <Field label="Chọn đơn vị tổ chức" required error={errors.organizationId}>
                <Select
                  value={formData.organizationId || ""}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                >
                  <option value="">-- Chọn đơn vị --</option>
                  {orgs.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </Select>
              </Field>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, background: "#f8fafc", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>Thông tin ban tổ chức mới</h3>
                  <button
                    onClick={() => setShowOrgAISuggestions(!showOrgAISuggestions)}
                    style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Sparkles size={14} /> AI gợi ý ban tổ chức
                  </button>
                </div>

                {showOrgAISuggestions && (
                  <AISuggestionBox
                    title="Mẫu ban tổ chức từ AI"
                    suggestions={[
                      { label: "CLB Kỹ năng - IUH", data: { name: "CLB Kỹ năng - IUH", email: "kynang@iuh.edu.vn", type: "CLUB", officeLocation: "Phòng H3.1" } },
                      { label: "Khoa CNTT - IUH", data: { name: "Khoa Công nghệ Thông tin", email: "fit@iuh.edu.vn", type: "FACULTY", officeLocation: "Lầu 2, Nhà H" } },
                      { label: "Đoàn Thanh niên IUH", data: { name: "Đoàn Thanh niên IUH", email: "doanthanhnien@iuh.edu.vn", type: "DEPARTMENT", officeLocation: "Tòa nhà V" } }
                    ]}
                    onSelect={(s) => {
                      setFormData({ ...formData, newOrg: { ...formData.newOrg, ...s.data } });
                      setShowOrgAISuggestions(false);
                    }}
                  />
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Tên ban tổ chức" required error={errors.newOrgName}>
                    <Input
                      placeholder="VD: CLB Kỹ năng mềm"
                      value={formData.newOrg?.name || ""}
                      onChange={(e) => setFormData({ ...formData, newOrg: { ...formData.newOrg, name: e.target.value } })}
                    />
                  </Field>
                  <Field label="Email liên hệ" required error={errors.newOrgEmail}>
                    <Input
                      type="email"
                      placeholder="vd@iuh.edu.vn"
                      value={formData.newOrg?.email || ""}
                      onChange={(e) => setFormData({ ...formData, newOrg: { ...formData.newOrg, email: e.target.value } })}
                    />
                  </Field>
                  <Field label="Số điện thoại">
                    <Input
                      placeholder="0xxx..."
                      value={formData.newOrg?.phone || ""}
                      onChange={(e) => setFormData({ ...formData, newOrg: { ...formData.newOrg, phone: e.target.value } })}
                    />
                  </Field>
                  <Field label="Văn phòng / Địa điểm">
                    <Input
                      placeholder="VD: Phòng H3.1"
                      value={formData.newOrg?.officeLocation || ""}
                      onChange={(e) => setFormData({ ...formData, newOrg: { ...formData.newOrg, officeLocation: e.target.value } })}
                    />
                  </Field>
                  <Field label="Loại hình">
                    <Select
                      value={formData.newOrg?.type || "OTHER"}
                      onChange={(e) => setFormData({ ...formData, newOrg: { ...formData.newOrg, type: e.target.value } })}
                    >
                      <option value="FACULTY">Khoa / Viện</option>
                      <option value="CLUB">Câu lạc bộ</option>
                      <option value="DEPARTMENT">Phòng ban</option>
                      <option value="COMPANY">Doanh nghiệp</option>
                      <option value="OTHER">Khác</option>
                    </Select>
                  </Field>
                  <Field label="Logo ban tổ chức">
                    <ImageUpload value={formData.newOrg?.logoUrl} onChange={(url) => setFormData({ ...formData, newOrg: { ...formData.newOrg, logoUrl: url } })} />
                  </Field>
                </div>
                <Field label="Mô tả ban tổ chức">
                  <Textarea
                    placeholder="Giới thiệu ngắn gọn về ban tổ chức..."
                    value={formData.newOrg?.description || ""}
                    onChange={(e) => setFormData({ ...formData, newOrg: { ...formData.newOrg, description: e.target.value } })}
                  />
                </Field>
              </div>
            )}

            {/* INVITATIONS SECTION */}
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <UserPlus size={18} className="text-emerald-500" />
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
                    Tìm kiếm thành viên từ hệ thống
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
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map(u => (
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
                            <UserCheck size={18} />
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
                  <div key={idx} style={{ background: "#fafafa", padding: 20, borderRadius: 14, border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
                    <button
                      onClick={() => removeInvite(idx)}
                      style={{ position: "absolute", top: 12, right: 12, background: "#fee2e2", border: "none", color: "#ef4444", padding: "6px", borderRadius: 8, cursor: "pointer" }}
                    >
                      <X size={14} />
                    </button>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                      <Field label="Email người được mời" required>
                        <Input type="email" value={invite.inviteeEmail} onChange={(e) => updateInvite(idx, 'inviteeEmail', e.target.value)} placeholder="Nhập email (ví dụ: email@iuh.edu.vn)" />
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
                      <Input value={invite.message} onChange={(e) => updateInvite(idx, 'message', e.target.value)} placeholder={`VD: Mời bạn làm truyền thông cho ${term} này...`} />
                    </Field>
                  </div>
                ))}
                {(!formData.invitations || formData.invitations.length === 0) && (
                  <div style={{ textAlign: "center", padding: "32px", border: "1px dashed #e2e8f0", borderRadius: 16, color: "#94a3b8", fontSize: 13, background: "#fcfcfc" }}>
                    <UserPlus size={24} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    Chưa có thành viên nào được mời. Nhấn "AI gợi ý" hoặc "Thêm thủ công" để mời.
                  </div>
                )}
              </div>
            </div>


            {/* SESSIONS SECTION */}
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

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(formData.sessions || []).map((session, idx) => (
                  <div key={idx} style={{ background: "#fafafa", padding: 20, borderRadius: 14, border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
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
                      <Field label="Tên phiên / Hoạt động" required>
                        <Input value={session.title} onChange={(e) => updateSession(idx, 'title', e.target.value)} placeholder={`VD: Khai mạc ${term}`} />
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
                      <Field label="Thời gian bắt đầu">
                        <Input type="datetime-local" value={session.startTime} onChange={(e) => updateSession(idx, 'startTime', e.target.value)} />
                      </Field>
                      <Field label="Thời gian kết thúc">
                        <Input type="datetime-local" value={session.endTime} onChange={(e) => updateSession(idx, 'endTime', e.target.value)} />
                      </Field>
                      <Field label="Địa điểm / Phòng">
                        <Input value={session.room} onChange={(e) => updateSession(idx, 'room', e.target.value)} placeholder="VD: Hội trường A" />
                      </Field>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                      <Field label="Mô tả nội dung phiên">
                        <Textarea value={session.description} onChange={(e) => updateSession(idx, 'description', e.target.value)} placeholder="Chi tiết các hoạt động..." rows={2} />
                      </Field>
                    </div>
                  </div>
                ))}
                {(!formData.sessions || formData.sessions.length === 0) && (
                  <div style={{ textAlign: "center", padding: "32px", border: "1px dashed #e2e8f0", borderRadius: 16, color: "#94a3b8", fontSize: 13, background: "#fcfcfc" }}>
                    <Calendar size={24} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    Chưa có lịch trình chi tiết. Nhấn "Thêm phiên" hoặc "AI gợi ý" để lập lịch.
                  </div>
                )}
              </div>
            </div>

            {/* PRESENTERS SECTION */}
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
                  <div key={idx} style={{ background: "#fafafa", padding: 20, borderRadius: 14, border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
                    <button
                      onClick={() => removePresenter(idx)}
                      style={{ position: "absolute", top: 12, right: 12, background: "#fee2e2", border: "none", color: "#ef4444", padding: "6px", borderRadius: 8, cursor: "pointer" }}
                    >
                      <X size={14} />
                    </button>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                      <Field label="Email diễn giả" required>
                        <Input type="email" value={presenter.email} onChange={(e) => updatePresenter(idx, 'email', e.target.value)} placeholder="Nhập email để hệ thống tự tìm thông tin" />
                      </Field>
                    </div>


                    <Field label="Phạm vi thuyết trình">
                      <Select
                        value={presenter.targetSessionName || ""}
                        onChange={(e) => updatePresenter(idx, 'targetSessionName', e.target.value)}
                      >
                        <option value="">-- Chưa chỉ định --</option>
                        <option value="ALL">Thuyết trình tất cả các phiên</option>
                        {(formData.sessions || []).map((s, sIdx) => (
                          <option key={sIdx} value={s.title}>{s.title}</option>
                        ))}
                      </Select>
                      <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                        * Chọn "ALL" hoặc tên một phiên cụ thể.
                      </p>
                    </Field>

                    <Field label="Tiểu sử tóm tắt">
                      <Textarea value={presenter.bio} onChange={(e) => updatePresenter(idx, 'bio', e.target.value)} placeholder="Giới thiệu ngắn gọn về diễn giả..." rows={2} />
                    </Field>
                  </div>
                ))}
                {(!formData.presenters || formData.presenters.length === 0) && (
                  <div style={{ textAlign: "center", padding: "32px", border: "1px dashed #e2e8f0", borderRadius: 16, color: "#94a3b8", fontSize: 13, background: "#fcfcfc" }}>
                    <Briefcase size={24} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    Chưa có diễn giả nào được mời. Nhấn "AI gợi ý" hoặc "Thêm diễn giả" để mời.
                  </div>
                )}
              </div>
            </div>

            <div style={{ height: 1, background: "#f1f5f9", margin: "10px 0" }} />
          </div>
        )}

        {/* STEP 1: BASIC INFO */}
        {isVisible('basic') && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>Thông tin cơ bản</h2>

            <Field
              label={`Tên ${term}`}
              required
              error={errors.eventTitle}
              action={
                <button
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Sparkles size={14} /> AI gợi ý
                </button>
              }
            >
              <Input
                placeholder="VD: Hội thảo Công nghệ AI 2026"
                value={formData.eventTitle || ""}
                onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
              />
              {showAISuggestions && (
                <AISuggestionBox
                  title="Gợi ý từ AI"
                  suggestions={[
                    "Hội thảo Công nghệ AI và Tương lai 2026",
                    "Workshop: Kỹ năng Lập trình Python cho Sinh viên",
                    "Ngày hội Khởi nghiệp Sáng tạo IUH",
                    "Seminar: Xu hướng Công nghệ Blockchain"
                  ]}
                  onSelect={(s) => {
                    setFormData({ ...formData, eventTitle: s });
                    setShowAISuggestions(false);
                  }}
                />
              )}
            </Field>

            <Field label={`Danh mục ${term}`} required>
              <Select value={formData.eventType || ""} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}>
                <option value="">-- Chọn danh mục --</option>
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </Field>

            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: 16, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#1e293b", fontSize: 14, fontWeight: 700 }}>
                <Timer size={18} className="text-indigo-600" />
                {`Thời gian ${term}`}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <DateTimeField
                  label="Thời gian bắt đầu"
                  value={formData.startTime}
                  onChange={(val) => setFormData({ ...formData, startTime: val })}
                  error={errors.startTime}
                  required
                />
                <DateTimeField
                  label="Thời gian kết thúc"
                  value={formData.endTime}
                  onChange={(val) => setFormData({ ...formData, endTime: val })}
                  error={errors.endTime}
                  required
                />
              </div>

              <DateTimeField
                label="Hạn đăng ký tham gia"
                value={formData.registrationDeadline}
                onChange={(val) => setFormData({ ...formData, registrationDeadline: val })}
                error={errors.registrationDeadline}
                required
              />
            </div>

            <Field
              label="Địa điểm tổ chức"
              required
              error={errors.location}
              action={
                <button
                  onClick={() => setShowLocationAISuggestions(!showLocationAISuggestions)}
                  style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Sparkles size={14} /> AI gợi ý địa điểm
                </button>
              }
            >
              <div style={{ position: "relative" }}>
                <Input placeholder="VD: Hội trường A, Cơ sở Nguyễn Văn Bảo" value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                <MapPin size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              </div>
              {showLocationAISuggestions && (
                <AISuggestionBox
                  title="Gợi ý địa điểm phổ biến tại IUH"
                  suggestions={[
                    "Hội trường A, Cơ sở Nguyễn Văn Bảo",
                    "Hội trường E4, Nhà E",
                    "Phòng họp Nhà V",
                    "Sân bóng đá IUH",
                    "Thư viện tầng 1, Nhà B",
                    "Phòng H3.1 (Phòng CLB)"
                  ]}
                  onSelect={(s) => {
                    setFormData({ ...formData, location: s });
                    setShowLocationAISuggestions(false);
                  }}
                />
              )}
            </Field>
          </>
        )}

        {/* STEP 2: DESCRIPTION & DETAILS & ATTENDEES */}
        {(isVisible('details') || isVisible('description') || isVisible('attendees')) && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>Mô tả & Cài đặt người tham gia</h2>

            <Field
              label={`Mô tả ${term}`}
              required
              error={errors.eventPurpose}
              action={
                <button
                  onClick={() => setShowDescriptionAISuggestions(!showDescriptionAISuggestions)}
                  style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Sparkles size={14} /> AI gợi ý mô tả
                </button>
              }
            >
              <Textarea
                placeholder={`Mô tả chi tiết về ${term}, nội dung chính, đối tượng tham gia...`}
                rows={6}
                value={formData.eventPurpose || ""}
                onChange={(e) => setFormData({ ...formData, eventPurpose: e.target.value })}
              />
              {showDescriptionAISuggestions && (
                <AISuggestionBox
                  title="Mẫu mô tả từ AI"
                  suggestions={[
                    "Hội thảo chuyên môn: Sự kiện quy tụ các chuyên gia hàng đầu trong lĩnh vực để chia sẻ kiến thức mới nhất và xu hướng tương lai.",
                    "Workshop thực hành: Khóa học tập trung vào kỹ năng thực tế, người tham gia sẽ được hướng dẫn trực tiếp bởi các chuyên gia.",
                    "Sự kiện networking: Buổi gặp gỡ thân mật giữa sinh viên và các nhà tuyển dụng, mở ra nhiều cơ hội thực tập và việc làm hấp dẫn.",
                    "Ngày hội văn hóa: Không gian giao lưu văn hóa, nghệ thuật với nhiều hoạt động sôi nổi và giải thưởng hấp dẫn dành cho sinh viên."
                  ]}
                  onSelect={(s) => {
                    setFormData({ ...formData, eventPurpose: s });
                    setShowDescriptionAISuggestions(false);
                  }}
                />
              )}
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Field
                label="Số lượng người tham gia tối đa"
                required
                error={errors.maxParticipants}
                action={
                  <button
                    onClick={() => setShowMaxParticipantsAISuggestions(!showMaxParticipantsAISuggestions)}
                    style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Sparkles size={14} /> AI gợi ý
                  </button>
                }
              >
                <Input type="number" placeholder="VD: 500" value={formData.maxParticipants || ""} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} />
                {showMaxParticipantsAISuggestions && (
                  <AISuggestionBox
                    title="Gợi ý quy mô phổ biến"
                    suggestions={["50 (Phòng học nhỏ)", "100 (Phòng học lớn)", "200 (Hội trường nhỏ)", "500 (Hội trường A)", "1000 (Sân bóng đá)"]}
                    onSelect={(s) => {
                      setFormData({ ...formData, maxParticipants: s.split(' ')[0] });
                      setShowMaxParticipantsAISuggestions(false);
                    }}
                  />
                )}
              </Field>
              <Field
                label={`Mục tiêu ${term}`}
                action={
                  <button
                    onClick={() => setShowGoalAISuggestions(!showGoalAISuggestions)}
                    style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Sparkles size={14} /> AI gợi ý
                  </button>
                }
              >
                <Input placeholder="VD: Nâng cao kỹ năng, Kết nối doanh nghiệp..." value={formData.eventTopic || ""} onChange={(e) => setFormData({ ...formData, eventTopic: e.target.value })} />
                {showGoalAISuggestions && (
                  <AISuggestionBox
                    title={`Gợi ý mục tiêu ${term}`}
                    suggestions={[
                      "Nâng cao kỹ năng chuyên môn cho sinh viên",
                      "Kết nối doanh nghiệp và tạo cơ hội việc làm",
                      "Chia sẻ kinh nghiệm thực tế từ chuyên gia",
                      "Tạo sân chơi giao lưu, học hỏi giữa các câu lạc bộ"
                    ]}
                    onSelect={(s) => {
                      setFormData({ ...formData, eventTopic: s });
                      setShowGoalAISuggestions(false);
                    }}
                  />
                )}
              </Field>
            </div>

            <Field
              label="Yêu cầu đối với người tham gia"
              action={
                <button
                  onClick={() => setShowRequirementAISuggestions(!showRequirementAISuggestions)}
                  style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Sparkles size={14} /> AI gợi ý
                </button>
              }
            >
              <Textarea
                placeholder="VD: Sinh viên năm 3, 4; Có kiến thức cơ bản về lập trình..."
                value={formData.targetObjects?.join(', ') || ""}
                onChange={(e) => setFormData({ ...formData, targetObjects: e.target.value.split(',').map(s => s.trim()) })}
              />
              {showRequirementAISuggestions && (
                <AISuggestionBox
                  title="Gợi ý yêu cầu tham gia"
                  suggestions={[
                    "Sinh viên năm 3, năm 4 chuyên ngành CNTT",
                    "Mang theo laptop và cài đặt sẵn các phần mềm cần thiết",
                    "Đã đăng ký và nhận được email xác nhận từ ban tổ chức",
                    "Mặc trang phục lịch sự hoặc đồng phục trường"
                  ]}
                  onSelect={(s) => {
                    const current = formData.targetObjects || [];
                    setFormData({ ...formData, targetObjects: [...new Set([...current, s])] });
                    setShowRequirementAISuggestions(false);
                  }}
                />
              )}
            </Field>

            <Field label={`Hình ảnh ${term}`}>
              <div style={{
                border: "1px dashed #cbd5e1",
                borderRadius: 12,
                padding: "40px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                background: "#fafafa"
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                  <Upload size={24} style={{ margin: "auto" }} />
                </div>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "#475569" }}>Kéo thả hoặc click để tải ảnh lên</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11 }}>PNG, JPG tối đa 5MB</p>
                </div>
                <ImageUpload value={formData.coverImage} onChange={(url) => setFormData({ ...formData, coverImage: url })} />
              </div>
            </Field>
          </>
        )}
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
        <button onClick={onBack} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Quay lại
        </button>
        <button onClick={handleNext} style={{ padding: "10px 32px", borderRadius: 8, border: "none", background: "#1e1b4b", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          Tiếp theo
        </button>
      </div>
    </div>
  );
}
