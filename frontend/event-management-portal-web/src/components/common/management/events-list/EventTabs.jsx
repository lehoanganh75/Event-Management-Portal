import React from "react";
import {
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Send,
  PlayCircle,
  XCircle,
} from "lucide-react";

const EventTabs = ({
  activeTab,
  setActiveTab,
  setPage,
  events,
  mode,
}) => {
  const tabs = [
    {
      id: "Tất cả",
      label: "Tất cả",
      icon: Calendar,
      count: events.length,
    },
    ...(mode === "all" || mode === "plan"
      ? [
        {
          id: "Kế hoạch",
          label: "Bản nháp & Từ chối",
          icon: FileText,
          count: events.filter((e) =>
            ["DRAFT", "REJECTED"].includes(e.status)
          ).length,
        },
        {
          id: "Chờ duyệt",
          label: "Chờ duyệt",
          icon: AlertCircle,
          count: events.filter((e) =>
            ["PLAN_PENDING_APPROVAL"].includes(e.status)
          ).length,
        },
        {
          id: "Đã duyệt",
          label: "Đã duyệt",
          icon: CheckCircle2,
          count: events.filter((e) =>
            ["PLAN_APPROVED"].includes(e.status)
          ).length,
        },
        {
          id: "Đã chuyển đổi",
          label: "Đã chuyển đổi",
          icon: CheckCircle2,
          count: events.filter((e) =>
            ["CONVERTED"].includes(e.status)
          ).length,
        },
      ]
      : []),
    ...(mode === "all" || mode === "event"
      ? [
        {
          id: "Chờ duyệt sự kiện",
          label: "Chờ duyệt",
          icon: AlertCircle,
          count: events.filter((e) =>
            ["EVENT_PENDING_APPROVAL"].includes(e.status)
          ).length,
        },
        {
          id: "Công bố",
          label: "Đã công bố",
          icon: Send,
          count: events.filter((e) => e.status === "PUBLISHED")
            .length,
        },
        {
          id: "Đang diễn ra",
          label: "Đang diễn ra",
          icon: PlayCircle,
          count: events.filter((e) => e.status === "ONGOING").length,
        },
        {
          id: "Hoàn thành",
          label: "Hoàn thành",
          icon: CheckCircle2,
          count: events.filter((e) => e.status === "COMPLETED")
            .length,
        },
        {
          id: "Đã hủy",
          label: "Đã hủy",
          icon: XCircle,
          count: events.filter((e) => e.status === "CANCELLED").length,
        },
      ]
      : []),
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2 mb-6 overflow-x-auto no-scrollbar">
      <div className="flex gap-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`
                h-11
                px-4
                rounded-xl
                flex items-center gap-2
                text-sm font-medium
                whitespace-nowrap
                transition
                ${isActive
                  ? "bg-blue-50 text-[#1E40AF]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }
              `}
            >
              <Icon
                size={16}
                className={
                  isActive ? "text-[#1E40AF]" : "text-slate-400"
                }
              />

              <span>{tab.label}</span>

              {tab.count > 0 && (
                <span
                  className={`
                    min-w-[24px]
                    h-6 px-2
                    rounded-full
                    text-[11px] font-semibold
                    flex items-center justify-center
                    ${isActive
                      ? "bg-white text-[#1E40AF]"
                      : "bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EventTabs;