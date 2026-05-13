import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
    Home,
    LayoutDashboard,
    ClipboardList,
    Calendar,
    Share2,
    GraduationCap,
    Layout,
    RotateCw,
    Bell,
    ShieldCheck,
    Users,
    FileText,
    UserCircle,
    ChevronLeft,
    ChevronRight,
    LogOut,
    QrCode,
} from "lucide-react";
import { showToast } from "../../utils/toast";
import LogoutModal from "./header/LogoutModal";

const Sidebar = ({ isCollapsed, onToggle }) => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const { unreadCount } = useNotification();
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    const role = user?.role?.toUpperCase() || "GUEST";

    const handleLogout = async () => {
        try {
            await logout();
            showToast("Đăng xuất thành công!", "success");
            navigate("/");
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
            showToast("Lỗi khi đăng xuất", "error");
        }
    };

    const menuConfigs = {
        SUPER_ADMIN: [
            { name: t("overview"), icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: t("approve_plans"), icon: ClipboardList, path: "/admin/plans" },
            { name: t("manage_events"), icon: Calendar, path: "/admin/events" },
            { name: t("posts"), icon: Share2, path: "/admin/posts" },
            { name: t("manage_accounts"), icon: Users, path: "/admin/accounts" },
            { name: t("organization"), icon: GraduationCap, path: "/admin/departments" },
            { name: t("permissions"), icon: ShieldCheck, path: "/admin/roles" },
            { name: t("templates"), icon: Layout, path: "/admin/templates" },
            { name: t("games"), icon: RotateCw, path: "/admin/spinner" },
            { name: t("notifications"), icon: Bell, path: "/admin/notifications" },
            { name: t("profile"), icon: UserCircle, path: "/admin/profile" },
        ],
        ADMIN: [
            { name: t("overview"), icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: t("approve_plans"), icon: ClipboardList, path: "/admin/plans" },
            { name: t("manage_events"), icon: Calendar, path: "/admin/events" },
            { name: t("posts"), icon: Share2, path: "/admin/posts" },
            { name: t("templates"), icon: Layout, path: "/admin/templates" },
            { name: t("manage_accounts"), icon: Users, path: "/admin/accounts" },
            { name: t("organization"), icon: GraduationCap, path: "/admin/departments" },
            { name: t("permissions"), icon: ShieldCheck, path: "/admin/roles" },
            { name: t("notifications"), icon: Bell, path: "/admin/notifications" },
            { name: t("profile"), icon: UserCircle, path: "/admin/profile" },
        ],
        LECTURER: [
            { name: t("dashboard"), icon: LayoutDashboard, path: "/lecturer/dashboard" },
            { name: t("propose_plans") || "Đề xuất kế hoạch", icon: ClipboardList, path: "/lecturer/plans" },
            { name: t("my_events"), icon: Calendar, path: "/lecturer/events" },
            { name: t("posts"), icon: FileText, path: "/lecturer/posts" },
            { name: t("templates"), icon: Layout, path: "/lecturer/templates" },
            { name: t("notifications"), icon: Bell, path: "/lecturer/notifications" },
            { name: t("profile"), icon: UserCircle, path: "/lecturer/profile" },
        ],
        STUDENT: [
            { name: t("events"), icon: Calendar, path: "/student/events" },
            { name: t("posts"), icon: Share2, path: "/student/posts" },
            { name: t("games"), icon: RotateCw, path: "/student/spinner" },
            { name: t("notifications"), icon: Bell, path: "/student/notifications" },
            { name: t("profile"), icon: UserCircle, path: "/student/profile" },
        ],
        MEMBER: [
            { name: t("event_management") || "Quản lý sự kiện", icon: Calendar, path: "/member/events" },
            { name: t("check_in") || "Điểm danh QR", icon: QrCode, path: "/member/checkin" },
            { name: t("task_management") || "Nhiệm vụ của tôi", icon: ClipboardList, path: "/member/tasks" },
            { name: t("notifications"), icon: Bell, path: "/member/notifications" },
            { name: t("profile"), icon: UserCircle, path: "/member/profile" },
        ],
        GUEST: [
            { name: t("profile"), icon: UserCircle, path: "/profile" },
            { name: t("my_events"), icon: Calendar, path: "/guest-events" },
        ],
    };

    const menuItems = menuConfigs[role] || [];

    const isNotificationItem = (name) =>
        name?.toLowerCase().includes(t("notifications")?.toLowerCase()) ||
        name?.toLowerCase().includes("thông báo");

    return (
        <>
            <aside
                className={`
          sticky top-0 z-[110]
          h-screen
          bg-white
          border-r border-slate-200
          flex flex-col
          transition-all duration-300 ease-out
          ${isCollapsed ? "w-20" : "w-72"}
        `}
            >
                {/* Toggle */}
                <button
                    onClick={onToggle}
                    className="
            absolute -right-3 top-7
            w-7 h-7
            rounded-full
            bg-white
            border border-slate-200
            text-slate-500
            flex items-center justify-center
            hover:text-[#1E40AF]
            hover:border-blue-200
            shadow-sm
            hover:shadow-md
            transition
          "
                >
                    {isCollapsed ? (
                        <ChevronRight size={15} strokeWidth={2.4} />
                    ) : (
                        <ChevronLeft size={15} strokeWidth={2.4} />
                    )}
                </button>

                {/* Logo */}
                <div
                    className={`
            h-20
            flex items-center
            border-b border-slate-100
            ${isCollapsed ? "justify-center px-0" : "px-5"}
          `}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-xl" />
                            <div
                                className="
                  relative
                  w-11 h-11
                  rounded-xl
                  bg-gradient-to-br from-[#1E40AF] to-[#2563EB]
                  text-white
                  flex items-center justify-center
                  shadow-md shadow-blue-100
                "
                            >
                                <Calendar size={21} strokeWidth={2.5} />
                            </div>
                        </div>

                        {!isCollapsed && (
                            <div className="min-w-0">
                                <h1 className="text-[15px] font-black text-slate-900 leading-tight tracking-tight">
                                    EVENTIA
                                </h1>
                                <p className="text-[10px] text-[#1E40AF] font-bold uppercase tracking-[0.16em] truncate mt-1">
                                    {t(`role_${role.toLowerCase()}`) || role.replace("_", " ")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                    {!isCollapsed && (
                        <p className="px-3 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                            {t("MENU")}
                        </p>
                    )}

                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink key={item.path} to={item.path} className="block group outline-none">
                                    {({ isActive }) => (
                                        <div
                                            className={`
                                                relative
                                                flex items-center
                                                min-h-[56px]
                                                rounded-xl
                                                transition-all duration-200
                                                ${isCollapsed ? "justify-center" : "px-3 gap-3"}
                                                ${isActive
                                                    ? "bg-blue-50 text-[#1E40AF] shadow-sm shadow-blue-100"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                }
                                            `}
                                        >
                                            {isActive && !isCollapsed && (
                                                <span className="absolute left-0 w-1 h-6 rounded-r-full bg-[#1E40AF]" />
                                            )}

                                            <div
                                                className={`
                          w-9 h-9
                          rounded-lg
                          flex items-center justify-center
                          transition-all duration-200
                          ${isActive
                                                        ? "bg-[#1E40AF] text-white shadow-sm shadow-blue-200"
                                                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-[#1E40AF] group-hover:shadow-sm"
                                                    }
                        `}
                                            >
                                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                            </div>

                                            {!isCollapsed && (
                                                <span className="text-sm font-semibold truncate flex-1">
                                                    {item.name}
                                                </span>
                                            )}

                                            {isNotificationItem(item.name) && unreadCount > 0 && (
                                                <span
                                                    className={`
                            flex items-center justify-center
                            rounded-full
                            bg-rose-500
                            text-white
                            text-[10px]
                            font-black
                            ring-2 ring-white
                            ${isCollapsed ? "absolute top-1 right-1 min-w-[18px] h-[18px] px-1" : "min-w-[20px] h-5 px-1.5"}
                          `}
                                                >
                                                    {unreadCount > 99 ? "99+" : unreadCount}
                                                </span>
                                            )}

                                            {isCollapsed && (
                                                <div
                                                    className="
                            absolute left-full ml-3
                            px-3 py-2
                            rounded-lg
                            bg-slate-900
                            text-white
                            text-[11px]
                            font-bold
                            opacity-0
                            pointer-events-none
                            group-hover:opacity-100
                            group-hover:translate-x-1
                            transition-all
                            whitespace-nowrap
                            z-[200]
                            shadow-xl
                          "
                                                >
                                                    {item.name}
                                                    <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Support */}
                    <div className="mt-7 pt-4 border-t border-slate-100">
                        {!isCollapsed && (
                            <p className="px-3 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                                {t("SUPPORT")}
                            </p>
                        )}

                        <NavLink to="/" className="block group outline-none">
                            <div
                                className={`
                                        relative
                                        flex items-center
                                        min-h-[56px]
                                        rounded-xl
                                        transition-all duration-200
                                        text-slate-600 hover:bg-slate-50 hover:text-slate-900
                                        ${isCollapsed ? "justify-center" : "px-3 gap-3"}
                                    `}
                            >
                                <div
                                    className="
                                        w-9 h-9
                                        rounded-lg
                                        bg-slate-100
                                        text-slate-500
                                        flex items-center justify-center
                                        group-hover:bg-white
                                        group-hover:text-[#1E40AF]
                                        group-hover:shadow-sm
                                        transition-all
                                    "
                                >
                                    <Home size={18} />
                                </div>

                                {!isCollapsed && (
                                    <span className="text-sm font-semibold">
                                        {t("home_main") || "Main Portal"}
                                    </span>
                                )}

                                {isCollapsed && (
                                    <div
                                        className="
                                            absolute left-full ml-3
                                            px-3 py-2
                                            rounded-lg
                                            bg-slate-900
                                            text-white
                                            text-[11px]
                                            font-bold
                                            opacity-0
                                            pointer-events-none
                                            group-hover:opacity-100
                                            group-hover:translate-x-1
                                            transition-all
                                            whitespace-nowrap
                                            z-[200]
                                            shadow-xl
                                        "
                                    >
                                        {t("home") || "Home"}
                                        <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                    </div>
                                )}
                            </div>
                        </NavLink>
                    </div>
                </div>

                {/* Logout */}
                <div className="p-3 border-t border-slate-100">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`
              w-full min-h-[46px]
              rounded-xl
              flex items-center
              text-rose-600
              hover:bg-rose-50
              transition-all
              ${isCollapsed ? "justify-center" : "px-3 gap-3"}
            `}
                    >
                        <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                            <LogOut size={18} />
                        </div>

                        {!isCollapsed && (
                            <span className="text-sm font-semibold">
                                {t("logout") || "Đăng xuất"}
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            <LogoutModal
                isOpen={showLogoutModal}
                setIsOpen={setShowLogoutModal}
                handleLogout={handleLogout}
                t={t}
            />
        </>
    );
};

export default Sidebar;