import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

export const TemplateSelectionStep = ({ onTemplateSelect, onNext }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const templates = [
    { id: 1, name: "Workshop React Basic" },
    { id: 2, name: "Seminar AI & Future" },
    { id: 3, name: "Global Tech Conference" },
    { id: 4, name: "Bản mẫu trống (Tùy chỉnh)" },
  ];

  const handleSelect = (template) => {
    setSelectedTemplateId(template.id);
    onTemplateSelect(template);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header đơn giản */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Chọn mẫu kế hoạch</h2>
        <p className="text-slate-500 text-sm">Vui lòng chọn một mẫu để tiếp tục</p>
      </div>

      {/* Danh sách rút gọn */}
      <div className="space-y-2">
        {templates.map((t) => {
          const isSelected = selectedTemplateId === t.id;
          return (
            <label
              key={t.id}
              className={`
                flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all
                ${isSelected 
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                  : "border-slate-200 hover:bg-slate-50"}
              `}
            >
              <input
                type="radio"
                name="template"
                checked={isSelected}
                onChange={() => handleSelect(t)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className={`font-medium ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                {t.name}
              </span>
            </label>
          );
        })}
      </div>

      {/* Nút hành động */}
      <button
        disabled={!selectedTemplateId}
        onClick={onNext}
        className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
      >
        Tiếp theo
        <ChevronRight size={18} />
      </button>
    </div>
  );
};