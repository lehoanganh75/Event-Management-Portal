import React, { useState } from "react";
import { toast } from "react-toastify";
import ManualInputStep from "./ManualInputStep";
import EventReviewStep from "../../components/events/EventReviewstep";
import { EventProgramStep } from "../../components/eventPlanner/Eventprogramstep";
import { createEvent } from "../../api/eventApi";

export const EventCreator = ({
  onBack,
  initialFormData = {},
  fromPlan = false,
}) => {
  const [step, setStep] = useState(fromPlan ? 2.5 : 2);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = async (finalData) => {
    setIsSubmitting(true);
    try {
      let accountId = null;

      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          accountId =
            user.id || user.accountId || user.account?.id || user.userId;
        } catch (error) {
          console.error("Lỗi parse user data:", error);
        }
      }

      if (!accountId) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          try {
            const base64Url = accessToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));
            accountId =
              payload.accountId || payload.sub || payload.userId || payload.id;
          } catch (e) {
            console.error("Lỗi decode token:", e);
          }
        }
      }

      const toISO = (dt) => {
        if (!dt) return null;
        const date = new Date(dt);
        return isNaN(date.getTime()) ? null : date.toISOString();
      };

      const data = finalData || formData;

      const payload = {
        title: (data.eventTitle || data.title || "").trim(),
        description: (data.eventPurpose || data.description || "").trim(),
        eventTopic: (data.eventTopic || "").trim(),
        location: (data.location || "").trim(),
        eventMode: (data.eventMode || "OFFLINE").toUpperCase(),
        type: data.eventType || data.type || "OTHER",
        startTime: toISO(data.startTime),
        endTime: toISO(data.endTime),
        registrationDeadline: toISO(data.registrationDeadline),
        maxParticipants: Number(data.maxParticipants) || 50,
        hasLuckyDraw: data.hasLuckyDraw || false,
        faculty: data.faculty || "",
        major: data.major || "",
        organizerUnit: data.organizerUnit || data.faculty || "",

        participants: Array.isArray(data.participants) ? data.participants : [],

        recipients: Array.isArray(data.recipients) ? data.recipients : [],
        customRecipients: Array.isArray(data.customRecipients)
          ? data.customRecipients
          : [],

        presenters: Array.isArray(data.presenters)
          ? data.presenters
              .map((p) => {
                if (typeof p === "string") return p;
                return p.name || p.fullName || "";
              })
              .filter(Boolean)
          : [],

        organizers: Array.isArray(data.organizers)
          ? data.organizers
              .map((o) => {
                if (typeof o === "string") return o;
                return o.name || o.fullName || "";
              })
              .filter(Boolean)
          : [],

        attendees: Array.isArray(data.attendees)
          ? data.attendees
              .map((a) => {
                if (typeof a === "string") return a;
                return a.name || a.fullName || "";
              })
              .filter(Boolean)
          : [],

        targetObjects: Array.isArray(data.targetObjects)
          ? data.targetObjects
          : [],

        notes: (data.notes || "").trim(),
        coverImage: data.coverImage || "",
        createdByAccountId: accountId,
        status: "EVENT_PENDING_APPROVAL",
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      console.log("📤 Payload gửi đi:", payload);

      await createEvent(payload);
      toast.success("✅ Gửi phê duyệt thành công!");
      onBack();
    } catch (error) {
      console.error("❌ Lỗi:", error.response?.data);
      toast.error(
        "❌ Lỗi khi gửi phê duyệt: " +
          (error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
        >
          ← Quay lại
        </button>
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {step === 2 && (
          <ManualInputStep
            formData={formData}
            setFormData={updateFormData}
            onBack={onBack}
            onNext={(data) => {
              updateFormData(data);
              setStep(3);
            }}
          />
        )}

        {step === 2.5 && (
          <EventReviewStep
            formData={formData}
            setFormData={updateFormData}
            onBack={onBack}
          />
        )}
        {step === 3 && (
          <EventProgramStep
            formData={formData}
            setFormData={updateFormData}
            onBack={() => setStep(2)}
            onNext={(programData) => {
              const merged = { ...formData, ...programData };
              updateFormData(merged);
              handleSubmit(merged);
            }}
            onNextLabel="Gửi phê duyệt"
            isSubmitting={isSubmitting}
            mode="event"
          />
        )}
      </div>
    </div>
  );
};
