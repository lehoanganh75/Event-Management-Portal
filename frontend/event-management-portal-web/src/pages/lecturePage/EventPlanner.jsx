import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, BookOpen, PlusCircle, ChevronRight } from "lucide-react";
import { TemplateSelectionStep } from "../../components/eventPlanner/TemplateSelectionStep";
import { ManualInputStep } from "../../components/eventPlanner/ManualInputStep";
import { EventProgramStep } from "../../components/eventPlanner/Eventprogramstep";
import { PreviewStep } from "../../components/eventPlanner/PreviewStep";
import axios from "axios";
import { eventApi } from "../../api/eventApi";
import { notificationApi } from "../../api/notificationApi";

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
  targetObjects: [],

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
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    ...initialFormData,
  });

  useEffect(() => {
    const getUserInfo = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const accountId =
            user.id || user.accountId || user.account?.id || user.userId;
          if (accountId) {
            setCurrentAccountId(accountId);
            setCurrentUserInfo({
              id: accountId,
              name: user.fullName || user.name || user.username || "Người dùng",
              email: user.email || "",
              role: user.role || "USER",
            });
            return;
          }
        } catch (error) {
          console.error("Lỗi parse user data:", error);
        }
      }

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const base64Url = accessToken.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(base64));
          const accountId =
            payload.accountId || payload.sub || payload.userId || payload.id;
          if (accountId) {
            setCurrentAccountId(accountId);
            setCurrentUserInfo({
              id: accountId,
              name:
                payload.fullName ||
                payload.name ||
                payload.username ||
                "Người dùng",
              email: payload.email || "",
              role: payload.role || "USER",
            });
          }
        } catch (e) {
          console.error("Lỗi decode token:", e);
        }
      }
    };

    getUserInfo();
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
        attendees: [],
        targetObjects: [],
        themes: [],
        faculty: "",
        major: "",
      });
    } else {
      let configData = {};
      try {
        if (template.configData) {
          configData = typeof template.configData === "string" 
            ? JSON.parse(template.configData) 
            : template.configData;
        }
      } catch (e) {
        console.error("Lỗi parse configData từ bản mẫu:", e);
      }

      const standardEventTypes = [
        "WORKSHOP",
        "SEMINAR",
        "TALKSHOW",
        "COMPETITION",
        "CONFERENCE",
        "WEBINAR",
        "CONCERT",
      ];

      const templateType = template.templateType || "";
      const isStandardType = standardEventTypes.includes(templateType);

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
        eventType: isStandardType ? templateType : "OTHER",
        eventTypeOther: isStandardType ? "" : templateType,
        programItems: configData.programItems || [],
        participants: configData.participants || [],
        presenters: configData.presenters || [],
        organizers: configData.organizers || [],
        attendees: configData.attendees || [],
        targetObjects: configData.targetObjects || [],
        themes: template.themes || [],
        faculty: template.faculty || "",
        major: template.major || "",
      });
    }
  };

  const getCurrentUser = () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const base64Url = accessToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return {
          accountId:
            payload.accountId || payload.sub || payload.userId || payload.id,
          name: payload.name || payload.fullName || "Người dùng",
          email: payload.email,
        };
      }
    } catch (e) {
      console.error("Lỗi decode token:", e);
    }

    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return {
          accountId:
            user.id || user.accountId || user.account?.id || user.userId,
          name: user.fullName || user.name || "Người dùng",
          email: user.email,
        };
      }
    } catch (error) {
      console.error("Lỗi parse user data:", error);
    }

    return null;
  };

  const sendPlanNotification = async (targetUserId, planId, planTitle, status) => {
    const isApproval = status === "PLAN_PENDING_APPROVAL";
    try {
      const payload = {
        userProfileId: targetUserId,
        type: isApproval ? "PLAN_SUBMITTED" : "PLAN_CREATED",
        title: isApproval ? "🚀 Yêu cầu phê duyệt kế hoạch" : "📝 Đã lưu bản nháp kế hoạch",
        message: isApproval 
          ? `Kế hoạch "${planTitle}" đã được gửi và đang chờ bạn phê duyệt.`
          : `Kế hoạch "${planTitle}" đã được lưu thành công vào bản nháp của bạn.`,
        relatedEntityId: planId,
        relatedEntityType: "PLAN",
        actionUrl: `/manage-plans/${planId}`,
        priority: isApproval ? 2 : 1,
      };
      await notificationApi.create.send(payload);
    } catch (error) {
      console.warn(`⚠️ Lỗi gửi thông báo cho ${targetUserId}:`, error.message);
    }
  };

  const removeEmptyFields = (obj, keepFields = []) => {
    const cleaned = {};
    for (const key in obj) {
      if (keepFields.includes(key)) {
        cleaned[key] = obj[key];
      } else if (
        obj[key] !== "" &&
        obj[key] !== null &&
        obj[key] !== undefined
      ) {
        cleaned[key] = obj[key];
      }
    }
    return cleaned;
  };

  const handleSavePlan = async (dataToSave, targetStatus = "DRAFT") => {
    if (!currentAccountId) {
      toast.error(
        "Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại!",
      );
      return;
    }

    const errors = [];
    const trimmedTitle = (formData.eventTitle || formData.title || "").trim();

    if (!trimmedTitle) errors.push("Tiêu đề sự kiện là bắt buộc");
    if (!formData.startTime) errors.push("Thời gian bắt đầu là bắt buộc");
    if (!formData.endTime) errors.push("Thời gian kết thúc là bắt buộc");
    if (!formData.location || !formData.location.trim())
      errors.push("Địa điểm là bắt buộc");
    if (!formData.eventMode) errors.push("Hình thức sự kiện là bắt buộc");
    if (!formData.maxParticipants || formData.maxParticipants <= 0) {
      errors.push("Số lượng người tham gia tối đa phải lớn hơn 0");
    }

    if (formData.endTime && formData.startTime) {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);

      if (isNaN(startDate.getTime()))
        errors.push("Thời gian bắt đầu không hợp lệ");
      if (isNaN(endDate.getTime()))
        errors.push("Thời gian kết thúc không hợp lệ");

      if (endDate <= startDate) {
        errors.push("Thời gian kết thúc phải sau thời gian bắt đầu");
      }
    }

    if (errors.length > 0) {
      toast.warning("Vui lòng sửa các lỗi sau:\n• " + errors.join("\n• "));
      return;
    }

    setIsSaving(true);
    try {
      const toISO = (dt) => {
        if (!dt) return null;
        const date = new Date(dt);
        if (isNaN(date.getTime())) return null;
        // LocalDateTime on backend doesn't like the 'Z' (UTC) suffix
        return date.toISOString().split(".")[0]; 
      };

      const eventType = formData.eventType || formData.type || "WORKSHOP";
      const maxParticipants = Number(formData.maxParticipants) || 50;
      const location = (formData.location || "Chưa xác định").trim();
      const eventMode = (formData.eventMode || "OFFLINE").toUpperCase();

      const formattedPresenters = Array.isArray(formData.presenters)
        ? formData.presenters.map((p) => {
            return {
              fullName: p.fullName || p.name || "",
              email: p.email || "",
              position: p.position || p.title || "",
            };
          })
        : [];

      const formattedOrganizers = Array.isArray(formData.organizers)
        ? formData.organizers.map((o) => ({
            fullName: o.fullName || "",
            email: o.email || "",
            position: o.position || "",
            role: o.role || "MEMBER",
          }))
        : [];

      const formattedParticipants = Array.isArray(formData.attendees)
        ? formData.attendees
            .map((a) => {
              const participant = {
                fullName: a.fullName || a.name || "",
                email: a.email || "",
                title: a.title || "",
                position: a.position || "",
                department: a.department || "",
                organization: a.organization || "",
                code: a.studentId || a.code || "",
                notes: a.notes || "",
              };
              return removeEmptyFields(participant, ["email"]);
            })
            .filter((p) => p.fullName)
        : [];

      const formattedTargetObjects = Array.isArray(formData.targetObjects)
        ? formData.targetObjects.map((obj) => ({
            type: obj.type || "OTHER",
            typeName: obj.typeName || "Khác",
          }))
        : [];

      const formattedRecipients = Array.isArray(formData.recipients)
        ? formData.recipients.map((r) => {
            if (typeof r === "string") {
              return {
                name: r,
                type: "DEPARTMENT",
                email: "",
              };
            }
            return r;
          })
        : [];

      const formattedCustomRecipients = Array.isArray(formData.customRecipients)
        ? formData.customRecipients.map((r) => {
            if (typeof r === "string") {
              return {
                name: r,
                type: "CUSTOM",
                email: "",
              };
            }
            return r;
          })
        : [];

      const payload = {
        organizationId: formData.organizationId || "org-it",
        title: trimmedTitle,
        description: (
          formData.eventPurpose ||
          formData.description ||
          ""
        ).trim(),
        eventTopic: (formData.eventTopic || "").trim(),
        location: location,
        eventMode: eventMode,
        type: eventType,
        startTime: toISO(formData.startTime),
        endTime: toISO(formData.endTime),
        registrationDeadline: toISO(formData.registrationDeadline),
        maxParticipants: maxParticipants,
        status: targetStatus,
        hasLuckyDraw: formData.hasLuckyDraw || false,
        finalized: false,
        archived: false,
        faculty: formData.faculty || "",
        major: formData.major || "",
        recipients: formattedRecipients,
        customRecipients: formattedCustomRecipients,
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

        presenters: formattedPresenters,
        organizers: formattedOrganizers,
        participants: formattedParticipants,
        targetObjects: formattedTargetObjects,

        createdByAccountId: currentAccountId,
      };

      console.log("DEBUG: Payload gửi đi:", payload);

      let response;
      if (formData.id) {
        // Cập nhật kế hoạch đã có
        response = await eventApi.plans.update(formData.id, payload);
      } else {
        // Tạo kế hoạch mới
        response = await eventApi.plans.create(payload, false);
      }
      
      const planId = formData.id || response.data?.id || response.data?.planId;

      if (planId) {
        // Thông báo cho chính người tạo
        await sendPlanNotification(currentAccountId, planId, trimmedTitle, targetStatus);

        // Thông báo cho các phòng ban liên quan
        if (formattedRecipients && formattedRecipients.length > 0) {
          const notificationPromises = formattedRecipients.map((recipient) => {
            const targetId =
              recipient.id || recipient.accountId || recipient.name;
            return sendPlanNotification(targetId, planId, trimmedTitle, targetStatus);
          });

          await Promise.all(notificationPromises);
          console.log(
            `✅ Đã gửi thông báo đến ${formattedRecipients.length} người nhận.`,
          );
        }
      }

      if (targetStatus === "DRAFT") {
        toast.success("✅ Đã lưu bản nháp thành công!");
      } else {
        toast.success("🚀 Đã gửi yêu cầu phê duyệt kế hoạch!");
      }
      onBack();
    } catch (err) {
      console.error("DEBUG: Lỗi chi tiết từ Server:", err.response?.data || err);
      let errorMessage = "Kiểm tra lại định dạng dữ liệu";

      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors
            .map((e) => e.defaultMessage || e.field)
            .join("\n• ");
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData, null, 2);
        }
      }

      toast.error(`❌ Lỗi khi lưu:\n\n${errorMessage}`);
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
            onSave={handleSavePlan}
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
