import React from "react";
import {
  Search,
  Zap,
  Bell,
  Calendar,
  ChevronRight,
} from "lucide-react";

const EventsSidebar = ({
  onSearchChange,
  searchKeyword,
  t,
  user,
  navigate,
}) => {
  const handleNotificationsClick = () => {
    const role =
      user?.role?.toLowerCase() || "student";

    navigate(
      user
        ? `/${role}/notifications`
        : "/notifications"
    );
  };

  const handleMyEventsClick = () => {
    const role =
      user?.role?.toLowerCase() || "student";

    navigate(
      user
        ? `/${role}/events`
        : "/guest-events"
    );
  };

  const quickActions = [
    {
      label: t("new_notifications"),
      icon: Bell,
      onClick: handleNotificationsClick,
    },
    {
      label: t("my_events_label"),
      icon: Calendar,
      onClick: handleMyEventsClick,
    },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-5">
      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center">
            <Search size={16} />
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            {t("search_by_name")}
          </h3>
        </div>

        <div className="relative">
          <Search
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            placeholder={t(
              "enter_event_name"
            )}
            value={searchKeyword}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
            className="
              w-full
              h-11
              pl-10
              pr-4
              rounded-xl
              border border-slate-200
              bg-slate-50
              text-sm
              focus:outline-none
              focus:border-[#1E40AF]
              focus:bg-white
              transition-all
            "
          />
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div
          className="
            flex items-center gap-2
            px-5 py-4
            border-b border-slate-100
          "
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
            <Zap size={16} />
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            {t("quick_access")}
          </h3>
        </div>

        <div className="p-2">
          {quickActions.map(
            (
              {
                label,
                icon: Icon,
                onClick,
              },
              index
            ) => (
              <button
                key={index}
                onClick={onClick}
                className="
                  w-full
                  flex items-center
                  justify-between
                  gap-3
                  px-3 py-3
                  rounded-xl
                  hover:bg-slate-50
                  transition-all
                  group
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-blue-50
                      text-[#1E40AF]
                      flex items-center justify-center
                      group-hover:bg-white
                      group-hover:shadow-sm
                      transition-all
                    "
                  >
                    <Icon size={18} />
                  </div>

                  <span
                    className="
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    {label}
                  </span>
                </div>

                <ChevronRight
                  size={16}
                  className="
                    text-slate-300
                    group-hover:text-[#1E40AF]
                    group-hover:translate-x-0.5
                    transition-all
                  "
                />
              </button>
            )
          )}
        </div>
      </div>
    </aside>
  );
};

export default EventsSidebar;
