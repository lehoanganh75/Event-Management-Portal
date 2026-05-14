import React from "react";
import { Bell, Clock, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NotificationBell = ({
  isOpen,
  setIsOpen,
  notificationRef,
  unreadCount,
  notifications,
  markAsRead,
  markAllAsRead,
  formatTime,
  getNotificationIcon,
  handleViewAll,
  t,
  navigate,
}) => {
  return (
    <div className="relative" ref={notificationRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-center
          w-11 h-11 rounded-2xl transition-all duration-300
          ${isOpen
            ? "bg-indigo-50 text-indigo-600 shadow-inner"
            : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }
        `}
      >
        <Bell size={20} strokeWidth={2.3} />

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="
              absolute -top-1 -right-1
              min-w-[20px] h-[20px]
              px-1 rounded-full
              bg-red-500 text-white
              text-[10px] font-black
              flex items-center justify-center
              border-2 border-white
              shadow-md
            "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="
              absolute right-0 mt-3
              w-[380px] max-w-[calc(100vw-24px)]
              bg-white rounded-3xl
              border border-slate-100
              shadow-[0_20px_60px_rgba(15,23,42,0.15)]
              overflow-hidden z-50
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
                  {t("notifications")}
                </h3>

                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  {unreadCount > 0
                    ? `${unreadCount} ${t("unread_notifications")}`
                    : t("all_caught_up")}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="
                    flex items-center gap-1.5
                    text-[10px] font-black
                    text-indigo-600
                    hover:text-indigo-800
                    transition-colors
                    uppercase tracking-wider
                  "
                >
                  <CheckCheck size={14} />
                  {t("mark_all_read")}
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((n, index) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);

                      if (n.actionUrl) {
                        setIsOpen(false);
                        navigate(n.actionUrl);
                      }
                    }}
                    className={`
                      relative px-5 py-4
                      border-b border-slate-50
                      cursor-pointer transition-all
                      ${!n.read
                        ? "bg-indigo-50/40 hover:bg-indigo-50"
                        : "hover:bg-slate-50"
                      }
                    `}
                  >
                    {!n.read && (
                      <div className="absolute top-5 left-2 w-2 h-2 bg-indigo-500 rounded-full" />
                    )}

                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="shrink-0 mt-1">
                        {getNotificationIcon(n.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`
                            text-sm leading-relaxed
                            ${!n.read
                              ? "font-bold text-slate-900"
                              : "text-slate-700 font-semibold"
                            }
                          `}
                        >
                          {n.title}
                        </p>

                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-1 mt-3 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                          <Clock size={11} />
                          {formatTime(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 px-6 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Bell size={30} />
                  </div>

                  <h4 className="text-sm font-bold text-slate-700 mb-1">
                    {t("no_notifications")}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("notifications_empty_desc")}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <button
                onClick={handleViewAll}
                className="
                  w-full py-4
                  text-[11px] font-black
                  uppercase tracking-[0.18em]
                  text-slate-500
                  hover:text-indigo-600
                  hover:bg-indigo-50
                  transition-all
                  border-t border-slate-100
                  bg-white
                "
              >
                {t("view_all_notifications")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;