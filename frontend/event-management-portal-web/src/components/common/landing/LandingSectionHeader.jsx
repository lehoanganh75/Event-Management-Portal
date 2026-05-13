import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LandingSectionHeader = ({
  title,
  viewAllLink,
  t,
  subtitle,
}) => (
  <div
    className="
      flex flex-col
      sm:flex-row sm:items-end
      justify-between
      gap-5
      mb-10
    "
  >
    {/* Left */}
    <div>
      {/* Small label */}
      <div
        className="
          inline-flex items-center
          px-3 py-1
          rounded-full
          bg-blue-50
          text-[#1E40AF]
          text-[11px]
          font-medium
          mb-3
        "
      >
        Explore
      </div>

      {/* Title */}
      <h2
        className="
          text-[30px]
          md:text-[38px]
          font-semibold
          tracking-tight
          text-slate-900
          leading-tight
        "
      >
        {title}
      </h2>

      {/* Subtitle */}
      <p
        className="
          mt-3
          text-[14px]
          text-slate-500
          leading-relaxed
          max-w-2xl
        "
      >
        {subtitle || t("featured_events_subtitle")}
      </p>
    </div>

    {/* Right */}
    <Link
      to={viewAllLink}
      className="
        inline-flex items-center gap-2
        text-[#1E40AF]
        text-[14px]
        font-medium
        hover:gap-3
        transition-all duration-200
        shrink-0
      "
    >
      {t("view_all")}

      <ArrowRight size={16} />
    </Link>
  </div>
);

export default LandingSectionHeader;