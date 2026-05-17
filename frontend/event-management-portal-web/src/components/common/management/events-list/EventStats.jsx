import React from "react";
import {
  FileText,
  Edit2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  PlayCircle,
  Users,
} from "lucide-react";

const EventStats = ({ mode, stats }) => {
  const items =
    mode === "plan"
      ? [
        {
          label: "Tổng kế hoạch",
          value: stats.total,
          icon: FileText,
          color: "bg-blue-50 text-[#1E40AF]",
        },
        {
          label: "Bản nháp",
          value: stats.drafts,
          icon: Edit2,
          color: "bg-slate-100 text-slate-600",
        },
        {
          label: "Chờ duyệt",
          value: stats.pending,
          icon: AlertCircle,
          color: "bg-amber-50 text-amber-600",
        },
        {
          label: "Đã duyệt",
          value: stats.approved,
          icon: CheckCircle2,
          color: "bg-emerald-50 text-emerald-600",
        },
        {
          label: "Từ chối",
          value: stats.rejected,
          icon: XCircle,
          color: "bg-rose-50 text-rose-600",
        },
      ]
      : [
        {
          label: "Tổng sự kiện",
          value: stats.total,
          icon: Calendar,
          color: "bg-blue-50 text-[#1E40AF]",
        },
        {
          label: "Sắp diễn ra",
          value: stats.upcoming,
          icon: Clock,
          color: "bg-sky-50 text-sky-600",
        },
        {
          label: "Đang diễn ra",
          value: stats.ongoing,
          icon: PlayCircle,
          color: "bg-emerald-50 text-emerald-600",
        },
        {
          label: "Đã hoàn thành",
          value: stats.completed,
          icon: CheckCircle2,
          color: "bg-slate-100 text-slate-700",
        },
        {
          label: "Tổng đăng ký",
          value: stats.totalRegistered,
          icon: Users,
          color: "bg-indigo-50 text-indigo-600",
        },
      ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div
          className={`
            w-12 h-12
            rounded-xl
            flex items-center justify-center
            shrink-0
            ${color}
          `}
        >
          <Icon size={24} />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-slate-500 truncate">
            {label}
          </p>

          <p className="text-2xl font-semibold text-slate-800 mt-1">
            {value || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventStats;