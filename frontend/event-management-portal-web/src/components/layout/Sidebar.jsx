import React, { useState } from "react";
import { NavLink } from "react-router-dom";
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
    ChevronDown,
    Activity,
} from "lucide-react";
import logo_iuh from "../../assets/images/iuh.png";

const Sidebar = ({ isCollapsed, onToggle }) => {
    const { unreadCount } = useNotification();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [menuOpen, setMenuOpen] = useState(true);
    const [supportOpen, setSupportOpen] = useState(true);

    const role = user?.role?.toUpperCase() || "GUEST";

    /**
     * Student Organizer: STUDENT sở hữu tổ chức -> load MEMBER sidebar
     * để có quyền truy cập các tính năng BTC (tạo sự kiện, quản lý BTC...)
     */
    const isStudentOrganizer =
        (role === "STUDENT" || role === "GUEST") &&
        ((user?.ownedOrganizations && user.ownedOrganizations.length > 0) ||
         (user?.eventRoles && user.eventRoles.length > 0));

    // Nếu là student organizer, dùng cấu hình sidebar của MEMBER
    const effectiveRole = isStudentOrganizer ? "MEMBER" : role;

    const menuConfigs = {
        SUPER_ADMIN: [
            { name: "Tổng quan", icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: "Duyệt kế hoạch", icon: ClipboardList, path: "/admin/plans" },
            { name: "Quản lý sự kiện", icon: Calendar, path: "/admin/events" },
            { name: "Bản tin & Truyền thông", icon: Share2, path: "/admin/posts" },
            { name: "Quản lý tài khoản", icon: Users, path: "/admin/accounts" },
            { name: "Cơ cấu tổ chức", icon: GraduationCap, path: "/admin/departments" },
            { name: "Phân quyền hệ thống", icon: ShieldCheck, path: "/admin/roles" },
            { name: "Kho mẫu sự kiện", icon: Layout, path: "/admin/templates" },
            { name: "Trò chơi & Vòng quay", icon: RotateCw, path: "/admin/spinner" },
            { name: "Thông báo", icon: Bell, path: "/admin/notifications" },
            { name: "Hồ sơ cá nhân", icon: UserCircle, path: "/admin/profile" },
        ],
        ADMIN: [
            { name: "Tổng quan", icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: "Duyệt kế hoạch", icon: ClipboardList, path: "/admin/plans" },
            { name: "Quản lý sự kiện", icon: Calendar, path: "/admin/events" },
            { name: "Bản tin & Truyền thông", icon: Share2, path: "/admin/posts" },
            { name: "Kho mẫu sự kiện", icon: Layout, path: "/admin/templates" },
            { name: "Quản lý tài khoản", icon: Users, path: "/admin/accounts" },
            { name: "Cơ cấu tổ chức", icon: GraduationCap, path: "/admin/departments" },
            { name: "Phân quyền hệ thống", icon: ShieldCheck, path: "/admin/roles" },
            { name: "Thông báo", icon: Bell, path: "/admin/notifications" },
            { name: "Hồ sơ cá nhân", icon: UserCircle, path: "/admin/profile" },
        ],
        LECTURER: [
            { name: "Bảng điều khiển", icon: LayoutDashboard, path: "/lecturer/dashboard" },
            { name: "Đề xuất kế hoạch", icon: ClipboardList, path: "/lecturer/plans" },
            { name: "Sự kiện của tôi", icon: Calendar, path: "/lecturer/events" },
            { name: "Bản tin & Truyền thông", icon: FileText, path: "/lecturer/posts" },
            { name: "Kho mẫu sự kiện", icon: Layout, path: "/lecturer/templates" },
            { name: "Quản lý tài khoản", icon: Users, path: "/lecturer/accounts" },
            { name: "Thông báo", icon: Bell, path: "/lecturer/notifications" },
            { name: "Hồ sơ cá nhân", icon: UserCircle, path: "/lecturer/profile" },
        ],
        STUDENT: [
            { name: "Sự kiện của tôi", icon: Calendar, path: "/guest-events" },
            { name: "Bản tin & Truyền thông", icon: Share2, path: "/student/posts" },
            { name: "Trò chơi & Vòng quay", icon: RotateCw, path: "/student/spinner" },
            { name: "Thông báo", icon: Bell, path: "/notifications" },
            { name: "Hồ sơ cá nhân", icon: UserCircle, path: "/student/profile" },
        ],
        MEMBER: [
            { name: "Quản lý sự kiện", icon: Calendar, path: "/student/events" },
            { name: "Bản tin & Truyền thông", icon: Share2, path: "/student/posts" },
            { name: "Thông báo", icon: Bell, path: "/student/notifications" },
            { name: "Hồ sơ cá nhân", icon: UserCircle, path: "/student/profile" },
        ],
        GUEST: [
            { name: "Hồ sơ cá nhân", icon: UserCircle, path: "/profile" },
            { name: "Sự kiện của tôi", icon: Calendar, path: "/guest-events" },
            { name: "Thông báo", icon: Bell, path: "/notifications" },
        ],
    };

    const menuItems = menuConfigs[effectiveRole] || [];

    const isNotificationItem = (name) =>
        name?.toLowerCase().includes("thông báo");

    // Nếu là student organizer, hiện label "Trưởng BTC" thay vì "STUDENT"
    const roleLabel = isStudentOrganizer
        ? "Trưởng Ban Tổ Chức"
        : (t(`role_${role.toLowerCase()}`) || role.replace("_", " "));

    return (
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
                    hover:text-blue-700
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

            <div
                className={`
                    h-20
                    flex items-center
                    border-b border-slate-100
                    ${isCollapsed ? "justify-center px-0" : "px-4"}
                `}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <img
                        src={logo_iuh}
                        alt="IUH Logo"
                        className="w-11 h-11 object-contain shrink-0"
                    />

                    {!isCollapsed && (
                        <div className="min-w-0">
                            <h1 className="text-[15px] font-bold text-slate-900 leading-tight tracking-tight">
                                IUH - EMS
                            </h1>

                            <p className="text-[10px] text-blue-700 font-semibold uppercase tracking-wide truncate mt-1">
                                {roleLabel}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                {!isCollapsed && (
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="
                            w-full
                            px-2 py-2.5 mb-3
                            flex items-center justify-between
                            rounded-lg
                            hover:bg-slate-50
                            transition
                        "
                    >
                        <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">
                            Danh mục chính
                        </span>

                        <ChevronDown
                            size={15}
                            className={`text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-0" : "-rotate-90"
                                }`}
                        />
                    </button>
                )}

                {(menuOpen || isCollapsed) && (
                    <nav className="space-y-3 px-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className="block group outline-none"
                                >
                                    {({ isActive }) => (
                                        <div
                                            className={`
                                                relative
                                                flex items-center
                                                min-h-[58px]
                                                rounded-xl
                                                transition-all duration-200
                                                ${isCollapsed ? "justify-center" : "px-4 gap-4"}
                                                ${isActive
                                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                                                }
                                            `}
                                        >
                                            {isActive && !isCollapsed && (
                                                <span className="absolute left-0 w-1 h-7 rounded-r-full bg-blue-700" />
                                            )}

                                            <div
                                                className={`
                                                    w-10 h-10
                                                    rounded-xl
                                                    flex items-center justify-center
                                                    transition-all duration-200
                                                    ${isActive
                                                        ? "bg-blue-700 text-white shadow-sm"
                                                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-700 group-hover:shadow-sm"
                                                    }
                                                `}
                                            >
                                                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                                            </div>

                                            {!isCollapsed && (
                                                <span className="text-[14px] font-semibold truncate flex-1">
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
                                                        font-bold
                                                        ring-2 ring-white
                                                        ${isCollapsed
                                                            ? "absolute top-1 right-1 min-w-[18px] h-[18px] px-1"
                                                            : "min-w-[21px] h-[21px] px-1.5"
                                                        }
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
                                                        rounded-md
                                                        bg-slate-900
                                                        text-white
                                                        text-[11px]
                                                        font-medium
                                                        opacity-0
                                                        pointer-events-none
                                                        group-hover:opacity-100
                                                        group-hover:translate-x-1
                                                        transition-all
                                                        whitespace-nowrap
                                                        z-[200]
                                                        shadow-lg
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
                )}

                <div className="mt-8 pt-5 border-t border-slate-100">
                    {!isCollapsed && (
                        <button
                            onClick={() => setSupportOpen(!supportOpen)}
                            className="
                                w-full
                                px-2 py-2.5 mb-3
                                flex items-center justify-between
                                rounded-lg
                                hover:bg-slate-50
                                transition
                            "
                        >
                            <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">
                                Hỗ trợ
                            </span>

                            <ChevronDown
                                size={15}
                                className={`text-slate-400 transition-transform duration-200 ${supportOpen ? "rotate-0" : "-rotate-90"
                                    }`}
                            />
                        </button>
                    )}

                    {(supportOpen || isCollapsed) && (
                        <NavLink to="/" className="block group outline-none">
                            <div
                                className={`
                                    relative
                                    flex items-center
                                    min-h-[58px]
                                    rounded-xl
                                    transition-all duration-200
                                    text-slate-600 hover:bg-slate-100/80 hover:text-slate-900
                                    ${isCollapsed ? "justify-center" : "px-4 gap-4"}
                                `}
                            >
                                <div
                                    className="
                                        w-10 h-10
                                        rounded-xl
                                        bg-slate-100
                                        text-slate-500
                                        flex items-center justify-center
                                        group-hover:bg-white
                                        group-hover:text-blue-700
                                        group-hover:shadow-sm
                                        transition-all
                                    "
                                >
                                    <Home size={19} />
                                </div>

                                {!isCollapsed && (
                                    <span className="text-[14px] font-semibold">
                                        Quay về trang chủ
                                    </span>
                                )}

                                {isCollapsed && (
                                    <div
                                        className="
                                            absolute left-full ml-3
                                            px-3 py-2
                                            rounded-md
                                            bg-slate-900
                                            text-white
                                            text-[11px]
                                            font-medium
                                            opacity-0
                                            pointer-events-none
                                            group-hover:opacity-100
                                            group-hover:translate-x-1
                                            transition-all
                                            whitespace-nowrap
                                            z-[200]
                                            shadow-lg
                                        "
                                    >
                                        Trang chủ
                                        <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                    </div>
                                )}
                            </div>
                        </NavLink>
                    )}
                </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/60">
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-2 group relative">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Activity size={19} className="animate-pulse" />
                        </div>

                        <div
                            className="
                                absolute left-full ml-3
                                p-3
                                rounded-lg
                                bg-slate-900
                                text-white
                                text-xs
                                opacity-0
                                pointer-events-none
                                group-hover:opacity-100
                                group-hover:translate-x-1
                                transition-all
                                z-[200]
                                shadow-lg
                                min-w-[150px]
                            "
                        >
                            <p className="font-semibold text-blue-400">IUH - EMS</p>
                            <p className="text-[10px] text-slate-300 mt-1">
                                Version: 2.5.0
                            </p>
                            <p className="text-[10px] text-emerald-400 mt-0.5">
                                Status: Operational
                            </p>
                            <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Hệ thống
                            </span>

                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Hoạt động</span>
                            </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-600">
                            <div className="flex justify-between gap-2">
                                <span className="text-slate-400">Phiên bản:</span>
                                <span className="font-medium text-slate-800">
                                    2.5.0-stable
                                </span>
                            </div>

                            <div className="flex justify-between gap-2">
                                <span className="text-slate-400">Máy chủ:</span>
                                <span className="font-medium text-slate-800 truncate">
                                    iuh.events.portal
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;