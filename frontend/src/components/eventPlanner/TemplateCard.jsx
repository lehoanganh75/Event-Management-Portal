import React from "react";
import { Check, Eye, Users } from "lucide-react";

export const TemplateCard = ({ template, isSelected, onSelect, onPreview, getIcon, categoryColor }) => (
  <div
    onClick={() => onSelect(template)}
    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] relative border ${
      isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100 shadow-md" : "border-gray-200 bg-white shadow-sm"
    }`}
  >
    {isSelected && (
      <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 z-10">
        <Check size={14} className="text-white" />
      </div>
    )}

    <div className="flex items-center gap-2 mb-2">
      {getIcon(template.icon, 18)}
      <span className="font-bold text-sm truncate">{template.name}</span>
    </div>

    <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">{template.description}</p>

    <div className="flex items-center justify-between mt-auto">
      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
        <Users size={12} /> {template.usageCount}
      </div>
      <span className={`px-2 py-0.5 rounded-full text-[10px] text-white font-bold ${categoryColor}`}>
        {template.category}
      </span>
    </div>

    <button
      onClick={(e) => { e.stopPropagation(); onPreview(template, e); }}
      className="w-full mt-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold"
    >
      <Eye size={14} /> XEM NHANH
    </button>
  </div>
);