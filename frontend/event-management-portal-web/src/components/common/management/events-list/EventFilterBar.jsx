import React from "react";
import { Search } from "lucide-react";
import { STATUS_LABELS } from "./StatusConfig";

const EventFilterBar = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  allowedStatuses,
  setPage,
  setActiveTab,
}) => {
  const handleReset = () => {
    setSearch("");
    setStatusFilter("ALL");
    setActiveTab("Tất cả");
    setPage(1);
  };

  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-2xl
        p-4
        mb-6
        shadow-sm
      "
    >
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, địa điểm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="
              w-full
              h-11
              pl-11 pr-4
              rounded-xl
              border border-slate-200
              bg-slate-50
              text-sm text-slate-700
              placeholder:text-slate-400
              outline-none
              transition
              focus:bg-white
              focus:border-[#1E40AF]
            "
          />
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="
            h-11
            min-w-[190px]
            px-4
            rounded-xl
            border border-slate-200
            bg-slate-50
            text-sm text-slate-700
            outline-none
            transition
            focus:bg-white
            focus:border-[#1E40AF]
          "
        >
          <option value="ALL">Tất cả trạng thái</option>

          {allowedStatuses.map((k) => (
            <option key={k} value={k}>
              {STATUS_LABELS[k]}
            </option>
          ))}
        </select>

        {/* Action */}
        <button
          onClick={handleReset}
          className="
            h-11
            px-5
            rounded-xl
            bg-[#1E40AF]
            hover:bg-blue-800
            text-white
            text-sm font-medium
            transition
            shrink-0
          "
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
};

export default EventFilterBar;