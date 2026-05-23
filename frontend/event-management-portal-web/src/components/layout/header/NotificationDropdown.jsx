import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Clock, ArrowRight, Loader2, X } from "lucide-react";

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
  onClose,
}) => {
  const closeDropdown = () => {
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDropdown}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[998] sm:hidden"
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="
              fixed sm:absolute
              left-4 right-4 sm:left-auto sm:right-0
              top-[92px] sm:top-auto sm:mt-3
              w-auto sm:w-[380px]
              max-h-[calc(100vh-120px)] sm:max-h-none
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-[0_20px_60px_rgba(15,23,42,0.22)]
              overflow-hidden
              z-[999]
            "
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[16px] font-semibold text-slate-900">
                    Thông báo
                  </h3>

                  <p className="text-[12px] text-slate-500 mt-1">
                    {unreadCount > 0
                      ? `Bạn có ${unreadCount} thông báo mới`
                      : "Không có thông báo mới"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={isMarkingAll}
                      className="
                        hidden xs:flex sm:flex
                        items-center justify-center gap-1.5
                        px-3 py-1.5
                        rounded-lg
                        bg-blue-50
                        text-[#1E40AF]
                        text-[11px]
                        font-medium
                        hover:bg-blue-100
                        transition
                        disabled:opacity-50
                        whitespace-nowrap
                      "
                    >
                      {isMarkingAll ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      Đã đọc
                    </button>
                  )}

                  <button
                    onClick={closeDropdown}
                    className="
                      sm:hidden
                      w-8 h-8
                      rounded-lg
                      flex items-center justify-center
                      text-slate-400
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="
                    flex sm:hidden
                    mt-3
                    items-center justify-center gap-1.5
                    px-3 py-2
                    rounded-lg
                    bg-blue-50
                    text-[#1E40AF]
                    text-[11px]
                    font-medium
                    disabled:opacity-50
                  "
                >
                  {isMarkingAll ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[55vh] sm:max-h-[420px] overflow-y-auto py-2 divide-y divide-slate-50">
              {notifications.length > 0 ? (
                notifications.map((notification, idx) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => {
                      if (!notification.read) handleMarkAsRead(notification.id);

                      if (notification.actionUrl) {
                        closeDropdown();
                        handleViewAllNotifications();
                        navigate(notification.actionUrl);
                      }
                    }}
                    className={`
                      px-4 sm:px-5 py-4
                      cursor-pointer
                      flex gap-3 sm:gap-4
                      transition-all
                      hover:bg-slate-50
                      relative
                      ${!notification.read ? "bg-blue-50/30" : ""}
                    `}
                  >
                    <div
                      className={`
                        w-10 h-10 sm:w-11 sm:h-11
                        shrink-0
                        rounded-xl
                        flex items-center justify-center
                        ${!notification.read ? "bg-white shadow-sm" : "bg-slate-50"}
                      `}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <h4
                        className={`
                          text-[13px] sm:text-[13.5px]
                          leading-snug
                          mb-1
                          line-clamp-1
                          ${
                            !notification.read
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-600"
                          }
                        `}
                      >
                        {notification.title}
                      </h4>

                      <p className="text-[12px] sm:text-[12.5px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
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
                <div className="min-h-[230px] sm:min-h-[260px] flex flex-col items-center justify-center text-center px-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                    <Bell size={28} className="text-slate-300" />
                  </div>

                  <p className="text-[13px] font-semibold text-slate-400">
                    Không có thông báo mới
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => {
                    closeDropdown();
                    handleViewAllNotifications();
                  }}
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
                  Xem tất cả thông báo
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;