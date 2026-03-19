import React, { useState, useEffect } from "react"; // Thêm useEffect
import { toast } from "react-toastify";
import { ArrowLeft, BookOpen, PlusCircle, ChevronRight } from "lucide-react";
import { TemplateSelectionStep } from "../../components/eventPlanner/TemplateSelectionStep";
import { ManualInputStep } from "../../components/eventPlanner/ManualInputStep";
import { EventProgramStep } from "../../components/eventPlanner/Eventprogramstep";
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
  status: "Draft",
  templateId: null,
  templateName: "",
  eventType: "",
  eventTypeOther: "",
  eventTitle: "",
  eventTopic: "",
  eventPurpose: "",
  faculty: "",
  major: "",
  recipients: [],
  customRecipients: [],
  participants: [],
  notes: "",
  presenters: [],
  organizers: [],
  attendees: [],
  customFields: [], 
  hasLuckyDraw: false,
};

export const EventPlanner = ({
  onBack,
  initialStep = 1,
  initialFormData = {},
}) => {
  const [step, setStep] = useState(initialStep);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(null); 
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    ...initialFormData,
  });

  useEffect(() => {
    const getAccountId = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const accountId = user.id || user.accountId || user.account?.id || user.userId;
          if (accountId) {
            setCurrentAccountId(accountId);
            console.log("📋 Account ID từ user data:", accountId);
            return;
          }
        } catch (error) {
          console.error("Lỗi parse user data:", error);
        }
      }

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));
          const accountId = payload.accountId || payload.sub || payload.userId || payload.id;
          if (accountId) {
            setCurrentAccountId(accountId);
            console.log("📋 Account ID từ token:", accountId);
          }
        } catch (e) {
          console.error("Lỗi decode token:", e);
        }
      }
    };

    getAccountId();
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedTemplate(null);
  };

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const TOTAL_STEPS = 4;
  const STEP_LABELS = {
    1: "Thiết lập bản mẫu",
    2: "Soạn thảo nội dung",
    3: "Chương trình sự kiện",
    4: "Hoàn tất kế hoạch",
  };

  const handleGlobalBack = () => {
    if (step === 1) {
      onBack();
    } else if (step === 2 && initialStep === 2) {
      onBack();
    } else {
      setStep(step - 1);
    }
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
        templateId: null,
        templateName: "",
        eventType: "",
        eventTypeOther: "",
        programItems: [],
        participants: [],
        presenters: [],
        organizers: [],
        themes: [],
        faculty: "",
        major: "",
      });
    } else {
      let configData = {};
      try {
        if (template.configData) {
          configData = JSON.parse(template.configData);
        }
      } catch (e) {
        console.error("Lỗi parse configData từ bản mẫu:", e);
      }

      updateFormData({
        title: template.defaultTitle || "",
        eventTitle: template.defaultTitle || "",
        description: template.description || template.defaultDescription || "",
        eventPurpose: template.defaultDescription || "",
        location: template.defaultLocation || "",
        eventMode: template.defaultEventMode || "OFFLINE",
        maxParticipants: template.defaultMaxParticipants || 1,
        templateId: template.id,
        templateName: template.templateName,
        eventType:
          template.templateType === "Khác"
            ? "Khác"
            : template.templateType || "",
        eventTypeOther:
          template.templateType === "Khác"
            ? template.customTemplateType || ""
            : "",
        programItems: configData.programItems || [],
        participants: configData.participants || [],
        presenters: configData.presenters || [],
        organizers: configData.organizers || [],
        themes: template.themes || [],
        faculty: template.faculty || "",
        major: template.major || "",
      });
    }
  };

  const handleSave = async () => {
    if (!currentAccountId) {
      toast.error("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại!");
      return;
    }

    const errors = [];
    const trimmedTitle = (formData.eventTitle || formData.title || "").trim();

    if (!trimmedTitle) errors.push("Tiêu đề sự kiện là bắt buộc");
    if (!formData.startTime) errors.push("Thời gian bắt đầu là bắt buộc");
    if (!formData.endTime) errors.push("Thời gian kết thúc là bắt buộc");

    if (formData.endTime && formData.startTime) {
      if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        errors.push("Thời gian kết thúc phải sau thời gian bắt đầu");
      }
    }

    if (errors.length > 0) {
      toast.warning("Vui lòng sửa lỗi:\n• " + errors.join("\n• "));
      return;
    }

    setIsSaving(true);
    try {
      const toISO = (dt) => {
        if (!dt) return null;
        const date = new Date(dt);
        return isNaN(date.getTime()) ? null : date.toISOString();
      };

      const now = new Date().toISOString();

      const eventType = formData.eventType || formData.type || "WORKSHOP";

      const payload = {
        organizationId: formData.organizationId || "org-it",
        title: trimmedTitle,
        description: (
          formData.eventPurpose ||
          formData.description ||
          ""
        ).trim(),

        eventTopic: (formData.eventTopic || "").trim(),
        location: (formData.location || "Chưa xác định").trim(),
        eventMode: (formData.eventMode || "OFFLINE").toUpperCase(),

        type: eventType,

        startTime: toISO(formData.startTime),
        endTime: toISO(formData.endTime),
        registrationDeadline: toISO(formData.registrationDeadline),

        maxParticipants: Number(formData.maxParticipants) || 50,

        status: "Draft",

        hasLuckyDraw: formData.hasLuckyDraw || false,
        finalized: false,
        archived: false,

        participants: Array.isArray(formData.participants)
          ? formData.participants
          : [],
        faculty: formData.faculty || "",
        major: formData.major || "",
        recipients: Array.isArray(formData.recipients)
          ? formData.recipients
          : [],
        customRecipients: Array.isArray(formData.customRecipients)
          ? formData.customRecipients
          : [],
        presenters: Array.isArray(formData.presenters)
          ? formData.presenters.map((p) => (typeof p === "string" ? p : p.name))
          : [],
        organizingCommittee: Array.isArray(formData.organizers)
          ? formData.organizers.map((p) => (typeof p === "string" ? p : p.name))
          : [],
        attendees: Array.isArray(formData.attendees)
          ? formData.attendees.map((p) => (typeof p === "string" ? p : p.name))
          : [],

        notes: (formData.notes || "").trim(),
        templateId:
          formData.templateId === "0" || !formData.templateId
            ? null
            : formData.templateId,

        programItems: (formData.programItems || []).map((item) => ({
          title: item.title,
          notes:
            `${item.presenter || ""} ${item.presenterTitle ? `(${item.presenterTitle})` : ""}`.trim(),
        })),

        customFieldsJson:
          formData.customFields?.length > 0
            ? JSON.stringify(formData.customFields)
            : null,

        // THÊM createdByAccountId VÀO PAYLOAD
        createdByAccountId: currentAccountId,
      };

      console.log("📤 Payload gửi đi:", payload);

      await createPlan(payload);
      toast.success("✅ Lưu kế hoạch thành công!");
      onBack();
    } catch (err) {
      console.error("🔴 Server trả về lỗi:", err.response?.data);

      if (err.response?.data) {
        console.error(
          "Chi tiết lỗi:",
          JSON.stringify(err.response.data, null, 2),
        );
      }

      const data = err.response?.data;
      let errorMsg = "Kiểm tra lại định dạng dữ liệu";

      if (data && typeof data === "object" && !data.timestamp) {
        errorMsg = Object.entries(data)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join("\n• ");
      } else {
        errorMsg = data?.message || data?.error || errorMsg;
      }
      toast.error(`❌ Lỗi khi lưu:\n\n${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button
          onClick={handleGlobalBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider w-24"
        >
          <ArrowLeft size={16} /> {step === 1 ? "Thoát" : "Quay lại"}
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
            onBack={() => handleGlobalBack()}
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
            mode="plan"
          />
        )}
        {step === 4 && (
          <PreviewStep
            data={formData || {}}
            onEdit={() => setStep(3)}
            onGoToStep2={() => {
              resetForm();
              setStep(2);
            }}
            onReset={() => {
              resetForm();
              setStep(1);
            }}
            onSave={handleSave}
            isSubmitting={isSaving}
            mode="plan"
            templateFields={[]}
          />
        )}
      </div>
    </div>
  );
};

export default EventPlanner;