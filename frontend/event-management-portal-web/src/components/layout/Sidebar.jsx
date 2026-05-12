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
            { name: t('overview'), icon: LayoutDashboard, path: '/admin/dashboard' },
            { name: t('approve_plans'), icon: ClipboardList, path: '/admin/plans' },
            { name: t('manage_events'), icon: Calendar, path: '/admin/events' },
            { name: t('posts'), icon: Share2, path: '/admin/posts' },
            { name: t('manage_accounts'), icon: Users, path: '/admin/accounts' },
            { name: t('organization'), icon: GraduationCap, path: '/admin/departments' },
            { name: t('permissions'), icon: ShieldCheck, path: '/admin/roles' },
            { name: t('templates'), icon: Layout, path: '/admin/templates' },
            { name: t('games'), icon: RotateCw, path: '/admin/spinner' },
            { name: t('notifications'), icon: Bell, path: '/admin/notifications' },
            { name: t('profile'), icon: UserCircle, path: '/admin/profile' },
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
            { name: t('notifications'), icon: Bell, path: '/admin/notifications' },
            { name: t('profile'), icon: UserCircle, path: '/admin/profile' },
        ],
        LECTURER: [
            { name: t('dashboard'), icon: LayoutDashboard, path: '/lecturer/dashboard' },
            { name: t('propose_plans') || "Đề xuất kế hoạch", icon: ClipboardList, path: '/lecturer/plans' },
            { name: t('my_events'), icon: Calendar, path: '/lecturer/events' },
            { name: t('posts'), icon: FileText, path: '/lecturer/posts' },
            { name: t('templates'), icon: Layout, path: '/lecturer/templates' },
            { name: t('notifications'), icon: Bell, path: '/lecturer/notifications' },
            { name: t('profile'), icon: UserCircle, path: '/lecturer/profile' },
        ],
        STUDENT: [
            { name: t('overview'), icon: LayoutDashboard, path: '/student/dashboard' },
            { name: t('enrolled_events') || "Sự kiện tham gia", icon: Calendar, path: '/student/events' },
            { name: t('favorite_posts') || "Bài viết quan tâm", icon: Share2, path: '/student/posts' },
            { name: t('templates'), icon: Layout, path: '/student/templates' },
            { name: t('games'), icon: RotateCw, path: '/student/spinner' },
            { name: t('notifications'), icon: Bell, path: '/student/notifications' },
            { name: t('profile'), icon: UserCircle, path: '/student/profile' },
        ],
        GUEST: [
            { name: t('profile'), icon: UserCircle, path: '/profile' },
            { name: t('my_events'), icon: Calendar, path: '/guest-events' },
        ]
    };

    const menuItems = menuConfigs[role] || [];

    return (
        <>
            <aside
                className={`
                    relative bg-white border-r border-slate-100 h-screen sticky top-0 flex flex-col z-[110]
                    transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-x-hidden
                    ${isCollapsed ? 'w-20' : 'w-72'}
                `}
            >
                {/* Toggle Button - Floating Design */}
                <button
                    onClick={onToggle}
                    className="absolute -right-3.5 top-10 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all z-[120] cursor-pointer group/toggle"
                >
                    {isCollapsed ? (
                        <ChevronRight size={14} strokeWidth={2.5} className="transition-transform group-hover/toggle:translate-x-0.5" />
                    ) : (
                        <ChevronLeft size={14} strokeWidth={2.5} className="transition-transform group-hover/toggle:-translate-x-0.5" />
                    )}
                </button>

                {/* Logo Section */}
                <div className={`p-6 mb-2 transition-all duration-500 ${isCollapsed ? 'px-0 flex justify-center' : 'px-6'}`}>
                    <div className="flex items-center gap-3.5">
                        <div className="relative group/logo">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl opacity-20 blur-sm group-hover/logo:opacity-40 transition-opacity"></div>
                            <div className={`relative ${isCollapsed ? 'w-10 h-10' : 'w-11 h-11'} bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0 transform group-hover/logo:scale-105 transition-all duration-300`}>
                                <Calendar size={isCollapsed ? 20 : 22} strokeWidth={2.5} />
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-500">
                                <span className="text-base font-black text-slate-900 tracking-tight leading-none">EVENTIA</span>
                                <span className="text-[10px] font-bold text-indigo-500 mt-1.5 uppercase tracking-[0.2em] opacity-80">{t(`role_${role.toLowerCase()}`) || role.replace('_', ' ')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar space-y-8">
                    <div>
                        {!isCollapsed && (
                            <div className="px-4 mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('MENU') || "Main Navigation"}</span>
                            </div>
                        )}
                        <nav className="space-y-1.5">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink key={item.path} to={item.path} className="outline-none block group">
                                        {({ isActive }) => (
                                            <div className={`
                                                relative flex items-center rounded-xl transition-all duration-300 py-2.5
                                                ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-4'}
                                                ${isActive
                                                    ? 'bg-indigo-50/80 text-indigo-700 shadow-sm shadow-indigo-100/50'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                            `}>
                                                {/* Active Indicator */}
                                                {isActive && !isCollapsed && (
                                                    <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full animate-in fade-in slide-in-from-left-1 duration-300"></div>
                                                )}

                                                <div className={`
                                                    flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300
                                                    ${isActive
                                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                        : 'bg-slate-100 group-hover:bg-white group-hover:shadow-sm text-slate-500 group-hover:text-indigo-600'}
                                                `}>
                                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`} />
                                                </div>

                                                {!isCollapsed && (
                                                    <span className={`text-sm font-semibold truncate flex-1 ${isActive ? 'font-bold' : ''}`}>
                                                        {item.name}
                                                    </span>
                                                )}

                                                {/* Notification Badge */}
                                                {item.name.includes(t('notifications')) && unreadCount > 0 && (
                                                    <span className={`
                                                        flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black ring-4 ring-white
                                                        ${isCollapsed ? 'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1' : 'ml-auto min-w-[20px] h-5 px-1.5'}
                                                    `}>
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </span>
                                                )}

                                                {/* Tooltip for Collapsed State */}
                                                {isCollapsed && (
                                                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 shadow-xl z-[200] whitespace-nowrap">
                                                        {item.name}
                                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Secondary Navigation (Optional: Settings/Home) */}
                    <div>
                        {!isCollapsed && (
                            <div className="px-4 mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('SUPPORT') || "Support"}</span>
                            </div>
                        )}
                        <NavLink to="/" className="outline-none block group">
                            <div className={`
                                flex items-center rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 py-2.5
                                ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-4'}
                            `}>
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-white group-hover:shadow-sm text-slate-500 group-hover:text-indigo-600 transition-all duration-300">
                                    <Home size={20} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                {!isCollapsed && <span className="text-sm font-semibold truncate">{t('home_main') || "Main Portal"}</span>}

                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 shadow-xl z-[200] whitespace-nowrap">
                                        {t('home')}
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                    </div>
                                )}
                            </div>
                        </NavLink>
                    </div>
                </div>

                {/* Footer / User Profile Section */}
                <div className={`p-4 mt-auto border-t border-slate-50 bg-slate-50/30 transition-all duration-500 ${isCollapsed ? 'px-2 flex flex-col items-center' : ''}`}>
                    <div className={`
                        flex items-center transition-all duration-300
                        ${isCollapsed ? 'justify-center w-full' : 'gap-3 p-2 bg-white shadow-sm border border-slate-100 rounded-2xl'}
                    `}>
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm border-2 border-white shadow-sm">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{user?.fullName || 'User'}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                            </div>
                        )}

                        {!isCollapsed && (
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                title={t('logout')}
                            >
                                <LogOut size={18} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>

                    {isCollapsed && (
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="mt-4 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <LogOut size={20} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </aside>

            {/* Logout Confirmation Modal - Extra Premium */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white rounded-[40px] p-12 max-w-sm w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/20 animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-20 rounded-full"></div>
                                <div className="relative w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
                                    <LogOut size={40} strokeWidth={2.5} />
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Đăng xuất?</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 px-4">
                                {t('confirm_logout') || "Bạn có chắc chắn muốn rời khỏi hệ thống ngay bây giờ không?"}
                            </p>

                            <div className="flex flex-col w-full gap-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-5 bg-rose-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 shadow-lg shadow-rose-200 active:scale-95 transition-all cursor-pointer"
                                >
                                    {t('logout') || "Đăng xuất"}
                                </button>
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="w-full py-5 bg-slate-50 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                                >
                                    {t('cancel') || "Hủy bỏ"}
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