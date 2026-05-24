import React from "react";
import { Search } from "lucide-react";

const GuestEventsFilter = ({ search, setSearch, activeFilter, setActiveFilter, t }) => {
  const filterButtons = [
    { key: "ALL", label: "Tất cả" || "Tất cả" },
    { key: "ONGOING", label: t("ONGOING") || "Đang diễn ra" },
    { key: "PUBLISHED", label: t("PUBLISHED") || "Sắp diễn ra" },
    { key: "COMPLETED", label: t("COMPLETED") || "Đã kết thúc" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-3 mb-8 flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={"Tìm sự kiện..." || "Tìm kiếm sự kiện..."}
          className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar flex-nowrap shrink-0">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setActiveFilter(btn.key)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-all ${
              activeFilter === btn.key
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GuestEventsFilter;
