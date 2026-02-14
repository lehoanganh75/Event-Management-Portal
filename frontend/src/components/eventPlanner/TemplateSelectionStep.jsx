import React, { useState } from "react";
import { 
  ClipboardList, Laptop, Target, Trophy, Settings, 
  Check, Users, ChevronRight, Hash
} from "lucide-react";

const categoryConfig = {
  WORKSHOP: { 
    label: "Workshop", 
    icon: <Laptop size={16}/>, 
    color: "text-blue-600", 
    bgColor: "bg-blue-50" 
  },
  SEMINAR: { 
    label: "Seminar", 
    icon: <Target size={16}/>, 
    color: "text-green-600", 
    bgColor: "bg-green-50" 
  },
  CONFERENCE: { 
    label: "Conference", 
    icon: <Trophy size={16}/>, 
    color: "text-purple-600", 
    bgColor: "bg-purple-50" 
  },
  CUSTOM: { 
    label: "Tùy chỉnh", 
    icon: <Settings size={16}/>, 
    color: "text-slate-600", 
    bgColor: "bg-slate-50" 
  },
};

export const TemplateSelectionStep = ({ onTemplateSelect, onNext }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const templates = [
    { 
      id: 1, 
      name: "Workshop React Basic", 
      category: "WORKSHOP", 
      usageCount: 120, 
      fields: 8 
    },
    { 
      id: 2, 
      name: "Seminar AI & Future", 
      category: "SEMINAR", 
      usageCount: 85, 
      fields: 6 
    },
    { 
      id: 3, 
      name: "Global Tech Conference", 
      category: "CONFERENCE", 
      usageCount: 45, 
      fields: 12 
    },
    { 
      id: 4, 
      name: "Bản mẫu trống", 
      category: "CUSTOM", 
      usageCount: 200, 
      fields: 0 
    },
  ];

  const handleSelect = (template) => {
    setSelectedTemplateId(template.id);
    onTemplateSelect(template);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <ClipboardList size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Chọn cấu trúc kế hoạch
          </h2>
          <p className="text-slate-500 text-sm">
            Chọn một bản mẫu để bắt đầu nhanh
          </p>
        </div>
      </div>

      {/* Template List */}
      <div className="space-y-3">
        {templates.map((t) => {
          const config = categoryConfig[t.category];
          const isSelected = selectedTemplateId === t.id;

          return (
            <label
              key={t.id}
              className={`
                flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-slate-200 hover:border-slate-300 bg-white"}
              `}
            >
              {/* Radio Input */}
              <input
                type="radio"
                name="template-selection"
                className="hidden"
                checked={isSelected}
                onChange={() => handleSelect(t)}
              />

              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                  {config.icon}
                </div>

                {/* Info */}
                <div>
                  <div className="font-semibold text-slate-800 text-sm">
                    {t.name}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Hash size={12} /> {t.fields} hạng mục
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users size={12} /> {t.usageCount} lượt dùng
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkmark */}
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${isSelected ? "bg-blue-500 border-blue-500" : "border-slate-300"}
              `}>
                {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </label>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          * Bạn có thể thêm/bớt hạng mục ở bước sau
        </p>
        <button
          disabled={!selectedTemplateId}
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          Tiếp theo
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};