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
} from "lucide-react";

const Field = ({ label, icon, required, error, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        color: "#111",
      }}
    >
      {icon}
      {label}
      {required && <span style={{ color: "#ef4444", fontSize: 12 }}>*</span>}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: 11, color: "#ef4444", margin: 0 }}>{error}</p>
    )}
    {hint && (
      <p
        style={{ fontSize: 11, color: "#bbb", margin: 0, fontStyle: "italic" }}
      >
        {hint}
      </p>
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
        padding: "9px 12px",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        color: "#111",
        transition: "border .15s",
        borderRadius: 8,
        background: error ? "#fff5f5" : "#fff",
        border: `1px solid ${error ? "#fca5a5" : focused ? "#2563eb" : "#e5e5e5"}`,
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
        padding: "9px 12px",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        resize: "none",
        boxSizing: "border-box",
        color: "#111",
        lineHeight: 1.6,
        transition: "border .15s",
        borderRadius: 8,
        background: error ? "#fff5f5" : "#fff",
        border: `1px solid ${error ? "#fca5a5" : focused ? "#2563eb" : "#e5e5e5"}`,
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
          padding: "9px 36px 9px 12px",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          appearance: "none",
          cursor: "pointer",
          color: "#111",
          borderRadius: 8,
          background: "#fff",
          border: `1px solid ${focused ? "#2563eb" : "#e5e5e5"}`,
          transition: "border .15s",
        }}
      >
        {children}
      </select>
      <svg
        width="12"
        height="12"
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
};

const Pill = ({ label, checked, onChange, error }) => (
  <div
    onClick={onChange}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 12px",
      border: `1px solid ${checked ? "#2563eb" : error ? "#fca5a5" : "#e5e5e5"}`,
      borderRadius: 8,
      cursor: "pointer",
      background: checked ? "#eff6ff" : "#fff",
      transition: "all .12s",
      userSelect: "none",
    }}
  >
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: `1.5px solid ${checked ? "#2563eb" : "#ccc"}`,
        background: checked ? "#2563eb" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all .12s",
      }}
    >
      {checked && <Check size={10} color="#fff" strokeWidth={3} />}
    </div>
    <span
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: checked ? "#1d4ed8" : "#333",
      }}
    >
      {label}
    </span>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#aaa",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
    </div>
    {children}
  </div>
);

const CheckRow = ({ label, checked, onChange, onRemove }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
    onClick={onChange}
  >
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: `1.5px solid ${checked ? "#2563eb" : "#ccc"}`,
        background: checked ? "#2563eb" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all .12s",
      }}
    >
      {checked && <Check size={9} color="#fff" strokeWidth={3} />}
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: "#333", flex: 1 }}>
      {label}
    </span>
    {onRemove && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "#ccc",
          display: "flex",
          alignItems: "center",
          padding: 2,
          borderRadius: 4,
        }}
      >
        <X size={13} />
      </button>
    )}
  </div>
);

