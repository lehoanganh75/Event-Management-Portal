import React from "react";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const EventCard = ({
  item,
  onClick,
  t,
  language,
}) => {
  const percent = item.maxParticipants
    ? Math.min(
      100,
      (item.registeredCount /
        item.maxParticipants) *
      100
    )
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(item.id)}
      className="
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
        h-full
      "
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={
            item.coverImage ||
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"
          }
          alt={item.title}
          className="
            w-full h-full
            object-cover
            group-hover:scale-105
            transition-transform duration-500
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className="
              px-2.5 py-1
              rounded-full
              bg-white/90
              text-slate-700
              text-[10px]
              font-medium
              backdrop-blur-sm
            "
          >
            {item.type || "SEMINAR"}
          </span>

          <span
            className={`
              px-2.5 py-1
              rounded-full
              text-[10px]
              font-medium
              text-white
              backdrop-blur-sm
              ${item.status === "ONGOING"
                ? "bg-emerald-500/90"
                : "bg-[#1E40AF]/90"
              }
            `}
          >
            {item.status === "ONGOING"
              ? t("ongoing")
              : item.status === "UPCOMING"
                ? t("upcoming")
                : item.status}
          </span>
        </div>

        {/* Title */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3
            className="
              text-white
              text-[17px]
              font-semibold
              leading-snug
              line-clamp-2
            "
          >
            {item.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Date */}
        <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-3">
          <Calendar
            size={14}
            className="text-[#1E40AF]"
          />

          <span>
            {new Intl.DateTimeFormat(
              language === "VI"
                ? "vi-VN"
                : "en-US",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            ).format(
              new Date(item.startTime)
            )}
          </span>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-between gap-3 text-[12px] text-slate-600 mb-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin
              size={13}
              className="text-slate-400 shrink-0"
            />

            <span className="truncate">
              {item.location ||
                "IUH Campus"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Users
              size={13}
              className="text-slate-400"
            />

            <span>
              {item.registeredCount || 0}
              {item.maxParticipants &&
                `/${item.maxParticipants}`}
            </span>
          </div>
        </div>

        {/* Progress */}
        {item.maxParticipants && (
          <div className="mb-4">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
              <span>
                {t("participants")}
              </span>

              <span className="text-[#1E40AF] font-medium">
                {percent.toFixed(0)}%
              </span>
            </div>

            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${percent}%`,
                }}
                transition={{
                  duration: 0.6,
                }}
                className="
                  h-full
                  bg-[#1E40AF]
                  rounded-full
                "
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
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

export default EventCard;
