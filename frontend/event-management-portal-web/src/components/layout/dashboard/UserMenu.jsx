import React from "react";
import {
  ChevronDown,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const UserMenu = ({
  isOpen,
  setIsOpen,
  menuRef,
  user,
  getPrimaryRole,
  setIsLogoutModalOpen,
  t,
  navigate,
}) => {
  const rolePrefix =
    user?.role?.toLowerCase() === "super_admin" ||
      user?.role?.toLowerCase() === "admin"
      ? "admin"
      : "lecturer";

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-3
          px-2 py-2 pr-3
          rounded-xl
          border border-slate-200
          bg-white
          hover:bg-slate-50
          transition-all duration-200
        "
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-semibold uppercase text-sm">
                {user?.fullName?.[0] ||
                  user?.username?.[0] ||
                  "U"}
              </div>
            )}
          </div>

          {/* Online Dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>

        {/* User Info */}
        <div className="hidden lg:block text-left min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
            {user?.fullName || user?.username}
          </p>

          <div className="flex items-center gap-1 mt-0.5">
            <ShieldCheck
              size={12}
              className="text-indigo-500"
            />

            <p className="text-[11px] font-medium text-indigo-600 truncate">
              {getPrimaryRole()}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <ChevronDown
          size={16}
          className={`
            transition-transform duration-200
            ${isOpen
              ? "rotate-180 text-slate-700"
              : "text-slate-400"
            }
          `}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="
              absolute right-0 mt-2
              w-72
              bg-white
              rounded-2xl
              border border-slate-200
              shadow-lg
              overflow-hidden
              z-50
            "
          >
            {/* Top User Info */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-semibold uppercase text-lg">
                      {user?.fullName?.[0] ||
                        user?.username?.[0] ||
                        "U"}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user?.fullName || user?.username}
                  </p>

                  <div className="flex items-center gap-1 mt-1">
                    <ShieldCheck
                      size={12}
                      className="text-indigo-500"
                    />

                    <span className="text-[11px] font-medium text-indigo-600">
                      {getPrimaryRole()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-slate-400">
                    <Mail size={11} />
                    <p className="text-[11px] truncate">
                      {user?.email || t("no_email")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="p-2 space-y-1">
              {/* Profile */}
              <button
                onClick={() => {
                  navigate(`/${rolePrefix}/profile`);
                  setIsOpen(false);
                }}
                className="
                  w-full flex items-center gap-3
                  px-3 py-2.5 rounded-xl
                  hover:bg-slate-50
                  transition-colors
                "
              >
                <div className="
                  w-9 h-9 rounded-lg
                  bg-slate-100
                  flex items-center justify-center
                  text-slate-500
                ">
                  <UserIcon size={17} />
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700">
                    {t("profile")}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    {t("personal_account")}
                  </p>
                </div>
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="
                  w-full flex items-center gap-3
                  px-3 py-2.5 rounded-xl
                  hover:bg-rose-50
                  transition-colors
                "
              >
                <div className="
                  w-9 h-9 rounded-lg
                  bg-rose-50
                  flex items-center justify-center
                  text-rose-500
                ">
                  <LogOut size={17} />
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-rose-600">
                    {t("logout")}
                  </p>

                  <p className="text-[11px] text-rose-300">
                    {t("logout_desc")}
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
