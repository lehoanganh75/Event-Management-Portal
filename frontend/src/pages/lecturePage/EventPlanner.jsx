import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { TemplateSelectionStep } from "../../components/eventPlanner/TemplateSelectionStep";
import { ManualInputStep } from "../../components/eventPlanner/ManualInputStep";
import { PreviewStep } from "../../components/eventPlanner/PreviewStep";

export const EventPlanner = ({ onBack }) => {
  const [step, setStep] = useState(1);

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleGlobalBack = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {step < 3 && (
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button
            onClick={handleGlobalBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="text-center">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] block mb-1">
                Bước {step} / 3
              </span>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                {step === 1
                  ? "Thiết lập bản mẫu"
                  : step === 2
                    ? "Điền thông tin chi tiết"
                    : "Hoàn tất kế hoạch"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? "w-8 bg-blue-600"
                      : s < step
                        ? "w-4 bg-blue-300"
                        : "w-4 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="w-24"></div>
        </div>
      )}

      <div className={`flex-1 ${step === 3 ? "p-4" : "p-8"}`}>
        {/* BƯỚC 1: CHỌN BẢN MẪU */}
        {step === 1 && (
          <TemplateSelectionStep
            onTemplateSelect={(template) => {
              setSelectedTemplate(template);
              console.log("Template selected:", template);
            }}
            onNext={() => setStep(2)}
          />
        )}

        {/* BƯỚC 2: NHẬP THỦ CÔNG (FORM CHI TIẾT) */}
        {step === 2 && (
          <ManualInputStep
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            selectedTemplate={selectedTemplate}
          />
        )}

        {/* BƯỚC 3: XEM TRƯỚC (PREVIEW) */}
        {step === 3 && (
          <PreviewStep
            onEdit={() => setStep(2)}
            onSave={() => {
              alert("Kế hoạch đã được lưu vào hệ thống!");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EventPlanner;
