import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
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
    ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const { unreadCount } = useNotification();
    const { user } = useAuth();
    const role = user?.role?.toUpperCase() || 'GUEST';

    const menuConfigs = {
        SUPER_ADMIN: [
            { name: 'Tổng quan', icon: LayoutDashboard, path: '/admin/dashboard' },
            { name: 'Duyệt kế hoạch', icon: ClipboardList, path: '/admin/plans' },
            { name: 'Quản lý sự kiện', icon: Calendar, path: '/admin/events' },
            { name: 'Bài viết truyền thông', icon: Share2, path: '/admin/posts' },
            { name: 'Quản lý tài khoản', icon: Users, path: '/admin/accounts' },
            { name: 'Cơ cấu tổ chức', icon: GraduationCap, path: '/admin/departments' },
            { name: 'Phân quyền hệ thống', icon: ShieldCheck, path: '/admin/roles' },
            { name: 'Kho mẫu sự kiện', icon: Layout, path: '/admin/templates' },
            { name: 'Trò chơi & Vòng quay', icon: RotateCw, path: '/admin/spinner' },
            { name: 'Hệ thống thông báo', icon: Bell, path: '/admin/notifications' },
            { name: 'Hồ sơ cá nhân', icon: UserCircle, path: '/admin/profile' },
        ],
        ADMIN: [
            { name: 'Tổng quan', icon: LayoutDashboard, path: '/admin/dashboard' },
            { name: 'Phê duyệt kế hoạch', icon: ClipboardList, path: '/admin/plans' },
            { name: 'Quản lý sự kiện', icon: Calendar, path: '/admin/events' },
            { name: 'Bài viết truyền thông', icon: Share2, path: '/admin/posts' },
            { name: 'Quản lý mẫu', icon: Layout, path: '/admin/templates' },
            { name: 'Quản lý khoa', icon: GraduationCap, path: '/admin/departments' },
            { name: 'Thông báo', icon: Bell, path: '/admin/notifications' },
            { name: 'Hồ sơ cá nhân', icon: UserCircle, path: '/admin/profile' },
        ],
        LECTURER: [
            { name: 'Bảng điều khiển', icon: LayoutDashboard, path: '/lecturer/dashboard' },
            { name: 'Đề xuất kế hoạch', icon: ClipboardList, path: '/lecturer/plans' },
            { name: 'Sự kiện của tôi', icon: Calendar, path: '/lecturer/events' },
            { name: 'Bài viết của tôi', icon: FileText, path: '/lecturer/posts' },
            { name: 'Mẫu sự kiện', icon: Layout, path: '/lecturer/templates' },
            { name: 'Vòng quay may mắn', icon: RotateCw, path: '/lecturer/spinner' },
            { name: 'Thông báo', icon: Bell, path: '/lecturer/notifications' },
            { name: 'Hồ sơ cá nhân', icon: UserCircle, path: '/lecturer/profile' },
        ],
        STUDENT: [
            { name: 'Tổng quan', icon: LayoutDashboard, path: '/student/dashboard' },
            { name: 'Sự kiện tham gia', icon: Calendar, path: '/student/events' },
            { name: 'Kế hoạch CLB', icon: ClipboardList, path: '/student/plans' },
            { name: 'Bài viết quan tâm', icon: Share2, path: '/student/posts' },
            { name: 'Thông báo', icon: Bell, path: '/student/notifications' },
            { name: 'Hồ sơ cá nhân', icon: UserCircle, path: '/student/profile' },
        ]
    };

    const menuItems = menuConfigs[role] || [];

    return (
        <aside
            className={`
        relative bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col shadow-sm z-30
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}
        >
            {/* Toggle Button - Nâng cấp để sắc nét hơn */}
            <button
                onClick={onToggle}
                className="absolute -right-4 top-8 w-8 h-8 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-400 shadow-lg hover:shadow-indigo-100 transition-all z-50 cursor-pointer group/toggle"
            >
                {isCollapsed ? (
                    <ChevronRight size={16} strokeWidth={3} className="transition-transform group-hover/toggle:scale-110" />
                ) : (
                    <ChevronLeft size={16} strokeWidth={3} className="transition-transform group-hover/toggle:scale-110" />
                )}
            </button>

            {/* Header / Logo */}
            <div className={`p-8 pb-4 transition-all duration-300 ${isCollapsed ? 'px-4' : 'px-8'}`}>
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
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Menu chính</span>
                </div>
            )}

            {/* Navigation */}
            <nav className={`flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar mt-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
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

                                    {/* Tooltip for collapsed state */}
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

            {/* Footer / Return Home */}
            <div className={`p-4 border-t border-slate-100 mt-auto bg-slate-50/50 ${isCollapsed ? 'px-2' : 'px-4'}`}>
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
                        {!isCollapsed && <span>Trang chủ chính</span>}

                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                                Trang chủ
                            </div>
                        )}
                    </div>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;