export const ManualInputStep = ({
  onBack,
  onNext,
  formData: externalFormData,
  setFormData: setExternalFormData,
  isQuickCreate = false,
}) => {
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

  const eventTypes = [
    "WORKSHOP",
    "SEMINAR",
    "TALKSHOW",
    "COMPETITION",
    "CONFERENCE",
    "WEBINAR",
    "CONCERT",
    "OTHER",
  ];

  const [formData, setFormData] = useState({
    eventType: externalFormData?.eventType || "",
    eventTypeOther: externalFormData?.eventTypeOther || "",
    eventTitle: externalFormData?.eventTitle || externalFormData?.title || "",
    eventTopic: externalFormData?.eventTopic || "",
    eventPurpose: externalFormData?.description || "",
    eventMode: externalFormData?.eventMode || "OFFLINE",
    startTime: externalFormData?.startTime || "",
    endTime: externalFormData?.endTime || "",
    registrationDeadline: externalFormData?.registrationDeadline || "",
    location: externalFormData?.location || "",
    maxParticipants: externalFormData?.maxParticipants || 0,
    faculty: externalFormData?.faculty || "Khoa Công nghệ thông tin",
    major: externalFormData?.major || "",
    recipients: externalFormData?.recipients || [],
    customRecipients: externalFormData?.customRecipients || [],
    participants: externalFormData?.participants || [],
    notes: externalFormData?.notes || "",
    themes: externalFormData?.themes || [],
    programItems: externalFormData?.programItems || [],
    presenters: externalFormData?.presenters || [],
    organizers: externalFormData?.organizers || [],
    templateId: externalFormData?.templateId || null,
    hasLuckyDraw: externalFormData?.hasLuckyDraw || false,
  });

  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newParticipant, setNewParticipant] = useState("");
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newTheme, setNewTheme] = useState("");
  const [showAddTheme, setShowAddTheme] = useState(false);

  const nowStr = new Date().toISOString().slice(0, 16);
  const khoaOrganizers = [
    "Khoa Công nghệ thông tin",
    "Khoa Kế toán - Kiểm toán",
    "Khoa Quản trị Kinh doanh",
  ];

  const addTheme = () => {
    const trimmed = newTheme.trim();
    if (trimmed && !formData.themes.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        themes: [...prev.themes, trimmed],
      }));
    }
    setNewTheme("");
    setShowAddTheme(false);
  };

  const removeTheme = (theme) => {
    setFormData((prev) => ({
      ...prev,
      themes: prev.themes.filter((t) => t !== theme),
    }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.eventType) e.eventType = "Vui lòng chọn loại sự kiện";
    if (formData.eventType === "OTHER" && !formData.eventTypeOther.trim())
      e.eventType = "Vui lòng nhập loại sự kiện khác";
    if (!formData.eventTitle.trim()) e.eventTitle = "Vui lòng nhập tên sự kiện";
    if (!formData.eventPurpose.trim()) e.eventPurpose = "Vui lòng nhập mục đích tổ chức";
    if (!formData.faculty) e.faculty = "Vui lòng chọn khoa";
    if (!formData.startTime) e.startTime = "Vui lòng chọn thời gian bắt đầu";
    if (!formData.endTime) e.endTime = "Vui lòng chọn thời gian kết thúc";
    else if (formData.startTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      e.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }
    if (
      formData.registrationDeadline &&
      formData.startTime &&
      new Date(formData.registrationDeadline) >= new Date(formData.startTime)
    ) {
      e.registrationDeadline = "Hạn đăng ký phải trước thời gian bắt đầu";
    }
    if (!formData.location.trim()) e.location = "Vui lòng nhập địa điểm";
    if (formData.recipients.length === 0 && formData.customRecipients.length === 0)
      e.recipients = "Vui lòng chọn ít nhất một nơi nhận";
    if (formData.participants.length === 0)
      e.participants = "Vui lòng chọn ít nhất một đối tượng";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    if (hasAttemptedSubmit) {
      validateForm();
    }
  }, [formData, hasAttemptedSubmit]);

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    if (validateForm()) {
      setExternalFormData(formData);
      onNext(formData);
    }
  };

  const toggleParticipant = (type) =>
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(type)
        ? prev.participants.filter((p) => p !== type)
        : [...prev.participants, type],
    }));

  const addCustomParticipant = () => {
    const trimmed = newParticipant.trim();
    if (trimmed && !formData.participants.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        participants: [...prev.participants, trimmed],
      }));
    }
    setNewParticipant("");
    setShowAddParticipant(false);
  };

  const removeCustomParticipant = (p) =>
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((x) => x !== p),
    }));

  const toggleRecipient = (r) =>
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.includes(r)
        ? prev.recipients.filter((x) => x !== r)
        : [...prev.recipients, r],
    }));

  const addCustomRecipient = () => {
    const trimmed = newRecipient.trim();
    if (trimmed && !formData.customRecipients.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        customRecipients: [...prev.customRecipients, trimmed],
      }));
    }
    setNewRecipient("");
    setShowAddRecipient(false);
  };

  const removeCustomRecipient = (r) =>
    setFormData((prev) => ({
      ...prev,
      customRecipients: prev.customRecipients.filter((x) => x !== r),
    }));

  const handleTimeChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "0 32px 60px",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: 12,
            color: "#bbb",
            fontWeight: 500,
            margin: "0 0 6px",
            letterSpacing: "0.04em",
          }}
        >
          {isQuickCreate ? "Tạo sự kiện mới" : "Bước 2 / 3"}
        </p>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#111",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Nhập thông tin kế hoạch
        </h2>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
          Điền đầy đủ các thông tin bên dưới
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ebebeb",
          borderRadius: 14,
          padding: "32px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <Section title="Thông tin cơ bản">
          <Field
            label="Loại sự kiện"
            icon={<FileText size={14} color="#2563eb" />}
            required
            error={errors.eventType}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
                gap: 8,
              }}
            >
              {eventTypes.map((type) => (
                <Pill
                  key={type}
                  label={eventTypeLabels[type] || type}
                  checked={formData.eventType === type}
                  error={!!errors.eventType}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      eventType: type,
                      eventTypeOther: "",
                    })
                  }
                />
              ))}
            </div>
            {formData.eventType === "OTHER" && (
              <Input
                placeholder="Nhập loại sự kiện..."
                error={!!errors.eventType}
                value={formData.eventTypeOther}
                onChange={(e) =>
                  setFormData({ ...formData, eventTypeOther: e.target.value })
                }
                style={{ marginTop: 8 }}
              />
            )}
          </Field>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <Field
              label="Tên sự kiện"
              icon={<FileText size={14} color="#2563eb" />}
              required
              error={errors.eventTitle}
            >
              <Input
                placeholder="Ví dụ: Workshop về AI và Machine Learning"
                error={!!errors.eventTitle}
                value={formData.eventTitle}
                onChange={(e) =>
                  setFormData({ ...formData, eventTitle: e.target.value })
                }
              />
            </Field>

            <Field
              label="Chủ đề sự kiện"
              icon={<FileText size={14} color="#6366f1" />}
            >
              <div
                style={{
                  padding: "10px 12px",
                  background: "#fafafa",
                  border: "1px solid #ebebeb",
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {formData.themes.map((theme) => (
                    <div
                      key={theme}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 8px",
                        background: "#e0e7ff",
                        color: "#4338ca",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {theme}
                      <button
                        onClick={() => removeTheme(theme)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          color: "#6366f1",
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {showAddTheme ? (
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <input
                      type="text"
                      placeholder="Nhập chủ đề..."
                      value={newTheme}
                      onChange={(e) => setNewTheme(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTheme()}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        border: "1px solid #6366f1",
                        borderRadius: 6,
                        fontSize: 12,
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={addTheme}
                      style={{
                        padding: "6px 12px",
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Thêm
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTheme(false);
                        setNewTheme("");
                      }}
                      style={{
                        padding: "6px 10px",
                        background: "none",
                        color: "#666",
                        border: "1px solid #e5e5e5",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddTheme(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      color: "#6366f1",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 500,
                      marginTop: formData.themes.length > 0 ? 8 : 0,
                      padding: 0,
                    }}
                  >
                    <Plus size={12} /> Thêm chủ đề
                  </button>
                )}
              </div>
            </Field>
          </div>

          <Field
            label="Mục đích tổ chức"
            icon={<FileText size={14} color="#ef4444" />}
            required
            error={errors.eventPurpose}
          >
            <Textarea
              placeholder="Mô tả mục tiêu và lý do tổ chức sự kiện..."
              error={!!errors.eventPurpose}
              value={formData.eventPurpose}
              onChange={(e) =>
                setFormData({ ...formData, eventPurpose: e.target.value })
              }
            />
          </Field>
        </Section>

        <Section title="Đối tượng & quy mô">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 20,
              alignItems: "start",
            }}
          >
            <Field
              label="Đối tượng tham gia"
              icon={<Users size={14} color="#2563eb" />}
              required
              error={errors.participants}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Sinh viên", "Giảng viên", "Cán bộ", "Khách mời"].map(
                  (type) => (
                    <Pill
                      key={type}
                      label={type}
                      checked={formData.participants.includes(type)}
                      error={!!errors.participants}
                      onChange={() => toggleParticipant(type)}
                    />
                  )
                )}

                {formData.participants
                  .filter(
                    (p) =>
                      !["Sinh viên", "Giảng viên", "Cán bộ", "Khách mời"].includes(p)
                  )
                  .map((customP) => (
                    <div
                      key={customP}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 12px",
                        border: "1px solid #2563eb",
                        borderRadius: 8,
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "default",
                      }}
                    >
                      {customP}
                      <button
                        onClick={() => removeCustomParticipant(customP)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#2563eb",
                          display: "flex",
                          padding: 0,
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                {showAddParticipant ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      width: "100%",
                      marginTop: 4,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Nhập đối tượng khác..."
                      value={newParticipant}
                      onChange={(e) => setNewParticipant(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && addCustomParticipant()
                      }
                      autoFocus
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "1px solid #2563eb",
                        borderRadius: 8,
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={addCustomParticipant}
                      style={{
                        padding: "8px 16px",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Thêm
                    </button>
                    <button
                      onClick={() => {
                        setShowAddParticipant(false);
                        setNewParticipant("");
                      }}
                      style={{
                        padding: "8px 12px",
                        background: "none",
                        color: "#666",
                        border: "1px solid #e5e5e5",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddParticipant(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "9px 12px",
                      border: "1.5px dashed #e5e5e5",
                      borderRadius: 8,
                      background: "none",
                      color: "#aaa",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <Plus size={14} /> Khác
                  </button>
                )}
              </div>
            </Field>

            <Field
              label="Số lượng tối đa"
              icon={<Users size={14} color="#2563eb" />}
              hint="Hệ thống sẽ tự động đóng đăng ký khi đạt giới hạn."
            >
              <div style={{ position: "relative", width: 160 }}>
                <Input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.maxParticipants || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    color: "#bbb",
                    pointerEvents: "none",
                  }}
                >
                  Người
                </span>
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Thời gian & địa điểm">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 20,
            }}
          >
            <Field
              label="Bắt đầu"
              icon={<Calendar size={14} color="#2563eb" />}
              required
              error={errors.startTime}
            >
              <Input
                type="datetime-local"
                min={nowStr}
                error={!!errors.startTime}
                value={formData.startTime}
                onChange={(e) => handleTimeChange("startTime", e.target.value)}
              />
            </Field>

            <Field
              label="Kết thúc"
              icon={<Calendar size={14} color="#2563eb" />}
              required
              error={errors.endTime}
            >
              <Input
                type="datetime-local"
                min={formData.startTime || nowStr}
                error={!!errors.endTime}
                value={formData.endTime}
                onChange={(e) => handleTimeChange("endTime", e.target.value)}
              />
            </Field>

            <Field
              label="Hạn chót đăng ký"
              icon={<Calendar size={14} color="#2563eb" />}
              hint="Nên kết thúc trước khi sự kiện bắt đầu."
              error={errors.registrationDeadline}
            >
              <Input
                type="datetime-local"
                min={nowStr}
                max={formData.startTime}
                error={!!errors.registrationDeadline}
                value={formData.registrationDeadline}
                onChange={(e) =>
                  handleTimeChange("registrationDeadline", e.target.value)
                }
              />
            </Field>
          </div>

          <Field
            label="Địa điểm"
            icon={<MapPin size={14} color="#22c55e" />}
            required
            error={errors.location}
          >
            <Input
              placeholder="Ví dụ: Hội trường A1, Tầng 5"
              error={!!errors.location}
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </Field>
        </Section>

        <Section title="Đơn vị tổ chức">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <Field
              label="Khoa"
              icon={<Users size={14} color="#a855f7" />}
              error={errors.faculty}
            >
              <Select
                value={formData.faculty}
                onChange={(e) =>
                  setFormData({ ...formData, faculty: e.target.value })
                }
              >
                <option value="">Chọn khoa</option>
                {khoaOrganizers.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Chuyên ngành"
              icon={<Users size={14} color="#a855f7" />}
              hint="Không bắt buộc"
            >
              <Input
                placeholder="Ví dụ: Kỹ thuật phần mềm"
                value={formData.major}
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
              />
            </Field>
          </div>
        </Section>

        <Section title="Nơi nhận">
          <Field
            label="Nơi nhận kế hoạch"
            icon={<FileText size={14} color="#f97316" />}
            required
            error={errors.recipients}
          >
            <div
              style={{
                padding: "14px 16px",
                background: errors.recipients ? "#fff5f5" : "#fafafa",
                border: `1px solid ${errors.recipients ? "#fca5a5" : "#ebebeb"}`,
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                  marginBottom:
                    formData.customRecipients.length > 0 || showAddRecipient
                      ? 12
                      : 0,
                }}
              >
                {[
                  "Trưởng khoa",
                  "Ban Giám hiệu",
                  "Phòng Đào tạo",
                  "Phòng CTSV",
                  "Các bộ môn",
                ].map((r) => (
                  <CheckRow
                    key={r}
                    label={r}
                    checked={formData.recipients.includes(r)}
                    onChange={() => toggleRecipient(r)}
                  />
                ))}
              </div>

              {formData.customRecipients.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 10,
                    marginTop: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {formData.customRecipients.map((r) => (
                    <CheckRow
                      key={r}
                      label={r}
                      checked={true}
                      onChange={() => {}}
                      onRemove={() => removeCustomRecipient(r)}
                    />
                  ))}
                </div>
              )}

              {showAddRecipient ? (
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <input
                    type="text"
                    placeholder="Nhập nơi nhận mới..."
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomRecipient()}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      border: "1px solid #2563eb",
                      borderRadius: 8,
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={addCustomRecipient}
                    style={{
                      padding: "7px 14px",
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Thêm
                  </button>
                  <button
                    onClick={() => {
                      setShowAddRecipient(false);
                      setNewRecipient("");
                    }}
                    style={{
                      padding: "7px 12px",
                      background: "none",
                      color: "#666",
                      border: "1px solid #e5e5e5",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddRecipient(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    color: "#2563eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontFamily: "inherit",
                    marginTop: 10,
                    padding: 0,
                  }}
                >
                  <Plus size={13} /> Thêm nơi nhận khác
                </button>
              )}
            </div>
          </Field>

          <Field
            label="Tính năng bốc thăm may mắn"
            icon={<Award size={14} color="#eab308" />}
            hint="Bật nếu sự kiện có phần rút thăm trúng thưởng"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "8px 0",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.hasLuckyDraw}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasLuckyDraw: e.target.checked,
                    }))
                  }
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: "#2563eb",
                  }}
                />
                <span style={{ fontSize: 14, color: "#333" }}>
                  Có tổ chức bốc thăm may mắn
                </span>
              </label>
            </div>
          </Field>
        </Section>

        <Section title="Ghi chú">
          <Field
            label="Thông tin bổ sung"
            icon={<FileText size={14} color="#94a3b8" />}
          >
            <Textarea
              rows={3}
              placeholder="Thông tin bổ sung về sự kiện..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </Field>
        </Section>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 20,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              background: "#fff",
              color: "#555",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} /> Quay lại
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {errorCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: "#ef4444",
                  fontWeight: 500,
                }}
              >
                <Info size={14} />
                {errorCount} lỗi cần sửa
              </div>
            )}
            <button
              onClick={handleNext}
              disabled={errorCount > 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 20px",
                border: "none",
                borderRadius: 8,
                background: isQuickCreate ? "#10b981" : "#2563eb",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: errorCount > 0 ? "not-allowed" : "pointer",
                opacity: errorCount > 0 ? 0.6 : 1,
              }}
            >
              {isQuickCreate ? "Gửi phê duyệt" : "Tiếp tục"}
              {!isQuickCreate && <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`* { box-sizing: border-box; } ::placeholder { color: #ccc; }`}</style>
    </div>
  );
};

export default ManualInputStep;