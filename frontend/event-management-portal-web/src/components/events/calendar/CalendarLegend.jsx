import React from "react";

const CalendarLegend = ({ categoryColors }) => {
  return (
    <div className="flex flex-wrap gap-5 mb-6">
      {Object.entries(categoryColors).map(([name, colorClass]) => (
        <div key={name} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${colorClass}`} />
          <span className="text-sm text-slate-600 font-medium">{name}</span>
        </div>
      ))}
    </div>
  );
};

export default CalendarLegend;
