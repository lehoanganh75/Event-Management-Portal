import React from "react";
import {
  Newspaper,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";

const PostStats = ({
  stats,
  activeTab,
  setActiveTab,
  setCurrentPage,
}) => {
  const tabs = [
    {
      id: "Tất cả",
      label: "Tất cả",
      icon: Newspaper,
      count: stats.total,
      color: "text-[#1E40AF]",
      bg: "bg-blue-50",
    },
    {
      id: "Đã đăng",
      label: "Đã đăng",
      icon: CheckCircle,
      count: stats.published,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "Chờ duyệt",
      label: "Chờ duyệt",
      icon: Clock,
      count: stats.pending,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      id: "Bản nháp",
      label: "Bản nháp",
      icon: FileText,
      count: stats.draft,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-2xl
        p-2
        mb-6
        flex gap-2
        overflow-x-auto
      "
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`
              flex items-center gap-2
              h-11 px-4
              rounded-xl
              text-sm font-medium
              whitespace-nowrap
              transition-all
              ${isActive
                ? "bg-blue-50 text-[#1E40AF]"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }
            `}
          >
            <Icon
              size={16}
              className={isActive ? "text-[#1E40AF]" : tab.color}
            />

            <span>{tab.label}</span>

            <span
              className={`
                min-w-[24px]
                h-6 px-2
                rounded-full
                text-[11px] font-semibold
                flex items-center justify-center
                ${isActive
                  ? "bg-white text-[#1E40AF]"
                  : `${tab.bg} ${tab.color}`
                }
              `}
            >
              {tab.count || 0}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PostStats;
