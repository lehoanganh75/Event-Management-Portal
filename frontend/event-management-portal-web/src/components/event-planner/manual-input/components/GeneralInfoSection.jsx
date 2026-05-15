import React from "react";
import { FileText, MapPin, Building, Info, Sparkles, Loader2 } from "lucide-react";
import { Field, Input, Select, Textarea, AISuggestionBox } from "./BaseUI";

export const EVENT_TYPES = [
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

const GeneralInfoSection = ({ 
  formData, 
  setFormData, 
  errors, 
  term, 
  orgs, 
  loadingOrgs, 
  aiLoadingFields, 
  aiSuggestions, 
  handleAIFieldSuggestion, 
  handleGenerateDescriptionWithAI 
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <Field label={`Tên ${term}`} required error={errors.eventTitle}>
          <div style={{ position: "relative" }}>
            <Input
              value={formData.eventTitle}
              onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
              placeholder={`VD: Hội thảo học thuật 2026`}
              style={{ paddingRight: 40 }}
            />
          </div>
        </Field>

        <Field label="Chủ đề / Lĩnh vực">
          <Input
            value={formData.eventTopic}
            onChange={(e) => setFormData({ ...formData, eventTopic: e.target.value })}
            placeholder="VD: Công nghệ, Nghệ thuật..."
          />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Field label="Đơn vị tổ chức" required error={errors.organizationId}>
          <Select
            value={formData.organizationId}
            onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
          >
            <option value="">-- Chọn đơn vị --</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </Select>
          {loadingOrgs && <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Đang tải danh sách đơn vị...</p>}
        </Field>

        <Field label="Loại hình sự kiện" required error={errors.templateType}>
          <Select
            value={formData.templateType}
            onChange={(e) => setFormData({ ...formData, templateType: e.target.value })}
          >
            <option value="">-- Chọn loại hình --</option>
            {EVENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field 
        label="Địa điểm dự kiến" 
        required 
        error={errors.location}
        action={
          <button
            onClick={() => handleAIFieldSuggestion('location', 'Địa điểm sự kiện')}
            disabled={aiLoadingFields['location']}
            style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {aiLoadingFields['location'] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI gợi ý địa điểm
          </button>
        }
      >
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="VD: Hội trường A, CS1"
        />
        {aiSuggestions['location']?.show && (
          <AISuggestionBox
            title="Địa điểm phổ biến cho loại sự kiện này"
            suggestions={aiSuggestions['location'].items}
            onSelect={(s) => setFormData({ ...formData, location: s })}
          />
        )}
      </Field>

      <Field 
        label="Mục đích & Mô tả" 
        required 
        error={errors.description}
        action={
          <button
            onClick={handleGenerateDescriptionWithAI}
            disabled={aiLoadingFields['eventPurpose']}
            style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {aiLoadingFields['eventPurpose'] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI viết mô tả hộ bạn
          </button>
        }
      >
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={`Mô tả chi tiết nội dung, mục tiêu của ${term}...`}
          rows={5}
        />
        {aiSuggestions['eventPurpose']?.show && (
          <AISuggestionBox
            title="Mẫu mô tả từ AI (Chọn để áp dụng)"
            suggestions={aiSuggestions['eventPurpose'].items}
            onSelect={(s) => setFormData({ ...formData, description: s })}
          />
        )}
      </Field>
    </div>
  );
};

export default GeneralInfoSection;
