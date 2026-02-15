import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Share2, FileText,
  ClipboardList, Layout, GraduationCap, ShieldCheck,
  UserCog, Library, RotateCw
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard',          icon: LayoutDashboard, path: '/admin' },
    { name: 'Quản lý sự kiện',     icon: Calendar,       path: '/admin/events' },
    { name: 'Quản lý bài truyền thông', icon: Share2,     path: '/admin/media' },
    { name: 'Quản lý bài tổng kết', icon: FileText,      path: '/admin/summaries' },
    { name: 'Quản lý kế hoạch',    icon: ClipboardList,  path: '/admin/plans' },
    { name: 'Quản lý mẫu kế hoạch', icon: Layout,        path: '/admin/templates' },
    { name: 'Quản lý khoa',        icon: GraduationCap,  path: '/admin/departments' },
    { name: 'Quản lý vai trò',     icon: ShieldCheck,    path: '/admin/roles' },
    { name: 'Quản lý tài khoản',   icon: UserCog,        path: '/admin/accounts' },
    { name: 'Quản lý thư viện',    icon: Library,        path: '/admin/library' },
    { name: 'Quản lý vòng quay',   icon: RotateCw,       path: '/admin/spinner' },
  ];

  return (
    <aside 
      className="
        w-72 bg-linear-to-b from-white to-slate-50/50 
        border-r border-slate-200/70 
        h-screen sticky top-0 flex flex-col 
        shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_8px_-2px_rgba(0,0,0,0.04)]
        backdrop-blur-[1px] z-20
      "
    >
      {/* Header / Logo */}
      <div className="p-6 pb-4 flex justify-center items-center border-b border-slate-100/80">
        <img
          src="/src/assets/images/logo_iuh.png"
          alt="IUH Logo"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Section Label */}
      <div className="px-6 pt-6 pb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">
          Bảng điều khiển
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              // THÊM: outline-none ở đây để bỏ viền đen khi click trên một số trình duyệt
              className="outline-none block" 
            >
              {({ isActive }) => (
                <div
                  className={`
                    group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-250 ease-out
                    outline-none select-none
                    ${isActive
                      ? 'bg-linear-to-r from-blue-600/10 to-indigo-500/10 text-blue-700 font-semibold shadow-inner border border-blue-200/40'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-800 hover:shadow-sm'
                    }
                  `}
                >
                  {/* Icon wrapper */}
                  <div
                    className={`
                      flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-md scale-105'
                        : 'bg-slate-100/80 text-slate-500 group-hover:bg-slate-200/90 group-hover:text-slate-700'
                      }
                    `}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  </div>

                  <span className="truncate">{item.name}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-sm" />
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 pt-4 border-t border-slate-200/60 mt-auto bg-linear-to-t from-slate-50/80 to-transparent">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-sm border border-slate-200/50">
          <p className="text-xs font-semibold text-slate-700">© 2026 EMS System</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            Super Admin • Version 2.1
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;