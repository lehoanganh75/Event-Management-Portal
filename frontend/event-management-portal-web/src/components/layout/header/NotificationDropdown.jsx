import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Clock, ArrowRight, Loader2 } from "lucide-react";

const NotificationDropdown = ({
  isOpen,
  notifications,
  unreadCount,
  isMarkingAll,
  handleMarkAsRead,
  handleMarkAllAsRead,
  handleViewAllNotifications,
  getNotificationIcon,
  formatTime,
  t,
  navigate,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="
            absolute right-0 mt-3
            w-[380px]
            bg-white
            border border-slate-200
            rounded-2xl
            shadow-[0_10px_40px_rgba(15,23,42,0.12)]
            overflow-hidden
            z-[100]
          "
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[16px] font-semibold text-slate-900">
                {t("notifications")}
              </h3>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="
                    flex items-center gap-1.5
                    px-3 py-1.5
                    rounded-lg
                    bg-blue-50
                    text-[#1E40AF]
                    text-[11px]
                    font-medium
                    hover:bg-blue-100
                    transition
                    disabled:opacity-50
                  "
                >
                  {isMarkingAll ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  {t("mark_all_read")}
                </button>
              )}
            </div>

            <p className="text-[12px] text-slate-500">
              {unreadCount > 0
                ? `${t("you_have")} ${unreadCount} ${t("new_notifications_suffix")}`
                : t("no_unread_notifications")}
            </p>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto py-2 divide-y divide-slate-50 scrollbar-thin">
            {notifications.length > 0 ? (
              notifications.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    if (!notification.read) handleMarkAsRead(notification.id);
                    if (notification.actionUrl) {
                      handleViewAllNotifications();
                      navigate(notification.actionUrl);
                    }
                  }}
                  className={`
                    px-5 py-4
                    cursor-pointer
                    flex gap-4
                    transition-all
                    hover:bg-slate-50
                    relative
                    ${!notification.read ? "bg-blue-50/20" : ""}
                  `}
                >
                  <div
                    className={`
                    w-11 h-11
                    shrink-0
                    rounded-xl
                    flex items-center justify-center
                    transition-transform
                    ${!notification.read ? "bg-white shadow-sm" : "bg-slate-50"}
                  `}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`
                      text-[13.5px]
                      leading-snug
                      mb-1
                      line-clamp-1
                      ${!notification.read
                          ? "font-semibold text-slate-900"
                          : "font-medium text-slate-600"
                        }
                    `}
                    >
                      {notification.title}
                    </h4>

                    <p className="text-[12.5px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                      <Clock size={12} />
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>

                  {!notification.read && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#1E40AF] rounded-full" />
                  )}
                </motion.div>
              ))
            ) : (
              <div className="py-16 flex flex-col items-center text-center px-10">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Bell size={28} className="text-slate-300" />
                </div>
                <p className="text-[13px] font-medium text-slate-400">
                  {t("no_notifications")}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleViewAllNotifications}
                className="
                  w-full h-11
                  bg-white
                  hover:bg-blue-600
                  text-[#1E40AF]
                  hover:text-white
                  rounded-xl
                  text-[12px]
                  font-semibold
                  transition-all
                  shadow-sm
                  border border-slate-200
                  flex items-center justify-center gap-2
                "
              >
                {t("view_all_notifications")}
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
