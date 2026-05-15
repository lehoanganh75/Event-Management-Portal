import React from "react";

const StatCard = ({
  title,
  count,
  color,
  icon: Icon,
}) => (
  <div
    className={`
      relative overflow-hidden
      rounded-2xl border border-slate-200
      bg-gradient-to-br ${color}
      p-5 h-32
      transition-all duration-200
      hover:-translate-y-1 hover:shadow-lg
    `}
  >
    {/* Background blur */}
    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />

    <div className="relative h-full flex items-center justify-between">
      {/* Left */}
      <div>
        <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">
          {title}
        </p>

        <h3 className="text-white text-4xl font-bold mt-2">
          {count}
        </h3>
      </div>

      {/* Right Icon */}
      <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
        <Icon
          size={28}
          className="text-white"
          strokeWidth={2}
        />
      </div>
    </div>
  </div>
);

export default StatCard;
