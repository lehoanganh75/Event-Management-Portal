import React from "react";

export const CategorySelector = ({ selectedCategory, onCategoryChange, categoryConfig }) => {
  const selected = selectedCategory ? categoryConfig[selectedCategory] : null;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-900 mb-2">Loại sự kiện</label>
      <select
        value={selectedCategory || ""}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>-- Chọn loại sự kiện --</option>
        {Object.values(categoryConfig).map((cat) => (
          <option key={cat.key} value={cat.key}>{cat.label}</option>
        ))}
      </select>

      {selected && (
        <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50 animate-fadeIn">
          <p className="text-sm font-bold text-gray-900">{selected.label}</p>
          <p className="text-sm text-gray-600">{selected.description}</p>
          <p className="text-xs text-gray-400 mt-1 italic">
            Hệ thống sẽ tự tạo sẵn {selected.defaultFields} trường thông tin.
          </p>
        </div>
      )}
    </div>
  );
};