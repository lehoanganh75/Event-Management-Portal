import React from "react";
import { Sparkles, Loader2, Upload } from "lucide-react";
import { Field, Input, Textarea, AISuggestionBox } from "./BaseUI.jsx";
import ImageUpload from "../../../common/ImageUpload.jsx";

const InteractionAndSettingsSection = ({
  formData,
  setFormData,
  errors,
  term,
  aiLoadingFields,
  aiSuggestions,
  handleAIFieldSuggestion,
  handleGenerateDescriptionWithAI,
  setAiSuggestions
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>Mô tả & Cài đặt người tham gia</h2>

      <Field
        id="field-eventPurpose"
        label={`Mô tả ${term}`}
        required
        error={errors.eventPurpose}
        action={
          <button
            onClick={handleGenerateDescriptionWithAI}
            disabled={aiLoadingFields['eventPurpose']}
            style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {aiLoadingFields['eventPurpose'] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI gợi ý mô tả
          </button>
        }
      >
        <Textarea
          placeholder={`Mô tả chi tiết về ${term}, nội dung chính, đối tượng tham gia...`}
          rows={6}
          value={formData.eventPurpose || ""}
          onChange={(e) => setFormData({ ...formData, eventPurpose: e.target.value })}
        />
        {aiSuggestions['eventPurpose']?.show && (
          <AISuggestionBox
            title={aiLoadingFields['eventPurpose'] ? "AI đang suy nghĩ..." : "Mẫu mô tả từ AI dựa trên ngữ cảnh của bạn"}
            suggestions={aiSuggestions['eventPurpose'].items}
            onSelect={(s) => {
              setFormData({ ...formData, eventPurpose: s });
              setAiSuggestions(prev => ({ ...prev, eventPurpose: { ...prev.eventPurpose, show: false } }));
            }}
          />
        )}
      </Field>

      <Field
        id="field-maxParticipants"
        label="Số lượng người tham gia tối đa"
        required
        error={errors.maxParticipants}
        action={
          <button
            onClick={() => handleAIFieldSuggestion('maxParticipants', 'Số lượng người tham gia')}
            disabled={aiLoadingFields['maxParticipants']}
            style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {aiLoadingFields['maxParticipants'] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI gợi ý
          </button>
        }
      >
        <Input type="number" placeholder="VD: 500" value={formData.maxParticipants || ""} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} />
        {aiSuggestions['maxParticipants']?.show && (
          <AISuggestionBox
            title={aiLoadingFields['maxParticipants'] ? "AI đang suy nghĩ..." : "Quy mô gợi ý"}
            suggestions={aiSuggestions['maxParticipants'].items}
            onSelect={(s) => {
              const num = s.match(/\d+/) ? s.match(/\d+/)[0] : "100";
              setFormData({ ...formData, maxParticipants: num });
              setAiSuggestions(prev => ({ ...prev, maxParticipants: { ...prev.maxParticipants, show: false } }));
            }}
          />
        )}
      </Field>

      <Field
        id="field-goal"
        label={`Mục tiêu ${term}`}
        action={
          <button
            onClick={() => handleAIFieldSuggestion('goal', 'Mục tiêu sự kiện')}
            disabled={aiLoadingFields['goal']}
            style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {aiLoadingFields['goal'] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI gợi ý
          </button>
        }
      >
        <Input placeholder="VD: Nâng cao kỹ năng, Kết nối doanh nghiệp..." value={formData.goal || ""} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} />
        {aiSuggestions['goal']?.show && (
          <AISuggestionBox
            title={aiLoadingFields['goal'] ? "AI đang suy nghĩ..." : "Gợi ý mục tiêu"}
            suggestions={aiSuggestions['goal'].items}
            onSelect={(s) => {
              setFormData({ ...formData, goal: s });
              setAiSuggestions(prev => ({ ...prev, goal: { ...prev.goal, show: false } }));
            }}
          />
        )}
      </Field>

      <Field
        id="field-requirement"
        label="Yêu cầu đối với người tham gia"
        action={
          <button
            onClick={() => handleAIFieldSuggestion('requirement', 'Yêu cầu tham gia')}
            disabled={aiLoadingFields['requirement']}
            style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {aiLoadingFields['requirement'] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI gợi ý
          </button>
        }
      >
        <Textarea
          placeholder="VD: Sinh viên năm 3, 4; Có kiến thức cơ bản về lập trình..."
          value={formData.requirement || ""}
          onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
        />
        {aiSuggestions['requirement']?.show && (
          <AISuggestionBox
            title={aiLoadingFields['requirement'] ? "AI đang suy nghĩ..." : "Gợi ý yêu cầu"}
            suggestions={aiSuggestions['requirement'].items}
            onSelect={(s) => {
              setFormData({ ...formData, requirement: s });
              setAiSuggestions(prev => ({ ...prev, requirement: { ...prev.requirement, show: false } }));
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
    </div>
  );
};

export default InteractionAndSettingsSection;
