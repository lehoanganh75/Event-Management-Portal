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
  const [f, setF] = useState(false);
  return (
    <input
      {...props}
      onFocus={(e) => {
        setF(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setF(false);
        props.onBlur?.(e);
      }}
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
        border: `1px solid ${error ? "#fca5a5" : f ? "#2563eb" : "#e5e5e5"}`,
        ...style,
      }}
    />
  );
};

const Textarea = ({ error, rows = 3, ...props }) => {
  const [f, setF] = useState(false);
  return (
    <textarea
      rows={rows}
      {...props}
      onFocus={(e) => {
        setF(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setF(false);
        props.onBlur?.(e);
      }}
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
        border: `1px solid ${error ? "#fca5a5" : f ? "#2563eb" : "#e5e5e5"}`,
      }}
    />
  );
};

const Select = ({ children, ...props }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        {...props}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
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
          border: `1px solid ${f ? "#2563eb" : "#e5e5e5"}`,
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
    onMouseEnter={(e) => {
      if (!checked) e.currentTarget.style.borderColor = "#d0d0d0";
    }}
    onMouseLeave={(e) => {
      if (!checked)
        e.currentTarget.style.borderColor = error ? "#fca5a5" : "#e5e5e5";
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
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
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

  const [eventTypes] = useState([
    "WORKSHOP",
    "SEMINAR",
    "TALKSHOW",
    "COMPETITION",
    "CONFERENCE",
    "WEBINAR",
    "CONCERT",
    "OTHER",
  ]);

  const [loadingTypes] = useState(false);

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
    organizer: externalFormData?.organizer || "Khoa Công nghệ thông tin",
    organizerUnit: externalFormData?.organizerUnit || "",
    recipients: externalFormData?.recipients || [],
    customRecipients: externalFormData?.customRecipients || [],
    participants: externalFormData?.participants || [],
    notes: externalFormData?.notes || "",
  });

  const [errors, setErrors] = useState({});
  const [newRecipient, setNewRecipient] = useState("");
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const nowStr = new Date().toISOString().slice(0, 16);
  const khoaOrganizers = [
    "Khoa Công nghệ thông tin",
    "Khoa Kế toán - Kiểm toán",
    "Khoa Quản trị Kinh doanh",
  ];

  const isKhoa = khoaOrganizers.includes(formData.organizer);

  const validateForm = () => {
    const e = {};
    const comingFromPlan = !!externalFormData?.planId;
    if (!formData.eventType && !comingFromPlan)
      e.eventType = "Vui lòng chọn loại sự kiện";
    if (!formData.eventTitle) e.eventTitle = "Vui lòng nhập tên sự kiện";
    if (!formData.eventPurpose)
      e.eventPurpose = "Vui lòng nhập mục đích tổ chức";
    if (!formData.startTime) e.startTime = true;
    if (!formData.endTime) e.endTime = true;
    if (!formData.location) e.location = "Vui lòng nhập địa điểm";
    if (
      formData.recipients.length === 0 &&
      formData.customRecipients.length === 0
    )
      e.recipients = "Vui lòng chọn ít nhất một nơi nhận";
    if (formData.participants.length === 0)
      e.participants = "Vui lòng chọn ít nhất một đối tượng";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    console.log("📊 ManualInputStep - Current formData:", {
      eventType: formData.eventType,
      eventTitle: formData.eventTitle,
      eventPurpose: formData.eventPurpose,
    });
  }, [formData]);

  const handleNext = () => {
    if (validateForm()) {
      console.log("📤 Sending to parent:", formData);
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

  const toggleRecipient = (r) =>
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.includes(r)
        ? prev.recipients.filter((x) => x !== r)
        : [...prev.recipients, r],
    }));

  const addCustomRecipient = () => {
    const trimmed = newRecipient.trim();
    if (trimmed && !formData.customRecipients.includes(trimmed))
      setFormData((prev) => ({
        ...prev,
        customRecipients: [...prev.customRecipients, trimmed],
      }));
    setNewRecipient("");
    setShowAddRecipient(false);
  };

  const handleTimeChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "startTime" && value) {
        if (!prev.endTime || new Date(prev.endTime) <= new Date(value)) {
          const suggestedEnd = new Date(value);
          suggestedEnd.setHours(suggestedEnd.getHours() + 2);
          newData.endTime = suggestedEnd.toISOString().slice(0, 16);
        }
        if (!prev.registrationDeadline) {
          const suggestedDeadline = new Date(value);
          suggestedDeadline.setDate(suggestedDeadline.getDate() - 1);
          newData.registrationDeadline = suggestedDeadline
            .toISOString()
            .slice(0, 16);
        }
      }
      return newData;
    });
  };

  const removeCustomRecipient = (r) =>
    setFormData((prev) => ({
      ...prev,
      customRecipients: prev.customRecipients.filter((x) => x !== r),
    }));

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
          Bước 2 / 3
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
        {externalFormData?.templateName &&
          externalFormData?.templateId !== "0" && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
                padding: "5px 12px",
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: 8,
              }}
            >
              <FileText size={12} color="#2563eb" />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#1d4ed8" }}>
                Mẫu: {externalFormData.templateName}
              </span>
            </div>
          )}
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
            hint={
              externalFormData?.planId && !formData.eventType
                ? "Kế hoạch chưa có loại sự kiện, vui lòng chọn bên dưới"
                : undefined
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(eventTypes.length, 6)}, 1fr)`,
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
                error={!!errors.eventTypeOther}
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
              <Input
                placeholder="Ví dụ: Ứng dụng AI trong giáo dục đại học"
                value={formData.eventTopic}
                onChange={(e) =>
                  setFormData({ ...formData, eventTopic: e.target.value })
                }
              />
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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 8,
                }}
              >
                {["Sinh viên", "Giảng viên", "Cán bộ", "Khách mời"].map(
                  (type) => (
                    <Pill
                      key={type}
                      label={type}
                      checked={formData.participants.includes(type)}
                      error={!!errors.participants}
                      onChange={() => toggleParticipant(type)}
                    />
                  ),
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
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
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
                  setFormData({
                    ...formData,
                    registrationDeadline: e.target.value,
                  })
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
            style={{
              display: "grid",
              gridTemplateColumns: isKhoa ? "1fr 1fr" : "1fr 2fr",
              gap: 20,
            }}
          >
            <Field
              label="Đơn vị"
              icon={<Users size={14} color="#8b5cf6" />}
              required
            >
              <Select
                value={formData.organizer}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    organizer: e.target.value,
                    organizerUnit: "",
                  })
                }
              >
                <option>Khoa Công nghệ thông tin</option>
                <option>Khoa Kế toán - Kiểm toán</option>
                <option>Khoa Quản trị Kinh doanh</option>
                <option>Phòng Đào tạo</option>
                <option>Phòng CTSV</option>
              </Select>
            </Field>
            {isKhoa && (
              <Field
                label="Bộ môn / Chuyên ngành"
                icon={<Users size={14} color="#8b5cf6" />}
                hint="Không bắt buộc"
              >
                <Input
                  placeholder="Ví dụ: Bộ môn Kỹ thuật phần mềm"
                  value={formData.organizerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, organizerUnit: e.target.value })
                  }
                />
              </Field>
            )}
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#1d4ed8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#2563eb")
                    }
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#1d4ed8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#2563eb")
                  }
                >
                  <Plus size={13} /> Thêm nơi nhận khác
                </button>
              )}
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
              fontFamily: "inherit",
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 20px",
                border: "none",
                borderRadius: 8,
                background: "#2563eb",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#2563eb")
              }
            >
              Tiếp tục <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <style>{`* { box-sizing: border-box; } ::placeholder { color: #ccc; }`}</style>
    </div>
  );
};
