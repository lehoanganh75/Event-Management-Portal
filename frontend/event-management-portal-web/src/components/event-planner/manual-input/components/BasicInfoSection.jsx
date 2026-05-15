import React from "react";
import { Sparkles, MapPin, Timer, Loader2 } from "lucide-react";
import { Field, Input, Select, AISuggestionBox, DateTimeField } from "./BaseUI";
import { EVENT_TYPES } from "./GeneralInfoSection";

const BasicInfoSection = ({
  formData,
  setFormData,
  errors,
  term,
  aiLoadingFields,
  aiSuggestions,
  handleAIFieldSuggestion,
  setAiSuggestions
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>Thông tin cơ bản</h2>

      <Field
        id="field-eventTitle"
        label={`Tên ${term}`}
        required
        error={errors.eventTitle}
        action={
          <button
            onClick={() => handleAIFieldSuggestion('eventTitle', 'Tên sự kiện', 'Hãy gợi ý 5 tên sự kiện hấp dẫn cho một hoạt động sinh viên tại trường đại học.')}
            disabled={aiLoadingFields['eventTitle']}
            style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {aiLoadingFields['eventTitle'] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI gợi ý
          </button>
        }
      >
        <Input
          placeholder="VD: Hội thảo Công nghệ AI 2026"
          value={formData.eventTitle || ""}
          onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
        />
        {aiSuggestions['eventTitle']?.show && (
          <AISuggestionBox
            title={aiLoadingFields['eventTitle'] ? "AI đang suy nghĩ..." : "Gợi ý tên sự kiện"}
            suggestions={aiSuggestions['eventTitle'].items}
            onSelect={(s) => {
              setFormData({ ...formData, eventTitle: s });
              setAiSuggestions(prev => ({ ...prev, eventTitle: { ...prev.eventTitle, show: false } }));
            }}
          />
        )}
      </Field>

      <Field
        id="field-eventTopic"
        label="Chủ đề chuyên môn"
        required
        error={errors.eventTopic}
        action={
          <button
            onClick={() => handleAIFieldSuggestion('eventTopic', 'Chủ đề chuyên môn')}
            disabled={aiLoadingFields['eventTopic']}
            style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {aiLoadingFields['eventTopic'] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI gợi ý
          </button>
        }
      >
        <Input
          placeholder="VD: Trí tuệ nhân tạo, Kỹ năng mềm..."
          value={formData.eventTopic || ""}
          onChange={(e) => setFormData({ ...formData, eventTopic: e.target.value })}
          error={errors.eventTopic}
        />
        {aiSuggestions['eventTopic']?.show && (
          <AISuggestionBox
            title={aiLoadingFields['eventTopic'] ? "AI đang suy nghĩ..." : "Chủ đề gợi ý"}
            suggestions={aiSuggestions['eventTopic'].items}
            onSelect={(s) => {
              setFormData({ ...formData, eventTopic: s });
              setAiSuggestions(prev => ({ ...prev, eventTopic: { ...prev.eventTopic, show: false } }));
            }}
          />
        )}
      </Field>

      <Field id="field-eventType" label={`Danh mục ${term}`} required error={errors.eventType}>
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
          <Field id="field-startTime" label="Thời gian bắt đầu" required error={errors.startTime}>
            <DateTimeField
              value={formData.startTime}
              onChange={(val) => setFormData({ ...formData, startTime: val })}
            />
          </Field>
          <Field id="field-endTime" label="Thời gian kết thúc" required error={errors.endTime}>
            <DateTimeField
              value={formData.endTime}
              onChange={(val) => setFormData({ ...formData, endTime: val })}
            />
          </Field>
        </div>

        <Field id="field-registrationDeadline" label="Hạn đăng ký tham gia" required error={errors.registrationDeadline}>
          <DateTimeField
            value={formData.registrationDeadline}
            onChange={(val) => setFormData({ ...formData, registrationDeadline: val })}
          />
        </Field>
      </div>

      <Field
        id="field-location"
        label="Địa điểm tổ chức"
        required
        error={errors.location}
        action={
          <button
            onClick={() => handleAIFieldSuggestion('location', 'Địa điểm tổ chức')}
            disabled={aiLoadingFields['location']}
            style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {aiLoadingFields['location'] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI gợi ý
          </button>
        }
      >
        <div style={{ position: "relative" }}>
          <Input placeholder="VD: Hội trường A, Cơ sở Nguyễn Văn Bảo" value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          <MapPin size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
        </div>
        {aiSuggestions['location']?.show && (
          <AISuggestionBox
            title={aiLoadingFields['location'] ? "AI đang suy nghĩ..." : "Địa điểm gợi ý"}
            suggestions={aiSuggestions['location'].items}
            onSelect={(s) => {
              setFormData({ ...formData, location: s });
              setAiSuggestions(prev => ({ ...prev, location: { ...prev.location, show: false } }));
            }}
          />
        )}
      </Field>
    </div>
  );
};

export default BasicInfoSection;
