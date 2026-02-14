import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
// Import các component con từ đúng thư mục theo cấu trúc của bạn
import { TemplateSelectionStep } from "../../components/eventPlanner/TemplateSelectionStep";
import { ManualInputStep } from "../../components/eventPlanner/ManualInputStep";
import { PreviewStep } from "../../components/eventPlanner/PreviewStep";

/**
 * Component chính điều hướng toàn bộ quy trình lập kế hoạch
 * Bước 1: Chọn bản mẫu (TemplateSelectionStep)
 * Bước 2: Nhập liệu thủ công (ManualInputStep)
 * Bước 3: Xem trước và xuất file (PreviewStep)
 */
export const EventPlanner = ({ onBack }) => {
  // Quản lý bước hiện tại: 1, 2, hoặc 3
  const [step, setStep] = useState(1);
  
  // Lưu trữ thông tin mẫu đã chọn (để truyền vào các bước sau nếu cần)
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Xử lý khi nhấn nút quay lại ở thanh header chung
  const handleGlobalBack = () => {
    if (step === 1) {
      onBack(); // Thoát hẳn module Event Planner
    } else {
      setStep(step - 1); // Quay lại bước trước đó
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER ĐIỀU HƯỚNG CHUNG 
        Chỉ hiển thị khi không ở bước Preview (vì Preview có header riêng theo thiết kế của bạn)
      */}
      {step < 3 && (
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button 
            onClick={handleGlobalBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          
          <div className="text-center">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
              Bước {step} / 3
            </p>
            <p className="text-sm font-bold text-slate-800">
              {step === 1 ? "Thiết lập bản mẫu" : "Điền thông tin chi tiết"}
            </p>
          </div>
          
          <div className="w-24"></div> {/* Spacer để cân bằng layout */}
        </div>
      )}

      {/* VÙNG HIỂN THỊ NỘI DUNG CHÍNH */}
      <div className={`flex-1 ${step === 3 ? "p-4 md:p-6" : "p-8"}`}>
        
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
              // Logic xử lý API lưu dữ liệu ở đây
            }}
          />
        )}
        
      </div>
    </div>
  );
};

export default EventPlanner;