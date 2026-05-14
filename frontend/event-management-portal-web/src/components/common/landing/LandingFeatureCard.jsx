import React from "react";

const LandingFeatureCard = ({
  icon: Icon,
  title,
  description,
  colorClass,
}) => (
  <div
    className="
      relative
      bg-white
      border border-slate-200
      rounded-2xl
      p-6
      transition-all duration-300
      hover:-translate-y-1
      hover:shadow-xl
      hover:border-blue-100
      group
      overflow-hidden
    "
  >
    {/* Top accent */}
    <div
      className="
        absolute top-0 left-0
        w-full h-[3px]
        bg-[#1E40AF]
        scale-x-0
        group-hover:scale-x-100
        transition-transform duration-300
        origin-left
      "
    />

    {/* Icon */}
    <div
      className={`
        w-14 h-14
        rounded-2xl
        flex items-center justify-center
        mb-5
        transition-all duration-300
        group-hover:scale-105
        ${colorClass}
      `}
    >
      <Icon size={26} />
    </div>

    {/* Title */}
    <h3
      className="
        text-[18px]
        font-semibold
        text-slate-900
        mb-3
        leading-snug
      "
    >
      {title}
    </h3>

    {/* Description */}
    <p
      className="
        text-[14px]
        leading-relaxed
        text-slate-500
      "
    >
      {description}
    </p>
  </div>
);

export default LandingFeatureCard;