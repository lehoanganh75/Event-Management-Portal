import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { TemplateSelectionStep } from "../../components/eventPlanner/TemplateSelectionStep";
import { ManualInputStep } from "../../components/eventPlanner/ManualInputStep";
import { EventProgramStep } from "../../components/eventPlanner/EventProgramStep";
import { PreviewStep } from "../../components/eventPlanner/PreviewStep";
import { createPlan } from "../../api/eventApi";

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  location: "",
  startTime: "",
  endTime: "",
  eventMode: "OFFLINE",
  maxParticipants: 0,
  organizationId: "org-it",
  status: "DRAFT",
  templateId: null,
  templateName: "",

  eventType: "",
  eventTypeOther: "",
  eventTitle: "",
  eventTopic: "",
  eventPurpose: "",
  organizer: "",
  organizerUnit: "",
  recipients: [],
  customRecipients: [],
  participants: [],
  notes: "",

  presenters: [],
  organizers: [],
  attendees: [],
  customFields: [],
};

export const EventPlanner = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedTemplate(null);
  };

  const handleGlobalBack = () => {
    if (step === 1) onBack();
    else setStep(step - 1);
  };

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    if (template.id === "0") {
      updateFormData({
        title: "",
        eventTitle: "",
        description: "",
        eventPurpose: "",
        location: "",
        eventMode: "OFFLINE",
        maxParticipants: 0,
        templateId: "0",
        templateName: "",
      });
    } else {
      updateFormData({
        title: template.defaultTitle || "",
        eventTitle: template.defaultTitle || "",
        description: template.defaultDescription || "",
        eventPurpose: template.defaultDescription || "",
        location: template.defaultLocation || "",
        eventMode: template.defaultEventMode || "OFFLINE",
        maxParticipants: template.defaultMaxParticipants || 0,
        templateId: template.id,
        templateName: template.templateName,
        eventType: template.templateType === "Khác" ? "Khác" : (template.templateType || ""),
        eventTypeOther: template.templateType === "Khác" ? (template.customTemplateType || "") : "",
      });
    }
  };

  const TOTAL_STEPS = 4;

  const STEP_LABELS = {
    1: "Thiết lập bản mẫu",
    2: "Soạn thảo nội dung",
    3: "Chương trình sự kiện",
    4: "Hoàn tất kế hoạch",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {step < 5 && (
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button
            onClick={handleGlobalBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider w-24"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div className="flex flex-col items-center">
            <div className="text-center mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block">
                Bước {step} / {TOTAL_STEPS}
              </span>
              <h2 className="text-base font-black text-slate-800 tracking-tight">
                {STEP_LABELS[step]}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    s === step
                      ? "w-6 bg-blue-600"
                      : s < step
                        ? "w-3 bg-blue-300"
                        : "w-3 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="w-24" />
        </div>
      )}

      <div className={`flex-1 ${step === 4 ? "p-0" : "p-8"}`}>
        {step === 1 && (
          <TemplateSelectionStep
            organizationId={formData.organizationId}
            onTemplateSelect={handleTemplateSelect}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <ManualInputStep
            formData={formData}
            setFormData={updateFormData}
            onBack={() => setStep(1)}
            onNext={(data) => {
              updateFormData(data);
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <EventProgramStep
            formData={formData}
            setFormData={updateFormData}
            onBack={() => setStep(2)}
            onNext={(programData) => {
              updateFormData(programData);
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <PreviewStep
            data={formData}
            onEdit={() => setStep(3)}
            onGoToStep2={() => {
              resetForm();
              setStep(2);
            }}
            onReset={() => {
              resetForm();
              setStep(1);
            }}
            onSave={async () => {
              try {
                const formatDateTime = (dt) => {
                  if (!dt) return null;
                  return dt.includes(":") ? dt : null;
                };

                const eventTypeMap = {
                  "Hội thảo": "Seminar",
                  "Workshop": "Workshop",
                  "Seminar": "Seminar",
                  "Tọa đàm": "Talkshow",
                  "Thi đấu": "Competition",
                  "Khác": "Other",
                };

                const cleanPayload = {
                  organizationId: formData.organizationId || "org-it",
                  title: formData.eventTitle || formData.title || "Untitled",
                  description: formData.eventPurpose || formData.description || "",
                  location: formData.location || "",
                  startTime: formatDateTime(formData.startTime),
                  endTime: formatDateTime(formData.endTime),
                  eventMode: formData.eventMode || "OFFLINE",
                  registrationDeadline: formatDateTime(formData.registrationDeadline),
                  maxParticipants: Number(formData.maxParticipants) || 0,
                  eventType: eventTypeMap[formData.eventType] || formData.eventType || null,
                  customEventType: formData.eventType === "Khác" ? formData.eventTypeOther : null,
                  status: "Draft",
                  hasLuckyDraw: false,
                  finalized: false,
                  archived: false,
                };

                await createPlan(cleanPayload);
                alert("✅ Kế hoạch đã được lưu thành công!");
                onBack();
              } catch (err) {
                const detail = err?.response?.data;
                console.error("🔴 Chi tiết lỗi từ Server:", detail);
                alert(
                  `❌ Lỗi 400: Có thể do định dạng ngày hoặc giá trị Enum chưa khớp.\n\nChi tiết: ${detail?.message || "Bad Request"}`,
                );
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EventPlanner;