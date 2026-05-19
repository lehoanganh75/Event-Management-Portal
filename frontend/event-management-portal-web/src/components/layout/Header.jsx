import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogIn,
  Bell,
  Menu,
  QrCode,
  LayoutDashboard,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import logo_iuh from "../../assets/images/logo_iuh.png";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import notificationService from "../../services/notificationService";
import { showToast } from "../../utils/toast.jsx";

// Sub-components
import TopBar from "./header/TopBar";
import DesktopNav from "./header/DesktopNav";
import NotificationBell from "./dashboard/NotificationBell";
import UserProfileMenu from "./header/UserProfileMenu";
import MobileDrawer from "./header/MobileDrawer";
import LogoutModal from "./header/LogoutModal";

const roleKeyMap = {
  SUPER_ADMIN: "role_super_admin",
  ADMIN: "role_admin",
  LECTURER: "role_lecturer",
  STUDENT: "role_student",
  MEMBER: "role_member",
  LEADER: "role_leader",
  SUB_LEADER: "role_sub_leader",
  SECRETARY: "role_secretary",
  MEMBER_ORG: "role_member_org",
  GUEST: "role_guest",
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [activeSection, setActiveSection] = useState("home");

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPrimaryRole = () => {
    if (!user?.role) return "Sinh viên";
    const rawRole = user.role;
    const systemRole = rawRole.toUpperCase();

    if (systemRole === "SUPER_ADMIN" || systemRole === "ADMIN") {
      return t(roleKeyMap[systemRole]) || (systemRole === "ADMIN" ? "Quản trị viên" : "Quản trị viên cấp cao");
    }

    if (user?.eventRoles && user.eventRoles.length > 0) {
      const eRole = user.eventRoles[0];
      return t(roleKeyMap[eRole]) || eRole;
    }

    return t(roleKeyMap[systemRole]) || t(roleKeyMap[rawRole]) || "Sinh viên";
  };

  const isSuperAdmin = () => user?.role?.toUpperCase() === "SUPER_ADMIN";
  const isAdminOnly = () => user?.role?.toUpperCase() === "ADMIN";
  const isEventStaff = () => user?.eventRoles && user.eventRoles.length > 0;
  const isLeaderRole = () => user?.eventRoles?.some(role => role.toUpperCase() === 'LEADER');
  const hasRole = (roleName) => user?.role?.toUpperCase() === roleName.toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
      showToast(language === 'VI' ? "Đăng xuất thành công. Hẹn gặp lại bạn!" : "Logged out successfully!", "success");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) { console.error(error); }
  };

  const isLoginPage = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  if (authLoading) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Đang tải...</span>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50">
        <TopBar t={t} language={language} setLanguage={setLanguage} />

        <div className="bg-white border-b border-slate-200 shadow-sm relative z-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-16 h-[72px] flex items-center justify-between gap-6">

            {/* LEFT */}
            <div className="flex items-center gap-3 shrink-0">

              {/* Mobile menu */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
              >
                <Menu size={22} />
              </button>

              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <img
                  src={logo_iuh}
                  alt="IUH Logo"
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>

            {/* CENTER NAV */}
            {!isLoginPage && (
              <div className="hidden lg:flex flex-1 justify-center">
                <DesktopNav
                  activeSection={activeSection}
                  setActiveSection={setActiveSection}
                  t={t}
                />
              </div>
            )}

            {/* RIGHT */}
            <div className="flex items-center gap-2 shrink-0">

              {/* QR */}
              <button
                onClick={() => navigate("/attendance")}
                className="
                  h-10 px-4
                  hidden md:flex
                  items-center gap-2
                  rounded-lg
                  border border-slate-200
                  bg-white
                  hover:bg-slate-50
                  text-slate-700
                  transition
                "
              >
                <QrCode size={18} />

                <span className="text-[12px] font-medium">
                  {"Quét QR"}
                </span>
              </button>

              {isAuthenticated && user ? (
                <>
                  {/* Dashboard */}
                  {(isEventStaff() || isAdminOnly() || isSuperAdmin() || hasRole("MEMBER") || hasRole("LECTURER")) && (
                    <Link
                      to={
                        isSuperAdmin() || isAdminOnly()
                          ? "/admin/dashboard"
                          : hasRole("MEMBER")
                            ? "/student/events"
                            : isLeaderRole()
                              ? "/lecturer/dashboard"
                              : "/lecturer/events"
                      }
                      className="
                  hidden sm:flex
                  h-10 px-4
                  items-center gap-2
                  rounded-lg
                  bg-[#1E40AF]
                  hover:bg-[#1D4ED8]
                  text-white
                  transition
                "
                    >
                      <LayoutDashboard size={18} />

                      <span className="text-[12px] font-medium">
                        Dashboard
                      </span>
                    </Link>
                  )}

                  {/* Notification */}
                  <NotificationBell />

                  {/* User */}
                  <UserProfileMenu
                    isOpen={isMenuOpen}
                    setIsOpen={setIsMenuOpen}
                    user={user}
                    getPrimaryRole={getPrimaryRole}
                    isSuperAdmin={isSuperAdmin}
                    isAdminOnly={isAdminOnly}
                    hasRole={hasRole}
                    isEventStaff={isEventStaff}
                    setIsLogoutModalOpen={setIsLogoutModalOpen}
                    t={t}
                    menuRef={menuRef}
                    navigate={navigate}
                  />
                </>
              ) : (
                <Link
                  to="/login"
                  className="
              h-10 px-5
              flex items-center gap-2
              rounded-lg
              bg-[#1E40AF]
              hover:bg-[#1D4ED8]
              text-white
              transition
            "
                >
                  <LogIn size={18} />

                  <span className="text-[12px] font-medium">
                    {"Đăng nhập"}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        setIsOpen={setIsLogoutModalOpen}
        handleLogout={handleLogout}
        t={t}
      />

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        user={user}
        isAuthenticated={isAuthenticated}
        activeSection={activeSection}
        getPrimaryRole={getPrimaryRole}
        isSuperAdmin={isSuperAdmin}
        isAdminOnly={isAdminOnly}
        isEventStaff={isEventStaff}
        isLeaderRole={isLeaderRole}
        setIsLogoutModalOpen={setIsLogoutModalOpen}
        language={language}
        setLanguage={setLanguage}
        t={t}
        navigate={navigate}
      />
    </>
  );
};

export default Header;
