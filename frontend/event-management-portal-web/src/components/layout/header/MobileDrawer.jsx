import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Home,
  Calendar,
  Clock,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import logo_iuh from "../../../assets/images/logo_iuh.png";

const MobileDrawer = ({
  isOpen,
  setIsOpen,
  user,
  isAuthenticated,
  getPrimaryRole,
  isSuperAdmin,
  isAdminOnly,
  isEventStaff,
  isLeaderRole,
  setIsLogoutModalOpen,
  language,
  setLanguage,
  t,
  navigate,
}) => {
  const location = useLocation();

  const menuItems = [
    { id: "home", label: t("home"), path: "/", icon: Home },
    { id: "events", label: t("events"), path: "/events", icon: Calendar },
    { id: "calendar", label: t("calendar"), path: "/calendar", icon: Clock },
    { id: "news", label: t("news"), path: "/news", icon: MessageSquare },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[3px] lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="
              fixed inset-y-0 left-0
              z-[101]
              w-[280px]
              bg-white
              shadow-2xl
              lg:hidden
              flex flex-col
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-100 relative">
              <div className="flex items-center justify-between mb-6">
                <img
                  src={logo_iuh}
                  alt="Logo"
                  className="h-9 w-auto object-contain"
                />

                <button
                  onClick={() => setIsOpen(false)}
                  className="
                    w-9 h-9
                    rounded-lg
                    flex items-center justify-center
                    text-slate-400
                    hover:bg-slate-100
                    transition
                  "
                >
                  <X size={20} />
                </button>
              </div>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div
                    className="
                      w-12 h-12
                      rounded-xl
                      bg-[#1E40AF]
                      flex items-center justify-center
                      text-white text-lg font-semibold
                      shadow-sm
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
                        {user.fullName?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">
                      {user.fullName || user.username}
                    </p>

                    <p className="text-[11px] text-[#1E40AF] font-medium mt-0.5">
                      {getPrimaryRole()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[12px] text-slate-500 font-medium mb-3">
                    {t("welcome_guest")}
                  </p>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/login");
                    }}
                    className="
                      w-full h-10
                      bg-[#1E40AF]
                      hover:bg-[#1D4ED8]
                      text-white
                      rounded-lg
                      text-[12px]
                      font-medium
                      transition
                      shadow-sm
                    "
                  >
                    {t("login_now")}
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center justify-between
                      px-4 py-3
                      rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? "bg-blue-50 text-[#1E40AF]"
                        : "text-slate-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon
                        size={20}
                        className={isActive ? "text-[#1E40AF]" : "text-slate-400"}
                      />

                      <span className="text-[14px] font-medium">
                        {item.label}
                      </span>
                    </div>

                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]" />}
                  </Link>
                );
              })}



              {(isEventStaff() || isAdminOnly() || isSuperAdmin()) && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <p className="px-4 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t("management")}
                  </p>

                  <Link
                    to={
                      isSuperAdmin() || isAdminOnly()
                        ? "/admin/dashboard"
                        : isLeaderRole()
                          ? "/lecturer/dashboard"
                          : "/lecturer/events"
                    }
                    onClick={() => setIsOpen(false)}
                    className="
                      flex items-center justify-between
                      px-4 py-3
                      rounded-xl
                      bg-[#1E40AF]
                      text-white
                      shadow-sm
                    "
                  >
                    <div className="flex items-center gap-4">
                      <LayoutDashboard size={20} />

                      <span className="text-[14px] font-medium">
                        {isAdminOnly() || isSuperAdmin()
                          ? t("admin_dashboard")
                          : t("org_dashboard")}
                      </span>
                    </div>

                    <ChevronRight size={16} className="opacity-70" />
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[12px] font-medium text-slate-500">
                  {t("language_label")}
                </span>

                <div className="flex items-center p-1 bg-white rounded-lg border border-slate-200">
                  <button
                    onClick={() => setLanguage("VI")}
                    className={`
                      px-3 py-1 rounded-md text-[11px] font-semibold transition
                      ${language === "VI"
                        ? "bg-[#1E40AF] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                      }
                    `}
                  >
                    VI
                  </button>

                  <button
                    onClick={() => setLanguage("EN")}
                    className={`
                      px-3 py-1 rounded-md text-[11px] font-semibold transition
                      ${language === "EN"
                        ? "bg-[#1E40AF] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                      }
                    `}
                  >
                    EN
                  </button>
                </div>
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="
                    w-full h-11
                    flex items-center justify-center gap-2
                    bg-rose-50
                    hover:bg-rose-100
                    text-rose-600
                    rounded-xl
                    text-[14px]
                    font-medium
                    transition
                  "
                >
                  <LogOut size={18} />
                  {t("logout")}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
