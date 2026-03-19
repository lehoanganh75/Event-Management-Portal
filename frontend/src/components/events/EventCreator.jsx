import React, { useState } from "react";
import { toast } from "react-toastify";
import ManualInputStep from "./ManualInputStep";
import { PlanReviewStep } from "../../components/events/EventReviewstep";
import { EventProgramStep } from "../../components/eventPlanner/Eventprogramstep";
import { createEvent } from "../../api/eventApi";

export const EventCreator = ({ onBack, initialFormData = {}, fromPlan = false }) => {
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
          accountId = user.id || user.accountId || user.account?.id || user.userId;
        } catch (error) {
          console.error("Lỗi parse user data:", error);
        }
      }

      if (!accountId) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          try {
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            accountId = payload.accountId || payload.sub || payload.userId || payload.id;
          } catch (e) {
            console.error("Lỗi decode token:", e);
          }
        }
      }

      const payload = {
        ...(finalData || formData),
        status: "PendingApproval",
        createdByAccountId: accountId,
      };
      await createEvent(payload);
      toast.success("✅ Gửi phê duyệt thành công!");
      onBack();
    } catch (error) {
      console.error("❌ Lỗi:", error.response?.data);
      toast.error("❌ Lỗi khi gửi phê duyệt: " + (error.response?.data?.message || error.message || "Lỗi không xác định"));
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
          <PlanReviewStep
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