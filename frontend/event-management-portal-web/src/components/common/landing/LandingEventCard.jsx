import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";

const formatDate = (dateString, lang = "VI") => {
  if (!dateString) return "";

  return new Intl.DateTimeFormat(
    lang === "VI" ? "vi-VN" : "en-US",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(new Date(dateString));
};

const LandingEventCard = ({
  event,
  onClick,
  t,
  language,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(event.id)}
      className="
        min-w-[270px]
        sm:min-w-[300px]
        md:min-w-[320px]
        bg-white
        rounded-2xl
        overflow-hidden
        border border-slate-200
        hover:border-blue-100
        hover:shadow-lg
        transition-all duration-300
        cursor-pointer
        group
        flex flex-col
        snap-start
      "
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={
            event.coverImage ||
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"
          }
          alt={event.title}
          className="
            w-full h-full
            object-cover
            group-hover:scale-105
            transition-transform duration-500
          "
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

        {/* Status */}
        <div className="absolute top-3 right-3">
          <span
            className={`
              px-3 py-1
              rounded-full
              text-[10px]
              font-medium
              text-white
              backdrop-blur-sm
              ${event.status === "ONGOING"
                ? "bg-emerald-500/90"
                : "bg-[#1E40AF]/90"
              }
            `}
          >
            {event.status === "ONGOING"
              ? t("ongoing")
              : t("upcoming")}
          </span>
        </div>

        {/* Type */}
        <div className="absolute bottom-3 left-3">
          <span
            className="
              px-3 py-1
              rounded-lg
              bg-white/90
              backdrop-blur-sm
              text-slate-700
              text-[10px]
              font-medium
            "
          >
            {event.type || t("event_type")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Date */}
        <div
          className="
            flex items-center gap-2
            text-[12px]
            text-slate-500
            mb-2
          "
        >
          <Calendar
            size={14}
            className="text-[#1E40AF]"
          />

          <span>
            {formatDate(
              event.startTime,
              language
            )}
          </span>
        </div>

        {/* Title */}
        <h3
          className="
            text-[15px]
            font-semibold
            text-slate-800
            leading-snug
            line-clamp-2
            group-hover:text-[#1E40AF]
            transition-colors
            mb-4
            min-h-[44px]
          "
        >
          {event.title}
        </h3>

        {/* Info */}
        <div className="flex items-center justify-between gap-4 text-[12px] text-slate-600 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin
              size={13}
              className="text-slate-400 shrink-0"
            />

            <span className="line-clamp-1 truncate">
              {event.location || "IUH Campus"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Users
              size={13}
              className="text-slate-400 shrink-0"
            />

            <span>
              {event.registeredCount || 0} /{" "}
              {event.maxParticipants || "∞"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            mt-auto
            pt-3
            border-t border-slate-100
            flex items-center justify-between
          "
        >
          <span
            className="
              text-[13px]
              font-medium
              text-slate-500
              group-hover:text-[#1E40AF]
              transition-colors
            "
          >
            {t("details")}
          </span>

          <div
            className="
              w-8 h-8
              rounded-xl
              bg-slate-100
              text-slate-600
              flex items-center justify-center
              group-hover:bg-[#1E40AF]
              group-hover:text-white
              transition-all duration-300
            "
          >
            <ArrowRight
              size={15}
              className="
                group-hover:translate-x-0.5
                transition-transform
              "
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingEventCard;
