import React, { useState } from "react";
import ManualInputStep from "./ManualInputStep";

export const QuickEventForm = ({ initialFormData = {}, onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    ...initialFormData,
    coverImage: "",
    presenters: [],
    organizers: [],
    detailedParticipants: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi gửi phê duyệt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          ← Quay lại danh sách
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Tạo sự kiện mới</h1>
          <p className="text-slate-500 mt-1">
            Điền đầy đủ thông tin và gửi phê duyệt
          </p>
        </div>

        <ManualInputStep
          formData={formData}
          setFormData={setFormData}
          onBack={onBack}
          onNext={handleSubmit}
          isQuickCreate={true}
        />
      </main>
    </div>
  );
};