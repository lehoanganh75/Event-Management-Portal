import React from "react";
import {
  Loader2,
  Calendar,
  Share2,
  ClipboardList,
  FileText,
} from "lucide-react";

const StatCard = ({
  title,
  count,
  icon: Icon,
  color,
}) => {
  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-2xl
        p-5
        hover:shadow-md
        transition-all duration-200
      "
    >
      <div className="flex items-start justify-between">
        {/* Text */}
        <div>
          <p className="text-sm text-slate-500 mb-2">
            {title}
          </p>

          <h3 className="text-3xl font-semibold text-slate-800">
            {count || 0}
          </h3>
        </div>

        {/* Icon */}
        <div
          className={`
            w-12 h-12
            rounded-xl
            flex items-center justify-center
            ${color}
          `}
        >
          <Icon size={22} />
        </div>
      </div>

      {/* Bottom line */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Cập nhật mới nhất
        </span>
      </div>
    </div>
  );
};

const DashboardStats = ({
  loading,
  stats,
}) => {
  if (loading) {
    return (
      <div
        className="
          flex items-center justify-center
          h-32
          bg-white
          rounded-2xl
          border border-slate-200
        "
      >
        <Loader2
          className="animate-spin text-[#1E40AF]"
          size={30}
        />
      </div>
    );
  }

  const items = [
    {
      title: "Sự kiện",
      count: stats.events,
      icon: Calendar,
      color:
        "bg-blue-50 text-[#1E40AF]",
    },
    {
      title: "Bài post",
      count: stats.posts,
      icon: Share2,
      color:
        "bg-pink-50 text-pink-600",
    },
    {
      title: "Kế hoạch",
      count: stats.plans,
      icon: ClipboardList,
      color:
        "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Recap",
      count: stats.recaps,
      icon: FileText,
      color:
        "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {items.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          count={item.count}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
