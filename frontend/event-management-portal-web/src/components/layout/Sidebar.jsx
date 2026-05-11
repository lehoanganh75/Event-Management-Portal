import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Home,
    LayoutDashboard,
    ClipboardList,
    Calendar,
    Share2,
    UserCog,
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
    LogOut
} from 'lucide-react';
import { showToast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { unreadCount } = useNotification();
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const role = user?.role?.toUpperCase() || 'GUEST';

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
            { name: 'Tổng quan', icon: LayoutDashboard, path: '/admin/dashboard' },
            { name: 'Duyệt kế hoạch', icon: ClipboardList, path: '/admin/plans' },
            { name: 'Quản lý sự kiện', icon: Calendar, path: '/admin/events' },
            { name: t('posts'), icon: Share2, path: '/admin/posts' },
            { name: 'Quản lý tài khoản', icon: Users, path: '/admin/accounts' },
            { name: 'Cơ cấu tổ chức', icon: GraduationCap, path: '/admin/departments' },
            { name: 'Phân quyền hệ thống', icon: ShieldCheck, path: '/admin/roles' },
            { name: 'Kho mẫu sự kiện', icon: Layout, path: '/admin/templates' },
            { name: 'Trò chơi & Vòng quay', icon: RotateCw, path: '/admin/spinner' },
            { name: t('notifications'), icon: Bell, path: '/admin/notifications' },
            { name: t('profile'), icon: UserCircle, path: '/admin/profile' },
            { name: t('logout'), icon: LogOut, action: 'logout' },
        ],
        ADMIN: [
            { name: t('overview'), icon: LayoutDashboard, path: '/admin/dashboard' },
            { name: t('approve_plans'), icon: ClipboardList, path: '/admin/plans' },
            { name: t('manage_events'), icon: Calendar, path: '/admin/events' },
            { name: t('posts'), icon: Share2, path: '/admin/posts' },
            { name: t('templates'), icon: Layout, path: '/admin/templates' },
            { name: t('manage_accounts'), icon: Users, path: '/admin/accounts' },
            { name: t('organization'), icon: GraduationCap, path: '/admin/departments' },
            { name: t('permissions'), icon: ShieldCheck, path: '/admin/roles' },
            { name: t('games'), icon: RotateCw, path: '/admin/spinner' },
            { name: t('notifications'), icon: Bell, path: '/admin/notifications' },
            { name: t('profile'), icon: UserCircle, path: '/admin/profile' },
            { name: t('logout'), icon: LogOut, action: 'logout' },
        ],
        LECTURER: [
            { name: t('dashboard'), icon: LayoutDashboard, path: '/lecturer/dashboard' },
            { name: t('propose_plans') || "Đề xuất kế hoạch", icon: ClipboardList, path: '/lecturer/plans' },
            { name: t('my_events'), icon: Calendar, path: '/lecturer/events' },
            { name: t('posts'), icon: FileText, path: '/lecturer/posts' },
            { name: t('templates'), icon: Layout, path: '/lecturer/templates' },
            { name: t('games'), icon: RotateCw, path: '/lecturer/spinner' },
            { name: t('notifications'), icon: Bell, path: '/lecturer/notifications' },
            { name: t('profile'), icon: UserCircle, path: '/lecturer/profile' },
            { name: t('logout'), icon: LogOut, action: 'logout' },
        ],
        STUDENT: [
            { name: t('overview'), icon: LayoutDashboard, path: '/student/dashboard' },
            { name: t('enrolled_events') || "Sự kiện tham gia", icon: Calendar, path: '/student/events' },
            { name: t('favorite_posts') || "Bài viết quan tâm", icon: Share2, path: '/student/posts' },
            { name: t('templates'), icon: Layout, path: '/student/templates' },
            { name: t('games'), icon: RotateCw, path: '/student/spinner' },
            { name: t('notifications'), icon: Bell, path: '/student/notifications' },
            { name: t('profile'), icon: UserCircle, path: '/student/profile' },
            { name: t('logout'), icon: LogOut, action: 'logout' },
        ],
        GUEST: [
            { name: t('profile'), icon: UserCircle, path: '/profile' },
            { name: t('my_events'), icon: Calendar, path: '/guest-events' },
            { name: t('logout'), icon: LogOut, action: 'logout' },
        ]
    };

    const menuItems = menuConfigs[role] || [];

    return (
        <>
            <aside
            className={`
        relative bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col shadow-sm z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}
        >
            {/* Toggle Button - Nâng cấp để sắc nét hơn */}
            <button
                onClick={onToggle}
                className="absolute -right-4 top-8 w-8 h-8 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-400 shadow-lg hover:shadow-indigo-100 transition-all z-100 cursor-pointer group/toggle"
            >
                {isCollapsed ? (
                    <ChevronRight size={16} strokeWidth={3} className="transition-transform group-hover/toggle:scale-110" />
                ) : (
                    <ChevronLeft size={16} strokeWidth={3} className="transition-transform group-hover/toggle:scale-110" />
                )}
            </button>

            {/* Header / Logo */}
            <div className={`p-8 pb-4 transition-all duration-300 overflow-hidden ${isCollapsed ? 'px-4' : 'px-8'}`}>
                <div className="flex items-center gap-3">
                    <div className="min-w-[40px] w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 shrink-0">
                        <Calendar size={22} />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300">
                            <span className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">Event Portal</span>
                            <span className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">{role.replace('_', ' ')}</span>
                        </div>
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className="px-8 pt-8 pb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">{t('main_menu') || "Menu chính"}</span>
                </div>
            )}

            {/* Navigation */}
            <nav className={`
                flex-1 space-y-1 custom-scrollbar mt-4 overflow-x-hidden
                ${isCollapsed ? 'overflow-y-auto no-scrollbar px-2' : 'overflow-y-auto px-4'}
            `}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isLogout = item.action === 'logout';

                    const content = (
                        <div className={`
                            group relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                            ${isCollapsed ? 'justify-center px-0' : 'gap-3.5'}
                            ${!isLogout ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'}
                        `}>
                            <div className={`
                                flex items-center justify-center w-9 h-9 rounded-lg transition-all shrink-0
                                ${!isLogout ? 'bg-slate-100 text-slate-500 group-hover:bg-slate-200' : 'bg-rose-100 text-rose-500 group-hover:bg-rose-200'}
                            `}>
                                <Icon size={18} strokeWidth={2} />
                            </div>

                            {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}

                            {item.name.includes('Thông báo') && unreadCount > 0 && (
                                <span className={`
                                    flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold
                                    ${isCollapsed ? 'absolute top-2 right-2 min-w-[14px] h-3.5 px-1' : 'ml-auto min-w-[20px] h-5 px-1.5'}
                                `}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}

                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </div>
                    );

                    if (isLogout) {
                        return (
                            <button key="logout" onClick={() => setShowLogoutModal(true)} className="w-full outline-none block text-left">
                                {content}
                            </button>
                        );
                    }

                    return (
                        <NavLink key={item.path} to={item.path} className="outline-none block">
                            {({ isActive }) => (
                                <div className={`
                  group relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isCollapsed ? 'justify-center px-0' : 'gap-3.5'}
                  ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}>
                                    <div className={`
                    flex items-center justify-center w-9 h-9 rounded-lg transition-all shrink-0
                    ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                  `}>
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>

                                    {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}

                                    {/* Badge for Notifications */}
                                    {item.name.includes('Thông báo') && unreadCount > 0 && (
                                        <span className={`
                      flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold
                      ${isCollapsed ? 'absolute top-2 right-2 min-w-[14px] h-3.5 px-1' : 'ml-auto min-w-[20px] h-5 px-1.5'}
                    `}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}

                                    {isCollapsed && (
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                                            {item.name}
                                        </div>
                                    )}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className={`p-4 border-t border-slate-100 mt-auto bg-slate-50/50 overflow-hidden ${isCollapsed ? 'px-2' : 'px-4'}`}>
                <NavLink to="/" className="outline-none block">
                    <div className={`
            group flex items-center rounded-xl text-sm font-bold text-slate-500 hover:bg-white hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200 hover:shadow-sm
            ${isCollapsed ? 'justify-center p-2' : 'gap-3.5 px-4 py-3'}
          `}>
                        <div className={`
              flex items-center justify-center w-9 h-9 rounded-lg bg-slate-200 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0
            `}>
                            <Home size={18} strokeWidth={2.5} />
                        </div>
                        {!isCollapsed && <span>{t('home_main') || "Trang chủ chính"}</span>}

                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                                Trang chủ
                            </div>
                        )}
                    </div>
                </NavLink>
            </div>
        </aside>
        {/* Logout Confirmation Modal moved outside aside */}
        {showLogoutModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-[32px] p-10 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-inner">
                            <LogOut size={32} strokeWidth={2.5} />
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight">{t('logout')}?</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                            {t('confirm_logout')}
                        </p>

                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-100 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                {t('logout')}
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
);
};

export default Sidebar;