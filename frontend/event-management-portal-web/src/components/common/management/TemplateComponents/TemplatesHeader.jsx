import React from "react";
import { Layers, Globe, Lock, UserCog, Search, Plus } from "lucide-react";

const TemplatesHeader = ({
  templates,
  openModal,
  activeTab,
  setActiveTab,
  setCurrentPage,
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  EVENT_TYPE_OPTIONS,
  currentUserId
}) => {
  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mẫu Kế Hoạch</h1>
            <p className="text-sm text-slate-500">Quản lý cấu hình các sự kiện mẫu</p>
          </div>
        </div>
        <button
          onClick={() => openModal(null, "create")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95"
        >
          <Plus size={18} />
          Tạo mẫu mới
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto pb-px gap-2">
        {[
          { id: "Tất cả", label: "Tất cả", icon: Layers, count: templates.length },
          { id: "Công khai", label: "Công khai", icon: Globe, count: templates.filter(t => t.public).length },
          { id: "Nội bộ", label: "Nội bộ", icon: Lock, count: templates.filter(t => !t.public).length },
          { id: "Của bản thân", label: "Của bản thân", icon: UserCog, count: templates.filter(t => t.createdByAccountId === currentUserId).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Tìm kiếm mẫu kế hoạch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 bg-gray-50 px-4 py-2 rounded-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[180px] cursor-pointer"
        >
          <option value="all">Tất cả loại sự kiện</option>
          {Object.entries(EVENT_TYPE_OPTIONS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>
    </>
  );
};

export default TemplatesHeader;
