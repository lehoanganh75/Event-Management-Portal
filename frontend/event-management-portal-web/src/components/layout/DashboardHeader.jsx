import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { showToast } from "../../utils/toast.jsx";

// Components
import LanguageSelector from "./dashboard/LanguageSelector";
import NotificationBell from "./dashboard/NotificationBell";
import UserMenu from "./dashboard/UserMenu";
import LogoutModal from "./header/LogoutModal";

const roleMap = {
  SUPER_ADMIN: "Quản trị viên cấp cao",
  ADMIN: "Quản trị viên",
  LECTURER: "Giảng viên / Tổ chức",
  STUDENT: "Sinh viên",
  GUEST: "Người dùng",
};

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
      showToast("Đăng xuất thành công!", "success");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      showToast("Lỗi khi đăng xuất", "error");
    }
  };

  const getPrimaryRole = () => {
    const systemRole = user?.role?.toUpperCase() || "STUDENT";
    return roleMap[systemRole] || t(`role_${systemRole.toLowerCase()}`) || "Sinh viên";
  };

  return (
    <>
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 rounded-full bg-[#1E40AF]" />

          <h2 className="hidden md:block text-sm font-bold text-slate-700 tracking-wide">
            {"Bảng điều khiển hệ thống"}
          </h2>
        </div>

        <div className="flex items-center gap-4 h-full">
          <LanguageSelector language={language} setLanguage={setLanguage} />

          <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />

          <div className="flex items-center gap-4">
            {/* Quick Access QR Scanner */}
            {!(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || user?.role === "LECTURER") && (
              <button
                onClick={() => navigate("/attendance")}
                className="p-2.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group relative"
                title={"Quét QR"}
              >
                <QrCode size={20} strokeWidth={2.5} />
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-white rounded-full shadow-sm" />
              </button>
            )}

            <NotificationBell />

            <UserMenu
              isOpen={isDropdownOpen}
              setIsOpen={setIsDropdownOpen}
              menuRef={menuRef}
              user={user}
              getPrimaryRole={getPrimaryRole}
              setIsLogoutModalOpen={setIsLogoutModalOpen}
              t={t}
              navigate={navigate}
            />
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        setIsOpen={setIsLogoutModalOpen}
        handleLogout={handleLogout}
        t={t}
      />
    </>
  );
};

export default DashboardHeader;
