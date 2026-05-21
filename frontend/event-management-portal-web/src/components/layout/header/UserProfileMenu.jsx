import React from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

const UserProfileMenu = ({
  isOpen,
  setIsOpen,
  user,
  getPrimaryRole,
  isSuperAdmin,
  isAdminOnly,
  hasRole,
  isEventStaff,
  isStudentOrganizer,
  setIsLogoutModalOpen,
  t,
  menuRef,
  navigate,
}) => {
  const location = useLocation();

  const menuItems = [
    {
      label: "Hồ sơ cá nhân",
      icon: User,
      path: "/profile",
    },
    {
      label: "Sự kiện của tôi",
      icon: Calendar,
      // isStudentOrganizer -> /student/events, otherwise -> /guest-events
      path: isStudentOrganizer?.() ? "/student/events" : "/guest-events",
      show:
        !isSuperAdmin() &&
        !isAdminOnly() &&
        !hasRole("LECTURER"),
    },

    {
      label: "Bảng điều khiển Admin",
      icon: ShieldCheck,
      path: "/admin/dashboard",
      show: isSuperAdmin() || isAdminOnly(),
    },
    {
      label: "Vào trang BTC",
      icon: LayoutDashboard,
      path: "/student/events",
      // Hiện cho STUDENT sở hữu organization (Organization-Based Authorization)
      show: isStudentOrganizer?.(),
    },
    {
      label: "Bảng điều khiển BTC",
      icon: LayoutDashboard,
      path: "/lecturer/dashboard",
      show:
        (hasRole("LECTURER") || isEventStaff()) &&
        !isAdminOnly() &&
        !isSuperAdmin(),
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3
          pl-1 pr-3 py-1
          rounded-xl
          transition-all duration-200
          ${isOpen
            ? "bg-slate-100"
            : "hover:bg-slate-50"
          }
        `}
      >
        {/* Avatar */}
        <div className="relative">
          <div
            className="
              w-10 h-10
              rounded-xl
              overflow-hidden
              bg-[#1E40AF]
              flex items-center justify-center
              text-white
              font-semibold
              shadow-sm
            "
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {user.fullName?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>

          <span
            className="
              absolute
              bottom-0 right-0
              w-3 h-3
              rounded-full
              bg-emerald-500
              border-2 border-white
            "
          />
        </div>

        {/* Info */}
        <div className="hidden lg:block text-left">
          <p className="text-[13px] font-medium text-slate-900 leading-tight">
            {user.fullName || user.username}
          </p>

          <p className="text-[11px] text-[#1E40AF] mt-0.5">
            {getPrimaryRole()}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`
            text-slate-400
            transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.98,
            }}
            transition={{
              duration: 0.18,
            }}
            className="
              absolute right-0 mt-3
              w-72
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-[0_10px_40px_rgba(15,23,42,0.12)]
              overflow-hidden
              z-[100]
            "
          >
            {/* Header */}
            <div className="px-5 py-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div
                  className="
                    w-14 h-14
                    rounded-2xl
                    overflow-hidden
                    bg-[#1E40AF]
                    flex items-center justify-center
                    text-white text-xl font-semibold
                    shrink-0
                  "
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {user.fullName?.[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h4
                    className="
                      text-[15px]
                      font-semibold
                      text-slate-900
                      truncate
                    "
                  >
                    {user.fullName || user.username}
                  </h4>

                  <p className="text-[12px] text-[#1E40AF] mt-1">
                    {getPrimaryRole()}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="p-2">
              {menuItems.map(
                (item, idx) => {
                  const isActive = location.pathname === item.path;
                  return item.show !== false && (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsOpen(false);
                        navigate(item.path);
                      }}
                      className={`
                        w-full
                        flex items-center gap-3
                        px-3 py-3
                        rounded-xl
                        transition-all duration-200
                        group
                        ${isActive ? "bg-blue-50 text-[#1E40AF]" : "text-slate-700 hover:bg-slate-100"}
                      `}
                    >
                      <item.icon
                        size={18}
                        className={`
                          transition-colors
                          ${isActive ? "text-[#1E40AF]" : "text-slate-500 group-hover:text-[#1E40AF]"}
                        `}
                      />

                      <span className={`text-[13px] ${isActive ? "font-bold" : "font-medium"}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {/* Logout */}
            <div className="p-2 pt-0 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="
                  w-full
                  flex items-center gap-3
                  px-3 py-3
                  rounded-xl
                  text-rose-600
                  hover:bg-rose-50
                  transition-all duration-200
                  group
                "
              >
                <LogOut
                  size={18}
                  className="
                    group-hover:-translate-x-0.5
                    transition-transform
                  "
                />

                <span className="text-[13px] font-medium">
                  {"Đăng xuất"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileMenu;
